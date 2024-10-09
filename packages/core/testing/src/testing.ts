/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the core/testing package.
 */

export * from './async';
export {ComponentFixture} from './component_fixture';
export {resetFakeAsyncZone, discardPeriodicTasks, fakeAsync, flush, flushMicrotasks, tick} from './fake_async';
export {TestBed, getTestBed, TestBedStatic, inject, InjectSetupWrapper, withModule} from './test_bed';
export {TestComponentRenderer, ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, TestModuleMetadata, TestEnvironmentOptions, ModuleTeardownOptions} from './test_bed_common';
export * from './test_hooks';
export * from './metadata_override';
export {MetadataOverrider as ɵMetadataOverrider} from './metadata_overrider';
export {ɵDeferBlockBehavior as DeferBlockBehavior, ɵDeferBlockState as DeferBlockState} from '@angular/core';
export {DeferBlockFixture} from './defer';
