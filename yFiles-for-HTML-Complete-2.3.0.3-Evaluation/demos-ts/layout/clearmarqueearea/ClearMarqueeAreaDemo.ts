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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseClass,
  CanvasComponent,
  ClearAreaStrategy,
  ComponentAssignmentStrategy,
  EventRecognizers,
  GraphBuilder,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IInputModeContext,
  INode,
  INodeHitTester,
  IRenderContext,
  IVisualTemplate,
  KeyEventRecognizers,
  License,
  MarqueeSelectionEventArgs,
  MarqueeSelectionInputMode,
  MouseEventRecognizers,
  Point,
  Rect,
  SvgVisual
} from 'yfiles'

import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'
import { initDemoStyles, DemoGroupStyle } from '../../resources/demo-styles'
import SampleData from './resources/SampleData'
import { ClearAreaLayoutHelper } from './ClearAreaLayoutHelper'

// @ts-ignore
let graphComponent: GraphComponent = null

// @ts-ignore
let layoutHelper: ClearAreaLayoutHelper = null

let componentAssignmentStrategy: ComponentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE

let clearAreaStrategy: ClearAreaStrategy = ClearAreaStrategy.PRESERVE_SHAPES

async function run(licenseData: object): Promise<void> {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  initializeInputModes()
  await initializeGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Registers the {@link GraphEditorInputMode} as the {@link CanvasComponent.inputMode}
 * and initializes the marquee input mode that clears the area of the marquee rectangle.
 */
function initializeInputModes(): void {
  // enable undo/redo support
  graphComponent.graph.undoEngineEnabled = true

  // create an input mode to edit graphs
  const editMode = new GraphEditorInputMode()

  // create an input mode to clear the area of a marquee rectangle
  // using the right mouse button
  const marqueeClearInputMode = new MarqueeSelectionInputMode()
  marqueeClearInputMode.pressedRecognizer = MouseEventRecognizers.RIGHT_DOWN
  marqueeClearInputMode.draggedRecognizer = MouseEventRecognizers.RIGHT_DRAG
  marqueeClearInputMode.releasedRecognizer = MouseEventRecognizers.RIGHT_UP
  marqueeClearInputMode.cancelRecognizer = EventRecognizers.createOrRecognizer(
    KeyEventRecognizers.ESCAPE_DOWN,
    MouseEventRecognizers.LOST_CAPTURE_DURING_DRAG
  )
  marqueeClearInputMode.template = new ClearRectTemplate()

  // handle dragging the marquee
  marqueeClearInputMode.addDragStartingListener(onDragStarting)
  marqueeClearInputMode.addDraggedListener(onDragged)
  marqueeClearInputMode.addDragCanceledListener(onDragCanceled)
  marqueeClearInputMode.addDragFinishedListener(onDragFinished)
  // add this mode to the edit mode
  editMode.add(marqueeClearInputMode)

  // and install the edit mode into the canvas
  graphComponent.inputMode = editMode
}

/**
 * A template for the red marquee rectangle.
 */
class ClearRectTemplate extends BaseClass<IVisualTemplate>(IVisualTemplate) {
  createVisual(context: IRenderContext, bounds: Rect, dataObject: any): SvgVisual | null {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('fill', 'rgba(255,0,0,0.67)')
    rect.setAttribute('stroke', 'darkred')
    ClearRectTemplate.setBounds(rect, bounds)
    return new SvgVisual(rect)
  }

  updateVisual(
    context: IRenderContext,
    oldVisual: SvgVisual,
    bounds: Rect,
    dataObject: any
  ): SvgVisual | null {
    ClearRectTemplate.setBounds(oldVisual.svgElement, bounds)
    return oldVisual
  }

  private static setBounds(rect: SVGElement, bounds: Rect): void {
    rect.setAttribute('x', String(bounds.x))
    rect.setAttribute('y', String(bounds.y))
    rect.setAttribute('width', String(bounds.width))
    rect.setAttribute('height', String(bounds.height))
  }
}

/**
 * The marquee rectangle is upon to be dragged.
 */
function onDragStarting(sender: any, e: MarqueeSelectionEventArgs): void {
  const hitGroupNode = getHitGroupNode(e.context, e.context.canvasComponent!.lastEventLocation)
  layoutHelper = new ClearAreaLayoutHelper(
    graphComponent,
    e.rectangle,
    hitGroupNode,
    componentAssignmentStrategy,
    clearAreaStrategy
  )
  layoutHelper.initializeLayout()
}

/**
 * The marquee rectangle is currently dragged. For each drag a new layout is calculated and applied
 * if the previous one is completed.
 */
function onDragged(sender: any, e: MarqueeSelectionEventArgs): void {
  layoutHelper.clearRectangle = e.rectangle
  layoutHelper.runLayout()
}

/**
 * Dragging the marquee rectangle has been canceled so the state before the gesture must be restored.
 */
function onDragCanceled(sender: any, e: MarqueeSelectionEventArgs): void {
  layoutHelper.clearRectangle = e.rectangle
  layoutHelper.cancelLayout()
}

/**
 * Dragging the marquee rectangle has been finished so
 * we execute the layout with the final rectangle.
 */
function onDragFinished(sender: any, e: MarqueeSelectionEventArgs): void {
  layoutHelper.clearRectangle = e.rectangle
  layoutHelper.stopLayout()
}

/**
 * Returns the group node at the given location. If there is no group node, <code>null</code> is returned.
 */
function getHitGroupNode(context: IInputModeContext, location: Point): INode {
  return (context.lookup(INodeHitTester.$class) as INodeHitTester)
    .enumerateHits(context, location)
    .firstOrDefault(n => graphComponent.graph.isGroupNode(n))
}

/**
 * Initializes styles and loads a sample graph.
 */
function initializeGraph(): void {
  initDemoStyles(graphComponent.graph)
  loadGraph('hierarchic')
  graphComponent.graph.undoEngine!.clear()
}

/**
 * Loads the sample graph associated with the given name
 */
function loadGraph(sampleName: string): void {
  // @ts-ignore
  const data = SampleData[sampleName]

  const graph = graphComponent.graph
  graph.clear()

  const defaultNodeSize = graph.nodeDefaults.size
  const builder = new GraphBuilder(graph)
  builder.createNodesSource({
    data: data.nodes,
    id: 'id',
    parentId: 'parentId',
    layout: (data: any) => new Rect(data.x, data.y, defaultNodeSize.width, defaultNodeSize.height),
    labels: ['label']
  })
  if (data.groups) {
    const nodesSource = builder.createGroupNodesSource({
      data: data.groups,
      id: 'id',
      parentId: 'parentId',
      layout: (data: any) => data // the data object itself has x, y, width, height properties
    })
    const groupStyle = new DemoGroupStyle()
    // set solidHitTest to true so group nodes are properly hit in getHitGroupNode
    groupStyle.solidHitTest = true
    nodesSource.nodeCreator.defaults.style = groupStyle
  }
  builder.createEdgesSource(data.edges, 'source', 'target', 'id')

  builder.buildGraph()

  graph.edges.forEach(edge => {
    if (edge.tag.sourcePort) {
      graph.setPortLocation(edge.sourcePort!, Point.from(edge.tag.sourcePort))
    }
    if (edge.tag.targetPort) {
      graph.setPortLocation(edge.targetPort!, Point.from(edge.tag.targetPort))
    }
    edge.tag.bends.forEach((bend: { x: number; y: number }) => {
      graph.addBend(edge, Point.from(bend))
    })
  })

  graphComponent.fitGraphBounds()
}

/**
 * Registers commands and actions for the items in the toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindAction("button[data-command='PreviousSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex > 0) {
      sampleGraphs.selectedIndex = selectedIndex - 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })
  bindAction("button[data-command='NextSample']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    if (selectedIndex < sampleGraphs.options.length - 1) {
      sampleGraphs.selectedIndex = selectedIndex + 1
      loadGraph(sampleGraphs.options[sampleGraphs.selectedIndex].value)
      updateButtons(sampleGraphs)
    }
  })

  const sampleGraphs = document.getElementById('sample-graphs') as HTMLSelectElement
  bindChangeListener("select[data-command='SelectSampleGraph']", () => {
    const selectedIndex = sampleGraphs.selectedIndex
    const selectedOption = sampleGraphs.options[selectedIndex]
    loadGraph(selectedOption.value)
    updateButtons(sampleGraphs)
  })

  const assignmentStrategies = document.getElementById(
    'component-assignment-strategies'
  ) as HTMLSelectElement
  bindChangeListener("select[data-command='SelectAssignmentStrategy']", () => {
    const selectedOption = assignmentStrategies.options[assignmentStrategies.selectedIndex]
    switch (selectedOption.value) {
      case 'single':
        componentAssignmentStrategy = ComponentAssignmentStrategy.SINGLE
        break
      case 'connected':
        componentAssignmentStrategy = ComponentAssignmentStrategy.CONNECTED
        break
      case 'clustering':
        componentAssignmentStrategy = ComponentAssignmentStrategy.CLUSTERING
        break
    }
  })

  const clearAreaStrategies = document.getElementById('clear-area-strategies') as HTMLSelectElement
  bindChangeListener("select[data-command='SelectClearAreaStrategy']", () => {
    const selectedOption = clearAreaStrategies.options[clearAreaStrategies.selectedIndex]
    switch (selectedOption.value) {
      case 'local':
        clearAreaStrategy = ClearAreaStrategy.LOCAL
        break
      case 'local-uniform':
        clearAreaStrategy = ClearAreaStrategy.LOCAL_UNIFORM
        break
      case 'global':
        clearAreaStrategy = ClearAreaStrategy.GLOBAL
        break
      case 'preserve-shapes':
        clearAreaStrategy = ClearAreaStrategy.PRESERVE_SHAPES
        break
      case 'preserve-shapes-uniform':
        clearAreaStrategy = ClearAreaStrategy.PRESERVE_SHAPES_UNIFORM
        break
    }
  })
}

/**
 * Updates the enabled state of the next- and previous-sample-button according to which sample is currently used.
 */
function updateButtons(sampleGraphs: HTMLSelectElement): void {
  const selectedIndex = sampleGraphs.selectedIndex
  const previousSample = document.getElementById('previous-sample-button') as HTMLButtonElement
  const nextSample = document.getElementById('next-sample-button') as HTMLButtonElement
  const maxReached = selectedIndex === sampleGraphs.options.length - 1
  const minReached = selectedIndex === 0
  nextSample.disabled = maxReached
  previousSample.disabled = minReached
}

// start demo
loadJson().then(run)
