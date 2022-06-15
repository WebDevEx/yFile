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
  Arrow,
  ArrowType,
  BaseClass,
  Cursor,
  Cycle,
  DefaultLabelStyle,
  Enum,
  FilteredGraphWrapper,
  GraphBuilder,
  GraphComponent,
  GraphItemTypes,
  GraphViewerInputMode,
  HashMap,
  HierarchicLayout,
  HierarchicLayoutData,
  HierarchicLayoutEdgeRoutingStyle,
  HierarchicLayoutRoutingStyle,
  IArrow,
  ICommand,
  ICompoundEdit,
  IEdge,
  IEdgeStyle,
  IGraph,
  ILabelModelParameter,
  ILabelStyle,
  IMementoSupport,
  INode,
  INodeStyle,
  Insets,
  InteriorLabelModel,
  InteriorLabelModelPosition,
  LayoutExecutor,
  LayoutMode,
  LayoutOrientation,
  License,
  Matrix,
  PlaceNodesAtBarycenterStage,
  PlaceNodesAtBarycenterStageData,
  Point,
  PolylineEdgeStyle,
  PortAdjustmentPolicy,
  Rect,
  ShapeNodeStyle,
  Size,
  TransitiveClosure,
  TransitiveReduction,
  UndoUnitBase,
  ViewportAnimation
} from 'yfiles'

