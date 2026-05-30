/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  InjectionToken,
  SchemaMetadata,
  ɵDeferBlockBehavior as DeferBlockBehavior,
} from '../../src/core';

/** Whether test modules should be torn down by default. */
export const TEARDOWN_TESTING_MODULE_ON_DESTROY_DEFAULT = true;

/** Whether unknown elements in templates should throw by default. */
export const THROW_ON_UNKNOWN_ELEMENTS_DEFAULT = false;

/** Whether unknown properties in templates should throw by default. */
export const THROW_ON_UNKNOWN_PROPERTIES_DEFAULT = false;

/** Whether defer blocks should use manual triggering or play through normally. */
export const DEFER_BLOCK_DEFAULT_BEHAVIOR = DeferBlockBehavior.Playthrough;

/** Whether animations are enabled or disabled. */
export const ANIMATIONS_ENABLED_DEFAULT = false;

/**
 * An abstract class for inserting the root test component element in a platform independent way.
 *
 * @publicApi
 */
export class TestComponentRenderer {
  insertRootElement(rootElementId: string, tagName?: string) {}
  removeAllRootElements?() {}
}

/**
 * @publicApi
 */
export const ComponentFixtureAutoDetect = new InjectionToken<boolean>('ComponentFixtureAutoDetect');

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
  schemas?: Array<SchemaMetadata | any[]>;
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
   * Whether errors that happen during application change detection should be rethrown.
   *
   * When `true`, errors that are caught during application change detection will
   * be reported to the `ErrorHandler` and rethrown to prevent them from going
   * unnoticed in tests.
   *
   * When `false`, errors are only forwarded to the `ErrorHandler`, which by default
   * simply logs them to the console.
   *
   * Defaults to `true`.
   */
  rethrowApplicationErrors?: boolean;

  /**
   * Whether defer blocks should behave with manual triggering or play through normally.
   * Defaults to `manual`.
   */
  deferBlockBehavior?: DeferBlockBehavior;

  /**
   * Whether to infer the tag name of test components from their selectors.
   * Otherwise `div` will be used as the tag name for test components.
   */
  inferTagName?: boolean;

  /**
   * Whether animate.enter / animate.leave should trigger as normal or be disabled.
   * Defaults to `false`.
   */
  animationsEnabled?: boolean;
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
