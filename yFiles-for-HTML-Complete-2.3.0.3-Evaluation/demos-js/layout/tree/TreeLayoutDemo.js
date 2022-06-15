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
  DashStyle,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  IArrow,
  ICommand,
  INode,
  ITreeLayoutNodePlacer,
  License,
  PolylineEdgeStyle,
  ShapeNodeShape,
  ShapeNodeStyle,
  Size,
  Stroke,
  TreeBuilder,
  TreeLayout
} from 'yfiles'
import {
  createCategoryTreeConfiguration,
  createDefaultTreeConfiguration,
  createGeneralGraphConfiguration,
  createGenericConfiguration,
  createLargeTreeConfiguration,
  createWideTreeConfiguration
} from './TreeLayoutConfigurations.js'
import * as TreeData from './resources/TreeData.js'
import CreateTreeEdgeInputMode from './CreateTreeEdgeInputMode.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'
import NodePlacerPanel from './NodePlacerPanel.js'

/**
 * The graph component which contains the tree graph.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The panel which provides access to the node placer settings.
 * @type {NodePlacerPanel}
 */
let nodePlacerPanel = null

/**
 * Flag to prevent re-entrant layout calculations.
 * @type {boolean}
 */
let busy = false

/**
 * Launches the TreeLayoutDemo.
 */
function run(licenseData) {
  License.value = licenseData
  // initialize the graph component
  graphComponent = new GraphComponent('graphComponent')

  // initialize the settings panel and registers a listener which updates the layout if settings were changed
  nodePlacerPanel = new NodePlacerPanel(graphComponent)
  nodePlacerPanel.addChangeListener(() => runLayout(false))

  // initialize interactive behavior and toolbar buttons
  initializesInputModes()
  registerCommands()

  // load a sample graph
  loadGraph()

  showApp(graphComponent)
}

/**
 * Runs a {@link TreeLayout} using the specified {@link ITreeLayoutNodePlacer}s.
 */
async function runLayout(initConfig) {
  if (busy) {
    // there is already a layout calculating do not start another one
    return
  }

  setBusy(true)

  let configuration
  if (!initConfig) {
    // use the current configuration from the panel
    configuration = createGenericConfiguration(graphComponent.graph, nodePlacerPanel)
  } else {
    // create a layout configuration according to the current sample
    switch (document.getElementById('select-sample').value) {
      default:
        configuration = createGenericConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'Default Tree':
        configuration = createDefaultTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'Wide Tree':
        configuration = createWideTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'Category Tree':
        configuration = createCategoryTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'General Graph':
        configuration = createGeneralGraphConfiguration(graphComponent.graph, nodePlacerPanel)
        break
      case 'Large Tree':
        configuration = createLargeTreeConfiguration(graphComponent.graph, nodePlacerPanel)
        break
    }
  }

  // run the layout animated
  await graphComponent.morphLayout(configuration.layout, '0.5s', configuration.layoutData)
  setBusy(false)
}

/**
 * Initializes interactive behavior
 */
function initializesInputModes() {
  // create a new GraphEditorInputMode
  const inputMode = new GraphEditorInputMode({
    // disable label editing on double click, so it won't interfere with toggeling the node's assistant marking
    allowEditLabelOnDoubleClick: false,
    // add a custom CreateEdgeInputMode that will also create the edge's target to keep the tree-structure intact
    createEdgeInputMode: new CreateTreeEdgeInputMode(),
    // disabled clipboard and undo operations
    allowClipboardOperations: false,
    allowUndoOperations: false,
    // forbid node creation and allow only node deletion to maintain the tree-structure
    allowCreateNode: false,
    selectableItems: GraphItemTypes.NODE,
    deletableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NONE
  })
  inputMode.createEdgeInputMode.priority = 45

  // always delete the whole subtree
  inputMode.addDeletingSelectionListener((sender, args) => {
    const selectedNodes = args.selection
    const nodesToDelete = []
    selectedNodes.forEach(selectedNode => {
      collectSubtreeNodes(selectedNode, nodesToDelete)
    })
    nodesToDelete.forEach(node => {
      if (graphComponent.graph.inDegree(node)) {
        args.selection.setSelected(node, true)
      } else {
        // do not delete the root node to be able to build a new tree
        args.selection.setSelected(node, false)
      }
    })
  })
  // update the layout and the settings panel when nodes are deleted
  inputMode.addDeletedSelectionListener(() => runLayout(false))

  // run a layout every time a node/bend is dragged or a node is resized
  inputMode.moveInputMode.addDragFinishedListener(() => runLayout(false))
  inputMode.handleInputMode.addDragFinishedListener(() => runLayout(false))

  // update the settings panel when selection changed to be able to edit its node placer
  inputMode.addMultiSelectionFinishedListener((sender, args) =>
    nodePlacerPanel.onNodeSelectionChanged(args.selection)
  )

  // toggle the assistant marking for the double-clicked node
  inputMode.addItemDoubleClickedListener((sender, args) => {
    if (INode.isInstance(args.item)) {
      const node = args.item
      node.tag.assistant = !node.tag.assistant
      const nodeStyle = node.style.clone()
      if (nodeStyle) {
        nodeStyle.stroke = !node.tag.assistant
          ? null
          : new Stroke({
              fill: 'black',
              thickness: 2,
              dashStyle: DashStyle.DASH
            })
        graphComponent.graph.setStyle(node, nodeStyle)
      }
      runLayout(false)
    }
  })

  // labels may influence the order of child nodes, if they are changed a new layout should be calculated
  inputMode.addLabelAddedListener((sender, args) => {
    if (!isNaN(args.item.text)) {
      runLayout(false)
    }
  })
  inputMode.addLabelTextChangedListener((sender, args) => {
    if (!isNaN(args.item.text)) {
      runLayout(false)
    }
  })

  // update layout and settings panel when an edge was created
  inputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    runLayout(false)
  })

  // assign the input mode to the graph component
  graphComponent.inputMode = inputMode
}