import GraphData from './resources/yfiles-modules-data.js'
import PackageNodeStyleDecorator from './PackageNodeStyleDecorator.js'
import MagnifyNodeHighlightInstaller from './MagnifyNodeHighlightInstaller.js'
import {
  addClass,
  bindAction,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/**
 * @typedef {Object} NpmPackageInfo
 * @property {String} name
 * @property {String} version
 */

/**
 * The port of the proxy server for the npm package API.
 * @type {string}
 */
const proxyPort = location.protocol !== 'file:' && location.port !== 80 ? location.port : '4242'

/**
 * Maximum number of npm modules to add before resorting to expand-functionality
 * @type {number}
 */
const maxNpmModules = 50

/**
 * The {@link GraphComponent} which contains the {@link IGraph}.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The node style that is applied to all nodes.
 * It provides an icon and buttons to reveal additional dependents/dependencies.
 * @type {INodeStyle}
 */
let defaultNodeStyle = null

/**
 * The node label style that is applied to all labels.
 * It provides a label without background and white text.
 * @type {ILabelStyle}
 */
let nodeLabelStyle = null

/**
 * The parameter for all node labels.
 * It keeps the labels on the right side of the node.
 * @type {ILabelModelParameter}
 */
let nodeLabelParameter = null

/**
 * The edge style that is applied to all original, non-transitive edges in the graph.
 * Normal edges are visualized with a solid black line and arrow.
 * @type {IEdgeStyle}
 */
let normalEdgeStyle = null

/**
 * The edge style that is applied to all edges that were added when calculating the transitive
 * closure. Those edges are visualized with a solid blue line and arrow.
 * @type {IEdgeStyle}
 */
let addedEdgeStyle = null

/**
 * The edge style that is applied to all edges that were removed when calculating the transitive
 * reduction. Those edges are visualized with a dashed grey line and an arrow.
 * @type {IEdgeStyle}
 */
let removedEdgeStyle = null

/**
 * The layout algorithm that is used for every layout calculation in this demo.
 * It is configured in {@link initializeLayout()}.
 * @type {HierarchicLayout}
 */
let layout = null

/**
 * Marks whether or not the demo is currently layouting the graph.
 * During layout, the toolbar is disabled.
 * @type boolean
 */
let layouting = false

/**
 * Changes the toolbar state according to if a layout is running or not.
 * @param {boolean} isLayouting
 */
function setLayouting(isLayouting) {
  if (!busy) {
    // only change toolbar-state when not busy loading npm-packages
    // since there are layout calculations during loading
    setUIDisabled(isLayouting)
  }
  layouting = isLayouting
}

/**
 * Marks whether or not the demo is currently loading npm-packages.
 * When busy, the mouse cursor is changed and the toolbar as well as the input modes are disabled.
 * @type boolean
 */
let busy = false

/**
 * Updates the UI according to whether the demo is busy loading npm-packages.
 * @param {boolean} isBusy
 */
function setBusy(isBusy) {
  setUIDisabled(isBusy)
  setLoadingIndicatorVisibility(isBusy)
  busy = isBusy
}

/**
 * Combo box to select one of the different algorithms.
 * It provides access to transitive reduction, transitive closure and returning to the original
 * graph.
 * @type {HTMLElement}
 */
let algorithmComboBox = null

/**
 * Text box to request the dependency graph for a certain npm-package.
 * It is only available if npm-packages are browsed.
 * @type {HTMLElement}
 */
let packageTextBox = null

/**
 * Combo box to select one of the two samples.
 * There is an dependency graph of the <em>yFiles for HTML</em> modules as well as the possibility
 * to browse npm-packages with their dependencies.
 * @type {HTMLElement}
 */
let samplesComboBox = null

/**
 * Holds all edges that are added when calculating the transitive closure.
 * These edges are removed when the original graph is restored.
 * @type {Array.<IEdge>}
 */
let addedEdges = []

/**
 * Holds all nodes that are added when loading npm-packages and are not part of the layout, yet.
 * If the number of these nodes reaches a certain limit, they are inserted in the layout
 * incrementally.
 * @type {Array.<INode>}
 */
let addedNodes = []

/**
 * Stores all edges that where removed when calculation the transitive reduction in case they
 * should be invisible.
 * @type {Set.<IEdge>}
 */
let removedEdgesSet = null

/**
 * Stores all nodes that are currently visible in the graph.
 * @type {Set.<INode>}
 */
let filteredNodes = null

/**
 * Stores all edges that are currently visible in the graph.
 * @type {Set.<IEdge>}
 */
let filteredEdges = null

/**
 * A filtered graph that only shows the sub-graph that currently of interest.
 * Nodes and edges that should be visible are described by
 * {@link edgePredicate(IEdge)} and
 * {@link edgePredicate(INode)}.
 * @type {FilteredGraphWrapper}
 */
let filteredGraph = null

/**
 * Holds all nodes that should be inserted into the layout incrementally at then next layout run.
 * @type {Array.<INode>}
 */
let incrementalNodes = []

/**
 * Holds all edges that should be inserted into the layout incrementally at then next layout run.
 * @type {Array.<INode>}
 */
let incrementalEdges = []

/**
 * Marks whether or not edges that were removed during transitive reduction are visible.
 * @type {boolean}
 */
let showTransitiveEdges = true

/**
 * Stores all npm-packages that have been visited to be able to reuse those nodes instead of
 * reloading them. This mapper will be cleared when switching samples or loading a new npm-package
 * graph.
 * @type {Map.<string, INode>}
 */
let visitedPackages = null

/**
 * The node whose dependencies are currently shown.
 * This is used for determining if it is necessary to reload the npm-package graph.
 * @type {INode}
 */
let startNode = null

/**
 * The number of dependents in the current graph.
 * @type {number}
 */
let dependentsNo = 0

/**
 * The number of dependencies in the current graph.
 * @type {number}
 */
let dependenciesNo = 0

/**
 * Starts a demo that shows how to use the yFiles transitivity algorithms.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  samplesComboBox = document.getElementById('samplesComboBox')
  algorithmComboBox = document.getElementById('algorithmComboBox')

  // use a filtered graph to have control over which nodes and edges are visible at any time
  filteredGraph = new FilteredGraphWrapper(
    graphComponent.graph,
    nodePredicate.bind(this),
    edgePredicate.bind(this)
  )
  graphComponent.graph = filteredGraph

  // load input module and initialize input
  initializeInputModes()
  initializeStyles()
  initializeLayout()
  initializeGraph()

  loadGraph()

  setLoadingIndicatorVisibility(false)

  registerCommands()

  showApp(graphComponent)
}

/**
 * Registers the JavaScript commands for the GUI elements, typically the
 * tool bar buttons, during the creation of this application.
 */
function registerCommands() {
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindChangeListener(
    "select[data-command='SampleSelectionChanged']",
    onSampleGraphChanged.bind(this)
  )
  bindChangeListener(
    "select[data-command='AlgorithmSelectionChanged']",
    onAlgorithmChanged.bind(this)
  )
  bindAction("button[data-command='LoadDependencies']", loadGraph.bind(this))

  bindAction("button[data-command='RunLayout']", () => {
    applyLayout(false)
  })

  bindAction("input[data-command='ShowTransitiveEdges']", async () => {
    const button = document.getElementById('showTransitiveEdgesButton')
    showTransitiveEdges = button.checked
    if (algorithmComboBox.selectedIndex === 2) {
      const undoEdit = beginUndoEdit('undoShowTransitiveEdges', 'redoShowTransitiveEdges')
      resetGraph()
      applyAlgorithm()
      await applyLayout(true)
      commitUndoEdit(undoEdit)
    }
  })

  graphComponent.inputMode.keyboardInputMode.addCommandBinding(
    ICommand.UNDO,
    () => {
      graphComponent.graph.undoEngine.undo()
    },
    () => graphComponent.graph.undoEngine.canUndo()
  )

  graphComponent.inputMode.keyboardInputMode.addCommandBinding(
    ICommand.REDO,
    () => {
      graphComponent.graph.undoEngine.redo()
    },
    () => graphComponent.graph.undoEngine.canRedo()
  )

  packageTextBox = document.getElementById('packageTextBox')
  packageTextBox.addEventListener('click', packageTextBox.select)
  packageTextBox.addEventListener('input', () => {
    packageTextBox.className = 'default'
  })
  packageTextBox.addEventListener('keydown', event => {
    const key = event.which || event.keyCode
    if (key === 13) {
      loadGraph()
      event.preventDefault()
    }
  })
}

/**
 * Returns enlarged bounds for the given item that correspond to the highlight bounds.
 * @param {INode} item The item whose bounds are enlarged.
 * @return {Rect} The new bounds.
 */
function getEnlargedNodeBounds(item) {
  const nodeBounds = item.layout.toRect()
  const transform = new Matrix()
  const itemCenterX = nodeBounds.x + nodeBounds.width * 0.5
  const itemCenterY = nodeBounds.y + nodeBounds.height * 0.5
  transform.translate(new Point(itemCenterX, itemCenterY))

  const zoom = graphComponent.zoom
  if (zoom < 1) {
    // if the zoom level is below 1, reverse the zoom for this node before enlarging it
    transform.scale(1 / zoom, 1 / zoom)
  }
  transform.scale(1.2, 1.2)
  transform.translate(new Point(-itemCenterX, -itemCenterY))
  return nodeBounds.getTransformed(transform)
}

/**
 * Initializes {@link GraphViewerInputMode} as input mode for this demo.
 */
function initializeInputModes() {
  const mode = new GraphViewerInputMode({
    selectableItems: GraphItemTypes.NONE
  })

  // show enlarged nodes on hover
  mode.itemHoverInputMode.addHoveredItemChangedListener((sender, eventArgs) => {
    const item = eventArgs.item
    const oldItem = eventArgs.oldItem

    const highlightManager = graphComponent.highlightIndicatorManager
    if (item) {
      // add enlarged version of the node as highlight
      highlightManager.addHighlight(item)
      item.tag.highlight = true
    }
    if (oldItem) {
      // remove previous highlight
      highlightManager.removeHighlight(oldItem)
      oldItem.tag.highlight = false
    }
  })
  mode.itemHoverInputMode.hoverItems = GraphItemTypes.NODE
  mode.itemHoverInputMode.discardInvalidItems = false
  mode.itemHoverInputMode.hoverCursor = Cursor.POINTER

  // install custom highlight
  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    new MagnifyNodeHighlightInstaller()
  )

  mode.addItemClickedListener(async (sender, e) => {
    // check if the clicked item is a node or if the loaded graph is yfiles/modules, since this graph has
    // no pending dependencies... in this case, we have to execute the code in addItemSelectedListener.
    if (INode.isInstance(e.item)) {
      e.handled = true

      const item = e.item
      const clickPoint = graphComponent.inputMode.clickInputMode.clickLocation

      // if the node is hovered, we have to use the enlarged bounds of the highlight
      const nodeBounds = getEnlargedNodeBounds(item)
      const existingPackages = new HashMap()

      // check if dependencies' circle was hit
      if (
        item.tag &&
        item.tag.pendingDependencies &&
        clickIsInCircle(nodeBounds, clickPoint, nodeBounds.width)
      ) {
        handlePendingDependencies(item, existingPackages)
      } else if (item !== startNode) {
        const undoEdit = beginUndoEdit('undoChangeStartNode', 'redoChangeStartNode')
        graphComponent.graph.undoEngine.addUnit(new ChangedSetUndoUnit())
        graphComponent.currentItem = item
        filteredGraph.nodes.forEach(node => {
          node.tag.pendingDependencies = false
        })
        await filterGraph(item)
        commitUndoEdit(undoEdit)
      }
    }
  })

  graphComponent.inputMode = mode
}

