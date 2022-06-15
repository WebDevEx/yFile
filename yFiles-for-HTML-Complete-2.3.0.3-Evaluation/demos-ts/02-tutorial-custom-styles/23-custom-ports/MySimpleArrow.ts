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
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BaseClass,
  CanvasComponent,
  GeneralPath,
  IArrow,
  IBoundsProvider,
  ICanvasContext,
  IEdge,
  IEdgeStyle,
  IRenderContext,
  ISvgDefsCreator,
  IVisualCreator,
  Point,
  Rect,
  SvgDefsManager,
  SvgVisual,
  Visual
} from 'yfiles'
import MySimpleEdgeStyle from './MySimpleEdgeStyle'

/**
 * A simple IArrow implementation that renders the arrow as a custom filled shape.
 */
export default class MySimpleArrow extends BaseClass<IArrow, IVisualCreator, IBoundsProvider>(
  IArrow,
  IVisualCreator,
  IBoundsProvider
) {
  anchor: Point
  direction: Point
  private $thickness: number
  arrowThickness: number
  private $arrowFigure: GeneralPath | null

  /**
   * Initializes a new instance of the {@link MySimpleArrow} class.
   */
  constructor() {
    super()
    this.anchor = Point.ORIGIN
    this.direction = Point.ORIGIN
    this.$thickness = 2.0
    this.arrowThickness = 0
    this.$arrowFigure = null
  }

  get arrowFigure(): GeneralPath | null {
    return this.$arrowFigure
  }

  set arrowFigure(value: GeneralPath | null) {
    this.$arrowFigure = value
  }

  /**
   * Returns the length of the arrow, i.e. the distance from the arrow's tip to
   * the position where the visual representation of the edge's path should begin.
   * Value: Always returns 7
   * @see Specified by {@link IArrow#length}.
   */
  get length(): number {
    return 7
  }

  /**
   * Gets the cropping length associated with this instance.
   * Value: Always returns 1
   * This value is used by {@link IEdgeStyle}s to let the
   * edge appear to end shortly before its actual target.
   * @see Specified by {@link IArrow#cropLength}.
   */
  get cropLength(): number {
    return 1
  }

  /**
   * Gets or sets the thickness of the arrow.
   */
  get thickness(): number {
    return this.$thickness
  }

  /**
   * Gets or sets the thickness of the arrow.
   */
  set thickness(value: number) {
    this.$thickness = value
  }

  /**
   * Gets an {@link IVisualCreator} implementation that will create
   * the {@link IVisualCreator} for this arrow
   * at the given location using the given direction for the given edge.
   * @param edge the edge this arrow belongs to
   * @param atSource whether this will be the source arrow
   * @param anchor the anchor point for the tip of the arrow
   * @param direction the direction the arrow is pointing in
   * Itself as a flyweight.
   * @see Specified by {@link IArrow#getVisualCreator}.
   */
  getVisualCreator(
    edge: IEdge,
    atSource: boolean,
    anchor: Point,
    direction: Point
  ): IVisualCreator {
    this.configureThickness(edge)
    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * Gets an {@link IBoundsProvider} implementation that can yield
   * this arrow's bounds if painted at the given location using the
   * given direction for the given edge.
   * @param edge the edge this arrow belongs to
   * @param atSource whether this will be the source arrow
   * @param anchor the anchor point for the tip of the arrow
   * @param direction the direction the arrow is pointing in
   * an implementation of the {@link IBoundsProvider} interface that can
   * subsequently be used to query the bounds. Clients will always call
   * this method before using the implementation and may not cache the instance returned.
   * This allows for applying the flyweight design pattern to implementations.
   * @see Specified by {@link IArrow#getBoundsProvider}.
   */
  getBoundsProvider(
    edge: IEdge,
    atSource: boolean,
    anchor: Point,
    direction: Point
  ): IBoundsProvider {
    // Get the edge's thickness
    const style = edge.style as MySimpleEdgeStyle
    if (typeof style.pathThickness !== 'undefined') {
      this.arrowThickness = style.pathThickness
    } else {
      this.arrowThickness = this.thickness
    }

    this.anchor = anchor
    this.direction = direction
    return this
  }

  /**
   * Creates the visual for the arrow.
   * @param context The context that contains the information needed to create the
   *   visual.
   * The arrow visual.
   * @see Specified by {@link IVisualCreator#createVisual}.
   */
  createVisual(context: IRenderContext): SvgVisual {
    // create a new path to draw the arrow
    if (this.arrowFigure === null) {
      this.arrowFigure = new GeneralPath()
      this.arrowFigure.moveTo(new Point(7, -this.arrowThickness / 2))
      this.arrowFigure.lineTo(new Point(7, this.arrowThickness / 2))
      this.arrowFigure.cubicTo(
        new Point(5, this.arrowThickness / 2),
        new Point(1.5, this.arrowThickness / 2),
        new Point(-1, this.arrowThickness * 1.666)
      )
      this.arrowFigure.cubicTo(
        new Point(0, this.arrowThickness * 0.833),
        new Point(0, -this.arrowThickness * 0.833),
        new Point(-1, -this.arrowThickness * 1.666)
      )
      this.arrowFigure.cubicTo(
        new Point(1.5, -this.arrowThickness / 2),
        new Point(5, -this.arrowThickness / 2),
        new Point(7, -this.arrowThickness / 2)
      )
      this.arrowFigure.close()
    }

    const path = this.arrowFigure.createSvgPath()

    // add the gradient to the global defs section if necessary and returns the id
    const gradientId = context.getDefsId(GRADIENT)
    path.setAttribute('fill', `url(#${gradientId})`)

    // Remember thickness for update
    ;(path as any)['data-renderDataCache'] = this.arrowThickness

    // rotate the arrow and move it to correct position
    path.setAttribute(
      'transform',
      `matrix(${-this.direction.x} ${-this.direction.y} ${this.direction.y} ${-this.direction.x} ${
        this.anchor.x
      } ${this.anchor.y})`
    )

    return new SvgVisual(path)
  }

  /**
   * This method updates or replaces a previously created {@link Visual}.
   * The {@link CanvasComponent} uses this method to give implementations a chance to
   * update an existing Visual that has previously been created by the same instance during a call
   * to {@link MySimpleArrow#createVisual}. Implementations may update the <code>oldVisual</code>
   * and return that same reference, or create a new visual and return the new instance or <code>null</code>.
   * @param context The context that contains the information needed to create the
   *   visual.
   * @param oldVisual The visual instance that had been returned the last time the
   *   {@link MySimpleArrow#createVisual} method was called.
   * The updated visual.
   * @see {@link MySimpleArrow#createVisual}
   * @see {@link ICanvasObjectDescriptor}
   * @see {@link CanvasComponent}
   * @see Specified by {@link IVisualCreator#updateVisual}.
   */
  updateVisual(context: IRenderContext, oldVisual: SvgVisual): SvgVisual {
    const path = oldVisual.svgElement
    // get thickness of old arrow
    const oldThickness = (path as any)['data-renderDataCache']
    // if thickness has changed
    if (oldThickness !== this.arrowThickness) {
      // re-render arrow
      return this.createVisual(context)
    }

    path.setAttribute(
      'transform',
      `matrix(${-this.direction.x} ${-this.direction.y} ${this.direction.y} ${-this.direction.x} ${
        this.anchor.x
      } ${this.anchor.y})`
    )
    return oldVisual
  }

  /**
   * Returns the bounds of the arrow for the current flyweight configuration.
   * @see Specified by {@link IBoundsProvider#getBounds}.
   */
  getBounds(context: ICanvasContext): Rect {
    return new Rect(
      this.anchor.x - 8 - this.arrowThickness,
      this.anchor.y - 8 - this.arrowThickness,
      16 + this.arrowThickness * 2,
      16 + this.arrowThickness * 2
    )
  }

  /**
   * Configures the thickness to use for the next visual creation.
   * @param edge The edge to read the thickness from.
   */
  configureThickness(edge: IEdge): void {
    // Get the edge's thickness
    const oldThickness = this.arrowThickness
    const style = edge.style as MySimpleEdgeStyle
    if (typeof style.pathThickness !== 'undefined') {
      this.arrowThickness = style.pathThickness
    } else {
      this.arrowThickness = this.thickness
    }
    // see if the old arrow figure needs to be invalidated...
    if (this.arrowThickness !== oldThickness) {
      this.arrowFigure = null
    }
  }
}

/**
 * This class is needed in order to support automatic cleanup of the global defs section.
 * The SVG specification requires gradient elements to be put into a defs section. The
 * element using the gradient merely references it in it's fill or stroke attribute.
 * Class {@link SvgDefsManager} has the task of managing the entities stored in the
 * SVG's global defs section. This includes putting entities into and cleaning the defs
 * section every once in a while. In order for {@link SvgDefsManager} to interact with
 * the defs elements, those have to implement {@link ISvgDefsCreator} that offers a
 * defined interface to deal with.
 */
class MyGradientSupport extends BaseClass<ISvgDefsCreator>(ISvgDefsCreator) {
  gradient: SVGElement

  constructor(gradient: SVGElement) {
    super()
    this.gradient = gradient
  }

  createDefsElement(context: ICanvasContext): SVGElement {
    return this.gradient
  }

  accept(context: ICanvasContext, node: Node, id: string): boolean {
    const element = node instanceof Element ? node : null
    if (element !== null) {
      const attributeValue = element.getAttribute('fill')
      return attributeValue !== null && attributeValue === `url(#${id})`
    }
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateDefsElement(context: ICanvasContext, oldElement: SVGElement): void {}
}

const GRADIENT = createGradient()

function createGradient(): MyGradientSupport {
  // initialize gradient
  const linearGradient = window.document.createElementNS(
    'http://www.w3.org/2000/svg',
    'linearGradient'
  )
  linearGradient.setAttribute('x1', '0')
  linearGradient.setAttribute('y1', '0')
  linearGradient.setAttribute('x2', '0')
  linearGradient.setAttribute('y2', '1')
  linearGradient.setAttribute('spreadMethod', 'repeat')
  const stop1 = window.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
  stop1.setAttribute('stop-color', 'rgb(180,180,180)')
  stop1.setAttribute('stop-opacity', '1')
  stop1.setAttribute('offset', '0')
  linearGradient.appendChild(stop1)
  const stop2 = window.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
  stop2.setAttribute('stop-color', 'rgb(50,50,50)')
  stop2.setAttribute('stop-opacity', '1')
  stop2.setAttribute('offset', '0.5')
  linearGradient.appendChild(stop2)
  const stop3 = window.document.createElementNS('http://www.w3.org/2000/svg', 'stop')
  stop3.setAttribute('stop-color', 'rgb(150,150,150)')
  stop3.setAttribute('stop-opacity', '1')
  stop3.setAttribute('offset', '1')
  linearGradient.appendChild(stop3)

  // initialize gradient support
  // This mechanism is needed to allow sharing of gradient instances between
  // multiple svg elements, as well as automatic cleanup of the global defs section.
  return new MyGradientSupport(linearGradient)
}
