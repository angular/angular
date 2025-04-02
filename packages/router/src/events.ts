/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NavigationBehaviorOptions, Route} from './models';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from './router_state';
import {UrlTree} from './url_tree';
import type {Navigation} from './navigation_transition';

/**
 * Identifies the call or event that triggered a navigation.
 *
 * * 'imperative': Triggered by `router.navigateByUrl()` or `router.navigate()`.
 * * 'popstate' : Triggered by a `popstate` event.
 * * 'hashchange'-: Triggered by a `hashchange` event.
 *
 * @publicApi
 */
export type NavigationTrigger = 'imperative' | 'popstate' | 'hashchange';
export const IMPERATIVE_NAVIGATION = 'imperative';

/**
 * Identifies the type of a router event.
 *
 * @publicApi
 */
export enum EventType {
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RoutesRecognized,
  ResolveStart,
  ResolveEnd,
  GuardsCheckStart,
  GuardsCheckEnd,
  RouteConfigLoadStart,
  RouteConfigLoadEnd,
  ChildActivationStart,
  ChildActivationEnd,
  ActivationStart,
  ActivationEnd,
  Scroll,
  NavigationSkipped,
}

/**
 * Base for events the router goes through, as opposed to events tied to a specific
 * route. Fired one time for any given navigation.
 *
 * The following code shows how a class subscribes to router events.
 *
 * ```ts
 * import {Event, RouterEvent, Router} from '@angular/router';
 *
 * class MyService {
 *   constructor(public router: Router) {
 *     router.events.pipe(
 *        filter((e: Event | RouterEvent): e is RouterEvent => e instanceof RouterEvent)
 *     ).subscribe((e: RouterEvent) => {
 *       // Do something
 *     });
 *   }
 * }
 * ```
 *
 * @see {@link Event}
 * @see [Router events summary](guide/routing/router-reference#router-events)
 * @publicApi
 */
export class RouterEvent {
  constructor(
    /** A unique ID that the router assigns to every router navigation. */
    public id: number,
    /** The URL that is the destination for this navigation. */
    public url: string,
  ) {}
}

/**
 * An event triggered when a navigation starts.
 *
 * @publicApi
 */
export class NavigationStart extends RouterEvent {
  readonly type = EventType.NavigationStart;

  /**
   * Identifies the call or event that triggered the navigation.
   * An `imperative` trigger is a call to `router.navigateByUrl()` or `router.navigate()`.
   *
   * @see {@link NavigationEnd}
   * @see {@link NavigationCancel}
   * @see {@link NavigationError}
   */
  navigationTrigger?: NavigationTrigger;

  /**
   * The navigation state that was previously supplied to the `pushState` call,
   * when the navigation is triggered by a `popstate` event. Otherwise null.
   *
   * The state object is defined by `NavigationExtras`, and contains any
   * developer-defined state value, as well as a unique ID that
   * the router assigns to every router transition/navigation.
   *
   * From the perspective of the router, the router never "goes back".
   * When the user clicks on the back button in the browser,
   * a new navigation ID is created.
   *
   * Use the ID in this previous-state object to differentiate between a newly created
   * state and one returned to by a `popstate` event, so that you can restore some
   * remembered state, such as scroll position.
   *
   */
  restoredState?: {[k: string]: any; navigationId: number} | null;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    navigationTrigger: NavigationTrigger = 'imperative',
    /** @docsNotRequired */
    restoredState: {[k: string]: any; navigationId: number} | null = null,
  ) {
    super(id, url);
    this.navigationTrigger = navigationTrigger;
    this.restoredState = restoredState;
  }

  /** @docsNotRequired */
  override toString(): string {
    return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
  }
}

/**
 * An event triggered when a navigation ends successfully.
 *
 * @see {@link NavigationStart}
 * @see {@link NavigationCancel}
 * @see {@link NavigationError}
 *
 * @publicApi
 */
export class NavigationEnd extends RouterEvent {
  readonly type = EventType.NavigationEnd;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public urlAfterRedirects: string,
  ) {
    super(id, url);
  }

  /** @docsNotRequired */
  override toString(): string {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}

/**
 * A code for the `NavigationCancel` event of the `Router` to indicate the
 * reason a navigation failed.
 *
 * @publicApi
 */
export enum NavigationCancellationCode {
  /**
   * A navigation failed because a guard returned a `UrlTree` to redirect.
   */
  Redirect,
  /**
   * A navigation failed because a more recent navigation started.
   */
  SupersededByNewNavigation,
  /**
   * A navigation failed because one of the resolvers completed without emitting a value.
   */
  NoDataFromResolver,
  /**
   * A navigation failed because a guard returned `false`.
   */
  GuardRejected,
  /**
   * A navigation was aborted by the `Navigation.abort` function.
   *
   * @see {@link Navigation}
   */
  Aborted,
}

