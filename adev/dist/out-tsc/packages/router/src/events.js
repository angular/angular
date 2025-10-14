/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export const IMPERATIVE_NAVIGATION = 'imperative';
/**
 * Identifies the type of a router event.
 *
 * @publicApi
 */
export var EventType;
(function (EventType) {
  EventType[(EventType['NavigationStart'] = 0)] = 'NavigationStart';
  EventType[(EventType['NavigationEnd'] = 1)] = 'NavigationEnd';
  EventType[(EventType['NavigationCancel'] = 2)] = 'NavigationCancel';
  EventType[(EventType['NavigationError'] = 3)] = 'NavigationError';
  EventType[(EventType['RoutesRecognized'] = 4)] = 'RoutesRecognized';
  EventType[(EventType['ResolveStart'] = 5)] = 'ResolveStart';
  EventType[(EventType['ResolveEnd'] = 6)] = 'ResolveEnd';
  EventType[(EventType['GuardsCheckStart'] = 7)] = 'GuardsCheckStart';
  EventType[(EventType['GuardsCheckEnd'] = 8)] = 'GuardsCheckEnd';
  EventType[(EventType['RouteConfigLoadStart'] = 9)] = 'RouteConfigLoadStart';
  EventType[(EventType['RouteConfigLoadEnd'] = 10)] = 'RouteConfigLoadEnd';
  EventType[(EventType['ChildActivationStart'] = 11)] = 'ChildActivationStart';
  EventType[(EventType['ChildActivationEnd'] = 12)] = 'ChildActivationEnd';
  EventType[(EventType['ActivationStart'] = 13)] = 'ActivationStart';
  EventType[(EventType['ActivationEnd'] = 14)] = 'ActivationEnd';
  EventType[(EventType['Scroll'] = 15)] = 'Scroll';
  EventType[(EventType['NavigationSkipped'] = 16)] = 'NavigationSkipped';
})(EventType || (EventType = {}));
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
  id;
  url;
  constructor(
    /** A unique ID that the router assigns to every router navigation. */
    id,
    /** The URL that is the destination for this navigation. */
    url,
  ) {
    this.id = id;
    this.url = url;
  }
}
/**
 * An event triggered when a navigation starts.
 *
 * @publicApi
 */
export class NavigationStart extends RouterEvent {
  type = EventType.NavigationStart;
  /**
   * Identifies the call or event that triggered the navigation.
   * An `imperative` trigger is a call to `router.navigateByUrl()` or `router.navigate()`.
   *
   * @see {@link NavigationEnd}
   * @see {@link NavigationCancel}
   * @see {@link NavigationError}
   */
  navigationTrigger;
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
  restoredState;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    navigationTrigger = 'imperative',
    /** @docsNotRequired */
    restoredState = null,
  ) {
    super(id, url);
    this.navigationTrigger = navigationTrigger;
    this.restoredState = restoredState;
  }
  /** @docsNotRequired */
  toString() {
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
  urlAfterRedirects;
  type = EventType.NavigationEnd;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
  }
  /** @docsNotRequired */
  toString() {
    return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
  }
}
/**
 * A code for the `NavigationCancel` event of the `Router` to indicate the
 * reason a navigation failed.
 *
 * @publicApi
 */
export var NavigationCancellationCode;
(function (NavigationCancellationCode) {
  /**
   * A navigation failed because a guard returned a `UrlTree` to redirect.
   */
  NavigationCancellationCode[(NavigationCancellationCode['Redirect'] = 0)] = 'Redirect';
  /**
   * A navigation failed because a more recent navigation started.
   */
  NavigationCancellationCode[(NavigationCancellationCode['SupersededByNewNavigation'] = 1)] =
    'SupersededByNewNavigation';
  /**
   * A navigation failed because one of the resolvers completed without emitting a value.
   */
  NavigationCancellationCode[(NavigationCancellationCode['NoDataFromResolver'] = 2)] =
    'NoDataFromResolver';
  /**
   * A navigation failed because a guard returned `false`.
   */
  NavigationCancellationCode[(NavigationCancellationCode['GuardRejected'] = 3)] = 'GuardRejected';
  /**
   * A navigation was aborted by the `Navigation.abort` function.
   *
   * @see {@link Navigation}
   */
  NavigationCancellationCode[(NavigationCancellationCode['Aborted'] = 4)] = 'Aborted';
})(NavigationCancellationCode || (NavigationCancellationCode = {}));
/**
 * A code for the `NavigationSkipped` event of the `Router` to indicate the
 * reason a navigation was skipped.
 *
 * @publicApi
 */
