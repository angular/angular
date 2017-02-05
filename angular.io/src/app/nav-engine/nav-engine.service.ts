import { Injectable } from '@angular/core';

import { Doc } from './doc.model';
import { DocService } from './doc.service';

@Injectable()
export class NavEngine {
  currentDoc: Doc;
  constructor(private docService: DocService) {}

  navigate(documentId: string) {
    this.docService.getDoc(documentId).subscribe(
      doc => this.currentDoc = doc
    );
  }
}


