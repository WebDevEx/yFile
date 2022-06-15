/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.0.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  ICanvasContext,
  IHitTestable,
  IInputModeContext,
  INode,
  INodeStyle,
  IMarqueeTestable,
  IRenderContext,
  NodeStyleBase,
  Point,
  Rect,
  ShapeNodeStyle,
  SvgVisual,
  SvgVisualGroup,
  Visual
} from 'yfiles'

/**
 * This node style decorator adds a circle with a native click listener representing a button.
 *
 * Checks like {@link IHitTestable#isHit} or {@link IMarqueeTestable#isInBox} are
 * simply delegated to the base style because the button is placed inside the node layout.
 */
export default class NodeStyleDecorator extends NodeStyleBase {
  /**
   * Initializes a new instance of this class.
   * @param {!INodeStyle} baseStyle The optional base style.
   */
  constructor(baseStyle) {
    super()
    this.baseStyle = baseStyle || new ShapeNodeStyle()
  }

  /**
   * Creates a new visual as combination of the base node visualization and the decoration.
   * @param {!IRenderContext} context The render context.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!SvgVisual} The created visual.
   * @see NodeStyleBase#createVisual
   */
  createVisual(context, node) {
    const layout = node.layout.toRect()

    // create the base visualization
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .createVisual(context)

    // create the decoration
    const button = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse')
    button.setAttribute('cx', `${layout.center.x}`)
    button.setAttribute('cy', `${layout.center.y}`)
    button.setAttribute('rx', '7')
    button.setAttribute('ry', '7')
    button.setAttribute('class', 'button')

    // register a native click listener on the SVG element
    button.addEventListener('click', showToast)
    // the input mode should not handle any event on the the button where we registered a native click listener
    button.addEventListener('mousedown', e => e.preventDefault())

    const decorationVisual = new SvgVisual(button)

    // add both to a group
    const group = new SvgVisualGroup()
    group.add(baseVisual)
    group.add(decorationVisual)
    group['render-data-cache'] = {
      cx: layout.center.x,
      cy: layout.center.y
    }

    return group
  }

  /**
   * Updates the provided visual.
   * @param {!IRenderContext} context The render context.
   * @param {!Visual} oldVisual The visual that has been created in the call to
   *        {@link NodeStyleBase#createVisual}.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {!Visual} The updated visual.
   * @see NodeStyleBase#updateVisual
   */
  updateVisual(context, oldVisual, node) {
    const layout = node.layout.toRect()

    // check whether the elements are as expected
    const children = oldVisual.children
    if (children.size !== 2) {
      return this.createVisual(context, node)
    }

    // update the base visual
    const baseVisual = this.baseStyle.renderer
      .getVisualCreator(node, this.baseStyle)
      .updateVisual(context, children.get(0))
    // check whether the updateVisual method created a new element and replace the old one if needed
    if (baseVisual !== children.get(0)) {
      children.set(0, baseVisual)
    }

    // update the decoration visual
    const cache = oldVisual['render-data-cache']
    const center = layout.center
    if (cache.cx !== center.x || cache.cy !== center.y) {
      const decorationVisual = children.get(1)
      const button = decorationVisual.svgElement
      button.setAttribute('cx', `${center.x}`)
      button.setAttribute('cy', `${center.y}`)

      // store the button location in the render data cache
      oldVisual['render-data-cache'] = {
        cx: center.x,
        cy: center.y
      }
    }

    return oldVisual
  }

  /**
   * Returns whether at least one of the base visualization and the decoration is visible.
   * @param {!ICanvasContext} context The canvas context.
   * @param {!Rect} rectangle The clipping rectangle.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {boolean} <code>true</code> if either the base visualization or the decoration is visible.
   * @see NodeStyleBase#isVisible
   */
  isVisible(context, rectangle, node) {
    return this.baseStyle.renderer
      .getVisibilityTestable(node, this.baseStyle)
      .isVisible(context, rectangle)
  }

  /**
   * Returns whether the base visualization is hit.
   * @param {!IInputModeContext} context The context.
   * @param {!Point} location The point to test.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {boolean} <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isHit
   */
  isHit(context, location, node) {
    return this.baseStyle.renderer.getHitTestable(node, this.baseStyle).isHit(context, location)
  }

  /**
   * Returns whether the base visualization is in the box, we don't want the decoration to be marquee selectable.
   * @param {!IInputModeContext} context The input mode context.
   * @param {!Rect} rectangle The marquee selection box.
   * @param {!INode} node The node to which this style instance is assigned.
   * @returns {boolean} <code>true</code> if the base visualization is hit.
   * @see NodeStyleBase#isInBox
   */
  isInBox(context, rectangle, node) {
    return this.baseStyle.renderer
      .getMarqueeTestable(node, this.baseStyle)
      .isInBox(context, rectangle)
  }

  /**
   * Gets the intersection of a line with the visual representation of the node.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!Point} inner The coordinates of a point lying
   *   {@link NodeStyleBase#isInside inside} the shape.
   * @param {!Point} outer The coordinates of a point lying outside the shape.
   * @returns {?Point} The intersection point if one has been found or <code>null</code>, otherwise.
   * @see NodeStyleBase#getIntersection
   */
  getIntersection(node, inner, outer) {
    return this.baseStyle.renderer
      .getShapeGeometry(node, this.baseStyle)
      .getIntersection(inner, outer)
  }

  /**
   * Returns whether the provided point is inside of the base visualization.
   * @param {!INode} node The node to which this style instance is assigned.
   * @param {!Point} location The point to test.
   * @returns {boolean} <code>true</code> if the provided location is inside of the base visualization.
   * @see NodeStyleBase#isInside
   */
  isInside(node, location) {
    return this.baseStyle.renderer.getShapeGeometry(node, this.baseStyle).isInside(location)
  }
}

/** @type {*} */
let hideTimer = null
function showToast() {
  // Shows a toast to indicate the successful click, and hides it again.
  clearTimeout(hideTimer)
  const toast = document.getElementById('toast')
  toast.style.bottom = '40px'
  hideTimer = setTimeout(() => {
    toast.style.bottom = '-50px'
  }, 2000)
}
