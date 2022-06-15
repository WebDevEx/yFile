/**
 * @license
 * This app exhibits yFiles for HTML functionalities.
 * Copyright (c) 2020 by yWorks GmbH, Vor dem Kreuzberg 28,
 * 72070 Tuebingen, Germany. All rights reserved.
 *
 * yFiles demo files exhibit yFiles for HTML functionalities.
 * Any redistribution of demo files in source code or binary form, with
 * or without modification, is not permitted.
 *
 * Owners of a valid software license for a yFiles for HTML
 * version are allowed to use the app source code as basis for their
 * own yFiles for HTML powered applications. Use of such programs is
 * governed by the rights and conditions as set out in the yFiles for HTML
 * license agreement. If in doubt, please mail to contact@yworks.com.
 *
 * THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 * NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  Injector,
  ViewChild,
  ApplicationRef,
} from '@angular/core'
import {
  GraphComponent,
  GraphEditorInputMode,
  License,
  ICommand,
  INode,
  IEdge,
  GraphMLSupport,
  TimeSpan,
  IModelItem,
  MouseHoverInputMode,
  StorageLocation,
  ToolTipQueryEventArgs,
  GraphItemTypes,
  Point,
} from 'yfiles'
import {
  VuejsNodeStyle,
  VuejsNodeStyleMarkupExtension,
} from '../../lib/VuejsNodeStyle'

import { GraphComponentService } from '../services/graph-component.service'
import { EventBusService } from '../services/event-bus.service'
import loadGraph from '../../lib/loadGraph'
import { ExportFormat, ExportSupport } from '../../lib/ExportSupport'
import PrintingSupport from '../../lib/PrintingSupport'
import GraphSearch from '../../lib/GraphSearch'
import { TooltipComponent } from '../tooltip/tooltip.component'

import licenseData from '../../license.json'
License.value = licenseData

@Component({
  selector: 'app-graph-component',
  templateUrl: './graph-component.component.html',
  styleUrls: ['./graph-component.component.css'],
})
export class GraphComponentComponent implements AfterViewInit {
  @ViewChild('graphComponentRef') graphComponentRef!: ElementRef
  graphComponent!: GraphComponent
  private graphSearch: GraphSearch
  private query: string

  contextMenuActions: { title: string; action: () => void }[] = [
    {
      title: 'Context Menu',
      action: () => alert('Context menu entry clicked!'),
    },
  ]

  constructor(
    graphComponentService: GraphComponentService,
    private eventBus: EventBusService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.graphComponent = graphComponentService.getGraphComponent()
  }

  async ngAfterViewInit() {
    const div = this.graphComponent.div
    div.style.height = '100%'
    this.graphComponentRef.nativeElement.appendChild(div)

    this.graphComponent.inputMode = new GraphEditorInputMode()

    this.graphComponent.graph = await loadGraph()

    this.graphComponent.graph.undoEngineEnabled = true
    this.enableGraphML()
    this.initializeTooltips()
    this.graphSearch = new GraphSearch(this.graphComponent)
    this.graphComponent.graph.addNodeCreatedListener(
      this.updateSearch.bind(this)
    )
    this.graphComponent.graph.addNodeRemovedListener(
      this.updateSearch.bind(this)
    )
    this.graphComponent.graph.addLabelAddedListener(
      this.updateSearch.bind(this)
    )
    this.graphComponent.graph.addLabelRemovedListener(
      this.updateSearch.bind(this)
    )
    this.graphComponent.graph.addLabelTextChangedListener(
      this.updateSearch.bind(this)
    )

    this.registerToolbarEvents()

    // center the newly created graph
    this.graphComponent.fitGraphBounds()
  }

  private registerToolbarEvents() {
    this.eventBus.on('zoom-in', () => {
      ICommand.INCREASE_ZOOM.execute(null, this.graphComponent)
    })
    this.eventBus.on('zoom-out', () => {
      ICommand.DECREASE_ZOOM.execute(null, this.graphComponent)
    })
    this.eventBus.on('zoom-fit', () => {
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)
    })
    this.eventBus.on('clear', () => {
      this.graphComponent.graph.clear()
      ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent)
    })
    this.eventBus.on('undo', () => {
      ICommand.UNDO.execute(null, this.graphComponent)
    })
    this.eventBus.on('redo', () => {
      ICommand.REDO.execute(null, this.graphComponent)
    })
    this.eventBus.on('export', (format: ExportFormat) => {
      // export the graph of the current view
      const graph = this.graphComponent.graph

      if (graph.nodes.size === 0) {
        return
      }

      this.graphComponent.updateContentRect(30)
      const exportArea = this.graphComponent.contentRect
      switch (format) {
        case ExportFormat.SVG:
          ExportSupport.saveSvg(graph, exportArea, 1)
          break
        case ExportFormat.PNG:
          ExportSupport.savePng(graph, exportArea, 1)
          break
        case ExportFormat.PDF:
          ExportSupport.savePdf(graph, exportArea, 1)
          break
      }
    })
    this.eventBus.on('open', () => {
      ICommand.OPEN.execute(null, this.graphComponent)
    })

    this.eventBus.on('save', () => {
      ICommand.SAVE.execute(null, this.graphComponent)
    })
    this.eventBus.on('print', () => {
      const printingSupport = new PrintingSupport()
      printingSupport.printGraph(this.graphComponent.graph)
    })
    this.eventBus.on('search-query-input', (query: string) => {
      this.query = query
      this.updateSearch()
    })
  }

  /**
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
  private initializeTooltips() {
    const inputMode = this.graphComponent.inputMode as GraphEditorInputMode

    // show tooltips only for nodes and edges
    inputMode.toolTipItems = GraphItemTypes.NODE | GraphItemTypes.EDGE

    // Customize the tooltip's behavior to our liking.
    const mouseHoverInputMode = inputMode.mouseHoverInputMode
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15)
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500)
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5)

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return
      }

      // Use a rich HTML element as tooltip content. Alternatively, a plain string would do as well.
      eventArgs.toolTip = this.createTooltipContent(eventArgs.item!)

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true
    })
  }

  /**
   * The tooltip may either be a plain string or it can also be a rich HTML element. In this case, we
   * return a compiled Angular component.
   */
  private createTooltipContent(item: IModelItem) {
    let itemNr = -1
    if (INode.isInstance(item)) {
      itemNr = this.graphComponent.graph.nodes.indexOf(item) + 1
    } else if (IEdge.isInstance(item)) {
      // there should be only nodes and edges due to inputMode.tooltipItems
      itemNr = this.graphComponent.graph.edges.indexOf(item) + 1
    }

    // Retrieve the factory for TooltipComponents
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      TooltipComponent
    )
    // Have the factory create a new TooltipComponent
    const container = document.createElement('div')
    const tooltipRef = componentFactory.create(
      this.injector,
      undefined,
      container
    )
    // Attach the component to the Angular component tree so that change detection will work
    this.appRef.attachView(tooltipRef.hostView)
    // Assign the NodeComponent's item input property
    tooltipRef.instance.title = INode.isInstance(item)
      ? 'Node Tooltip'
      : 'Edge Tooltip'
    tooltipRef.instance.content = INode.isInstance(item)
      ? `Node no. ${itemNr}`
      : `Edge no. ${itemNr}`

    return container
  }

  /**
   * Enables loading and saving the graph to GraphML.
   */
  private enableGraphML() {
    // Create a new GraphMLSupport instance that handles save and load operations.
    // This is a convenience layer around the core GraphMLIOHandler class
    // that does all the heavy lifting. It adds support for commands at the GraphComponent level
    // and file/loading and saving capabilities.
    const graphMLSupport = new GraphMLSupport({
      graphComponent: this.graphComponent,
      // configure to load and save to the file system
      storageLocation: StorageLocation.FILE_SYSTEM,
    })
    const graphmlHandler = graphMLSupport.graphMLIOHandler

    // needed when the VuejsNodeStyle was chosen in the NodeCreator of the GraphBuilder
    graphmlHandler.addXamlNamespaceMapping(
      'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
      'VuejsNodeStyle',
      VuejsNodeStyleMarkupExtension.$class
    )
    graphmlHandler.addNamespace(
      'http://www.yworks.com/demos/yfiles-vuejs-node-style/1.0',
      'VuejsNodeStyle'
    )

    graphmlHandler.addHandleSerializationListener((sender, args) => {
      const item = args.item
      const context = args.context
      if (item instanceof VuejsNodeStyle) {
        const vuejsNodeStyleMarkupExtension = new VuejsNodeStyleMarkupExtension()
        vuejsNodeStyleMarkupExtension.template = item.template
        context.serializeReplacement(
          VuejsNodeStyleMarkupExtension.$class,
          item,
          vuejsNodeStyleMarkupExtension
        )
        args.handled = true
      }
    })
  }

  private updateSearch() {
    this.graphSearch.updateSearch(this.query)
  }
}
