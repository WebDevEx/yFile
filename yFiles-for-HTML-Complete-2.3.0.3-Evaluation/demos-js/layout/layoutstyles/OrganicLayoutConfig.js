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
  ChainSubstructureStyle,
  Class,
  ComponentArrangementStyles,
  CycleSubstructureStyle,
  EnumDefinition,
  GenericLabeling,
  GraphComponent,
  GroupNodeMode,
  HideGroupsStage,
  IArrow,
  IEdge,
  ILayoutStage,
  OrganicLayout,
  OrganicLayoutData,
  OrganicLayoutScope,
  OutputRestriction,
  ParallelSubstructureStyle,
  PortConstraintKeys,
  StarSubstructureStyle,
  YBoolean,
  YDimension,
  YNumber,
  YObject,
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
 */
const OrganicLayoutConfig = Class('OrganicLayoutConfig', {
  $extends: LayoutConfiguration,

  $meta: [LabelAttribute('OrganicLayout')],

  /**
   * Setup default values for various configuration parameters.
   */
  constructor: function () {
    LayoutConfiguration.call(this)
    const layout = new OrganicLayout()
    this.scopeItem = OrganicLayoutScope.ALL
    this.preferredEdgeLengthItem = layout.preferredEdgeLength
    this.allowNodeOverlapsItem = layout.nodeOverlapsAllowed
    this.minimumNodeDistanceItem = 10
    this.avoidNodeEdgeOverlapsItem = layout.nodeEdgeOverlapAvoided
    this.compactnessItem = layout.compactnessFactor
    this.useAutoClusteringItem = layout.clusterNodes
    this.autoClusteringQualityItem = layout.clusteringQuality

    this.restrictOutputItem = OrganicLayoutConfig.EnumOutputRestrictions.NONE
    this.rectCageUseViewItem = true
    this.cageXItem = 0.0
    this.cageYItem = 0.0
    this.cageWidthItem = 1000.0
    this.cageHeightItem = 1000.0
    this.arCageUseViewItem = true
    this.cageRatioItem = 1.0

    this.groupLayoutPolicyItem = OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS

    this.qualityTimeRatioItem = layout.qualityTimeRatio
    this.maximumDurationItem = layout.maximumDuration / 1000
    this.activateDeterministicModeItem = layout.deterministic

    this.cycleSubstructureItem = CycleSubstructureStyle.NONE
    this.chainSubstructureItem = ChainSubstructureStyle.NONE
    this.starSubstructureItem = StarSubstructureStyle.NONE
    this.parallelSubstructureItem = ParallelSubstructureStyle.NONE

    this.considerNodeLabelsItem = layout.considerNodeLabels
    this.edgeLabelingItem = false
    this.labelPlacementAlongEdgeItem = LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED
    this.labelPlacementSideOfEdgeItem = LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
    this.labelPlacementOrientationItem =
      LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL
    this.labelPlacementDistanceItem = 10.0
  },

  /**
   * @type {ILayoutStage}
   */
  $preStage: null,

  /**
   * Creates and configures a layout and the graph's {@link IGraph#mapperRegistry} if necessary.
   * @param {GraphComponent} graphComponent The <code>GraphComponent</code> to apply the
   *   configuration on.
   * @return {ILayoutAlgorithm} The configured layout algorithm.
   */
  createConfiguredLayout: function (graphComponent) {
    const layout = new OrganicLayout()
    layout.preferredEdgeLength = this.preferredEdgeLengthItem
    layout.considerNodeLabels = this.considerNodeLabelsItem
    layout.nodeOverlapsAllowed = this.allowNodeOverlapsItem
    layout.minimumNodeDistance = this.minimumNodeDistanceItem
    layout.scope = this.scopeItem
    layout.compactnessFactor = this.compactnessItem
    layout.considerNodeSizes = true
    layout.clusterNodes = this.useAutoClusteringItem
    layout.clusteringQuality = this.autoClusteringQualityItem
    layout.nodeEdgeOverlapAvoided = this.avoidNodeEdgeOverlapsItem
    layout.deterministic = this.activateDeterministicModeItem
    layout.maximumDuration = 1000 * this.maximumDurationItem
    layout.qualityTimeRatio = this.qualityTimeRatioItem

    if (this.edgeLabelingItem) {
      const genericLabeling = new GenericLabeling()
      genericLabeling.placeEdgeLabels = true
      genericLabeling.placeNodeLabels = false
      genericLabeling.reduceAmbiguity = this.reduceAmbiguityItem
      layout.labelingEnabled = true
      layout.labeling = genericLabeling
    }
    layout.componentLayout.style = ComponentArrangementStyles.MULTI_ROWS

    this.$configureOutputRestrictions(graphComponent, layout)

    layout.cycleSubstructureStyle = this.cycleSubstructureItem
    layout.chainSubstructureStyle = this.chainSubstructureItem
    layout.starSubstructureStyle = this.starSubstructureItem
    layout.parallelSubstructureStyle = this.parallelSubstructureItem

    if (this.useEdgeGroupingItem) {
      graphComponent.graph.mapperRegistry.createConstantMapper(
        IEdge.$class,
        YObject.$class,
        PortConstraintKeys.SOURCE_GROUP_ID_DP_KEY,
        'Group'
      )
      graphComponent.graph.mapperRegistry.createConstantMapper(
        IEdge.$class,
        YObject.$class,
        PortConstraintKeys.TARGET_GROUP_ID_DP_KEY,
        'Group'
      )
    }
    LayoutConfiguration.addPreferredPlacementDescriptor(
      graphComponent.graph,
      this.labelPlacementAlongEdgeItem,
      this.labelPlacementSideOfEdgeItem,
      this.labelPlacementOrientationItem,
      this.labelPlacementDistanceItem
    )

    return layout
  },

  /**
   * Creates and configures the layout data.
   * @return {LayoutData} The configured layout data.
   */
  createConfiguredLayoutData: function (graphComponent, layout) {
    const layoutData = new OrganicLayoutData({
      affectedNodes: graphComponent.selection.selectedNodes
    })

    switch (this.groupLayoutPolicyItem) {
      case OrganicLayoutConfig.EnumGroupLayoutPolicy.IGNORE_GROUPS:
        this.$preStage = new HideGroupsStage()
        layout.prependStage(this.$preStage)
        break
      case OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS:
        // do nothing...
        break
      case OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_BOUNDS:
        layoutData.groupNodeModes = node => {
          return graphComponent.graph.isGroupNode(node)
            ? GroupNodeMode.FIX_BOUNDS
            : GroupNodeMode.NORMAL
        }
        break
      case OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_CONTENTS:
        layoutData.groupNodeModes = node => {
          return graphComponent.graph.isGroupNode(node)
            ? GroupNodeMode.FIX_CONTENTS
            : GroupNodeMode.NORMAL
        }
        break
      default:
        this.$preStage = new HideGroupsStage()
        layout.prependStage(this.$preStage)
        break
    }

    if (this.edgeDirectednessItem) {
      layoutData.edgeDirectedness = edge => {
        if (
          edge.style.showTargetArrows ||
          (edge.style.targetArrow && edge.style.targetArrow !== IArrow.NONE)
        ) {
          return 1
        }
        return 0
      }
    }
    return layoutData
  },

  $configureOutputRestrictions: function (graphComponent, layout) {
    let viewInfoIsAvailable = false
    const visibleRect = OrganicLayoutConfig.getVisibleRectangle(graphComponent)
    let x = 0
    let y = 0
    let w = 0
    let h = 0
    if (visibleRect !== null) {
      viewInfoIsAvailable = true
      x = visibleRect[0]
      y = visibleRect[1]
      w = visibleRect[2]
      h = visibleRect[3]
    }
    switch (this.restrictOutputItem) {
      case OrganicLayoutConfig.EnumOutputRestrictions.NONE:
        layout.componentLayoutEnabled = true
        layout.outputRestriction = OutputRestriction.NONE
        break
      case OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE:
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.outputRestriction = OutputRestriction.createRectangularCageRestriction(x, y, w, h)
        layout.componentLayoutEnabled = false
        break
      case OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_AR: {
        const ratio = viewInfoIsAvailable && this.arCageUseViewItem ? w / h : this.cageRatioItem
        layout.outputRestriction = OutputRestriction.createAspectRatioRestriction(ratio)
        layout.componentLayoutEnabled = true
        layout.componentLayout.preferredSize = new YDimension(ratio * 100, 100)
        break
      }
      case OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE:
        if (!viewInfoIsAvailable || !this.rectCageUseViewItem) {
          x = this.cageXItem
          y = this.cageYItem
          w = this.cageWidthItem
          h = this.cageHeightItem
        }
        layout.outputRestriction = OutputRestriction.createEllipticalCageRestriction(x, y, w, h)
        layout.componentLayoutEnabled = false
        break
      default:
        layout.componentLayoutEnabled = true
        layout.outputRestriction = OutputRestriction.NONE
        break
    }
  },

  /**
   * Called when the layout has finished to remove mappers.
   * @param graphComponent the given graphComponent
   */
  postProcess: function (graphComponent) {
    if (this.useEdgeGroupingItem) {
      const mapperRegistry = graphComponent.graph.mapperRegistry
      mapperRegistry.removeMapper(PortConstraintKeys.SOURCE_GROUP_ID_DP_KEY)
      mapperRegistry.removeMapper(PortConstraintKeys.TARGET_GROUP_ID_DP_KEY)
    }
  },

  /**
   * Enables different layout styles for possible detected substructures.
   */
  enableSubstructures: function () {
    this.cycleSubstructureItem = CycleSubstructureStyle.CIRCULAR
    this.chainSubstructureItem = ChainSubstructureStyle.STRAIGHT_LINE
    this.starSubstructureItem = StarSubstructureStyle.RADIAL
    this.parallelSubstructureItem = ParallelSubstructureStyle.STRAIGHT_LINE
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
  VisualGroup: {
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
  RestrictionsGroup: {
    $meta: function () {
      return [
        LabelAttribute('Restrictions'),
        OptionGroupAttribute('RootGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  CageGroup: {
    $meta: function () {
      return [
        LabelAttribute('Bounds'),
        OptionGroupAttribute('RestrictionsGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  ARGroup: {
    $meta: function () {
      return [
        LabelAttribute('Aspect Ratio'),
        OptionGroupAttribute('RestrictionsGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  GroupingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Grouping'),
        OptionGroupAttribute('RootGroup', 30),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  AlgorithmGroup: {
    $meta: function () {
      return [
        LabelAttribute('Algorithm'),
        OptionGroupAttribute('RootGroup', 40),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  SubstructureLayoutGroup: {
    $meta: function () {
      return [
        LabelAttribute('Substructure Layout'),
        OptionGroupAttribute('RootGroup', 50),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  LabelingGroup: {
    $meta: function () {
      return [
        LabelAttribute('Labeling'),
        OptionGroupAttribute('RootGroup', 60),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  NodePropertiesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Node Settings'),
        OptionGroupAttribute('LabelingGroup', 10),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  EdgePropertiesGroup: {
    $meta: function () {
      return [
        LabelAttribute('Edge Settings'),
        OptionGroupAttribute('LabelingGroup', 20),
        TypeAttribute(OptionGroup.$class)
      ]
    },
    value: null
  },

  /** @type {OptionGroup} */
  PreferredPlacementGroup: {
    $meta: function () {
      return [
        LabelAttribute('Preferred Edge Label Placement'),
        OptionGroupAttribute('LabelingGroup', 30),
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
      return "<p style='margin-top:0'>The organic layout style is based on the force-directed layout paradigm. This algorithm simulates physical forces and rearranges the positions of the nodes in such a way that the sum of the forces emitted by the nodes and the edges reaches a (local) minimum.</p><p>This style is well suited for the visualization of highly connected backbone regions with attached peripheral ring or tree structures. In a diagram arranged by this algorithm, these regions of a network can be easily identified.</p><p>The organic layout style is a multi-purpose layout for undirected graphs. It produces clear representations of complex networks and is especially fitted for application domains such as:</p><ul><li>Bioinformatics</li><li>Enterprise networking</li><li>Knowledge representation</li><li>System management</li><li>WWW visualization</li><li>Mesh visualization</li></ul>"
    }
  },

  /**
   * Backing field for below property
   * @type {OrganicLayoutScope}
   */
  $scopeItem: null,

  /** @type {OrganicLayoutScope} */
  scopeItem: {
    $meta: function () {
      return [
        LabelAttribute('Scope', '#/api/OrganicLayout#OrganicLayout-property-scope'),
        OptionGroupAttribute('VisualGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['All', OrganicLayoutScope.ALL],
            ['Mainly Selection', OrganicLayoutScope.MAINLY_SUBSET],
            ['Selection', OrganicLayoutScope.SUBSET]
          ]
        }),
        TypeAttribute(OrganicLayoutScope.$class)
      ]
    },
    get: function () {
      return this.$scopeItem
    },
    set: function (value) {
      this.$scopeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $preferredEdgeLengthItem: 0,

  /** @type {number} */
  preferredEdgeLengthItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Preferred Edge Length',
          '#/api/OrganicLayout#OrganicLayout-property-preferredEdgeLength'
        ),
        OptionGroupAttribute('VisualGroup', 20),
        MinMaxAttribute().init({
          min: 5,
          max: 500
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$preferredEdgeLengthItem
    },
    set: function (value) {
      this.$preferredEdgeLengthItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $allowNodeOverlapsItem: false,

  /** @type {boolean} */
  allowNodeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Allow Overlapping Nodes',
          '#/api/OrganicLayout#OrganicLayout-property-nodeOverlapsAllowed'
        ),
        OptionGroupAttribute('VisualGroup', 40),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$allowNodeOverlapsItem
    },
    set: function (value) {
      this.$allowNodeOverlapsItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAllowNodeOverlapsItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.considerNodeLabelsItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $minimumNodeDistanceItem: 0,

  /** @type {number} */
  minimumNodeDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Minimum Node Distance',
          '#/api/OrganicLayout#OrganicLayout-property-minimumNodeDistance'
        ),
        OptionGroupAttribute('VisualGroup', 30),
        MinMaxAttribute().init({
          min: 0.0,
          max: 100.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$minimumNodeDistanceItem
    },
    set: function (value) {
      this.$minimumNodeDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableMinimumNodeDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.allowNodeOverlapsItem && !this.considerNodeLabelsItem
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $avoidNodeEdgeOverlapsItem: false,

  /** @type {boolean} */
  avoidNodeEdgeOverlapsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Avoid Node/Edge Overlaps',
          '#/api/OrganicLayout#OrganicLayout-property-nodeEdgeOverlapAvoided'
        ),
        OptionGroupAttribute('VisualGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$avoidNodeEdgeOverlapsItem
    },
    set: function (value) {
      this.$avoidNodeEdgeOverlapsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $compactnessItem: 0,

  /** @type {number} */
  compactnessItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Compactness',
          '#/api/OrganicLayout#OrganicLayout-property-compactnessFactor'
        ),
        OptionGroupAttribute('VisualGroup', 70),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.1
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$compactnessItem
    },
    set: function (value) {
      this.$compactnessItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useAutoClusteringItem: false,

  /** @type {boolean} */
  useAutoClusteringItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Natural Clustering',
          '#/api/OrganicLayout#OrganicLayout-property-clusterNodes'
        ),
        OptionGroupAttribute('VisualGroup', 80),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$useAutoClusteringItem
    },
    set: function (value) {
      this.$useAutoClusteringItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $autoClusteringQualityItem: 0,

  /** @type {number} */
  autoClusteringQualityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Natural Clustering Quality',
          '#/api/OrganicLayout#OrganicLayout-property-clusteringQuality'
        ),
        OptionGroupAttribute('VisualGroup', 90),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$autoClusteringQualityItem
    },
    set: function (value) {
      this.$autoClusteringQualityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableAutoClusteringQualityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.useAutoClusteringItem === false
    }
  },

  /**
   * Backing field for below property
   * @type {OrganicLayoutConfig.EnumOutputRestrictions}
   */
  $restrictOutputItem: null,

  /** @type {OrganicLayoutConfig.EnumOutputRestrictions} */
  restrictOutputItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Output Area',
          '#/api/OrganicLayout#OrganicLayout-property-outputRestriction'
        ),
        OptionGroupAttribute('RestrictionsGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Unrestricted', OrganicLayoutConfig.EnumOutputRestrictions.NONE],
            ['Rectangular', OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE],
            ['Aspect Ratio', OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_AR],
            ['Elliptical', OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE]
          ]
        }),
        TypeAttribute(OrganicLayoutConfig.EnumOutputRestrictions.$class)
      ]
    },
    get: function () {
      return this.$restrictOutputItem
    },
    set: function (value) {
      this.$restrictOutputItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageGroup: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        this.restrictOutputItem !== OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_CAGE &&
        this.restrictOutputItem !==
          OrganicLayoutConfig.EnumOutputRestrictions.OUTPUT_ELLIPTICAL_CAGE
      )
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $rectCageUseViewItem: false,

  /** @type {boolean} */
  rectCageUseViewItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Use Visible Area',
          '#/api/OrganicLayout#OrganicLayout-property-outputRestriction'
        ),
        OptionGroupAttribute('CageGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$rectCageUseViewItem
    },
    set: function (value) {
      this.$rectCageUseViewItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cageXItem: 0,

  /** @type {number} */
  cageXItem: {
    $meta: function () {
      return [
        LabelAttribute('Top Left X'),
        OptionGroupAttribute('CageGroup', 20),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$cageXItem
    },
    set: function (value) {
      this.$cageXItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageXItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cageYItem: 0,

  /** @type {number} */
  cageYItem: {
    $meta: function () {
      return [
        LabelAttribute('Top Left Y'),
        OptionGroupAttribute('CageGroup', 30),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$cageYItem
    },
    set: function (value) {
      this.$cageYItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageYItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cageWidthItem: 0,

  /** @type {number} */
  cageWidthItem: {
    $meta: function () {
      return [
        LabelAttribute('Width'),
        OptionGroupAttribute('CageGroup', 40),
        MinMaxAttribute().init({ min: 1 }),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$cageWidthItem
    },
    set: function (value) {
      this.$cageWidthItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageWidthItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cageHeightItem: 0,

  /** @type {number} */
  cageHeightItem: {
    $meta: function () {
      return [
        LabelAttribute('Height'),
        OptionGroupAttribute('CageGroup', 50),
        MinMaxAttribute().init({ min: 1 }),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$cageHeightItem
    },
    set: function (value) {
      this.$cageHeightItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageHeightItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.rectCageUseViewItem
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $arCageUseViewItem: false,

  /** @type {boolean} */
  arCageUseViewItem: {
    $meta: function () {
      return [
        LabelAttribute('Use Ratio of View'),
        OptionGroupAttribute('ARGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$arCageUseViewItem
    },
    set: function (value) {
      this.$arCageUseViewItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $cageRatioItem: 0,

  /** @type {number} */
  cageRatioItem: {
    $meta: function () {
      return [
        LabelAttribute('Aspect Ratio'),
        OptionGroupAttribute('ARGroup', 20),
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
      return this.$cageRatioItem
    },
    set: function (value) {
      this.$cageRatioItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableCageRatioItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return this.arCageUseViewItem
    }
  },

  /**
   * Backing field for below property
   * @type {OrganicLayoutConfig.EnumGroupLayoutPolicy}
   */
  $groupLayoutPolicyItem: null,

  /** @type {OrganicLayoutConfig.EnumGroupLayoutPolicy} */
  groupLayoutPolicyItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Group Layout Policy',
          '#/api/OrganicLayoutData#OrganicLayoutData-property-groupNodeModes'
        ),
        OptionGroupAttribute('GroupingGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Layout Groups', OrganicLayoutConfig.EnumGroupLayoutPolicy.LAYOUT_GROUPS],
            ['Fix Bounds of Groups', OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_BOUNDS],
            [
              'Fix Contents of Groups',
              OrganicLayoutConfig.EnumGroupLayoutPolicy.FIX_GROUP_CONTENTS
            ],
            ['Ignore Groups', OrganicLayoutConfig.EnumGroupLayoutPolicy.IGNORE_GROUPS]
          ]
        }),
        TypeAttribute(OrganicLayoutConfig.EnumGroupLayoutPolicy.$class)
      ]
    },
    get: function () {
      return this.$groupLayoutPolicyItem
    },
    set: function (value) {
      this.$groupLayoutPolicyItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $qualityTimeRatioItem: 0,

  /** @type {number} */
  qualityTimeRatioItem: {
    $meta: function () {
      return [
        LabelAttribute('Quality', '#/api/OrganicLayout#OrganicLayout-property-qualityTimeRatio'),
        OptionGroupAttribute('AlgorithmGroup', 10),
        MinMaxAttribute().init({
          min: 0.0,
          max: 1.0,
          step: 0.01
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$qualityTimeRatioItem
    },
    set: function (value) {
      this.$qualityTimeRatioItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $maximumDurationItem: 0,

  /** @type {number} */
  maximumDurationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Maximum Duration (sec)',
          '#/api/OrganicLayout#OrganicLayout-property-maximumDuration'
        ),
        OptionGroupAttribute('AlgorithmGroup', 20),
        MinMaxAttribute().init({
          min: 0,
          max: 150
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$maximumDurationItem
    },
    set: function (value) {
      this.$maximumDurationItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $activateDeterministicModeItem: false,

  /** @type {boolean} */
  activateDeterministicModeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Deterministic Mode',
          '#/api/OrganicLayout#OrganicLayout-property-deterministic'
        ),
        OptionGroupAttribute('AlgorithmGroup', 30),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$activateDeterministicModeItem
    },
    set: function (value) {
      this.$activateDeterministicModeItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $considerNodeLabelsItem: false,

  /** @type {boolean} */
  considerNodeLabelsItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Consider Node Labels',
          '#/api/OrganicLayout#OrganicLayout-property-considerNodeLabels'
        ),
        OptionGroupAttribute('NodePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$considerNodeLabelsItem
    },
    set: function (value) {
      this.$considerNodeLabelsItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {CycleSubstructureStyle}
   */
  $cycleSubstructureItem: null,

  /** @type {CycleSubstructureStyle} */
  cycleSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Cycles',
          '#/api/OrganicLayout#OrganicLayout-property-cycleSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', CycleSubstructureStyle.NONE],
            ['Circular', CycleSubstructureStyle.CIRCULAR]
          ]
        }),
        TypeAttribute(CycleSubstructureStyle.$class)
      ]
    },
    get: function () {
      return this.$cycleSubstructureItem
    },
    set: function (value) {
      this.$cycleSubstructureItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {ChainSubstructureStyle}
   */
  $chainSubstructureItem: null,

  /** @type {ChainSubstructureStyle} */
  chainSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Chains',
          '#/api/OrganicLayout#OrganicLayout-property-chainSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', ChainSubstructureStyle.NONE],
            ['Rectangular', ChainSubstructureStyle.RECTANGULAR],
            ['Straight-Line', ChainSubstructureStyle.STRAIGHT_LINE]
          ]
        }),
        TypeAttribute(ChainSubstructureStyle.$class)
      ]
    },
    get: function () {
      return this.$chainSubstructureItem
    },
    set: function (value) {
      this.$chainSubstructureItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {StarSubstructureStyle}
   */
  $starSubstructureItem: null,

  /** @type {StarSubstructureStyle} */
  starSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute('Star', '#/api/OrganicLayout#OrganicLayout-property-starSubstructureStyle'),
        OptionGroupAttribute('SubstructureLayoutGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', StarSubstructureStyle.NONE],
            ['Circular', StarSubstructureStyle.CIRCULAR],
            ['Radial', StarSubstructureStyle.RADIAL],
            ['Separated Radial', StarSubstructureStyle.SEPARATED_RADIAL]
          ]
        }),
        TypeAttribute(StarSubstructureStyle.$class)
      ]
    },
    get: function () {
      return this.$starSubstructureItem
    },
    set: function (value) {
      this.$starSubstructureItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {ParallelSubstructureStyle}
   */
  $parallelSubstructureItem: null,

  /** @type {ParallelSubstructureStyle  } */
  parallelSubstructureItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Parallel',
          '#/api/OrganicLayout#OrganicLayout-property-parallelSubstructureStyle'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 40),
        EnumValuesAttribute().init({
          values: [
            ['Ignore', ParallelSubstructureStyle.NONE],
            ['Radial', ParallelSubstructureStyle.RADIAL],
            ['Rectangular', ParallelSubstructureStyle.RECTANGULAR],
            ['Straight-Line', ParallelSubstructureStyle.STRAIGHT_LINE]
          ]
        }),
        TypeAttribute(ParallelSubstructureStyle.$class)
      ]
    },
    get: function () {
      return this.$parallelSubstructureItem
    },
    set: function (value) {
      this.$parallelSubstructureItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeDirectednessItem: false,

  /** @type {boolean} */
  edgeDirectednessItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Arrows Define Edge Direction',
          '#/api/OrganicLayoutData#OrganicLayoutData-property-edgeDirectedness'
        ),
        OptionGroupAttribute('SubstructureLayoutGroup', 50),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$edgeDirectednessItem
    },
    set: function (value) {
      this.$edgeDirectednessItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $useEdgeGroupingItem: false,

  /** @type {boolean} */
  useEdgeGroupingItem: {
    $meta: function () {
      return [
        LabelAttribute('Use Edge Grouping', '#/api/PortConstraintKeys'),
        OptionGroupAttribute('SubstructureLayoutGroup', 60),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$useEdgeGroupingItem
    },
    set: function (value) {
      this.$useEdgeGroupingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $edgeLabelingItem: false,

  /** @type {boolean} */
  edgeLabelingItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Edge Labeling',
          '#/api/OrganicLayout#MultiStageLayout-property-labelingEnabled'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 10),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$edgeLabelingItem
    },
    set: function (value) {
      this.$edgeLabelingItem = value
    }
  },

  /**
   * Backing field for below property
   * @type {boolean}
   */
  $reduceAmbiguityItem: false,

  /** @type {boolean} */
  reduceAmbiguityItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Reduce Ambiguity',
          '#/api/GenericLabeling#MISLabelingBase-property-reduceAmbiguity'
        ),
        OptionGroupAttribute('EdgePropertiesGroup', 20),
        TypeAttribute(YBoolean.$class)
      ]
    },
    get: function () {
      return this.$reduceAmbiguityItem
    },
    set: function (value) {
      this.$reduceAmbiguityItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableReduceAmbiguityItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementOrientation}
   */
  $labelPlacementOrientationItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementOrientation} */
  labelPlacementOrientationItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Orientation',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-angle'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 10),
        EnumValuesAttribute().init({
          values: [
            ['Parallel', LayoutConfiguration.EnumLabelPlacementOrientation.PARALLEL],
            ['Orthogonal', LayoutConfiguration.EnumLabelPlacementOrientation.ORTHOGONAL],
            ['Horizontal', LayoutConfiguration.EnumLabelPlacementOrientation.HORIZONTAL],
            ['Vertical', LayoutConfiguration.EnumLabelPlacementOrientation.VERTICAL]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementOrientation.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementOrientationItem
    },
    set: function (value) {
      this.$labelPlacementOrientationItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementOrientationItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementAlongEdge}
   */
  $labelPlacementAlongEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementAlongEdge} */
  labelPlacementAlongEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Along Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-placeAlongEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 20),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementAlongEdge.ANYWHERE],
            ['At Source', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE],
            ['At Source Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_SOURCE_PORT],
            ['At Target', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET],
            ['At Target Port', LayoutConfiguration.EnumLabelPlacementAlongEdge.AT_TARGET_PORT],
            ['Centered', LayoutConfiguration.EnumLabelPlacementAlongEdge.CENTERED]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementAlongEdge.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementAlongEdgeItem
    },
    set: function (value) {
      this.$labelPlacementAlongEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementAlongEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge}
   */
  $labelPlacementSideOfEdgeItem: null,

  /** @type {LayoutConfiguration.EnumLabelPlacementSideOfEdge} */
  labelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Side of Edge',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-sideOfEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 30),
        EnumValuesAttribute().init({
          values: [
            ['Anywhere', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ANYWHERE],
            ['On Edge', LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE],
            ['Left', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT],
            ['Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.RIGHT],
            ['Left or Right', LayoutConfiguration.EnumLabelPlacementSideOfEdge.LEFT_OR_RIGHT]
          ]
        }),
        TypeAttribute(LayoutConfiguration.EnumLabelPlacementSideOfEdge.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementSideOfEdgeItem
    },
    set: function (value) {
      this.$labelPlacementSideOfEdgeItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementSideOfEdgeItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return !this.edgeLabelingItem
    }
  },

  /**
   * Backing field for below property
   * @type {number}
   */
  $labelPlacementDistanceItem: 0,

  /** @type {number} */
  labelPlacementDistanceItem: {
    $meta: function () {
      return [
        LabelAttribute(
          'Distance',
          '#/api/PreferredPlacementDescriptor#PreferredPlacementDescriptor-property-distanceToEdge'
        ),
        OptionGroupAttribute('PreferredPlacementGroup', 40),
        MinMaxAttribute().init({
          min: 0.0,
          max: 40.0
        }),
        ComponentAttribute(Components.SLIDER),
        TypeAttribute(YNumber.$class)
      ]
    },
    get: function () {
      return this.$labelPlacementDistanceItem
    },
    set: function (value) {
      this.$labelPlacementDistanceItem = value
    }
  },

  /** @type {boolean} */
  shouldDisableLabelPlacementDistanceItem: {
    $meta: function () {
      return [TypeAttribute(YBoolean.$class)]
    },
    get: function () {
      return (
        !this.edgeLabelingItem ||
        this.labelPlacementSideOfEdgeItem ===
          LayoutConfiguration.EnumLabelPlacementSideOfEdge.ON_EDGE
      )
    }
  },

  $static: {
    /**
     * @return {number[]}
     */
    getVisibleRectangle: function (graphComponent) {
      const visibleRect = [0, 0, 0, 0]
      if (graphComponent !== null) {
        const viewPort = graphComponent.viewport
        visibleRect[0] = viewPort.x
        visibleRect[1] = viewPort.y
        visibleRect[2] = viewPort.width
        visibleRect[3] = viewPort.height
        return visibleRect
      }
      return null
    },

    // ReSharper restore UnusedMember.Global
    // ReSharper restore InconsistentNaming
    EnumOutputRestrictions: new EnumDefinition(() => {
      return {
        NONE: 0,
        OUTPUT_CAGE: 1,
        OUTPUT_AR: 2,
        OUTPUT_ELLIPTICAL_CAGE: 3
      }
    }),

    EnumGroupLayoutPolicy: new EnumDefinition(() => {
      return {
        LAYOUT_GROUPS: 0,
        FIX_GROUP_BOUNDS: 1,
        FIX_GROUP_CONTENTS: 2,
        IGNORE_GROUPS: 3
      }
    })
  }
})
export default OrganicLayoutConfig
