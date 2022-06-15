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
  ExteriorLabelModel,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  IEdge,
  ILabel,
  IModelItem,
  INode,
  InteriorStretchLabelModel,
  ItemClickedEventArgs,
  License,
  ModifierKeys,
  PanelNodeStyle,
  Point,
  ShapeNodeStyle,
  Size
} from 'yfiles'

import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import LinkItemHoverInputMode from './LinkItemHoverInputMode.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/**
 * Bootstraps the demo.
 * @param {!object} licenseData
 */
function run(licenseData) {
  License.value = licenseData
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  const inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.inputMode = inputMode
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults()

  // the click listener for labels that represent external links
  initializeLinkListener()

  // an optional custom ItemHoverInputMode which highlights clickable links by underlining the text
  inputMode.add(new LinkItemHoverInputMode())

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

function initializeLinkListener() {
  graphComponent.inputMode.addItemLeftClickedListener((src, args) => {
    if (args.modifiers !== ModifierKeys.CONTROL) {
      // this listener should only handle CTRL+click to open external links
      return
    }
    const clickedItem = args.item
    let url = ''

    if (ILabel.isInstance(clickedItem)) {
      const label = clickedItem
      url = label.text.startsWith('www.') || label.text.startsWith('http') ? label.text : ''
    } else if (INode.isInstance(clickedItem) || IEdge.isInstance(clickedItem)) {
      // if a node or edge was clicked, we see whether it has any label that resembles a link
      clickedItem.labels.forEach(label => {
        const text = label.text
        if (text.startsWith('www.') || text.startsWith('http')) {
          url = text
        }
      })
    }

    if (url) {
      window.open(url.startsWith('http') ? url : `https://${url}`, '_blank')
      args.handled = true
    }
  })
}

/**
 * Initializes the defaults for the styles in this tutorial.
 */
function initTutorialDefaults() {
  const graph = graphComponent.graph

  // configure defaults normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  graph.nodeDefaults.labels.layoutParameter = ExteriorLabelModel.SOUTH

  // configure defaults group nodes and their labels
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
 * Creates a simple sample graph.
 */
function createGraph() {
  const graph = graphComponent.graph

  const node1 = graph.createNodeAt([110, 20])
  const node2 = graph.createNodeAt([195, 95])
  const node3 = graph.createNodeAt([75, 95])
  const node4 = graph.createNodeAt({
    location: [-60, 175],
    labels: ['https://www.yworks.com/yed-live/']
  })
  const node5 = graph.createNodeAt({ location: [100, 175], labels: ['www.yworks.com'] })
  const node6 = graph.createNodeAt({ location: [195, 175], labels: ['Not a link'] })

  graph.groupNodes({ children: [node1, node2, node3], labels: ['Group 1'] })

  const edge1 = graph.createEdge(node1, node2)
  const edge2 = graph.createEdge(node1, node3)
  const edge3 = graph.createEdge(node3, node4)
  const edge4 = graph.createEdge(node3, node5)
  const edge5 = graph.createEdge(node1, node5)
  const edge6 = graph.createEdge(node2, node6)
  graph.setPortLocation(edge1.sourcePort, new Point(123.33, 40))
  graph.setPortLocation(edge1.targetPort, new Point(195, 75))
  graph.setPortLocation(edge2.sourcePort, new Point(96.67, 40))
  graph.setPortLocation(edge2.targetPort, new Point(75, 75))
  graph.setPortLocation(edge3.sourcePort, new Point(65, 115))
  graph.setPortLocation(edge3.targetPort, new Point(-60, 155))
  graph.setPortLocation(edge4.sourcePort, new Point(85, 115))
  graph.setPortLocation(edge4.targetPort, new Point(90, 155))
  graph.setPortLocation(edge5.sourcePort, new Point(110, 40))
  graph.setPortLocation(edge5.targetPort, new Point(110, 155))
  graph.setPortLocation(edge6.sourcePort, new Point(195, 115))
  graph.setPortLocation(edge6.targetPort, new Point(195, 155))
  graph.addBends(edge1, [new Point(123.33, 55), new Point(195, 55)])
  graph.addBends(edge2, [new Point(96.67, 55), new Point(75, 55)])
  graph.addBends(edge3, [new Point(65, 130), new Point(-60, 130)])
  graph.addBends(edge4, [new Point(85, 130), new Point(90, 130)])

  graphComponent.fitGraphBounds()
  graph.undoEngine.clear()
}

/**
 * Binds the various commands available in yFiles for HTML to the buttons in the tutorial's toolbar.
 */
function registerCommands() {
  bindAction("button[data-command='New']", () => {
    graphComponent.graph.clear()
    ICommand.FIT_GRAPH_BOUNDS.execute(null, graphComponent)
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
}

// start tutorial
loadJson().then(run)
