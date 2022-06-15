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
  GraphBuilder,
  GraphComponent,
  GraphMLIOHandler,
  GraphMLSupport,
  GraphViewerInputMode,
  IArrow,
  ICommand,
  License,
  PolylineEdgeStyle,
  Rect,
  Size,
  StorageLocation
} from 'yfiles'

import SampleData from './resources/sample.js'
import VuejsNodeStyleMarkupExtension from '../../utils/VuejsNodeStyleMarkupExtension.js'
import VuejsNodeStyle from '../../utils/VuejsNodeStyle.js'
import {
  addClass,
  bindAction,
  bindCommand,
  removeClass,
  showApp
} from '../../resources/demo-app.js'
import loadJson from '../../resources/load-json.js'

/** @type {GraphComponent} */
let graphComponent = null

/** @type {GraphMLIOHandler} */
let graphmlHandler = null

/** @type {HTMLElement} */
let templateTextArea = null

/** @type {HTMLElement} */
let tagTextArea = null

/** @type {GraphMLSupport} */
let gs = null

function run(licenseData) {
  License.value = licenseData
  graphComponent = new GraphComponent('graphComponent')
  graphComponent.inputMode = new GraphViewerInputMode()

  // initialize demo
  initializeTextAreas()
  initializeStyles()
  initializeIO()
  loadSampleGraph()
  registerCommands()

  showApp(graphComponent)
}

/**
 * Initializes text areas to use CodeMirror and to update when the selection in the graph has
 * changed.
 */
function initializeTextAreas() {
  templateTextArea = document.getElementById('template-text-area')
  // eslint-disable-next-line no-undef
  templateTextArea = CodeMirror.fromTextArea(templateTextArea, {
    lineNumbers: true,
    mode: 'application/xml',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  })
  tagTextArea = document.getElementById('tag-text-area')
  // eslint-disable-next-line no-undef
  tagTextArea = CodeMirror.fromTextArea(tagTextArea, {
    lineNumbers: true,
    mode: 'application/json',
    gutters: ['CodeMirror-lint-markers'],
    lint: true
  })
  graphComponent.selection.addItemSelectionChangedListener(() => {
    const selectedNode = graphComponent.selection.selectedNodes.firstOrDefault()
    if (selectedNode) {
      if (VuejsNodeStyle.isInstance(selectedNode.style)) {
        templateTextArea.setOption('readOnly', false)
        templateTextArea.setValue(selectedNode.style.template)
      } else {
        templateTextArea.setOption('readOnly', true)
        templateTextArea.setValue('Style is not an instance of VuejsNodeStyle.')
      }
      tagTextArea.setOption('readOnly', false)
      tagTextArea.setValue(selectedNode.tag ? JSON.stringify(selectedNode.tag, null, 2) : '{}')
      document.getElementById('apply-template-button').disabled = false
      document.getElementById('apply-tag-button').disabled = false
    } else {
      templateTextArea.setOption('readOnly', 'nocursor')
      tagTextArea.setOption('readOnly', 'nocursor')
      templateTextArea.setValue('Select a node to edit its template.')
      tagTextArea.setValue('Select a node to edit its tag.')
      document.getElementById('apply-template-button').disabled = true
      document.getElementById('apply-tag-button').disabled = true
    }
  })
}

/**
 * Initializes the default styles for the graph. By default org-chart nodes are used.
 */
function initializeStyles() {
  const graph = graphComponent.graph
  graph.nodeDefaults.style = new VuejsNodeStyle(`<g>
<rect fill="#C0C0C0" :width="layout.width" :height="layout.height" x="2" y="2"></rect>
<rect :fill="localUrl('bottomGradient')" stroke="#C0C0C0" :width="layout.width" :height="layout.height"></rect>
<rect v-if="tag.status === 'present'" :width="layout.width" height="2" fill="#55B757"></rect>
<rect v-else-if="tag.status === 'busy'" :width="layout.width" height="2" fill="#E7527C"></rect>
<rect v-else-if="tag.status === 'travel'" :width="layout.width" height="2" fill="#9945E9"></rect>
<rect v-else-if="tag.status === 'unavailable'" :width="layout.width" height="2" fill="#8D8F91"></rect>
<rect fill='transparent' :stroke="selected ? '#FFBB33' : 'transparent'" stroke-width="3" :width="layout.width-3" :height="layout.height-3" x="1.5" y="1.5"></rect>
<template v-if="zoom >= 0.7">
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="10" width="63.75" height="63.75"></image>
  <image :xlink:href="'./resources/' + tag.status + '_icon.svg'" x="25" y="80" height="15" width="60"></image>
  <g style="font-family: Roboto,sans-serif; fill: #444" width="185">
    <text transform="translate(90 25)" style="font-size: 16px; fill: #336699">{{tag.name}}</text>
    <text transform="translate(90 45)" style="text-transform: uppercase">{{tag.position}}</text>
    <text transform="translate(90 72)">{{tag.email}}</text>
    <text transform="translate(90 88)">{{tag.phone}}</text>
    <text transform="translate(170 88)">{{tag.fax}}</text>
  </g>
</template>
<template v-else>
  <image :xlink:href="'./resources/' + tag.icon + '.svg'" x="15" y="20" width="56.25" height="56.25"></image>
  <g style="font-size: 15px; font-family: Roboto,sans-serif; fill: #444" width="185">
    <text transform="translate(85 40)" style="font-size: 26px; fill: #336699">{{tag.name}}</text>
    <svg-text :content="tag.position.toUpperCase()" x="85" y="50" :width="layout.width - 100" :height="50" :wrapping="4" font-family="sans-serif" :font-size="14" :font-style="0" :font-weight="0" :text-decoration="0" fill="black" :opacity="1" visible="true" :clipped="true" align="start" transform=""></svg-text>
  </g>
</template>
<defs>
  <linearGradient :id="localId('bottomGradient')" x1="0%" y1="100%" x2="0%" y2="0%">
    <stop offset="0%" v-if="tag.status === 'present'" style="stop-color:#55B757;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'busy'" style="stop-color:#E7527C;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'travel'" style="stop-color:#9945E9;stop-opacity:1"/>
    <stop offset="0%" v-else-if="tag.status === 'unavailable'" style="stop-color:#8D8F91;stop-opacity:1"/>
    <stop offset="5%" style="stop-color:white;stop-opacity:1" />
  </linearGradient>
</defs>

</g>`)
  graph.nodeDefaults.size = new Size(290, 100)
  graph.nodeDefaults.shareStyleInstance = false

  graph.edgeDefaults.style = new PolylineEdgeStyle({
    stroke: '2px rgb(170, 170, 170)',
    targetArrow: IArrow.NONE
  })
}

