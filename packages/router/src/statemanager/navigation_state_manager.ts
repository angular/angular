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
