/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {
  InjectorProfilerContext,
  setInjectorProfilerContext,
} from '../render3/debug/injector_profiler';

import {getInjectImplementation, setInjectImplementation} from './inject_switch';
import {Injector} from './injector';
import {getCurrentInjector, inject, setCurrentInjector} from './injector_compatibility';
import {assertNotDestroyed, R3Injector} from './r3_injector';

/**
 * Runs the given function in the [context](guide/di/dependency-injection-context) of the given
 * `Injector`.
 *
 * Within the function's stack frame, [`inject`](api/core/inject) can be used to inject dependencies
 * from the given `Injector`. Note that `inject` is only usable synchronously, and cannot be used in
 * any asynchronous callbacks or after any `await` points.
 *
 * @param injector the injector which will satisfy calls to [`inject`](api/core/inject) while `fn`
 *     is executing
 * @param fn the closure to be run in the context of `injector`
 * @returns the return value of the function, if any
 * @publicApi
 */
export function runInInjectionContext<ReturnT>(injector: Injector, fn: () => ReturnT): ReturnT {
  if (injector instanceof R3Injector) {
    assertNotDestroyed(injector);
  }

  let prevInjectorProfilerContext: InjectorProfilerContext;
  if (ngDevMode) {
    prevInjectorProfilerContext = setInjectorProfilerContext({injector, token: null});
  }
  const prevInjector = setCurrentInjector(injector);
  const previousInjectImplementation = setInjectImplementation(undefined);
  try {
    return fn();
  } finally {
    setCurrentInjector(prevInjector);
    ngDevMode && setInjectorProfilerContext(prevInjectorProfilerContext!);
    setInjectImplementation(previousInjectImplementation);
  }
}

/**
 * Binds the given function to an [injection context](guide/di/dependency-injection-context). If no
 * context is passed, the currently active injection context is used.
 *
 * @usageNotes
 *
 * A function that is bound to an [injection context](guide/di/dependency-injection-context) will
 * always be executed in the context it was bound to. This allows you to call
 * [`inject`](api/core/inject) in the function, even if the caller is not inside an injection
 * context.
 *
 * The example blow demonstrates how to wrap a utility function to easily track clicks.
 *
 * ```angular-ts
 * // For tracking we need to know where the user clicked (navbar, content, footer ,etc.). This
 * // information is provided via the current injection token.
 * const CLICK_AREA = new InjectionToken<string>('click-area');
 *
 * // This utility function provides a simplified interface to an imaginary TrackingService. But it
 * // must be called inside an injection context to work. 
 * function trackClick(description: string) {
 *   const clickArea = inject(CLICK_AREA);
 *   const tracker = inject(TrackerService);
 *   tracker.trackClick({
 *     clickArea,
 *     description,
 *   });
 * }
 * 
 * @Component({
 *  selector: 'app-nav-link',
 *  // Clicks on the nav links should be tracked
 *  template: `<a href={{href()}} (click)="trackClick(label())">{{label()}}</a>`
 * })
 * export class NavLinkComponent {
 *   readonly label = input.required<string>();
 *   readonly href = input.required<string>();
 * 
 *   // Binding the trackClick to the injection context during component creation
 *   private readonly trackClick = bindToInjectionContext(trackClick);
 * }
 * 
 * @Component({
 *   standalone: true,
 *   imports: [NavLinkComponent],
 *   template: `
 *    <nav>
 *     <ul>
 *       <li><app-nav-link label="Home" href="/" /><li>
 *       <li><app-nav-link label="User" href="/user" /><li>
 *       <li><app-nav-link label="Heroes" href="/heroes" /><li>
 *     </ul>
 *    </nav>
 *   `,
 *   providers: [
 *     // Provide context for clicks inside this component
 *     { provide: CLICK_AREA, useValue: 'navbar' }
 *   ]
 * })
 * export class NavComponent {}
 * ```
 *
 * `bindToInjectionContext` can also be used for callbacks, that need access to the inject function:
 *
 * ```angular-ts
 * @Component({
 *   // ...
 * })
 * export class TabComponent {
 *   constructor() {
 *     inject(TabManager).registerTab({
 *       onActivate: bindToInjectionContext(() => {
 *         inject(Renderer2).addClass(inject(ElementRef).nativeElement, 'active');
 *       }),
 *       onDeactivate: bindToInjectionContext(() => {
 *         inject(Renderer2).removeClass(inject(ElementRef).nativeElement, 'active');
 *       }),
 *     });
 *   }
 * }
 * ```
 *
 * @param fn The closure to bind to an injection context.
 * @param injector The injector to bind the function to. Defaults to the current injection context.
 * @returns A new function that is bound to an injection context.
 * @publicApi
 */
export function bindToInjectionContext<Fn extends (...args: any[]) => any>(
  fn: Fn,
  injector = inject(Injector),
): Fn {
  return ((...args) => {
    return runInInjectionContext(injector, () => fn(...args));
  }) as Fn;
}

/**
 * Whether the current stack frame is inside an injection context.
 */
export function isInInjectionContext(): boolean {
  return getInjectImplementation() !== undefined || getCurrentInjector() != null;
}
/**
 * Asserts that the current stack frame is within an [injection
 * context](guide/di/dependency-injection-context) and has access to `inject`.
 *
 * @param debugFn a reference to the function making the assertion (used for the error message).
 *
 * @publicApi
 */
export function assertInInjectionContext(debugFn: Function): void {
  // Taking a `Function` instead of a string name here prevents the unminified name of the function
  // from being retained in the bundle regardless of minification.
  if (!isInInjectionContext()) {
    throw new RuntimeError(
      RuntimeErrorCode.MISSING_INJECTION_CONTEXT,
      ngDevMode &&
        debugFn.name +
          '() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`',
    );
  }
}
