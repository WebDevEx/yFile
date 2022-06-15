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
  Class,
  GraphComponent,
  GraphViewerInputMode,
  HierarchicLayout,
  ICommand,
  IModelItem,
  LayoutExecutor,
  License,
  PolylineEdgeStyle,
  Size,
  TimeSpan
} from 'yfiles'

import loadJson from '../../resources/load-json.js'
import { bindAction, bindChangeListener, bindCommand, showApp } from '../../resources/demo-app.js'
import { webGlSupported } from '../../utils/Workarounds.js'

import { AnimationController } from './AnimationController.js'
import { ProcessingStepNodeStyle } from './ProcessingStepNodeStyle.js'

import { addHeatMap } from './Heatmap.js'
import { createSampleGraph } from './SampleGraphCreator.js'
import { installProcessItemVisual } from './ProcessItemVisual.js'
import { simulateRandomWalks } from './Simulator.js'

// We need to load the LayoutExecutor explicitly to prevent the webpack
// tree shaker from removing this dependency which is needed for 'morphLayout' in this demo.
Class.ensure(LayoutExecutor)

/**
 * Initializes the graph and wires up the UI
 * @param {!object} license
 * @returns {!Promise}
 */
async function initialize(license) {
  if (!webGlSupported) {
    document.getElementById('no-webgl-support').removeAttribute('style')
    showApp(null)
    return
  }

  // set the yfiles license
  License.value = license

  // create a GraphComponent
  const graphComponent = new GraphComponent('#graphComponent')
  // create an input mode
  graphComponent.inputMode = new GraphViewerInputMode()

  // add the item visualizer
  const processItemVisual = installProcessItemVisual(graphComponent)

  // add the heatmap visualization
  const getHeat = item => {
    // we define the heat as the ratio of the current heat value to the items capacity, but not more than 1
    return Math.min(1, item.tag.heat.getValue(processItemVisual.time) / item.tag.capacity)
  }
  addHeatMap(graphComponent, getHeat)

  // create and configure a default node and edge styles style
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new ProcessingStepNodeStyle(
    node => quantize(getHeat(node)),
    node => node.tag.label
  )
  graph.nodeDefaults.size = new Size(150, 30)
  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px solid #33a',
    targetArrow: '#33a default',
    smoothingLength: 10
  })

  // load the sample graph
  createSampleGraph(graph)

  // apply an automatic layout
  graph.applyLayout(new HierarchicLayout())
  graphComponent.fitGraphBounds()

  // run the simulation
  const maxTime = simulateRandomWalks(graph, processItemVisual) + 1

  // wire up the controls
  const input = document.querySelector("[data-command='MaximumDuration']")
  function setProgress(progress) {
    processItemVisual.time = progress * maxTime
    input.value = String(progress * 100)
  }

  // initialize the animation and controls
  const animationController = new AnimationController(
    graphComponent,
    TimeSpan.fromSeconds(maxTime),
    setProgress
  )

  // initialize the demo
  showApp(graphComponent)

  // setup the remainder of the UI
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)
  bindChangeListener("input[data-command='MaximumDuration']", value => {
    if (!animationController.running) {
      setProgress(Number(value) / 100)
      graphComponent.invalidate()
    }
  })
  bindAction("button[data-command='start-animation']", () => animationController.restartAnimation())

  // and start the playback of the simulation
  await animationController.runAnimation()
}

/**
 * Helper function to quantize a value to multiples of 1/30th.
 * @param {number} value
 * @returns {number}
 */
function quantize(value) {
  return Math.floor(value * 30) / 30
}

loadJson()
  .then(initialize)
  .catch(reason => alert(reason))
