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
import { addClass } from '../../resources/demo-app.js'

export default class OrgChartPropertiesView {
  /**
   * Creates a new OrgChartPropertiesView
   * @param {Element} element The DOM element that will be filled with the properties.
   * @param {function(INode)} selectAndZoomToNodeWithEmail - the function will be called when clicking
   *   on email links in the View
   */
  constructor(element, selectAndZoomToNodeWithEmail) {
    this.element = element
    this.selectAndZoomToNodeWithEmail = selectAndZoomToNodeWithEmail
  }

  showProperties(node) {
    this.clear()

    if (node == null || node.tag == null) {
      return
    }

    // When the graph is created from the source data by class TreeSource,
    // The source data for each node is attached to the node as it's tag.
    const employee = node.tag
    const heading = document.createElement('div')
    addClass(heading, 'user-detail')
    this.element.appendChild(heading)
    // The employee name
    heading.appendChild(createElement('h2', employee.name))
    heading.appendChild(createElement('div', employee.position))

    const svgIcon = this.createSVGIcon(employee.icon, 50, 50, '0 0 75 75')
    if (svgIcon !== null) {
      heading.appendChild(svgIcon)
    }

    // Display the individual properties
    const table = document.createElement('table')
    this.element.appendChild(table)
    // The employee business unit
    let tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Dept.'))
    tr.appendChild(createElement('td', employee.businessUnit))
    // The employee email
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Email'))
    tr.appendChild(createElement('td', employee.email))
    // The employee phone
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Phone'))
    tr.appendChild(createElement('td', employee.phone))
    // The employee fax
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Fax'))
    tr.appendChild(createElement('td', employee.fax))
    // The employee status
    tr = document.createElement('tr')
    table.appendChild(tr)
    tr.appendChild(createElement('td', 'Status'))
    const statusTd = document.createElement('td')
    tr.appendChild(statusTd)
    statusTd.appendChild(this.createSVGIcon(`${employee.status}_icon`, 100, 15, '0 2.5 70 5'))

    // Create links to the parent and colleague nodes.
    // (Note that the parent references are added to the
    // source data in method demo.OrgChartDemo#addParentReferences()).
    const parent = employee.parent
    if (typeof parent !== 'undefined') {
      const parentTr = document.createElement('tr')
      parentTr.appendChild(createElement('td', 'Superior'))
      const parentTd = document.createElement('td')
      parentTd.appendChild(this.createLinkEntry(parent))
      parentTr.appendChild(parentTd)
      table.appendChild(parentTr)

      const colleagues = parent.subordinates
      if (typeof colleagues !== 'undefined' && colleagues.length > 1) {
        const colleagueTr = document.createElement('tr')
        colleagueTr.appendChild(createElement('td', 'Colleagues'))
        const colleagueTd = document.createElement('td')
        colleagues.forEach(colleague => {
          if (colleague !== employee) {
            if (colleagueTd.childElementCount > 0) {
              colleagueTd.appendChild(document.createTextNode(', '))
            }
            colleagueTd.appendChild(this.createLinkEntry(colleague))
          }
        }, this)
        colleagueTr.appendChild(colleagueTd)
        table.appendChild(colleagueTr)
      }
    }

    // Create links to subordinate nodes
    const subs = employee.subordinates
    if (typeof subs !== 'undefined') {
      const subTr = document.createElement('tr')
      subTr.appendChild(createElement('td', 'Subordinates'))
      const subTd = document.createElement('td')
      subs.forEach(sub => {
        if (subTd.childElementCount > 0) {
          subTd.appendChild(document.createTextNode(', '))
        }
        subTd.appendChild(this.createLinkEntry(sub))
      }, this)
      subTr.appendChild(subTd)
      table.appendChild(subTr)
    }
  }

  // Creates an SVG element that references the provided SVG icon, e.g.:
  // <svg width="50" height="50"><use xlink:href="#usericon_male1"></use></svg>
  /**
   * Creates an SVG element that references the provided SVG icon, e.g.:
   * <svg width="50" height="50"><use xlink:href="#usericon_male1"></use></svg>
   * @param {object} iconRef
   * @param {number} width
   * @param {number} height
   * @param {string} viewBox
   * @return {*}
   */
  createSVGIcon(iconRef, width, height, viewBox) {
    const svgNS = 'http://www.w3.org/2000/svg'
    const xlinkNS = 'http://www.w3.org/1999/xlink'
    const svgElement = document.createElementNS(svgNS, 'svg')
    const useElement = document.createElementNS(svgNS, 'image')
    useElement.setAttributeNS(xlinkNS, 'xlink:href', './resources/' + iconRef + '.svg')
    svgElement.setAttribute('width', width)
    svgElement.setAttribute('height', height)
    svgElement.setAttribute('viewBox', viewBox)
    svgElement.appendChild(useElement)
    return svgElement
  }

  /**
   * clicking a link to another employee in the properties view will select
   * and zoom to the corresponding node in the organization chart.
   * We use the E-Mail address to identify individual employees.
   * @param {object} employee
   */
  createLinkEntry(employee) {
    const element = createElement('a', employee.name)
    element.setAttribute('href', '#')
    element.addEventListener('click', event => {
      this.selectAndZoomToNodeWithEmail(employee.email)
      event.preventDefault()
    })
    return element
  }

  clear() {
    this.element.innerHTML = ''
  }
}

/**
 * Creates a DOM element with the specified text content
 * @returns {HTMLElement}
 */
function createElement(tagName, textContent) {
  const element = document.createElement(tagName)
  element.textContent = textContent
  return element
}
