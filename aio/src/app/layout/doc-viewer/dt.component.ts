import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DocumentContents } from 'app/documents/document.service';

@Component({
  selector: 'aio-dt',
  template: `
  <div *ngIf="on">
    <hr>
    <textarea #dt [value]="text" rows="10" cols="80"></textarea>
    <br/>
    <button (click)="dtextSet()">Show change</button>
  </div>
  `
})
export class DtComponent {

  @Input() on = false;
  @Input('doc') doc: DocumentContents;
  @Output() docChange = new EventEmitter<DocumentContents>();

  @ViewChild('dt', { read: ElementRef })
  dt: ElementRef;

  get text() { return this.doc && this.doc.contents; }

  dtextSet() {
    this.doc.contents = this.dt.nativeElement.value;
    this.docChange.emit({ ...this.doc });
  }
}
