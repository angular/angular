import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import { DocMetadata } from './doc.model';

const siteMap: DocMetadata[] = [
  { 'title': 'Home', 'url': 'assets/documents/home.html', id: 'home'},
  { 'title': 'Features', 'url': 'assets/documents/features.html', id: 'features'},
  { 'title': 'News', 'url': 'assets/documents/news.html', id: 'news'}
];

@Injectable()
export class SiteMapService {
  private siteMap = new BehaviorSubject(siteMap);

  getDocMetadata(id: string) {
    const missing = () => this.getMissingMetadata(id);
    return this.siteMap
      .map(map =>
        map.find(d => d.id === id) || missing());
  }

  // Alternative way to calculate metadata. Will it be used?
  private getMissingMetadata(id: string) {

    const filename = id.startsWith('/') ? id.substring(1) : id; // strip leading '/'

    return {
      id,
      title: id,
      url: `assets/documents/${filename}${filename.endsWith('/') ? 'index' : ''}.html`
    } as DocMetadata;
  }
}
