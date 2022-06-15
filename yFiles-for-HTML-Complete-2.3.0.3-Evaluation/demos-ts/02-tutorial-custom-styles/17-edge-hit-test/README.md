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
# Edge Hit Test - Custom Styles Tutorial

[You can also run this demo online](https://live.yworks.com/demos/02-tutorial-custom-styles/17-edge-hit-test/index.html).

This step shows how to take the thickness of the edge into account when checking if the edge was clicked.

For the purpose of this demo, the thickness of the edges is set to a high value.

## Things to Try

- Select an edge by clicking not in the middle but on the outer region. Even within a small range around the edge the hit test is positive. This is due to the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius) specified by the [ICanvasContext#hitTestRadius](https://docs.yworks.com/yfileshtml/#/api/ICanvasContext#hitTestRadius). This space gets bigger if you zoom out to make the selection more convenient for the user.
- Take a look at method [EdgeStyleBase#isHit](https://docs.yworks.com/yfileshtml/#/api/EdgeStyleBase#isHit) of `MySimpleEdgeStyle`.

## Left to Do

- Crop the edges so that they don't extend into the nodes.
- Change the style of an edge when selected.
- Create a custom arrow which fits the style of the demo.
- Create a custom port style for nodes.
- Use the decorator pattern to add label edges to the nodes.
- Create a custom group node style.
