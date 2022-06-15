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
  Class,
  ComponentArrangementStyles,
  ComponentLayout,
  GraphComponent,
  YBoolean,
  YDimension,
  YNumber,
  YString
} from 'yfiles'

import LayoutConfiguration from './LayoutConfiguration.js'
import {
  ComponentAttribute,
  Components,
  EnumValuesAttribute,
  LabelAttribute,
  MinMaxAttribute,
  OptionGroup,
  OptionGroupAttribute,
  TypeAttribute
} from '../../resources/demo-option-editor.js'

/**
 * Configuration options for the layout algorithm of the same name.
 * @yjs:keep=DescriptionGroup,LayoutGroup,descriptionText,aspectRatioItem,componentSpacingItem,fromSketchItem,gridEnabledItem,gridSpacingItem,noOverlapItem,shouldDisableAspectRatioItem,shouldDisableGridSpacingItem,styleItem,useScreenRatioItem
 */
const ComponentLayoutConfig = Class('ComponentLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('ComponentLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const layout = new ComponentLayout()
    this.styleItem = ComponentArrangementStyles.ROWS
    this.noOverlapItem = (layout.style & ComponentArrangementStyles.MODIFIER_NO_OVERLAP) !== 0
    this.fromSketchItem = (layout.style & ComponentArrangementStyles.MODIFIER_AS_IS) !== 0
    const size = layout.preferredSize
    this.useScreenRatioItem = true
    this.aspectRatioItem = size.width / size.height

    this.componentSpacingItem = layout.componentSpacing
    this.gridEnabledItem = layout.gridSpacing > 0
    this.gridSpacingItem = layout.gridSpacing > 0 ? layout.gridSpacing : 20.0
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new ComponentLayout()
    layout.componentArrangement = true
    let style = this.styleItem
    if (this.noOverlapItem) {
      style |= ComponentArrangementStyles.MODIFIER_NO_OVERLAP
    }
    if (this.fromSketchItem) {
      style |= ComponentArrangementStyles.MODIFIER_AS_IS
    }
    layout.style = style

    let w, h
    if (graphComponent !== null && this.useScreenRatioItem) {
      const canvasSize = graphComponent.innerSize
      w = canvasSize.width
      h = canvasSize.height
    } else {
      w = this.aspectRatioItem
      h = 1.0 / w
      w *= 400.0
      h *= 400.0
    }
    layout.preferredSize = new YDimension(w, h)
    layout.componentSpacing = this.componentSpacingItem
    if (this.gridEnabledItem) {
      layout.gridSpacing = this.gridSpacingItem
    } else {
      layout.gridSpacing = 0
    }

    return layout
  },

  /** @type {OptionGroup} */
  DescriptionGroup: {
    $meta: function () {
      return [
        LabelAttribute('Description'),
        OptionGroupAttribute('RootGroup', 5),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {string} */
  descriptionText: {
    $meta: function () {
      return [
        OptionGroupAttribute('DescriptionGroup', 10),
        ComponentAttribute(Components.HTML_BLOCK),
        TypeAttribute(YString.$class)
      ]
    },
    get: function () {
      return "<p style='margin-top:0'>The component layout arranges the connected components of a graph. It can use any other layout style to arrange each component separately, and then arranges the components as such.</p><p>In this demo, the arrangement of each component is just kept as it is.</p>"
    }
  },

  /**
   * Backing field for below property
   * @type {ComponentArrangementStyles}
   */
  $styleItem: null,

  /** @type {ComponentArrangementStyles} */
  styleItem: {
    $meta: function () {
      return [
        LabelAttribute('Layout Style', '#/api/ComponentLayout#ComponentLayout-property-style'),
        OptionGroupAttribute('LayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['No Arrangement', ComponentArrangementStyles.NONE],
            ['Multiple Rows', ComponentArrangementStyles.ROWS],
            ['Single Row', ComponentArrangementStyles.SINGLE_ROW],
            ['Single Column', ComponentArrangementStyles.SINGLE_COLUMN],
            ['Packed Rectangle', ComponentArrangementStyles.PACKED_RECTANGLE],
            ['Compact Rectangle', ComponentArrangementStyles.PACKED_COMPACT_RECTANGLE],
            ['Packed Circle', ComponentArrangementStyles.PACKED_CIRCLE],
            ['Compact Circle', ComponentArrangementStyles.PACKED_COMPACT_CIRCLE],
            ['Nested Rows', ComponentArrangementStyles.MULTI_ROWS],
            ['Compact Nested Rows', ComponentArrangementStyles.MULTI_ROWS_COMPACT],
            [
              'Width-constrained Nested Rows',
              ComponentArrangementStyles.MULTI_ROWS_WIDTH_CONSTRAINT
            ],
            [
              'Height-constrained Nested Rows',
              ComponentArrangementStyles.MULTI_ROWS_HEIGHT_CONSTRAINT
            ],
            [
              'Width-constrained Compact Nested Rows',
              ComponentArrangementStyles.MULTI_ROWS_WIDTH_CONSTRAINT_COMPACT
            ],
            [
              'Height-constrained Compact Nested Rows',
              ComponentArrangementStyles.MULTI_ROWS_HEIGHT_CONSTRAINT_COMPACT
            ]
          ]
        }),
        TypeAttribute(ComponentArrangementStyles.$class)
      ]
    },
    get: function () {
      return this.$styleItem
    },
    set: function (value) {
      this.$styleItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $noOverlapItem: false,

  /** @type {boolean} */
  noOverlapItem: {
    $meta: function () {
      return [
        LabelAttribute('Remove Overlaps', '#/api/ComponentLayout#ComponentLayout-property-style'),
        OptionGroupAttribute('LayoutGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$noOverlapItem
    },
    set: function (value) {
      this.$noOverlapItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $fromSketchItem: false,

  /** @type {boolean} */
  fromSketchItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Drawing as Sketch',
          '#/api/ComponentLayout#ComponentLayout-property-style'
        ),
        OptionGroupAttribute('LayoutGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$fromSketchItem
    },
    set: function (value) {
      this.$fromSketchItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useScreenRatioItem: false,

  /** @type {boolean} */
  useScreenRatioItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Screen Aspect Ratio',
          '#/api/ComponentLayout#ComponentLayout-property-preferredSize'
        ),
        OptionGroupAttribute('LayoutGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$useScreenRatioItem
    },
    set: function (value) {
      this.$useScreenRatioItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $aspectRatioItem: 0,

  /** @type {number} */
  aspectRatioItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Aspect Ratio',
          '#/api/ComponentLayout#ComponentLayout-property-preferredSize'
        ),
        OptionGroupAttribute('LayoutGroup', 50),
        MinMaxAttribute().init({
          min: 0.2,
          max: 5.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$aspectRatioItem
    },
    set: function (value) {
      this.$aspectRatioItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAspectRatioItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.useScreenRatioItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $componentSpacingItem: 0,

  /** @type {number} */
  componentSpacingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Component Distance',
          '#/api/ComponentLayout#ComponentLayout-property-componentSpacing'
        ),
        OptionGroupAttribute('LayoutGroup', 60),
        MinMaxAttribute().init({
          min: 0.0,
          max: 400.0
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$componentSpacingItem
    },
    set: function (value) {
      this.$componentSpacingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $gridEnabledItem: false,

  /** @type {boolean} */
  gridEnabledItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Route on Grid',
          '#/api/ComponentLayout#ComponentLayout-property-gridSpacing'
        ),
        OptionGroupAttribute('LayoutGroup', 70),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$gridEnabledItem
    },
    set: function (value) {
      this.$gridEnabledItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $gridSpacingItem: 0,

  /** @type {number} */
  gridSpacingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Grid Spacing',
          '#/api/ComponentLayout#ComponentLayout-property-gridSpacing'
        ),
        OptionGroupAttribute('LayoutGroup', 80),
        MinMaxAttribute().init({
          min: 2,
          max: 100
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$gridSpacingItem
    },
    set: function (value) {
      this.$gridSpacingItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableGridSpacingItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.gridEnabledItem
    }
  }
})
export default ComponentLayoutConfig
