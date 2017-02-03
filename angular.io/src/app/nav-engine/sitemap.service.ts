import { Injectable } from '@angular/core';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/map';

import { DocMetadata } from '../model';

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

  getMissingMetadata(id: string) {

    const fid = id.startsWith('/') ? id.substring(1) : id; // strip leading '/'

    return {
      id,
      title: id,
      url: `assets/documents/${fid}${fid.endsWith('/') ? 'index' : ''}.html`
    } as DocMetadata;
  }
}

// Alternative way to calculate metadata
