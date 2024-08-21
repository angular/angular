/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Location} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

import {
  BeforeActivateRoutes,
  Event,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  PrivateRouterEvents,
  RoutesRecognized,
} from '../events';
import {Navigation, RestoredState} from '../navigation_transition';
import {ROUTER_CONFIGURATION} from '../router_config';
import {createEmptyState, RouterState} from '../router_state';
import {UrlHandlingStrategy} from '../url_handling_strategy';
import {UrlSerializer, UrlTree} from '../url_tree';

@Injectable({providedIn: 'root', useFactory: () => inject(HistoryStateManager)})
export abstract class StateManager {
  /**
   * Returns the currently activated `UrlTree`.
   *
   * This `UrlTree` shows only URLs that the `Router` is configured to handle (through
   * `UrlHandlingStrategy`).
   *
   * The value is set after finding the route config tree to activate but before activating the
   * route.
   */
  abstract getCurrentUrlTree(): UrlTree;

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
  abstract getRawUrlTree(): UrlTree;

  /** Returns the current state stored by the browser for the current history entry. */
  abstract restoredState(): RestoredState | null | undefined;

  /** Returns the current RouterState. */
  abstract getRouterState(): RouterState;

  /**
   * Registers a listener that is called whenever the current history entry changes by some API
   * outside the Router. This includes user-activated changes like back buttons and link clicks, but
   * also includes programmatic APIs called by non-Router JavaScript.
   */
  abstract registerNonRouterCurrentEntryChangeListener(
    listener: (url: string, state: RestoredState | null | undefined) => void,
  ): SubscriptionLike;

  /**
   * Handles a navigation event sent from the Router. These are typically events that indicate a
   * navigation has started, progressed, been cancelled, or finished.
   */
  abstract handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation): void;
}

@Injectable({providedIn: 'root'})
export class HistoryStateManager extends StateManager {
  private readonly location = inject(Location);
  private readonly urlSerializer = inject(UrlSerializer);
  private readonly options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
  private readonly canceledNavigationResolution =
    this.options.canceledNavigationResolution || 'replace';

  private urlHandlingStrategy = inject(UrlHandlingStrategy);
  private urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';

  private currentUrlTree = new UrlTree();

  override getCurrentUrlTree() {
    return this.currentUrlTree;
  }

  private rawUrlTree = this.currentUrlTree;

  override getRawUrlTree() {
    return this.rawUrlTree;
  }

  /**
   * The id of the currently active page in the router.
   * Updated to the transition's target id on a successful navigation.
   *
   * This is used to track what page the router last activated. When an attempted navigation fails,
   * the router can then use this to compute how to restore the state back to the previously active
   * page.
   */
  private currentPageId: number = 0;
  private lastSuccessfulId: number = -1;

  override restoredState(): RestoredState | null | undefined {
    return this.location.getState() as RestoredState | null | undefined;
  }

  /**
   * The ɵrouterPageId of whatever page is currently active in the browser history. This is
   * important for computing the target page id for new navigations because we need to ensure each
   * page id in the browser history is 1 more than the previous entry.
   */
  private get browserPageId(): number {
    if (this.canceledNavigationResolution !== 'computed') {
      return this.currentPageId;
    }
    return this.restoredState()?.ɵrouterPageId ?? this.currentPageId;
  }

  private routerState = createEmptyState(null);

  override getRouterState() {
    return this.routerState;
  }

  private stateMemento = this.createStateMemento();

  private createStateMemento() {
    return {
      rawUrlTree: this.rawUrlTree,
      currentUrlTree: this.currentUrlTree,
      routerState: this.routerState,
    };
  }

  override registerNonRouterCurrentEntryChangeListener(
    listener: (url: string, state: RestoredState | null | undefined) => void,
  ): SubscriptionLike {
    return this.location.subscribe((event) => {
      if (event['type'] === 'popstate') {
        listener(event['url']!, event.state as RestoredState | null | undefined);
      }
    });
  }

