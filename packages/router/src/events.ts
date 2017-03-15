/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Route} from './config';
import {RouterStateSnapshot} from './router_state';

/**
 * @whatItDoes Represents an event triggered when a navigation starts.
 *
 * @stable
 */
export class NavigationStart {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string) {}

  /** @docsNotRequired */
  toString(): string { return `NavigationStart(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation ends successfully.
 *
 * @stable
 */
export class NavigationEnd {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string) {}

  /** @docsNotRequired */
  toString(): string {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}

/**
 * @whatItDoes Represents an event triggered when a navigation is canceled.
 *
 * @stable
 */
export class NavigationCancel {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public reason: string) {}

  /** @docsNotRequired */
  toString(): string { return `NavigationCancel(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation fails due to an unexpected error.
 *
 * @stable
 */
export class NavigationError {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public error: any) {}

  /** @docsNotRequired */
  toString(): string {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}

/**
 * @whatItDoes Represents an event triggered when routes are recognized.
 *
 * @stable
 */
export class RoutesRecognized {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {}

  /** @docsNotRequired */
  toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents an event triggered before lazy loading a route config.
 *
 * @experimental
 */
export class RouteConfigLoadStart {
  constructor(public route: Route) {}

  toString(): string { return `RouteConfigLoadStart(path: ${this.route.path})`; }
}

/**
 * @whatItDoes Represents an event triggered when a route has been lazy loaded.
 *
 * @experimental
 */
export class RouteConfigLoadEnd {
  constructor(public route: Route) {}

  toString(): string { return `RouteConfigLoadEnd(path: ${this.route.path})`; }
}

/**
 * @whatItDoes Represents a router event.
 *
 * One of:
 * - {@link NavigationStart},
 * - {@link NavigationEnd},
 * - {@link NavigationCancel},
 * - {@link NavigationError},
 * - {@link RoutesRecognized},
 * - {@link RouteConfigLoadStart},
 * - {@link RouteConfigLoadEnd}
 *
 * @stable
 */
export type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError |
    RoutesRecognized | RouteConfigLoadStart | RouteConfigLoadEnd;
