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

export * from './async.js';
export * from './component_fixture.js';
export * from './fake_async.js';
export {TestBed, getTestBed, inject, InjectSetupWrapper, withModule} from './test_bed.js';
export {TestComponentRenderer, ComponentFixtureAutoDetect, ComponentFixtureNoNgZone, TestModuleMetadata, TestEnvironmentOptions, ModuleTeardownOptions, TestBedStatic} from './test_bed_common.js';
export * from './test_hooks.js';
export * from './metadata_override.js';
export {MetadataOverrider as ɵMetadataOverrider} from './metadata_overrider.js';
