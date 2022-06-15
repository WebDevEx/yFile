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
/* global d3 */

import NetworkMonitoringNodeStyle from './NetworkMonitoringNodeStyle.js'

/**
 * A class for creating a bar chart.
 */
export default class D3BarChart {
  constructor() {
    this.$currentNode = null

    this.chartMargin = {
      top: 0,
      right: 0,
      bottom: 10,
      left: 30
    }
    this.chartWidth = 250 - this.chartMargin.left - this.chartMargin.right
    this.chartHeight = 75 - this.chartMargin.top - this.chartMargin.bottom

    this.chart = d3
      .select('.chart')
      .attr('width', this.chartWidth + this.chartMargin.left + this.chartMargin.right)
      .attr('height', this.chartHeight + this.chartMargin.top + this.chartMargin.bottom)

    const y = d3.scaleLinear().domain([0, 1]).range([this.chartHeight, 5])

    const yAxis = d3.axisLeft(y).ticks(3, '.6')

    this.chart.append('g').attr('class', 'y axis').attr('transform', 'translate(25,0)').call(yAxis)

    // d3.tip positioning doesn't work properly in Firefox (see https://github.com/Caged/d3-tip/issues/56).
    // To compensate for this, we position it in Firefox with an offset.
    const tipOffset = navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 12 : 0

    this.tip = d3
      .tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([-10, tipOffset])
      .html(
        (d, i) =>
          `<strong>Load:</strong> <span style='color:${NetworkMonitoringNodeStyle.convertLoadToColor(
            d,
            1
          )}'>${(d * 100).toFixed(0)}%</span>`
      )

    d3.select('.chart').call(this.tip)
  }

  /** @type {INode} */
  set currentNode(value) {
    this.$currentNode = value
  }

  /** @type {INode} */
  get currentNode() {
    return this.$currentNode
  }

  /**
   * Show the data of the given node as a bar chart.
   * @param {INode} node
   */
  barChart(node) {
    if (!node) {
      return
    }

    // Store the data
    this.currentNode = node

    // Extract the last load, since it is the current value
    const currentBarLoad = [node.tag.loadHistory[node.tag.loadHistory.length - 1]]
    const remainingLoads = node.tag.loadHistory.slice(0, node.tag.loadHistory.length - 1)

    // Width of each bar
    const currentBarWidth = (this.chartWidth / remainingLoads.length) * 2
    const barWidth = (this.chartWidth - currentBarWidth) / remainingLoads.length

    // Use linear y-axis scaling from 0 to 1
    const y = d3
      .scaleLinear()
      .domain([0, 1])
      .range([this.chartHeight - 1, 5])

    // Bind the data to the surrounding bar elements
    const groups = this.chart.selectAll('.bar').data(remainingLoads)

    // Add new bars on entering of new data which consist of ...
    const newGroups = groups
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d, i) => `translate(${i * barWidth + this.chartMargin.left},0)`)

    // ... the actual bar element
    newGroups
      .append('rect')
      .style('fill', d => NetworkMonitoringNodeStyle.convertLoadToColor(d, 0.75))
      .attr('y', d => y(d))
      .attr('height', d => this.chartHeight - y(d))
      .attr('width', barWidth - 1)
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide)

    // Update the already constructed bars and labels if no new data is added
    groups
      .select('rect')
      .style('fill', d => NetworkMonitoringNodeStyle.convertLoadToColor(d, 0.75))
      .attr('y', d => y(d))
      .attr('height', d => this.chartHeight - y(d))

    // Remove bars which are no longer bound to data in the current data set
    groups.exit().remove()

    // The same pattern is applied to the special 'now'-bar also
    // Bind data
    const currentGroup = this.chart.selectAll('.current-load').data(currentBarLoad)

    // Enter new data
    const newCurrentGroup = currentGroup
      .enter()
      .append('g')
      .attr('class', 'current-load')
      .attr(
        'transform',
        (d, i) => `translate(${this.chartMargin.left + remainingLoads.length * barWidth},0)`
      )

    newCurrentGroup
      .append('rect')
      .style('fill', d => NetworkMonitoringNodeStyle.convertLoadToColor(d, 1))
      .attr('y', d => y(d))
      .attr('height', d => this.chartHeight - y(d))
      .attr('width', currentBarWidth - 1)
      .on('mouseover', this.tip.show)
      .on('mouseout', this.tip.hide)

    newCurrentGroup
      .append('text')
      .attr('x', currentBarWidth / 2)
      .attr('y', this.chartHeight)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text('\u25B2')

    // Update data
    currentGroup
      .select('rect')
      .style('fill', d => NetworkMonitoringNodeStyle.convertLoadToColor(d, 1))
      .attr('y', d => y(d))
      .attr('height', d => this.chartHeight - y(d))

    // Remove old data
    currentGroup.exit().remove()
  }

  /**
   * Updates the current chart.
   */
  updateCurrentChart() {
    if (this.currentNode) {
      this.barChart(this.currentNode)
    }
  }
}
