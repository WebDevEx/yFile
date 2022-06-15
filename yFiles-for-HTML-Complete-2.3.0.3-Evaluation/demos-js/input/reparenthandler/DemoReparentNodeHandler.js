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
import { IInputModeContext, INode, ReparentNodeHandler } from 'yfiles'

/**
 * Customized variant of the default {@link ReparentNodeHandler} that
 * determines the possible reparenting operations based on the node's tag.
 */
export default class DemoReparentNodeHandler extends ReparentNodeHandler {
  /**
   * In general, this method determines whether the current gesture that
   * can be determined through the context is a reparent gesture. In this
   * case, it returns true, if the base implementation returns true or if the
   * current node is green.
   * @param {IInputModeContext} context The context that provides information about the
   * user input.
   * @param {INode} node The node that will possibly be reparented.
   * @return {boolean} Whether this is a reparenting gesture.
   * @see Overrides {@link ReparentNodeHandler#isReparentGesture}
   * @see Specified by {@link IReparentNodeHandler#isReparentGesture}.
   */
  isReparentGesture(context, node) {
    return super.isReparentGesture(context, node) || node.tag === 'green'
  }

  /**
   * In general, this method determines whether the user may detach the
   * given node from its current parent in order to reparent it. In this case,
   * it returns false for red nodes.
   * @param {IInputModeContext} context The context that provides information about the
   * user input.
   * @param {INode} node The node that is about to be detached from its
   * current parent.
   * @return {boolean} Whether the node may be detached and reparented.
   * @see Overrides {@link ReparentNodeHandler#shouldReparent}
   * @see Specified by {@link IReparentNodeHandler#shouldReparent}.
   */
  shouldReparent(context, node) {
    return !(node.tag === 'firebrick')
  }

  /**
   * In general, this method determines whether the provided node
   * may be reparented to the given <code>newParent</code>.
   * @param {IInputModeContext} context The context that provides information about the
   * user input.
   * @param {INode} node The node that will be reparented.
   * @param {INode} newParent The potential new parent.
   * @return {boolean} Whether <code>newParent</code> is a valid new parent
   * for <code>node</code>.
   * @see Overrides {@link ReparentNodeHandler#isValidParent}
   * @see Specified by {@link IReparentNodeHandler#isValidParent}.
   */
  isValidParent(context, node, newParent) {
    // Obtain the tag from the designated child
    const nodeTag = node.tag
    // and from the designated parent.
    const parentTag = newParent === null ? null : newParent.tag
    if (nodeTag === null) {
      // Newly created nodes or nodes without a tag in general can be reparented freely
      return true
    }
    // Otherwise allow nodes to be moved only if their tags are the same color
    if (typeof nodeTag === 'string' && typeof parentTag === 'string') {
      return nodeTag === parentTag
    }
    // Finally, if there is no new parent, this is ok, too
    return newParent === null
  }
}