/**
 * Loads pending dependencies for the given node in case the click-point is located in the
 * according circle.
 * @param {INode} item the node whose dependencies are completed.
 * @param {Map} existingPackages A mapping of existing packages.
 */
async function handlePendingDependencies(item, existingPackages) {
  const undoEdit = beginUndoEdit('undoLoadPendingDependencies', 'redoLoadPendingDependencies')
  graphComponent.graph.undoEngine.addUnit(new ChangedSetUndoUnit())

  filteredGraph.nodes.forEach(node => {
    existingPackages.set(node.labels.get(0).text, node)
    filteredNodes.add(node)
  })
  setBusy(true)
  try {
    await onAddDependencies(item, true)
    addedNodes.forEach(node => {
      filteredNodes.add(node)
      incrementalNodes.push(node)
    })
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
    applyAlgorithm()
    await applyLayout(true)
    commitUndoEdit(undoEdit)
    animateViewPort(item)
    addedNodes = []
  } catch (e) {
    cancelUndoEdit(undoEdit)
  } finally {
    setBusy(false)
  }
}

/**
 * Animates the view port based on the newly inserted nodes.
 * @param {INode} hoveredItem The item that has been currently hovered
 */
function animateViewPort(hoveredItem) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  // we have to calculate the rectangle that includes all the newly inserted nodes plus the node that has been hovered
  // so we first add the hovered node to the addedNodes array
  addedNodes.push(hoveredItem)
  addedNodes.forEach(node => {
    minX = Math.min(minX, node.layout.x)
    minY = Math.min(minY, node.layout.y)
    maxX = Math.max(maxX, node.layout.x + node.layout.width)
    maxY = Math.max(maxY, node.layout.y + node.layout.height)
  })

  if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
    // Enlarge the viewport so that we get an overview of the neighborhood as well
    let rect = new Rect(minX, minY, Math.abs(maxX - minX), Math.abs(maxY - minY))
    rect = rect.getEnlarged(new Insets(100))

    // Animate the transition to the failed element
    const animator = new Animator(graphComponent)
    animator.allowUserInteraction = true
    const viewportAnimation = new ViewportAnimation(graphComponent, rect, '1s')
    animator.animate(viewportAnimation.createEasedAnimation(0, 1))
  }
}

/**
 * Initializes the styles to use for the graph.
 */
function initializeStyles() {
  const shapeNodeStyle = new ShapeNodeStyle({
    shape: 'round_rectangle',
    stroke: 'rgb(102, 153, 204)',
    fill: 'rgb(102, 153, 204)'
  })
  defaultNodeStyle = new PackageNodeStyleDecorator(shapeNodeStyle)

  normalEdgeStyle = new PolylineEdgeStyle({
    stroke: '2px black',
    targetArrow: IArrow.TRIANGLE,
    smoothingLength: 10
  })

  addedEdgeStyle = new PolylineEdgeStyle({
    stroke: '2px rgb(51, 102, 153)',
    targetArrow: new Arrow({
      fill: 'rgb(51, 102, 153)',
      stroke: 'rgb(51, 102, 153)',
      type: ArrowType.TRIANGLE
    }),
    smoothingLength: 10
  })

  removedEdgeStyle = new PolylineEdgeStyle({
    stroke: '2px dashed gray',
    targetArrow: new Arrow({
      fill: 'gray',
      stroke: 'gray',
      type: ArrowType.TRIANGLE
    }),
    smoothingLength: 10
  })

  nodeLabelStyle = new DefaultLabelStyle({
    font: 'Arial',
    textFill: 'white'
  })

  const nodeLabelModel = new InteriorLabelModel({
    insets: 9
  })
  nodeLabelParameter = nodeLabelModel.createParameter(InteriorLabelModelPosition.EAST)
}

/**
 * Initializes the graph defaults.
 */
function initializeGraph() {
  const graph = filteredGraph
  graph.nodeDefaults.style = defaultNodeStyle
  graph.nodeDefaults.size = new Size(80, 30)
  graph.edgeDefaults.style = normalEdgeStyle
  graph.nodeDefaults.labels.style = nodeLabelStyle
  graph.undoEngineEnabled = true
}

/**
 * Initializes the layout algorithms.
 */
