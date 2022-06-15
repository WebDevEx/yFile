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
  ExteriorLabelModelPosition,
  Font,
  GraphComponent,
  GraphEditorInputMode,
  ICommand,
  InteriorStretchLabelModel,
  InteriorStretchLabelModelPosition,
  License,
  PanelNodeStyle,
  Rect,
  ShapeNodeStyle,
  Size
} from 'yfiles'

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
  // initialize graph component
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true

  // configures default styles for newly created graph elements
  initTutorialDefaults()

  // Configure default label model parameters for newly created graph elements
  setDefaultLabelLayoutParameters()

  // add a sample graph
  createGraph()

  // bind the buttons to their commands
  registerCommands()

  // initialize the application's CSS and JavaScript for the description
  showApp(graphComponent)
}

/**
 * Sets up default label model parameters for graph elements.
 * Label model parameters control the actual label placement as well as the available
 * placement candidates when moving the label interactively.
 */
function setDefaultLabelLayoutParameters() {
  // Use a label model that stretches the label over the full node layout, with small insets. The label style
  // is responsible for drawing the label in the given space. Depending on its implementation, it can either
  // ignore the given space, clip the label at the width or wrapping the text.
  // See the createGraph function where labels are added with different style options.
  const centerLabelModel = new InteriorStretchLabelModel({ insets: 5 })
  graphComponent.graph.nodeDefaults.labels.layoutParameter = centerLabelModel.createParameter(
    InteriorStretchLabelModelPosition.CENTER
  )
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
  // label model and style for the description labels north of the node
  const northLabelModel = new ExteriorLabelModel({ insets: 10 })
  const northParameter = northLabelModel.createParameter(ExteriorLabelModelPosition.NORTH)
  const northLabelStyle = new DefaultLabelStyle({
    horizontalTextAlignment: 'center'
  })

  // create nodes
  const graph = graphComponent.graph
  const node1 = graph.createNode(new Rect(0, 0, 100, 100))
  const node2 = graph.createNode(new Rect(160, 0, 100, 100))
  const node3 = graph.createNode(new Rect(320, 0, 100, 100))
  const node4 = graph.createNode(new Rect(480, 0, 100, 100))
  const node5 = graph.createNode(new Rect(640, 0, 100, 100))

  // use a label model that stretches the label over the full node layout, with small insets
  const centerLabelModel = new InteriorStretchLabelModel({ insets: 5 })
  const centerParameter = centerLabelModel.createParameter(InteriorStretchLabelModelPosition.CENTER)

  // maybe showcase right-to-left text direction
  const rtlDirection = document.getElementById('trl-toggle').checked

  // the text that should be displayed
  const longText = rtlDirection
    ? 'סעיף א. כל בני אדם נולדו בני חורין ושווים בערכם ובזכויותיהם. כולם חוננו בתבונה ובמצפון, לפיכך חובה עליהם לנהוג איש ברעהו ברוח של אחוה.'
    : 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr.'
  const font = new Font({ fontSize: 16 })

  // A label that does not wrap at all. By default, it is clipped at the given bounds, though this can also be
  // disabled with the clipText property of the DefaultLabelStyle.
  const noWrappingStyle = new DefaultLabelStyle({
    font,
    wrapping: 'none',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node1, longText, centerParameter, noWrappingStyle)
  graph.addLabel(node1, 'No Wrapping', northParameter, northLabelStyle)

  // A label that is wrapped at word boundaries.
  const wordWrappingStyle = new DefaultLabelStyle({
    font,
    wrapping: 'word',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node2, longText, centerParameter, wordWrappingStyle)
  graph.addLabel(node2, 'Word Wrapping', northParameter, northLabelStyle)

  // A label that is wrapped at single characters.
  const characterWrappingStyle = new DefaultLabelStyle({
    font,
    wrapping: 'character',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node3, longText, centerParameter, characterWrappingStyle)
  graph.addLabel(node3, 'Character Wrapping', northParameter, northLabelStyle)

  // A label that is wrapped at word boundaries but also renders ellipsis if there is not enough space.
  const ellipsisWordWrappingStyle = new DefaultLabelStyle({
    font,
    wrapping: 'word-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node4, longText, centerParameter, ellipsisWordWrappingStyle)
  graph.addLabel(node4, 'Word Wrapping\nwith Ellipsis', northParameter, northLabelStyle)

  // A label that is wrapped at  single charactes but also renders ellipsis if there is not enough space.
  const ellipsisCharacterWrappingStyle = new DefaultLabelStyle({
    font,
    wrapping: 'character-ellipsis',
    verticalTextAlignment: 'center',
    horizontalTextAlignment: rtlDirection ? 'right' : 'left'
  })
  graph.addLabel(node5, longText, centerParameter, ellipsisCharacterWrappingStyle)
  graph.addLabel(node5, 'Character Wrapping\nwith Ellipsis', northParameter, northLabelStyle)

  graph.undoEngine.clear()
  graphComponent.fitGraphBounds()
}

/**
 * Rebuilds the demo when the text direction changes.
 */
function reinitializeDemo() {
  graphComponent.cleanUp()
  const gcContainer = document.getElementById('graphComponent')
  while (gcContainer.childElementCount > 0) {
    gcContainer.removeChild(gcContainer.firstElementChild)
  }
  graphComponent = new GraphComponent('#graphComponent')
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
  graphComponent.graph.undoEngineEnabled = true
  initTutorialDefaults()
  setDefaultLabelLayoutParameters()
  createGraph()
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
  bindAction('#trl-toggle', () => {
    const gcContainer = document.getElementById('graphComponent')
    gcContainer.style.direction = document.getElementById('trl-toggle').checked ? 'rtl' : 'ltr'
    reinitializeDemo()
  })
}

// start tutorial
loadJson().then(run)
