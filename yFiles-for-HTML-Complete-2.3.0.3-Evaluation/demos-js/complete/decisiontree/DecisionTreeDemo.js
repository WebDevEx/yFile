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
  DefaultLabelStyle,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLSupport,
  HierarchicLayout,
  HierarchicLayoutData,
  HighlightIndicatorManager,
  HorizontalTextAlignment,
  ICommand,
  INode,
  InteriorStretchLabelModel,
  LayoutExecutor,
  LayoutMode,
  License,
  List,
  MinimumNodeSizeStage,
  NodeStyleDecorationInstaller,
  PopulateItemContextMenuEventArgs,
  ShapeNodeStyle,
  Size,
  StorageLocation,
  TextWrapping,
  VerticalTextAlignment
} from 'yfiles'

import DecisionTree from './DecisionTree.js'
import ContextMenu from '../../utils/ContextMenu.js'
import GroupNodePortCandidateProvider from './GroupNodePortCandidateProvider.js'
import DemoStyles, {
  DemoSerializationListener,
  initDemoStyles
} from '../../resources/demo-styles.js'
import {
  bindAction,
  bindChangeListener,
  bindCommand,
  readGraph,
  showApp,
  addClass,
  hasClass,
  removeClass
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  graphComponent = new GraphComponent('graphComponent')

  // load the input module and initialize the input mode
  initializeInputModes()

  highlightManager = new HighlightIndicatorManager(graphComponent)
  const startNodeHighlightInstaller = new NodeStyleDecorationInstaller({
    nodeStyle: new ShapeNodeStyle({
      fill: null,
      stroke: '5px rgb(0, 153, 51)'
    }),
    zoomPolicy: 'world-coordinates',
    margins: 1.5
  })
  graphComponent.graph.decorator.nodeDecorator.highlightDecorator.setFactory(
    node => node === rootNode,
    node => startNodeHighlightInstaller
  )

  // initialize the context menu
  configureContextMenu()

  // initialize the graph
  initializeGraph()

  // enable GraphML support
  enableGraphML()
  // add the sample graphs
  ;['cars', 'what-to-do', 'quiz'].forEach(graph => {
    const option = document.createElement('option')
    option.text = graph
    option.value = graph
    graphChooserBox.add(option)
  })
  setTimeout(async () => {
    const sample = await readSampleGraph()
    showDecisionTree(sample)
  }, 500)

  registerCommands()

  showApp(graphComponent)
}

/** @type {GraphComponent} */
let graphComponent = null

/** @type {GraphMLSupport} */
let graphMLSupport = null

/** @type {HTMLSelectElement} */
const graphChooserBox = document.querySelector("select[data-command='SelectedFileChanged']")
/** @type {HTMLButtonElement} */
const nextButton = document.querySelector("button[data-command='NextFile']")
/** @type {HTMLButtonElement} */
const previousButton = document.querySelector("button[data-command='PreviousFile']")

const showDecisionTreeButton = document.getElementById('showDecisionTreeButton')
const editDecisionTreeButton = document.getElementById('editDecisionTreeButton')

let decisionTree = null

let rootNode = null

let highlightManager = null

/**
 * Initializes the graph instance, setting default styles
 * and creating a small sample graph.
 */
function initializeGraph() {
  // Assign the default demo styles
  const graph = graphComponent.graph
  initDemoStyles(graph)

  // create a new style that uses the specified svg snippet as a template for the node.
  graph.nodeDefaults.size = new Size(146, 35)
  graph.nodeDefaults.shareStyleInstance = false

  // and a style for the labels
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    wrapping: TextWrapping.CHARACTER_ELLIPSIS,
    verticalTextAlignment: VerticalTextAlignment.CENTER,
    horizontalTextAlignment: HorizontalTextAlignment.CENTER
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.CENTER

  graph.decorator.nodeDecorator.portCandidateProviderDecorator.setFactory(
    node => graph.isGroupNode(node),
    node => new GroupNodePortCandidateProvider(node)
  )

  graphComponent.fitGraphBounds()
}

