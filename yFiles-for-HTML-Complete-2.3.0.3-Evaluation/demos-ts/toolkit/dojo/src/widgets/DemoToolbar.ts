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
import WidgetBase from '@dojo/framework/core/WidgetBase'
import { DNode } from '@dojo/framework/core/interfaces'
import { v } from '@dojo/framework/core/vdom'
import './styles/DemoToolbar.css'

export interface DemoToolbarProperties {
  onToggleEditClick: (isEditable: boolean) => void
  onGraphRefreshClick: () => void
}

export default class DemoToolbar extends WidgetBase<DemoToolbarProperties> {
  protected render(): DNode {
    const { onGraphRefreshClick } = this.properties

    return v('div', { classes: 'demo-toolbar' }, [
      v('button', { classes: 'demo-icon-yIconReload', onclick: onGraphRefreshClick }),
      v('span', { classes: 'demo-separator' }),
      v('input', {
        classes: 'demo-toggle-button labeled',
        id: 'toggleEditable',
        type: 'checkbox',
        onclick: this.toggleEditable
      }),
      v('label', { for: 'toggleEditable' }, ['Toggle Editing'])
    ])
  }

  private toggleEditable(evt: MouseEvent) {
    const isEditable = (evt.target as HTMLInputElement).checked
    const { onToggleEditClick } = this.properties
    onToggleEditClick(isEditable)
  }
}
