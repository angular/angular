import { Component, OnInit, Input, ElementRef, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-doc-viewer',
  templateUrl: './doc-viewer.component.html',
  styleUrls: ['./doc-viewer.component.css'],
  //encapsulation: ViewEncapsulation.Native //todo(robwormald) - shadow DOM and emulated don't work here (?!)
})
export class DocViewerComponent implements OnInit {

  @Input() set doc(currentDoc){
    if(currentDoc){
      this.element.nativeElement.innerHTML = currentDoc.content;
    }
  }

  constructor(private element:ElementRef) { }

  ngOnInit() {
  }

}
