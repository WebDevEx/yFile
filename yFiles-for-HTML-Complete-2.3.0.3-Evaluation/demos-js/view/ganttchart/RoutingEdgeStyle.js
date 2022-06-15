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
  Arrow,
  ArrowType,
  BaseClass,
  GeneralPath,
  IArrow,
  IEdgeStyle,
  List,
  PathBasedEdgeStyleRenderer,
  Point,
  SolidColorFill,
  Stroke
} from 'yfiles'

/**
 * An edge style that draws a bendless edge in an orthogonal fashion.
 * All existing bends of the edge are ignored.
 */
export default class RoutingEdgeStyle extends BaseClass(IEdgeStyle) {
  /**
   * Creates a new instance of RoutingEdgeStyle.
   * @param {number} outSegmentLength The length of the horizontal segment that connects to the source node.
   * @param {number} inSegmentLength The length of the horizontal segment that connects to the target node.
   * @param {Fill?} fill
   * @param {number?} thickness
   */
  constructor(outSegmentLength, inSegmentLength, fill, thickness) {
    super()
    this.inSegmentLengthField = inSegmentLength
    this.outSegmentLengthField = outSegmentLength
    this.middleSegmentOffsetField = 32
    this.smoothingField = 10
    const f = fill || new SolidColorFill(100, 100, 100)
    this.strokeField = new Stroke(f, thickness || 2)
    this.sourceArrowField = IArrow.NONE
    this.targetArrowField = new Arrow({
      fill: f,
      type: ArrowType.TRIANGLE
    })
  }

  /**
   * Gets the length of the horizontal segment that connects to the source node.
   * @type {number}
   */
  get outSegmentLength() {
    return this.outSegmentLengthField
  }

  /**
   * Sets the length of the horizontal segment that connects to the source node.
   * @type {number}
   */
  set outSegmentLength(value) {
    this.outSegmentLengthField = value
  }

  /**
   * Gets the length of the horizontal segment that connects to the target node.
   * @type {number}
   */
  get inSegmentLength() {
    return this.inSegmentLengthField
  }

  /**
   * Sets the length of the horizontal segment that connects to the target node.
   * @type {number}
   */
  set inSegmentLength(value) {
    this.inSegmentLengthField = value
  }

  /**
   * Gets the distance on the y-axis between the source port and the horizontal middle segment.
   * This only has an effect when the source location is right of the target location.
   * @type {number}
   */
  get middleSegmentOffset() {
    return this.middleSegmentOffsetField
  }

  /**
   * Sets the distance on the y-axis between the source port and the horizontal middle segment.
   * This only has an effect when the source location is right of the target location.
   * @type {number}
   */
  set middleSegmentOffset(value) {
    this.middleSegmentOffsetField = value
  }

  /**
   * Gets the amount of corner rounding.
   * @type {number}
   */
  get smoothing() {
    return this.smoothingField
  }

  /**
   * Sets the amount of corner rounding.
   * @type {number}
   */
  set smoothing(value) {
    this.smoothingField = value
  }

  /**
   * Gets the source arrow.
   * @type {IArrow}
   */
  get sourceArrow() {
    return this.sourceArrowField
  }

  /**
   * Sets the source arrow.
   * @type {IArrow}
   */
  set sourceArrow(value) {
    this.sourceArrowField = value
  }

  /**
   * Gets the target arrow.
   * @type {IArrow}
   */
  get targetArrow() {
    return this.targetArrowField
  }

  /**
   * Sets the target arrow.
   * @type {IArrow}
   */
  set targetArrow(value) {
    this.targetArrowField = value
  }

  /**
   * Gets the stroke used to draw the edge.
   * @type {Stroke}
   */
  get stroke() {
    return this.strokeField
  }

  /**
   * Sets the stroke used to draw the edge.
   * @type {Stroke}
   */
  set stroke(value) {
    this.strokeField = value
  }

  get renderer() {
    return new RoutingEdgeStyleRenderer()
  }

  /**
   * @returns {Object}
   */
  clone() {
    return new RoutingEdgeStyle(this.outSegmentLength, this.inSegmentLength)
  }
}

/**
 * Renderer for {@link RoutingEdgeStyle}.
 */
class RoutingEdgeStyleRenderer extends PathBasedEdgeStyleRenderer {
  constructor() {
    super(RoutingEdgeStyle.$class)
  }

  /**
   * Constructs the orthogonal edge path.
   * @see Overrides {@link PathBasedEdgeStyleRenderer#createPath}
   * @returns {GeneralPath}
   */
  createPath() {
    // create a new GeneralPath with the edge points
    const generalPath = new GeneralPath()
    const points = this.getEdgePoints(this.edge)
    generalPath.moveTo(points.get(0))
    for (let i = 1; i < points.size; i++) {
      generalPath.lineTo(points.get(i))
    }
    return generalPath
  }

  /**
   * Calculates the points that define the edge path.
   * @returns {List.<Point>} A list of points that define the edge path.
   * @private
   */
  getEdgePoints(edge) {
    const sourcePoint = edge.sourcePort.location
    const targetPoint = edge.targetPort.location
    const points = new List()
    points.add(sourcePoint)

    // the source location with the x-offset
    const sourceX = sourcePoint.x + this.style.outSegmentLength
    // the target location with the x-offset
    const targetX = targetPoint.x - this.style.inSegmentLength

    // check if source and target are not exactly in the same row - in this case we just draw a straight line
    if (sourceX > targetX) {
      // source is right of target
      // get the y-coordinate of the vertical middle segment
      const middleSegmentY =
        sourcePoint.y <= targetPoint.y
          ? sourcePoint.y + this.style.middleSegmentOffset
          : sourcePoint.y - this.style.middleSegmentOffset
      points.add(new Point(sourceX, sourcePoint.y))
      points.add(new Point(sourceX, middleSegmentY))
      points.add(new Point(targetX, middleSegmentY))
      points.add(new Point(targetX, targetPoint.y))
    } else {
      if (sourcePoint.y !== targetPoint.y) {
        // source is left of target
        points.add(new Point(sourceX, sourcePoint.y))
        points.add(new Point(sourceX, targetPoint.y))
      }
    }

    points.add(targetPoint)
    return points
  }

  getTangentForSegment(segmentIndex, ratio) {
    return this.getPath().getTangentForSegment(segmentIndex, ratio)
  }

  getSegmentCount() {
    // the segment count is the number of edge points - 1
    const p = this.getEdgePoints(this.item)
    return p.size - 1
  }

  getTargetArrow() {
    return this.style.targetArrow
  }

  getSourceArrow() {
    return this.style.sourceArrow
  }

  getStroke() {
    return this.style.stroke
  }

  getSmoothingLength() {
    return this.style.smoothing
  }

  lookup(type) {
    return super.lookup.call(this, type)
  }
}