/**
 * Creates an editor mode and registers it as the
 * {@link CanvasComponent#inputMode}.
 */
function initializeInputModes() {
  // Create an editor input mode
  const graphEditorInputMode = new GraphEditorInputMode()
  graphEditorInputMode.allowGroupingOperations = true

  // refresh the graph layout after an edge has been created
  graphEditorInputMode.createEdgeInputMode.addEdgeCreatedListener((sender, args) => {
    runIncrementalLayout(List.fromArray([args.item.sourceNode, args.item.targetNode]))
  })

  // add listeners for the insertion/deletion of nodes to enable the button for returning to the decision tree
  graphEditorInputMode.addDeletedSelectionListener(updateShowDecisionTreeButton)
  graphEditorInputMode.addNodeCreatedListener(updateShowDecisionTreeButton)

  graphComponent.inputMode = graphEditorInputMode
}

/**
 * Initializes the context menu.
 */
function configureContextMenu() {
  const inputMode = graphComponent.inputMode

  // Create a context menu. In this demo, we use our sample context menu implementation but you can use any other
  // context menu widget as well. See the Context Menu demo for more details about working with context menus.
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, location => {
    if (inputMode.contextMenuInputMode.shouldOpenMenu(graphComponent.toWorldFromPage(location))) {
      contextMenu.show(location)
    }
  })

  // Add and event listener that populates the context menu according to the hit elements, or cancels showing a menu.
  // This PopulateItemContextMenu is fired when calling the ContextMenuInputMode.shouldOpenMenu method above.
  inputMode.addPopulateItemContextMenuListener((sender, args) =>
    populateContextMenu(contextMenu, args)
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener(() => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = () => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Populates the context menu based on the item the mouse hovers over.
 * @param {object} contextMenu The context menu.
 * @param {PopulateItemContextMenuEventArgs} args The event args.
 */
function populateContextMenu(contextMenu, args) {
  contextMenu.clearItems()

  const node = INode.isInstance(args.item) ? args.item : null

  if (!node || graphComponent.graph.isGroupNode(node)) {
    args.showMenu = false
    return
  }

  args.showMenu = true
  // If the cursor is over a node select it
  updateSelection(node)

  // Create the context menu items
  if (graphComponent.selection.selectedNodes.size > 0) {
    contextMenu.addMenuItem('Set as root node', () => setAsRootNode(args.item))
  } else {
    // no node has been hit
    contextMenu.addMenuItem('Clear root node', () => setAsRootNode(null))
  }
}

function setAsRootNode(node) {
  rootNode = node
  highlightManager.clearHighlights()
  if (node) {
    highlightManager.addHighlight(node)
  }
}

/**
 * Helper method that updates the node selection state when the context menu is opened on a node.
 * @param {INode} node The node or <code>null</code>.
 */
function updateSelection(node) {
  if (node === null) {
    // clear the whole selection
    graphComponent.selection.clear()
  } else if (!graphComponent.selection.selectedNodes.isSelected(node)) {
    // no - clear the remaining selection
    graphComponent.selection.clear()
    // and select the node
    graphComponent.selection.selectedNodes.setSelected(node, true)
    // also update the current item
    graphComponent.currentItem = node
  }
}

/**
 * Indicates whether a layout is currently in calculation
 * @type {boolean}
 */
let runningLayout = false

async function runLayout(animated) {
  const layout = new HierarchicLayout({
    backLoopRouting: true
  })
  layout.nodePlacer.barycenterMode = false

  if (!runningLayout) {
    setRunningLayout(true)
    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout: new MinimumNodeSizeStage(layout),
      duration: animated ? '0.3s' : 0,
      animateViewport: true
    })
    try {
      await layoutExecutor.start()
    } catch (error) {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    } finally {
      setRunningLayout(false)
    }
  }
}

