/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';


/**
 *
 * @publicApi
 */
export abstract class PageTitleStrategy {
  abstract setTitle(route: RouterStateSnapshot): void;
}

/**
 * An implementation of `PageTitleStrategy` which does nothing.
 *
 * This strategy is used by default by the `Router` meaning that the `Router` does not set the
 * document page title as part of navigations.
 */
export class NoopPageTitleStrategy implements PageTitleStrategy {
  setTitle() {}
}

/**
 * Provides a strategy for collecting page titles from a `RouterStateSnapshot`.
 *
 * The built-in implementation concatenates all page titles with whitespace. Given the `Routes`
 * below, navigation to `/base/child(popup:aux)` would result in the document title being set to
 * "base child popupTitle".
 * ```
 * [
 *   {path: 'base', data: {pageTitle: 'base'}, children: [
 *     {path: 'child', data: {pageTitle: 'child'}},
 *   ],
 *   {path: 'aux', outlet: 'popup', data: {pageTitle: 'popupTitle'}}
 * ]
 * ```
 *
 * This class be used as a base class for custom title strategies. That is, you can create your own
 * class that extends the `BasePageTitleStrategy`.
 *
 * @publicApi
 */
@Injectable()
export abstract class BasePageTitleStrategy implements PageTitleStrategy {
  /** The string used to join titles from various each `Route`. */
  static joinString = ' ';

  constructor(@Inject(DOCUMENT) protected readonly document: Document) {}

  /**
   * Collects and joins `pageTitle` data and assigns to the `document.title`.
   */
  setTitle(route: RouterStateSnapshot) {
    const pageTitles = this.collectPageTitles(route);
    if (pageTitles.length > 0) {
      const title = pageTitles.join(BasePageTitleStrategy.joinString);
      this.document.title = title;
    }
  }

  /**
   * Collects occurrences `pageTitle` in `data` of the `RouterStateSnapshot` tree.
   *
   * This implementation starts from the `root` of the `RouterStateSnapshot` and traverses the whole
   * tree with a depth-first approach, gathering the `pageTitle` properties from the route `data`.
   *
   * @returns The list `pageTitle`s.
   */
  protected collectPageTitles(route: RouterStateSnapshot): string[] {
    let pageTitles: string[] = [];
    let stack: ActivatedRouteSnapshot[] = [route.root];
    while (stack.length > 0) {
      const route = stack.pop()!;
      if (route.data.pageTitle) {
        pageTitles.push(route.data.pageTitle);
      }
      // The `'primary'` outlet is always placed first in the `children` list. Because this
      // algorithm uses `stack.pop`, we put the primary outlet on top, followed by named outlet
      // titles.
      stack.push(...route.children.reverse());
    }
    return pageTitles;
  }
}

@Injectable()
export class DocumentPageTitleStrategy extends BasePageTitleStrategy {
}