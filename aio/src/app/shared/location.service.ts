import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LocationService {

  private urlSubject: BehaviorSubject<string>;
  get currentUrl() { return this.urlSubject.asObservable(); }

  constructor(private location: Location) {

    const initialUrl = this.stripLeadingSlashes(location.path(true));
    this.urlSubject = new BehaviorSubject(initialUrl);

    this.location.subscribe(state => {
      const url = this.stripLeadingSlashes(state.url);
      return this.urlSubject.next(url);
    });
  }

  // TODO?: ignore if url-without-hash-or-search matches current location?
  go(url: string) {
    this.location.go(url);
    this.urlSubject.next(url);
  }

  private stripLeadingSlashes(url: string) {
    return url.replace(/^\/+/, '');
  }

  search(): { [index: string]: string; } {
    const search = {};
    const path = this.location.path();
    const q = path.indexOf('?');
    if (q > -1) {
      try {
          const params = path.substr(q + 1).split('&');
          params.forEach(p => {
            const pair = p.split('=');
            search[pair[0]] = decodeURIComponent(pair[1]);
          });
      } catch (e) { /* don't care */ }
    }
    return search;
  }

  setSearch(label: string, params: {}) {
    if (!window || !window.history) { return; }

    const search = Object.keys(params).reduce((acc, key) => {
      const value = params[key];
      // tslint:disable-next-line:triple-equals
      return value == undefined ? acc :
        acc += (acc ? '&' : '?') + `${key}=${encodeURIComponent(value)}`;
    }, '');

    // this.location.replaceState doesn't let you set the history stack label
    window.history.replaceState({}, 'API Search', window.location.pathname + search);
  }
}