async function runIncrementalLayout(incrementalNodes) {
  const layout = new HierarchicLayout({
    layoutMode: LayoutMode.INCREMENTAL,
    backLoopRouting: true
  })
  layout.nodePlacer.barycenterMode = false

  if (!runningLayout) {
    setRunningLayout(true)

    // configure the incremental hints
    const layoutData = new HierarchicLayoutData({
      incrementalHints: { incrementalLayeringNodes: incrementalNodes }
    })

    const layoutExecutor = new LayoutExecutor({
      graphComponent,
      layout,
      layoutData,
      duration: '0.3s',
      animateViewport: true
    })
    try {
      await layoutExecutor.start()
    } catch (error) {
      if (typeof window.reportError === 'function') {
        window.reportError(error)
      } else {
        throw error
      }
    } finally {
      setRunningLayout(false)
    }
  }
}

/**
 * Displays the decision tree component for the current graph
 */
function showDecisionTree() {
  if (showDecisionTreeButton.disabled) {
    return
  }

  if (decisionTree) {
    // dispose the old decision tree
    decisionTree.dispose()
    decisionTree = null
  }
  try {
    // create a new decision tree with the current graph and display it in the DOM
    decisionTree = new DecisionTree(
      graphComponent.graph,
      rootNode,
      document.getElementById('decisionTree'),
      setRunningLayout
    )
    document.getElementById('graphComponent').style.visibility = 'hidden'
    document.getElementById('decisionTree').style.visibility = 'visible'
    document.querySelector('#toolbar-decisiontree').style.display = 'block'
    document.querySelector('#toolbar-editor').style.display = 'none'
    showDecisionTreeButton.style.display = 'none'
    editDecisionTreeButton.style.display = 'block'
  } catch (e) {
    alert(
      'No suitable root node found. The root node is a node with no incoming edges, if not specified explicitly.'
    )
  }
}

/**
 * Closes the decision tree component and displays the complete graph
 */
function editDecisionTree() {
  if (decisionTree) {
    // dispose the old decision tree
    decisionTree.dispose()
    decisionTree = null
  }
  document.getElementById('graphComponent').style.visibility = 'visible'
  document.getElementById('decisionTree').style.visibility = 'hidden'
  document.querySelector('#toolbar-decisiontree').style.display = 'none'
  document.querySelector('#toolbar-editor').style.display = 'block'
  showDecisionTreeButton.style.display = 'block'
  editDecisionTreeButton.style.display = 'none'
  graphComponent.fitGraphBounds()
}

function registerCommands() {
  bindAction("#toolbar-editor button[data-command='New']", () => {
    setAsRootNode(null)
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindCommand("#toolbar-editor button[data-command='Open']", ICommand.OPEN, graphComponent, null)
  bindCommand("#toolbar-editor button[data-command='Save']", ICommand.SAVE, graphComponent, null)

  bindCommand(
    "#toolbar-editor button[data-command='ZoomIn']",
    ICommand.INCREASE_ZOOM,
    graphComponent,
    null
  )
  bindCommand(
    "#toolbar-editor button[data-command='ZoomOut']",
    ICommand.DECREASE_ZOOM,
    graphComponent,
    null
  )
  bindCommand(
    "#toolbar-editor button[data-command='FitContent']",
    ICommand.FIT_GRAPH_BOUNDS,
    graphComponent,
    null
  )
  bindCommand(
    "#toolbar-editor button[data-command='ZoomOriginal']",
    ICommand.ZOOM,
    graphComponent,
    1.0
  )

  bindAction("#toolbar-editor button[data-command='Layout']", () => {
    runLayout(true)
  })

  // use dynamic actions to check if there is a decisionTree component
  bindAction("#toolbar-decisiontree button[data-command='ZoomIn']", () => {
    if (decisionTree) {
      ICommand.INCREASE_ZOOM.execute(null, decisionTree.graphComponent)
    }
  })
  bindAction("#toolbar-decisiontree button[data-command='ZoomOut']", () => {
    if (decisionTree) {
      ICommand.DECREASE_ZOOM.execute(null, decisionTree.graphComponent)
    }
  })
  bindAction("#toolbar-decisiontree button[data-command='FitContent']", () => {
    if (decisionTree) {
      ICommand.FIT_GRAPH_BOUNDS.execute(null, decisionTree.graphComponent)
    }
  })
  bindAction("#toolbar-decisiontree button[data-command='ZoomOriginal']", () => {
    if (decisionTree) {
      ICommand.ZOOM.execute(1, decisionTree.graphComponent)
    }
  })
  bindAction("#toolbar-decisiontree button[data-command='PreviousFile']", onPreviousButtonClicked)
  bindAction("#toolbar-decisiontree button[data-command='NextFile']", onNextButtonClicked)
  bindChangeListener(
    "#toolbar-decisiontree select[data-command='SelectedFileChanged']",
    async () => {
      setAsRootNode(null)
      const sample = await readSampleGraph()
      showDecisionTree(sample)
    }
  )
  bindAction("#toolbar-decisiontree button[data-command='Restart']", showDecisionTree)

  bindAction("*[data-command='ShowDecisionTree']", showDecisionTree)
  bindAction("*[data-command='EditDecisionTree']", editDecisionTree)
}

/**
 * Enables loading the graph to GraphML.
 */
function enableGraphML() {
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })

  // enable serialization of the demo styles - without a namespace mapping, serialization will fail
  gs.graphMLIOHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/yFilesHTML/demos/FlatDemoStyle/1.0',
    DemoStyles
  )
  gs.graphMLIOHandler.addHandleSerializationListener(DemoSerializationListener)
  gs.graphMLIOHandler.addParsedListener(() => {
    updateShowDecisionTreeButton()
  })
  graphMLSupport = gs
}

