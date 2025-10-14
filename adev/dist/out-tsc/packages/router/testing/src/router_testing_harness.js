/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {Component, Injectable, ViewChild, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Router, RouterOutlet, ɵafterNextNavigation as afterNextNavigation} from '../../index';
let RootFixtureService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RootFixtureService = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RootFixtureService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    fixture;
    harness;
    createHarness() {
      if (this.harness) {
        throw new Error('Only one harness should be created per test.');
      }
      this.harness = new RouterTestingHarness(this.getRootFixture());
      return this.harness;
    }
    getRootFixture() {
      if (this.fixture !== undefined) {
        return this.fixture;
      }
      this.fixture = TestBed.createComponent(RootCmp);
      this.fixture.detectChanges();
      return this.fixture;
    }
  };
  return (RootFixtureService = _classThis);
})();
export {RootFixtureService};
let RootCmp = (() => {
  let _classDecorators = [
    Component({
      template: '<router-outlet [routerOutletData]="routerOutletData()"></router-outlet>',
      imports: [RouterOutlet],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _outlet_decorators;
  let _outlet_initializers = [];
  let _outlet_extraInitializers = [];
  var RootCmp = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _outlet_decorators = [ViewChild(RouterOutlet)];
      __esDecorate(
        null,
        null,
        _outlet_decorators,
        {
          kind: 'field',
          name: 'outlet',
          static: false,
          private: false,
          access: {
            has: (obj) => 'outlet' in obj,
            get: (obj) => obj.outlet,
            set: (obj, value) => {
              obj.outlet = value;
            },
          },
          metadata: _metadata,
        },
        _outlet_initializers,
        _outlet_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      RootCmp = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    outlet = __runInitializers(this, _outlet_initializers, void 0);
    routerOutletData = (__runInitializers(this, _outlet_extraInitializers), signal(undefined));
  };
  return (RootCmp = _classThis);
})();
export {RootCmp};
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
  static async create(initialUrl) {
    const harness = TestBed.inject(RootFixtureService).createHarness();
    if (initialUrl !== undefined) {
      await harness.navigateByUrl(initialUrl);
    }
    return harness;
  }
  /**
   * Fixture of the root component of the RouterTestingHarness
   */
  fixture;
  /** @internal */
  constructor(fixture) {
    this.fixture = fixture;
  }
  /** Instructs the root fixture to run change detection. */
  detectChanges() {
    this.fixture.detectChanges();
  }
  /** The `DebugElement` of the `RouterOutlet` component. `null` if the outlet is not activated. */
  get routeDebugElement() {
    const outlet = this.fixture.componentInstance.outlet;
    if (!outlet || !outlet.isActivated) {
      return null;
    }
    return this.fixture.debugElement.query((v) => v.componentInstance === outlet.component);
  }
  /** The native element of the `RouterOutlet` component. `null` if the outlet is not activated. */
  get routeNativeElement() {
    return this.routeDebugElement?.nativeElement ?? null;
  }
  async navigateByUrl(url, requiredRoutedComponentType) {
    const router = TestBed.inject(Router);
    let resolveFn;
    const redirectTrackingPromise = new Promise((resolve) => {
      resolveFn = resolve;
    });
    afterNextNavigation(TestBed.inject(Router), resolveFn);
    await router.navigateByUrl(url);
    await redirectTrackingPromise;
    this.fixture.detectChanges();
    const outlet = this.fixture.componentInstance.outlet;
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
      return activatedComponent;
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
//# sourceMappingURL=router_testing_harness.js.map
