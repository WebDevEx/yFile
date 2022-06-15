/**
 * @license
 * This app exhibits yFiles for HTML functionalities.
 * Copyright (c) 2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 * 72070 Tuebingen, Germany. All rights reserved.
 *
 * yFiles demo files exhibit yFiles for HTML functionalities.
 * Any redistribution of demo files in source code or binary form, with
 * or without modification, is not permitted.
 *
 * Owners of a valid software license for a yFiles for HTML
 * version are allowed to use the app source code as basis for their
 * own yFiles for HTML powered applications. Use of such programs is
 * governed by the rights and conditions as set out in the yFiles for HTML
 * license agreement. If in doubt, please mail to contact@yworks.com.
 *
 * THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import { limit } from './Limit'
import {
  buildEdgeCreator,
  buildEdgesSourceData,
  buildGraph,
  buildLabelConfiguration,
  buildNodeCreator,
  buildNodesSourceData,
} from './GraphBuilder'
import { arrange } from './Layout'
import { runCypherQuery } from './Neo4jLoader'

/**
 * This is automatically generated source code. It is largely undocumented and not necessarily
 * instructive, nor the best way to solve a given task. If you want to learn more about the
 * yFiles API, as a starting point, please consider the more instructive source code tutorial and
 * more than 200 examples on https://live.yworks.com - you will also find the complete sources to
 * these demos for you to play with as part of the evaluation package and online at
 * https://github.com/yWorks/yfiles-for-html-demos/
 * The API documentation is also available online, here: https://docs.yworks.com/yfileshtml - Enjoy!
 */
export default async function loadGraph() {
  const { labelConfiguration } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: {
        type: 'expression',
        value: '"isu_sum:"+properties.isu_sum',
      },
      placement: { type: 'constant', value: 'bottomright' },
      fill: { type: 'expression', value: '' },
    }
  )
  const {
    labelConfiguration: labelConfiguration2,
  } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: { type: 'expression', value: '"i-node:"+properties.inode' },
      placement: { type: 'constant', value: 'topright' },
      fill: { type: 'expression', value: '' },
    }
  )
  const {
    labelConfiguration: labelConfiguration3,
  } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: {
        type: 'expression',
        value: '"text:\\n"+ properties.Label.substring(0,20)',
      },
      placement: { type: 'constant', value: 'center' },
      fill: { type: 'constant', value: '' },
    }
  )
  const {
    labelConfiguration: labelConfiguration4,
  } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: { type: 'expression', value: 'type' },
      placement: { type: 'expression', value: 'center' },
      fill: { type: 'constant', value: '' },
    }
  )
  const { edgeCreator } = await buildEdgeCreator(
    { labelConfigurations: [labelConfiguration4] },
    {
      tagProvider: { type: 'expression', value: '' },
      stroke: { type: 'constant', value: 'black' },
      fill: { type: 'expression', value: '' },
      sourceArrow: { type: 'constant', value: 'Default' },
      targetArrow: { type: 'constant', value: 'Default' },
    }
  )
  const {
    labelConfiguration: labelConfiguration5,
  } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: { type: 'expression', value: '"ISU:"+properties.isu' },
      placement: { type: 'constant', value: 'bottomleft' },
      fill: { type: 'constant', value: '' },
    }
  )
  const {
    labelConfiguration: labelConfiguration6,
  } = await buildLabelConfiguration(
    {},
    {
      labelsBinding: { type: 'expression', value: '' },
      textBinding: { type: 'expression', value: '"KDM:"+properties.KDM' },
      placement: { type: 'constant', value: 'topleft' },
      fill: { type: 'expression', value: '' },
    }
  )
  const { nodeCreator } = await buildNodeCreator(
    {
      labelConfigurations: [
        labelConfiguration6,
        labelConfiguration5,
        labelConfiguration3,
        labelConfiguration2,
        labelConfiguration,
      ],
    },
    {
      tagProvider: { type: 'expression', value: '' },
      isGroupProvider: { type: 'expression', value: '' },
      styleBindings: '',
      layout: { type: 'expression', value: '' },
      x: { type: 'expression', value: '' },
      y: { type: 'expression', value: '' },
      width: {
        type: 'expression',
        value: 'properties.isu_sum > 10  ? 300:150',
      },
      height: { type: 'expression', value: '100' },
      styleProvider: 'ShapeNodeStyle',
      fill: {
        type: 'expression',
        value: "properties.KDM === 'CallableUnit' ? '#85a1c2':'#e8cb87'",
      },
      shape: { type: 'constant', value: 'Rectangle' },
      stroke: {
        type: 'expression',
        value: 'properties.isu_sum > 10  ? thick:medium',
      },
      image: { type: 'constant', value: '' },
    }
  )
  const { nodes, relations, data } = await runCypherQuery(
    {},
    {
      url: 'neo4j+s://tex.veriprism.net:7687',
      loadRelations: false,
      databaseName: '',
      username: 'neo4j',
      password: 'S11ngSh0T',
      query:
        "MATCH (p:ProgNode {compileunit:'Way-Duy_User-Task-Manager', release:1})-[d:RUNS]->(m) RETURN m, d, p limit 100",
    }
  )
  const { edgesSource } = await buildEdgesSourceData(
    { data: relations, edgeCreator },
    {
      idProvider: { type: 'expression', value: 'id' },
      sourceIdProvider: { type: 'expression', value: 'startId' },
      targetIdProvider: { type: 'expression', value: 'endId' },
    }
  )
  const { out } = await limit({ in: nodes }, { strategy: 'first', limit: 276 })
  const { nodesSource } = await buildNodesSourceData(
    { data: out, nodeCreator },
    {
      idProvider: { type: 'expression', value: 'id' },
      parentIdProvider: { type: 'expression', value: '' },
    }
  )
  const { graph } = await buildGraph(
    { nodesSources: [nodesSource], edgesSources: [edgesSource] },
    {}
  )
  const { out: out2 } = await arrange(
    { in: graph },
    {
      layoutStyle: 'tree',
      layoutOrientation: 'top-to-bottom',
      edgeLabeling: false,
      edgeLength: 40,
      nodeDistance: 121,
      edgeGrouping: false,
      compactness: 0.5,
      gridSpacing: 20,
      circularLayoutStyle: 'bcc-compact',
    }
  )

  return out2
}
