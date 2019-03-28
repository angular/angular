/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {SanitizerFn} from '../interfaces/sanitization';
import {getSelectedIndex} from '../state';

import {bind} from './instructions';
import {elementPropertyInternal} from './shared';


// TODO: Remove this when the issue is resolved.
/**
 * Tsickle has a bug where it creates an infinite loop for a function returning itself.
 * This is a temporary type that will be removed when the issue is resolved.
 * https://github.com/angular/tsickle/issues/1009)
 */
export type TsickleIssue1009 = any;

/**
 * Update a property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * If the property name also exists as an input property on one of the element's directives,
 * the component property will be set instead of the element property. This check must
 * be conducted at runtime so child components that add new `@Inputs` don't have to be re-compiled
 *
 * @param propName Name of property. Because it is going to DOM, this is not subject to
 *        renaming as part of minification.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @param nativeOnly Whether or not we should only set native properties and skip input check
 * (this is necessary for host property bindings)
 * @returns This function returns itself so that it may be chained
 * (e.g. `property('name', ctx.name)('title', ctx.title)`)
 */
export function property<T>(
    propName: string, value: T, sanitizer?: SanitizerFn | null,
    nativeOnly?: boolean): TsickleIssue1009 {
  const index = getSelectedIndex();
  const bindReconciledValue = bind(value);
  elementPropertyInternal(index, propName, bindReconciledValue, sanitizer, nativeOnly);
  return property;
}
