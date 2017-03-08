import { Injectable } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class LocationService {

  private urlSubject: BehaviorSubject<string>;
  get currentUrl() { return this.urlSubject.asObservable(); }

  constructor(private location: Location, private platformLocation: PlatformLocation) {

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
            if (pair[0]) {
              search[decodeURIComponent(pair[0])] = pair[1] && decodeURIComponent(pair[1]);
            }
          });
      } catch (e) { /* don't care */ }
    }
    return search;
  }

  setSearch(label: string, params: {}) {
    const search = Object.keys(params).reduce((acc, key) => {
      const value = params[key];
      // tslint:disable-next-line:triple-equals
      return value == undefined ? acc :
        acc += (acc ? '&' : '?') + `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }, '');

    this.platformLocation.replaceState({}, label, this.platformLocation.pathname + search);
  }
}
