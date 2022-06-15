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
  ConnectedComponents,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  HighlightIndicatorManager,
  ICommand,
  IEdge,
  IModelItem,
  INode,
  Insets,
  Key,
  License,
  List,
  Mapper,
  NodeStyleDecorationInstaller,
  OrganicLayout,
  Rect,
  ShapeNodeStyle,
  Size,
  StyleDecorationZoomPolicy,
  ViewportAnimation
} from 'yfiles'

import FraudDetectionView from './FraudDetectionView.js'
import InteractiveLayout from './InteractiveLayout.js'
import { CanvasEdgeStyle, FraudHighlightManager, IconNodeStyle } from './FraudDetectionStyles.js'
import InsuranceFraudData from './resources/InsuranceFraudData.js'
import {
  addClass,
  bindChangeListener,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import BankFraudData from './resources/BankFraudData.js'
import FraudDetection from './FraudDetection.js'
import NodePopup from './NodePopup.js'
import TimelineComponent from './TimelineComponent.js'
import loadJson from '../../resources/load-json.js'

/**
 * The main graph component that displays the graph.
 * @type {GraphComponent}
 */
let graphComponent = null

/**
 * The timeline component that displays the timeline for the graph.
 * @type {TimelineComponent}
 */
let timelineComponent = null

/**
 * The interactive layout.
 * @type {InteractiveLayout}
 */
let layout = null

/**
 * The fraud detection.
 * @type {FraudDetection}
 */
let fraudDetection = null

/**
 * The popup which displays additional information for a node.
 * @type {NodePopup}
 */
let nodePopup = null

/**
 * Flag to indicate whether or not the UI is busy when loading a graph.
 * @type {boolean}
 */
let busy = false

/**
 * The fraud detection view.
 * @type {FraudDetectionView}
 */
let fraudDetectionView = null

/**
 * Holds the component's index to which each node belongs.
 * @type {Mapper}
 */
const node2Component = new Mapper()

/**
 * Maps each component with the list of nodes that this component contains.
 * @type {Mapper}
 */
const component2Nodes = new Mapper()

/**
 * Holds the components that contain nodes marked as fraud.
 */
const visibleFraudComponents = []

/**
 * Holds the current fraud component that is being investigated.
 * @type {number}
 */
let currentFraudComponent = -1

/**
 * Runs the zoom animations invoked by ALT key.
 * @type {Animator}
 */
let zoomAnimator = null

/**
 * Holds the manager responsible for the highlighting of the fraud components.
 * @type {HighlightIndicatorManager}
 */
let fraudHighlightManager = null

/**
 * Starts a demo which shows fraud detection on a graph with changing time-frames. Since the nodes
 * have different timestamps (defined in their tag object), they will only appear in some
 * time-frames. Time-frames are chosen using a timeline component.
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  timelineComponent = new TimelineComponent('timelineComponent', graphComponent)
  nodePopup = new NodePopup(graphComponent, 'mainGraphPopup')
  document.getElementById('sampleSelect').selectedIndex = 0

  initializeTimelineComponent()
  initializeGraphComponent()
  initializeGraph()

  fraudDetection = new FraudDetection(graphComponent)
  loadSampleGraph(BankFraudData)

  registerCommands()

  showApp(graphComponent)
}

/**
 * Binds the UI elements in the toolbar to actions.
 */
function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)

  const bankFraudDescription = document.getElementById('bank-fraud-detection')
  const insuranceFraudDescription = document.getElementById('insurance-fraud-detection')
  bindChangeListener("select[data-command='SampleSelectionChanged']", value => {
    nodePopup.updatePopup(null)
    // if a fraud detection view is open, close it
    if (fraudDetectionView) {
      fraudDetectionView.close()
      closeFraudDetectionView()
    }
    if (value === 'bank-fraud') {
      bankFraudDescription.removeAttribute('hidden')
      insuranceFraudDescription.setAttribute('hidden', 'hidden')
      loadSampleGraph(BankFraudData)
    } else {
      bankFraudDescription.setAttribute('hidden', 'hidden')
      insuranceFraudDescription.removeAttribute('hidden')
      loadSampleGraph(InsuranceFraudData)
    }
  })
}

/**
 * Initializes the main graph component and its interactive behavior.
 */
