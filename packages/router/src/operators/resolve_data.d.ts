/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '@angular/core';
import { MonoTypeOperatorFunction } from 'rxjs';
import type { NavigationTransition } from '../navigation_transition';
export declare function resolveData(paramsInheritanceStrategy: 'emptyOnly' | 'always', injector: EnvironmentInjector): MonoTypeOperatorFunction<NavigationTransition>;
