/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as angular from './angular_js';

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

export function getAttributesAsArray(node: Node): [string, string][] {
  const attributes = node.attributes;
  let asArray: [string, string][];
  if (attributes) {
    let attrLen = attributes.length;
    asArray = new Array(attrLen);
    for (let i = 0; i < attrLen; i++) {
      asArray[i] = [attributes[i].nodeName, attributes[i].nodeValue];
    }
  }
  return asArray || [];
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

/**
 * @return true if the passed-in component implements the subset of
 *     ControlValueAccessor needed for AngularJS ng-model compatibility.
 */
function supportsNgModel(component: any) {
  return typeof component.writeValue === 'function' &&
      typeof component.registerOnChange === 'function';
}

/**
 * Glue the AngularJS ngModelController if it exists to the component if it
 * implements the needed subset of ControlValueAccessor.
 */
export function hookupNgModel(ngModel: angular.INgModelController, component: any) {
  if (ngModel && supportsNgModel(component)) {
    ngModel.$render = () => { component.writeValue(ngModel.$viewValue); };
    component.registerOnChange(ngModel.$setViewValue.bind(ngModel));
  }
}
