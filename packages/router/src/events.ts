/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Route} from './config';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';


/**
 * @whatItDoes Base for events the Router goes through, as opposed to events tied to a specific
 * Route. `RouterEvent`s will only be fired one time for any given navigation.
 *
 * Example:
 *
 * ```
 * class MyService {
 *   constructor(public router: Router, logger: Logger) {
 *     router.events.filter(e => e instanceof RouterEvent).subscribe(e => {
 *       logger.log(e.id, e.url);
 *     });
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class RouterEvent {
  constructor(
      /** @docsNotRequired */
      public id: number,
      /** @docsNotRequired */
      public url: string) {}
}

/**
 * @whatItDoes Represents an event triggered when a navigation starts.
 *
 * @stable
 */
export class NavigationStart extends RouterEvent {
  /** @docsNotRequired */
  toString(): string { return `NavigationStart(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation ends successfully.
 *
 * @stable
 */
export class NavigationEnd extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string) {
    super(id, url);
  }

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
export class NavigationCancel extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public reason: string) {
    super(id, url);
  }

  /** @docsNotRequired */
  toString(): string { return `NavigationCancel(id: ${this.id}, url: '${this.url}')`; }
}

/**
 * @whatItDoes Represents an event triggered when a navigation fails due to an unexpected error.
 *
 * @stable
 */
export class NavigationError extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public error: any) {
    super(id, url);
  }

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
export class RoutesRecognized extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {
    super(id, url);
  }

  /** @docsNotRequired */
  toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents the start of the Guard phase of routing.
 *
 * @experimental
 */
export class GuardsCheckStart extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {
    super(id, url);
  }

  toString(): string {
    return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents the end of the Guard phase of routing.
 *
 * @experimental
 */
export class GuardsCheckEnd extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot,
      /** @docsNotRequired */
      public shouldActivate: boolean) {
    super(id, url);
  }

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
export class ResolveStart extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {
    super(id, url);
  }

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
export class ResolveEnd extends RouterEvent {
  constructor(
      /** @docsNotRequired */
      id: number,
      /** @docsNotRequired */
      url: string,
      /** @docsNotRequired */
      public urlAfterRedirects: string,
      /** @docsNotRequired */
      public state: RouterStateSnapshot) {
    super(id, url);
  }

  toString(): string {
    return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * @whatItDoes Represents an event triggered before lazy loading a route config.
 *
 * @experimental
 */
export class RouteConfigLoadStart {
  constructor(
      /** @docsNotRequired */
      public route: Route) {}
  toString(): string { return `RouteConfigLoadStart(path: ${this.route.path})`; }
}

/**
 * @whatItDoes Represents an event triggered when a route has been lazy loaded.
 *
 * @experimental
 */
export class RouteConfigLoadEnd {
  constructor(
      /** @docsNotRequired */
      public route: Route) {}
  toString(): string { return `RouteConfigLoadEnd(path: ${this.route.path})`; }
}

/**
 * @whatItDoes Represents the start of end of the Resolve phase of routing. See note on
 * {@link ChildActivationEnd} for use of this experimental API.
 *
 * @experimental
 */
export class ChildActivationStart {
  constructor(
      /** @docsNotRequired */
      public snapshot: ActivatedRouteSnapshot) {}
  toString(): string {
    const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
    return `ChildActivationStart(path: '${path}')`;
  }
}

/**
 * @whatItDoes Represents the start of end of the Resolve phase of routing. See note on
 * {@link ChildActivationStart} for use of this experimental API.
 *
 * @experimental
 */
export class ChildActivationEnd {
  constructor(
      /** @docsNotRequired */
      public snapshot: ActivatedRouteSnapshot) {}
  toString(): string {
    const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
    return `ChildActivationEnd(path: '${path}')`;
  }
}

/**
 * @whatItDoes Represents the start of end of the Resolve phase of routing. See note on
 * {@link ActivationEnd} for use of this experimental API.
 *
 * @experimental
 */
export class ActivationStart {
  constructor(
      /** @docsNotRequired */
      public snapshot: ActivatedRouteSnapshot) {}
  toString(): string {
    const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
    return `ActivationStart(path: '${path}')`;
  }
}

/**
 * @whatItDoes Represents the start of end of the Resolve phase of routing. See note on
 * {@link ActivationStart} for use of this experimental API.
 *
 * @experimental
 */
export class ActivationEnd {
  constructor(
      /** @docsNotRequired */
      public snapshot: ActivatedRouteSnapshot) {}
  toString(): string {
    const path = this.snapshot.routeConfig && this.snapshot.routeConfig.path || '';
    return `ActivationEnd(path: '${path}')`;
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
 * - {@link ChildActivationStart},
 * - {@link ActivationStart},
 * - {@link GuardsCheckEnd},
 * - {@link ResolveStart},
 * - {@link ResolveEnd},
 * - {@link ActivationEnd}
 * - {@link ChildActivationEnd}
 * - {@link NavigationEnd},
 * - {@link NavigationCancel},
 * - {@link NavigationError}
 *
 * @stable
 */
export type Event = RouterEvent | RouteConfigLoadStart | RouteConfigLoadEnd | ChildActivationStart |
    ChildActivationEnd | ActivationStart | ActivationEnd;
