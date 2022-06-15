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
# Folding With Layout Demo

[You can also run this demo online](https://live.yworks.com/demos/layout/foldingwithlayout/index.html).

This demo shows how to automatically trigger a layout that clears or fills the space when opening or closing groups.

Every time a group node is expanded interactively, [ClearAreaLayout](https://docs.yworks.com/yfileshtml/#/api/ClearAreaLayout) will push away the other nodes so there is a free area for the expanded node and its (currently visible) children.

## Things to Try

Open and close the various group nodes.
