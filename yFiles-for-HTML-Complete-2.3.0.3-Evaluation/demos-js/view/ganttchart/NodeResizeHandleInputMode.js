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
  HandleInputMode,
  HandlePositions,
  INodeHitTester,
  IReshapeHandleProvider,
  Point
} from 'yfiles'
import { TimeHandle } from './TimeHandle.js'

const fuzzyness = 3

/**
 * An customized HandleInputMode that overrides which handle is hit by the mouse cursor.
 * The whole left and right border to the node is a hit region for the resize handles.
 */
export default class NodeResizeHandleInputMode extends HandleInputMode {
  /**
   * @param {Point} location - The coordinates in the world coordinate system.
   * @returns {IHandle}
   */
  getClosestHitHandle(location) {
    const handle = super.getClosestHitHandle(location)
    if (handle instanceof TimeHandle) {
      // if a time handle is hit, it has priority over the resize handles
      return handle
    }
    // get the node in the location
    const hitTestEnumerator = this.inputModeContext.lookup(INodeHitTester.$class)
    if (hitTestEnumerator !== null) {
      const hits = hitTestEnumerator.enumerateHits(this.inputModeContext, location).getEnumerator()
      if (hits.moveNext()) {
        // there is a node in the location
        const node = hits.current
        // get the IReshapeHandleProvider
        const handleProvider = node.lookup(IReshapeHandleProvider.$class)
        const { x, width } = node.layout
        if (Math.abs(x - location.x) < fuzzyness) {
          // mouse is over left border - get west handle
          return handleProvider.getHandle(this.inputModeContext, HandlePositions.WEST)
        }
        if (Math.abs(x + (width - location.x)) < fuzzyness) {
          // mouse is over right border - get east handle
          return handleProvider.getHandle(this.inputModeContext, HandlePositions.EAST)
        }
      }
    }
    return null
  }
}
