/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SanitizerFn} from '../interfaces/sanitization';

import {ɵɵlistener} from './listener';
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

/**
 * Function used inside two-way listeners to conditionally set the value of the bound expression.
 *
 * @param target Field on which to set the value.
 * @param value Value to be set to the field.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayBindingSet<T>(target: unknown, value: T): boolean {
  // TODO(crisbeto): implement this fully.
  return false;
}

/**
 * Adds an event listener that updates a two-way binding to the current node.
 *
 * @param eventName Name of the event.
 * @param listenerFn The function to be called when event emits.
 *
 * @codeGenApi
 */
export function ɵɵtwoWayListener(
    eventName: string, listenerFn: (e?: any) => any): typeof ɵɵtwoWayListener {
  ɵɵlistener(eventName, listenerFn);
  return ɵɵtwoWayListener;
}
