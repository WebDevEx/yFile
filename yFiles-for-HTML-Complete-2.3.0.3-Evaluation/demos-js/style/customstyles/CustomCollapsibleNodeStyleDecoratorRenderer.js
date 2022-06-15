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
  CollapsibleNodeStyleDecoratorRenderer,
  ImageNodeStyle,
  INodeInsetsProvider,
  Rect,
  SimpleNode,
  Size,
  SvgVisual
} from 'yfiles'

/**
 * Provides a customized visualization of the collapse/expand button of a
 * group node. This implementation delegates the actual rendering of each
 * state to a node style.
 */
export default class CustomCollapsibleNodeStyleDecoratorRenderer extends CollapsibleNodeStyleDecoratorRenderer {
  constructor(size) {
    super()

    // The size of the button.
    this.size = size
    // The node style used for the rendering of the expanded state.
    this.expandedButtonStyle = new ImageNodeStyle('resources/collapse.svg')
    // The node style used for the rendering of the collapsed state.
    this.collapsedButtonStyle = new ImageNodeStyle('resources/expand.svg')
    // A dumCustom node that is used internally for the rendering of the button. This is a class field
    // since we want to reuse the same instance for each call to
    // {@link CustomCollapsibleNodeStyleDecoratorRenderer#createButton} and
    // {@link CustomCollapsibleNodeStyleDecoratorRenderer#updateButton} (for performance reasons).
    this.dumCustomNode = new SimpleNode()
  }

  /** @return {SvgVisual} */
  createButton(context, expanded, size) {
    // Set the dumCustom node to the desired size
    this.dumCustomNode.layout = new Rect(0, 0, size.width, size.height)
    // Delegate the creation of the button visualization to the node styles
    const nodeStyle = expanded ? this.expandedButtonStyle : this.collapsedButtonStyle
    const visual = nodeStyle.renderer
      .getVisualCreator(this.dumCustomNode, nodeStyle)
      .createVisual(context)
    // Add the commands for user interaction
    CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(visual, this.node, context)
    return visual
  }

  /** @return {SvgVisual} */
  updateButton(context, expanded, size, oldVisual) {
    // Set the dumCustom node to the desired size
    this.dumCustomNode.layout = new Rect(0, 0, size.width, size.height)
    // Delegate the updating of the button visualization to the node styles
    const nodeStyle = expanded ? this.expandedButtonStyle : this.collapsedButtonStyle
    const visual = nodeStyle.renderer
      .getVisualCreator(this.dumCustomNode, nodeStyle)
      .updateVisual(context, oldVisual)
    if (visual !== oldVisual) {
      // Add the commands for user interaction is a new visual was created
      CollapsibleNodeStyleDecoratorRenderer.addToggleExpansionStateCommand(
        visual,
        this.node,
        context
      )
    }
    return visual
  }

  /** @return {Size} */
  getButtonSize() {
    return this.size
  }

  /**
   * This is implemented to override the base insets provider, which would add insets for the label.
   * @see Overrides {@link CollapsibleNodeStyleDecoratorRenderer#lookup}
   * @see Specified by {@link ILookup#lookup}.
   * @return {Object}
   */
  lookup(type) {
    if (type === INodeInsetsProvider.$class) {
      // Return the implementation of the wrapped style directly
      const wrappedStyle = this.getWrappedStyle()
      return wrappedStyle.renderer.getContext(this.node, wrappedStyle).lookup(type)
    }
    return super.lookup(type)
  }
}