function initializeGraphComponent() {
  const inputMode = new GraphEditorInputMode({
    allowCreateNode: false,
    allowCreateEdge: false,
    allowCreateBend: false,
    allowDuplicate: false,
    allowGroupingOperations: false,
    allowClipboardOperations: false,
    allowUndoOperations: false,
    allowEditLabelOnDoubleClick: false,
    clickableItems: GraphItemTypes.NODE | GraphItemTypes.EDGE,
    selectableItems: GraphItemTypes.NODE,
    focusableItems: GraphItemTypes.NONE,
    showHandleItems: GraphItemTypes.NONE,
    deletableItems: GraphItemTypes.NONE,
    clickHitTestOrder: [GraphItemTypes.NODE, GraphItemTypes.EDGE]
  })
  inputMode.moveInputMode.enabled = false
  inputMode.marqueeSelectionInputMode.enabled = false

  // show popup on right click
  inputMode.addItemRightClickedListener((sender, event) => {
    if (!busy && INode.isInstance(event.item)) {
      nodePopup.updatePopup(event.item)
      event.handled = true
    }
  })

  // open fraud detection view on left click
  inputMode.addItemLeftClickedListener((sender, event) => {
    const item = event.item
    if (event.item.tag.fraud) {
      const componentIndex = INode.isInstance(item)
        ? node2Component.get(item)
        : node2Component.get(item.sourceNode)
      onFraudWarning(componentIndex)
    }
  })

  // hide popup on canvas click
  inputMode.addCanvasClickedListener(() => {
    if (!busy) {
      nodePopup.updatePopup(null)
    }
  })

  // add input mode to be able to move non-selected nodes
  const moveUnselectedInputMode = inputMode.moveUnselectedInputMode
  moveUnselectedInputMode.enabled = true
  moveUnselectedInputMode.addDragStartedListener((sender, evt) => {
    nodePopup.updatePopup(null)
    if (!busy) {
      layout.onDragStarted(sender.affectedItems)
    }
  })
  moveUnselectedInputMode.addDraggedListener(() => {
    if (!busy) {
      layout.onDragged()
    }
  })
  moveUnselectedInputMode.addDragCanceledListener(() => {
    if (!busy) {
      layout.onDragFinished()
    }
  })
  moveUnselectedInputMode.addDragFinishedListener(() => {
    if (!busy) {
      layout.onDragFinished()
    }
  })

  // add item hover input mode to highlight nodes on hover
  const graphItemHoverInputMode = inputMode.itemHoverInputMode
  graphItemHoverInputMode.hoverItems = GraphItemTypes.NODE | GraphItemTypes.EDGE
  graphItemHoverInputMode.discardInvalidItems = false
  graphItemHoverInputMode.addHoveredItemChangedListener((sender, event) => {
    if (!busy) {
      updateHighlights(event.item, event.oldItem)
    }
  })

  // add listener to react to selection changes
  graphComponent.selection.addItemSelectionChangedListener(() => {
    if (!busy) {
      timelineComponent.updateSelection(graphComponent.selection.selectedNodes)
    }
  })

  // register a listener so that structure updates are handled automatically
  const graph = timelineComponent.filteredGraph
  graph.addNodeCreatedListener((sender, event) => {
    if (busy) {
      return
    }

    const node = event.item
    setInitialCoordinates(node)

    if (layout) {
      layout.onNodeCreated(node)
    }
  })

  graph.addNodeRemovedListener((sender, event) => {
    if (busy) {
      return
    }

    const node = event.item
    if (layout) {
      layout.onNodeRemoved(node)
    }

    // if the node is removed, remove the highlights
    graphComponent.highlightIndicatorManager.removeHighlight(node)

    if (node.tag.fraud) {
      // if the node is removed, remove the highlights
      const componentIndex = node2Component.get(node)
      if (componentIndex === currentFraudComponent) {
        fraudHighlightManager.clearHighlights()
      }
    }
  })

  graph.addEdgeCreatedListener((sender, event) => {
    if (busy) {
      return
    }

    if (layout) {
      layout.onEdgeCreated(event.item)
    }
  })

  graph.addEdgeRemovedListener((sender, event) => {
    if (busy) {
      return
    }

    const edge = event.item
    if (layout) {
      layout.onEdgeRemoved(edge)
    }

    if (edge.tag.fraud) {
      // if the node is removed, remove the highlights
      const componentIndex = node2Component.get(edge.sourceNode)
      if (componentIndex === currentFraudComponent) {
        fraudHighlightManager.clearHighlights()
      }
    }
  })

  graphComponent.addKeyUpListener((sender, evt) => {
    // if the SHIFT key is released, zoom to the current mouse location
    if (evt.key === Key.SHIFT) {
      if (zoomAnimator) {
        zoomAnimator.stop()
        zoomAnimator = null
      }

      // calculate the zoom rectangle which has the current mouse location as center
      const zoomRect = new Rect(
        graphComponent.lastEventLocation.x - 300,
        graphComponent.lastEventLocation.y - 300,
        600,
        600
      )
      const viewportAnimation = new ViewportAnimation(graphComponent, zoomRect, '1s')
      const animator = new Animator(graphComponent)
      animator.animate(viewportAnimation.createEasedAnimation(0, 1))
    }
  })

  graphComponent.addKeyDownListener((sender, evt) => {
    // if the SHIFT key is pressed, zoom out
    if (evt.key === Key.SHIFT) {
      if (!zoomAnimator) {
        zoomAnimator = new Animator(graphComponent)
        zoomAnimator.allowUserInteraction = true
        let zoom = graphComponent.zoom

        zoomAnimator.animate(() => {
          const newZoom = Math.max(zoom - 0.1, 0.1)
          if (newZoom > 0.2) {
            graphComponent.zoom = newZoom
            zoom = newZoom
          }
        }, Number.POSITIVE_INFINITY)
      }
    }
  })

  graphComponent.inputMode = inputMode
}

