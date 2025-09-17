/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {inject, Injectable} from '@angular/core';

import {PlatformNavigation} from '@angular/common';
import {HistoryStateManager} from './state_manager';
import {RestoredState} from '../navigation_transition';
import {NavigationTrigger} from '../events';
import {SubscriptionLike} from 'rxjs';

@Injectable({providedIn: 'root'})
/**
 * A `StateManager` that uses the browser's Navigation API to get the state of a `popstate`
 * event.
 *
 * This class is currently an extension of `HistoryStateManager` and is used when the
 * Navigation API is available. It overrides the behavior of listening to `popstate` events
 * to retrieve the state from `navigation.currentEntry` instead of `history.state` since
 * history and navigation states are separate.
 *
 * This implementation is not complete - it does not integrate at all with navigation API other than
 * providing the right state on popstate. It needs to manage the whole lifecycle of the navigation
 * by intercepting the navigation event.
 */
export class NavigationStateManager extends HistoryStateManager {
  private readonly navigation = inject(PlatformNavigation);

  override registerNonRouterCurrentEntryChangeListener(
    listener: (
      url: string,
      state: RestoredState | null | undefined,
      trigger: NavigationTrigger,
    ) => void,
  ): SubscriptionLike {
    return this.location.subscribe((event) => {
      if (event['type'] === 'popstate') {
        // Pass the state from navigation API rather than from history
        const state = this.navigation.currentEntry?.getState() as RestoredState;
        listener(event['url']!, state, 'popstate');
      }
    });
  }
}
