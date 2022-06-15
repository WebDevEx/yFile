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
  Color,
  DefaultLabelStyle,
  GraphClipboard,
  GraphComponent,
  GraphEditorInputMode,
  HashMap,
  HierarchicLayout,
  ICommand,
  IGraph,
  INode,
  ITable,
  Insets,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  LayoutExecutor,
  LayoutOrientation,
  License,
  MinimumNodeSizeStage,
  NodeStyleStripeStyleAdapter,
  OrthogonalEdgeEditingContext,
  PanelNodeStyle,
  ParentNodeDetectionModes,
  Rect,
  ReparentStripeHandler,
  ShapeNodeStyle,
  Size,
  Table,
  TableEditorInputMode,
  TableNodeStyle,
  VoidStripeStyle,
  SolidColorFill,
  TimeSpan,
  SimplexNodePlacer,
  IModelItem,
  IEdge
} from 'yfiles'

import FileSaveSupport from '../../utils/FileSaveSupport.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true,
    allowGroupSelection: false,
    orthogonalEdgeEditingContext: new OrthogonalEdgeEditingContext()
  })

  configureTableEditing(graphComponent.inputMode)

  // configures default styles for newly created graph elements
  initTutorialDefaults(graphComponent.graph)

  loadGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * @returns {!Promise}
 */
async function loadGraph() {
  try {
    // load the graph data from the given JSON file
    const graphData = await loadJSON('./GraphData.json')

    // then build the graph with the given data set
    buildGraph(graphComponent.graph, graphData)

    // Automatically layout the swimlanes. The HierarchicLayout respects the node to cell assignment based on the
    // node's center position.
    await runLayout('0s')
    // Finally, enable the undo engine. This prevents undoing of the graph creation
    graphComponent.graph.undoEngineEnabled = true
  } catch (e) {
    alert(e)
  }
}

/**
 * @param {!GraphEditorInputMode} graphEditorInputMode
 */
function configureTableEditing(graphEditorInputMode) {
  const reparentStripeHandler = new ReparentStripeHandler()
  reparentStripeHandler.maxColumnLevel = 1
  reparentStripeHandler.maxRowLevel = 1

  // Create a new TEIM instance which also allows drag and drop
  const tableInputMode = new TableEditorInputMode({
    reparentStripeHandler,
    // we set the priority higher than for the handle input mode so that handles win if both gestures are possible
    priority: graphEditorInputMode.handleInputMode.priority + 1
  })
  tableInputMode.stripeDropInputMode.enabled = true

  // Add to GEIM
  graphEditorInputMode.add(tableInputMode)

  // prevent re-parenting of tables into tables by copy & paste
  const clipboard = new GraphClipboard()
  clipboard.parentNodeDetection = ParentNodeDetectionModes.PREVIOUS_PARENT
  graphComponent.clipboard = clipboard

  // prevent selection of the table node
  graphEditorInputMode.selectablePredicate = item => {
    return !(INode.isInstance(item) && item.lookup(ITable.$class))
  }
}

/**
 * Iterates through the given data set and creates nodes and edges according to the given data.
 * How to iterate through the data set and which information are applied to the graph, depends on the structure of
 * the input data. However, the general approach is always the same, i.e. iterating through the data set and
 * calling the graph item factory methods like
 * {@link IGraph.createNode()},
 * {@link IGraph.createGroupNode()},
 * {@link IGraph.createEdge()},
 * {@link IGraph.addLabel()}
 * and other {@link IGraph} functions to apply the given information to the graph model.
 *
 * @param {!IGraph} graph The graph.
 * @param {*} graphData The graph data that was loaded from the JSON file.
 * @yjs:keep=nodesSource,edgesSource
 */
