/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {EnvironmentInjector, inject, Service} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

import {Event, NavigationTrigger, PrivateRouterEvents} from '../events';
import {Navigation, NavigationExtras, RestoredState} from '../navigation_transition';
import {ROUTER_CONFIGURATION} from '../router_config';
import {createEmptyState, RouterState} from '../router_state';
import {UrlHandlingStrategy} from '../url_handling_strategy';
import {UrlSerializer, UrlTree} from '../url_tree';

@Service({autoProvided: false})
export abstract class StateManager {
  protected readonly urlSerializer = inject(UrlSerializer);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
  protected readonly canceledNavigationResolution =
    this.options.canceledNavigationResolution || 'replace';
  protected location = inject(Location);
  protected urlHandlingStrategy = inject(UrlHandlingStrategy);
  protected urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';

  protected currentUrlTree = new UrlTree();
  /**
   * Returns the currently activated `UrlTree`.
   *
   * This `UrlTree` shows only URLs that the `Router` is configured to handle (through
   * `UrlHandlingStrategy`).
   *
   * The value is set after finding the route config tree to activate but before activating the
   * route.
   */
  getCurrentUrlTree(): UrlTree {
    return this.currentUrlTree;
  }

  protected rawUrlTree = this.currentUrlTree;
  /**
   * Returns a `UrlTree` that is represents what the browser is actually showing.
   *
   * In the life of a navigation transition:
   * 1. When a navigation begins, the raw `UrlTree` is updated to the full URL that's being
   * navigated to.
   * 2. During a navigation, redirects are applied, which might only apply to _part_ of the URL (due
   * to `UrlHandlingStrategy`).
   * 3. Just before activation, the raw `UrlTree` is updated to include the redirects on top of the
   * original raw URL.
   *
   * Note that this is _only_ here to support `UrlHandlingStrategy.extract` and
   * `UrlHandlingStrategy.shouldProcessUrl`. Without those APIs, the current `UrlTree` would not
   * deviated from the raw `UrlTree`.
   *
   * For `extract`, a raw `UrlTree` is needed because `extract` may only return part
   * of the navigation URL. Thus, the current `UrlTree` may only represent _part_ of the browser
   * URL. When a navigation gets cancelled and the router needs to reset the URL or a new navigation
   * occurs, it needs to know the _whole_ browser URL, not just the part handled by
   * `UrlHandlingStrategy`.
   * For `shouldProcessUrl`, when the return is `false`, the router ignores the navigation but
   * still updates the raw `UrlTree` with the assumption that the navigation was caused by the
   * location change listener due to a URL update by the AngularJS router. In this case, the router
   * still need to know what the browser's URL is for future navigations.
   */
  getRawUrlTree(): UrlTree {
    return this.rawUrlTree;
  }

  protected createBrowserPath({finalUrl, initialUrl, targetBrowserUrl}: Navigation): string {
    const rawUrl =
      finalUrl !== undefined ? this.urlHandlingStrategy.merge(finalUrl!, initialUrl) : initialUrl;
    const url = targetBrowserUrl ?? rawUrl;
    const path = url instanceof UrlTree ? this.urlSerializer.serialize(url) : url;
    return path;
  }

  protected routerUrlState(navigation?: Navigation): {
    ɵrouterUrl?: string;
  } {
    if (navigation?.targetBrowserUrl === undefined || navigation?.finalUrl === undefined) {
      return {};
    }
    return {ɵrouterUrl: this.urlSerializer.serialize(navigation.finalUrl)};
  }

  protected commitTransition({targetRouterState, finalUrl, initialUrl}: Navigation): void {
    // If we are committing the transition after having a final URL and target state, we're updating
    // all pieces of the state. Otherwise, we likely skipped the transition (due to URL handling strategy)
    // and only want to update the rawUrlTree, which represents the browser URL (and doesn't necessarily match router state).
    if (finalUrl && targetRouterState) {
      this.currentUrlTree = finalUrl;
      this.rawUrlTree = this.urlHandlingStrategy.merge(finalUrl, initialUrl);
      this.routerState = targetRouterState;
    } else {
      this.rawUrlTree = initialUrl;
    }
  }

  protected routerState = createEmptyState(null, inject(EnvironmentInjector));

  /** Returns the current RouterState. */
  getRouterState(): RouterState {
    return this.routerState;
  }

  private _stateMemento = this.createStateMemento();
  get stateMemento() {
    return this._stateMemento;
  }

  protected updateStateMemento(): void {
    this._stateMemento = this.createStateMemento();
  }

  private createStateMemento() {
    return {
      rawUrlTree: this.rawUrlTree,
      currentUrlTree: this.currentUrlTree,
      routerState: this.routerState,
    };
  }

  /** Returns the current state stored by the browser for the current history entry. */
  restoredState(): RestoredState | null | undefined {
    return this.location.getState() as RestoredState | null | undefined;
  }

  /**
   * Registers a listener that is called whenever the current history entry changes by some API
   * outside the Router. This includes user-activated changes like back buttons and link clicks, but
   * also includes programmatic APIs called by non-Router JavaScript.
   */
  abstract registerNonRouterCurrentEntryChangeListener(
    listener: (
      url: string,
      state: RestoredState | null | undefined,
      trigger: NavigationTrigger,
      extras: NavigationExtras,
      hasUAVisualTransition?: boolean,
    ) => void,
  ): SubscriptionLike;

  /**
   * Handles a navigation event sent from the Router. These are typically events that indicate a
   * navigation has started, progressed, been cancelled, or finished.
   */
  abstract handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation): void;
}