/**
 * A code for the `NavigationSkipped` event of the `Router` to indicate the
 * reason a navigation was skipped.
 *
 * @publicApi
 */
export enum NavigationSkippedCode {
  /**
   * A navigation was skipped because the navigation URL was the same as the current Router URL.
   */
  IgnoredSameUrlNavigation,
  /**
   * A navigation was skipped because the configured `UrlHandlingStrategy` return `false` for both
   * the current Router URL and the target of the navigation.
   *
   * @see {@link UrlHandlingStrategy}
   */
  IgnoredByUrlHandlingStrategy,
}

/**
 * An event triggered when a navigation is canceled, directly or indirectly.
 * This can happen for several reasons including when a route guard
 * returns `false` or initiates a redirect by returning a `UrlTree`.
 *
 * @see {@link NavigationStart}
 * @see {@link NavigationEnd}
 * @see {@link NavigationError}
 *
 * @publicApi
 */
export class NavigationCancel extends RouterEvent {
  readonly type = EventType.NavigationCancel;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /**
     * A description of why the navigation was cancelled. For debug purposes only. Use `code`
     * instead for a stable cancellation reason that can be used in production.
     */
    public reason: string,
    /**
     * A code to indicate why the navigation was canceled. This cancellation code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    readonly code?: NavigationCancellationCode,
  ) {
    super(id, url);
  }

  /** @docsNotRequired */
  override toString(): string {
    return `NavigationCancel(id: ${this.id}, url: '${this.url}')`;
  }
}

/**
 * An event triggered when a navigation is skipped.
 * This can happen for a couple reasons including onSameUrlHandling
 * is set to `ignore` and the navigation URL is not different than the
 * current state.
 *
 * @publicApi
 */
export class NavigationSkipped extends RouterEvent {
  readonly type = EventType.NavigationSkipped;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /**
     * A description of why the navigation was skipped. For debug purposes only. Use `code`
     * instead for a stable skipped reason that can be used in production.
     */
    public reason: string,
    /**
     * A code to indicate why the navigation was skipped. This code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    readonly code?: NavigationSkippedCode,
  ) {
    super(id, url);
  }
}

/**
 * An event triggered when a navigation fails due to an unexpected error.
 *
 * @see {@link NavigationStart}
 * @see {@link NavigationEnd}
 * @see {@link NavigationCancel}
 *
 * @publicApi
 */
export class NavigationError extends RouterEvent {
  readonly type = EventType.NavigationError;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public error: any,
    /**
     * The target of the navigation when the error occurred.
     *
     * Note that this can be `undefined` because an error could have occurred before the
     * `RouterStateSnapshot` was created for the navigation.
     */
    readonly target?: RouterStateSnapshot,
  ) {
    super(id, url);
  }

  /** @docsNotRequired */
  override toString(): string {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}

/**
 * An event triggered when routes are recognized.
 *
 * @publicApi
 */
export class RoutesRecognized extends RouterEvent {
  readonly type = EventType.RoutesRecognized;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public urlAfterRedirects: string,
    /** @docsNotRequired */
    public state: RouterStateSnapshot,
  ) {
    super(id, url);
  }

  /** @docsNotRequired */
  override toString(): string {
    return `RoutesRecognized(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * An event triggered at the start of the Guard phase of routing.
 *
 * @see {@link GuardsCheckEnd}
 *
 * @publicApi
 */
export class GuardsCheckStart extends RouterEvent {
  readonly type = EventType.GuardsCheckStart;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public urlAfterRedirects: string,
    /** @docsNotRequired */
    public state: RouterStateSnapshot,
  ) {
    super(id, url);
  }

  override toString(): string {
    return `GuardsCheckStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * An event triggered at the end of the Guard phase of routing.
 *
 * @see {@link GuardsCheckStart}
 *
 * @publicApi
 */
export class GuardsCheckEnd extends RouterEvent {
  readonly type = EventType.GuardsCheckEnd;

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
    public shouldActivate: boolean,
  ) {
    super(id, url);
  }

  override toString(): string {
    return `GuardsCheckEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state}, shouldActivate: ${this.shouldActivate})`;
  }
}

/**
 * An event triggered at the start of the Resolve phase of routing.
 *
 * Runs in the "resolve" phase whether or not there is anything to resolve.
 * In future, may change to only run when there are things to be resolved.
 *
 * @see {@link ResolveEnd}
 *
 * @publicApi
 */
export class ResolveStart extends RouterEvent {
  readonly type = EventType.ResolveStart;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public urlAfterRedirects: string,
    /** @docsNotRequired */
    public state: RouterStateSnapshot,
  ) {
    super(id, url);
  }

