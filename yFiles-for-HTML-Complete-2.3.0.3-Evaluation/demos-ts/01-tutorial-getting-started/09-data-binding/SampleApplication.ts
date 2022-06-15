/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.3.0.3.
 ** Copyright (c) 2000-2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import {
  DefaultLabelStyle,
  EdgePathLabelModel,
  EdgeSides,
  FreeNodePortLocationModel,
  GraphComponent,
  GraphEditorInputMode,
  GraphItemTypes,
  GraphOverviewComponent,
  ICommand,
  IModelItem,
  INode,
  InteriorLabelModel,
  InteriorStretchLabelModel,
  ItemEventArgs,
  License,
  Mapper,
  MouseHoverInputMode,
  PanelNodeStyle,
  Point,
  PopulateItemContextMenuEventArgs,
  QueryItemToolTipEventArgs,
  ShapeNodeStyle,
  Size,
  ToolTipQueryEventArgs
} from 'yfiles'

import ContextMenu from '../../utils/ContextMenu'
import { bindCommand, showApp } from '../../resources/demo-app'
import loadJson from '../../resources/load-json'

// @ts-ignore
let graphComponent: GraphComponent = null

// @ts-ignore
let dateMapper: Mapper<INode, Date> = null

function run(licenseData: object): void {
  License.value = licenseData
  // Initialize the GraphComponent and place it in the div with CSS selector #graphComponent
  graphComponent = new GraphComponent('#graphComponent')

  // Enable grouping
  configureGroupNodeStyles()

  // Configure interaction
  configureInteraction()

  // /////////////// New in this Sample /////////////////

  // Sets up the data binding.
  enableDataBinding()

  // ////////////////////////////////////////////////////

  // Displays tooltips for the stored data items, so that something is visible to the user
  setupTooltips()

  // Add a context menu to nodes
  setupContextMenu()

  // Configures default label model parameters for newly created graph elements
  setDefaultLabelParameters()

  // Configures default styles for newly created graph elements
  setDefaultStyles()

  // Populates the graph and overrides some styles and label models
  populateGraph()

  // Creates a group node programmatically
  createGroupNodes()

  // Enables the undo engine (disabled by default)
  enableUndo()

  // Manages the viewport
  updateViewport()

  // bind the demo buttons to their commands
  registerCommands()

  // Initialize the demo application's CSS and Javascript for the description
  showApp(graphComponent)
}

/**
 * Sets up simple data binding - creates an IMapper, registers it and subscribe to the node creation event
 * on the graph.
 */
function enableDataBinding(): void {
  const graph = graphComponent.graph
  // Creates a specialized IMapper instance, and registers it under a symbolic name.
  dateMapper = new Mapper<INode, Date>()

  // Subscribes to the node creation event to record the node creation time.
  // Note that since this event is triggered after undo/redo, the time will
  // be updated during redo of node creations and undo of node deletions.
  // If this is unwanted behavior, you can customize the node creation itself
  // to associate this data with the element at the time of its initial creation,
  // e.g. by listening to the NodeCreated event of GraphEditorInputMode, see below
  graph.addNodeCreatedListener((source: object, eventArgs: ItemEventArgs<INode>): void => {
    // Stores the current time as node creation time.
    dateMapper.set(eventArgs.item, new Date())
  })
  // Alternatively (or in addition) we could use the event for
  // interactive node creation as follows, provided that the input mode
  // for the graph control is already set.
  ;(graphComponent.inputMode as GraphEditorInputMode).addNodeCreatedListener(
    (sender: object, args: ItemEventArgs<INode>): void => {
      // Store the data at the graph as in the original approach.
      dateMapper.set(args.item, new Date())
    }
  )
}

/**
 * Setup tooltips that return the value that is stored in the mapper.
 * Dynamic tooltips are implemented by adding a tooltip provider as an event handler for
 * the {@link MouseHoverInputMode#addQueryToolTipListener QueryToolTip} event of the
 * GraphEditorInputMode using the
 * {@link ToolTipQueryEventArgs} parameter.
 * The {@link ToolTipQueryEventArgs} parameter provides three relevant properties:
 * Handled, QueryLocation, and ToolTip. The Handled property is a flag which indicates
 * whether the tooltip was already set by one of possibly several tooltip providers. The
 * QueryLocation property contains the mouse position for the query in world coordinates.
 * The tooltip is set by setting the ToolTip property.
 */
