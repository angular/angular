import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, DocMetadata } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { Logger } from '../logger.service';

import { SiteMapService } from './sitemap.service';

interface DocCache {
  [index: string]: Doc;
}

@Injectable()
export class DocService {
  private cache: DocCache = {};

  constructor(
    private fileService: DocFetchingService,
    private logger: Logger,
    private siteMapService: SiteMapService
    ) { }

  /**
   * Get document for documentId, from cache if found else server.
   * Pass server errors along to caller
   * Caller should interpret empty string content as "404 - file not found"
   */
  getDoc(documentId: string): Observable<Doc> {
    let doc = this.cache[documentId];
    if (doc) {
      this.logger.log('returned cached content for ', doc.metadata);
      return of(cloneDoc(doc));
    }

    return this.siteMapService
      .getDocMetadata(documentId)
      .switchMap(metadata => {

        return this.fileService.getFile(metadata.url)
          .map(content => {
            this.logger.log('fetched content for', metadata);
            doc = { metadata, content };
            this.cache[metadata.id] = doc;
            return cloneDoc(doc);
          });
      });
  }
}

function cloneDoc(doc: Doc) {
  return {
    metadata: Object.assign({}, doc.metadata),
    content: doc.content
  };
}
