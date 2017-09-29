/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/**
 * Global registry for all dynamically-created, injected style tags.
 */
const styleElementForWebkitCompatibility: Map<string, HTMLStyleElement> = new Map();

/**
 * A utility for calling matchMedia queries.
 */
@Injectable()
export class MediaMatcher {
  /** The internal matchMedia method to return back a MediaQueryList like object. */
  private _matchMedia: (query: string) => MediaQueryList;

  constructor(private platform: Platform) {
    this._matchMedia = this.platform.isBrowser ?
      // matchMedia is bound to the window scope intentionally as it is an illegal invocation to
      // call it from a different scope.
      window.matchMedia.bind(window) :
      noopMatchMedia;
  }

  /**
   * Confirms the layout engine will trigger for the selector query provided and returns the
   * MediaQueryList for the query provided.
   */
  matchMedia(query: string): MediaQueryList {
    if (this.platform.WEBKIT) {
      createEmptyStyleRule(query);
    }
    return this._matchMedia(query);
  }
}

/**
 * For Webkit engines that only trigger the MediaQueryListListener when there is at least one CSS
 * selector for the respective media query.
 */
function createEmptyStyleRule(query: string) {
  if (!styleElementForWebkitCompatibility.has(query)) {
    try {
      const style = document.createElement('style');

      style.setAttribute('type', 'text/css');
      if (!style.sheet) {
        const cssText = `@media ${query} {.fx-query-test{ }}`;
        style.appendChild(document.createTextNode(cssText));
      }

      document.getElementsByTagName('head')[0].appendChild(style);

      // Store in private global registry
      styleElementForWebkitCompatibility.set(query, style);
    } catch (e) {
      console.error(e);
    }
  }
}

/** No-op matchMedia replacement for non-browser platforms.  */
function noopMatchMedia(query: string): MediaQueryList {
  return {
    matches: query === 'all' || query === '',
    media: query,
    addListener: () => {},
    removeListener: () => {}
  };
}