/**
 * Finds all nodes in the subtree rooted by the selected node and collects them in the passed array.
 * @param {INode} selectedNode
 * @param {Array.<INode>} nodesToDelete
 */
function collectSubtreeNodes(selectedNode, nodesToDelete) {
  nodesToDelete.push(selectedNode)

  graphComponent.graph.outEdgesAt(selectedNode).forEach(outEdge => {
    const target = outEdge.targetNode
    collectSubtreeNodes(target, nodesToDelete)
  })
}

/**
 * Reads a tree graph from file
 */
function loadGraph() {
  const graph = graphComponent.graph
  graph.clear()

  // initialize the node and edge default styles, they will be applied to the newly created graph
  graph.nodeDefaults.style = new ShapeNodeStyle({
    shape: ShapeNodeShape.ROUND_RECTANGLE,
    stroke: 'white',
    fill: 'crimson'
  })
  graph.nodeDefaults.size = new Size(60, 30)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    targetArrow: IArrow.TRIANGLE
  })

  // select tree data
  let nodesSource
  const sample = document.getElementById('select-sample').value
  switch (sample) {
    default:
    case 'Default Tree':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'Wide Tree':
      nodesSource = TreeData.DefaultTree.nodesSource
      break
    case 'Category Tree':
      nodesSource = TreeData.CategoryTree.nodesSource
      break
    case 'General Graph':
      nodesSource = TreeData.GeneralGraph.nodesSource
      break
    case 'Large Tree':
      nodesSource = TreeData.LargeTree.nodesSource
      break
  }

  // configure the tree builder
  const builder = new TreeBuilder(graph)
  const rootNodesSource = builder.createRootNodesSource(nodesSource, 'id')
  rootNodesSource.addChildNodesSource(data => data.children, rootNodesSource)

  // create the graph
  builder.buildGraph()

  if (sample === 'General Graph') {
    // add some non-tree edges
    graph.createEdge(graph.nodes.get(1), graph.nodes.get(22))
    graph.createEdge(graph.nodes.get(3), graph.nodes.get(16))
    graph.createEdge(graph.nodes.get(28), graph.nodes.get(26))
  }

  // update the node fill colors according to their layers
  graph.nodes.forEach(node => {
    node.style.fill = NodePlacerPanel.layerFills[node.tag.layer % NodePlacerPanel.layerFills.length]
    if (node.tag.assistant) {
      node.style.stroke = '2px dashed black'
    }
  })

  // apply layout
  runLayout(true)
}

/**
 * Enables/disables interaction.
 * @param {boolean} isBusy
 */
function setBusy(isBusy) {
  busy = isBusy
  graphComponent.inputMode.enabled = !isBusy
}

/**
 * Wires up the GUI.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindChangeListener("select[data-command='SelectSample']", loadGraph)

  const samples = document.getElementById('select-sample')
  const previousSample = document.getElementById('previous-sample')
  const nextSample = document.getElementById('next-sample')
  bindAction("button[data-command='PreviousSample']", () => {
    samples.selectedIndex = Math.max(samples.selectedIndex - 1, 0)
    loadGraph(samples.options[samples.selectedIndex].text)
    previousSample.disabled = samples.selectedIndex === 0
    nextSample.disabled = samples.selectedIndex === samples.options.length - 1
  })
  bindAction("button[data-command='NextSample']", () => {
    samples.selectedIndex = Math.min(samples.selectedIndex + 1, samples.options.length - 1)
    loadGraph(samples.options[samples.selectedIndex].text)
    previousSample.disabled = samples.selectedIndex === 0
    nextSample.disabled = samples.selectedIndex === samples.options.length - 1
  })
}

loadJson().then(run)
