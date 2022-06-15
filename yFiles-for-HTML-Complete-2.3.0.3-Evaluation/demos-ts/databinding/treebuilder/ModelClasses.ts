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
/**
 * Non-UI model classes for the tree builder demo
 */

import { StringTemplateNodeStyle, TreeBuilder, TreeNodesSource } from 'yfiles'

/**
 * Defines a tree node source consisting of data and bindings
 */
export class TreeNodesSourceDefinition {
  name: string
  data?: string
  idBinding: string
  template: string

  constructor() {
    this.name = ''
    this.data = ''
    this.idBinding = ''
    this.template = ''
  }
}

/**
 * Connector for {@link TreeNodesSource}s, {@link TreeNodesSourceDefinition}s and {@link TreeBuilder}
 */
export class TreeNodesSourceDefinitionBuilderConnector {
  sourceDefinition: TreeNodesSourceDefinition
  nodesSource: TreeNodesSource<any>
  graphBuilder: TreeBuilder

  /**
   * @param nodesSourceDefinition the {@link TreeNodesSourceDefinition} to connect
   * @param nodesSource the {@link TreeNodesSource} to connect
   * @param graphBuilder the {@link TreeBuilder} to set the updated data to
   */
  constructor(
    nodesSourceDefinition: TreeNodesSourceDefinition,
    nodesSource: TreeNodesSource<any>,
    graphBuilder: TreeBuilder
  ) {
    this.sourceDefinition = nodesSourceDefinition
    this.nodesSource = nodesSource
    this.graphBuilder = graphBuilder
  }

  /**
   * Updates/sets the sources' bindings and new data content
   */
  applyDefinition(): void {
    if (this.sourceDefinition.idBinding) {
      this.nodesSource.idProvider = createBinding(this.sourceDefinition.idBinding)
    } else {
      this.nodesSource.idProvider = null
    }
    this.nodesSource.nodeCreator.defaults.style = new StringTemplateNodeStyle(
      this.sourceDefinition.template
    )
    this.graphBuilder.setData(this.nodesSource, parseData(this.sourceDefinition.data))
  }

  reset(): void {
    this.sourceDefinition.data = ''
    this.applyDefinition()
  }
}

/**
 * flag to prevent error messages from being repeatedly displayed for each graph item
 */
let bindingErrorCaught = false

/**
 * Returns a binding for the given string.
 * If the parameter is a function definition, a function object is
 * returned. Otherwise, a binding is created using the parameter as the
 * property path.
 * @return The source or target binding
 */
export function createBinding(bindingString: string): (dataItem: any) => any {
  if (bindingString.indexOf('function') >= 0 || bindingString.indexOf('=>') >= 0) {
    try {
      // eval the string to get the function object
      // eslint-disable-next-line no-new-func
      const func = new Function(`return (${bindingString})`)()
      // wrap the binding function with a function that catches and reports errors
      // that occur in the binding functions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (dataItem: any): any => {
        try {
          // eslint-disable-next-line no-useless-call
          const result = func.apply(null, [dataItem])
          return result === null ? undefined : result
        } catch (e) {
          if (!bindingErrorCaught) {
            alert(`Evaluating the binding function ${bindingString} failed: ${e}`)
            bindingErrorCaught = true
          }
          return undefined
        }
      }
    } catch (ignored) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (dataItem: any): any =>
        bindingString.length > 0 ? dataItem[bindingString] : undefined
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dataItem: any): any => (bindingString.length > 0 ? dataItem[bindingString] : undefined)
}

/**
 * Parses the string entered by the user and returns the parsed object
 * @param data the data entered by the user
 * @return the parsed data
 */
export function parseData(data?: string): any[] {
  try {
    const nodesSourceValue = (data || '').trim()
    // eslint-disable-next-line no-new-func
    if (!nodesSourceValue) {
      return []
    }
    const functionString = /^\sreturn/m.test(nodesSourceValue)
      ? nodesSourceValue
      : `return ${nodesSourceValue}`
    // eslint-disable-next-line no-new-func
    return new Function(functionString)()
  } catch (e) {
    alert(`Evaluating the nodes source failed: ${e}`)
    return []
  }
}
