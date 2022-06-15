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
  IHitTestable,
  IInputModeContext,
  InputModeEventArgs,
  MoveInputMode,
  Point,
  Rect,
  Size
} from 'yfiles'
import AdditionalSnapLinePositionHandler from './AdditionalSnapLinePositionHandler.js'

/**
 * This input mode allows moving free snaplines using a drag gesture.
 */
export default class AdditionalSnapLineMoveInputMode extends MoveInputMode {
  /**
   * Creates a new instance of <code>AdditionalSnapLineMoveInputMode</code>
   * @param snapLineCreators {List.<AdditionalSnapLineVisualCreator>}
   */
  constructor(snapLineCreators) {
    super()
    this.$snapLineCreators = snapLineCreators
    this.initialize()
  }

  /**
   * Returns the list of snap lines.
   * @return {IEnumerable.<AdditionalSnapLineVisualCreator>}
   */
  get snapLineCreators() {
    return this.$snapLineCreators
  }

  /**
   * Clears the {@link MoveInputMode#positionHandler} property and sets
   * the {@link MoveInputMode#hitTestable} property to check for hit
   * {@link AdditionalSnapLineVisualCreator}s.
   */
  initialize() {
    this.positionHandler = null
    this.hitTestable = IHitTestable.create(this.isValidHit.bind(this))
  }

  /**
   * Returns true if an AdditionalSnapLine can be found in a close surrounding of the given location.
   * @param {IInputModeContext} context
   * @param {Point} location
   * @return {boolean}
   */
  isValidHit(context, location) {
    const line = this.tryGetAdditionalSnapLineCreatorAt(location)
    if (line !== null) {
      this.handler = new AdditionalSnapLinePositionHandler(line, location)
      return true
    }
    this.handler = null
    return false
  }

  /**
   * Returns the first AdditionalSnapLine found in a close surrounding of the given location
   * or null if none can be found.
   * @param {Point} location
   * @return {AdditionalSnapLineVisualCreator}
   */
  tryGetAdditionalSnapLineCreatorAt(location) {
    const surrounding = new Rect(location.add(new Point(-3, -3)), new Size(6, 6))
    return this.snapLineCreators.find(line => surrounding.intersectsLine(line.from, line.to))
  }

  /**
   * Sets the {@link MoveInputMode#positionHandler} property.
   * @param {InputModeEventArgs} inputModeEventArgs
   * @see Overrides {@link MoveInputMode#onDragStarting}
   */
  onDragStarting(inputModeEventArgs) {
    this.positionHandler = this.handler
    super.onDragStarting(inputModeEventArgs)
  }

  /**
   * Clears the {@link MoveInputMode#positionHandler} property.
   * @param {InputModeEventArgs} inputModeEventArgs
   * @see Overrides {@link MoveInputMode#onDragCanceled}
   */
  onDragCanceled(inputModeEventArgs) {
    super.onDragCanceled(inputModeEventArgs)
    this.positionHandler = null
  }

  /**
   * Clears the {@link MoveInputMode#positionHandler} property.
   * @see Overrides {@link MoveInputMode#onDragFinished}
   */
  onDragFinished(inputModeEventArgs) {
    super.onDragFinished(inputModeEventArgs)
    this.positionHandler = null
  }
}
