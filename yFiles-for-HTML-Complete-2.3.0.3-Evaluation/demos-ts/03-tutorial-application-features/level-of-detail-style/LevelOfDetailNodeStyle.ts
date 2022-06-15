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
/* eslint-disable @typescript-eslint/no-explicit-any */
import { INode, INodeStyle, IRenderContext, NodeStyleBase, SvgVisual, Visual } from 'yfiles'

export default class LevelOfDetailNodeStyle extends NodeStyleBase {
  detailThreshold: number
  intermediateThreshold: number
  detailNodeStyle: INodeStyle
  intermediateNodeStyle: INodeStyle
  overviewNodeStyle: INodeStyle

  /**
   * Creates a new instance of LevelOfDetailNodeStyle which combines three styles for different zoom level.
   */
  constructor(
    detailNodeStyle: INodeStyle,
    intermediateNodeStyle: INodeStyle,
    overviewNodeStyle: INodeStyle
  ) {
    super()
    this.detailThreshold = 0.7
    this.intermediateThreshold = 0.4
    this.detailNodeStyle = detailNodeStyle
    this.intermediateNodeStyle = intermediateNodeStyle
    this.overviewNodeStyle = overviewNodeStyle
  }

  createVisual(renderContext: IRenderContext, node: INode): SvgVisual {
    const zoom = renderContext.zoom
    let visual: SvgVisual
    if (zoom >= this.detailThreshold) {
      visual = this.detailNodeStyle.renderer
        .getVisualCreator(node, this.detailNodeStyle)
        .createVisual(renderContext) as SvgVisual
      ;(visual.svgElement as any)['data-levelsRenderDataCache'] = this.detailNodeStyle.renderer
    } else if (zoom >= this.intermediateThreshold) {
      visual = this.intermediateNodeStyle.renderer
        .getVisualCreator(node, this.intermediateNodeStyle)
        .createVisual(renderContext) as SvgVisual
      ;(visual.svgElement as any)[
        'data-levelsRenderDataCache'
      ] = this.intermediateNodeStyle.renderer
    } else {
      visual = this.overviewNodeStyle.renderer
        .getVisualCreator(node, this.overviewNodeStyle)
        .createVisual(renderContext) as SvgVisual
      ;(visual.svgElement as any)['data-levelsRenderDataCache'] = this.overviewNodeStyle.renderer
    }

    return visual
  }

  updateVisual(renderContext: IRenderContext, oldVisual: SvgVisual, node: INode): Visual {
    const zoom = renderContext.zoom
    // @ts-ignore
    let newVisual: SvgVisual = null

    if (oldVisual === null) {
      return this.createVisual(renderContext, node)
    }
    const cache = (oldVisual.svgElement as any)['data-levelsRenderDataCache']
    if (zoom >= this.detailThreshold && cache === this.detailNodeStyle.renderer) {
      newVisual = this.detailNodeStyle.renderer
        .getVisualCreator(node, this.detailNodeStyle)
        .updateVisual(renderContext, oldVisual) as SvgVisual
      ;(newVisual.svgElement as any)['data-levelsRenderDataCache'] = this.detailNodeStyle.renderer
      return newVisual
    } else if (
      zoom >= this.intermediateThreshold &&
      zoom <= this.detailThreshold &&
      cache === this.intermediateNodeStyle.renderer
    ) {
      newVisual = this.intermediateNodeStyle.renderer
        .getVisualCreator(node, this.intermediateNodeStyle)
        .updateVisual(renderContext, oldVisual) as SvgVisual
      ;(newVisual.svgElement as any)[
        'data-levelsRenderDataCache'
      ] = this.intermediateNodeStyle.renderer
      return newVisual
    } else if (zoom <= this.intermediateThreshold && cache === this.overviewNodeStyle.renderer) {
      newVisual = this.overviewNodeStyle.renderer
        .getVisualCreator(node, this.overviewNodeStyle)
        .updateVisual(renderContext, oldVisual) as SvgVisual
      ;(newVisual.svgElement as any)['data-levelsRenderDataCache'] = this.overviewNodeStyle.renderer
      return newVisual
    }
    return this.createVisual(renderContext, node)
  }
}