function setupTooltips(): void {
  if (graphComponent.inputMode instanceof GraphEditorInputMode) {
    const graphEditorInputMode = graphComponent.inputMode
    graphEditorInputMode.toolTipItems = GraphItemTypes.NODE
    graphEditorInputMode.addQueryItemToolTipListener(
      (src: object, eventArgs: QueryItemToolTipEventArgs<IModelItem>): void => {
        if (eventArgs.handled) {
          // Tooltip content has already been assigned -> nothing to do.
          return
        }
        const item = eventArgs.item
        if (INode.isInstance(item)) {
          // Set the tooltip content.
          eventArgs.toolTip = dateMapper.get(item)!.toLocaleString()

          // Indicate that the tooltip content has been set.
          eventArgs.handled = true
        }
      }
    )

    // Add a little offset to the tooltip such that it is not obscured by the mouse pointer.
    graphEditorInputMode.mouseHoverInputMode.toolTipLocationOffset = new Point(20, 20)
  }
}

/**
 * Adds a context menu for nodes.
 */
function setupContextMenu(): void {
  const inputMode = graphComponent.inputMode as GraphEditorInputMode
  inputMode.contextMenuItems = GraphItemTypes.NODE

  // In this demo, we use our sample context menu implementation but you can use any other context menu widget as
  // well. See the Context Menu demo for more details about working with context menus
  const contextMenu = new ContextMenu(graphComponent)

  // Add event listeners to the various events that open the context menu. These listeners then
  // call the provided callback function which in turn asks the current ContextMenuInputMode if a
  // context menu should be shown at the current location.
  contextMenu.addOpeningEventListeners(graphComponent, (location: Point): void => {
    const worldLocation = graphComponent.toWorldFromPage(location)

    // Inform the input mode that a context menu should be opened.
    // Eventually, this will fire the events GraphEditorInputMode.PopulateItemContextMenu and
    // ContextMenuInputMode.PopulateMenu
    const showMenu = inputMode.contextMenuInputMode.shouldOpenMenu(worldLocation)

    // Check whether showing the context menu is permitted and if so show the menu
    if (showMenu) {
      contextMenu.show(location)
    }
  })

  // Add item-specific menu entries
  inputMode.addPopulateItemContextMenuListener(
    (sender: object, args: PopulateItemContextMenuEventArgs<IModelItem>): void => {
      contextMenu.clearItems()
      if (INode.isInstance(args.item)) {
        // The 'showMenu' property is set to true to inform the input mode that we actually want to show a context menu
        // for this item (or more generally, the location provided by the event args).
        // If you don't want to show a context menu for some locations, set 'false' in this cases.
        args.showMenu = true

        contextMenu.addMenuItem('Set to now', (): void => {
          dateMapper.set(args.item as INode, new Date())
        })
      }
    }
  )

  // Add a listener that closes the menu when the input mode requests this
  inputMode.contextMenuInputMode.addCloseMenuListener((): void => {
    contextMenu.close()
  })

  // If the context menu closes itself, for example because a menu item was clicked, we must inform the input mode
  contextMenu.onClosedCallback = (): void => {
    inputMode.contextMenuInputMode.menuClosed()
  }
}

/**
 * Enables the Undo functionality.
 */
function enableUndo(): void {
  // Enables undo on the graph.
  graphComponent.graph.undoEngineEnabled = true
}

/**
 * Configures the default style for group nodes.
 */
function configureGroupNodeStyles(): void {
  const graph = graphComponent.graph
  // PanelNodeStyle is a style especially suited to group nodes
  // Creates a panel with a light blue background
  graph.groupNodeDefaults.style = new PanelNodeStyle({
    color: 'rgb(214, 229, 248)',
    insets: [18, 5, 5, 5],
    labelInsetsColor: 'rgb(214, 229, 248)'
  })

  // Sets a label style with right-aligned text
  graph.groupNodeDefaults.labels.style = new DefaultLabelStyle({
    horizontalTextAlignment: 'right'
  })

  // Places the label at the top inside of the panel.
  // For PanelNodeStyle, InteriorStretchLabelModel is usually the most appropriate label model
  graph.groupNodeDefaults.labels.layoutParameter = InteriorStretchLabelModel.NORTH
}