/**
 * Sets coordinates for the node in case there already are visible nodes connected.
 * @param {INode} node
 */
function setInitialCoordinates(node) {
  const visited = new Set()
  const stack = [node]
  let coordinates = null
  while (stack.length > 0) {
    const stackNode = stack.pop()
    if (!visited.has(stackNode)) {
      // eslint-disable-next-line no-loop-func
      timelineComponent.filteredGraph.wrappedGraph.edgesAt(stackNode).forEach(edge => {
        const opposite = edge.opposite(stackNode)
        if (graphComponent.graph.contains(opposite)) {
          coordinates = opposite.layout.center
        } else {
          stack.push(opposite)
        }
      })
      visited.add(stackNode)
    }

    if (coordinates !== null) {
      graphComponent.graph.setNodeCenter(node, coordinates)
      stack.length = 0
    } else {
      graphComponent.graph.setNodeCenter(node, graphComponent.contentRect.center)
      stack.length = 0
    }
  }
}

/**
 * Initializes the timeline component.
 */
function initializeTimelineComponent() {
  timelineComponent.addHighlightChangedListener(nodes => {
    const highlightManager = graphComponent.highlightIndicatorManager
    highlightManager.clearHighlights()
    if (nodes.length > 0) {
      nodes.forEach(node => {
        if (graphComponent.graph.contains(node)) {
          highlightManager.addHighlight(node)
        }
      })
    }
  })
  timelineComponent.addSelectionChangedListener(nodes => {
    graphComponent.selection.clear()
    if (nodes.length > 0) {
      let minX = Number.POSITIVE_INFINITY
      let maxX = Number.NEGATIVE_INFINITY
      let minY = Number.POSITIVE_INFINITY
      let maxY = Number.NEGATIVE_INFINITY
      nodes.forEach(node => {
        if (graphComponent.graph.contains(node)) {
          graphComponent.selection.setSelected(node, true)
          const nodeLayout = node.layout
          minX = Math.min(minX, nodeLayout.x)
          maxX = Math.max(maxX, nodeLayout.maxX)
          minY = Math.min(minY, nodeLayout.y)
          maxY = Math.max(maxY, nodeLayout.maxY)
        }
      })
      if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
        graphComponent.ensureVisible(new Rect(minX, minY, maxX - minX, maxY - minY))
      }
    }
  })
  timelineComponent.addTimeFrameChangedListener(() => {
    detectFraud()
  })
}

/**
 * Highlights the fraud component.
 * @param {number} componentIndex The component index
 */
