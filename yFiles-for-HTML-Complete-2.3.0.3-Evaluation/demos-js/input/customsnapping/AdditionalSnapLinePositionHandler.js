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
import { BaseClass, IInputModeContext, IPositionHandler, Point } from 'yfiles'

/**
 * An {@link IPositionHandler} used to move {@link AdditionalSnapLineVisualCreator} instances.
 */
export default class AdditionalSnapLinePositionHandler extends BaseClass(IPositionHandler) {
  /**
   * Creates a new handler for the given <code>line</code>.
   * @param {AdditionalSnapLineVisualCreator} line The additional snap line to move.
   * @param {Point} mouseLocation The mouse location at the beginning of a move gesture.
   */
  constructor(line, mouseLocation) {
    super()
    this.line = line
    this.mouseDeltaFromStart = new Point(
      mouseLocation.x - line.from.x,
      mouseLocation.y - line.from.y
    )
  }

  /**
   * Returns a view of the location of the item.
   * The point describes the current world coordinate of the {@link AdditionalSnapLineVisualCreator#from} property
   * of the moved {@link AdditionalSnapLineVisualCreator}.
   * @see Specified by {@link IDragHandler#location}.
   * @return {IPoint}
   */
  get location() {
    return this.line.from
  }

  /**
   * Called by clients to indicate that the element is going to be dragged.
   * This call will be followed by one or more calls to {@link IDragHandler#handleMove},
   * and a final {@link IDragHandler#dragFinished} or {@link IDragHandler#cancelDrag}.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from.
   * @see Specified by {@link IDragHandler#initializeDrag}.
   */
  initializeDrag(inputModeContext) {
    this.startFrom = this.line.from
  }

  /**
   * Called by clients to indicate that the element has been dragged and its position
   * should be updated.
   * This method may be called more than once after an initial {@link IDragHandler#initializeDrag}
   * and will the final call will be followed by either one
   * {@link IDragHandler#dragFinished} or one {@link IDragHandler#cancelDrag} call.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag
   *   from.
   * @param {Point} originalLocation The value of the
   *   {@link AdditionalSnapLinePositionHandler#location} property at the time of
   *   {@link AdditionalSnapLinePositionHandler#initializeDrag}.
   * @param {Point} newLocation The coordinates in the world coordinate system that the client
   * wants the handle to be at.
   * Depending on the implementation the {@link AdditionalSnapLinePositionHandler#location} may or may not be
   *   modified
   * to reflect the new value.
   * @return {boolean} Whether the move had any visual effect. This is a hint to the engine to optimize invalidation.
   * @see Specified by {@link IDragHandler#handleMove}.
   */
  handleMove(inputModeContext, originalLocation, newLocation) {
    this.setPosition(
      new Point(
        newLocation.x - this.mouseDeltaFromStart.x,
        newLocation.y - this.mouseDeltaFromStart.y
      )
    )
    return true
  }

  /**
   * Called by clients to indicate that the dragging has been canceled by the user.
   * This method may be called after the initial {@link AdditionalSnapLinePositionHandler#initializeDrag} and zero or
   * more invocations of {@link AdditionalSnapLinePositionHandler#handleMove}.
   * Alternatively to this method the {@link AdditionalSnapLinePositionHandler#dragFinished} method might be called.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag from.
   * @param {Point} originalLocation The value of the coordinate of the
   * {@link AdditionalSnapLinePositionHandler#location} property at the time of
   * {@link AdditionalSnapLinePositionHandler#initializeDrag}.
   * @see Specified by {@link IDragHandler#cancelDrag}.
   */
  cancelDrag(inputModeContext, originalLocation) {
    this.setPosition(this.startFrom)
  }

  /**
   * Called by clients to indicate that the repositioning has just been finished.
   * This method may be called after the initial {@link AdditionalSnapLinePositionHandler#initializeDrag} and zero or
   * more invocations of {@link IDragHandler#handleMove}.
   * Alternatively to this method the {@link IDragHandler#cancelDrag} method might be called.
   * @param {IInputModeContext} inputModeContext The context to retrieve information about the drag
   *   from.
   * @param {Point} newLocation The coordinates in the world coordinate system that the client wants
   * the handle to be at. This is the same value as delivered in the last invocation of
   *   {@link AdditionalSnapLinePositionHandler#handleMove}.
   * @param {Point} originalLocation The value of the
   *   {@link AdditionalSnapLinePositionHandler#location} property at the time of
   *   {@link AdditionalSnapLinePositionHandler#initializeDrag}.
   * @see Specified by {@link IDragHandler#dragFinished}.
   */
  dragFinished(inputModeContext, originalLocation, newLocation) {
    this.setPosition(
      new Point(
        newLocation.x - this.mouseDeltaFromStart.x,
        newLocation.y - this.mouseDeltaFromStart.y
      )
    )
  }

  /**
   * Called by clients to set the position to the given coordinates.
   * The given position are interpreted to be the new position of the {@link AdditionalSnapLineVisualCreator#from}
   * property of the moved {@link AdditionalSnapLineVisualCreator}.
   * @param {Point} location The new location for the {@link AdditionalSnapLineVisualCreator#from}
   *   property.
   * @see {@link IDragHandler#location}
   * @see Specified by {@link IPositionHandler#setPosition}.
   */
  setPosition(location) {
    const delta = new Point(location.x - this.line.from.x, location.y - this.line.from.y)

    this.line.from = this.line.from.add(delta)
    this.line.to = this.line.to.add(delta)
  }
}
