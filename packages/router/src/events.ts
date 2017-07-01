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
 * @whatItDoes Represents the start of the Guard phase of routing.
 *
 * @experimental
 */
export class GuardsCheckStart {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {}

  toString(): string {
    return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents the end of the Guard phase of routing.
 *
 * @experimental
 */
export class GuardsCheckEnd {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot,
      /** @docsNotRequired */
      public shouldActivate: boolean) {}

  toString(): string {
    return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
  }
}

/**
 * @whatItDoes Represents the start of the Resolve phase of routing. The timing of this
 * event may change, thus it's experimental. In the current iteration it will run
 * in the "resolve" phase whether there's things to resolve or not. In the future this
 * behavior may change to only run when there are things to be resolved.
 *
 * @experimental
 */
export class ResolveStart {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {}

  toString(): string {
    return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents the end of the Resolve phase of routing. See note on
 * {@link ResolveStart} for use of this experimental API.
 *
 * @experimental
 */
export class ResolveEnd {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {}

  toString(): string {
    return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents a router event, allowing you to track the lifecycle of the router.
 *
 * The sequence of router events is:
 *
 * - {@link NavigationStart},
 * - {@link RouteConfigLoadStart},
 * - {@link RouteConfigLoadEnd},
 * - {@link RoutesRecognized},
 * - {@link GuardsCheckStart},
 * - {@link GuardsCheckEnd},
 * - {@link ResolveStart},
 * - {@link ResolveEnd},
 * - {@link NavigationEnd},
 * - {@link NavigationCancel},
 * - {@link NavigationError}
 *
 * @stable
 */
export type Event = NavigationStart | NavigationEnd | NavigationCancel | NavigationError |
    RoutesRecognized | RouteConfigLoadStart | RouteConfigLoadEnd | GuardsCheckStart |
    GuardsCheckEnd | ResolveStart | ResolveEnd;
