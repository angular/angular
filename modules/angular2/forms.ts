/**
 * @module
 * @public
 * @description
 * This module is used for handling user input, by defining and building a {@link ControlGroup} that
 * consists of
 * {@link Control} objects, and mapping them onto the DOM. {@link Control} objects can then be used
 * to read information
 * from the form DOM elements.
 *
 * This module is not included in the `angular2` module; you must import the forms module
 * explicitly.
 *
 */

export * from './src/forms/model';
export * from './src/forms/directives';
export * from './src/forms/validators';
export * from './src/forms/directives/validators';
export * from './src/forms/form_builder';

import {FormBuilder} from './src/forms/form_builder';
import {CONST_EXPR, Type} from './src/facade/lang';
export const formInjectables: List<Type> = CONST_EXPR([FormBuilder]);
