/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Type} from '@angular/core';
import * as angular from './angular1';

const DIRECTIVE_PREFIX_REGEXP = /^(?:x|data)[:\-_]/i;
const DIRECTIVE_SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

export function onError(e: any) {
  // TODO: (misko): We seem to not have a stack trace here!
  if (console.error) {
    console.error(e, e.stack);
  } else {
    // tslint:disable-next-line:no-console
    console.log(e, e.stack);
  }
  throw e;
}

export function controllerKey(name: string): string {
  return '$' + name + 'Controller';
}

export function directiveNormalize(name: string): string {
  return name.replace(DIRECTIVE_PREFIX_REGEXP, '')
      .replace(DIRECTIVE_SPECIAL_CHARS_REGEXP, (_, letter) => letter.toUpperCase());
}

export function getAttributesAsArray(node: Node): [string, string][] {
  const attributes = node.attributes;
  let asArray: [string, string][] = undefined !;
  if (attributes) {
    let attrLen = attributes.length;
    asArray = new Array(attrLen);
    for (let i = 0; i < attrLen; i++) {
      asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue !];
    }
  }
  return asArray || [];
}

export function getComponentName(component: Type<any>): string {
  // Return the name of the component or the first line of its stringified version.
  return (component as any).overriddenName || component.name || component.toString().split('\n')[0];
}

export function isFunction(value: any): value is Function {
  return typeof value === 'function';
}

export class Deferred<R> {
  promise: Promise<R>;
  resolve: (value?: R|PromiseLike<R>) => void;
  reject: (error?: any) => void;

  constructor() {
    this.promise = new Promise((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}

export interface LazyModuleRef {
  // Whether the AngularJS app has been bootstrapped outside the Angular zone
  // (in which case calls to Angular APIs need to be brought back in).
  needsNgZone: boolean;
  injector?: Injector;
  promise?: Promise<Injector>;
}

/**
 * @return Whether the passed-in component implements the subset of the
 *     `ControlValueAccessor` interface needed for AngularJS `ng-model`
 *     compatibility.
 */
function supportsNgModel(component: any) {
  return typeof component.writeValue === 'function' &&
      typeof component.registerOnChange === 'function';
}

/**
 * Glue the AngularJS `NgModelController` (if it exists) to the component
 * (if it implements the needed subset of the `ControlValueAccessor` interface).
 */
export function hookupNgModel(ngModel: angular.INgModelController, component: any) {
  if (ngModel && supportsNgModel(component)) {
    ngModel.$render = () => { component.writeValue(ngModel.$viewValue); };
    component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
    if (typeof component.registerOnTouched === 'function') {
      component.registerOnTouched(ngModel.$setTouched.bind(ngModel));
    }
  }
}

/**
 * Test two values for strict equality, accounting for the fact that `NaN !== NaN`.
 */
export function strictEquals(val1: any, val2: any): boolean {
  return val1 === val2 || (val1 !== val1 && val2 !== val2);
}