/**
 * Shows how to create group nodes programmatically.
 * Creates a couple of nodes and puts them into a group node.
 */
function createGroupNodes(): void {
  const graph = graphComponent.graph
  const n1 = graph.createNodeAt(new Point(30, -200))
  const n2 = graph.createNodeAt(new Point(170, -200))
  const n3 = graph.createNodeAt(new Point(30, -100))
  // Create an edge inside the group node
  graph.createEdge(n1, n3)
  // Create an edge that crosses the group node boundary
  graph.createEdge(n3, graph.nodes.first())

  // Creates a group node that encloses n1, n2 and n3
  const groupNode = graph.groupNodes([n1, n2, n3])
  graph.addLabel(groupNode, 'Group Node')
  // Edges from the the group node itself are also allowed
  const edgeFromGroup = graph.createEdge(groupNode, graph.nodes.elementAt(1))
  graph.addBend(edgeFromGroup, new Point(100, -35), 0)
  graph.addBend(edgeFromGroup, new Point(170, -35), 1)

  // Creates a label for the group node
  graph.adjustGroupNodeLayout(groupNode)
}

/**
 * Configures basic interaction.
 * Interaction is handled by InputModes. {@link GraphEditorInputMode} is the main
 * InputMode that already provides a large number of graph interaction gestures, such as moving, deleting, creating,
 * resizing graph elements. Note that labels can be edited by pressing F2. Also, labels can be moved to different
 * locations determined by their label model.
 */
function configureInteraction(): void {
  // Creates a new GraphEditorInputMode instance and registers it as the main
  // input mode for the graphComponent
  graphComponent.inputMode = new GraphEditorInputMode({
    allowGroupingOperations: true
  })
}

/**
 * Sets up default label model parameters for graph elements.
 * Label model parameters control the actual label placement as well as the available
 * placement candidates when moving the label interactively.
 */
function setDefaultLabelParameters(): void {
  const graph = graphComponent.graph
  // For node labels, the default is a label position at the node center
  // Let's keep the default.  Here is how to set it manually
  graph.nodeDefaults.labels.layoutParameter = InteriorLabelModel.CENTER

  // For edge labels, the default is a label that is rotated to match the associated edge segment
  // We'll start by creating a model that is similar to the default:
  const edgeLabelModel = new EdgePathLabelModel({
    autoRotation: true,
    distance: 10,
    sideOfEdge: EdgeSides.LEFT_OF_EDGE | EdgeSides.RIGHT_OF_EDGE
  })
  // Finally, we can set this label model as the default for edge labels
  graph.edgeDefaults.labels.layoutParameter = edgeLabelModel.createDefaultParameter()
}

/**
 * Creates a sample graph and introduces all important graph elements present in
 * yFiles for HTML. Additionally, this method now overrides the label placement for some specific labels.
 */
function populateGraph(): void {
  // ////////// Sample node creation ///////////////////
  const graph = graphComponent.graph

  // Creates two nodes with the default node size
  // The location is specified for the _center_
  const node1 = graph.createNodeAt(new Point(30, 30))
  const node2 = graph.createNodeAt(new Point(170, 30))
  const node3 = graph.createNodeAt(new Point(260, 200))

  // ///////////////////////////////////////////////////

  // ////////// Sample edge creation ///////////////////

  // Creates some edges between the nodes
  graph.createEdge(node1, node2)
  const edge = graph.createEdge(node2, node3)

  // ///////////////////////////////////////////////////

  // ////////// Using Bends ////////////////////////////

  // Creates the first bend for edge at (260, 30)
  graph.addBend(edge, new Point(260, 30))

  // ///////////////////////////////////////////////////

  // ////////// Using Ports ////////////////////////////

  // Actually, edges connect "ports", not nodes directly.
  // If necessary, you can manually create ports at nodes
  // and let the edges connect to these.
  // Creates a port in the center of the node layout
  const port1AtNode1 = graph.addPort(node1, FreeNodePortLocationModel.NODE_CENTER_ANCHORED)

  // Creates a port at the middle of the left border
  // Note to use absolute locations when placing ports using PointD.
  const port1AtNode3 = graph.addPortAt(node3, new Point(node3.layout.x, node3.layout.center.y))

  // Creates an edge that connects these specific ports
  const edgeAtPorts = graph.createEdge(port1AtNode1, port1AtNode3)

  // ///////////////////////////////////////////////////

  // ////////// Sample label creation ///////////////////

  // Adds labels to several graph elements
  graph.addLabel(node1, 'n1')
  graph.addLabel(node2, 'n2')
  graph.addLabel(node3, 'n3')
  graph.addLabel(edgeAtPorts, 'Edge at Ports')
}