function highlightFraudComponent(componentIndex) {
  currentFraudComponent = componentIndex
  const visitedEdges = new Set()
  component2Nodes.get(componentIndex).forEach(node => {
    graphComponent.graph.inEdgesAt(node).forEach(edge => {
      if (edge.tag.fraud && !visitedEdges.has(edge)) {
        fraudHighlightManager.addHighlight(edge)
        visitedEdges.add(edge)
        fraudHighlightManager.addHighlight(edge.sourceNode)
        fraudHighlightManager.addHighlight(edge.targetNode)

        graphComponent.highlightIndicatorManager.addHighlight(edge.sourceNode)
        graphComponent.highlightIndicatorManager.addHighlight(edge.targetNode)
      }
    })
  })
}

/**
 * Update the highlight for the current item.
 * @param {IModelItem} item The current item
 * @param {IModelItem} oldItem The old item
 */
function updateHighlights(item, oldItem) {
  const highlightManager = graphComponent.highlightIndicatorManager
  fraudHighlightManager.clearHighlights()
  highlightManager.clearHighlights()
  if (item) {
    if (INode.isInstance(item)) {
      // hover also the warning button
      const componentIdx = node2Component.get(item)
      const warningButton = document.getElementById(componentIdx)
      if (warningButton) {
        addClass(warningButton, 'hover')
      }
      highlightManager.addHighlight(item)
      if (item.tag.fraud) {
        const componentIndex = node2Component.get(item)
        highlightFraudComponent(componentIndex)
      }
    } else if (IEdge.isInstance(item) && item.tag.fraud) {
      // change the cursor to pointer
      addClass(graphComponent.div, 'customCursor')
      const componentIndex = node2Component.get(item.sourceNode)
      highlightFraudComponent(componentIndex)
    }
  } else {
    currentFraudComponent = -1
  }

  if (oldItem) {
    if (INode.isInstance(oldItem)) {
      // remove hover from the warning button
      const componentIdx = node2Component.get(oldItem)
      const warningButton = document.getElementById(componentIdx)
      // add hover to button
      if (warningButton) {
        removeClass(warningButton, 'hover')
      }
    } else if (IEdge.isInstance(oldItem)) {
      // change the cursor to the default cursor of the itemHoverInputMode
      removeClass(graphComponent.div, 'customCursor')
    }
  }

  timelineComponent.updateHighlight(item)
}

/**
 * Initializes the graph with default styles and decorators for highlights and selections.
 */
function initializeGraph() {
  // default node style
  const graph = timelineComponent.filteredGraph
  graph.nodeDefaults.style = new IconNodeStyle()
  graph.nodeDefaults.size = new Size(30, 30)

  // default edge style
  graph.edgeDefaults.style = new CanvasEdgeStyle()

  // highlight node style
  graph.decorator.nodeDecorator.highlightDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        fill: 'transparent',
        stroke: '3px slateblue',
        shape: 'ellipse'
      }),
      zoomPolicy: StyleDecorationZoomPolicy.MIXED,
      margins: 2
    })
  )

  // selection node style
  graph.decorator.nodeDecorator.selectionDecorator.setImplementation(
    new NodeStyleDecorationInstaller({
      nodeStyle: new ShapeNodeStyle({
        fill: 'transparent',
        stroke: '3px darkblue',
        shape: 'ellipse'
      }),
      margins: 2,
      zoomPolicy: StyleDecorationZoomPolicy.MIXED
    })
  )

  // no focus indication
  graph.decorator.nodeDecorator.focusIndicatorDecorator.hideImplementation()

  // initialize the fraud highlight manager
  fraudHighlightManager = new FraudHighlightManager(graphComponent)
}

/**
 * Loads a graph from the given JSON data.
 * @param {object} fraudData The JSON data from which the graph is retrieved.
 */
