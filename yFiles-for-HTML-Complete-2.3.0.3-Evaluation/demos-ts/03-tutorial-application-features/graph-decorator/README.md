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
# Graph Decorator - Application Features Tutorial

[You can also run this demo online](https://live.yworks.com/demos/03-tutorial-application-features/graph-decorator/index.html).

## Graph Decorator

This demo shows how to use the graph decorator concept to customize the behavior and the visualization of graph items.

As example, this demo decorates the nodes with a port candidate provider that is a combination of the following existing port candidate providers:

[IPortCandidateProvider#fromExistingPorts](https://docs.yworks.com/yfileshtml/#/api/IPortCandidateProvider#fromExistingPorts)

Provides port candidates at the locations of already existing ports.

[IPortCandidateProvider#fromNodeCenter](https://docs.yworks.com/yfileshtml/#/api/IPortCandidateProvider#fromNodeCenter)

Provides a single port candidate at the center of the node.

[IPortCandidateProvider#fromShapeGeometry](https://docs.yworks.com/yfileshtml/#/api/IPortCandidateProvider#fromShapeGeometry)

Provides several port candidates based on the shape of the node's style.

See the sources for details.
