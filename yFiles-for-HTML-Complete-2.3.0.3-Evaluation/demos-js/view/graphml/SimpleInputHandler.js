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
import { IGraph, IModelItem, IParseContext, InputHandlerBase, KeyType, YObject } from 'yfiles'

/**
 * An input handler that reads arbitrary data.
 * In the case of complex types, the text content of the XML node is stored.
 */
export default class SimpleInputHandler extends InputHandlerBase {
  /**
   * @param {GraphMLProperty} property
   * @param {PropertiesPanel} panel
   */
  constructor(property, panel) {
    super(YObject.$class, YObject.$class)
    this.property = property
    this.panel = panel
  }

  /**
   * Parses the given xml node.
   *
   * This implementation is designed to read arbitrary data.
   * Simple data types are parsed as such, for complex data types, the
   * plain string representation of the xml data is returned.
   *
   * @param {IParseContext} context
   * @param {Node} xmlNode
   * @return {Object}
   * @see Overrides {@link InputHandlerBase#parseDataCore}
   */
  parseDataCore(context, xmlNode) {
    const node = xmlNode
    const textValue = node.textContent !== null ? node.textContent : ''
    switch (this.property.type) {
      case KeyType.INT:
        return parseInt(textValue, 10)
      case KeyType.LONG:
        return parseInt(textValue, 10)
      case KeyType.FLOAT:
        return parseFloat(textValue)
      case KeyType.DOUBLE:
        return parseFloat(textValue)
      case KeyType.BOOLEAN:
        return !!textValue
      case KeyType.COMPLEX:
        return node.innerHTML !== null ? node.innerHTML : ''
      case KeyType.STRING:
      default:
        return textValue
    }
  }

  /**
   * Sets the parsed value.
   * @param {IParseContext} context
   * @param key
   * @param data
   * @see Overrides {@link InputHandlerBase#setValue}
   */
  setValue(context, key, data) {
    if (context.getCurrent(IModelItem.$class)) {
      const item = context.getCurrent(IModelItem.$class)
      this.panel.setItemProperty(item, this.property, data)
    } else if (context.getCurrent(IGraph.$class) && context.objectStack.size === 2) {
      // parse graph data only for the top-level graph, not for nested graphs
      this.panel.setGraphProperty(this.property, data)
    }
  }

  /**
   * Initializes this instance from the GraphML key definition.
   * @param {IParseContext} context
   * @param {Element} definition
   * @see overrides {@link InputHandlerBase#initializeFromKeyDefinition}
   */
  initializeFromKeyDefinition(context, definition) {
    super.initializeFromKeyDefinition(context, definition)
    this.property.defaultExists = this.defaultExists
    if (this.defaultExists) {
      this.property.defaultValue = this.defaultValue
    }
  }
}