function loadSampleGraph(fraudData) {
  setBusy(true)
  if (layout) {
    layout.stopLayout()
  }

  timelineComponent.removeTimelineComponent()

  graphComponent.graph.clear()

  // execute the actual loading with a timeout to give the UI a chance to update
  setTimeout(() => {
    const defaultNodeSize = timelineComponent.filteredGraph.wrappedGraph.nodeDefaults.size
    timelineComponent.filteredGraph.wrappedGraph.clear()
    const builder = new GraphBuilder(timelineComponent.filteredGraph.wrappedGraph)
    builder.createNodesSource({
      data: fraudData.nodesSource,
      id: 'id',
      layout: data => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height)
    })
    builder.createEdgesSource(fraudData.edgesSource, 'from', 'to')

    builder.buildGraph()

    graphComponent.fitGraphBounds()

    // calculate the connected components of the given graph
    calculateComponents()

    // create the timeline and filter the graph
    timelineComponent.createTimeline()

    if (!layout) {
      layout = new InteractiveLayout()
    }

    // run an initial layout
    const organicLayout = new OrganicLayout({
      deterministic: true,
      nodeOverlapsAllowed: false,
      preferredEdgeLength: 50
    })
    organicLayout.componentLayout.style = 'packed_compact_circle'
    graphComponent.graph.applyLayout(organicLayout)
    graphComponent.fitGraphBounds()

    layout.initLayout(graphComponent, () => {
      setBusy(false)
      // animate the viewport to a fraud component
      if (visibleFraudComponents.length > 0) {
        animateViewPort(visibleFraudComponents[0], false)
      }
    })
    layout.startLayout()
  }, 5)
}

/**
 * Marks whether or not the demo is currently loading the sample graphs.
 * When busy, the mouse cursor is changed and the toolbar as well as the input modes are disabled.
 * @param {boolean} value state
 */
function setBusy(value) {
  const loadingIndicator = document.getElementById('loadingIndicator')
  graphComponent.inputMode.waiting = value
  document.getElementById('sampleSelect').disabled = value
  loadingIndicator.style.display = value ? 'block' : 'none'
  busy = value
  timelineComponent.busy = value
}

/**
 * Calculates the connected components of the input graph and holds
 * the index of the component to which each component belongs.
 */
function calculateComponents() {
  component2Nodes.clear()

  const fullGraph = graphComponent.graph.wrappedGraph
  const bankFraud = document.getElementById('sampleSelect').value === 'bank-fraud'

  // for bank fraud, we remove the bank branch nodes to avoid having
  // large components that contain nodes that have no actual relationship with each other
  const result = new ConnectedComponents({
    subgraphNodes: node => !bankFraud || node.tag.type !== 'Bank Branch'
  }).run(fullGraph)

  fullGraph.nodes.forEach(node => {
    const componentIdx = result.nodeComponentIds.get(node)
    node2Component.set(node, componentIdx)
    if (!component2Nodes.get(componentIdx)) {
      component2Nodes.set(componentIdx, new List())
    }
    component2Nodes.get(componentIdx).add(node)
  })

  if (bankFraud) {
    // we unhide the bank branch nodes and we add them to the components to which their neighbor nodes belong
    fullGraph.nodes.forEach(node => {
      if (node.tag.type === 'Bank Branch') {
        fullGraph.edgesAt(node).forEach(edge => {
          const sourceNode = edge.sourceNode
          const targetNode = edge.targetNode
          const componentIdx = sourceNode.equals(node)
            ? node2Component.get(targetNode)
            : node2Component.get(sourceNode)
          if (!component2Nodes.get(componentIdx).includes(node)) {
            component2Nodes.get(componentIdx).add(node)
          }
        })
      }
    })
  }
}

/**
 * Performs fraud detection.
 */
function detectFraud() {
  fraudDetection.bankFraud = document.getElementById('sampleSelect').value === 'bank-fraud'

  const currentFraudComponents = new Set()
  const fraudsters = fraudDetection.detectFraud()
  if (fraudsters.length > 0) {
    fraudsters.forEach(node => {
      const componentIdx = node2Component.get(node)
      if (visibleFraudComponents.indexOf(componentIdx) < 0) {
        visibleFraudComponents.push(componentIdx)
        createFraudWarning(componentIdx)
      }
      currentFraudComponents.add(componentIdx)
    })
  }

  // remove from the toolbar the warning for the components that are not visible anymore
  for (let i = visibleFraudComponents.length - 1; i >= 0; i--) {
    const componentIdx = visibleFraudComponents[i]
    if (!currentFraudComponents.has(componentIdx)) {
      // remove the component from the visible components
      visibleFraudComponents.splice(i, 1)
      const componentNodes = component2Nodes.get(componentIdx)
      if (componentNodes) {
        // remove highlight from the component related to the removed warning sign
        // eslint-disable-next-line no-loop-func
        componentNodes.forEach(node => {
          fraudHighlightManager.removeHighlight(node)
        })
      }
      // remove the warning button
      const warningButton = document.getElementById(componentIdx)
      if (warningButton && warningButton.parentNode) {
        warningButton.parentNode.removeChild(warningButton)
      }
    }
  }
}

