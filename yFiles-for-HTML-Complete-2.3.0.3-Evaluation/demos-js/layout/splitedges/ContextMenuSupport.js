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
  Arrow,
  ArrowType,
  IEdge,
  INode,
  PolylineEdgeStyle,
  PopulateItemContextMenuEventArgs
} from 'yfiles'
import ContextMenu from '../../utils/ContextMenu.js'

export default class ContextMenuSupport {
  constructor(graphComponent, layoutCallback) {
    this.graphComponent = graphComponent
    this.runLayout = layoutCallback
  }

  createContextMenu() {
    const inputMode = this.graphComponent.inputMode
    const contextMenu = new ContextMenu(this.graphComponent)
    contextMenu.addOpeningEventListeners(this.graphComponent, location => {
      const worldLocation = this.graphComponent.toWorldFromPage(location)
      const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)
      if (showMenu) {
        contextMenu.show(location)
      }
    })
    inputMode.addPopulateItemContextMenuListener((sender, args) =>
      this.populateContextMenu(contextMenu, args)
    )
    inputMode.contextMenuInputMode.addCloseMenuListener(() => contextMenu.close())
    contextMenu.onClosedCallback = () => inputMode.contextMenuInputMode.menuClosed()
  }

  /**
   * Adds menu items to the context menu depending on what type of graph element was hit.
   * @param {object} contextMenu
   * @param {PopulateItemContextMenuEventArgs} args
   */
  populateContextMenu(contextMenu, args) {
    contextMenu.clearItems()

    this.updateSelection(args.item)
    const graph = this.graphComponent.graph
    if (IEdge.isInstance(args.item)) {
      const selectedEdges = this.graphComponent.selection.selectedEdges
      if (
        selectedEdges.size > 1 &&
        selectedEdges.some(
          edge1 =>
            selectedEdges.find(
              edge2 =>
                edge1 !== edge2 &&
                ((graph.isGroupNode(edge1.sourceNode) && edge1.sourceNode === edge2.targetNode) ||
                  (graph.isGroupNode(edge1.targetNode) &&
                    edge1.targetNode === edge2.sourceNode &&
                    graph.getParent(edge1.targetNode) !== graph.getParent(edge2.sourceNode)))
            ) !== null
        )
      ) {
        args.showMenu = true
        contextMenu.addMenuItem('Align Selected Edges', () =>
          this.alignSelectedEdges(selectedEdges.toArray())
        )
      }
      if (
        selectedEdges.some(edge => edge.tag && (edge.tag.sourceSplitId || edge.tag.targetSplitId))
      ) {
        args.showMenu = true
        contextMenu.addMenuItem('Unalign Selected Edges', () =>
          this.unalignSelectedEdges(selectedEdges.toArray())
        )
        contextMenu.addMenuItem('Join Inter-Edges', () =>
          this.joinInterEdgesAtGroups(selectedEdges.toArray())
        )
      }
      if (
        selectedEdges.some(
          edge =>
            graph.getParent(edge.sourceNode) !== graph.getParent(edge.targetNode) &&
            graph.getParent(edge.sourceNode) !== edge.targetNode &&
            graph.getParent(edge.targetNode) !== edge.sourceNode
        )
      ) {
        args.showMenu = true
        contextMenu.addMenuItem('Split Inter-Edges', () =>
          this.splitInterEdgesAtGroups(selectedEdges.toArray())
        )
      }
    } else if (INode.isInstance(args.item) && graph.isGroupNode(args.item)) {
      args.showMenu = true
      contextMenu.addMenuItem('Split Inter-Edges', () => this.splitInterEdgesAtGroup(args.item))
      contextMenu.addMenuItem('Join Inter-Edges', () => this.joinInterEdgesAtGroup(args.item))
    }
  }

  /**
   * Ads the same split ids to the given edges.
   * @param {Array.<IEdge>} edges
   */
  alignSelectedEdges(edges) {
    const graph = this.graphComponent.graph
    const splitId = Date.now() + Math.random() // unique id
    const color = getColor()
    edges.forEach(edge1 => {
      if (
        edges.find(
          edge2 =>
            graph.isGroupNode(edge1.sourceNode) &&
            edge1.sourceNode === edge2.targetNode &&
            graph.getParent(edge1.targetNode) !== graph.getParent(edge2.sourceNode)
        )
      ) {
        if (edge1.tag) {
          edge1.tag.sourceSplitId = splitId
        } else {
          edge1.tag = { sourceSplitId: splitId }
        }
        ContextMenuSupport.updateEdgeColor(edge1, color)
      }
      if (
        edges.find(
          edge2 =>
            graph.isGroupNode(edge1.targetNode) &&
            edge1.targetNode === edge2.sourceNode &&
            graph.getParent(edge1.sourceNode) !== graph.getParent(edge2.targetNode)
        )
      ) {
        if (edge1.tag) {
          edge1.tag.targetSplitId = splitId
        } else {
          edge1.tag = { targetSplitId: splitId }
        }
        ContextMenuSupport.updateEdgeColor(edge1, color)
      }
    })

    this.runLayout()
  }

  /**
   * Updates the color of th edge.
   * @param {IEdge} edge
   * @param {string} color
   */
  static updateEdgeColor(edge, color) {
    edge.style.stroke = `3px ${color}`
    edge.style.targetArrow = new Arrow({
      fill: color,
      type: ArrowType.TRIANGLE,
      scale: 1.5
    })
  }

  /**
   * Removes the edges split ids.
   * @param {Array.<IEdge>} edges
   */
  unalignSelectedEdges(edges) {
    const graph = this.graphComponent.graph

    // unalign predecessor and successor edges that have the same split id but there is no edge to align, anymore
    edges.forEach(edge => {
      if (graph.isGroupNode(edge.sourceNode)) {
        graph.inEdgesAt(edge.sourceNode).forEach(inEdge => {
          if (
            inEdge.tag &&
            edge.tag &&
            inEdge.tag.targetSplitId === edge.tag.sourceSplitId &&
            !graph
              .inEdgesAt(inEdge.sourceNode)
              .some(
                previousEdge =>
                  previousEdge.tag &&
                  previousEdge.tag.targetSplitId === previousEdge.tag.sourceSplitId
              )
          ) {
            inEdge.tag = null
            graph.setStyle(inEdge, this.graphComponent.graph.edgeDefaults.style.clone())
          }
        })
      }
      if (graph.isGroupNode(edge.targetNode)) {
        graph.outEdgesAt(edge.targetNode).forEach(outEdge => {
          if (
            outEdge.tag &&
            edge.tag &&
            outEdge.tag.sourceSplitId === edge.tag.targetSplitId &&
            !graph
              .outEdgesAt(outEdge.targetNode)
              .some(
                nextEdge =>
                  nextEdge.tag && nextEdge.tag.sourceSplitId === nextEdge.tag.targetSplitId
              )
          ) {
            outEdge.tag = null
            graph.setStyle(outEdge, this.graphComponent.graph.edgeDefaults.style.clone())
          }
        })
      }

      // unalign the edge
      edge.tag = null
      graph.setStyle(edge, this.graphComponent.graph.edgeDefaults.style.clone())
    })

    this.runLayout()
  }

  /**
   * Joins all edges with the same split id as the given edges.
   * @param {Array.<IEdge>} edges
   */
  joinInterEdgesAtGroups(edges) {
    const graph = this.graphComponent.graph

    const visited = []
    edges.forEach(edge => {
      if (visited.indexOf(edge) >= 0) {
        return
      }
      if (edge.tag && (edge.tag.sourceSplitId || edge.tag.targetSplitId)) {
        visited.push(edge)
        let sourceNode = edge.sourceNode
        let predecessor = graph
          .inEdgesAt(sourceNode)
          .firstOrDefault(
            inEdge =>
              inEdge.tag &&
              inEdge.tag.targetSplitId &&
              inEdge.tag.targetSplitId === edge.tag.sourceSplitId
          )
        while (predecessor) {
          if (visited.indexOf(predecessor) === -1) {
            visited.push(predecessor)
          }
          sourceNode = predecessor.sourceNode
          predecessor = graph
            .inEdgesAt(sourceNode)
            .firstOrDefault(
              inEdge =>
                inEdge.tag &&
                inEdge.tag.targetSplitId &&
                inEdge.tag.targetSplitId === edge.tag.sourceSplitId
            )
        }
        let targetNode = edge.targetNode
        let successor = graph
          .outEdgesAt(targetNode)
          .firstOrDefault(
            outEdge =>
              outEdge.tag &&
              outEdge.tag.sourceSplitId &&
              outEdge.tag.sourceSplitId === edge.tag.targetSplitId
          )
        while (successor) {
          if (visited.indexOf(successor) === -1) {
            visited.push(successor)
          }
          targetNode = successor.targetNode
          successor = graph
            .outEdgesAt(targetNode)
            .firstOrDefault(
              outEdge =>
                outEdge.tag &&
                outEdge.tag.sourceSplitId &&
                outEdge.tag.sourceSplitId === edge.tag.targetSplitId
            )
        }
        graph.createEdge(sourceNode, targetNode)
      }
    })
    visited.forEach(edge => {
      graph.remove(edge)
    })

    this.runLayout()
  }

  /**
   * Splits the inter-edges at all groups that they are crossing.
   * @param {Array.<IEdge>} interEdges
   */
  splitInterEdgesAtGroups(interEdges) {
    const graph = this.graphComponent.graph
    interEdges.forEach(edge => {
      const commonAncestor = graph.groupingSupport.getNearestCommonAncestor(
        edge.sourceNode,
        edge.targetNode
      )

      let splitId
      let color
      if (
        edge.tag &&
        (!(edge.tag.sourceSplitId && edge.tag.targetSplitId) ||
          edge.tag.sourceSplitId === edge.tag.targetSplitId)
      ) {
        color = edge.tag.color
        splitId = edge.tag.sourceSplitId || edge.tag.targetSplitId
      } else {
        color = getColor()
        splitId = Date.now() + Math.random() // unique id
      }
      let lastNode = edge.sourceNode
      let walkerGroup = graph.getParent(edge.sourceNode)
      while (walkerGroup !== commonAncestor && walkerGroup !== edge.targetNode) {
        const splitEdge = this.createSplitEdge(
          lastNode,
          walkerGroup,
          {
            sourceSplitId: splitId,
            targetSplitId: splitId
          },
          color
        )
        graph.setPortLocation(
          splitEdge.sourcePort,
          lastNode !== edge.sourceNode
            ? this.getIntersection(edge, lastNode)
            : edge.sourcePort.location.toPoint()
        )
        graph.setPortLocation(
          splitEdge.targetPort,
          walkerGroup !== edge.sourceNode
            ? this.getIntersection(edge, walkerGroup)
            : edge.targetPort.location.toPoint()
        )
        lastNode = walkerGroup
        walkerGroup = graph.getParent(lastNode)
      }
      const lastSourceNode = lastNode
      lastNode = edge.targetNode
      walkerGroup = graph.getParent(edge.targetNode)
      while (walkerGroup !== commonAncestor && walkerGroup !== edge.sourceNode) {
        const splitEdge = this.createSplitEdge(
          walkerGroup,
          lastNode,
          {
            sourceSplitId: splitId,
            targetSplitId: splitId
          },
          color
        )
        graph.setPortLocation(
          splitEdge.sourcePort,
          walkerGroup !== edge.targetNode
            ? this.getIntersection(edge, walkerGroup)
            : edge.sourcePort.location.toPoint()
        )
        graph.setPortLocation(
          splitEdge.targetPort,
          lastNode !== edge.targetNode
            ? this.getIntersection(edge, lastNode)
            : edge.targetPort.location.toPoint()
        )
        lastNode = walkerGroup
        walkerGroup = graph.getParent(lastNode)
      }
      const splitEdge = this.createSplitEdge(
        lastSourceNode,
        lastNode,
        {
          sourceSplitId: splitId,
          targetSplitId: splitId
        },
        color
      )
      graph.setPortLocation(
        splitEdge.sourcePort,
        lastSourceNode !== edge.sourceNode
          ? this.getIntersection(edge, lastSourceNode)
          : edge.sourcePort.location.toPoint()
      )
      graph.setPortLocation(
        splitEdge.targetPort,
        lastNode !== edge.targetNode
          ? this.getIntersection(edge, lastNode)
          : edge.targetPort.location.toPoint()
      )
      graph.remove(edge)
    })

    this.runLayout()
  }

  /**
   * Splits all inter-edges a the given group.
   * @param {INode} group
   */
  splitInterEdgesAtGroup(group) {
    const graph = this.graphComponent.graph
    const descendants = graph.groupingSupport.getDescendants(group)
    const interEdges = []
    descendants.forEach(node => {
      graph
        .edgesAt(node)
        .filter(
          edge =>
            edge.sourceNode !== group &&
            edge.targetNode !== group &&
            graph.getParent(edge.sourceNode) !== graph.getParent(edge.targetNode) &&
            (!descendants.includes(edge.sourceNode) || !descendants.includes(edge.targetNode))
        )
        .forEach(edge => interEdges.push(edge))
    })

    interEdges.forEach(edge => {
      let splitId
      let color
      if (
        edge.tag &&
        (!(edge.tag.sourceSplitId && edge.tag.targetSplitId) ||
          edge.tag.sourceSplitId === edge.tag.targetSplitId)
      ) {
        color = edge.tag.color
        splitId = edge.tag.sourceSplitId || edge.tag.targetSplitId
      } else {
        color = getColor()
        splitId = Date.now() + Math.random() // unique id
      }
      const intersection = this.getIntersection(edge, group)
      const sourceEdge = this.createSplitEdge(
        edge.sourceNode,
        group,
        {
          sourceSplitId: splitId,
          targetSplitId: splitId
        },
        color
      )
      graph.setPortLocation(sourceEdge.targetPort, intersection)
      const targetEdge = this.createSplitEdge(
        group,
        edge.targetNode,
        {
          sourceSplitId: splitId,
          targetSplitId: splitId
        },
        color
      )
      graph.setPortLocation(targetEdge.sourcePort, intersection)
      graph.remove(edge)
    })

    this.runLayout()
  }

  /**
   * Finds the intersection point of the given edge and group. This is used for placing the edge ports for a smoother
   * animation when edges are split.
   * @param {IEdge} edge
   * @param {INode} group
   * @return {Point}
   */
  getIntersection(edge, group) {
    const groupingSupport = this.graphComponent.graph.groupingSupport
    let inner = groupingSupport.isDescendant(edge.sourceNode, group)
      ? edge.sourcePort
      : edge.targetPort
    let outer = groupingSupport.isDescendant(edge.sourceNode, group)
      ? edge.targetPort
      : edge.sourcePort

    // find the intersecting segment of the edge
    let foundInner = false
    let lastBend = inner
    edge.bends.forEach(bend => {
      if (!foundInner) {
        if (!group.layout.toRect().contains(bend.location.toPoint())) {
          foundInner = true
          outer = bend
        }
        inner = lastBend
      }
      lastBend = bend
    })

    // find the intersection point
    return group.layout
      .toRect()
      .findLineIntersection(inner.location.toPoint(), outer.location.toPoint())
  }

  /**
   * Joins all edges with the same split ids that connect to the given group from outside and inside of the group.
   * @param {INode} group
   */
  joinInterEdgesAtGroup(group) {
    const graph = this.graphComponent.graph
    const sourceEdges = {}
    graph.inEdgesAt(group).forEach(edge => {
      if (!edge.tag) {
        return
      }
      sourceEdges[edge.tag.targetSplitId] = edge
    })
    graph
      .outEdgesAt(group)
      .toArray()
      .forEach(edge => {
        if (!edge.tag) {
          return
        }
        const sourceEdge = sourceEdges[edge.tag.sourceSplitId]
        if (sourceEdge) {
          graph.createEdge(sourceEdge.sourceNode, edge.targetNode)
          graph.remove(sourceEdge)
          graph.remove(edge)
        }
      })

    this.runLayout()
  }

  /**
   * Creates an edges that is associated with a specific split id and color.
   * @param {INode} source
   * @param {INode} target
   * @param {object} splitId
   * @param {string} color
   * @return {IEdge}
   */
  createSplitEdge(source, target, splitId, color) {
    return this.graphComponent.graph.createEdge({
      source,
      target,
      style: new PolylineEdgeStyle({
        stroke: `3px ${color}`,
        targetArrow: new Arrow({
          fill: color,
          type: ArrowType.TRIANGLE,
          scale: 1.5
        }),
        smoothingLength: 15
      }),
      tag: {
        sourceSplitId: splitId.sourceSplitId,
        targetSplitId: splitId.targetSplitId,
        color
      }
    })
  }

  /**
   * Updates the selection when an item is right-clicked for a context menu.
   * @param {INode|IEdge} item
   */
  updateSelection(item) {
    const selection = this.graphComponent.selection
    if (!item) {
      selection.clear()
    } else if (!selection.isSelected(item)) {
      selection.clear()
      selection.setSelected(item, true)
    } else {
      if (IEdge.isInstance(item)) {
        selection.selectedNodes.clear()
      } else {
        selection.selectedEdges.clear()
      }
      selection.setSelected(item, true)
    }
  }
}

const colors = [
  'forestgreen',
  'mediumvioletred',
  'darkcyan',
  'chocolate',
  'limegreen',
  'mediumorchid',
  'royalblue',
  'orangered',
  'crimson',
  'darkturquoise',
  'cornflowerblue',
  'darkslateblue',
  'orange',
  'mediumslateblue'
]
let colorIndex = 0

/**
 * Returns the nex color.
 * @return {string}
 */
function getColor() {
  const index = colorIndex++
  if (index < colors.length) {
    return colors[index]
  }
  colorIndex = 0
  return colors[0]
}
