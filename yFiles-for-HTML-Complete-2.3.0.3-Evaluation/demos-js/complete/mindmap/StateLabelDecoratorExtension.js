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
import { IconLabelStyle, ILabelModelParameter, ILookup, Insets, MarkupExtension } from 'yfiles'
import StateLabelDecorator from './StateLabelDecorator.js'

/**
 * A markup extension class used for (de-)serializing a custom label style, namely
 * StateLabelDecorator class, that is written in ECMAScript 6.
 */
export default class StateLabelDecoratorExtension extends MarkupExtension {
  /**
   * Gets the style used to render the icon label.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @return {IconLabelStyle}
   */
  get wrappedStyle() {
    return this.$wrappedStyle
  }

  /**
   * Sets the style used to render the icon label.
   * The explicit getter/setter is needed to support (de-)serialization.
   * @param {IconLabelStyle} value
   */
  set wrappedStyle(value) {
    this.$wrappedStyle = value
  }

  /**
   * Gets ILabelModelParameter for an icon of a node placed on the left side of the tree.
   * Places the icon inside the label on the east.
   * @return {ILabelModelParameter}
   */
  get labelModelParameterLeft() {
    return this.$labelModelParameterLeft
  }

  /**
   * Sets ILabelModelParameter for an icon of a node placed on the left side of the tree.
   * Places the icon inside the label on the east.
   * @param {ILabelModelParameter} value
   */
  set labelModelParameterLeft(value) {
    this.$labelModelParameterLeft = value
  }

  /**
   * Gets the ILabelModelParameter for an icon of a node placed on the right side of the tree.
   * Places the icon inside the label on the east.
   * @return {ILabelModelParameter}
   */
  get labelModelParameterRight() {
    return this.$labelModelParameterRight
  }

  /**
   * Sets the ILabelModelParameter for an icon of a node placed on the right side of the tree.
   * Places the icon inside the label on the east.
   * @param value
   */
  set labelModelParameterRight(value) {
    this.$labelModelParameterRight = value
  }

  /**
   * Gets the insets for an icon placed on the left side of the tree.
   * @return {Insets}
   */
  get insetsLeft() {
    return this.$insetsLeft
  }

  /**
   * Sets the insets for an icon placed on the left side of the tree.
   * @param {Insets} value
   */
  set insetsLeft(value) {
    this.$insetsLeft = value
  }

  /**
   * Gets the insets for an icon placed on the right side of the tree.
   * @return {Insets}
   */
  get insetsRight() {
    return this.$insetsRight
  }

  /**
   * Sets the insets for an icon placed on the right side of the tree.
   * @param {Insets} value
   */
  set insetsRight(value) {
    this.$insetsRight = value
  }

  /**
   * @param {ILookup} lookup
   * @return {StateLabelDecorator}
   */
  provideValue(lookup) {
    return new StateLabelDecorator(this.wrappedStyle)
  }
}
