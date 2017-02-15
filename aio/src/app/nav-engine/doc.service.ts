import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, NavNode } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { Logger } from '../logger.service';

import { NavMapService } from './nav-map.service';

@Injectable()
export class DocService {
  private cache = new Map<string, Doc>();
  private notFoundContent: string;

  constructor(
    private fileService: DocFetchingService,
    private logger: Logger
    ) { }

  /**
   * Get document for id, from cache if found else server.
   * Pass server errors along to caller
   * Constructs and caches a "Not Found" doc when fileservice returns a doc with no content.
   */
  getDoc(docId: string): Observable<Doc> {
    const cached = this.cache.get(docId);
    if (cached) {
      this.logger.log(`Returned cached document for '${docId}'`);
      return of(cached);
    }

    return this.fileService.getDocFile(docId)
      .switchMap(doc => {
        this.logger.log(`Fetched document for '${docId}'`);
        return doc.content ? of(doc) :
          this.getNotFound()
              .map(nfContent => <Doc> {metadata: {docId, title: docId}, content: nfContent});
      })
      .do(doc => this.cache.set(docId, doc));
  }

  getNotFound(): Observable<string> {
    if (this.notFoundContent) { return of(this.notFoundContent); }
    const nfDocId = 'not-found';
    return this.fileService.getDocFile(nfDocId)
      .map(doc => {
        this.logger.log(`Fetched "not found" document for '${nfDocId}'`);
        this.notFoundContent = doc.content;
        return doc.content;
      });
  }
}
