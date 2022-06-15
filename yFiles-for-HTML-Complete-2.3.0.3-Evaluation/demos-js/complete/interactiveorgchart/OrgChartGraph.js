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
  CompactNodePlacer,
  CompositeLayoutData,
  FilteredGraphWrapper,
  FixNodeLayoutData,
  FixNodeLayoutStage,
  GraphComponent,
  ICommand,
  IComparer,
  IGraph,
  IModelItem,
  INode,
  IPort,
  ITreeLayoutPortAssignment,
  Insets,
  LayoutExecutor,
  LayoutGraph,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  TreeLayout,
  TreeLayoutData,
  TreeReductionStage,
  YNode,
  YPoint
} from 'yfiles'

export default class OrgChartGraph {
  /**
   * Creates a new instance of this class.
   * @param {GraphComponent} graphComponent
   * @param {IGraph} completeGraph
   */
  constructor(graphComponent, completeGraph) {
    /**
     * Used by the predicate function to determine which nodes should not be shown.
     * @type {Set}
     */
    this.hiddenNodesSet = new Set()

    this.graphComponent = graphComponent
    this.completeGraph = completeGraph
    this.filteredGraph = new FilteredGraphWrapper(
      completeGraph,
      node => !this.hiddenNodesSet.has(node),
      e => true
    )
    /**
     * Set to true when a layout is in progress.
     * @type {boolean}
     */
    this.doingLayout = false
  }

  /**
   * Hides the children of the given node or port.
   * @param {INode|IPort} item
   */
  async executeHideChildren(item) {
    if (!this.canExecuteHideChildren(item)) {
      return Promise.resolve()
    }

    const incrementalNodes = OrgChartGraph.collectSubtreeNodes(
      this.filteredGraph.wrappedGraph,
      item
    )
    // change the tag of the node to collapsed is true to change the style of the port
    incrementalNodes.concat([item]).forEach(node => {
      this.filteredGraph.wrappedGraph.outEdgesAt(node).forEach(childEdge => {
        childEdge.sourcePort.style.styleTag = { collapsed: true }
      })
    })
    // remove empty groups
    OrgChartGraph.findEmptyGroups(this.filteredGraph, incrementalNodes).forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(item, incrementalNodes, true)
    incrementalNodes.forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()
  }

  /**
   * Determines whether the children of the given node or port can be hidden.
   * @param {INode|IPort} item
   * @returns {boolean} Whether the children of the given node or port can be hidden.
   */
  canExecuteHideChildren(item) {
    return (
      (INode.isInstance(item) || IPort.isInstance(item)) &&
      !this.doingLayout &&
      this.filteredGraph.outDegree(item) > 0
    )
  }

