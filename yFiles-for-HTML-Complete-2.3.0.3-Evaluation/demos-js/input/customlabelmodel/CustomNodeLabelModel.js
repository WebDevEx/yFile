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
  Class,
  DefaultLabelModelParameterFinder,
  ILabel,
  ILabelModel,
  ILabelModelParameter,
  ILabelModelParameterFinder,
  ILabelModelParameterProvider,
  ILookup,
  INode,
  IOrientedRectangle,
  List,
  OrientedRectangle,
  Point
} from 'yfiles'

/**
 * Custom implementation of @{link ILabelModel} that provides either continuous or discrete label
 * positions directly outside the node border.
 *
 * In addition to the label model itself, two important support interfaces
 * {@link ILabelModelParameterFinder} and {@link ILabelModelParameterProvider} are also
 * implemented.
 */
export default class CustomNodeLabelModel extends BaseClass(
  ILabelModel,
  ILabelModelParameterProvider,
  ILabelModelParameterFinder
) {
  constructor() {
    super()
    this.$candidateCount = 8
    this.$offset = 0
  }

  /**
   * Returns the number of discrete label positions around the border.
   *
   * A value of 0 signifies that continuous label positions are used.
   * @return {number}
   */
  get candidateCount() {
    return this.$candidateCount
  }

  /**
   * Sets the number of discrete label positions around the border.
   *
   * A value of 0 signifies that continuous label positions are used.
   * @param {number} value
   */
  set candidateCount(value) {
    this.$candidateCount = value
  }

  /**
   * Returns the offset of the label location, i.e., the distance to the node layout borders.
   * @return {number}
   */
  get offset() {
    return this.$offset
  }

  /**
   * Sets the offset of the label location, i.e., the distance to the node layout borders.
   * @param {number} value
   */
  set offset(value) {
    this.$offset = value
  }

  /**
   * Returns instances of the support interfaces (which are actually the model instance itself)
   * @param {Class} type
   * @return {CustomNodeLabelModel | null}
   */
  lookup(type) {
    if (type === ILabelModelParameterProvider.$class && this.candidateCount > 0) {
      // If we request a ILabelModelParameterProvider AND we use discrete label candidates, we return the label model
      // itself, otherwise, null is returned, which means that continuous label positions are supported.
      return this
    } else if (type === ILabelModelParameterFinder.$class) {
      // If we request a ILabelModelParameterProvider, we return the label model itself, so we can always retrieve a
      // matching parameter for a given actual position.
      return this
    }
    return null
  }

  /**
   * Calculates for the given parameter the actual geometry of the specified label in absolute world coordinates.
   *
   * The actual position is calculated from the {@link CustomNodeLabelModelParameter.ratio} specified in the
   * parameter as the counterclockwise angle on the label owner's circumference. Note that we also rotate the label
   * layout itself accordingly.
   * @param {ILabel} label
   * @param {ILabelModelParameter} parameter
   * @return {IOrientedRectangle}
   */
  getGeometry(label, parameter) {
    const /** @type {CustomNodeLabelModel.CustomNodeLabelModelParameter} */ modelParameter = parameter
    const /** @type {INode} */ ownerNode = label.owner
    if (modelParameter !== null && ownerNode !== null) {
      // If we have a matching parameter and a node as owner, calculate the angle for the label position
      // and the matching rotation of the label layout box itself.
      const center = ownerNode.layout.center
      const radius = Math.max(ownerNode.layout.width, ownerNode.layout.height) * 0.5
      const ratio = modelParameter.ratio
      const angle = ratio * Math.PI * 2
      const x = Math.sin(angle)
      const y = Math.cos(angle)
      const up = new Point(-y, x)
      const result = new OrientedRectangle()
      result.setUpVector(up.x, up.y)
      result.resize(label.preferredSize)
      result.setCenter(
        center.add(up.multiply(this.offset + radius + label.preferredSize.height * 0.5))
      )
      return result
    }
    return IOrientedRectangle.EMPTY
  }

  /**
   * Creates the default parameter for this model. Here it is located at 1/4 around the node's circumference.
   * @return {CustomNodeLabelModel.CustomNodeLabelModelParameter}
   */
  createDefaultParameter() {
    return this.createParameter(0.25)
  }

  /**
   * Factory method that creates a parameter for a given rotation angle.
   * @param {number} ratio
   * @return {CustomNodeLabelModel.CustomNodeLabelModelParameter}
   */
  createParameter(ratio) {
    return new CustomNodeLabelModel.CustomNodeLabelModelParameter(this, ratio)
  }

  /**
   * Provides a lookup context for the given combination of label and parameter.
   * @param {ILabel} label
   * @param {ILabelModelParameter} parameter
   * @return {ILookup}
   */
  getContext(label, parameter) {
    return ILookup.EMPTY
  }

  /**
   * Returns an enumerator over a set of possible {@link ILabelModelParameter}
   * instances that can be used for the given label and model.
   *
   * Since in {@link lookup}, we return an instance of this class only for positive {@link candidateCount}s,
   * this method is only called for <b>discrete</b> candidates.
   * @param {ILabel} label
   * @param {ILabelModel} model
   * @return {IEnumerable<ILabelModelParameter>}
   */
  getParameters(label, model) {
    const parameters = new List()
    for (let i = 0; i < this.candidateCount; ++i) {
      parameters.add(
        new CustomNodeLabelModel.CustomNodeLabelModelParameter(this, i / this.candidateCount)
      )
    }
    return parameters
  }

  /**
   * Tries to find a parameter that best matches the given layout for the provided label instance.
   *
   * By default, this method is only called when <b>no discrete</b> candidates are specified (i.e. here for
   * {@link candidateCount} = 0. This implementation just calculates the rotation angle for the center of layout and
   * creates a parameter for exactly this angle which {@link createParameter}.
   * @param {ILabel} label
   * @param {ILabelModel} model
   * @param {IOrientedRectangle} layout
   * @return {ILabelModelParameterFinder}
   */
  findBestParameter(label, model, layout) {
    const /** @type {CustomNodeLabelModel} */ labelModel = model
    const /** @type {INode} */ node = label.owner
    if (labelModel !== null && node !== null) {
      const direction = layout.orientedRectangleCenter.subtract(node.layout.center).normalized
      const ratio = Math.atan2(direction.y, -direction.x) / (Math.PI * 2)
      return labelModel.createParameter(ratio)
    }
    return DefaultLabelModelParameterFinder.findBestParameter(label, labelModel, layout)
  }
}

