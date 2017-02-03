declare var fetch;

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

import { Doc, DocMetadata } from '../model';
import { FileService } from './file.service';
import { SiteMapService } from './sitemap.service';

interface DocCache {
  [index: string]: Doc;
}

@Injectable()
export class DocService {
  private cache: DocCache = {};

  constructor(
    private siteMapService: SiteMapService,
    private fileService: FileService) {}

  getDoc(documentId): Observable<Doc> {
    let doc = this.cache[documentId];
    if (doc) {
      console.log('returned cached content for ', doc.metadata);
      return of(doc.clone());
    }

    return this.siteMapService
      .getDocMetadata(documentId)
      .switchMap(metadata => {

        return this.fileService.getFile(metadata.url)
          .map(content => {
            console.log('fetched content for', metadata);
            doc = new Doc(metadata, content);
            this.cache[metadata.id] = doc;
            return doc.clone();
          });
      });
  }
}