/**
 * Initializes GraphML writing and reading for files containing VuejsNodeStyle.
 */
function initializeIO() {
  graphmlHandler = new GraphMLIOHandler()
  // enable serialization of the VueJS node style - without a namespace mapping, serialization will fail
  graphmlHandler.addXamlNamespaceMapping(
    'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
    { VuejsNodeStyle: VuejsNodeStyleMarkupExtension }
  )
  graphmlHandler.addNamespace(
    'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
    'VuejsNodeStyle'
  )
  graphmlHandler.addHandleSerializationListener((sender, args) => {
    const item = args.item
    const context = args.context
    if (item instanceof VuejsNodeStyle) {
      const vuejsNodeStyleMarkupExtension = new VuejsNodeStyleMarkupExtension()
      vuejsNodeStyleMarkupExtension.template = item.template
      context.serializeReplacement(
        VuejsNodeStyleMarkupExtension.$class,
        item,
        vuejsNodeStyleMarkupExtension
      )
      args.handled = true
    }
  })
  gs = new GraphMLSupport({
    graphComponent,
    graphMLIOHandler: graphmlHandler,
    storageLocation: StorageLocation.FILE_SYSTEM
  })
}

/**
 * Loads the sample graph.
 */
function loadSampleGraph() {
  graphComponent.graph.clear()
  const defaultNodeSize = graphComponent.graph.nodeDefaults.size
  const graphBuilder = new GraphBuilder(graphComponent.graph)
  graphBuilder.createNodesSource({
    data: SampleData.nodes,
    id: 'id',
    // This example uses hard coded locations. If no predefined layout data is given, an automatic layout could have
    // been applied to the graph after buildGraph, which is a common use case. For example, see the OrgChart Demo
    // (/demos-js/complete/interactiveorgchart/)
    layout: data =>
      new Rect(data.layout.x, data.layout.y, defaultNodeSize.width, defaultNodeSize.height)
  })
  graphBuilder.createEdgesSource(SampleData.edges, 'src', 'tgt')

  graphBuilder.addEdgeCreatedListener((src, args) => {
    const edge = args.item
    if (edge.tag.bends) {
      edge.tag.bends.forEach(bend => {
        args.graph.addBend(edge, bend)
      })
    }
  })

  const graph = graphBuilder.buildGraph()
  graphComponent.fitGraphBounds(30)

  graphComponent.selection.setSelected(graph.nodes.last(), true)
}

/**
 * Wires up the UI. Buttons are linked with their according actions.
 */
function registerCommands() {
  bindAction("button[data-command='Open']", async () => {
    try {
      await gs.openFile(graphComponent.graph)
      graphComponent.fitGraphBounds()
    } catch (ignored) {
      alert(
        'The graph contains styles that are not supported by this demo. This demo works best when nodes have VuejsNodeStyle created by this demo or "Node Template Designer".'
      )
      graphComponent.graph.clear()
    }
  })
  bindCommand("button[data-command='Save']", ICommand.SAVE, graphComponent)
  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindAction("button[data-command='ApplyTemplate']", () => {
    if (graphComponent.selection.selectedNodes.size === 0) {
      return
    }
    const templateText = templateTextArea.getValue()
    const style = new VuejsNodeStyle(templateText)
    try {
      // check if style is valid
      style.renderer
        .getVisualCreator(graphComponent.selection.selectedNodes.first(), style)
        .createVisual(graphComponent.createRenderContext())

      graphComponent.selection.selectedNodes.forEach(node => {
        graphComponent.graph.setStyle(node, style)
      })

      removeClass(document.getElementById('template-text-area-error'), 'open-error')
    } catch (error) {
      const errorarea = document.getElementById('template-text-area-error')
      const errorString = error.toString().replace(templateText, '...template...')
      errorarea.setAttribute('title', errorString)
      addClass(errorarea, 'open-error')
    }
  })
  bindAction("button[data-command='ApplyTag']", () => {
    const errorarea = document.getElementById('tag-text-area-error')
    graphComponent.selection.selectedNodes.forEach(node => {
      try {
        node.tag = JSON.parse(tagTextArea.getValue())
        removeClass(errorarea, 'open-error')
      } catch (error) {
        addClass(errorarea, 'open-error')
        errorarea.setAttribute('title', error.toString())
      }
    })
    graphComponent.invalidate()
  })

  bindAction("button[data-command='Reload']", () => {
    loadSampleGraph(graphComponent.graph)
  })
}

loadJson().then(run)