function buildGraph(graph, graphData) {
  // Store lanes and nodes references.
  // It will be easier to assign lanes or connect them with edges afterwards.
  const nodes = {}
  const lanes = {}

  // Swimlanes are a special application of Tables, either one row with several columns (i.e. vertical swimlanes), or
  // one column with several rows (i.e. horizontal swimlanes).
  // In this case we go with the vertical swimlanes. Therefore we create a Table with one row and multiple columns,
  // depending on the input data.
  const table = new Table()

  // Configure the row style, i.e. the container for the swimlanes. In this case, they should not be rendered at all,
  // since we are creating a vertical swimlane. However, in the general case of Tables, we could use a
  // semi-transparent style here, too create overlapping cell colors.
  table.rowDefaults.insets = new Insets(0, 10, 0, 0)
  table.rowDefaults.style = new VoidStripeStyle()

  // Configure the column style, i.e. the actual swimlanes.
  table.columnDefaults.insets = new Insets(10, 30, 10, 10)
  table.columnDefaults.labels.style = new DefaultLabelStyle({
    backgroundFill: '#e0e0e0',
    backgroundStroke: 'black',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: 'center',
    textSize: 16,
    insets: [3, 5, 3, 5]
  })
  table.columnDefaults.size = 200
  table.columnDefaults.style = new NodeStyleStripeStyleAdapter(
    new ShapeNodeStyle({
      fill: '#c4d7ed',
      stroke: 'black',
      shape: 'rectangle'
    })
  )

  // The second column style that is used for the even-odd styling of the columns.
  const alternateColumnStyle = new NodeStyleStripeStyleAdapter(
    new ShapeNodeStyle({
      fill: '#abc8e2',
      stroke: 'black',
      shape: 'rectangle'
    })
  )

  // Create the single container row.
  table.createRow()

  // Iterate the lanes data and create the according lanes.
  graphData.lanesSource.forEach((laneData, index) => {
    const column = table.createColumn({
      tag: laneData,
      style: index % 2 === 0 ? table.columnDefaults.style : alternateColumnStyle
    })
    table.addLabel(column, laneData.label || laneData.id)

    // We store the lane index to easily assign nodes to them later.
    lanes[laneData.id] = index
  })

  // Create a top-level group node and bind, via the TableNodeStyle, the table to it.
  const tableStyle = new TableNodeStyle(table)
  const tableGroupNode = graph.createGroupNode(null, table.layout.toRect(), tableStyle)

  // Iterate the node data and create the according nodes.
  graphData.nodesSource.forEach(nodeData => {
    const size = nodeData.size || [50, 50]
    const node = graph.createNode({
      labels: [nodeData.label || nodeData.id],
      layout: new Rect(0, 0, size[0], size[1]),
      tag: nodeData
    })
    if (nodeData.fill) {
      // If the node data specifies an individual fill color, adjust the style.
      graph.setStyle(
        node,
        new ShapeNodeStyle({
          fill: nodeData.fill,
          stroke: 'white'
        })
      )
    }
    nodes[nodeData.id] = node

    if (nodeData.lane) {
      // Nodes are assigned to lanes based on their center location. We could either place them manually by getting
      // the respective lane's bounds, or we can use a helper function to place nodes in specific cells. In case of
      // manually, placing the nodes, don't forget to also reparent the nodes to the table group, which is also done
      // by the helper function.
      ITable.placeNodeInCell(
        graph,
        node,
        tableGroupNode,
        table.columns.elementAt(lanes[nodeData.lane]),
        table.rows.elementAt(0)
      )
    }
  })

  // Iterate the edge data and create the according edges.
  graphData.edgesSource.forEach(edgeData => {
    // Note that nodes and groups need to have disjoint sets of ids, otherwise it is impossible to determine
    // which node is the correct source/target.
    graph.createEdge({
      source: nodes[edgeData.from],
      target: nodes[edgeData.to],
      labels: [edgeData.label || ''],
      tag: edgeData
    })
  })
}

/**
 * Serializes the graph to JSON.
 * @param {!IGraph} graph The graph
 * @returns {*}
 */
