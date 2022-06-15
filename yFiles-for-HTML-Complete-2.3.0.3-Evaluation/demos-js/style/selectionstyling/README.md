<!--
 //////////////////////////////////////////////////////////////////////////////
 // @license
 // This demo file is part of yFiles for HTML 2.3.0.3.
 // Use is subject to license terms.
 //
 // Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 // 72070 Tuebingen, Germany. All rights reserved.
 //
 //////////////////////////////////////////////////////////////////////////////
-->
# Selection Styling Demo

[You can also run this demo online](https://live.yworks.com/demos/style/selectionstyling/index.html).

The Selection Styling demo shows customized selection painting of nodes, edges and labels by decorating these items with a corresponding style.

Customizing the painting of the focus indicator and the highlighting is possible as well but not shown in this demo.

## Things to Try

- Switch between the default visualization and the _Custom Styling_ of nodes, edges and labels with the toolbar buttons.
- Test the different _Zoom Modes_ for the custom selection painting.

## Zoom Mode Property

Specifies how the zoom level affects the custom selecting painting.

WorldCoordinates

The visual is rendered in the world coordinate space and scales with the zoom level like a regular graph item visualization, for example a node style.

ViewCoordinates

The visual is rendered in the view coordinate space and doesn't scale with the zoom level, similar to the default node resize handles, for example.

Mixed

Uses WorldCoordinates rendering for zoom level ≥ 1 and ViewCoordinates rendering for zoom level < 1.
