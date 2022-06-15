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
  FilteredGraphWrapper,
  GraphComponent,
  IEdge,
  IGraph,
  IHandleProvider,
  IInputModeContext,
  ILookup,
  INode,
  IPoint,
  IPositionHandler,
  List,
  Point,
  Rect
} from 'yfiles'

import MindmapLayout from './MindmapLayout.js'
import { Structure } from './MindmapUtil.js'

/**
 * A position handler that moves a node and its subtree.
 *
 * The subtree is mirrored vertically if the moved node crosses
 * the center of the root node. This is done by calculating an
 * automatic layout of the moved subgraph.
 *
 * While moving the node, the nearest subtree parent candidate is determined.
 * If the parent candidate of the subtree root changes, the edge to the old
 * parent is removed and an edge is inserted from the new parent candidate
 * to the moved node.
 */
export class SubtreePositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates the SubtreePositionHandler.
   * @param {IPositionHandler} handler The given position handler.
   */
  constructor(handler) {
    super()
    this.handler = handler
    this.lastLocation = new Point(0, 0)
    this.rootNodeCenter = new Point(0, 0)
  }

  /**
   * Returns the maximum allowed distance for a parent candidate
   * @return {number}
   */
  static get MAX_DISTANCE() {
    return 300
  }

  /**
   * Returns a view of the location of the item.
   * @see Specified by {@link IDragHandler#location}.
   * @type {IPoint}
   */
  get location() {
    return this.handler.location
  }

  /**
   * Called when the drag starts.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from.
   */
  initializeDrag(inputModeContext) {
    const fullGraph = SubtreePositionHandler.getFullGraph(inputModeContext)
    this.handler.initializeDrag(inputModeContext)
    this.lastLocation = new Point(this.location.x, this.location.y)

    // get the selected node
    this.movedNode = inputModeContext.canvasComponent.selection.selectedNodes.first()
    // get the mindmap root node
    this.globalRoot = Structure.getRoot(fullGraph)
    this.rootNodeCenter = this.globalRoot.layout.center

    this.subtreeNodes = new List()
    this.subtreeEdges = new List()

    // get subtree nodes
    Structure.getSubtree(fullGraph, this.movedNode, this.subtreeNodes, this.subtreeEdges)
    // get incoming edge of moved node
    const inEdge = Structure.getInEdge(this.movedNode, fullGraph)
    // store data at drag start
    if (inEdge) {
      this.originalParent = inEdge.sourceNode
      this.originalIsLeft = Structure.isLeft(this.movedNode)
      this.oldParent = this.originalParent
    }
  }

  /**
   * Handles the move during the dragging.
   * @param {IInputModeContext} inputModeContext The context in which the interactive drag is started.
   * @param {Point} originalLocation The location at the time of initializeDrag.
   * @param {Point} newLocation The new location.
   * @return {boolean}
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    if (newLocation.equals(this.lastLocation)) {
      return false
    }
    const delta = newLocation.subtract(this.lastLocation)
    this.lastLocation = newLocation

    // use unfiltered graph for all subsequent operations
    const graph = SubtreePositionHandler.getFullGraph(inputModeContext)

    // check if location is left of root node center
    const isLeft = newLocation.x + this.movedNode.layout.width * 0.5 < this.rootNodeCenter.x

    this.mirrorSubtree(isLeft, graph)
    this.moveSubtree(delta, graph)
    const newParent = this.computeClosestNode(isLeft, graph)

    // parent node has changed
    if (newParent !== this.oldParent) {
      this.updateInEdge(newParent, graph)
      this.oldParent = newParent
    }
    return true
  }

  /**
   * Cancels the dragging.
   * @param {IInputModeContext} inputModeContext The context in which the interactive drag is started.
   * @param {Point} originalLocation The location at the time of initializeDrag.
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.handler.cancelDrag(inputModeContext, originalLocation)
    this.lastLocation = originalLocation

    // use unfiltered graph for subsequent operations
    const graph = SubtreePositionHandler.getFullGraph(inputModeContext)
    this.mirrorSubtree(this.originalIsLeft, graph)

    const isLeft = this.location.x + this.movedNode.layout.width * 0.5 < this.rootNodeCenter.x
    const newParent = this.computeClosestNode(isLeft, graph)
    // create edge between subtree and original parent
    if (newParent !== this.oldParent) {
      this.updateInEdge(this.originalParent, graph)
    }

    // re-layout the tree
    inputModeContext.canvasComponent.selection.clear()
    MindmapLayout.instance.layout(inputModeContext.canvasComponent)

    this.originalParent = null
  }

  /**
   * Called when the drag has finished.
   * @param {IInputModeContext} inputModeContext The context in which the interactive drag is started.
   * @param {Point} originalLocation The location at the time of initializeDrag.
   * @param {Point} newLocation The new location.
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.handler.dragFinished(inputModeContext, originalLocation, newLocation)
  }

  /**
   * Sets the handler's position.
   * @param {Point} location The location to be set.
   */
  setPosition(location) {
    this.handler.setPosition(location)
  }

  /**
   * Mirrors the subtree of the moved node.
   * @param {boolean} isLeft True if the node is on the left of the subtree, false otherwise.
   * @param {IGraph} graph The input graph.
   */
  mirrorSubtree(isLeft, graph) {
    if (Structure.isLeft(this.movedNode) !== isLeft) {
      // set isLeft state
      this.subtreeNodes.forEach(n => {
        n.tag.isLeft = !Structure.isLeft(n)
      })
      // calculate an automatic layout
      MindmapLayout.instance.layoutSubtree(graph, this.movedNode)
    }
  }

  /**
   * Moves the subtree by a given delta.
   * @param {Point} delta The distance to be moved.
   * @param {IGraph} graph The input graph.
   */
  moveSubtree(delta, graph) {
    // move all subtree nodes
    this.subtreeNodes.forEach(
      /** INode */ n => {
        graph.setNodeLayout(
          n,
          new Rect(n.layout.x + delta.x, n.layout.y + delta.y, n.layout.width, n.layout.height)
        )
      }
    )
    // move all bends of subtree edges
    this.subtreeEdges.forEach(
      /** IEdge */ e => {
        e.bends.forEach(bend => {
          graph.setBendLocation(
            bend,
            new Point(bend.location.x + delta.x, bend.location.y + delta.y)
          )
        })
      }
    )
  }

  /**
   * Removes the old incoming edge and create a new edge from the new parent to the moved node.
   * @param {INode} newParent The new parent of the node.
   * @param {IGraph} graph The input graph.
   * @return {IEdge} The edge created.
   */
  updateInEdge(newParent, graph) {
    if (graph.inDegree(this.movedNode) > 0) {
      // remove old edge
      const removedEdge = Structure.getInEdge(this.movedNode, graph)
      if (removedEdge !== null) {
        graph.remove(removedEdge)
      }
    }

    if (newParent !== null) {
      // create edge between subtree and new parent
      const edge = graph.createEdge(newParent, this.movedNode)
      const newList = new List()
      newList.add(edge)
      MindmapLayout.instance.adjustPortLocations(graph, newList)
      return edge
    }
    return null
  }

  /**
   * Computes the nearest parent candidate for the moved node.
   * Returns null if the distance to the found candidate exceeds
   * the {@link SubtreePositionHandler#MAX_DISTANCE limit}.
   * @param {boolean} isLeft True if the node is on the left of the subtree, false otherwise.
   * @param {IGraph} graph The input graph.
   * @return {INode} The parent candidate, or null.
   */
  computeClosestNode(isLeft, graph) {
    let /** @type {Point} */ p
    let d = Number.POSITIVE_INFINITY
    let dMin = Number.POSITIVE_INFINITY
    let /** @type {INode} */ newParent = null
    graph.nodes.forEach(n => {
      if (!this.subtreeNodes.includes(n)) {
        let /** @type {Point} */ q

        if (isLeft) {
          q = this.movedNode.layout.bottomRight
          if (Structure.isRoot(n)) {
            p = n.layout.center
            d = p.distanceTo(q)
          } else {
            p = n.layout.bottomLeft
            if (p.x > q.x && p.x <= this.rootNodeCenter.x) {
              d = p.distanceTo(q)
            }
          }
        } else {
          q = this.movedNode.layout.bottomLeft
          if (Structure.isRoot(n)) {
            p = n.layout.center
            d = p.distanceTo(q)
          } else {
            p = n.layout.bottomRight
            if (p.x < q.x && p.x >= this.rootNodeCenter.x) {
              d = p.distanceTo(q)
            }
          }
        }

        if (d < dMin) {
          dMin = d
          newParent = n
        }
      }
    })
    if (newParent === null) {
      newParent = this.globalRoot
    }
    return dMin < SubtreePositionHandler.MAX_DISTANCE ? newParent : null
  }

  /**
   * Returns a list of the bend locations of the given edge.
   * @param {IEdge} edge The given edge.
   * @return {List.<Point>}
   */
  getBendLocations(edge) {
    const points = new List()
    edge.bends.forEach(bend => {
      points.add(bend.location.toPoint())
    })
    return points
  }

  /**
   * Gets the full graph from the context.
   * @param {IInputModeContext} inputModeContext The given context.
   * @return {IGraph}
   */
  static getFullGraph(inputModeContext) {
    let graph = null
    if (inputModeContext.canvasComponent instanceof GraphComponent) {
      graph = inputModeContext.canvasComponent.graph
      if (graph instanceof FilteredGraphWrapper) {
        graph = graph.wrappedGraph
      }
    }
    return graph
  }
}

/**
 * This class provides style-handles for cross-reference-edges.
 * All other handle types (move, ...) are not provided and thus disabled.
 */
export class ArcEdgeHandleProvider extends BaseClass(IHandleProvider) {
  /**
   * @param {IEdge} edge
   */
  constructor(edge) {
    super()
    this.edge = edge
  }

  /**
   * @param {IInputModeContext} inputModeContext
   * @return {ICollection.<IHandle>}
   */
  getHandles(inputModeContext) {
    if (ILookup.isInstance(this.edge.style.renderer)) {
      const styleHandleProvider = this.edge.style.renderer.lookup(IHandleProvider.$class)
      if (styleHandleProvider !== null) {
        return styleHandleProvider.getHandles(inputModeContext)
      }
    }
    return new List()
  }
}
