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
import { BaseClass, IRenderContext, IVisualCreator, Point, SvgVisual, Visual } from 'yfiles'

/**
 * This class renders a rectangle that represents the page.
 */
export default class PageBoundsVisualCreator extends BaseClass(IVisualCreator) {
  constructor() {
    super()
    /**
     * Specifies the width of the page.
     */
    this.pageWidth = 0
    /**
     * Specifies the height of the page.
     */
    this.pageHeight = 0
    /**
     * Specifies the center of the page.
     */
    this.center = Point.ORIGIN
  }

  /**
   * Creates a visual for a rectangular page.
   * @param {IRenderContext} context
   * @return {Visual}
   * @see Overrides {@link IVisualCreator#createVisual}.
   */
  createVisual(context) {
    const rectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rectangle.setAttribute('stroke', 'darkgray')
    rectangle.setAttribute('stroke-width', '1')
    rectangle.setAttribute('stroke-dasharray', '5')
    rectangle.setAttribute('stroke-linecap', 'square')
    rectangle.setAttribute('fill', 'white')

    return this.updateVisual(context, new SvgVisual(rectangle))
  }

  /**
   * Updates the size of the visual for a rectangular page.
   * @param {IRenderContext} context
   * @param {Visual} oldVisual
   * @return {Visual}
   * @see Overrides {@link IVisualCreator#updateVisual}.
   */
  updateVisual(context, oldVisual) {
    if (this.pageWidth === 0 || this.pageHeight === 0) {
      return null
    }

    const rectangle = oldVisual.svgElement
    // update the size of the page
    const width = this.pageWidth + MARGIN
    const height = this.pageHeight + MARGIN

    rectangle.setAttribute('x', '0')
    rectangle.setAttribute('y', '0')
    rectangle.setAttribute('width', width)
    rectangle.setAttribute('height', height)

    // update the position of the page
    rectangle.setAttribute(
      'transform',
      `translate(${this.center.x - width * 0.5} ${this.center.y - height * 0.5})`
    )

    return oldVisual
  }
}

/**
 * A constant margin for the page so the graph does not touch the frame.
 * @type {number}
 */
const MARGIN = 15
