/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, InjectFlags, NgModule, Pipe, PlatformRef, ProviderToken, Type} from '@angular/core';

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {TestBedImpl} from './r3_test_bed';
import {TestBedStatic, TestEnvironmentOptions, TestModuleMetadata} from './test_bed_common';

/**
 * @publicApi
 */
export interface TestBed {
  get platform(): PlatformRef;

  get ngModule(): Type<any>|Type<any>[];

  /**
   * Initialize the environment for testing with a compiler factory, a PlatformRef, and an
   * angular module. These are common to every test in the suite.
   *
   * This may only be called once, to set up the common providers for the current test
   * suite on the current platform. If you absolutely need to change the providers,
   * first use `resetTestEnvironment`.
   *
   * Test modules and platforms for individual platforms are available from
   * '@angular/<platform_name>/testing'.
   */
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef,
      options?: TestEnvironmentOptions): void;

  /**
   * Reset the providers for the test injector.
   */
  resetTestEnvironment(): void;

  resetTestingModule(): TestBed;

  configureCompiler(config: {providers?: any[], useJit?: boolean}): void;

  configureTestingModule(moduleDef: TestModuleMetadata): TestBed;

  compileComponents(): Promise<any>;

  inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;

  /** @deprecated from v9.0.0 use TestBed.inject */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  get(token: any, notFoundValue?: any): any;

  execute(tokens: any[], fn: Function, context?: any): any;

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBed;

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): TestBed;

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): TestBed;

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBed;

  overrideTemplate(component: Type<any>, template: string): TestBed;

  /**
   * Overwrites all providers for the given token with the given provider definition.
   */
  overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): TestBed;
  overrideProvider(token: any, provider: {useValue: any;}): TestBed;
  overrideProvider(token: any, provider: {useFactory?: Function, useValue?: any, deps?: any[]}):
      TestBed;

  overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBed;

  createComponent<T>(component: Type<T>): ComponentFixture<T>;
}

/**
 * @description
 * Configures and initializes environment for unit testing and provides methods for
 * creating components and services in unit tests.
 *
 * `TestBed` is the primary api for writing unit tests for Angular applications and libraries.
 *
 * @publicApi
 */
export const TestBed: TestBedStatic = TestBedImpl;


/**
 * Allows injecting dependencies in `beforeEach()` and `it()`. Note: this function
 * (imported from the `@angular/core/testing` package) can **only** be used to inject dependencies
 * in tests. To inject dependencies in your application code, use the [`inject`](api/core/inject)
 * function from the `@angular/core` package instead.
 *
 * Example:
 *
 * ```
 * beforeEach(inject([Dependency, AClass], (dep, object) => {
 *   // some code that uses `dep` and `object`
 *   // ...
 * }));
 *
 * it('...', inject([AClass], (object) => {
 *   object.doSomething();
 *   expect(...);
 * })
 * ```
 *
 * @publicApi
 */
export function inject(tokens: any[], fn: Function): () => any {
  const testBed = TestBedImpl.INSTANCE;
  // Not using an arrow function to preserve context passed from call site
  return function(this: unknown) {
    return testBed.execute(tokens, fn, this);
  };
}

/**
 * @publicApi
 */
export class InjectSetupWrapper {
  constructor(private _moduleDef: () => TestModuleMetadata) {}

  private _addModule() {
    const moduleDef = this._moduleDef();
    if (moduleDef) {
      TestBedImpl.configureTestingModule(moduleDef);
    }
  }

  inject(tokens: any[], fn: Function): () => any {
    const self = this;
    // Not using an arrow function to preserve context passed from call site
    return function(this: unknown) {
      self._addModule();
      return inject(tokens, fn).call(this);
    };
  }
}

/**
 * @publicApi
 */
export function withModule(moduleDef: TestModuleMetadata): InjectSetupWrapper;
export function withModule(moduleDef: TestModuleMetadata, fn: Function): () => any;
export function withModule(moduleDef: TestModuleMetadata, fn?: Function|null): (() => any)|
    InjectSetupWrapper {
  if (fn) {
    // Not using an arrow function to preserve context passed from call site
    return function(this: unknown) {
      const testBed = TestBedImpl.INSTANCE;
      if (moduleDef) {
        testBed.configureTestingModule(moduleDef);
      }
      return fn.apply(this);
    };
  }
  return new InjectSetupWrapper(() => moduleDef);
}