/**
 * Updates the previous/next button states.
 */
function updatePrevNextButtons() {
  nextButton.disabled = graphChooserBox.selectedIndex >= graphChooserBox.length - 1
  previousButton.disabled = graphChooserBox.selectedIndex <= 0
}

function setRunningLayout(running) {
  runningLayout = running
  if (running) {
    nextButton.disabled = running
    previousButton.disabled = running
  } else {
    updatePrevNextButtons()
  }
  graphChooserBox.disabled = running
}

/**
 * Switches to the previous graph.
 */
async function onPreviousButtonClicked() {
  graphChooserBox.selectedIndex--
  setAsRootNode(null)
  const sample = await readSampleGraph()
  showDecisionTree(sample)
}

/**
 * Switches to the next graph.
 */
async function onNextButtonClicked() {
  graphChooserBox.selectedIndex++
  setAsRootNode(null)
  const sample = await readSampleGraph()
  showDecisionTree(sample)
}

/**
 * Enables/disables the button to show the decision tree.
 * The button gets disabled if the graph is empty or just has group nodes in it.
 * @yjs:keep=contains
 */
function updateShowDecisionTreeButton() {
  const graph = graphComponent.graph
  if (graph.nodes.find(node => !graph.isGroupNode(node))) {
    if (hasClass(showDecisionTreeButton, 'disabled')) {
      removeClass(showDecisionTreeButton, 'disabled')
      showDecisionTreeButton.disabled = false
      showDecisionTreeButton.title = 'Show Decision Tree'
    }
  } else {
    if (!showDecisionTreeButton.classList.contains('disabled')) {
      addClass(showDecisionTreeButton, 'disabled')
      showDecisionTreeButton.disabled = true
      showDecisionTreeButton.title = 'Graph is Empty'
    }
  }
}

/**
 * Helper method that reads the currently selected graphml from the combobox.
 * @return {Promise} A promise that is resolved when the graph is parsed.
 */
async function readSampleGraph() {
  // Disable navigation buttons while graph is loaded
  nextButton.disabled = true
  previousButton.disabled = true

  // first derive the file name
  const selectedItem = graphChooserBox.options[graphChooserBox.selectedIndex].value
  const fileName = `resources/${selectedItem}.graphml`
  // then load the graph
  const graph = await readGraph(graphMLSupport.graphMLIOHandler, graphComponent.graph, fileName)
  // when done - fit the bounds
  ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  // re-enable navigation buttons
  updatePrevNextButtons()
  return graph
}

// run the demo
loadJson().then(run)
