/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SanitizerFn} from '../interfaces/sanitization';

import {ɵɵproperty} from './property';


/**
 * Update a two-way bound property on a selected element.
 *
 * Operates on the element selected by index via the {@link select} instruction.
 *
 * @param propName Name of property.
 * @param value New value to write.
 * @param sanitizer An optional function used to sanitize the value.
 * @returns This function returns itself so that it may be chained
 * (e.g. `twoWayProperty('name', ctx.name)('title', ctx.title)`)
 *
 * @codeGenApi
 */
export function ɵɵtwoWayProperty<T>(
    propName: string, value: T, sanitizer?: SanitizerFn|null): typeof ɵɵtwoWayProperty {
  // TODO(crisbeto): implement two-way specific logic.
  ɵɵproperty(propName, value, sanitizer);
  return ɵɵtwoWayProperty;
}
