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
import '../static/styles.css'
import '../static/yfiles.css'
import licenseData from '../../../../../lib/license.json'
import {
  DefaultLabelStyle,
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphMLIOHandler,
  GraphMLSupport,
  ICommand,
  IGraph,
  InteriorStretchLabelModel,
  License,
  PanelNodeStyle,
  Point,
  ShapeNodeStyle,
  Size,
  StorageLocation
} from 'yfiles'
import ContextMenu from './context-menu'
import { ipcRenderer, remote } from 'electron'
import fs from 'fs' // Use Node's system natives for I/O operations

/**
 * Use Electrons open/save dialog
 * @type {Electron.Dialog}
 */
const { dialog } = remote

/** @type {GraphComponent} */
let graphComponent = null

/** @type {GraphMLIOHandler} */
let graphMLIOHandler = null

/**
 * Bootstraps the demo.
 */
function bootstrap() {
  License.value = licenseData
  graphComponent = new GraphComponent('#graphComponent')

  // configure a GraphEditorInputMode for interactive graph editing
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })

  // register a context menu
  const contextMenu = new ContextMenu(graphComponent)
  contextMenu.initializeListeners(graphComponent.inputMode)

  // configures default styles for newly created graph elements
  initDefaultStyles(graphComponent.graph)

  // enable GraphML de-/serialization
  const gs = new GraphMLSupport({
    graphComponent,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
  graphMLIOHandler = gs.graphMLIOHandler

  // create an initial sample graph
  createGraph(graphComponent.graph)
  graphComponent.fitGraphBounds()

  // bind the buttons to their commands
  registerCommands()
}

/**
 * Initializes the defaults for the styles for the graph.
 * @param {IGraph} graph The graph.
 */
function initDefaultStyles(graph) {
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word_ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

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
 * Creates an initial sample graph.
 *
 * @param {IGraph} graph The graph.
 */
function createGraph(graph) {
  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([145, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt([30, 175])
  const node5 = graph.createNodeAt([100, 175])

  const groupNode = graph.createGroupNode()
  graph.addLabel(groupNode, 'Label 1')
  graph.groupNodes(groupNode, [node1, node2, node3])
  graph.adjustGroupNodeLayout(groupNode)

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(145, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(30, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(145, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(30, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])
}

function newGraph() {
  graphComponent.graph.clear()
  ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
}

/**
 * Shows a dialog to open GraphML files.
 */
async function openDialog() {
  const openResult = await dialog.showOpenDialog({
    title: 'Open Diagram',
    filters: [{ name: 'GraphML', extensions: ['graphml'] }]
  })
  if (!openResult.canceled) {
    fs.readFile(openResult.filePaths[0], (err, data) => {
      if (err) throw err
      graphMLIOHandler.readFromGraphMLText(graphComponent.graph, data)
      graphComponent.fitGraphBounds()
    })
  }
}

/**
 * Shows a dialog to save the graph to disk.
 */
async function saveDialog() {
  const saveResult = await dialog.showSaveDialog({
    title: 'Save Diagram',
    defaultPath: 'sample-graph.graphml',
    filters: [
      {
        name: 'GraphML',
        extensions: ['graphml']
      }
    ]
  })
  if (!saveResult.canceled) {
    const graphml = await graphMLIOHandler.write(graphComponent.graph)
    fs.writeFile(saveResult.filePath, graphml, err => {
      if (err) throw err
    })
  }
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the toolbar.
 */
function registerCommands() {
  document.getElementById('btn-new').addEventListener('click', newGraph)
  document.getElementById('btn-open').addEventListener('click', openDialog)
  document.getElementById('btn-save').addEventListener('click', saveDialog)
  document.getElementById('btn-reset-zoom').addEventListener('click', () => {
    ICommand.ZOOM.execute(1.0, graphComponent)
  })
  document.getElementById('btn-fit-content').addEventListener('click', () => {
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
  })

  // wire up the main window's menu
  ipcRenderer.on('onNew', newGraph)
  ipcRenderer.on('onOpen', openDialog)
  ipcRenderer.on('onSaveAs', saveDialog)
  ipcRenderer.on('onCut', () => {
    ICommand.CUT.execute(null, graphComponent)
  })
  ipcRenderer.on('onCopy', () => {
    ICommand.COPY.execute(null, graphComponent)
  })
  ipcRenderer.on('onPaste', () => {
    ICommand.PASTE.execute(null, graphComponent)
  })
  ipcRenderer.on('onDelete', () => {
    ICommand.DELETE.execute(null, graphComponent)
  })
  ipcRenderer.on('onSelectAll', () => {
    ICommand.SELECT_ALL.execute(null, graphComponent)
  })
  ipcRenderer.on('onFitContent', () => {
    ICommand.FIT_CONTENT.execute(null, graphComponent)
  })
  ipcRenderer.on('onResetZoom', () => {
    ICommand.ZOOM.execute(1.0, graphComponent)
  })
}

// bootstrap application
bootstrap()
