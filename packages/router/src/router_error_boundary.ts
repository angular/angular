/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runInInjectionContext} from '@angular/core';
import type {EnvironmentInjector, ErrorDetails} from '@angular/core';

import type {RouterOutlet} from './directives/router_outlet';
import {RedirectCommand} from './models';
import type {ErrorBoundaryOptions} from './provide_router';
import type {Router} from './router';
import type {ChildrenOutletContexts} from './router_outlet_context';
import type {RouterErrorBoundaryHandler} from './router_error_boundary_feature';
import type {ActivatedRoute} from './router_state';

const REDIRECT_DISPATCHED: unique symbol = /* @__PURE__ */ Symbol(
  typeof ngDevMode === 'undefined' || ngDevMode ? '__redirectDispatched' : '',
);

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
 * @returns Whether the error was a redirect. A redirect is only dispatched once, even if the same
 *     error is seen by several outlets while bubbling up.
 */
function triggerRedirectIfCommand(error: unknown, router: Router): boolean {
  const redirect = unwrapRedirectCommand(error);
  if (redirect === null) {
    return false;
  }
  if (!(redirect as any)[REDIRECT_DISPATCHED]) {
    (redirect as any)[REDIRECT_DISPATCHED] = true;
    router.navigateByUrl(redirect.redirectTo, redirect.navigationBehaviorOptions);
  }
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
    const isRedirect = triggerRedirectIfCommand(error, this.router);

    const globalOnError = this.options.onError;
    if (globalOnError) {
      // The global handler is configured at the root of the application, so it runs in the root
      // injection context.
      runInInjectionContext(this.rootInjector, () => globalOnError(error, details));
    }

    const routeConfig = activatedRoute.snapshot.routeConfig;

    const errorComponent = routeConfig?.errorComponent ?? this.options.defaultErrorComponent;
    if (!errorComponent) {
      if (isRedirect) {
        // The redirect navigation replaces the current view, so there is nothing to render and no
        // reason to keep propagating the error.
        return;
      }
      throw error;
    }

    outlet.destroyActivatedComponent();
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
    outlet.isErrorComponentActive = true;

    try {
      componentRef.setInput('error', error);
    } catch {
      // The error component does not declare an `error` input.
    }
  }
}
