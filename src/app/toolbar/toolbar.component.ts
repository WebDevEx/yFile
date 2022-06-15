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

import { Component, Inject } from '@angular/core'
import { EventBusService } from '../services/event-bus.service'
import { ExportFormat } from '../../lib/ExportSupport'

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
})
export class ToolbarComponent {

  email: string;
  password: string;


  constructor(private eventBus: EventBusService, public dialog: MatDialog) {}

  searchString = ''

  onSearchInput(data) {
    this.eventBus.emit('search-query-input', data)
  }

  public zoomIn() {
    this.eventBus.emit('zoom-in')
  }

  public zoomOut() {
    this.eventBus.emit('zoom-out')
  }

  public zoomFit() {
    this.eventBus.emit('zoom-fit')
  }

  public clear() {
    this.eventBus.emit('clear')
  }

  public undo() {
    this.eventBus.emit('undo')
  }

  public redo() {
    this.eventBus.emit('redo')
  }

  public open() {
    this.eventBus.emit('open')
  }

  public save() {
    this.eventBus.emit('save')
  }

  openDialog(): void{
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '400px',
      data: {}
    });
    dialogRef.afterClosed().subscribe(result => {
      this.email = result;
    })
  }

  public exportDiagram(format: 'svg' | 'png' | 'pdf') {
    let exportFormat = ExportFormat.SVG
    if (format === 'png') {
      exportFormat = ExportFormat.PNG
    } else if (format === 'pdf') {
      exportFormat = ExportFormat.PDF
    }
    this.eventBus.emit('export', exportFormat)
  }

  public print() {
    this.eventBus.emit('print')
  }
}
