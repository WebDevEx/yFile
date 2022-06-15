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
import { INode, IRenderContext, NodeStyleBase, SvgVisual } from 'yfiles'

/**
 * A simple node style that renders the person's image and possibly an indicator if there are
 * unrevealed friends.
 */
export class SocialNetworkNodeStyle extends NodeStyleBase {
  /**
   * Creates the node visual.
   * @param {IRenderContext} context The render context
   * @param {INode} node The node to which this style instance is assigned
   * @return {SvgVisual} The new visual
   */
  createVisual(context, node) {
    const person = node.tag
    const layout = node.layout

    const container = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    // create an image for the person
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image.setAttribute('href', `./resources/${person.icon}.svg`)
    image.setAttribute('width', layout.width)
    image.setAttribute('height', layout.height)
    container.appendChild(image)

    // maybe add an indicator for unrevealed friends
    if (person.friends.length < person.friendsCount) {
      const iconColor = 'lightgray'
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      icon.setAttribute('transform', `translate(${layout.width - 8} 8)`)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('fill', 'white')
      circle.setAttribute('stroke', iconColor)
      circle.setAttribute('stroke-width', '2')
      circle.setAttribute('r', '10px')

      const bgCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      bgCircle.setAttribute('fill', 'white')
      bgCircle.setAttribute('r', '13px')

      const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot1.setAttribute('fill', iconColor)
      dot1.setAttribute('r', '2px')

      const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot2.setAttribute('fill', iconColor)
      dot2.setAttribute('r', '2px')
      dot2.setAttribute('cx', '-6px')

      const dot3 = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      dot3.setAttribute('fill', iconColor)
      dot3.setAttribute('r', '2px')
      dot3.setAttribute('cx', '6px')

      icon.appendChild(bgCircle)
      icon.appendChild(circle)
      icon.appendChild(dot1)
      icon.appendChild(dot2)
      icon.appendChild(dot3)

      container.appendChild(icon)
    }

    // set the location
    SvgVisual.setTranslate(container, layout.x, layout.y)

    return new SvgVisual(container)
  }

  /**
   * Update's the node visual.
   * @param {IRenderContext} context The render context
   * @param {SvgVisual} oldVisual The previously rendered visual
   * @param {INode} node The node to which this style instance is assigned
   * @return {SvgVisual} The updated visual
   */
  updateVisual(context, oldVisual, node) {
    const person = node.tag
    const layout = node.layout
    const svgElement = oldVisual.svgElement

    // update the location
    SvgVisual.setTranslate(svgElement, layout.x, layout.y)

    if (svgElement.childNodes.length === 2 && person.friends.length === person.friendsCount) {
      // remove the "+" sign
      svgElement.removeChild(svgElement.lastElementChild)
    }

    return oldVisual
  }
}