function initializeLayout() {
  layout = new HierarchicLayout()
  layout.layoutOrientation = LayoutOrientation.LEFT_TO_RIGHT
  layout.minimumLayerDistance = 0
  layout.nodeToNodeDistance = 20
  layout.backLoopRouting = true
  layout.automaticEdgeGrouping = true
  layout.nodePlacer.barycenterMode = true
  layout.edgeLayoutDescriptor.routingStyle = new HierarchicLayoutRoutingStyle(
    HierarchicLayoutEdgeRoutingStyle.OCTILINEAR
  )
}

/**
 * Loads a new dependency graph according to which sample is selected.
 * This function is also called if a new start package is chosen.
 */
async function loadGraph() {
  filteredGraph.wrappedGraph.clear()
  filteredNodes = null
  filteredEdges = null

  addedEdges = []

  if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
    resetGraph()

    const builder = new GraphBuilder(graphComponent.graph)
    builder.createNodesSource({
      data: GraphData.nodes,
      id: 'id',
      labels: ['label']
    })
    builder.createEdgesSource(GraphData.edges, 'from', 'to')

    const graph = builder.buildGraph()

    graph.nodes.forEach(node => {
      const label = node.labels.first()
      const nodeLayout = new Rect(
        node.layout.x,
        node.layout.y,
        label.layout.width + 50,
        node.layout.height
      )
      graph.setNodeLayout(node, nodeLayout)
      graph.setLabelLayoutParameter(label, nodeLabelParameter)
      node.tag = { highlight: false }
    })

    startNode = getInitialPackage('yfiles')
    graphComponent.currentItem = startNode

    // initialize the values for yfiles/modules, so that we do not count them again
    dependentsNo = 0
    dependenciesNo = filteredGraph.nodes.size - 1

    applyAlgorithm()
    await applyLayout(false)
    graph.undoEngine.clear()
  } else {
    const packageText = packageTextBox.value
    // check for empty package name
    if (packageText.replace(/\s/g, '') === '') {
      packageTextBox.value = 'Invalid Package'
      packageTextBox.className = 'error'
    } else {
      // initialize dependents/dependencies values
      dependentsNo = 0
      dependenciesNo = 0
      filteredNodes = new Set()
      filteredEdges = new Set()
      visitedPackages = new HashMap()
      await updateGraph({ name: packageText, version: 'latest' }, false)
      graphComponent.graph.undoEngine.clear()
    }
  }
}

/**
 * Updates the graph by filling it with nodes that represent npm-packages.
 * The packages are loaded asynchronously from the internet.
 * @param {NpmPackageInfo} pckg - the start package info
 * @param {boolean} incremental <code>true</code> if the layouts should be incremental
 */
async function updateGraph(pckg, incremental) {
  setBusy(true)

  // reset the table with the graph information
  resetTable(pckg.name)

  incrementalNodes = []
  try {
    startNode = createModuleNode(pckg)
    graphComponent.currentItem = startNode
    const startNodeDependencies = await fetchDependencies(pckg)
    await addDependencies(startNode, startNodeDependencies, incremental)
    addedNodes.forEach(node => {
      filteredNodes.add(node)
      incrementalNodes.push(node)
    })
    addedNodes = []
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
    applyAlgorithm()
    await applyLayout(incremental)
    incrementalNodes = []
  } catch (e) {
    const errorMessage = ' - Invalid Package'
    if (packageTextBox.value.indexOf(errorMessage) === -1) {
      packageTextBox.value = pckg.name + errorMessage
      packageTextBox.className = 'error'
    }
  } finally {
    setBusy(false)
  }
}

/**
 * Retrieves the node from where the dependencies unfold, asynchronously.
 * @param {NpmPackageInfo} pckg the package info represented by the start node
 */
function createModuleNode(pckg) {
  let node = visitedPackages.get(pckg.name)
  if (!node) {
    const wrappedGraph = filteredGraph.wrappedGraph
    node = wrappedGraph.createNode({
      tag: {
        highlight: false,
        pendingDependencies: false,
        pkg: pckg
      }
    })
    const label = wrappedGraph.addLabel(node, pckg.name, nodeLabelParameter)
    wrappedGraph.setNodeLayout(node, new Rect(0, 0, label.layout.width + 50, node.layout.height))
    node.tag.highlight = false
    dependenciesNo++
    addedNodes.push(node)
  }
  filteredGraph.nodePredicateChanged(node)
  incrementalNodes.push(node)
  visitedPackages.set(pckg.name, node)

  return node
}

/**
 * Returns the node that represents the given package.
 * @param {string} packageName the name of the package and the label of the node
 * @return {INode}
 */
function getInitialPackage(packageName) {
  let initialPackageNode = null
  filteredGraph.wrappedGraph.nodes.forEach(node => {
    if (packageName === node.labels.get(0).text) {
      initialPackageNode = node
    }
  })
  return initialPackageNode
}

/**
 * Adds nodes for all dependencies asynchronously.
 * @param {INode} pred the predecessor node
 * @param {Array.<NpmPackageInfo>} predDependencies all dependencies of pred
 * @param {boolean} incremental whether or not the layout is applied incrementally
 * @return {Promise}
 */
async function addDependencies(pred, predDependencies, incremental) {
  const next = []
  let pendingDeps = 0
  for (const dependency of predDependencies) {
    if (addedNodes.length + filteredGraph.nodes.size > maxNpmModules) {
      pred.tag.pendingDependencies = true
    } else {
      let node = visitedPackages.get(dependency.name)
      const wrappedGraph = filteredGraph.wrappedGraph
      if (!node) {
        node = createModuleNode(dependency)
        const dependencies = await fetchDependencies(dependency)
        if (dependencies.length > 0) {
          next.push([node, dependencies])
          pendingDeps += dependencies.length
        }
      } else {
        node.tag.pendingDependencies = false
        if (addedNodes.indexOf(node) < 0 && !filteredNodes.has(node)) {
          addedNodes.push(node)
          dependenciesNo++
        }
      }

      if (pred && pred !== node) {
        let edge = getEdge(wrappedGraph, pred, node)
        if (edge === null) {
          edge = wrappedGraph.createEdge(pred, node)
          const cycleResult = new Cycle().run(wrappedGraph)
          if (cycleResult.edges.size > 0) {
            console.log(`removing cyclic edge from ${pred.tag.pkg.name} to ${dependency.name}`)
            wrappedGraph.remove(edge)
          }
        }
        filteredEdges.add(edge)
      }

      await tryLayout(incremental)
    }
  }
  for (const info of next) {
    await addDependencies(info[0], info[1], incremental)
  }
}

