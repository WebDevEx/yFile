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
  Animator,
  CopiedLayoutGraph,
  GraphComponent,
  GraphConnectivity,
  GraphEditorInputMode,
  GraphItemTypes,
  ICommand,
  IEnumerable,
  IGraph,
  IModelItem,
  INode,
  InteractiveOrganicLayout,
  InteractiveOrganicLayoutExecutionContext,
  LayoutGraphAdapter,
  License,
  MoveInputMode,
  YNode
} from 'yfiles'

import { InteractiveOrganicFastEdgeStyle, InteractiveOrganicFastNodeStyle } from './DemoStyles.js'
import { bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * The GraphComponent.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The maximal time the layout will run.
 */
const MAX_TIME = 1000

/**
 * The layout algorithm.
 * @type {InteractiveOrganicLayout}
 */
let layout = null

/**
 * The copy of the graph used for the layout.
 * @type {CopiedLayoutGraph}
 */
let copiedLayoutGraph

/**
 * Holds the nodes that are moved during dragging.
 * @type {Array.<INode>}
 */
let movedNodes

/**
 * The context that provides control over the layout calculation.
 * @type {InteractiveOrganicLayoutExecutionContext}
 */
let layoutContext

/**
 * Runs the demo.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  graphComponent.inputMode = createEditorMode()

  initializeGraph()

  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes the graph instance setting default styles
 * and creating a small sample graph.
 */
function initializeGraph() {
  const graph = graphComponent.graph

  // set some defaults
  graph.nodeDefaults.style = new InteractiveOrganicFastNodeStyle()
  graph.nodeDefaults.shareStyleInstance = true
  graph.edgeDefaults.style = new InteractiveOrganicFastEdgeStyle()
  graph.edgeDefaults.shareStyleInstance = true

  createSampleGraph(graph)

  // center the initial graph
  graphComponent.fitGraphBounds()

  // create a copy of the graph for the layout algorithm
  copiedLayoutGraph = new LayoutGraphAdapter(graphComponent.graph).createCopiedLayoutGraph()

  // create and start the layout algorithm
  layout = startLayout()
  wakeUp()

  // register a listener so that structure updates are handled automatically
  graph.addNodeCreatedListener((source, args) => {
    if (layout !== null) {
      const center = args.item.layout.center
      synchronize()
      // we nail down all newly created nodes
      const copiedNode = copiedLayoutGraph.getCopiedNode(args.item)
      layout.setCenter(copiedNode, center.x, center.y)
      layout.setInertia(copiedNode, 1)
      layout.setStress(copiedNode, 0)

      window.setTimeout(synchronize, MAX_TIME + 1)
    }
  })
  graph.addNodeRemovedListener((source, args) => {
    synchronize()
  })
  graph.addEdgeCreatedListener((source, args) => {
    synchronize()
  })
  graph.addEdgeRemovedListener((source, args) => {
    synchronize()
  })
}

/**
 * Creates the input mode for the graphComponent.
 * @return {IInputMode} a new GraphEditorInputMode instance
 */
function createEditorMode() {
  // create default interaction with a number of disabled input modes.
  const mode = new GraphEditorInputMode({
    selectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    marqueeSelectableItems: GraphItemTypes.NODE,
    clickSelectableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    showHandleItems: GraphItemTypes.NONE,
    allowAddLabel: false
  })
  mode.createBendInputMode.enabled = false
  mode.createEdgeInputMode.allowCreateBend = false
  mode.createEdgeInputMode.allowSelfloops = false

  // prepare the move input mode for interacting with the layout algorithm
  initMoveMode(mode.moveInputMode)

  // We could also allow direct moving of nodes, without requiring selection of the nodes, first.
  // However by default this conflicts with the edge creation gesture, which we will simply disable, here.
  // uncomment the following lines to be able to move nodes without selecting them first
  //
  // mode.moveUnselectedInputMode.enabled = true;
  // initMoveMode(mode.moveUnselectedInputMode);

  return mode
}

/**
 * Registers the listeners to the given move input mode in order to tell the organic layout what
 * nodes are moved interactively.
 * @param {MoveInputMode} moveInputMode The input mode that should be observed
 */
function initMoveMode(moveInputMode) {
  // register callbacks to notify the organic layout of changes
  moveInputMode.addDragStartedListener((sender, args) => onMoveInitialized(sender.affectedItems))
  moveInputMode.addDragCanceledListener(onMoveCanceled)
  moveInputMode.addDraggedListener(onMoving)
  moveInputMode.addDragFinishedListener(onMovedFinished)
}

/**
 * Called once the move operation has been initialized.
 * Calculates which components stay fixed and which nodes will be moved by the user.
 * @param {IEnumerable.<IModelItem>} affectedItems The dragged items
 */
function onMoveInitialized(affectedItems) {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    const componentNumber = copy.createNodeMap()
    GraphConnectivity.connectedComponents(copy, componentNumber)
    const movedComponents = new Set()
    const selectedNodes = new Set()
    movedNodes = affectedItems.filter(item => INode.isInstance(item)).toArray()
    movedNodes.forEach(node => {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // remember that we nailed down this node
        selectedNodes.add(copiedNode)
        // remember that we are moving this component
        movedComponents.add(componentNumber.getInt(copiedNode))
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(
          copiedNode,
          node.layout.x + node.layout.width * 0.5,
          node.layout.y + node.layout.height * 0.5
        )
        // Actually, the node itself is fixed at the start of a drag gesture
        layout.setInertia(copiedNode, 1.0)
        // Increasing has the effect that the layout will consider this node as not completely placed...
        // In this case, the node itself is fixed, but it's neighbors will wake up
        increaseHeat(copiedNode, layout, 0.5)
      }
    })

    // make all nodes that are not actively moved float freely
    copy.nodes.forEach(copiedNode => {
      if (!selectedNodes.has(copiedNode)) {
        layout.setInertia(copiedNode, 0)
      }
    })

    // dispose the map
    copy.disposeNodeMap(componentNumber)

    // Notify the layout that there is new work to do...
    layout.wakeUp()
  }
}

