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
# Simple Graph Builder Demo

[You can also run this demo online](https://live.yworks.com/demos/databinding/simplegraphbuilder/index.html).

This demo uses [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder), [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) or [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder) to automatically build a graph from business data.  
The business data can be stored in _arrays_ or in _JSON_ format.  
The nodes are visualized by a [TemplateNodeStyle](https://docs.yworks.com/yfileshtml/#/api/TemplateNodeStyle) instance that binds to the business data objects which [GraphBuilder](https://docs.yworks.com/yfileshtml/#/api/GraphBuilder), [TreeBuilder](https://docs.yworks.com/yfileshtml/#/api/TreeBuilder) and [AdjacencyGraphBuilder](https://docs.yworks.com/yfileshtml/#/api/AdjacencyGraphBuilder) store in the graph item's [ITagOwner#tag](https://docs.yworks.com/yfileshtml/#/api/ITagOwner#tag).

See the the Developer's Guide section on [creating a Graph from Business Data](https://docs.yworks.com/yfileshtml/#/dguide/graph_builder) for an in-depth explanation of the relevant concepts.

Each builder provides a specific set of methods that allow to configure the builder on the given data source.

### GraphBuilder

`createNodesSource`

Registers a data source that represents the nodes.

`createGroupNodesSource`

Registers a data source that represents the group nodes.

`createEdgesSource`

Registers a data source that represent the edges that connect the nodes.

### TreeBuilder

`createRootNodesSource`

Registers a data source that represents the root nodes.

`TreeNodesSource.createChildNodesSource`

Registers a data source as child entities of a [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource).

`TreeNodesSource.addChildNodesSource`

Binds a collection of child data objects of a [TreeNodesSource](https://docs.yworks.com/yfileshtml/#/api/TreeNodesSource).

### AdjacencyGraphBuilder

`createNodesSource`

Registers a data source that represents the nodes.

`createGroupNodesSource`

Registers a data source that represents the group nodes.

`AdjacencyNodesSource.addPredecessorIds`

Registers a provider for source node ids to which edges are created.

`AdjacencyNodesSource.addSuccessorIds`

Registers a provider for target node ids to which edges are created.

### Input Data

The files

- `graph-builder-data.js`
- `tree-builder-data-array.js`
- `tree-builder-data-json.js`
- `adjacent-builder-id-data-array.js`

show how the data can be specified for the different builders.
