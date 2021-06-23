/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, InjectFlags, InjectionToken, NgModule, Pipe, PlatformRef, ProviderToken, SchemaMetadata, Type} from '@angular/core';

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {TestBed} from './test_bed';

/**
 * Whether test modules should be torn down by default.
 * Currently disabled for backwards-compatibility reasons.
 */
export const TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT = false;

/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @publicApi
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string) {}
  removeAllRootElements?() {}
}

/**
 * @publicApi
 */
export const ComponentFixtureAutoDetect =
    new InjectionToken<boolean[]>('ComponentFixtureAutoDetect');

/**
 * @publicApi
 */
export const ComponentFixtureNoNgZone = new InjectionToken<boolean[]>('ComponentFixtureNoNgZone');

/**
 * @publicApi
 */
export type TestModuleMetadata = {
  providers?: any[],
  declarations?: any[],
  imports?: any[],
  schemas?: Array<SchemaMetadata|any[]>,
  aotSummaries?: () => any[],
  teardown?: ModuleTeardownOptions;
};

/**
 * @publicApi
 */
export interface TestEnvironmentOptions {
  aotSummaries?: () => any[];
  teardown?: ModuleTeardownOptions;
}

/**
 * Object used to configure the test module teardown behavior in `TestBed`.
 * @publicApi
 */
export interface ModuleTeardownOptions {
  /** Whether the test module should be destroyed after every test. */
  destroyAfterEach: boolean;

  /** Whether errors during test module destruction should be re-thrown. Defaults to `true`. */
  rethrowErrors?: boolean;
}

/**
 * Static methods implemented by the `TestBedViewEngine` and `TestBedRender3`
 *
 * @publicApi
 */
export interface TestBedStatic {
  new(...args: any[]): TestBed;

  initTestEnvironment(ngModule: Type<any>|Type<any>[], platform: PlatformRef, options?: {
    teardown?: ModuleTeardownOptions
  }): TestBed;
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed;

  /**
   * Reset the providers for the test injector.
   */
  resetTestEnvironment(): void;

  resetTestingModule(): TestBedStatic;

  /**
   * Allows overriding default compiler providers and settings
   * which are defined in test_injector.js
   */
  configureCompiler(config: {providers?: any[]; useJit?: boolean;}): TestBedStatic;

  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  configureTestingModule(moduleDef: TestModuleMetadata): TestBedStatic;

  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  compileComponents(): Promise<any>;

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBedStatic;

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>): TestBedStatic;

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>): TestBedStatic;

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBedStatic;

  overrideTemplate(component: Type<any>, template: string): TestBedStatic;

  /**
   * Overrides the template of the given component, compiling the template
   * in the context of the TestingModule.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBedStatic;

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): TestBedStatic;
  overrideProvider(token: any, provider: {useValue: any;}): TestBedStatic;
  overrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): TestBedStatic;

  inject<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): T;
  inject<T>(token: ProviderToken<T>, notFoundValue: null, flags?: InjectFlags): T|null;

  /** @deprecated from v9.0.0 use TestBed.inject */
  get<T>(token: ProviderToken<T>, notFoundValue?: T, flags?: InjectFlags): any;
  /** @deprecated from v9.0.0 use TestBed.inject */
  get(token: any, notFoundValue?: any): any;

  createComponent<T>(component: Type<T>): ComponentFixture<T>;
}
