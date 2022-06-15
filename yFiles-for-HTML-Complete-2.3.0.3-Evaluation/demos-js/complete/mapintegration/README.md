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
# Map Integration Demo

[You can also run this demo online](https://live.yworks.com/demos/complete/mapintegration/index.html).

This demo shows how to integrate a [GraphComponent](https://docs.yworks.com/yfileshtml/#/api/GraphComponent) with [Leaflet](https://leafletjs.com/). The `GraphComponent` is included in a custom Leaflet-Layer. The placement of the nodes uses geo-coordinates to get the correct locations on the map.

## Things to Try

- Drag the map and see how the graph moves along.
- Zoom into the map using the mouse-wheel or the controls in the upper-left corner of the map. The nodes mark the location of the airports and will keep their geo-location. Some of them are only visible on larger zoom levels.
- Click on two nodes and see the shortest path between those nodes.
- Toggle the graph mode using the ![](../../resources/icons/layout-circular-16.svg)\-control in the upper-right corner of the map to free the nodes from their geo-locations and apply a radial layout that visualizes how many hops are needed to reach another airport. Change the center node with a double-click on another node.
