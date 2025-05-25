/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
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
export * from '../../defer/instructions';
export * from './advance';
export * from './attribute';
export * from './change_detection';
export * from './class_map_interpolation';
export * from './component_instance';
export * from './control_flow';
export * from './di';
export * from './di_attr';
export * from './element';
export * from './element_container';
export {
  ɵgetUnknownElementStrictMode,
  ɵgetUnknownPropertyStrictMode,
  ɵsetUnknownElementStrictMode,
  ɵsetUnknownPropertyStrictMode,
} from './element_validation';
export * from './get_current_view';
export * from './dom_property';
export * from './staticHtml';
export * from './i18n';
export * from './listener';
export * from './namespace';
export * from './next_context';
export * from './projection';
export * from './property';
export * from './property_interpolation';
export * from './queries';
export * from './queries_signals';
export * from './storage';
export * from './style_map_interpolation';
export * from './style_prop_interpolation';
export * from './styling';
export * from './template';
export * from './text';
export * from './text_interpolation';
export * from './two_way';
export * from './let_declaration';
export * from './attach_source_locations';
export * from './value_interpolation';
