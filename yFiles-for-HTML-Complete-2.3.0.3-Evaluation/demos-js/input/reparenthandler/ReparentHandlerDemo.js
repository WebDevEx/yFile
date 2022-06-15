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
import { GraphComponent, GraphEditorInputMode, IGraph, License, Rect } from 'yfiles'
import { showApp } from '../../resources/demo-app.js'
import { initDemoStyles, DemoNodeStyle, DemoGroupStyle } from '../../resources/demo-styles.js'
import DemoReparentNodeHandler from './DemoReparentNodeHandler.js'
import loadJson from '../../resources/load-json.js'
function run(licenseData) {
  License.value = licenseData
  // initialize the GraphComponent
  const graphComponent = new GraphComponent('graphComponent')
  const graph = graphComponent.graph

  // Create a default editor input mode and configure it
  const graphEditorInputMode = new GraphEditorInputMode({
    // Assign the custom reparent handler of this demo
    reparentNodeHandler: new DemoReparentNodeHandler(),
    allowGroupingOperations: true,
    // Just for user convenience: disable node, group node, edge creation and clipboard operations
    allowCreateEdge: false,
    allowCreateNode: false,
    allowGroupSelection: false,
    allowClipboardOperations: false
  })
  // and enable the undo feature.
  graph.undoEngineEnabled = true

  // Initialize the default style of the nodes and edges
  initDemoStyles(graph)

  // Finally, set the input mode to the graph component.
  graphComponent.inputMode = graphEditorInputMode

  createSampleGraph(graph)

  showApp(graphComponent)
}

/**
 * Creates the sample graph of this DemoStyles.
 * @param {IGraph} graph
 */
function createSampleGraph(graph) {
  // Create some group nodes
  const group1 = createGroupNode(graph, 100, 100, 'royalblue', 'Only Blue Children')
  const group2 = createGroupNode(graph, 160, 130, 'royalblue', 'Only Blue Children')
  const greenGroup = createGroupNode(graph, 100, 350, 'green', 'Only Green Children')
  createGroupNode(graph, 400, 350, 'green', 'Only Green Children')

  // And some regular nodes
  const blueNodeStyle = new DemoNodeStyle()
  blueNodeStyle.cssClass = 'royalblue'

  const greenNodeStyle = new DemoNodeStyle()
  greenNodeStyle.cssClass = 'green'

  const redNodeStyle = new DemoNodeStyle()
  redNodeStyle.cssClass = 'firebrick'

  const blueNode = graph.createNode(new Rect(110, 130, 30, 30), blueNodeStyle, 'royalblue')
  const greenNode = graph.createNode(new Rect(130, 380, 30, 30), greenNodeStyle, 'green')
  graph.createNode(new Rect(400, 100, 30, 30), redNodeStyle, 'firebrick')
  graph.createNode(new Rect(500, 100, 30, 30), greenNodeStyle, 'green')
  graph.createNode(new Rect(400, 200, 30, 30), blueNodeStyle, 'royalblue')
  graph.createNode(new Rect(500, 200, 30, 30), redNodeStyle, 'firebrick')

  graph.groupNodes(group1, [blueNode, group2])
  graph.groupNodes(greenGroup, [greenNode])

  // Ensure that the outer blue group completely contains its inner group
  graph.setNodeLayout(group1, new Rect(100, 100, 200, 150))
  // Uncomment the following line to adjust the bounds of the outer blue group automatically
  // graph.adjustGroupNodeLayout(group1);

  // clear undo after initial graph loading
  graph.undoEngine.clear()
}

/**
 * Creates a group node for the sample graph with a specific styling.
 * @param {IGraph} graph The given graph
 * @param {number} x The node's x-coordinate
 * @param {number} y The node's y-coordinate
 * @param {string} cssClass The given css class
 * @param {string} labelText The nodes label's text
 * @return {INode}
 */
function createGroupNode(graph, x, y, cssClass, labelText) {
  const groupNode = graph.createGroupNode()
  const groupNodeStyle = new DemoGroupStyle()
  groupNodeStyle.cssClass = cssClass

  graph.setStyle(groupNode, groupNodeStyle)
  graph.setNodeLayout(groupNode, new Rect(x, y, 130, 100))
  graph.addLabel(groupNode, labelText)
  groupNode.tag = cssClass

  return groupNode
}

// run the demo
loadJson().then(run)