/**
 * Returns the edge between the two given nodes in the graph or <code>null</code> if there is none.
 * @param {IGraph} graph the graph to which the edge belongs
 * @param {INode} node1 one incident node to the edge
 * @param {INode} node2 another incident node to the edge
 * @return {IEdge}
 */
function getEdge(graph, node1, node2) {
  const outEdges = graph.outEdgesAt(node1)
  for (const outEdge of outEdges) {
    if (outEdge.targetNode.equals(node2)) {
      return outEdge
    }
  }
  return null
}

/**
 * Unfolds dependencies in the npm-graph that were not loaded because the graph was already large,
 * asynchronously. This function is called when the plus-sign on the right of the node is clicked.
 * @param {INode} pred the node that represents the predecessor
 * @param {boolean} incremental whether or not the layout should be incremental
 * @return {Promise}
 */
async function onAddDependencies(pred, incremental) {
  const promises = filteredGraph.wrappedGraph
    .outEdgesAt(pred)
    .toArray()
    .map(async edge => {
      filteredEdges.add(edge)
      pred.tag.pendingDependencies = false
      const target = edge.targetNode
      if (!filteredNodes.has(target)) {
        filteredNodes.add(target)
        addedNodes.push(target)
      }

      const hasOutEdges = filteredGraph.wrappedGraph.outDegree(target) > 0
      const hasPendingDependencies = target.tag && target.tag.pendingDependencies
      if (hasOutEdges || hasPendingDependencies) {
        target.tag.pendingDependencies = true
        return
      }
      const dependencies = await fetchDependencies(target.tag.pkg)
      target.tag.pendingDependencies =
        Object.keys(dependencies).length > filteredGraph.outDegree(target)
    })
  const dependencies = await fetchDependencies(pred.tag.pkg)
  if (pred.tag) {
    pred.tag.pendingDependencies = false
  }
  promises.push(
    ...dependencies.map(async dependency => {
      let node = visitedPackages.get(dependency.name)
      const wrappedGraph = filteredGraph.wrappedGraph
      if (!node) {
        node = createModuleNode(dependency)
      } else if (addedNodes.indexOf(node) < 0 && !filteredNodes.has(node)) {
        addedNodes.push(node)
        dependenciesNo++
      }
      let edge = getEdge(wrappedGraph, pred, node)
      if (edge === null) {
        edge = wrappedGraph.createEdge(pred, node)
      }
      filteredEdges.add(edge)

      await tryLayout(incremental)

      const dependencies = await fetchDependencies(dependency)
      node.tag.pendingDependencies =
        dependencies.length > filteredGraph.wrappedGraph.outDegree(node)
    })
  )
  return Promise.all(promises)
}

/**
 * Invokes a layout if there are enough new nodes in the graph and no previous layout is running.
 * @param {boolean} incremental whether or not the layout is calculated incrementally
 */
async function tryLayout(incremental) {
  // this method should return a promise so that resolve in method addDependencies is called
  // only if layout is done
  if (!layouting && addedNodes.length > 5) {
    let i = 5
    while (i > 0) {
      const node = addedNodes.shift()
      filteredNodes.add(node)
      incrementalNodes.push(node)
      filteredGraph.nodePredicateChanged(node)
      i--
    }
    await applyLayout(incremental)
  }
}

/**
 * Send a query for the given url that requests data about npm-packages.
 * @param {string} url The url that is used to request data about npm-packages.
 * @return {Promise}
 */
async function requestData(url) {
  const response = await fetch(url)
  if (!response.ok) {
    const text = await response.text()
    const message = text || response.status
    throw new Error(`Failed to load package: ${message}`)
  }
  try {
    return await response.json()
  } catch (e) {
    throw new Error('Failed to parse JSON data')
  }
}

/**
 * @param {object} pckg
 * @return {Promise<object[]>}
 */
async function fetchDependencies(pckg) {
  const url = `http://localhost:${proxyPort}/npm-request?type=dependencies&package=${pckg.name}&version=${pckg.version}`
  let data
  try {
    data = await requestData(url)
  } catch (e) {
    throw new Error(
      'Failed to load NPM Graph. Did you start the Demo Server (see description text)?'
    )
  }
  if (data.error) {
    throw new Error('Failed to parse JSON data')
  }
  return data.dependencies
    ? Object.keys(data.dependencies).map(key => {
        return { name: key, version: data.dependencies[key].replace(/^[\^~]/, '') }
      })
    : []
}

/**
 * Invokes the selected algorithms when another algorithm is chosen in the combo box.
 */
async function onAlgorithmChanged() {
  if (!algorithmComboBox) {
    return
  }

  // only show button to toggle transitive edges when 'Transitive Reduction' is selected
  const transitiveEdgesLabel = document.getElementById('showTransitiveEdgesLabel')
  transitiveEdgesLabel.style.display =
    algorithmComboBox.selectedIndex === 2 ? 'inline-block' : 'none'

  if (incrementalNodes) {
    incrementalNodes = []
  }

  resetGraph()
  applyAlgorithm()
  await applyLayout(true)
  graphComponent.graph.undoEngine.clear()
}

/**
 * Loads the selected sample when the samples are switched in the combo box.
 */
