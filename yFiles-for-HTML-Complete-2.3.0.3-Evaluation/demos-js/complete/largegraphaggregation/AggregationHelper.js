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
  AdjacencyTypes,
  DefaultLabelStyle,
  FreeNodeLabelModel,
  HashMap,
  IEdge,
  IEdgeStyle,
  ILabelStyle,
  IListEnumerable,
  IMap,
  INode,
  INodeStyle,
  List,
  ListEnumerable,
  NodeAggregate,
  NodeAggregationResult,
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import { AggregationGraphWrapper } from '../../utils/AggregationGraphWrapper.js'

/**
 * A helper class that provides methods to aggregate and separate nodes according to a {@link NodeAggregationResult}.
 * <p>
 * Delegates most of it's work to an {@link AggregationGraphWrapper}. Implements some functionality on top:
 * </p>
 * <ul>
 * <li>When separating a node, this class creates a new aggregation node as replacement. This node represents the
 * hierarchy also in separated state and allows the user to aggregate its children again.</li>
 * <li>Creates additional "hierarchy" edges between such nodes and its children.</li>
 * <li>Since {@link NodeAggregate}s are allowed to both have children as well as represent an original node, the
 * aggregation nodes for such aggregates are special placeholder nodes that adopt its visual appearance, its labels, as
 * well as its edges to other nodes.</li>
 * </ul>
 */
export class AggregationHelper {
  /**
   * @type {number}
   */
  get visibleNodes() {
    return this.aggregateGraph
      ? this.aggregateGraph.nodes.filter(node => this.isOriginalNodeOrPlaceHolder(node)).size
      : 0
  }

  /**
   * @param {!INode} node
   * @returns {boolean}
   */
  isOriginalNodeOrPlaceHolder(node) {
    return !this.aggregateGraph.isAggregationItem(node) || (!!node.tag && !!node.tag.aggregate.node)
  }

  /**
   * @param {!IEdge} edge
   * @returns {boolean}
   */
  isHierarchyEdge(edge) {
    return edge.tag === 'aggregation-edge'
  }

  /**
   * @type {number}
   */
  get visibleEdges() {
    return this.aggregateGraph ? this.aggregateGraph.edges.filter(e => !e.tag).size : 0
  }

  /**
   * Creates a new instance of this class.
   * @param {!NodeAggregationResult} aggregationResult
   * @param {!AggregationGraphWrapper} aggregateGraph
   */
  constructor(aggregationResult, aggregateGraph) {
    // The {@link AggregationGraphWrapper} this instance uses.
    this.aggregateGraph = aggregateGraph
    // The aggregation result.
    this.$aggregationResult = aggregationResult

    // Maps {@link NodeAggregate}s to aggregation nodes.
    this.$aggregateToNode = new HashMap()
    // A map for placeholder nodes that maps original nodes to their aggregation placeholder node.
    this.$placeholderMap = new HashMap()

    // The style used for aggregation nodes (no matter which state). Should adapt to the {@link AggregationNodeInfo} in the node's tag.
    this.aggregationNodeStyle = new ShapeNodeStyle({ shape: 'ellipse' })
    // The edge style to be used for the artificial hierarchy edges.
    this.hierarchyEdgeStyle = new PolylineEdgeStyle()
    // The style for labels that are created for aggregation nodes that don't directly represent an original node. Such
    // labels show the text of the most important descendant node.
    this.descendantLabelStyle = new DefaultLabelStyle()
  }

  /**
   * Returns the {@link NodeAggregate} for a node.
   * @param {!INode} node
   * @returns {!NodeAggregate}
   */
  getAggregateForNode(node) {
    if (this.aggregateGraph.isAggregationItem(node)) {
      return node.tag.aggregate
    } else {
      return this.$aggregationResult.aggregateMap.get(node)
    }
  }

  /**
   * Returns the placeholder node for an original node or the original node itself if there is no placeholder.
   * @param {!INode} originalNode
   * @returns {!INode}
   */
  getPlaceholder(originalNode) {
    const placeHolder = this.$placeholderMap.get(originalNode)
    return placeHolder || originalNode
  }

  /**
   * If a node is aggregated, calls {@link AggregationHelper#separate}, if not calls {@link AggregationHelper#aggregate}.
   * @param {!INode} node The node.
   * @returns {!IListEnumerable.<INode>} The nodes affected by this operation. The created aggregation node is always the first item.
   */
  toggleAggregation(node) {
    const aggregationNodeInfo = node.tag
    return aggregationNodeInfo.isAggregated ? this.separate(node) : this.aggregate(node)
  }

