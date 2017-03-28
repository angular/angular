import { Injectable } from '@angular/core';
import { Location, PlatformLocation } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class LocationService {

  private readonly urlParser = document.createElement('a');
  private urlSubject = new ReplaySubject<string>(1);
  currentUrl = this.urlSubject.asObservable();

  constructor(
    private location: Location,
    private platformLocation: PlatformLocation) {

    const initialUrl = this.stripLeadingSlashes(location.path(true));
    this.urlSubject.next(initialUrl);

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

  /**
   * Since we are using `LocationService` to navigate between docs, without the browser
   * reloading the page, we must intercept clicks on links.
   * If the link is to a document that we will render, then we navigate using `Location.go()`
   * and tell the browser not to handle the event.
   *
   * In most apps you might do this in a `LinkDirective` attached to anchors but in this app
   * we have a special situation where the `DocViewerComponent` is displaying semi-static
   * content that cannot contain directives. So all the links in that content would not be
   * able to use such a `LinkDirective`. Instead we are adding a click handler to the
   * `AppComponent`, whose element contains all the of the application and so captures all
   * link clicks both inside and outside the `DocViewerComponent`.
   */
  handleAnchorClick(anchor: HTMLAnchorElement, button: number, ctrlKey: boolean, metaKey: boolean) {

    // Check for modifier keys, which indicate the user wants to control navigation
    if (button !== 0 || ctrlKey || metaKey) {
      return true;
    }

    // If there is a target and it is not `_self` then we take this
    // as a signal that it doesn't want to be intercepted.
    // TODO: should we also allow an explicit `_self` target to opt-out?
    const anchorTarget = anchor.target;
    if (anchorTarget && anchorTarget !== '_self') {
      return true;
    }

    // don't navigate if external link or zip
    const { pathname, search, hash } = anchor;

    if (anchor.getAttribute('download') != null) {
      return true; // let the download happen
    }

    const relativeUrl = pathname + search + hash;
    this.urlParser.href = relativeUrl;
    if (anchor.href !== this.urlParser.href) {
      return true;
    }

    this.go(this.stripLeadingSlashes(relativeUrl));
    return false;
  }
}