export var NavigationSkippedCode;
(function (NavigationSkippedCode) {
  /**
   * A navigation was skipped because the navigation URL was the same as the current Router URL.
   */
  NavigationSkippedCode[(NavigationSkippedCode['IgnoredSameUrlNavigation'] = 0)] =
    'IgnoredSameUrlNavigation';
  /**
   * A navigation was skipped because the configured `UrlHandlingStrategy` return `false` for both
   * the current Router URL and the target of the navigation.
   *
   * @see {@link UrlHandlingStrategy}
   */
  NavigationSkippedCode[(NavigationSkippedCode['IgnoredByUrlHandlingStrategy'] = 1)] =
    'IgnoredByUrlHandlingStrategy';
})(NavigationSkippedCode || (NavigationSkippedCode = {}));
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
  reason;
  code;
  type = EventType.NavigationCancel;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /**
     * A description of why the navigation was cancelled. For debug purposes only. Use `code`
     * instead for a stable cancellation reason that can be used in production.
     */
    reason,
    /**
     * A code to indicate why the navigation was canceled. This cancellation code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    code,
  ) {
    super(id, url);
    this.reason = reason;
    this.code = code;
  }
  /** @docsNotRequired */
  toString() {
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
  reason;
  code;
  type = EventType.NavigationSkipped;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /**
     * A description of why the navigation was skipped. For debug purposes only. Use `code`
     * instead for a stable skipped reason that can be used in production.
     */
    reason,
    /**
     * A code to indicate why the navigation was skipped. This code is stable for
     * the reason and can be relied on whereas the `reason` string could change and should not be
     * used in production.
     */
    code,
  ) {
    super(id, url);
    this.reason = reason;
    this.code = code;
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
  error;
  target;
  type = EventType.NavigationError;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    error,
    /**
     * The target of the navigation when the error occurred.
     *
     * Note that this can be `undefined` because an error could have occurred before the
     * `RouterStateSnapshot` was created for the navigation.
     */
    target,
  ) {
    super(id, url);
    this.error = error;
    this.target = target;
  }
  /** @docsNotRequired */
  toString() {
    return `NavigationError(id: ${this.id}, url: '${this.url}', error: ${this.error})`;
  }
}
/**
 * An event triggered when routes are recognized.
 *
 * @publicApi
 */
export class RoutesRecognized extends RouterEvent {
  urlAfterRedirects;
  state;
  type = EventType.RoutesRecognized;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
    /** @docsNotRequired */
    state,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
    this.state = state;
  }
  /** @docsNotRequired */
  toString() {
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
  urlAfterRedirects;
  state;
  type = EventType.GuardsCheckStart;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
    /** @docsNotRequired */
    state,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
    this.state = state;
  }
  toString() {
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
  urlAfterRedirects;
  state;
  shouldActivate;
  type = EventType.GuardsCheckEnd;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
    /** @docsNotRequired */
    state,
    /** @docsNotRequired */
    shouldActivate,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
    this.state = state;
    this.shouldActivate = shouldActivate;
  }
  toString() {
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
  urlAfterRedirects;
  state;
  type = EventType.ResolveStart;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
    /** @docsNotRequired */
    state,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
    this.state = state;
  }
  toString() {
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
  urlAfterRedirects;
  state;
  type = EventType.ResolveEnd;
  constructor(
    /** @docsNotRequired */
    id,
    /** @docsNotRequired */
    url,
    /** @docsNotRequired */
    urlAfterRedirects,
    /** @docsNotRequired */
    state,
  ) {
    super(id, url);
    this.urlAfterRedirects = urlAfterRedirects;
    this.state = state;
  }
  toString() {
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
  route;
  type = EventType.RouteConfigLoadStart;
  constructor(
    /** @docsNotRequired */
    route,
  ) {
    this.route = route;
  }
  toString() {
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
  route;
  type = EventType.RouteConfigLoadEnd;
  constructor(
    /** @docsNotRequired */
    route,
  ) {
    this.route = route;
  }
  toString() {
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
  snapshot;
  type = EventType.ChildActivationStart;
  constructor(
    /** @docsNotRequired */
    snapshot,
  ) {
    this.snapshot = snapshot;
  }
  toString() {
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
  snapshot;
  type = EventType.ChildActivationEnd;
  constructor(
    /** @docsNotRequired */
    snapshot,
  ) {
    this.snapshot = snapshot;
  }
  toString() {
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
  snapshot;
  type = EventType.ActivationStart;
  constructor(
    /** @docsNotRequired */
    snapshot,
  ) {
    this.snapshot = snapshot;
  }
  toString() {
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
  snapshot;
  type = EventType.ActivationEnd;
  constructor(
    /** @docsNotRequired */
    snapshot,
  ) {
    this.snapshot = snapshot;
  }
  toString() {
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
  routerEvent;
  position;
  anchor;
  type = EventType.Scroll;
  constructor(
    /** @docsNotRequired */
    routerEvent,
    /** @docsNotRequired */
    position,
    /** @docsNotRequired */
    anchor,
  ) {
    this.routerEvent = routerEvent;
    this.position = position;
    this.anchor = anchor;
  }
  toString() {
    const pos = this.position ? `${this.position[0]}, ${this.position[1]}` : null;
    return `Scroll(anchor: '${this.anchor}', position: '${pos}')`;
  }
}
export class BeforeActivateRoutes {}
export class RedirectRequest {
  url;
  navigationBehaviorOptions;
  constructor(url, navigationBehaviorOptions) {
    this.url = url;
    this.navigationBehaviorOptions = navigationBehaviorOptions;
  }
}
export function isPublicRouterEvent(e) {
  return !(e instanceof BeforeActivateRoutes) && !(e instanceof RedirectRequest);
}
export function stringifyEvent(routerEvent) {
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
//# sourceMappingURL=events.js.map