/**
 * Custom implementation of {@link ILabelModelParameter} that is tailored to match
 * {@link CustomNodeLabelModel} instances.
 */
CustomNodeLabelModel.CustomNodeLabelModelParameter = class extends BaseClass(ILabelModelParameter) {
  /**
   * Creates a new instance of <code>CustomNodeLabelModelParameter</code>.
   * @param {CustomNodeLabelModel} owner The label's owner
   * @param {number} ratio The ratio for the given label model parameter
   */
  constructor(owner, ratio) {
    super()
    this.$owner = owner
    this.$ratio = ratio
  }

  /**
   * Returns the ratio for the given label model parameter. The ratio corresponds to the counterclockwise angle on
   * the label owner's circumference.
   * @return {number}
   */
  get ratio() {
    return this.$ratio
  }

  /**
   * Creates a clone of this {@link CustomNodeLabelModelParameter} object.
   * @return {CustomNodeLabelModelParameter}
   */
  clone() {
    // we have no mutable state, so return this.
    return this
  }

  /**
   * Returns the model instance to which this parameter belongs.
   *
   * This is usually a reference to the model instance that has created this parameter.
   * @return {ILabelModel}
   */
  get model() {
    return this.$owner
  }

  /**
   * Predicate that checks if this parameter instance may be used with the given label.
   *
   * Our model/parameter implementation only makes sense when used for {@link INode}s.
   * @param {ILabel} label
   * @return {boolean}
   */
  supports(label) {
    return INode.isInstance(label.owner)
  }
}

/**
 * Serialization handlers for graphML I/O.
 */
CustomNodeLabelModel.CustomNodeLabelModelParameter.serializationHandler = (source, args) => {
  // only serialize items that are of the specific type
  if (args.item instanceof CustomNodeLabelModel.CustomNodeLabelModelParameter) {
    const /** @type {CustomNodeLabelModel.CustomNodeLabelModelParameter} */ modelParameter =
        args.item
    const writer = args.writer
    writer.writeStartElement(
      'CustomNodeLabelModelParameter',
      'http://www.yworks.com/yFilesHTML/demos/CustomNodeLabelModelParameter/1.0'
    )
    writer.writeAttribute('candidateCount', modelParameter.model.candidateCount.toString())
    writer.writeAttribute('offset', modelParameter.model.offset.toString())
    writer.writeAttribute('ratio', modelParameter.ratio.toString())
    writer.writeEndElement()
    // Signal that this item is serialized.
    args.handled = true
  }
}

/**
 * Deserialization handlers for graphML I/O.
 */
CustomNodeLabelModel.CustomNodeLabelModelParameter.deserializationHandler = (source, args) => {
  if (args.xmlNode instanceof Element) {
    const element = args.xmlNode
    if (
      element.localName === 'CustomNodeLabelModelParameter' &&
      element.namespaceURI ===
        'http://www.yworks.com/yFilesHTML/demos/CustomNodeLabelModelParameter/1.0'
    ) {
      // setting the result sets the event arguments to handled
      const model = new CustomNodeLabelModel()
      model.candidateCount = parseInt(element.getAttribute('candidateCount'))
      model.offset = parseFloat(element.getAttribute('offset'))
      args.result = new CustomNodeLabelModel.CustomNodeLabelModelParameter(
        model,
        parseFloat(element.getAttribute('ratio'))
      )
    }
  }
}
