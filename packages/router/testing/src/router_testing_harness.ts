/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  DebugElement,
  Injectable,
  Type,
  ViewChild,
  WritableSignal,
  signal,
} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, RouterOutlet, ɵafterNextNavigation as afterNextNavigation} from '../../index';

@Injectable({providedIn: 'root'})
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
    const router = TestBed.inject(Router);
    let resolveFn!: () => void;
    const redirectTrackingPromise = new Promise<void>((resolve) => {
      resolveFn = resolve;
    });
    afterNextNavigation(TestBed.inject(Router), resolveFn);
    await router.navigateByUrl(url);
    await redirectTrackingPromise;
    this.fixture.detectChanges();
    const outlet = (this.fixture.componentInstance as RootCmp).outlet;
    // The outlet might not be activated if the user is testing a navigation for a guard that
    // rejects
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
