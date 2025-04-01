/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Injectable,
  ɵNavigateEvent as NavigateEvent,
  ɵNavigation as Navigation,
  ɵNavigationCurrentEntryChangeEvent as NavigationCurrentEntryChangeEvent,
  ɵNavigationHistoryEntry as NavigationHistoryEntry,
  ɵNavigationNavigateOptions as NavigationNavigateOptions,
  ɵNavigationOptions as NavigationOptions,
  ɵNavigationReloadOptions as NavigationReloadOptions,
  ɵNavigationResult as NavigationResult,
  ɵNavigationTransition as NavigationTransition,
  ɵNavigationUpdateCurrentEntryOptions as NavigationUpdateCurrentEntryOptions,
} from '@angular/core';

/**
 * This class wraps the platform Navigation API which allows server-specific and test
 * implementations.
 */
@Injectable({providedIn: 'platform', useFactory: () => (window as any).navigation})
export abstract class PlatformNavigation implements Navigation {
  abstract entries(): NavigationHistoryEntry[];
  abstract currentEntry: NavigationHistoryEntry | null;
  abstract updateCurrentEntry(options: NavigationUpdateCurrentEntryOptions): void;
  abstract transition: NavigationTransition | null;
  abstract canGoBack: boolean;
  abstract canGoForward: boolean;
  abstract navigate(url: string, options?: NavigationNavigateOptions | undefined): NavigationResult;
  abstract reload(options?: NavigationReloadOptions | undefined): NavigationResult;
  abstract traverseTo(key: string, options?: NavigationOptions | undefined): NavigationResult;
  abstract back(options?: NavigationOptions | undefined): NavigationResult;
  abstract forward(options?: NavigationOptions | undefined): NavigationResult;
  abstract onnavigate: ((this: Navigation, ev: NavigateEvent) => any) | null;
  abstract onnavigatesuccess: ((this: Navigation, ev: Event) => any) | null;
  abstract onnavigateerror: ((this: Navigation, ev: ErrorEvent) => any) | null;
  abstract oncurrententrychange:
    | ((this: Navigation, ev: NavigationCurrentEntryChangeEvent) => any)
    | null;
  abstract addEventListener(type: unknown, listener: unknown, options?: unknown): void;
  abstract removeEventListener(type: unknown, listener: unknown, options?: unknown): void;
  abstract dispatchEvent(event: Event): boolean;
}
