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
  INode,
  INodeSizeConstraintProvider,
  InteriorLabelModel,
  Rect,
  Size
} from 'yfiles'

/**
 * An {@link INodeSizeConstraintProvider} that returns the size of the
 * first label as minimum size. The maximum size is not limited.
 */
export default class GreenSizeConstraintProvider extends BaseClass(INodeSizeConstraintProvider) {
  /**
   * Returns the label size to prevent the shrinking of nodes beyond their
   * label's size.
   * @param {INode} item
   * @see Specified by {@link INodeSizeConstraintProvider#getMinimumSize}.
   * @return {Size}
   */
  getMinimumSize(item) {
    if (item.labels.size > 0) {
      const labels = item.labels.toArray()
      for (let i = 0; i < labels.length; i++) {
        const label = labels[i]
        const labelProvider = label.lookup(INodeSizeConstraintProvider.$class)
        if (labelProvider !== null) {
          return labelProvider.getMinimumSize(item)
        }

        if (label.layoutParameter.model instanceof InteriorLabelModel) {
          return label.preferredSize
        }
      }
    }
    return new Size(1, 1)
  }

  /**
   * Returns the infinite size since the maximum size is not limited.
   * @see Specified by {@link INodeSizeConstraintProvider#getMaximumSize}.
   * @return {Size}
   */
  getMaximumSize(item) {
    return Size.INFINITE
  }

  /**
   * Returns an empty rectangle since this area is not constraint.
   * @see Specified by {@link INodeSizeConstraintProvider#getMinimumEnclosedArea}.
   * @return {Rect}
   */
  getMinimumEnclosedArea(item) {
    return Rect.EMPTY
  }
}
