/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Location} from '@angular/common';
import {inject, Injectable} from '@angular/core';
import {
  BeforeActivateRoutes,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  RoutesRecognized,
} from '../events';
import {ROUTER_CONFIGURATION} from '../router_config';
import {createEmptyState} from '../router_state';
import {UrlHandlingStrategy} from '../url_handling_strategy';
import {UrlSerializer, UrlTree} from '../url_tree';
let StateManager = (() => {
  let _classDecorators = [
    Injectable({providedIn: 'root', useFactory: () => inject(HistoryStateManager)}),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StateManager = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      StateManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    urlSerializer = inject(UrlSerializer);
    options = inject(ROUTER_CONFIGURATION, {optional: true}) || {};
    canceledNavigationResolution = this.options.canceledNavigationResolution || 'replace';
    location = inject(Location);
    urlHandlingStrategy = inject(UrlHandlingStrategy);
    urlUpdateStrategy = this.options.urlUpdateStrategy || 'deferred';
    currentUrlTree = new UrlTree();
    /**
     * Returns the currently activated `UrlTree`.
     *
     * This `UrlTree` shows only URLs that the `Router` is configured to handle (through
     * `UrlHandlingStrategy`).
     *
     * The value is set after finding the route config tree to activate but before activating the
     * route.
     */
    getCurrentUrlTree() {
      return this.currentUrlTree;
    }
    rawUrlTree = this.currentUrlTree;
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
    getRawUrlTree() {
      return this.rawUrlTree;
    }
    createBrowserPath({finalUrl, initialUrl, targetBrowserUrl}) {
      const rawUrl =
        finalUrl !== undefined ? this.urlHandlingStrategy.merge(finalUrl, initialUrl) : initialUrl;
      const url = targetBrowserUrl ?? rawUrl;
      const path = url instanceof UrlTree ? this.urlSerializer.serialize(url) : url;
      return path;
    }
    commitTransition({targetRouterState, finalUrl, initialUrl}) {
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
    routerState = createEmptyState(null);
    /** Returns the current RouterState. */
    getRouterState() {
      return this.routerState;
    }
    stateMemento = this.createStateMemento();
    updateStateMemento() {
      this.stateMemento = this.createStateMemento();
    }
    createStateMemento() {
      return {
        rawUrlTree: this.rawUrlTree,
        currentUrlTree: this.currentUrlTree,
        routerState: this.routerState,
      };
    }
    resetInternalState({finalUrl}) {
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
  };
  return (StateManager = _classThis);
})();
export {StateManager};
let HistoryStateManager = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = StateManager;
  var HistoryStateManager = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HistoryStateManager = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /**
     * The id of the currently active page in the router.
     * Updated to the transition's target id on a successful navigation.
     *
     * This is used to track what page the router last activated. When an attempted navigation fails,
     * the router can then use this to compute how to restore the state back to the previously active
     * page.
     */
    currentPageId = 0;
    lastSuccessfulId = -1;
    restoredState() {
      return this.location.getState();
    }
    /**
     * The ɵrouterPageId of whatever page is currently active in the browser history. This is
     * important for computing the target page id for new navigations because we need to ensure each
     * page id in the browser history is 1 more than the previous entry.
     */
    get browserPageId() {
      if (this.canceledNavigationResolution !== 'computed') {
        return this.currentPageId;
      }
      return this.restoredState()?.ɵrouterPageId ?? this.currentPageId;
    }
    registerNonRouterCurrentEntryChangeListener(listener) {
      return this.location.subscribe((event) => {
        if (event['type'] === 'popstate') {
          // The `setTimeout` was added in #12160 and is likely to support Angular/AngularJS
          // hybrid apps.
          setTimeout(() => {
            listener(event['url'], event.state, 'popstate');
          });
        }
      });
    }
    handleRouterEvent(e, currentTransition) {
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
      } else if (
        e instanceof NavigationCancel &&
        e.code !== NavigationCancellationCode.SupersededByNewNavigation &&
        e.code !== NavigationCancellationCode.Redirect
      ) {
        this.restoreHistory(currentTransition);
      } else if (e instanceof NavigationError) {
        this.restoreHistory(currentTransition, true);
      } else if (e instanceof NavigationEnd) {
        this.lastSuccessfulId = e.id;
        this.currentPageId = this.browserPageId;
      }
    }
    setBrowserUrl(path, {extras, id}) {
      const {replaceUrl, state} = extras;
      if (this.location.isCurrentPathEqualTo(path) || !!replaceUrl) {
        // replacements do not update the target page
        const currentBrowserPageId = this.browserPageId;
        const newState = {
          ...state,
          ...this.generateNgRouterState(id, currentBrowserPageId),
        };
        this.location.replaceState(path, '', newState);
      } else {
        const newState = {
          ...state,
          ...this.generateNgRouterState(id, this.browserPageId + 1),
        };
        this.location.go(path, '', newState);
      }
    }
    /**
     * Performs the necessary rollback action to restore the browser URL to the
     * state before the transition.
     */
    restoreHistory(navigation, restoringFromCaughtError = false) {
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
    resetUrlToCurrentUrlTree() {
      this.location.replaceState(
        this.urlSerializer.serialize(this.getRawUrlTree()),
        '',
        this.generateNgRouterState(this.lastSuccessfulId, this.currentPageId),
      );
    }
    generateNgRouterState(navigationId, routerPageId) {
      if (this.canceledNavigationResolution === 'computed') {
        return {navigationId, ɵrouterPageId: routerPageId};
      }
      return {navigationId};
    }
  };
  return (HistoryStateManager = _classThis);
})();
export {HistoryStateManager};
//# sourceMappingURL=state_manager.js.map
