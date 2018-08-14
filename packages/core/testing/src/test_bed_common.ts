/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, InjectionToken, NgModule, Pipe, PlatformRef, SchemaMetadata, Type} from '@angular/core';

import {ComponentFixture} from './component_fixture';
import {MetadataOverride} from './metadata_override';
import {TestBed} from './test_bed';

/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @experimental
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string) {}
}

/**
 * @experimental
 */
export const ComponentFixtureAutoDetect =
    new InjectionToken<boolean[]>('ComponentFixtureAutoDetect');

/**
 * @experimental
 */
export const ComponentFixtureNoNgZone = new InjectionToken<boolean[]>('ComponentFixtureNoNgZone');

/**
 * @experimental
 */
export type TestModuleMetadata = {
  providers?: any[],
  declarations?: any[],
  imports?: any[],
  schemas?: Array<SchemaMetadata|any[]>,
  aotSummaries?: () => any[],
};

/**
 * Static methods implemented by the `TestBedViewEngine` and `TestBedRender3`
 */
export interface TestBedConstructor {
  initTestEnvironment(
      ngModule: Type<any>|Type<any>[], platform: PlatformRef, aotSummaries?: () => any[]): TestBed;

  /**
   * Reset the providers for the test injector.
   *
   * @experimental
   */
  resetTestEnvironment(): void;

  resetTestingModule(): TestBedConstructor;

  /**
   * Allows overriding default compiler providers and settings
   * which are defined in test_injector.js
   */
  configureCompiler(config: {providers?: any[]; useJit?: boolean;}): TestBedConstructor;

  /**
   * Allows overriding default providers, directives, pipes, modules of the test injector,
   * which are defined in test_injector.js
   */
  configureTestingModule(moduleDef: TestModuleMetadata): TestBedConstructor;

  /**
   * Compile components with a `templateUrl` for the test's NgModule.
   * It is necessary to call this function
   * as fetching urls is asynchronous.
   */
  compileComponents(): Promise<any>;

  overrideModule(ngModule: Type<any>, override: MetadataOverride<NgModule>): TestBedConstructor;

  overrideComponent(component: Type<any>, override: MetadataOverride<Component>):
      TestBedConstructor;

  overrideDirective(directive: Type<any>, override: MetadataOverride<Directive>):
      TestBedConstructor;

  overridePipe(pipe: Type<any>, override: MetadataOverride<Pipe>): TestBedConstructor;

  overrideTemplate(component: Type<any>, template: string): TestBedConstructor;

  /**
   * Overrides the template of the given component, compiling the template
   * in the context of the TestingModule.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  overrideTemplateUsingTestingModule(component: Type<any>, template: string): TestBedConstructor;

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * Note: This works for JIT and AOTed components as well.
   */
  overrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): TestBedConstructor;
  overrideProvider(token: any, provider: {useValue: any;}): TestBedConstructor;
  overrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): TestBedConstructor;

  /**
   * Overwrites all providers for the given token with the given provider definition.
   *
   * @deprecated as it makes all NgModules lazy. Introduced only for migrating off of it.
   */
  deprecatedOverrideProvider(token: any, provider: {
    useFactory: Function,
    deps: any[],
  }): void;
  deprecatedOverrideProvider(token: any, provider: {useValue: any;}): void;
  deprecatedOverrideProvider(token: any, provider: {
    useFactory?: Function,
    useValue?: any,
    deps?: any[],
  }): TestBedConstructor;

  get(token: any, notFoundValue?: any): any;

  createComponent<T>(component: Type<T>): ComponentFixture<T>;
}
