import { Injectable } from '@angular/core';

import { DocService } from './doc.service';

@Injectable()
export class NavEngine {
  currentDoc: any;
  constructor(private docService: DocService) {}

  navigate(documentId) {
    this.docService.getDoc(documentId).subscribe(
      doc => this.currentDoc = doc
    );
  }
}