  /**
   * Shows the children of the given node or port.
   * @param {INode|IPort} item
   */
  executeShowChildren(item) {
    if (!this.canExecuteShowChildren(item)) {
      return Promise.resolve()
    }

    const incrementalNodes = OrgChartGraph.collectSubtreeNodes(
      this.filteredGraph.wrappedGraph,
      item
    )
    this.filteredGraph.wrappedGraph.outEdgesAt(item).forEach(childEdge => {
      const child = childEdge.targetNode
      this.hiddenNodesSet.delete(child)
      OrgChartGraph.restoreGroup(this.completeGraph, this.hiddenNodesSet, child)

      // change the tag of the node to collapsed is false to change the style of the port
      childEdge.sourcePort.style.styleTag = { collapsed: false }
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(item, incrementalNodes, false)
  }

  /**
   * Determines whether the children of the given node or port can be shown.
   * @param {INode|IPort} item
   * @returns {boolean} Whether the children of the given node or port can be shown.
   */
  canExecuteShowChildren(item) {
    return (
      (INode.isInstance(item) || IPort.isInstance(item)) &&
      !this.doingLayout &&
      this.filteredGraph.outDegree(item) !== this.filteredGraph.wrappedGraph.outDegree(item)
    )
  }

  /**
   * Shows the parent of the given node.
   * @param {INode} node
   */
  executeShowParent(node) {
    if (!INode.isInstance(node) || this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes = []
    this.filteredGraph.wrappedGraph.inEdgesAt(node).forEach(parentEdge => {
      const parent = parentEdge.sourceNode
      this.hiddenNodesSet.delete(parent)
      OrgChartGraph.restoreGroup(this.completeGraph, this.hiddenNodesSet, parent)
      incrementalNodes.push(parent)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(node, incrementalNodes, false)
  }

  /**
   * Determines whether the parent of the given node can be shown.
   * @param {INode} node
   * @returns {boolean} Whether the parent of the given node can be shown.
   */
  canExecuteShowParent(node) {
    return (
      INode.isInstance(node) &&
      !this.doingLayout &&
      this.filteredGraph.inDegree(node) === 0 &&
      this.filteredGraph.wrappedGraph.inDegree(node) > 0
    )
  }

  /**
   * Hides the parent of the given node.
   * @param {INode} node
   */
  async executeHideParent(node) {
    if (!INode.isInstance(node) || this.doingLayout) {
      return Promise.resolve()
    }
    const nodes = OrgChartGraph.collectAllNodesExceptSubtree(this.filteredGraph.wrappedGraph, node)
    // remove empty groups
    OrgChartGraph.findEmptyGroups(this.filteredGraph, nodes).forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    this.filteredGraph.nodePredicateChanged()
    await this.refreshLayout(node, nodes, true)

    nodes.forEach(n => {
      this.hiddenNodesSet.add(n)
    })
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()
  }

  /**
   * Determines whether the parent of the given node can be hidden.
   * @param {INode} node
   * @returns {boolean} Whether the parent of the given node can be hidden.
   */
  canExecuteHideParent(node) {
    return INode.isInstance(node) && !this.doingLayout && this.filteredGraph.inDegree(node) > 0
  }

  /**
   * Shows all nodes.
   */
  executeShowAll() {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    const incrementalNodes = Array.from(this.hiddenNodesSet)
    this.hiddenNodesSet.clear()

    // set the collapsed tag as false for all source ports for the edge in the original graph, so that the style for
    // the all ports will be MINUS
    this.filteredGraph.wrappedGraph.edges.forEach(edge => {
      edge.sourcePort.style.styleTag = { collapsed: false }
    })

    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    return this.refreshLayout(this.graphComponent.currentItem, incrementalNodes, false)
  }

  /**
   * Determines whether 'show all' can be executed.
   * @returns {boolean} Whether 'show all' can be executed.
   */
  canExecuteShowAll() {
    return this.hiddenNodesSet.size !== 0 && !this.doingLayout
  }

  /**
   * Applies the initial layout to the graph, without
   */
  applyInitialLayout() {
    if (this.doingLayout) {
      return
    }
    this.hiddenNodesSet.clear()
    // inform the filter that the predicate changed and thus the graphs needs to be updated
    this.filteredGraph.nodePredicateChanged()

    // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
    const mapperRegistry = this.filteredGraph.mapperRegistry
    if (mapperRegistry.getMapper(CompactNodePlacer.STRATEGY_MEMENTO_DP_KEY) == null) {
      mapperRegistry.createMapper(CompactNodePlacer.STRATEGY_MEMENTO_DP_KEY)
    }

    this.filteredGraph.applyLayout(
      OrgChartGraph.createConfiguredLayout(false),
      OrgChartGraph.createConfiguredLayoutData(this.filteredGraph)
    )
    this.graphComponent.fitGraphBounds()
    this.limitViewport()
  }

  /**
   * Focuses the given item.
   * @param {IModelItem} item
   */
  zoomToItem(item) {
    if (!INode.isInstance(item)) {
      return
    }
    if (!this.filteredGraph.nodes.includes(item)) {
      // the given node is hidden, make it visible

      // unhide all nodes ...
      this.hiddenNodesSet.clear()
      // ... except the node to be displayed and all its descendants
      OrgChartGraph.collectAllNodesExceptSubtree(this.filteredGraph.wrappedGraph, item).forEach(
        n => {
          this.hiddenNodesSet.add(n)
        }
      )
      // inform the filter that the predicate changed and thus the graphs needs to be updated
      this.filteredGraph.nodePredicateChanged()

      this.filteredGraph.applyLayout(
        OrgChartGraph.createConfiguredLayout(false),
        OrgChartGraph.createConfiguredLayoutData(this.filteredGraph)
      )
      this.limitViewport()
    }

    this.graphComponent.currentItem = item
    ICommand.ZOOM_TO_CURRENT_ITEM.execute(null, this.graphComponent)
  }

  /**
   * Refreshes the node after modifications on the tree.
   * @param {INode|null} centerNode
   * @param {INode[]} incrementalNodes
   * @param {boolean} collapse
   * @param {INode} centerNode
   * @return {Promise} a promise which is resolved when the layout has been executed.
   */
  async refreshLayout(centerNode, incrementalNodes, collapse) {
    if (this.doingLayout) {
      return Promise.resolve()
    }
    this.doingLayout = true

    // once the nodes have been arranged, remember their arrangement strategy for a more stable layout upon changes
    const mapperRegistry = this.filteredGraph.mapperRegistry
    if (mapperRegistry.getMapper(CompactNodePlacer.STRATEGY_MEMENTO_DP_KEY) == null) {
      mapperRegistry.createMapper(CompactNodePlacer.STRATEGY_MEMENTO_DP_KEY)
    }

    if (!collapse) {
      // move the incremental nodes between their neighbors before expanding for a smooth animation
      this.prepareSmoothExpandLayoutAnimation(incrementalNodes)
    }

    // configure the tree layout
    const treeLayout = OrgChartGraph.createConfiguredLayout(true, collapse ? incrementalNodes : [])

    // create the layout (with a stage that fixes the center node in the coordinate system)
    const layout = new FixNodeLayoutStage(new TreeReductionStage(treeLayout))

    const layoutData = new CompositeLayoutData()
    if (centerNode) {
      // we mark a node as the center node
      layoutData.items.add(new FixNodeLayoutData({ fixedNodes: centerNode }))
    }
    if (collapse) {
      // configure PlaceNodesAtBarycenterStage for a smooth animation
      layoutData.items.add(
        new PlaceNodesAtBarycenterStageData({
          affectedNodes: node => incrementalNodes.indexOf(node) >= 0
        })
      )
    }

    layoutData.items.add(
      OrgChartGraph.createConfiguredLayoutData(this.filteredGraph, collapse ? incrementalNodes : [])
    )

    // configure a LayoutExecutor
    const executor = new LayoutExecutor({
      graphComponent: this.graphComponent,
      layout,
      layoutData,
      animateViewport: centerNode === null,
      easedAnimation: true,
      duration: '0.5s',
      fixPorts: true
    })

    try {
      await executor.start()
      this.limitViewport()
      // the commands CanExecute state might have changed - trigger a requery
      ICommand.invalidateRequerySuggested()
    } catch (error) {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    }
    this.doingLayout = false
  }

  /**
   * Moves incremental nodes to a location between their neighbors before expanding for a smooth animation.
   * @param {INode[]} incrementalNodes
   * @private
   */
  prepareSmoothExpandLayoutAnimation(incrementalNodes) {
    const graph = this.graphComponent.graph

    // mark the new nodes and place them between their neighbors
    const layoutData = new PlaceNodesAtBarycenterStageData({
      affectedNodes: node => incrementalNodes.indexOf(node) >= 0
    })

    const layout = new PlaceNodesAtBarycenterStage()
    graph.applyLayout(layout, layoutData)
  }

  /**
   * Creates a tree layout data for the tree layout
   * @param {IGraph} graph
   * @param {INode[]} incrementalNodes
   * @return {TreeLayoutData} A configured TreeLayoutData.
   * @private
   */
  static createConfiguredLayoutData(graph = null, incrementalNodes = []) {
    const hasIncrementalParent = node =>
      graph.inDegree(node) > 0 && incrementalNodes.indexOf(graph.predecessors(node).first()) !== -1
    const firstLevelOutEdgeComparer = (edge1, edge2) => {
      // order of the first level person names
      const firstLevelOrder = [
        'Mildred Shark',
        'Amy Kain',
        'David Kerry',
        'Richard Fuller',
        'Angela Haase'
      ]
      const targetNode1 = edge1.targetNode
      const targetNode2 = edge2.targetNode
      if (targetNode1.tag && targetNode2.tag) {
        const name1 = targetNode1.tag.name
        const name2 = targetNode2.tag.name
        const name1Idx = firstLevelOrder.indexOf(name1)
        const name2Idx = firstLevelOrder.indexOf(name2)
        if (name1Idx !== -1 && name2Idx !== -1) {
          return name1Idx - name2Idx
        }
      }
      return 0
    }
    return new TreeLayoutData({
      assistantNodes: node =>
        node.tag && node.tag.assistant && graph.inDegree(node) > 0 && !hasIncrementalParent(node),
      outEdgeComparers: node => {
        if (node.tag && node.tag.name === 'Eric Joplin') {
          return firstLevelOutEdgeComparer
        }
        return () => 0
      }
    })
  }

  /**
   * Creates a tree layout that handles assistant nodes and stack leaf nodes.
   * @param {boolean} incremental
   * @param {INode[]} incrementalNodes
   * @return {TreeLayout} A configured TreeLayout.
   * @private
   */
  static createConfiguredLayout(incremental, incrementalNodes = []) {
    const treeLayout = new TreeLayout()
    treeLayout.defaultPortAssignment = new ITreeLayoutPortAssignment({
      /**
       * @param {LayoutGraph} graph - the graph
       * @param {YNode} node - the node whose adjacent edges' ports should be set
       */
      assignPorts(graph, node) {
        const inEdge = node.firstInEdge
        if (inEdge) {
          graph.setTargetPointRel(inEdge, YPoint.ORIGIN)
        }
        const halfHeight = graph.getSize(node).height / 2
        node.outEdges.forEach(outEdge => {
          graph.setSourcePointRel(outEdge, new YPoint(0, halfHeight))
        })
      }
    })
    if (incremental) {
      treeLayout.defaultOutEdgeComparer = new IComparer({
        compare(edge1, edge2) {
          const y1 = edge1.graph.getCenterY(edge1.target)
          const y2 = edge2.graph.getCenterY(edge2.target)
          if (y1 === y2) {
            const x1 = edge1.graph.getCenterX(edge1.target)
            const x2 = edge2.graph.getCenterX(edge2.target)
            if (x1 === x2) {
              return 0
            }
            return x1 < x2 ? -1 : 1
          }
          return y1 < y2 ? -1 : 1
        }
      })
    }

    // we let the CompactNodePlacer arrange the nodes
    treeLayout.defaultNodePlacer = new CompactNodePlacer()

    // layout stages used to place nodes at barycenter for smoother layout animations
    treeLayout.appendStage(new PlaceNodesAtBarycenterStage())

    return new TreeReductionStage(treeLayout)
  }

  /**
   * Setup a ViewportLimiter that makes sure that the explorable region doesn't exceed the graph size.
   */
  limitViewport() {
    this.graphComponent.updateContentRect(new Insets(100))
    const limiter = this.graphComponent.viewportLimiter
    limiter.honorBothDimensions = false
    limiter.bounds = this.graphComponent.contentRect
  }

  /**
   * Restores the group of the given node if needed.
   * @param {IGraph} graph
   * @param {Set} hiddenNodesSet
   * @param {INode} node
   */
  static restoreGroup(graph, hiddenNodesSet, node) {
    const parent = graph.getParent(node)
    if (parent != null && hiddenNodesSet.has(parent)) {
      hiddenNodesSet.delete(parent)
    }
  }

  /**
   * Returns all groups in the given graph that will be empty after removing the given nodes.
   * @param {IGraph} graph
   * @param {INode[]} nodesToHide
   * @return {INode[]}
   */
  static findEmptyGroups(graph, nodesToHide) {
    return graph.nodes
      .filter(
        node =>
          graph.isGroupNode(node) &&
          graph.degree(node) === 0 &&
          graph.getChildren(node).every(child => nodesToHide.indexOf(child) !== -1)
      )
      .toArray()
  }

  /**
   * Creates an array containing all nodes of the subtree rooted by the given node.
   * @param {IGraph} graph
   * @param {INode|IPort} root
   * @return {INode[]}
   */
  static collectSubtreeNodes(graph, root) {
    const nodes = []
    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()
      graph.outEdgesAt(node).forEach(outEdge => {
        stack.unshift(outEdge.targetNode)
        nodes.push(outEdge.targetNode)
      })
    }
    return nodes
  }

  /**
   * Creates an array of all nodes except of the nodes in the subtree rooted in the excluded sub-root.
   * @param {IGraph} graph
   * @param {INode} excludedRoot
   * @return {INode[]}
   * @private
   */
  static collectAllNodesExceptSubtree(graph, excludedRoot) {
    const nodes = []
    let root = excludedRoot
    while (graph.inDegree(root) > 0) {
      root = graph.inEdgesAt(root).first().sourceNode
    }

    const stack = [root]
    while (stack.length > 0) {
      const node = stack.pop()
      if (node !== excludedRoot) {
        nodes.push(node)
        graph.outEdgesAt(node).forEach(outEdge => {
          stack.unshift(outEdge.targetNode)
        })
      }
    }

    return nodes
  }
}
