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
# Web Worker UMD Demo

[You can also run this demo online](https://live.yworks.com/demos/loading/webworker-umd/index.html).

This demo shows how to run a yFiles layout algorithm in a [Web Worker](https://html.spec.whatwg.org/multipage/workers.html) task in order to prevent the layout calculation from blocking the UI.

In order to run this demo, please run `npm install` in the demo folder.

Because web workers cannot load ES modules (yet), this demo loads yFiles using the AMD loader require.js

To transfer the graph structure and layout between the worker and the main page, a simple JSON format is used. As the web worker environment does not support any DOM-related functionality, the GraphML format can't be used for this purpose.

## Things to Try

- Modify the graph structure by adding/removing nodes and edges, and re-run the web worker layout.
