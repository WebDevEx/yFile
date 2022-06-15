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
import { IHandleProvider, BaseClass, IEdge, IInputModeContext, IEnumerable, IHandle } from 'yfiles'

/**
 * Custom implementation for bezier edges that always shows all handles for the control points
 * This makes it possible to start manipulating the control points immediately without having to
 * select them first (which is nearly impossible for points not lying on the curve)
 */
export class BezierEdgeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * @param {!IEdge} edge
   * @param {!IHandleProvider} coreImpl
   */
  constructor(edge, coreImpl) {
    super()
    this.edge = edge
    this.coreImpl = coreImpl
  }

  /**
   * @param {!IInputModeContext} context
   * @returns {!IEnumerable.<IHandle>}
   */
  getHandles(context) {
    return this.coreImpl
      .getHandles(context)
      .concat(this.edge.bends.map(b => b.lookup(IHandle.$class)))
      .toList()
  }
}
