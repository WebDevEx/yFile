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
import OpenViaServerOperation from './OpenViaServerOperation.js'

/**
 * Saves a file via a dedicated server. The GraphML content is submitted to the server which responds with a
 * download URL for the respective file. The handling of the download then depends on the user's browser settings.
 * @deprecated Please note that using a dedicated server is not the recommended way to save a file in modern
 *   browsers.
 * If you only want to download the file to the local filesystem, use the approach shown in 'SaveToFileOperation.js'
 *   instead.
 */
export default class SaveViaServerOperation {
  /**
   * @param {string|null} [fileServerUrl] The URL the file server runs on.
   */
  constructor(fileServerUrl) {
    this.$fileServerUrl = fileServerUrl || 'http://localhost:4242/file/'
    this.$executable = false
  }

  /**
   * Gets whether the operation can be executed.
   * @type {boolean}
   */
  get executable() {
    return this.$executable
  }

  /**
   * Sets whether the operation can be executed.
   * @type {boolean}
   */
  set executable(value) {
    if (this.$executable !== value) {
      this.$executable = value
    }
  }

  /**
   * Gets the save form id.
   * @type {string}
   */
  static get SAVE_FORM_ID() {
    return 'demo-save-form'
  }

  /**
   * Gets the form id.
   * @type {string}
   */
  static get FORM_INPUT_GRAPH_ID() {
    return 'demo-input-graph'
  }

  /**
   * Checks if the operation can be executed.
   * @return {boolean}
   */
  isAvailable() {
    return this.executable
  }

  /**
   * Saves the file content via a dedicated server.
   * @param {string} fileContent
   * @return {Promise} A Promise that resolves when the save operation is complete.
   */
  save(fileContent) {
    return new Promise((resolve, reject) => {
      const saveForm = document.getElementById(SaveViaServerOperation.SAVE_FORM_ID)
      const graphInputField = document.getElementById(SaveViaServerOperation.FORM_INPUT_GRAPH_ID)
      if (graphInputField !== null && saveForm !== null) {
        saveForm.action = `${this.$fileServerUrl}save?${OpenViaServerOperation.createRequestId()}`
        graphInputField.value = fileContent
        saveForm.submit()
        resolve()
      } else {
        reject(new Error('Save failed'))
      }
    })
  }
}
