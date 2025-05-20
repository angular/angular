/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A schema definition associated with a component or an NgModule.
 *
 * @see {@link NgModule}
 * @see {@link CUSTOM_ELEMENTS_SCHEMA}
 * @see {@link NO_ERRORS_SCHEMA}
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
  name: 'custom-elements',
};

/**
 * Defines a schema that allows any property on any element.
 *
 * This schema allows you to ignore the errors related to any unknown elements or properties in a
 * template. The usage of this schema is generally discouraged because it prevents useful validation
 * and may hide real errors in your template. Consider using the `CUSTOM_ELEMENTS_SCHEMA` instead.
 *
 * @publicApi
 */
export const NO_ERRORS_SCHEMA: SchemaMetadata = {
  name: 'no-errors-schema',
};
