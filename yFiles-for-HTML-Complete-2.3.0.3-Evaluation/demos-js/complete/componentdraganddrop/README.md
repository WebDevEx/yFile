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
# Component Drag and Drop Demo

[You can also run this demo online](https://live.yworks.com/demos/complete/componentdraganddrop/index.html).

A demo that shows how to make space for components that you can drag from a palette onto the canvas.

If a component is dragged from the palette onto the canvas, the _ClearAreaLayout_ algorithm will push away the other elements so there is a free area for the component. This is also the case when dragging a component that is already part of the graph.

## Things to Try

- Drag a component from the palette onto the canvas and watch the graph give way to it.
- Drop the dragged component at the desired location.
- Press the ESC key while dragging to cancel the drag and drop operation.
- Select the button _Keep Components_ to prevent the components from being changed during the drag and drop operation.
- Select a component by clicking on a node, drag the component through the remaining graph, and watch how the graph changes to provide space for it.
