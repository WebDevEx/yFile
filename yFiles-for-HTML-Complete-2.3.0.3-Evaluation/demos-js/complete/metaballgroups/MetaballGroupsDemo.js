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
  BaseClass,
  Color,
  GraphComponent,
  GraphEditorInputMode,
  ICanvasObjectDescriptor,
  ICommand,
  IVisualCreator,
  LayoutExecutor,
  License,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  ShapeNodeStyle,
  Size
} from 'yfiles'
import WebglBlobVisual from './WebglBlobVisual.js'
import { bindAction, bindCommand, showApp } from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')

  // initialize the input mode
  graphComponent.inputMode = new GraphEditorInputMode({
    allowEditLabel: true,
    hideLabelDuringEditing: false,
    allowGroupingOperations: true
  })

  createSampleGraph()

  // add a blob visualization for the red group
  graphComponent.backgroundGroup.addChild(
    new BlobBackground(
      n =>
        n.style.fill.color.g < n.style.fill.color.r && n.style.fill.color.r >= n.style.fill.color.b,
      new Color(255, 128, 128, 196),
      120
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )

  // add a blob visualization for the blue group
  graphComponent.backgroundGroup.addChild(
    new BlobBackground(
      n =>
        n.style.fill.color.g < n.style.fill.color.b && n.style.fill.color.b >= n.style.fill.color.r,
      new Color(128, 128, 255, 196),
      150
    ),
    ICanvasObjectDescriptor.ALWAYS_DIRTY_INSTANCE
  )

  changeLayout()

  registerCommands()

  showApp(graphComponent)
}

const redStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: 'red', stroke: null })
const blueStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: 'blue', stroke: null })
const purpleStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: 'purple', stroke: null })
const greyStyle = new ShapeNodeStyle({ shape: 'ellipse', fill: 'gray', stroke: null })

/**
 * Creates the initial sample graph.
 */
function createSampleGraph() {
  const graph = graphComponent.graph

  graph.nodeDefaults.size = new Size(50, 50)
  graph.nodeDefaults.style = new ShapeNodeStyle({ shape: 'ellipse', fill: 'red' })

  graph.decorator.nodeDecorator.reshapeHandleProviderDecorator.hideImplementation()

  const styles = [greyStyle, redStyle, purpleStyle, blueStyle]
  for (const type of '0002211333000221333000221333000221333000221333000221333') {
    graph.createNode({ style: styles[Number(type)] })
  }
  const edges = (
    '0:1,0:2,1:2,8:9,9:7,7:8,5:6,1:9,3:6,4:6,6:8,10:11,10:12,11:12,17:18,18:16,16:17,' +
    '5:15,11:18,13:15,14:15,15:17,19:20,19:21,20:21,26:27,27:25,25:26,5:24,20:27,22:24,23:24,' +
    '24:26,28:29,28:30,29:30,35:36,36:34,34:35,5:33,29:36,31:33,32:33,33:35,37:38,37:39,38:39,' +
    '44:45,45:43,43:44,5:42,38:45,40:42,41:42,42:44,46:47,46:48,47:48,53:54,54:52,52:53,5:51,' +
    '47:54,49:51,50:51,51:53,21:12,10:2,0:37'
  )
    .split(',')
    .map(e => e.split(':').map(Number))

  const nodes = graph.nodes.toArray()
  for (const e of edges) {
    graph.createEdge(nodes[e[0]], nodes[e[1]])
  }

  graphComponent.fitGraphBounds()
}

/**
 * Modifies the tag of each leaf node.
 */
function changeLayout() {
  const organicLayout = new OrganicLayout({
    compactnessFactor: Math.random() * 0.8,
    preferredEdgeLength: 70 + Math.random() * 20,
    scope: OrganicLayoutScope.SUBSET
  })

  const organicLayoutData = new OrganicLayoutData({
    affectedNodes: graphComponent.graph.nodes
  })

  new LayoutExecutor({
    graphComponent,
    layout: organicLayout,
    layoutData: organicLayoutData,
    duration: '1s',
    animateViewport: true,
    easedAnimation: true
  }).start()
}

function registerCommands() {
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='ChangeLayout']", () => changeLayout())
}

/**
 * A background visual creator that produces the metaball groups.
 */
class BlobBackground extends BaseClass(IVisualCreator) {
  constructor(selector, color, size) {
    super()
    this.selector = selector
    this.size = size
    this.color = color
  }

  createVisual(renderContext) {
    return new WebglBlobVisual(
      renderContext.canvasComponent.graph.nodes
        .filter(this.selector)
        .map(n => n.layout.center.toPoint()),
      this.color,
      this.size
    )
  }

  updateVisual(renderContext, oldVisual) {
    return oldVisual
  }
}

/**
 * Whether the current browser supports WebGL rendering.
 * @returns {boolean}
 */
function hasWebGLSupport() {
  const canvas = document.createElement('canvas')
  return !!canvas.getContext('webgl') || !!canvas.getContext('experimental-webgl')
}

// start demo if the browser supports WebGL
if (hasWebGLSupport()) {
  loadJson().then(run)
} else {
  document.querySelector('#graphComponent').innerHTML = `
    <div style="padding: 50px">
      <p style="font-size: 2rem;">Your browser doesn't support WebGL.</p>
      <p> See <a href="https://www.khronos.org/webgl/" target="_blank">https://www.khronos.org/webgl/</a> and 
        <a href="https://caniuse.com/#search=webgl" target="_blank">caniuse.com</a> for details on browser support for WebGL.
      </p>
    </div>`
  showApp(graphComponent)
}