function onSampleGraphChanged() {
  // only show npm-toolbar when 'NPM Graph' is selected
  const npmToolbar = document.getElementById('npm-toolbar')
  npmToolbar.style.display =
    samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE ? 'inline' : 'none'

  // update graph information
  if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
    resetTable('yfiles')
  } else {
    resetTable(packageTextBox.value)
  }

  // load the selected sample graph
  loadGraph()
}

/**
 * Applies the selected algorithm to the graph.
 * Algorithms are chosen using {@link algorithmComboBox}.
 */
function applyAlgorithm() {
  const graph = filteredGraph
  if (graph.nodes.size > 0) {
    switch (algorithmComboBox.selectedIndex) {
      default:
      case AlgorithmName.ORIGINAL_GRAPH:
        break
      case AlgorithmName.TRANSITIVITY_CLOSURE: {
        const transitivityClosure = new TransitiveClosure()
        const transitivityClosureResult = transitivityClosure.run(graph)

        const newEdges = transitivityClosureResult.edgesToAdd
        newEdges.forEach(edge => {
          const newEdge = graph.createEdge(edge.source, edge.target)
          graph.setStyle(newEdge, addedEdgeStyle)

          addedEdges.push(newEdge)
          if (filteredEdges) {
            filteredEdges.add(newEdge)
            filteredGraph.edgePredicateChanged(newEdge)
          }
          incrementalEdges.push(newEdge)
        })
        break
      }
      case AlgorithmName.TRANSITIVITY_REDUCTION: {
        const transitivityReduction = new TransitiveReduction()
        const transitivityReductionResult = transitivityReduction.run(graph)

        if (!removedEdgesSet) {
          removedEdgesSet = new Set()
        }

        const transitiveEdges = transitivityReductionResult.edgesToRemove
        transitiveEdges.forEach(edge => {
          if (showTransitiveEdges) {
            graph.setStyle(edge, removedEdgeStyle)
            incrementalEdges.push(edge)
          } else {
            removedEdgesSet.add(edge)
            filteredGraph.edgePredicateChanged()
          }
        })
        break
      }
    }
  }
}

/**
 * Returns whether or not the given edge should be visible.
 * An edge is visible if it is not removed during transitive reduction and is contained in
 * {@link filteredEdges}.
 * @return {boolean}
 */
function edgePredicate(edge) {
  return (
    (!removedEdgesSet || !removedEdgesSet.has(edge)) && (!filteredEdges || filteredEdges.has(edge))
  )
}

/**
 * Returns whether or not the given node should be visible.
 * A node is visible if it is contains in {@link filteredNodes}.
 * @return {boolean}
 */
function nodePredicate(node) {
  return !filteredNodes || filteredNodes.has(node)
}

/**
 * Filters the graph after selecting a different start node interactively.
 * @param {INode} clickedNode The new start node.
 */
async function filterGraph(clickedNode) {
  resetGraph()
  incrementalNodes = []

  // initialize dependents and dependencies number
  dependentsNo = 0
  dependenciesNo = 0

  // marks the nodes of the current instance of the graph, so that the new nodes if any are marked as incremental
  const existingNodes = new Set(filteredGraph.nodes.toArray())
  const fullGraph = filteredGraph.wrappedGraph

  // map that holds which nodes remain in the filtered graph and which not
  if (filteredNodes) {
    filteredNodes.clear()
  } else {
    filteredNodes = new Set()
  }

  // map that holds which edge remain in the filtered graph and which not
  if (filteredEdges) {
    filteredEdges.clear()
  } else {
    filteredEdges = new Set()
  }

  if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
    startNode = clickedNode

    // take all in-edges and mark the other endpoint as a neighbor of clickedNode
    fullGraph.inEdgesAt(clickedNode).forEach(edge => {
      const oppositeNode = edge.opposite(clickedNode)
      // we have to check if the node is already taken into consideration in the calculation of dependents
      if (!filteredNodes.has(oppositeNode)) {
        filteredNodes.add(oppositeNode)
        dependentsNo++
      }
    })

    filteredNodes.add(clickedNode)
    collectConnectedNodes(clickedNode, fullGraph, true)
    collectConnectedNodes(clickedNode, fullGraph, false)

    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()

    // check if new nodes are inserted in the graph
    if (existingNodes) {
      fullGraph.nodes.forEach(node => {
        if (!existingNodes.has(node)) {
          incrementalNodes.push(node)
        }
      })
    }

    if (algorithmComboBox.selectedIndex !== AlgorithmName.ORIGINAL_GRAPH) {
      applyAlgorithm()
    }
    return applyLayout(true)
  } else {
    const packageNode = graphComponent.currentItem
    filteredNodes.add(packageNode)

    filteredGraph.inEdgesAt(packageNode).forEach(edge => {
      filteredEdges.add(edge)

      const source = edge.sourceNode
      filteredNodes.add(source)
    })

    const visited = []
    const edgeStack = filteredGraph.outEdgesAt(packageNode).toArray()
    while (edgeStack.length > 0) {
      const edge = edgeStack.pop()
      filteredEdges.add(edge)

      const target = edge.targetNode
      filteredNodes.add(target)
      if (visited.indexOf(target) < 0) {
        dependenciesNo++
        visited.push(target)
      }

      filteredGraph.outEdgesAt(target).forEach(outEdge => {
        if (!visited.includes(outEdge.targetNode)) {
          edgeStack.push(outEdge)
        }
      })
    }

    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()

    return updateGraph(packageNode.tag.pkg, true)
  }
}

/**
 * Collects and changes the visible state of the nodes/edges connected to the given node,
 * recursively. Depending on the out-parameter dependents or dependencies are collected.
 * @param {INode} initialNode The node to start collecting of nodes.
 * @param {IGraph} graph The graph.
 * @param {boolean} out whether or not to collect dependents or dependencies.
 */