/**
 * Notifies the layout of the new positions of the interactively moved nodes.
 */
function onMoving() {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    movedNodes.forEach(node => {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        // Increasing the heat has the effect that the layout will consider these nodes as not completely placed...
        increaseHeat(copiedNode, layout, 0.05)
      }
    })
    // Notify the layout that there is new work to do...
    layout.wakeUp()
  }
}

/**
 * Resets the state in the layout when the user cancels the move operation.
 */
function onMoveCanceled() {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    movedNodes.forEach(node => {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        layout.setStress(copiedNode, 0)
      }
    })
    copy.nodes.forEach(copiedNode => {
      // Reset the node's inertia to be fixed
      layout.setInertia(copiedNode, 1.0)
      layout.setStress(copiedNode, 0)
    }) // We don't want to restart the layout (since we canceled the drag anyway...)
  }
}

/**
 * Called once the interactive move is finished.
 * Updates the state of the interactive layout.
 */
function onMovedFinished() {
  if (layout !== null) {
    const copy = copiedLayoutGraph
    movedNodes.forEach(node => {
      const copiedNode = copy.getCopiedNode(node)
      if (copiedNode !== null) {
        // Update the position of the node in the CLG to match the one in the IGraph
        layout.setCenter(copiedNode, node.layout.center.x, node.layout.center.y)
        layout.setStress(copiedNode, 0)
      }
    })
    copy.nodes.forEach(copiedNode => {
      // Reset the node's inertia to be fixed
      layout.setInertia(copiedNode, 1.0)
      layout.setStress(copiedNode, 0)
    })
  }
}

/**
 * Wires up the GUI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent, null)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent, null)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
}

/**
 * Creates a new layout instance and starts a new execution context for it.
 * @return {InteractiveOrganicLayout}
 */
