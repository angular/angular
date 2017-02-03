declare var fetch;

import { Injectable } from '@angular/core';

// TODO(robwormald): figure out how to handle this properly...
const siteMap = [
  { 'title': 'Home', 'url': 'assets/documents/home.html', id: 'home'},
  { 'title': 'Features', 'url': 'assets/documents/features.html', id: 'features'},
  { 'title': 'News', 'url': 'assets/documents/news.html', id: 'news'}
];

@Injectable()
export class NavEngine {
  currentDoc: any;
  constructor() {}
  navigate(documentId) {
    console.log('navigating to', documentId);
    const doc = siteMap.find(d => d.id === documentId);
    if (doc) {
      this.fetchDoc(doc.url)
        .then(content => {
          console.log('fetched content', content);
          this.currentDoc = Object.assign({}, doc, {content});
        });
    }
  }

  private fetchDoc(url) {
    // TODO(robwormald): use Http proper once new API is done.
    return fetch(url).then(res => res.text());
  }
}


