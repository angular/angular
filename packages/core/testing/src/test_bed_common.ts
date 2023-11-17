/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, SchemaMetadata, ɵDeferBlockBehavior as DeferBlockBehavior} from '@angular/core';


/** Whether test modules should be torn down by default. */
export const TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT = true;

/** Whether unknown elements in templates should throw by default. */
export const THROW_ON_UNKNOWN_ELEMENTS_DEFAULT = false;

/** Whether unknown properties in templates should throw by default. */
export const THROW_ON_UNKNOWN_PROPERTIES_DEFAULT = false;

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
export const ComponentFixtureAutoDetect = new InjectionToken<boolean>('ComponentFixtureAutoDetect');

/**
 * Providing this option will opt-in to legacy stableness behavior for `ComponentFixture`.
 *
 * While almost the same as ApplicationRef.isStable, this option is slightly different in
 * subtle ways. Primarily, it will synchronously update the `isStable` value even before the
 * `whenStable` Promise resolves. In addition, it sometimes ignores additional microtasks that
 * should prevent stableness until they are resolved.
 *
 * @usageNotes
 *
 * Enable this option on a per-test basis by providing the token in `configureTestingModule`:
 *
 * ```
 *  TestBed.configureTestingModule(
 *        {providers: [{provide: UseLegacyFixtureStable, useValue: true}]});
 * ```
 *
 * @publicApi
 *
 * @deprecated - Will be removed in v18. Use this option to opt-out of the correct fixture
 *     stableness behavior while fixing tests that might have broken when fixture stableness was
 *     updated to match the behavior of ApplicationRef.
 */
export const UseLegacyFixtureStable = new InjectionToken<boolean>('UseLegacyFixtureStable');

/**
 * @publicApi
 */
export const ComponentFixtureNoNgZone = new InjectionToken<boolean>('ComponentFixtureNoNgZone');

/**
 * @publicApi
 */
export interface TestModuleMetadata {
  providers?: any[];
  declarations?: any[];
  imports?: any[];
  schemas?: Array<SchemaMetadata|any[]>;
  teardown?: ModuleTeardownOptions;
  /**
   * Whether NG0304 runtime errors should be thrown when unknown elements are present in component's
   * template. Defaults to `false`, where the error is simply logged. If set to `true`, the error is
   * thrown.
   * @see [NG8001](/errors/NG8001) for the description of the problem and how to fix it
   */
  errorOnUnknownElements?: boolean;
  /**
   * Whether errors should be thrown when unknown properties are present in component's template.
   * Defaults to `false`, where the error is simply logged.
   * If set to `true`, the error is thrown.
   * @see [NG8002](/errors/NG8002) for the description of the error and how to fix it
   */
  errorOnUnknownProperties?: boolean;

  /**
   * Whether defer blocks should behave with manual triggering or play through normally.
   * Defaults to `manual`.
   */
  deferBlockBehavior?: DeferBlockBehavior;
}

/**
 * @publicApi
 */
export interface TestEnvironmentOptions {
  /**
   * Configures the test module teardown behavior in `TestBed`.
   */
  teardown?: ModuleTeardownOptions;
  /**
   * Whether errors should be thrown when unknown elements are present in component's template.
   * Defaults to `false`, where the error is simply logged.
   * If set to `true`, the error is thrown.
   * @see [NG8001](/errors/NG8001) for the description of the error and how to fix it
   */
  errorOnUnknownElements?: boolean;
  /**
   * Whether errors should be thrown when unknown properties are present in component's template.
   * Defaults to `false`, where the error is simply logged.
   * If set to `true`, the error is thrown.
   * @see [NG8002](/errors/NG8002) for the description of the error and how to fix it
   */
  errorOnUnknownProperties?: boolean;
}

/**
 * Configures the test module teardown behavior in `TestBed`.
 * @publicApi
 */
export interface ModuleTeardownOptions {
  /** Whether the test module should be destroyed after every test. Defaults to `true`. */
  destroyAfterEach: boolean;

  /** Whether errors during test module destruction should be re-thrown. Defaults to `true`. */
  rethrowErrors?: boolean;
}
