/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  Service,
  Type,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
  NavigationExtras,
  Router,
  RouterOutlet,
  ɵafterNextNavigation as afterNextNavigation,
} from '../../index';

@Service()
export class RootFixtureService {
  private fixture?: ComponentFixture<RootCmp>;
  private harness?: RouterTestingHarness;

  createHarness(): RouterTestingHarness {
    if (this.harness) {
      throw new Error('Only one harness should be created per test.');
    }
    this.harness = new RouterTestingHarness(this.getRootFixture());
    return this.harness;
  }

  private getRootFixture(): ComponentFixture<RootCmp> {
    if (this.fixture !== undefined) {
      return this.fixture;
    }
    this.fixture = TestBed.createComponent(RootCmp);
    this.fixture.detectChanges();
    return this.fixture;
  }
}

@Component({
  template: '<router-outlet [routerOutletData]="routerOutletData()"></router-outlet>',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class RootCmp {
  @ViewChild(RouterOutlet) outlet?: RouterOutlet;
  readonly routerOutletData = signal<unknown>(undefined);
}

/**
 * A testing harness for the `Router` to reduce the boilerplate needed to test routes and routed
 * components.
 *
 * @publicApi
 */
export class RouterTestingHarness {
  /**
   * Creates a `RouterTestingHarness` instance.
   *
   * The `RouterTestingHarness` also creates its own root component with a `RouterOutlet` for the
   * purposes of rendering route components.
   *
   * Throws an error if an instance has already been created.
   * Use of this harness also requires `destroyAfterEach: true` in the `ModuleTeardownOptions`
   *
   * @param initialUrl The target of navigation to trigger before returning the harness.
   */
  static async create(initialUrl?: string): Promise<RouterTestingHarness> {
    const harness = TestBed.inject(RootFixtureService).createHarness();
    if (initialUrl !== undefined) {
      await harness.navigateByUrl(initialUrl);
    }
    return harness;
  }

  /**
   * Fixture of the root component of the RouterTestingHarness
   */
  public readonly fixture: ComponentFixture<{routerOutletData: WritableSignal<unknown>}>;

  /** @internal */
  constructor(fixture: ComponentFixture<{routerOutletData: WritableSignal<unknown>}>) {
    this.fixture = fixture;
  }

  /** Instructs the root fixture to run change detection. */
  detectChanges(): void {
    this.fixture.detectChanges();
  }
  /** The `DebugElement` of the `RouterOutlet` component. `null` if the outlet is not activated. */
  get routeDebugElement(): DebugElement | null {
    const outlet = (this.fixture.componentInstance as RootCmp).outlet;
    if (!outlet || !outlet.isActivated) {
      return null;
    }
    return this.fixture.debugElement.query((v) => v.componentInstance === outlet.component);
  }
  /** The native element of the `RouterOutlet` component. `null` if the outlet is not activated. */
  get routeNativeElement(): HTMLElement | null {
    return this.routeDebugElement?.nativeElement ?? null;
  }

  /**
   * Triggers a `Router` navigation and waits for it to complete.
   *
   * The root component with a `RouterOutlet` created for the harness is used to render `Route`
   * components. The root component is reused within the same test in subsequent calls to
   * `navigateForTest`.
   *
   * When testing `Routes` with a guards that reject the navigation, the `RouterOutlet` might not be
   * activated and the `activatedComponent` may be `null`.
   *
   * {@example router/testing/test/router_testing_harness_examples.spec.ts region='Guard'}
   *
   * @param url The target of the navigation. Passed to `Router.navigateByUrl`.
   * @returns The activated component instance of the `RouterOutlet` after navigation completes
   *     (`null` if the outlet does not get activated).
   */
  async navigateByUrl(url: string): Promise<null | {}>;
  /**
   * Triggers a router navigation and waits for it to complete.
   *
   * The root component with a `RouterOutlet` created for the harness is used to render `Route`
   * components.
   *
   * {@example router/testing/test/router_testing_harness_examples.spec.ts region='RoutedComponent'}
   *
   * The root component is reused within the same test in subsequent calls to `navigateByUrl`.
   *
   * This function also makes it easier to test components that depend on `ActivatedRoute` data.
   *
   * {@example router/testing/test/router_testing_harness_examples.spec.ts region='ActivatedRoute'}
   *
   * @param url The target of the navigation. Passed to `Router.navigateByUrl`.
   * @param requiredRoutedComponentType After navigation completes, the required type for the
   *     activated component of the `RouterOutlet`. If the outlet is not activated or a different
   *     component is activated, this function will throw an error.
   * @returns The activated component instance of the `RouterOutlet` after navigation completes.
   */
  async navigateByUrl<T>(url: string, requiredRoutedComponentType: Type<T>): Promise<T>;
  async navigateByUrl<T>(url: string, requiredRoutedComponentType?: Type<T>): Promise<T | null> {
    return this.runNavigation((router) => router.navigateByUrl(url), requiredRoutedComponentType);
  }

  /**
   * Triggers a `Router` navigation using commands and waits for it to complete.
   *
   * @param commands The commands passed to `Router.navigate`.
   * @param extras Navigation extras, such as `queryParams` and `fragment`.
   * @returns The activated component instance of the `RouterOutlet` after navigation completes
   *     (`null` if the outlet does not get activated).
   */
  async navigate(commands: readonly any[], extras?: NavigationExtras): Promise<null | {}>;
  /**
   * Triggers a `Router` navigation using commands and waits for it to complete.
   *
   * @param commands The commands passed to `Router.navigate`.
   * @param requiredRoutedComponentType After navigation completes, the required type for the
   *     activated component of the `RouterOutlet`. If the outlet is not activated or a different
   *     component is activated, this function will throw an error.
   * @returns The activated component instance of the `RouterOutlet` after navigation completes.
   */
  async navigate<T>(commands: readonly any[], requiredRoutedComponentType: Type<T>): Promise<T>;
  /**
   * Triggers a `Router` navigation using commands and waits for it to complete.
   *
   * @param commands The commands passed to `Router.navigate`.
   * @param extras Navigation extras, such as `queryParams` and `fragment`.
   * @param requiredRoutedComponentType After navigation completes, the required type for the
   *     activated component of the `RouterOutlet`. If the outlet is not activated or a different
   *     component is activated, this function will throw an error.
   * @returns The activated component instance of the `RouterOutlet` after navigation completes.
   */
  async navigate<T>(
    commands: readonly any[],
    extras: NavigationExtras,
    requiredRoutedComponentType: Type<T>,
  ): Promise<T>;
  async navigate<T>(
    commands: readonly any[],
    extrasOrComponent?: NavigationExtras | Type<T>,
    requiredRoutedComponentType?: Type<T>,
  ): Promise<T | null> {
    let extras: NavigationExtras | undefined;
    let componentType: Type<T> | undefined;
    if (typeof extrasOrComponent === 'function') {
      if (requiredRoutedComponentType !== undefined) {
        throw new Error('Navigation extras must be provided before the required component type.');
      }
      componentType = extrasOrComponent;
    } else {
      extras = extrasOrComponent;
      componentType = requiredRoutedComponentType;
    }
    return this.runNavigation((router) => router.navigate(commands, extras), componentType);
  }

  /**
   * Shared implementation of `navigateByUrl` and `navigate`.
   *
   * Starts a navigation, waits for it (including any redirects) to complete, runs change
   * detection, and returns the component currently rendered in the root `RouterOutlet`.
   *
   * If a guard cancels the navigation, the outlet keeps its current component, so that component is
   * returned (or checked against `requiredRoutedComponentType`) rather than `null`. This lets tests
   * verify that the user stayed on the current page. `navigate` and `navigateByUrl` behave the same.
   *
   * @param startNavigation Callback that triggers the navigation on the given `Router` (e.g., `router.navigateByUrl('/path')` or `router.navigate(['/path'])`).
   * @param requiredRoutedComponentType If provided, the activated component must be an instance
   *     of this type, otherwise an error is thrown.
   * @returns The component instance rendered in the outlet, or `null` if the outlet has nothing
   *     rendered.
   */
  private async runNavigation<T>(
    startNavigation: (router: Router) => Promise<unknown>,
    requiredRoutedComponentType?: Type<T>,
  ): Promise<T | null> {
    const router = TestBed.inject(Router);
    let resolveFn!: () => void;
    const redirectTrackingPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    afterNextNavigation(router, resolveFn);
    await startNavigation(router);
    await redirectTrackingPromise;
    this.fixture.detectChanges();
    const outlet = (this.fixture.componentInstance as RootCmp).outlet;
    // The outlet is only empty if nothing was ever rendered (e.g. a failed initial navigation).
    // When a guard cancels a later navigation, the previously rendered component stays in place.
    if (outlet && outlet.isActivated && outlet.activatedRoute.component) {
      const activatedComponent = outlet.component;
      if (
        requiredRoutedComponentType !== undefined &&
        !(activatedComponent instanceof requiredRoutedComponentType)
      ) {
        throw new Error(
          `Unexpected routed component type. Expected ${requiredRoutedComponentType.name} but got ${activatedComponent.constructor.name}`,
        );
      }
      return activatedComponent as T;
    } else {
      if (requiredRoutedComponentType !== undefined) {
        throw new Error(
          `Unexpected routed component type. Expected ${requiredRoutedComponentType.name} but the navigation did not activate any component.`,
        );
      }
      return null;
    }
  }
}