function startLayout() {
  // create the layout
  const organicLayout = new InteractiveOrganicLayout({
    maximumDuration: MAX_TIME,
    // The compactness property prevents component drifting.
    compactnessFactor: 0.6
  })

  layoutContext = organicLayout.startLayout(copiedLayoutGraph)

  // use an animator that animates an infinite animation
  const animator = new Animator(graphComponent)
  animator.autoInvalidation = false
  animator.allowUserInteraction = true

  animator.animate(() => {
    layoutContext.continueLayout(20)
    if (organicLayout.commitPositionsSmoothly(50, 0.05) > 0) {
      graphComponent.updateVisual()
    }
  }, Number.POSITIVE_INFINITY)

  return organicLayout
}

/**
 * Wakes up the layout algorithm.
 */
function wakeUp() {
  if (layout !== null) {
    // we make all nodes freely movable
    copiedLayoutGraph.nodes.forEach(copiedNode => {
      layout.setInertia(copiedNode, 0)
    })
    // then wake up the layout
    layout.wakeUp()

    const geim = graphComponent.inputMode
    // and after two seconds we freeze the nodes again...
    window.setTimeout(() => {
      if (geim.moveInputMode.isDragging) {
        // don't freeze the nodes if a node is currently being moved
        return
      }
      copiedLayoutGraph.nodes.forEach(copiedNode => {
        layout.setInertia(copiedNode, 1)
      })
    }, 2000)
  }
}

/**
 * Synchronizes the structure of the graph copy with the original graph.
 */
function synchronize() {
  if (layout !== null) {
    layout.syncStructure()
    layoutContext.continueLayout(10)
  }
}

/**
 * Helper method that increases the heat of the neighbors of a given node by a given value.
 * This will make the layout algorithm move the neighbor nodes more quickly.
 * @param {YNode} copiedNode
 * @param {InteractiveOrganicLayout} layoutAlgorithm
 * @param {number} delta
 */
function increaseHeat(copiedNode, layoutAlgorithm, delta) {
  // Increase Heat of neighbors
  copiedNode.neighbors.forEach(neighbor => {
    const oldStress = layoutAlgorithm.getStress(neighbor)
    layoutAlgorithm.setStress(neighbor, Math.min(1, oldStress + delta))
  })
}

/**
 * Creates sample graph.
 * @param {IGraph} graph
 */
function createSampleGraph(graph) {
  const nodes = []
  for (let i = 0; i < 20; i++) {
    nodes[i] = graph.createNode()
  }

  graph.createEdge(nodes[0], nodes[11])
  graph.createEdge(nodes[0], nodes[8])
  graph.createEdge(nodes[0], nodes[19])
  graph.createEdge(nodes[0], nodes[2])
  graph.createEdge(nodes[11], nodes[4])
  graph.createEdge(nodes[11], nodes[18])
  graph.createEdge(nodes[8], nodes[7])
  graph.createEdge(nodes[19], nodes[13])
  graph.createEdge(nodes[19], nodes[2])
  graph.createEdge(nodes[19], nodes[17])
  graph.createEdge(nodes[19], nodes[15])
  graph.createEdge(nodes[19], nodes[10])
  graph.createEdge(nodes[13], nodes[7])
  graph.createEdge(nodes[13], nodes[17])
  graph.createEdge(nodes[2], nodes[15])
  graph.createEdge(nodes[2], nodes[1])
  graph.createEdge(nodes[4], nodes[18])
  graph.createEdge(nodes[16], nodes[6])
  graph.createEdge(nodes[7], nodes[14])
  graph.createEdge(nodes[17], nodes[5])
  graph.createEdge(nodes[15], nodes[10])
  graph.createEdge(nodes[15], nodes[12])
  graph.createEdge(nodes[6], nodes[9])
  graph.createEdge(nodes[5], nodes[3])
  graph.createEdge(nodes[5], nodes[9])
}

// start demo
loadJson().then(run)
