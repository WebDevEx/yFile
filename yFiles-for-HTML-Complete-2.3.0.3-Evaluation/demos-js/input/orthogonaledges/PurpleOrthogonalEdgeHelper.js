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
import { IEdge, IGraph, IInputModeContext, IShapeGeometry, OrthogonalEdgeHelper } from 'yfiles'

/**
 * An {@link OrthogonalEdgeHelper} that enables moving the
 * source/target of the edge to another port, removes bends inside the bounds
 * of the node and relocates the port to the last bend inside the node.
 */
export default class PurpleOrthogonalEdgeHelper extends OrthogonalEdgeHelper {
  /**
   * Enables moving the source and target of the edge to other ports.
   * @param {IInputModeContext} inputModeContext The input mode context in which the segment is edited
   * @param {IEdge} edge The edge to inspect
   * @param {boolean} sourceEnd <code>True</code> if the source end of the edge is queried, <code>false</code> for
   * the target end
   * @see Overrides {@link OrthogonalEdgeHelper#shouldMoveEndImplicitly}
   * @see Specified by {@link IOrthogonalEdgeHelper#shouldMoveEndImplicitly}.
   * @return {boolean}
   */
  shouldMoveEndImplicitly(inputModeContext, edge, sourceEnd) {
    return true
  }

  /**
   * Removes bends inside of nodes, in addition to the clean-ups provided by
   * the base implementation.
   * @param {IInputModeContext} inputModeContext  The input mode context which edited the edge
   * @param {IGraph} graph The graph to use for modifying the edge instance
   * @param {IEdge} edge  The edge to clean up the path
   * @see Overrides {@link OrthogonalEdgeHelper#cleanUpEdge}
   * @see Specified by {@link IOrthogonalEdgeHelper#cleanUpEdge}.
   */
  cleanUpEdge(inputModeContext, graph, edge) {
    super.cleanUpEdge(inputModeContext, graph, edge)
    // now check bends which lie inside the node bounds and remove them...
    const sourceNode = edge.sourceNode
    if (sourceNode !== null) {
      const sourceContainsTest = sourceNode.lookup(IShapeGeometry.$class)
      while (
        edge.bends.size > 0 &&
        sourceContainsTest.isInside(edge.bends.first().location.toPoint())
      ) {
        const bendLocation = edge.bends.first().location.toPoint()
        // we try to move to port to the bend location so that the edge shape stays the same
        graph.setPortLocation(edge.sourcePort, bendLocation)
        if (!edge.sourcePort.location.toPoint().equals(bendLocation)) {
          break // does not work - bail out
        }
        graph.remove(edge.bends.first())
      }
    }
    const targetNode = edge.targetNode
    if (targetNode !== null) {
      const targetContainsTest = targetNode.lookup(IShapeGeometry.$class)
      while (
        edge.bends.size > 0 &&
        targetContainsTest.isInside(edge.bends.get(edge.bends.size - 1).location.toPoint())
      ) {
        const lastBend = edge.bends.get(edge.bends.size - 1)
        const bendLocation = lastBend.location.toPoint()
        // we try to move to port to the bend location so that the edge shape stays the same
        graph.setPortLocation(edge.targetPort, bendLocation)
        if (!edge.targetPort.location.toPoint().equals(bendLocation)) {
          break // does not work - bail out
        }
        graph.remove(lastBend)
      }
    }
  }
}
