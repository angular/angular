/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Injectable} from '@angular/core';
import {Platform} from '@angular/cdk/platform';

/** Global registry for all dynamically-created, injected media queries. */
const mediaQueriesForWebkitCompatibility: Set<string> = new Set<string>();

/** Style tag that holds all of the dynamically-created media queries. */
let mediaQueryStyleNode: HTMLStyleElement | undefined;

/** A utility for calling matchMedia queries. */
@Injectable({providedIn: 'root'})
export class MediaMatcher {
  /** The internal matchMedia method to return back a MediaQueryList like object. */
  private _matchMedia: (query: string) => MediaQueryList;

  constructor(private platform: Platform) {
    this._matchMedia = this.platform.isBrowser && window.matchMedia ?
      // matchMedia is bound to the window scope intentionally as it is an illegal invocation to
      // call it from a different scope.
      window.matchMedia.bind(window) :
      noopMatchMedia;
  }

  /**
   * Evaluates the given media query and returns the native MediaQueryList from which results
   * can be retrieved.
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
 * For Webkit engines that only trigger the MediaQueryListListener when
 * there is at least one CSS selector for the respective media query.
 */
function createEmptyStyleRule(query: string) {
  if (mediaQueriesForWebkitCompatibility.has(query)) {
    return;
  }

  try {
    if (!mediaQueryStyleNode) {
      mediaQueryStyleNode = document.createElement('style');
      mediaQueryStyleNode.setAttribute('type', 'text/css');
      document.head!.appendChild(mediaQueryStyleNode);
    }

    if (mediaQueryStyleNode.sheet) {
      (mediaQueryStyleNode.sheet as CSSStyleSheet)
          .insertRule(`@media ${query} {.fx-query-test{ }}`, 0);
      mediaQueriesForWebkitCompatibility.add(query);
    }
  } catch (e) {
    console.error(e);
  }
}

/** No-op matchMedia replacement for non-browser platforms. */
function noopMatchMedia(query: string): MediaQueryList {
  // Use `as any` here to avoid adding additional necessary properties for
  // the noop matcher.
  return {
    matches: query === 'all' || query === '',
    media: query,
    addListener: () => {},
    removeListener: () => {}
  } as any;
}
