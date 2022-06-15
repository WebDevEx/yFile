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
  BaseClass,
  DefaultPortCandidate,
  IEdge,
  IEdgeReconnectionPortCandidateProvider,
  IInputModeContext,
  IListEnumerable,
  List
} from 'yfiles'

/**
 * An {@link IEdgeReconnectionPortCandidateProvider} that uses candidates with a
 * dynamic NodeScaled port location model. It allows moving ports to any
 * location inside a green node.
 */
export default class RedEdgePortCandidateProvider extends BaseClass(
  IEdgeReconnectionPortCandidateProvider
) {
  /**
   * Creates a new instance of <code>OrangeEdgePortCandidateProvider</code>.
   * @param {IEdge} edge The given edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * Returns only the current port as candidate, thus effectively disabling relocation.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getSourcePortCandidates}.
   * @return {IEnumerable.<IPortCandidate>}
   */
  getSourcePortCandidates(context) {
    const candidates = new List()
    candidates.add(new DefaultPortCandidate(this.edge.sourcePort))
    return candidates
  }

  /**
   * Returns no candidates, thus effectively disabling relocation.
   * @param {IInputModeContext} context The context for which the candidates should be provided
   * @see Specified by {@link IEdgeReconnectionPortCandidateProvider#getTargetPortCandidates}.
   * @return {IEnumerable.<IPortCandidate>}
   */
  getTargetPortCandidates(context) {
    return IListEnumerable.EMPTY
  }
}
