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
# Isometric Drawing Demo

[You can also run this demo online](https://live.yworks.com/demos/complete/isometricdrawing/index.html).

This demo displays graphs isometrically, adding an additional dimension to the visualization. This can be used to represent characteristics of the business data as height, or just because of the beautiful looks.

In this demo, WebGL is used for the rendering but the [projection](https://docs.yworks.com/yfileshtml/#/dguide/projections-main) feature of yFiles for HTML supports SVG and HTML Canvas rendering, too.

## Interaction

This demo features the full range of interactions [supported by yFiles](https://docs.yworks.com/yfileshtml/#/dguide/interaction-support). In addition, each node has an special handle at its top to change the height of the node.

## Things to Try

- Change the height of a node by selecting it and dragging the handle at its top.
- Change the rotation of the scene with the "Rotation" slider in the toolbar.
- Turn the grid on or off with the "Toggle Grid" button in the toolbar.
- Create a new node with a random color and height by clicking on empty space in the canvas.

## Layout

There are two suitable layout algorithms to apply to the graph.

- Hierarchic layout
- Orthogonal layout

## Loading Graphs

Load your own graph and display it isometrically.
