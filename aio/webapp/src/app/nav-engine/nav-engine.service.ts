import { Injectable } from '@angular/core';

import { Doc } from './doc.model';
import { DocService } from './doc.service';

@Injectable()
export class NavEngine {

  /** Document result of most recent `navigate` call */
  currentDoc: Doc;
  constructor(private docService: DocService) {}

  /**
   * Navigate sets `currentDoc` to the document for `documentId`.
   * TODO: handle 'Document not found', signaled by empty string content
   * TODO: handle document retrieval error
   */
  navigate(documentId: string) {
    this.docService.getDoc(documentId).subscribe(
      doc => this.currentDoc = doc
    );
  }
}


