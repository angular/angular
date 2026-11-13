/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  EnvironmentInjector,
  ErrorDetails,
  runInInjectionContext,
  untracked,
  Type,
} from '@angular/core';

import type {RouterOutlet} from './directives/router_outlet';
import {RedirectCommand} from './models';
import type {ErrorBoundaryOptions} from './provide_router';
import type {Router} from './router';
import type {RouterErrorBoundaryHandler} from './router_error_boundary_feature';
import type {ChildrenOutletContexts} from './router_outlet_context';
import type {ActivatedRoute} from './router_state';

function unwrapRedirectCommand(error: unknown): RedirectCommand | null {
  if (error instanceof RedirectCommand) {
    return error;
  }
  if (error && typeof error === 'object' && 'cause' in error) {
    return unwrapRedirectCommand((error as {cause: unknown}).cause);
  }
  return null;
}

/**
 * Dispatches a navigation if the given error is (or wraps) a `RedirectCommand`.
 *
 * @returns Whether the error was a redirect.
 */
function triggerRedirectIfCommand(error: unknown, router: Router): boolean {
  const redirect = unwrapRedirectCommand(error);
  if (redirect === null) {
    return false;
  }
  router.navigateByUrl(redirect.redirectTo, redirect.navigationBehaviorOptions);
  return true;
}

/**
 * Implementation of the router error boundary behavior. This is only included in the bundle when
 * the application opts in by calling `withErrorBoundaries`.
 */
export class ErrorBoundaryHandler implements RouterErrorBoundaryHandler {
  constructor(
    private readonly router: Router,
    private readonly rootInjector: EnvironmentInjector,
    private readonly options: ErrorBoundaryOptions,
  ) {}

  handleError(
    error: Error,
    details: ErrorDetails | undefined,
    outlet: RouterOutlet,
    activatedRoute: ActivatedRoute,
    environmentInjector: EnvironmentInjector,
    childContexts: ChildrenOutletContexts,
  ): void {
    untracked(() => {
      const isRedirect = triggerRedirectIfCommand(error, this.router);

      const errorComponent =
        activatedRoute.snapshot.routeConfig?.errorComponent ?? this.options.defaultErrorComponent;
      if (!errorComponent && !isRedirect) {
        throw error;
      }

      const globalOnError = this.options.onError;
      if (globalOnError) {
        // The global handler is configured at the root of the application, so it runs in the root
        // injection context.
        runInInjectionContext(this.rootInjector, () => globalOnError(error, details));
      }

      if (!errorComponent) {
        // The redirect navigation replaces the current view, so there is nothing to render and no
        // reason to keep propagating the error.
        return;
      }

      outlet.destroyActivatedComponent();
      outlet.isErrorComponentActive = true;
      const componentRef = outlet.activateComponent(
        errorComponent,
        activatedRoute,
        environmentInjector,
        childContexts,
        (errorFromErrorComponent: Error) => {
          // Errors thrown by the error component itself are not caught again to avoid infinite loops.
          throw errorFromErrorComponent;
        },
      );

      try {
        componentRef.setInput('error', error);
      } catch {
        // The error component does not declare an `error` input.
      }
    });
  }
}