/**
 * Set up default styles for graph elements.
 * Default styles apply only to elements created after the default style has been set,
 * so typically, you'd set these as early as possible in your application.
 */
function setDefaultStyles(): void {
  const graph = graphComponent.graph
  // configure defaults for normal nodes and their labels
  graph.nodeDefaults.style = new ShapeNodeStyle({
    fill: 'darkorange',
    stroke: 'white'
  })
  // Sets the default size explicitly to 40x40
  graph.nodeDefaults.size = new Size(40, 40)
  graph.nodeDefaults.labels.style = new DefaultLabelStyle({
    verticalTextAlignment: 'center',
    wrapping: 'word-ellipsis'
  })
  // Sets the defined style as the default for both edge and node labels
  // Creates a label style with the label text color set to dark red
  const defaultLabelStyle = new DefaultLabelStyle({
    font: '12px Tahoma',
    textFill: 'black'
  })
  graph.edgeDefaults.labels.style = defaultLabelStyle
  graph.nodeDefaults.labels.style = defaultLabelStyle
}

/**
 * Updates the content rectangle to encompass all existing graph elements.
 * If you create your graph elements programmatically, the content rectangle
 * (i.e. the rectangle in <b>world coordinates</b>
 * that encloses the graph) is <b>not</b> updated automatically to enclose these elements.
 * Typically, this manifests in wrong/missing scrollbars, incorrect {@link GraphOverviewComponent}
 * behavior and the like.
 *
 * This method demonstrates several ways to update the content rectangle, with or without adjusting the zoom level
 * to show the whole graph in the view.
 *
 * Note that updating the content rectangle only does not change the current viewport (i.e. the world coordinate
 * rectangle that corresponds to the currently visible area in view coordinates)
 *
 * Uncomment various combinations of lines in this method and observe the different effects.
 *
 * The following demos in this tutorial will assume that you've called
 * <code>GraphComponent.fitGraphBounds()</code> in this method.
 */
function updateViewport(): void {
  // Uncomment the following line to update the content rectangle
  // to include all graph elements
  // This should result in correct scrolling behaviour:

  // graphComponent.updateContentRect();

  // Additionally, we can also set the zoom level so that the
  // content rectangle fits exactly into the viewport area:
  // Uncomment this line in addition to UpdateContentRect:
  // Note that this changes the zoom level (i.e. the graph elements will look smaller)

  // graphComponent.fitContent();

  // The sequence above is equivalent to just calling:
  graphComponent.fitGraphBounds()
}

/**
 * Helper method that binds the various commands available in yFiles for HTML to the buttons
 * in the demo's toolbar.
 */
function registerCommands(): void {
  bindCommand("button[data-command='Cut']", ICommand.CUT, graphComponent)
  bindCommand("button[data-command='Copy']", ICommand.COPY, graphComponent)
  bindCommand("button[data-command='Paste']", ICommand.PASTE, graphComponent)

  bindCommand("button[data-command='ZoomIn']", ICommand.INCREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='ZoomOut']", ICommand.DECREASE_ZOOM, graphComponent)
  bindCommand("button[data-command='FitContent']", ICommand.FIT_GRAPH_BOUNDS, graphComponent)
  bindCommand("button[data-command='ZoomOriginal']", ICommand.ZOOM, graphComponent, 1.0)

  bindCommand("button[data-command='Undo']", ICommand.UNDO, graphComponent)
  bindCommand("button[data-command='Redo']", ICommand.REDO, graphComponent)

  bindCommand("button[data-command='GroupSelection']", ICommand.GROUP_SELECTION, graphComponent)
  bindCommand("button[data-command='UngroupSelection']", ICommand.UNGROUP_SELECTION, graphComponent)
}

// start tutorial
loadJson().then(run)