/**
 * Adds the fraud warning button associated with the given component.
 * @param {number} componentIdx The index of the given component
 */
function createFraudWarning(componentIdx) {
  const warningButton = document.createElement('input')
  warningButton.type = 'button'
  warningButton.title = `Component ${componentIdx}`
  warningButton.id = componentIdx
  warningButton.className = 'warning'
  warningButton.value = componentIdx
  document.getElementById('toolBar').appendChild(warningButton)
  warningButton.addEventListener('click', evt => onFraudWarning(parseInt(evt.currentTarget.id)))
  warningButton.addEventListener('mouseover', onMouseOver)
  warningButton.addEventListener('mouseleave', onMouseOut)
}

/**
 * Invoked when an edge/node of a fraud ring is clicked or a fraud warning button is pressed.
 * @param {number} componentIdx The related fraud component index
 */
function onFraudWarning(componentIdx) {
  if (!fraudDetectionView || componentIdx !== fraudDetectionView.componentIndex) {
    // checks if the fraud detection view is already open
    if (currentFraudComponent !== -1) {
      if (fraudDetectionView) {
        fraudDetectionView.close()
        closeFraudDetectionView()
      }
    }
    timelineComponent.setEnabled(false)
    fraudHighlightManager.clearHighlights()
    // find the component nodes
    const componentNodes = component2Nodes.get(componentIdx)
    if (componentNodes) {
      currentFraudComponent = componentIdx

      // open the fraud detection view
      const bankFraud = document.getElementById('sampleSelect').value === 'bank-fraud'
      const layoutAlgorithm = bankFraud ? FraudDetectionView.ORGANIC : FraudDetectionView.HIERARCHIC

      // create the fraud detection view using the full graph
      fraudDetectionView = new FraudDetectionView(
        graphComponent.graph.wrappedGraph,
        componentNodes,
        componentIdx,
        layoutAlgorithm,
        closeFraudDetectionView
      )
    }
  }
}

/**
 * Invoked when the mouse is over a warning button to highlight the associated component.
 * @param {MouseEvent} evt The invoked mouse event
 */
function onMouseOver(evt) {
  // get the id of the button that is being hovered
  fraudHighlightManager.clearHighlights()
  // animate the view port to the current component index
  animateViewPort(parseInt(evt.currentTarget.id), true)
}

/**
 * Invoked when the mouse leaves a warning button.
 * @param {MouseEvent} evt The invoked mouse event
 */
function onMouseOut(evt) {
  fraudHighlightManager.clearHighlights()
  graphComponent.highlightIndicatorManager.clearHighlights()
}

/**
 * Invoked when a currently open fraud detection view closes.
 */
function closeFraudDetectionView() {
  fraudDetectionView = null
  currentFraudComponent = -1
  timelineComponent.setEnabled(true)
}

/**
 * Animates the viewport to the selected fraud ring.
 * @param {number} componentIdx The given component index
 * @param {boolean} highlight
 */
function animateViewPort(componentIdx, highlight) {
  if (highlight) {
    highlightFraudComponent(componentIdx)
  }

  // find the component nodes
  const componentNodes = component2Nodes.get(componentIdx)
  if (componentNodes) {
    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    componentNodes.forEach(node => {
      if (node.tag.fraud && graphComponent.graph.contains(node)) {
        const nodeLayout = node.layout
        minX = Math.min(minX, nodeLayout.x)
        maxX = Math.max(maxX, nodeLayout.x + nodeLayout.width)
        minY = Math.min(minY, nodeLayout.y)
        maxY = Math.max(maxY, nodeLayout.y + nodeLayout.height)
      }
    })
    if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
      let rect = new Rect(minX, minY, maxX - minX, maxY - minY)
      if (graphComponent.viewport.contains(rect) && graphComponent.zoom > 0.8) {
        return
      }
      // Enlarge the viewport so that we get an overview of the neighborhood as well
      rect = rect.getEnlarged(new Insets(200))

      // Animate the transition to the failed element
      const animator = new Animator(graphComponent)
      animator.allowUserInteraction = true
      const viewportAnimation = new ViewportAnimation(graphComponent, rect, '1s')
      animator.animate(viewportAnimation.createEasedAnimation(0, 1))
    }
  }
}

// start the demo
loadJson().then(run)