function writeToJSON(graph) {
  const jsonOutput = {
    nodesSource: [],
    edgesSource: [],
    lanesSource: []
  }

  // find the table, we assume there is only one
  const tableNode = graph.nodes.find(node => !!node.lookup(ITable.$class))
  const table = tableNode ? tableNode.lookup(ITable.$class) : null

  // serialize the nodes with their swimlane information
  const node2id = new HashMap()
  graph.nodes.forEach((node, i) => {
    // skip the table node
    if (node === tableNode) {
      return
    }

    // save the id to easily create the edgesSource afterwards
    node2id.set(node, i)

    // serialize the node
    const jsonNode = {
      id: i,
      size: [node.layout.width, node.layout.height],
      fill: colorToHex(node.style.fill.color)
    }
    if (node.labels.size > 0) {
      jsonNode.label = node.labels.first().text
    }
    jsonOutput.nodesSource.push(jsonNode)

    // store the lane of the node
    if (table && table instanceof ITable) {
      const column = table.findColumn(tableNode, node.layout.center)
      if (column) {
        const columnId = `lane${table.findColumn(tableNode, node.layout.center).index}`
        jsonNode.lane = columnId
        // store new lanes in the json
        if (!jsonOutput.lanesSource.find(lane => lane.id === columnId)) {
          const jsonLane = { id: columnId }
          if (column.labels.size > 0) {
            jsonNode.label = column.labels.first().text
          }
          jsonOutput.lanesSource.push(jsonLane)
        }
      }
    }
  })

  // serialize the edges
  graph.edges.forEach(edge => {
    const sourceId = node2id.get(edge.sourceNode)
    const targetId = node2id.get(edge.targetNode)
    jsonOutput.edgesSource.push({
      from: sourceId,
      to: targetId
    })
  })

  return jsonOutput
}

/**
 * Helper function that converts a {Color} to a hex color string.
 * @returns {!string} hex color
 * @param {!Color} color
 */
function colorToHex(color) {
  // zero-padding
  let hexR = color.r.toString(16)
  if (hexR.length < 2) {
    hexR = `0${hexR}`
  }
  let hexG = color.g.toString(16)
  if (hexG.length < 2) {
    hexG = `0${hexG}`
  }
  let hexB = color.b.toString(16)
  if (hexB.length < 2) {
    hexB = `0${hexB}`
  }
  return `#${hexR}${hexG}${hexB}`
}

/**
 * Runs a {@link HierarchicLayout} on the current graph. The
 * {@link HierarchicLayout} respects the node to cell (or swimlane) assignment by considering the
 * nodes location in relation to the swimlane bounds.
 * @param {!(TimeSpan|string)} duration The animation duration of the layout.
 * @returns {!Promise}
 */
function runLayout(duration) {
  const layout = new HierarchicLayout()
  layout.componentLayoutEnabled = false
  layout.layoutOrientation = LayoutOrientation.TOP_TO_BOTTOM
  layout.orthogonalRouting = true
  layout.recursiveGroupLayering = layout.nodePlacer.barycenterMode = true

  // We use Layout executor convenience method that already sets up the whole layout pipeline correctly
  const layoutExecutor = new LayoutExecutor({
    graphComponent,
    layout: new MinimumNodeSizeStage(layout),
    // Table layout is enabled by default already...
    configureTableLayout: true,
    duration,
    animateViewport: true
  })

  // Apply an initial layout
  return layoutExecutor.start()
}

/**
 * Initializes the defaults for the styles in this tutorial.
 *
 * @param {!IGraph} graph The graph.
 */
function initTutorialDefaults(graph) {
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  // configure defaults for group nodes and their labels
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })
  bindAction("button[data-command='Save']", () => {
    const graph = graphComponent.graph
    const json = writeToJSON(graph)
    FileSaveSupport.save(JSON.stringify(json), 'graph.json')
  })
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)
  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
  bindAction("button[data-command='Layout']", () => runLayout('1s'))
}

/**
 * Returns a promise that resolves when the JSON file is loaded.
 * In general, this can load other files, like plain text files or CSV files, too. However,
 * before usage you need to parse the file content which is done by JSON.parse in case of a JSON file as
 * demonstrated here.
 *
 * @param {!string} url The URL to load.
 *
 * @returns {!Promise.<JSON>} A promise with the loaded data.
 */
async function loadJSON(url) {
  const response = await fetch(url)
  return response.json()
}

// start tutorial
loadJson().then(run)