  override toString(): string {
    return `ResolveStart(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * An event triggered at the end of the Resolve phase of routing.
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ResolveEnd extends RouterEvent {
  readonly type = EventType.ResolveEnd;

  constructor(
    /** @docsNotRequired */
    id: number,
    /** @docsNotRequired */
    url: string,
    /** @docsNotRequired */
    public urlAfterRedirects: string,
    /** @docsNotRequired */
    public state: RouterStateSnapshot,
  ) {
    super(id, url);
  }

  override toString(): string {
    return `ResolveEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}', state: ${this.state})`;
  }
}

/**
 * An event triggered before lazy loading a route configuration.
 *
 * @see {@link RouteConfigLoadEnd}
 *
 * @publicApi
 */
export class RouteConfigLoadStart {
  readonly type = EventType.RouteConfigLoadStart;

  constructor(
    /** @docsNotRequired */
    public route: Route,
  ) {}
  toString(): string {
    return `RouteConfigLoadStart(path: ${this.route.path})`;
  }
}

/**
 * An event triggered when a route has been lazy loaded.
 *
 * @see {@link RouteConfigLoadStart}
 *
 * @publicApi
 */
export class RouteConfigLoadEnd {
  readonly type = EventType.RouteConfigLoadEnd;

  constructor(
    /** @docsNotRequired */
    public route: Route,
  ) {}
  toString(): string {
    return `RouteConfigLoadEnd(path: ${this.route.path})`;
  }
}

/**
 * An event triggered at the start of the child-activation
 * part of the Resolve phase of routing.
 * @see {@link ChildActivationEnd}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ChildActivationStart {
  readonly type = EventType.ChildActivationStart;

  constructor(
    /** @docsNotRequired */
    public snapshot: ActivatedRouteSnapshot,
  ) {}
  toString(): string {
    const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
    return `ChildActivationStart(path: '${path}')`;
  }
}

/**
 * An event triggered at the end of the child-activation part
 * of the Resolve phase of routing.
 * @see {@link ChildActivationStart}
 * @see {@link ResolveStart}
 * @publicApi
 */
export class ChildActivationEnd {
  readonly type = EventType.ChildActivationEnd;

  constructor(
    /** @docsNotRequired */
    public snapshot: ActivatedRouteSnapshot,
  ) {}
  toString(): string {
    const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
    return `ChildActivationEnd(path: '${path}')`;
  }
}

/**
 * An event triggered at the start of the activation part
 * of the Resolve phase of routing.
 * @see {@link ActivationEnd}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ActivationStart {
  readonly type = EventType.ActivationStart;

  constructor(
    /** @docsNotRequired */
    public snapshot: ActivatedRouteSnapshot,
  ) {}
  toString(): string {
    const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
    return `ActivationStart(path: '${path}')`;
  }
}

/**
 * An event triggered at the end of the activation part
 * of the Resolve phase of routing.
 * @see {@link ActivationStart}
 * @see {@link ResolveStart}
 *
 * @publicApi
 */
export class ActivationEnd {
  readonly type = EventType.ActivationEnd;

  constructor(
    /** @docsNotRequired */
    public snapshot: ActivatedRouteSnapshot,
  ) {}
  toString(): string {
    const path = (this.snapshot.routeConfig && this.snapshot.routeConfig.path) || '';
    return `ActivationEnd(path: '${path}')`;
  }
}

/**
 * An event triggered by scrolling.
 *
 * @publicApi
 */
export class Scroll {
  readonly type = EventType.Scroll;

  constructor(
    /** @docsNotRequired */
    readonly routerEvent: NavigationEnd | NavigationSkipped,

    /** @docsNotRequired */
    readonly position: [number, number] | null,

    /** @docsNotRequired */
    readonly anchor: string | null,
  ) {}

  toString(): string {
    const pos = this.position ? `${this.position[0]}, ${this.position[1]}` : null;
    return `Scroll(anchor: '${this.anchor}', position: '${pos}')`;
  }
}

export class BeforeActivateRoutes {}
export class RedirectRequest {
  constructor(
    readonly url: UrlTree,
    readonly navigationBehaviorOptions: NavigationBehaviorOptions | undefined,
  ) {}
}
export type PrivateRouterEvents = BeforeActivateRoutes | RedirectRequest;
export function isPublicRouterEvent(e: Event | PrivateRouterEvents): e is Event {
  return !(e instanceof BeforeActivateRoutes) && !(e instanceof RedirectRequest);
}

