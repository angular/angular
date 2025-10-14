/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '@angular/core';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';
import { Event } from '../events';
import { GuardResult, Route } from '../models';
import type { NavigationTransition } from '../navigation_transition';
import { UrlSegment, UrlSerializer } from '../url_tree';
export declare function checkGuards(injector: EnvironmentInjector, forwardEvent?: (evt: Event) => void): MonoTypeOperatorFunction<NavigationTransition>;
export declare function runCanLoadGuards(injector: EnvironmentInjector, route: Route, segments: UrlSegment[], urlSerializer: UrlSerializer, abortSignal?: AbortSignal): Observable<boolean>;
export declare function runCanMatchGuards(injector: EnvironmentInjector, route: Route, segments: UrlSegment[], urlSerializer: UrlSerializer, abortSignal?: AbortSignal): Observable<GuardResult>;
