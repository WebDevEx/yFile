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
// This file provides type constants and corresponding isXYZType() methods for Flowchart symbols.
// These constants and methods are used by FlowchartLayout and its associated classes to identify specific
// nodes and handle them appropriately.

/**
 * {@link IDataProvider} key used to specify the flowchart specific type of each node.
 * Valid are all node type constants specified by class {@link FlowchartElements}.
 * @type {Object}
 */
export const NODE_TYPE_DP_KEY = 'FlowchartLayout.NODE_TYPE_DP_KEY'

/**
 * {@link IDataProvider} key used to specify the flowchart specific type of each edge.
 * Valid are all edge type constants specified by class {@link FlowchartElements}.
 * @type {Object}
 */
export const EDGE_TYPE_DP_KEY = 'FlowchartLayout.EDGE_TYPE_DP_KEY'

/**
 * Type constant for an invalid type.
 * @type {number}
 */
export const TYPE_INVALID = 0

/**
 * Type constant for an event type.
 * @type {number}
 */
export const NODE_TYPE_EVENT = 1

/**
 * Type constant for a start event type.
 * @type {number}
 */
export const NODE_TYPE_START_EVENT = 7

/**
 * Type constant for a end event type.
 * @type {number}
 */
export const NODE_TYPE_END_EVENT = 9

/**
 * Type constant for a decision type.
 * @type {number}
 */
export const NODE_TYPE_DECISION = 2

/**
 * Type constant for a process type.
 * @type {number}
 */
export const NODE_TYPE_PROCESS = 3

/**
 * Type constant for a group type.
 * @type {number}
 */
export const NODE_TYPE_GROUP = 8

/**
 * Type constant for a annotation type.
 * @type {number}
 */
export const NODE_TYPE_ANNOTATION = 10

/**
 * Type constant for a pool type.
 * @type {number}
 */
export const NODE_TYPE_POOL = 12

/**
 * Type constant for a data type.
 * @type {number}
 */
export const NODE_TYPE_DATA = 11

/**
 * Type constant for a connection type (sequence flow).
 * @type {number}
 */
export const EDGE_TYPE_SEQUENCE_FLOW = 4

/**
 * Type constant for a connection type (message flow).
 * @type {number}
 */
export const EDGE_TYPE_MESSAGE_FLOW = 5

/**
 * Type constant for a connection type (association).
 * @type {number}
 */
export const EDGE_TYPE_ASSOCIATION = 6

/**
 * Returns true for activity nodes.
 * For Flowcharts, this are Process, Data, and Group. For BPMN, this are Task and
 * Sub-Process.
 * @param {Graph} graph
 * @param {YNode} node
 * @return {boolean}
 */
export function isActivity(graph, node) {
  const type = getType(graph, node)
  return type === NODE_TYPE_PROCESS || type === NODE_TYPE_DATA || type === NODE_TYPE_GROUP
}

/**
 * Returns true for group nodes.
 * For BPMN, this is Sub-Process.
 * @param {Graph} graph
 * @param {YNode} node
 * @return {boolean}
 */
export function isGroup(graph, node) {
  return getType(graph, node) === NODE_TYPE_GROUP
}

/**
 * Returns true for annotation nodes.
 * @param {Graph} graph
 * @param {YNode} node
 * @return {boolean}
 */
export function isAnnotation(graph, node) {
  return getType(graph, node) === NODE_TYPE_ANNOTATION
}

/**
 * Returns true for event nodes.
 * For Flowchart, this are start and terminator, delay, display, manual operation and
 * preparation. For BPMN, this are start, end and other events.
 * @param {Graph} graph
 * @param {YNode} node
 * @return {boolean}
 */
export function isEvent(graph, node) {
  const type = getType(graph, node)
  return type === NODE_TYPE_START_EVENT || type === NODE_TYPE_EVENT || type === NODE_TYPE_END_EVENT
}

/**
 * Returns true for start event nodes.
 * @param {Graph} graph
 * @param {YNode} node
 * @return {boolean}
 */
export function isStartEvent(graph, node) {
  return getType(graph, node) === NODE_TYPE_START_EVENT
}

/**
 * @param {Graph} graph
 * @param {Edge} edge
 * @return {boolean}
 */
export function isUndefined(graph, edge) {
  return getType(graph, edge) === TYPE_INVALID
}

/**
 * @param {Graph} graph
 * @param {Edge} edge
 * @return {boolean}
 */
export function isRegularEdge(graph, edge) {
  return getType(graph, edge) === EDGE_TYPE_SEQUENCE_FLOW
}

/**
 * @param {Graph} graph
 * @param {Edge} edge
 * @return {boolean}
 */
export function isMessageFlow(graph, edge) {
  return getType(graph, edge) === EDGE_TYPE_MESSAGE_FLOW
}

/**
 * @param {Graph} graph
 * @param {Edge} edge
 * @return {number}
 */
export function getFlowchartEdgeType(graph, edge) {
  const dataProvider = graph.getDataProvider(EDGE_TYPE_DP_KEY)
  return dataProvider === null ? TYPE_INVALID : dataProvider.getInt(edge)
}

/**
 * @param {Graph} graph
 * @param {YNode} dataHolder
 * @return {number}
 */
function getType(graph, dataHolder) {
  const dataProvider = graph.getDataProvider(NODE_TYPE_DP_KEY)
  return dataProvider === null ? TYPE_INVALID : dataProvider.getInt(dataHolder)
}