  override handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation) {
    if (e instanceof NavigationStart) {
      this.stateMemento = this.createStateMemento();
    } else if (e instanceof NavigationSkipped) {
      this.rawUrlTree = currentTransition.initialUrl;
    } else if (e instanceof RoutesRecognized) {
      if (this.urlUpdateStrategy === 'eager') {
        if (!currentTransition.extras.skipLocationChange) {
          const rawUrl = this.urlHandlingStrategy.merge(
            currentTransition.finalUrl!,
            currentTransition.initialUrl,
          );
          this.setBrowserUrl(currentTransition.targetBrowserUrl ?? rawUrl, currentTransition);
        }
      }
    } else if (e instanceof BeforeActivateRoutes) {
      this.currentUrlTree = currentTransition.finalUrl!;
      this.rawUrlTree = this.urlHandlingStrategy.merge(
        currentTransition.finalUrl!,
        currentTransition.initialUrl,
      );
      this.routerState = currentTransition.targetRouterState!;
      if (this.urlUpdateStrategy === 'deferred' && !currentTransition.extras.skipLocationChange) {
        this.setBrowserUrl(
          currentTransition.targetBrowserUrl ?? this.rawUrlTree,
          currentTransition,
        );
      }
    } else if (
      e instanceof NavigationCancel &&
      (e.code === NavigationCancellationCode.GuardRejected ||
        e.code === NavigationCancellationCode.NoDataFromResolver)
    ) {
      this.restoreHistory(currentTransition);
    } else if (e instanceof NavigationError) {
      this.restoreHistory(currentTransition, true);
    } else if (e instanceof NavigationEnd) {
      this.lastSuccessfulId = e.id;
      this.currentPageId = this.browserPageId;
    }
  }

  private setBrowserUrl(url: UrlTree | string, transition: Navigation) {
    const path = url instanceof UrlTree ? this.urlSerializer.serialize(url) : url;
    if (this.location.isCurrentPathEqualTo(path) || !!transition.extras.replaceUrl) {
      // replacements do not update the target page
      const currentBrowserPageId = this.browserPageId;
      const state = {
        ...transition.extras.state,
        ...this.generateNgRouterState(transition.id, currentBrowserPageId),
      };
      this.location.replaceState(path, '', state);
    } else {
      const state = {
        ...transition.extras.state,
        ...this.generateNgRouterState(transition.id, this.browserPageId + 1),
      };
      this.location.go(path, '', state);
    }
  }

  /**
   * Performs the necessary rollback action to restore the browser URL to the
   * state before the transition.
   */
  private restoreHistory(navigation: Navigation, restoringFromCaughtError = false) {
    if (this.canceledNavigationResolution === 'computed') {
      const currentBrowserPageId = this.browserPageId;
      const targetPagePosition = this.currentPageId - currentBrowserPageId;
      if (targetPagePosition !== 0) {
        this.location.historyGo(targetPagePosition);
      } else if (this.currentUrlTree === navigation.finalUrl && targetPagePosition === 0) {
        // We got to the activation stage (where currentUrlTree is set to the navigation's
        // finalUrl), but we weren't moving anywhere in history (skipLocationChange or replaceUrl).
        // We still need to reset the router state back to what it was when the navigation started.
        this.resetState(navigation);
        this.resetUrlToCurrentUrlTree();
      } else {
        // The browser URL and router state was not updated before the navigation cancelled so
        // there's no restoration needed.
      }
    } else if (this.canceledNavigationResolution === 'replace') {
      // TODO(atscott): It seems like we should _always_ reset the state here. It would be a no-op
      // for `deferred` navigations that haven't change the internal state yet because guards
      // reject. For 'eager' navigations, it seems like we also really should reset the state
      // because the navigation was cancelled. Investigate if this can be done by running TGP.
      if (restoringFromCaughtError) {
        this.resetState(navigation);
      }
      this.resetUrlToCurrentUrlTree();
    }
  }

  private resetState(navigation: Navigation): void {
    this.routerState = this.stateMemento.routerState;
    this.currentUrlTree = this.stateMemento.currentUrlTree;
    // Note here that we use the urlHandlingStrategy to get the reset `rawUrlTree` because it may be
    // configured to handle only part of the navigation URL. This means we would only want to reset
    // the part of the navigation handled by the Angular router rather than the whole URL. In
    // addition, the URLHandlingStrategy may be configured to specifically preserve parts of the URL
    // when merging, such as the query params so they are not lost on a refresh.
    this.rawUrlTree = this.urlHandlingStrategy.merge(
      this.currentUrlTree,
      navigation.finalUrl ?? this.rawUrlTree,
    );
  }

  private resetUrlToCurrentUrlTree(): void {
    this.location.replaceState(
      this.urlSerializer.serialize(this.rawUrlTree),
      '',
      this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId),
    );
  }

  private generateNgRouterState(navigationId: number, routerPageId: number) {
    if (this.canceledNavigationResolution === 'computed') {
      return {navigationId, ɵrouterPageId: routerPageId};
    }
    return {navigationId};
  }
}
