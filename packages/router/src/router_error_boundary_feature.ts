/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '@angular/core';
import type {EnvironmentInjector, ErrorDetails} from '@angular/core';

import type {RouterOutlet} from './directives/router_outlet';
import type {ChildrenOutletContexts} from './router_outlet_context';
import type {ActivatedRoute} from './router_state';

/**
 * The contract between the `RouterOutlet` and the error boundary feature.
 *
 * The implementation lives in `./router_error_boundary` and is only provided when the application
 * opts in with `withErrorBoundaries`. Everything except this token is therefore tree-shaken away
 * for applications that do not use the feature.
 */
export interface RouterErrorBoundaryHandler {
  handleError(
    error: Error,
    details: ErrorDetails | undefined,
    outlet: RouterOutlet,
    activatedRoute: ActivatedRoute,
    environmentInjector: EnvironmentInjector,
    childContexts: ChildrenOutletContexts,
  ): void;
}

export const ROUTER_ERROR_BOUNDARY_HANDLER = new InjectionToken<RouterErrorBoundaryHandler>(
  typeof ngDevMode === 'undefined' || ngDevMode ? 'Router Error Boundary Handler' : '',
);
