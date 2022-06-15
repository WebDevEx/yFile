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
# Web Worker Demo

This demo shows how to run a yFiles layout algorithm in a [Web Worker](https://html.spec.whatwg.org/multipage/workers.html) task in order to prevent the layout calculation from blocking the UI.

To transfer the graph structure and layout between the worker and the main page, a simple JSON format is used. As the web worker environment does not support any DOM-related functionality, the GraphML format can't be used for this purpose.

## Build

Install the required npm packages and run the build script

```
\> npm install
> npm run build

```

## Run

The output files will be placed in the `dist/` directory inside this demo's directory. To run the demo, open `./index.html` in a browser.