  /**
   * Replaces a separated node and its hierarchy children with a new aggregation node.
   * @param {!INode} node The node.
   * @returns {!IListEnumerable.<INode>} The nodes affected by this operation. The created aggregation node is always the first item.
   */
  aggregate(node) {
    const aggregationInfo = node.tag
    const aggregate = aggregationInfo.aggregate
    const aggregationNode = this.aggregateRecursively(aggregate)

    const affectedNodes = new List()
    if (aggregationNode) {
      affectedNodes.add(aggregationNode)

      const parentNode = this.$aggregateToNode.get(aggregate.parent)
      if (parentNode) {
        this.aggregateGraph.createEdge(
          parentNode,
          aggregationNode,
          this.hierarchyEdgeStyle,
          'aggregation-edge'
        )
        affectedNodes.add(parentNode)
      }

      if (aggregate.node) {
        this.$replaceEdges(aggregationNode)
      }
    }

    return new ListEnumerable(affectedNodes)
  }

  /**
   * Aggregates the <code>aggregate</code> as well as all its children recursively.
   * <p>
   * Can be used to apply the initial aggregation. If this is not the initial aggregation run, it will reuse existing aggregation nodes.
   * </p>
   * @param {!NodeAggregate} aggregate The "root" aggregate.
   * @returns {!INode} The aggregation node representing the passed <code>aggregate</code>
   */
  aggregateRecursively(aggregate) {
    if (aggregate.children.size === 0) {
      return aggregate.node
    }

    let originalCenter
    const node = this.$aggregateToNode.get(aggregate)
    if (node) {
      originalCenter = node.layout.center
      const aggregationInfo = node.tag
      if (aggregationInfo.isAggregated) {
        return node
      } else {
        this.aggregateGraph.separate(node)
      }
    } else {
      originalCenter = Point.ORIGIN
    }

    const nodesToAggregate = aggregate.children.map(this.aggregateRecursively.bind(this)).toList()
    if (aggregate.node) {
      nodesToAggregate.add(aggregate.node)
    }

    const size = 30 + Math.sqrt(aggregate.descendantWeightSum) * 4
    const layout = Rect.fromCenter(originalCenter, new Size(size, size))
    const aggregationNode = this.aggregateGraph.aggregate(
      new ListEnumerable(nodesToAggregate),
      layout,
      this.aggregationNodeStyle
    )

    this.$aggregateToNode.set(aggregate, aggregationNode)
    aggregationNode.tag = new AggregationNodeInfo(aggregate, true)

    if (aggregate.node) {
      this.$placeholderMap.set(aggregate.node, aggregationNode)
      this.$copyLabels(aggregate.node, aggregationNode)
    } else {
      const maxChild = AggregationHelper.getMostImportantDescendant(aggregate)
      if (maxChild.node) {
        this.aggregateGraph.addLabel(
          aggregationNode,
          `(${maxChild.node.labels.get(0).text}, …)`,
          FreeNodeLabelModel.INSTANCE.createDefaultParameter(),
          this.descendantLabelStyle
        )
      }
    }

    return aggregationNode
  }

  /**
   * Gets the descendant {@link NodeAggregate} with the highest {@link NodeAggregate#descendantWeightSum}.
   * @param {!NodeAggregate} aggregate
   * @returns {!NodeAggregate}
   */
  static getMostImportantDescendant(aggregate) {
    while (true) {
      const maxChild = aggregate.children.reduce((max, child) =>
        child.descendantWeightSum > max.descendantWeightSum ? child : max
      )
      if (maxChild.node) {
        return maxChild
      }
      aggregate = maxChild
    }
  }

  /**
   * Copies the labels from <code>source</code> to <code>target</code>.
   * @param {!INode} source
   * @param {!INode} target
   */
  $copyLabels(source, target) {
    for (const label of source.labels) {
      this.aggregateGraph.addLabel(
        target,
        label.text,
        FreeNodeLabelModel.INSTANCE.createDefaultParameter(),
        label.style
      )
    }
  }

