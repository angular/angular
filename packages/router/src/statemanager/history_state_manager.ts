/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Location} from '@angular/common';
import {inject, Service} from '@angular/core';
import {SubscriptionLike} from 'rxjs';

import {
  BeforeActivateRoutes,
  Event,
  isRedirectingEvent,
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  NavigationTrigger,
  PrivateRouterEvents,
  RoutesRecognized,
} from '../events';
import {Navigation, NavigationExtras, RestoredState} from '../navigation_transition';
import {StateManager} from './state_manager';

@Service()
export class HistoryStateManager extends StateManager {
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

  override registerNonRouterCurrentEntryChangeListener(
    listener: (
      url: string,
      state: RestoredState | null | undefined,
      trigger: NavigationTrigger,
      extras: NavigationExtras,
      hasUAVisualTransition?: boolean,
    ) => void,
  ): SubscriptionLike {
    return this.location.subscribe((event) => {
      if (event['type'] === 'popstate') {
        // The `setTimeout` was added in #12160 and is likely to support Angular/AngularJS
        // hybrid apps.
        setTimeout(() => {
          listener(
            event['url']!,
            event.state as RestoredState | null | undefined,
            'popstate',
            {
              replaceUrl: true,
            },
            event.hasUAVisualTransition,
          );
        });
      }
    });
  }

  override handleRouterEvent(e: Event | PrivateRouterEvents, currentTransition: Navigation): void {
    if (e instanceof NavigationStart) {
      this.updateStateMemento();
    } else if (e instanceof NavigationSkipped) {
      this.commitTransition(currentTransition);
    } else if (e instanceof RoutesRecognized) {
      if (this.urlUpdateStrategy === 'eager') {
        if (!currentTransition.extras.skipLocationChange) {
          this.setBrowserUrl(this.createBrowserPath(currentTransition), currentTransition);
        }
      }
    } else if (e instanceof BeforeActivateRoutes) {
      this.commitTransition(currentTransition);
      if (this.urlUpdateStrategy === 'deferred' && !currentTransition.extras.skipLocationChange) {
        this.setBrowserUrl(this.createBrowserPath(currentTransition), currentTransition);
      }
    } else if (e instanceof NavigationCancel && !isRedirectingEvent(e)) {
      this.restoreHistory(currentTransition);
    } else if (e instanceof NavigationError) {
      this.restoreHistory(currentTransition, true);
    } else if (e instanceof NavigationEnd) {
      this.lastSuccessfulId = e.id;
      this.currentPageId = this.browserPageId;
    }
  }

  private setBrowserUrl(path: string, navigation: Navigation) {
    const {extras, id} = navigation;
    const {replaceUrl, state} = extras;

    if (this.location.isCurrentPathEqualTo(path) || !!replaceUrl) {
      // replacements do not update the target page
      const currentBrowserPageId = this.browserPageId;
      const newState = {
        ...state,
        ...this.generateNgRouterState(id, currentBrowserPageId, navigation),
      };
      this.location.replaceState(path, '', newState);
    } else {
      const newState = {
        ...state,
        ...this.generateNgRouterState(id, this.browserPageId + 1, navigation),
      };
      this.location.go(path, '', newState);
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
      } else if (this.getCurrentUrlTree() === navigation.finalUrl && targetPagePosition === 0) {
        // We got to the activation stage (where currentUrlTree is set to the navigation's
        // finalUrl), but we weren't moving anywhere in history (skipLocationChange or replaceUrl).
        // We still need to reset the router state back to what it was when the navigation started.
        this.resetInternalState(navigation);
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
        this.resetInternalState(navigation);
      }
      this.resetUrlToCurrentUrlTree();
    }
  }

  private resetInternalState({finalUrl}: Navigation): void {
    this.routerState = this.stateMemento.routerState;
    this.currentUrlTree = this.stateMemento.currentUrlTree;
    // Note here that we use the urlHandlingStrategy to get the reset `rawUrlTree` because it may be
    // configured to handle only part of the navigation URL. This means we would only want to reset
    // the part of the navigation handled by the Angular router rather than the whole URL. In
    // addition, the URLHandlingStrategy may be configured to specifically preserve parts of the URL
    // when merging, such as the query params so they are not lost on a refresh.
    this.rawUrlTree = this.urlHandlingStrategy.merge(
      this.currentUrlTree,
      finalUrl ?? this.rawUrlTree,
    );
  }

  private resetUrlToCurrentUrlTree(): void {
    this.location.replaceState(
      this.urlSerializer.serialize(this.getRawUrlTree()),
      '',
      this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId),
    );
  }

  private generateNgRouterState(
    navigationId: number,
    routerPageId: number,
    navigation?: Navigation,
  ) {
    if (this.canceledNavigationResolution === 'computed') {
      return {navigationId, ɵrouterPageId: routerPageId, ...this.routerUrlState(navigation)};
    }

    return {navigationId, ...this.routerUrlState(navigation)};
  }
}
