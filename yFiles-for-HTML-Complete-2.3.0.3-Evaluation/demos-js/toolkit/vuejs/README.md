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
# Vue.js Integration Demo

[You can also run this demo online](https://live.yworks.com/demos/toolkit/vuejs/index.html).

Shows how to use yFiles for HTML with Vue.js.

The following Vue.js features are shown:

- The yFiles `GraphComponent` is wrapped as a Vue component.
- A custom node style renders nodes using Vue components.
- A separate view shows the currently selected node using the same Vue component that renders the graph nodes.
- Employee properties can be edited using v-model bindings. The properties will update automatically in all views.
- The currently selected item is propagated to the application component using a Vue custom event.