  /**
   * Separates an aggregated aggregation node and replaces it by a new aggregation node.
   * <p>
   * Creates hierarchy edges between the new aggregation node and its children.
   * </p>
   * @param {!INode} node The node.
   * @returns {!IListEnumerable.<INode>} The nodes affected by this operation. The created aggregation node is always the first item.
   */
  separate(node) {
    const aggregationInfo = node.tag
    const aggregate = aggregationInfo.aggregate
    const aggregatedItems = this.aggregateGraph
      .getAggregatedItems(node)
      .filter(n => n !== aggregate.node)
      .toList()
    this.aggregateGraph.separate(node)

    const nodesToAggregate = aggregate.node
      ? new ListEnumerable(AggregationHelper.initializer(new List(), aggregate.node))
      : IListEnumerable.EMPTY
    const aggregationNode = this.aggregateGraph.aggregate(
      nodesToAggregate,
      node.layout.toRect(),
      this.aggregationNodeStyle,
      null
    )

    for (const child of aggregatedItems) {
      this.aggregateGraph.createEdge(
        aggregationNode,
        child,
        this.hierarchyEdgeStyle,
        'aggregation-edge'
      )
      this.aggregateGraph.setNodeLayout(
        child,
        Rect.fromCenter(aggregationNode.layout.center, child.layout.toSize())
      )
      this.$replaceEdges(child)
    }

    aggregationInfo.isAggregated = false
    this.$aggregateToNode.set(aggregate, aggregationNode)
    aggregationNode.tag = aggregationInfo

    const affectedNodes = new List()
    affectedNodes.add(aggregationNode)
    affectedNodes.addRange(aggregatedItems)

    const parentNode = this.$aggregateToNode.get(aggregate.parent)
    if (aggregate.parent && parentNode) {
      this.aggregateGraph.createEdge(
        parentNode,
        aggregationNode,
        this.hierarchyEdgeStyle,
        'aggregation-edge'
      )
      affectedNodes.add(parentNode)
    }

    if (aggregate.node) {
      this.$placeholderMap.set(aggregate.node, aggregationNode)
      this.$copyLabels(aggregate.node, aggregationNode)
      this.$replaceEdges(aggregationNode)
    }

    return new ListEnumerable(affectedNodes)
  }

  /**
   * @param {!List.<INode>} instance
   * @param {!INode} p1
   * @returns {!List.<INode>}
   */
  static initializer(instance, p1) {
    instance.add(p1)
    return instance
  }

  /**
   * Replaces original edges adjacent to a placeholder node with aggregation edges when source and target are currently visible.
   * @param {!INode} node
   */
  $replaceEdges(node) {
    let originalNode
    let tmp
    const aggregationInfo = (tmp = node.tag) instanceof AggregationNodeInfo ? tmp : null
    if (aggregationInfo) {
      originalNode = aggregationInfo.aggregate.node
    } else {
      originalNode = node
    }

    if (!originalNode) {
      return
    }

    this.aggregateGraph.wrappedGraph
      .edgesAt(originalNode, AdjacencyTypes.ALL)
      .toList()
      .forEach(edge => {
        if (edge.targetPort.owner === originalNode) {
          this.$createReplacementEdge(edge.sourcePort.owner, node, edge, true)
        } else {
          this.$createReplacementEdge(node, edge.targetPort.owner, edge, false)
        }
      })
  }

  /**
   * @param {!INode} sourceNode
   * @param {!INode} targetNode
   * @param {!IEdge} edge
   * @param {boolean} newSource
   */
  $createReplacementEdge(sourceNode, targetNode, edge, newSource) {
    if (
      (newSource && this.aggregateGraph.contains(sourceNode)) ||
      (!newSource && this.aggregateGraph.contains(targetNode))
    ) {
      this.$createReplacementEdgeCore(sourceNode, targetNode, edge)
    } else {
      if (newSource) {
        const placeholderSource = this.$placeholderMap.get(sourceNode)
        if (placeholderSource && this.aggregateGraph.contains(placeholderSource)) {
          this.$createReplacementEdgeCore(placeholderSource, targetNode, edge)
        }
      } else {
        const placeholderTarget = this.$placeholderMap.get(targetNode)
        if (placeholderTarget && this.aggregateGraph.contains(placeholderTarget)) {
          this.$createReplacementEdgeCore(sourceNode, placeholderTarget, edge)
        }
      }
    }
  }

  /**
   * @param {!INode} sourceNode
   * @param {!INode} targetNode
   * @param {!IEdge} edge
   */
  $createReplacementEdgeCore(sourceNode, targetNode, edge) {
    if (
      (this.aggregateGraph.isAggregationItem(sourceNode) ||
        this.aggregateGraph.isAggregationItem(targetNode)) &&
      !this.aggregateGraph.getEdge(sourceNode, targetNode) &&
      !this.aggregateGraph.getEdge(targetNode, sourceNode)
    ) {
      this.aggregateGraph.createEdge(sourceNode, targetNode, edge.style, null)
    }
  }
}

/**
 * The class for the tag of aggregation nodes.
 */
export class AggregationNodeInfo {
  /**
   * @type {!NodeAggregate}
   */
  get aggregate() {
    return this.$aggregate
  }

  /**
   * @param {!NodeAggregate} aggregate
   * @param {boolean} isAggregated
   */
  constructor(aggregate, isAggregated) {
    this.$aggregate = aggregate
    this.isAggregated = isAggregated
  }
}
