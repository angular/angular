/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injectable, inject, DestroyRef} from '@angular/core';
import {PlatformNavigation} from '../navigation/platform_navigation';
import {Location} from './location';
import {LocationStrategy} from './location_strategy';
import {normalizeQueryParams} from './util';

/**
 * A `Location` implementation that uses the browser's `Navigation` API.
 *
 * This class is an adapter that maps the methods of the `Location` service to the newer
 * browser `Navigation` API. It is used when the `Navigation` API is available.
 *
 * This adapter uses `navigation.navigate()` for `go` and `replaceState` to ensure a single source
 * of truth for the navigation state. The Navigation API's state and `history.state` are separate.
 *
 * Note that `navigation.back()` and `navigation.forward()` can differ from the traditional
 * `history` API in how they traverse the joint session history.
 *
 * @see {@link Location}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
 */
@Injectable()
export class NavigationAdapterForLocation extends Location {
  private readonly navigation = inject(PlatformNavigation);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super(inject(LocationStrategy));

    this.registerNavigationListeners();
  }

  private registerNavigationListeners() {
    const currentEntryChangeListener = () => {
      this._notifyUrlChangeListeners(this.path(true), this.getState());
    };
    this.navigation.addEventListener('currententrychange', currentEntryChangeListener);
    this.destroyRef.onDestroy(() => {
      this.navigation.removeEventListener('currententrychange', currentEntryChangeListener);
    });
  }

  override getState(): unknown {
    return this.navigation.currentEntry?.getState();
  }

  override replaceState(path: string, query: string = '', state: any = null): void {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    // Use navigation API consistently for navigations. The "navigation API state"
    // field has no interaction with the existing "serialized state" field, which is what backs history.state
    this.navigation.navigate(url, {state, history: 'replace'});
  }

  override go(path: string, query: string = '', state: any = null): void {
    const url = this.prepareExternalUrl(path + normalizeQueryParams(query));
    // Use navigation API consistently for navigations. The "navigation API state"
    // field has no interaction with the existing "serialized state" field, which is what backs history.state
    this.navigation.navigate(url, {state, history: 'push'});
  }

  // Navigation.back/forward differs from history in how it traverses the joint session history
  // https://github.com/WICG/navigation-api?tab=readme-ov-file#correspondence-with-the-joint-session-history
  override back() {
    this.navigation.back();
  }

  override forward() {
    this.navigation.forward();
  }

  override onUrlChange(fn: (url: string, state: unknown) => void): VoidFunction {
    this._urlChangeListeners.push(fn);

    return () => {
      const fnIndex = this._urlChangeListeners.indexOf(fn);
      this._urlChangeListeners.splice(fnIndex, 1);
    };
  }
}