/**
 * Router events that allow you to track the lifecycle of the router.
 *
 * The events occur in the following sequence:
 *
 * * [NavigationStart](api/router/NavigationStart): Navigation starts.
 * * [RouteConfigLoadStart](api/router/RouteConfigLoadStart): Before
 * the router [lazy loads](guide/routing/common-router-tasks#lazy-loading) a route configuration.
 * * [RouteConfigLoadEnd](api/router/RouteConfigLoadEnd): After a route has been lazy loaded.
 * * [RoutesRecognized](api/router/RoutesRecognized): When the router parses the URL
 * and the routes are recognized.
 * * [GuardsCheckStart](api/router/GuardsCheckStart): When the router begins the *guards*
 * phase of routing.
 * * [ChildActivationStart](api/router/ChildActivationStart): When the router
 * begins activating a route's children.
 * * [ActivationStart](api/router/ActivationStart): When the router begins activating a route.
 * * [GuardsCheckEnd](api/router/GuardsCheckEnd): When the router finishes the *guards*
 * phase of routing successfully.
 * * [ResolveStart](api/router/ResolveStart): When the router begins the *resolve*
 * phase of routing.
 * * [ResolveEnd](api/router/ResolveEnd): When the router finishes the *resolve*
 * phase of routing successfully.
 * * [ChildActivationEnd](api/router/ChildActivationEnd): When the router finishes
 * activating a route's children.
 * * [ActivationEnd](api/router/ActivationEnd): When the router finishes activating a route.
 * * [NavigationEnd](api/router/NavigationEnd): When navigation ends successfully.
 * * [NavigationCancel](api/router/NavigationCancel): When navigation is canceled.
 * * [NavigationError](api/router/NavigationError): When navigation fails
 * due to an unexpected error.
 * * [Scroll](api/router/Scroll): When the user scrolls.
 *
 * @publicApi
 */
export type Event =
  | NavigationStart
  | NavigationEnd
  | NavigationCancel
  | NavigationError
  | RoutesRecognized
  | GuardsCheckStart
  | GuardsCheckEnd
  | RouteConfigLoadStart
  | RouteConfigLoadEnd
  | ChildActivationStart
  | ChildActivationEnd
  | ActivationStart
  | ActivationEnd
  | Scroll
  | ResolveStart
  | ResolveEnd
  | NavigationSkipped;

export function stringifyEvent(routerEvent: Event): string {
  switch (routerEvent.type) {
    case EventType.ActivationEnd:
      return `ActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
    case EventType.ActivationStart:
      return `ActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
    case EventType.ChildActivationEnd:
      return `ChildActivationEnd(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
    case EventType.ChildActivationStart:
      return `ChildActivationStart(path: '${routerEvent.snapshot.routeConfig?.path || ''}')`;
    case EventType.GuardsCheckEnd:
      return `GuardsCheckEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state}, shouldActivate: ${routerEvent.shouldActivate})`;
    case EventType.GuardsCheckStart:
      return `GuardsCheckStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
    case EventType.NavigationCancel:
      return `NavigationCancel(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
    case EventType.NavigationSkipped:
      return `NavigationSkipped(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
    case EventType.NavigationEnd:
      return `NavigationEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}')`;
    case EventType.NavigationError:
      return `NavigationError(id: ${routerEvent.id}, url: '${routerEvent.url}', error: ${routerEvent.error})`;
    case EventType.NavigationStart:
      return `NavigationStart(id: ${routerEvent.id}, url: '${routerEvent.url}')`;
    case EventType.ResolveEnd:
      return `ResolveEnd(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
    case EventType.ResolveStart:
      return `ResolveStart(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
    case EventType.RouteConfigLoadEnd:
      return `RouteConfigLoadEnd(path: ${routerEvent.route.path})`;
    case EventType.RouteConfigLoadStart:
      return `RouteConfigLoadStart(path: ${routerEvent.route.path})`;
    case EventType.RoutesRecognized:
      return `RoutesRecognized(id: ${routerEvent.id}, url: '${routerEvent.url}', urlAfterRedirects: '${routerEvent.urlAfterRedirects}', state: ${routerEvent.state})`;
    case EventType.Scroll:
      const pos = routerEvent.position
        ? `${routerEvent.position[0]}, ${routerEvent.position[1]}`
        : null;
      return `Scroll(anchor: '${routerEvent.anchor}', position: '${pos}')`;
  }
}
