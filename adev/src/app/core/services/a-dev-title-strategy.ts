/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable} from '@angular/core';
import {NavigationItem} from '@angular/docs';
import {Title} from '@angular/platform-browser';
import {ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy} from '@angular/router';

export const ROUTE_TITLE_PROPERTY = 'label';
export const ROUTE_PARENT_PROPERTY = 'parent';
export const TITLE_SUFFIX = 'Angular';
export const TITLE_SEPARATOR = ' • ';
export const DEFAULT_PAGE_TITLE = 'Overview';

@Injectable({providedIn: 'root'})
export class ADevTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);

    if (title !== undefined) {
      this.title.setTitle(title);
    }
  }

  override buildTitle(snapshot: RouterStateSnapshot): string {
    let route: ActivatedRouteSnapshot = snapshot.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const data = route.data as NavigationItem;
    const routeTitle = data.label ?? '';

    const prefix =
      routeTitle.startsWith(DEFAULT_PAGE_TITLE) && data.parent
        ? `${data.parent.label}${TITLE_SEPARATOR}`
        : '';

    return !!routeTitle ? `${prefix}${routeTitle}${TITLE_SEPARATOR}${TITLE_SUFFIX}` : TITLE_SUFFIX;
  }
}