function collectConnectedNodes(initialNode, graph, out) {
  // recursively collect all children of the successors of the clicked node
  const stack = []
  stack.push(initialNode)
  while (stack.length !== 0) {
    const node = stack.pop()
    const edges = out ? graph.outEdgesAt(node) : graph.inEdgesAt(node)
    edges.forEach(edge => {
      filteredEdges.add(edge)
      const oppositeNode = edge.opposite(node)
      stack.push(oppositeNode)
      // we have to check if the node is already taken into consideration in the calculation of dependencies
      if (!filteredNodes.has(oppositeNode)) {
        filteredNodes.add(oppositeNode)
        if (out) {
          dependenciesNo++
        } else {
          dependentsNo++
        }
      }
    })
  }
}

/**
 * Resets the graph before applying a different algorithm.
 * Previously added edges are deleted and removed edges are reinserted.
 */
function resetGraph() {
  if (addedEdges !== null && addedEdges.length !== 0) {
    addedEdges.forEach(edge => {
      filteredGraph.remove(edge)
    })

    addedEdges = []
  }

  removedEdgesSet = null
  filteredGraph.edgePredicateChanged()

  filteredGraph.edges.forEach(edge => {
    filteredGraph.setStyle(edge, normalEdgeStyle)
  })

  filteredGraph.nodes.forEach(node => {
    node.tag.highlight = false
  })
}

/**
 * Applies the layout to the current graph.
 * @param {boolean} incremental <code>true</code> if an incremental layout is desired,
 *   <code>false</code> otherwise
 */
async function applyLayout(incremental) {
  // if is in layout or the graph has no nodes then return.
  // it is important to check if nodes === 0, since else Exceptions can occur due to asynchronous
  // calls of this function
  if (filteredGraph.nodes.size === 0 || layouting) {
    return
  }
  setLayouting(true)

  // sort nodes by label text
  const nodes = filteredGraph.nodes.toList()
  nodes.sort((node1, node2) => {
    const label1 = node1.labels.get(0).text.toLowerCase()
    const label2 = node2.labels.get(0).text.toLowerCase()

    if (label1 < label2) {
      return -1
    } else if (label1 > label2) {
      return 1
    }
    return 0
  })

  const layoutData = new HierarchicLayoutData()

  if (incremental) {
    layout.layoutMode = LayoutMode.INCREMENTAL
    layoutData.incrementalHints.incrementalLayeringNodes = incrementalNodes.filter(node =>
      filteredGraph.contains(node)
    )
    layoutData.incrementalHints.incrementalSequencingItems = incrementalEdges.filter(node =>
      filteredGraph.contains(node)
    )

    prepareSmoothLayoutAnimation()

    incrementalNodes = []
    incrementalEdges = []
  } else {
    layout.layoutMode = LayoutMode.FROM_SCRATCH
  }

  if (samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE) {
    // create alphabetic sequence constraints
    let previous = nodes.first()
    nodes.forEach(node => {
      if (previous !== node) {
        layoutData.sequenceConstraints.placeBefore(previous, node)
        previous = node
      }
    })
  }
  try {
    await new LayoutExecutor({
      graphComponent,
      layout,
      layoutData,
      duration: '0.5s',
      animateViewport: true,
      portAdjustmentPolicy: PortAdjustmentPolicy.ALWAYS
    }).start()

    // update the graph information with (intermediate) results
    updateGraphInformation(startNode)

    // check where the mouse is located after layout and adjust highlight
    graphComponent.inputMode.itemHoverInputMode.updateHover()
  } catch (error) {
    if (typeof window.reportError === 'function') {
      window.reportError(error)
    } else {
      throw error
    }
  } finally {
    setLayouting(false)
  }
}

/**
 * Places newly inserted nodes at the barycenter of their neighbors to avoid that the nodes fly in
 * from the sides.
 */
function prepareSmoothLayoutAnimation() {
  const graph = graphComponent.graph

  // mark the new nodes and place them between their neighbors
  const layout = new PlaceNodesAtBarycenterStage()
  layout.removeBends = true

  const layoutData = new PlaceNodesAtBarycenterStageData({
    affectedNodes: node => incrementalNodes.includes(node) && filteredGraph.contains(node)
  })

  graph.applyLayout(layout, layoutData)
}

/**
 * Changes the disabled-state of all UI elements in the toolbar.
 */
function setUIDisabled(disabled) {
  graphComponent.inputMode.waitInputMode.waiting = disabled
  samplesComboBox.disabled = disabled
  algorithmComboBox.disabled = disabled
  document.getElementById('showTransitiveEdgesButton').disabled = disabled
  document.getElementById('loadDependenciesButton').disabled = disabled
  document.getElementById('runLayoutButton').disabled = disabled
  document.getElementById('packageTextBox').disabled = disabled
}

/**
 * Checks if the given click-point belongs to one of the circles representing the dependencies of
 * the node.
 * @param {Rect} nodeBounds the enlarged node bounds
 * @param {Point} clickPoint the clicked point
 * @param {number} x the starting x-coordinate for defining the circle
 * @returns {boolean}
 */
function clickIsInCircle(nodeBounds, clickPoint, x) {
  if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
    // there are no pending dependencies in yfiles-modules sample
    return false
  }

  const radius = 10
  const centerX = x + nodeBounds.x
  const centerY = nodeBounds.y + nodeBounds.height * 0.5
  return (
    Math.pow(centerX - clickPoint.x, 2) + Math.pow(centerY - clickPoint.y, 2) <= Math.pow(radius, 2)
  )
}

/**
 * Checks if the nodes of the given list have pending dependencies.
 * @param {INode} packageNode the first node to check
 * @returns {boolean}
 */
function existPendingRelations(packageNode) {
  let pendingRelations = packageNode.tag && packageNode.tag.pendingDependencies

  // if the node itself has pending relations, we do not have to continue searching
  if (pendingRelations) {
    return true
  }

  filteredGraph.nodes.forEach(node => {
    pendingRelations |= node.tag && node.tag.pendingDependencies
  })

  return pendingRelations
}

