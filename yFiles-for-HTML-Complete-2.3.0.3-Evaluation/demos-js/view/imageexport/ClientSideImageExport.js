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
import { GraphComponent, IGraph, Insets, Rect, Size, SvgExport } from 'yfiles'
import { detectFirefoxVersion, detectInternetExplorerVersion } from '../../resources/demo-app.js'

/**
 * A class that provides png-image export. The image is exported to svg and converted to png.
 */
export default class ClientSideImageExport {
  /**
   * Creates a new instance.
   */
  constructor() {
    this.$scale = 1
    this.$margins = new Insets(5)
  }

  /**
   * Returns the scaling of the exported image.
   * @return {number}
   */
  get scale() {
    return this.$scale
  }

  /**
   * Specifies the scaling of the exported image.
   * @param {number} value
   */
  set scale(value) {
    this.$scale = value
  }

  /**
   * Returns the margins for the exported image.
   * @return {Insets}
   */
  get margins() {
    return this.$margins
  }

  /**
   * Specifies the margins for the exported image.
   * @param {Insets} value
   */
  set margins(value) {
    this.$margins = value
  }

  /**
   * Exports the graph to a PNG image.
   * @param {IGraph} graph
   * @param {Rect} exportRect
   * @return {Promise.<HTMLImageElement>}
   */
  async exportImage(graph, exportRect) {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent()
    // ... and assign it the same graph.
    exportComponent.graph = graph
    exportComponent.updateContentRect()

    // Determine the bounds of the exported area
    const targetRect = exportRect || exportComponent.contentRect

    // Create the exporter class
    const exporter = new SvgExport(targetRect, this.scale)
    exporter.margins = this.margins

    if (window.btoa != null) {
      // Don't use base 64 encoding if btoa is not available and don't inline images as-well.
      // Otherwise canvg will throw an exception.
      exporter.encodeImagesBase64 = true
      exporter.inlineSvgImages = true
    }

    // export the component to svg
    const svgElement = await exporter.exportSvgAsync(exportComponent)

    return renderSvgToPng(
      svgElement,
      new Size(exporter.viewWidth, exporter.viewHeight),
      this.margins
    )
  }
}

const ieVersion = detectInternetExplorerVersion()
const ffVersion = detectFirefoxVersion()

/**
 * Renders the given SVG element to a PNG image.
 * @param {SVGElement} svgElement
 * @param {Size} size
 * @param {Insets} margins
 * @return {Promise.<HTMLImageElement>}
 */
function renderSvgToPng(svgElement, size, margins) {
  const targetCanvas = document.createElement('canvas')
  const targetContext = targetCanvas.getContext('2d')

  const svgString = SvgExport.exportSvgString(svgElement)
  const svgUrl = SvgExport.encodeSvgDataUrl(svgString)

  if (window.btoa === undefined) {
    targetContext.fillText('This browser does not support SVG previews', 10, 50)
    // Use the canvg fall-back if the function btoa is not available, e.g. in IE9
    return exportImageWithCanvg(svgElement, targetCanvas, null)
  }

  if (detectInternetExplorerVersion() > 11) {
    // A bug in Microsoft Edge results in black gradients when drawn into a Canvas if the call to drawImage happens
    // in a timeout, e.g. a button click.
    return exportImageWithCanvg(svgElement, targetCanvas, null)
  }

  return new Promise(resolve => {
    // The SVG image is now used as the source of an HTML image element,
    // which is then rendered onto a Canvas element.

    // An image that gets the export SVG in the Data URL format
    const svgImage = new Image()
    const onSvgImageLoad = () => {
      targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
      targetCanvas.width = size.width + (margins.left + margins.right)
      targetCanvas.height = size.height + (margins.top + margins.bottom)

      // IE 11 on Windows 7 needs a timeout here
      setTimeout(
        () => {
          try {
            targetContext.drawImage(svgImage, margins.left, margins.top)
            // When the svg image has been rendered to the Canvas,
            // the raster image can be exported from the Canvas.
            const pngImage = new Image()
            // The following 'toDataURL' function throws a security error in IE
            pngImage.src = targetCanvas.toDataURL('image/png')
            pngImage.onload = () => {
              resolve(pngImage)
            }
          } catch (error) {
            // Use the canvg fall-back when the above solution doesn't work
            resolve(exportImageWithCanvg(svgElement, targetCanvas, error))
          }
        },
        ieVersion > -1 ? 100 : 0
      )
    }

    // workaround for the following Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1365622
    if (ffVersion > 52 && ffVersion < 55) {
      svgImage.onload = () => {
        // draw the image to the Canvas immediately to preload it
        targetContext.drawImage(svgImage, 0, 0)
        const waitMessage = document.createElement('p')
        waitMessage.textContent = 'Please wait...'
        document.getElementById('formContainer').appendChild(waitMessage)
        // wait 2 seconds to actually render the image
        setTimeout(() => {
          document.getElementById('formContainer').removeChild(waitMessage)
          onSvgImageLoad()
        }, 2000)
      }
    } else {
      svgImage.onload = onSvgImageLoad
    }
    svgImage.src = svgUrl
  })
}

/**
 * Use canvg as fallback if the default solution is not available.
 * @param {SVGElement} svgElement
 * @param {HTMLCanvasElement} targetCanvas
 * @param {Error} error
 * @return {Promise.<{image:Image,targetCanvas:HTMLCanvasElement}>}
 */
function exportImageWithCanvg(svgElement, targetCanvas, error) {
  return new Promise((resolve, reject) => {
    if (!svgElement.toDataURL) {
      // The default approach failed, and this callback will not work either.
      reject(new Error(`This browser doesn't support exporting the raster image: ${error}`))
    }

    svgElement.toDataURL('image/png', {
      callback: dataURL => {
        const image = new Image()
        image.src = dataURL
        image.onload = () => {
          resolve(image)
        }
      }
    })
  })
}
