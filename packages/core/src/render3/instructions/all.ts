/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/*
 * This file re-exports all symbols contained in this directory.
 *
 * Why is this file not `index.ts`?
 *
 * There seems to be an inconsistent path resolution of an `index.ts` file
 * when only the parent directory is referenced. This could be due to the
 * node module resolution configuration differing from rollup and/or typescript.
 *
 * With commit
 * https://github.com/angular/angular/commit/d5e3f2c64bd13ce83e7c70788b7fc514ca4a9918
 * the `instructions.ts` file was moved to `instructions/instructions.ts` and an
 * `index.ts` file was used to re-export everything. Having had file names that were
 * importing from `instructions' directly (not the from the sub file or the `index.ts`
 * file) caused strange CI issues. `index.ts` had to be renamed to `all.ts` for this
 * to work.
 *
 * Jira Issue = FW-1184
 */
export * from './attribute';
export * from './attribute_interpolation';
export * from './change_detection';
export * from './template';
export * from './storage';
export * from './di';
export * from './di_attr';
export * from './element';
export * from './element_container';
export * from './get_current_view';
export * from './listener';
export * from './namespace';
export * from './next_context';
export * from './projection';
export * from './property';
export * from './property_interpolation';
export * from './advance';
export * from './styling';
export * from './text';
export * from './text_interpolation';
export * from './class_map_interpolation';
export * from './style_map_interpolation';
export * from './style_prop_interpolation';
export * from './host_property';
export * from './i18n';
export {ɵgetUnknownElementStrictMode, ɵsetUnknownElementStrictMode, ɵgetUnknownPropertyStrictMode, ɵsetUnknownPropertyStrictMode} from './element_validation';
