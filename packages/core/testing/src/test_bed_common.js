/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken, ɵDeferBlockBehavior as DeferBlockBehavior} from '../../src/core';
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
  insertRootElement(rootElementId, tagName) {}
  removeAllRootElements() {}
}
/**
 * @publicApi
 */
export const ComponentFixtureAutoDetect = new InjectionToken('ComponentFixtureAutoDetect');
/**
 * @publicApi
 */
export const ComponentFixtureNoNgZone = new InjectionToken('ComponentFixtureNoNgZone');
//# sourceMappingURL=test_bed_common.js.map
