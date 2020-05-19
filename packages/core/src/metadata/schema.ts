/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/**
 * A schema definition associated with an NgModule.
 *
 * @see `@NgModule`, `CUSTOM_ELEMENTS_SCHEMA`, `NO_ERRORS_SCHEMA`
 *
 * @param name The name of a defined schema.
 *
 * @publicApi
 */
export interface SchemaMetadata {
  name: string;
}

/**
 * Defines a schema that allows an NgModule to contain the following:
 * - Non-Angular elements named with dash case (`-`).
 * - Element properties named with dash case (`-`).
 * Dash case is the naming convention for custom elements.
 *
 * @publicApi
 */
export const CUSTOM_ELEMENTS_SCHEMA: SchemaMetadata = {
  name: 'custom-elements'
};

/**
 * Defines a schema that allows any property on any element.
 *
 * @publicApi
 */
export const NO_ERRORS_SCHEMA: SchemaMetadata = {
  name: 'no-errors-schema'
};
