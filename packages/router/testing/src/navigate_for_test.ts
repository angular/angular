/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injectable, Type, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Router, RouterOutlet} from '@angular/router';

@Injectable({providedIn: 'root'})
export class RootFixtureService {
  private fixture?: ComponentFixture<RootCmp>;

  getRootFixture(): ComponentFixture<RootCmp> {
    if (this.fixture !== undefined) {
      return this.fixture;
    }
    this.fixture = TestBed.createComponent(RootCmp);
    this.fixture.detectChanges();
    return this.fixture;
  }
}

@Component({
  standalone: true,
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],
})
export class RootCmp {
  @ViewChild(RouterOutlet) outlet!: RouterOutlet;
}

/**
 * Creates a component with a `RouterOutlet` and triggers a `Router` navigation.
 *
 * The root component with a `RouterOutlet` is used to render `Route` components.
 * The root component is reused within the same test in subsequent calls to `navigateForTest`.
 *
 * When testing `Routes` with a guards that reject the navigation, the `RouterOutlet` might not be
 * activated and the `activatedComponent` may be `null`.
 *
 * {@example router/testing/test/navigate_for_test_examples.spec.ts region='Guard'}
 *
 * @param url The target of the navigation. Passed to `Router.navigateByUrl`.
 * @returns The root `ComponentFixture` containing the `RouterOutlet` and the activated component
 *     instance of the `RouterOutlet` after navigation completes (`null` if the outlet does not get
 *     activated).
 */
export async function navigateForTest(url: string):
    Promise<{rootFixture: ComponentFixture<{outlet: RouterOutlet}>, activatedComponent: null | {}}>;
/**
 * Creates a component with a `RouterOutlet` and triggers a `Router` navigation.
 *
 * The root component with a `RouterOutlet` is used to render `Route` components.
 *
 * {@example router/testing/test/navigate_for_test_examples.spec.ts region='RoutedComponent'}
 *
 * The root component is reused within the same test in subsequent calls to `navigateForTest`.
 *
 * This function also makes it easier to test components that depend on `ActivatedRoute` data.
 *
 * {@example router/testing/test/navigate_for_test_examples.spec.ts region='ActivatedRoute'}
 *
 * @param url The target of the navigation. Passed to `Router.navigateByUrl`.
 * @param requiredRoutedComponentType After navigation completes, the required type for the
 *     activated component of the `RouterOutlet`. If the outlet is not activated or a different
 *     component is activated, this function will throw an error.
 * @returns The root `ComponentFixture` containing the `RouterOutlet` and the activated component
 *     instance of the `RouterOutlet` after navigation completes.
 */
export async function navigateForTest<T>(url: string, requiredRoutedComponentType: Type<T>):
    Promise<{rootFixture: ComponentFixture<{outlet: RouterOutlet}>, activatedComponent: T}>;
export async function navigateForTest<T>(url: string, requiredRoutedComponentType?: Type<T>):
    Promise<{rootFixture: ComponentFixture<{outlet: RouterOutlet}>, activatedComponent: T | null}> {
  const rootFixture = TestBed.inject(RootFixtureService).getRootFixture();
  const router = TestBed.inject(Router);
  await router.navigateByUrl(url);
  rootFixture.detectChanges();
  const outlet = rootFixture.componentInstance.outlet;
  // The outlet might not be activated if the user is testing a navigation for a guard that rejects
  if (outlet && outlet.isActivated && outlet.activatedRoute.component) {
    const activatedComponent = outlet.component;
    if (requiredRoutedComponentType !== undefined &&
        !(activatedComponent instanceof requiredRoutedComponentType)) {
      throw new Error(`Unexpected routed component type. Expected ${
          requiredRoutedComponentType.name} but got ${activatedComponent.constructor.name}`);
    }
    return {rootFixture, activatedComponent: activatedComponent as T};
  } else {
    return {rootFixture, activatedComponent: null};
  }
}
