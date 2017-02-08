import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, NavigationNode } from './doc.model';
import { DocFetchingService } from './doc-fetching.service';
import { Logger } from '../logger.service';

import { SiteMapService } from './sitemap.service';

@Injectable()
export class DocService {
  private cache = new Map<string, Doc>();

  constructor(
    private fileService: DocFetchingService,
    private logger: Logger,
    private siteMapService: SiteMapService
    ) { }

  /**
   * Get document for id, from cache if found else server.
   * Pass server errors along to caller
   * Caller should interpret empty string content as "404 - file not found"
   */
  getDoc(id: string): Observable<Doc> {
    let doc = this.cache.get(id);
    if (doc) {
      this.logger.log('returned cached content for ', doc.node);
      return of(doc);
    }

    return this.siteMapService
      .getDocMetadata(id)
      .switchMap(node => {

        // document id not found
        if (!node) {
          this.logger.error('No metadata for id: ' + id);
          return of({
            node: {id, title: '', path: ''},
            content: ''
          } as Doc);
        };

        return this.fileService.getFile(node.path)
          .map(content => {
            this.logger.log('fetched content for', node);
            doc = { node, content };
            this.cache.set(node.id, doc);
            return doc;
          });
      });
  }
}
