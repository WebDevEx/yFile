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
  GraphComponent,
  GraphTransformer,
  LayoutGraphAdapter,
  OperationType,
  YBoolean,
  YNumber
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
 * @yjs:keep=GeneralGroup,RotateGroup,ScaleGroup,TranslateGroup,actOnSelectionOnlyItem,applyBestFitRotationItem,operationItem,rotationAngleItem,scaleFactorItem,scaleNodeSizeItem,shouldDisableApplyBestFitRotationItem,shouldDisableRotationAngleItem,shouldDisableScaleFactorItem,shouldDisableScaleNodeSizeItem,shouldDisableTranslateXItem,shouldDisableTranslateYItem,translateXItem,translateYItem
 */
const GraphTransformerConfig = Class('GraphTransformerConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('GraphTransformer')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const transformer = new GraphTransformer()
    this.operationItem = OperationType.SCALE
    this.actOnSelectionOnlyItem = false
    this.rotationAngleItem = transformer.rotationAngle
    this.applyBestFitRotationItem = false
    this.scaleFactorItem = transformer.scaleFactorX
    this.scaleNodeSizeItem = transformer.scaleNodeSize
    this.translateXItem = transformer.translateX
    this.translateYItem = transformer.translateY
  },

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout  algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const transformer = new GraphTransformer()
    transformer.operation = this.operationItem
    transformer.subgraphLayoutEnabled = this.actOnSelectionOnlyItem
    transformer.rotationAngle = this.rotationAngleItem
    if (this.applyBestFitRotationItem && this.operationItem === OperationType.ROTATE) {
      const size = graphComponent.innerSize
      this.applyBestFitRotationItem = true
      const layoutGraph = new LayoutGraphAdapter(graphComponent.graph).createCopiedLayoutGraph()
      transformer.rotationAngle = GraphTransformer.findBestFitRotationAngle(
        layoutGraph,
        size.width,
        size.height
      )
    } else {
      this.applyBestFitRotationItem = false
    }

    transformer.scaleFactor = this.scaleFactorItem
    transformer.scaleNodeSize = this.scaleNodeSizeItem
    transformer.translateX = this.translateXItem
    transformer.translateY = this.translateYItem

    return transformer
  },

  // ReSharper disable UnusedMember.Global
  // ReSharper disable InconsistentNaming
  /** @type {OptionGroup} */
  GeneralGroup: {
    $meta: function () {
      return [
        LabelAttribute('General'),
        OptionGroupAttribute('RootGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  RotateGroup: {
    $meta: function () {
      return [
        LabelAttribute('Rotate'),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ScaleGroup: {
    $meta: function () {
      return [
        LabelAttribute('Scale'),
        OptionGroupAttribute('GeneralGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  TranslateGroup: {
    $meta: function () {
      return [
        LabelAttribute('Translate'),
        OptionGroupAttribute('GeneralGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  // ReSharper restore UnusedMember.Global
  // ReSharper restore InconsistentNaming
  /**
   * Backing field for below property
   * @type {OperationType}
   */
  $operationItem: null,

  /** @type {OperationType} */
  operationItem: {
    $meta: function () {
      return [
        LabelAttribute('Operation', '#/api/GraphTransformer#GraphTransformer-property-operation'),
        OptionGroupAttribute('GeneralGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Mirror on X axis', OperationType.MIRROR_X_AXIS],
            ['Mirror on Y axis', OperationType.MIRROR_Y_AXIS],
            ['Rotate', OperationType.ROTATE],
            ['Scale', OperationType.SCALE],
            ['Translate', OperationType.TRANSLATE]
          ]
        }),
        TypeAttribute(OperationType.$class)
      ]
    },
    get: function () {
      return this.$operationItem
    },
    set: function (value) {
      this.$operationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $actOnSelectionOnlyItem: false,

  /** @type {boolean} */
  actOnSelectionOnlyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Act on Selection Only',
          '#/api/GraphTransformer#MultiStageLayout-property-subgraphLayoutEnabled'
        ),
        OptionGroupAttribute('GeneralGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$actOnSelectionOnlyItem
    },
    set: function (value) {
      this.$actOnSelectionOnlyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $rotationAngleItem: 0,

  /** @type {number} */
  rotationAngleItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Rotation Angle',
          '#/api/GraphTransformer#GraphTransformer-property-rotationAngle'
        ),
        OptionGroupAttribute('RotateGroup', 10),
        MinMaxAttribute().init({
          min: -360,
          max: 360
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$rotationAngleItem
    },
    set: function (value) {
      this.$rotationAngleItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableRotationAngleItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.ROTATE || this.applyBestFitRotationItem
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $applyBestFitRotationItem: false,

  /** @type {boolean} */
  applyBestFitRotationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Best Fit Rotation',
          '#/api/GraphTransformer#GraphTransformer-method-findBestFitRotationAngle'
        ),
        OptionGroupAttribute('RotateGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$applyBestFitRotationItem
    },
    set: function (value) {
      this.$applyBestFitRotationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableApplyBestFitRotationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.ROTATE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $scaleFactorItem: 0,

  /** @type {number} */
  scaleFactorItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scale Factor',
          '#/api/GraphTransformer#GraphTransformer-property-scaleFactor'
        ),
        OptionGroupAttribute('ScaleGroup', 10),
        MinMaxAttribute().init({
          min: 0.1,
          max: 10.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$scaleFactorItem
    },
    set: function (value) {
      this.$scaleFactorItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableScaleFactorItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.SCALE
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $scaleNodeSizeItem: false,

  /** @type {boolean} */
  scaleNodeSizeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Scale Node Size',
          '#/api/GraphTransformer#GraphTransformer-property-scaleNodeSize'
        ),
        OptionGroupAttribute('ScaleGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$scaleNodeSizeItem
    },
    set: function (value) {
      this.$scaleNodeSizeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableScaleNodeSizeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.SCALE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $translateXItem: 0,

  /** @type {number} */
  translateXItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Horizontal Distance',
          '#/api/GraphTransformer#GraphTransformer-property-translateX'
        ),
        OptionGroupAttribute('TranslateGroup', 10),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$translateXItem
    },
    set: function (value) {
      this.$translateXItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableTranslateXItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.TRANSLATE
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $translateYItem: 0,

  /** @type {number} */
  translateYItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Vertical Distance',
          '#/api/GraphTransformer#GraphTransformer-property-translateY'
        ),
        OptionGroupAttribute('TranslateGroup', 20),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$translateYItem
    },
    set: function (value) {
      this.$translateYItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableTranslateYItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.operationItem !== OperationType.TRANSLATE
    }
  }
})
export default GraphTransformerConfig