/**
 * Updates the table when dependencies are loaded.
 * @param {INode} packageNode the start node
 */
function updateGraphInformation(packageNode) {
  const table = document.getElementById('graph-information')
  table.rows[0].cells[1].innerHTML = packageNode.labels.get(0).text

  // remove the dependents row if the graph is not module
  if (samplesComboBox.selectedIndex === SampleName.YFILES_MODULES_SAMPLE) {
    removeClass(table.rows[1], 'row-invisible')
    table.rows[1].cells[1].innerHTML = dependentsNo
  } else {
    addClass(table.rows[1], 'row-invisible')
  }

  // take packageText's dependencies and check if there exist pending dependencies
  const dependencies = dependenciesNo
  // if the graph is modules there exist no pending dependencies
  const existPendingDependencies =
    samplesComboBox.selectedIndex === SampleName.NPM_PACKAGES_SAMPLE
      ? existPendingRelations(packageNode)
      : false
  table.rows[2].cells[1].innerHTML = dependencies + (existPendingDependencies ? '<sup>+</sup>' : '')

  // update number of graph nodes and edges
  table.rows[3].cells[1].innerHTML = filteredGraph.nodes.size
  table.rows[4].cells[1].innerHTML = filteredGraph.edges.size
}

/**
 * Resets the table when the sample graph changes.
 * @param {string} packageName the name of the start package
 */
function resetTable(packageName) {
  const table = document.getElementById('graph-information')
  table.rows[0].cells[1].innerHTML = packageName
  table.rows[1].cells[1].innerHTML = ''
  table.rows[2].cells[1].innerHTML = ''
  table.rows[3].cells[1].innerHTML = ''
  table.rows[4].cells[1].innerHTML = ''
}

/**
 * Displays or hides the loading indicator.
 */
function setLoadingIndicatorVisibility(visible) {
  const loadingIndicator = document.getElementById('loadingIndicator')
  loadingIndicator.style.display = visible ? 'block' : 'none'
}

/**
 * Enum definition for accessing different transitivity algorithms.
 */
const AlgorithmName = Enum({
  ORIGINAL_GRAPH: 0,
  TRANSITIVITY_CLOSURE: 1,
  TRANSITIVITY_REDUCTION: 2
})

/**
 * Enum definition for accessing different samples.
 */
const SampleName = Enum({
  YFILES_MODULES_SAMPLE: 0,
  NPM_PACKAGES_SAMPLE: 1
})

/**
 * Begins an undo edit to encapsulate several changes in one undo/redo steps.
 * @param {string} undoName The undo name.
 * @param {string} redoName The redo name.
 * @return {{compoundEdit: ICompoundEdit, tagEdit: ICompoundEdit}}
 * @see {@link commitUndoEdit}
 * @see {@link cancelUndoEdit}
 */
function beginUndoEdit(undoName, redoName) {
  const compoundEdit = graphComponent.graph.beginEdit(undoName, redoName)
  const tagEdit = graphComponent.graph.beginEdit(
    'undoTags',
    'redoTags',
    filteredGraph.wrappedGraph.nodes,
    () => new TagMementoSupport()
  )

  return {
    compoundEdit,
    tagEdit
  }
}

/**
 * Commits all undo edits contained in the given edit.
 * @param {{compoundEdit: ICompoundEdit, tagEdit: ICompoundEdit}} edit The edit to commit.
 */
function commitUndoEdit(edit) {
  edit.tagEdit.commit()
  edit.compoundEdit.commit()
}

/**
 * Cancels all undo edits contained in the given edit.
 * @param {{compoundEdit: ICompoundEdit, tagEdit: ICompoundEdit}} edit The edit to cancel.
 */
function cancelUndoEdit(edit) {
  edit.tagEdit.cancel()
  edit.compoundEdit.cancel()
}

/**
 * An undo unit that handles the undo/redo of the currentItem and all sets that determine whether
 * or not a node or edge is currently visible (part of the filtered graph).
 */
class ChangedSetUndoUnit extends UndoUnitBase {
  constructor() {
    super('changedSet', 'changedSet')
    this.oldFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
    this.oldFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
    this.oldRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
    this.oldCurrentItem = graphComponent.currentItem
  }

  undo() {
    this.newFilteredNodes = filteredNodes ? new Set(filteredNodes) : null
    this.newFilteredEdges = filteredEdges ? new Set(filteredEdges) : null
    this.newRemovedEdges = removedEdgesSet ? new Set(removedEdgesSet) : null
    this.newCurrentItem = graphComponent.currentItem
    filteredNodes = this.oldFilteredNodes
    filteredEdges = this.oldFilteredEdges
    removedEdgesSet = this.oldRemovedEdges
    graphComponent.currentItem = this.oldCurrentItem
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }

  redo() {
    filteredNodes = this.newFilteredNodes
    filteredEdges = this.newFilteredEdges
    removedEdgesSet = this.newRemovedEdges
    graphComponent.currentItem = this.newCurrentItem
    filteredGraph.nodePredicateChanged()
    filteredGraph.edgePredicateChanged()
  }

  static update(currentSet, array) {
    currentSet.clear()
    array.forEach(item => {
      currentSet.add(item)
    })
  }
}

/**
 * A MementoSupport that will handle the state of the node tags (especially pending dependencies)
 * during undo/redo.
 */
class TagMementoSupport extends BaseClass(IMementoSupport) {
  getState(item) {
    if (INode.isInstance(item)) {
      const tag = item.tag
      return {
        highlight: tag.highlight,
        pendingDependencies: tag.pendingDependencies
      }
    }
    return null
  }

  applyState(item, state) {
    if (INode.isInstance(item)) {
      item.tag = state
    }
  }

  stateEquals(state1, state2) {
    return (
      state1.highlight === state2.highlight &&
      state1.pendingDependencies === state2.pendingDependencies
    )
  }
}

// run the demo
loadJson().then(run)
