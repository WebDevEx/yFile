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
# Custom Port Location Model Demo

[You can also run this demo online](https://live.yworks.com/demos/input/customportmodel/index.html).

This demo shows how to create and use a custom [IPortLocationModel](https://docs.yworks.com/yfileshtml/#/api/IPortLocationModel).

## Thing to Try

- Create new nodes in the canvas and connect them with new edges.  
  Note that a specialized set of possible port candidates is shown. The candidates use a custom port location model that offers five possible locations on each node.
- Click on one of the nodes and then drag the handle that depicts a port. Note that you can only drag the handle to the locations that are supported by the model.
- Try saving and loading the graph.

## Related Demo

- See the [Custom Label Model](../customlabelmodel/index.html) demo to learn how to customize the models for label locations. Note that the code is very similar as the same concepts are being applied.
