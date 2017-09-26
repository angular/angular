/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DebugNode, ɵglobalForWrite as globalForWrite} from '@angular/core';

import {AngularProfiler} from '../browser/tools/common_tools';

const CAMEL_CASE_REGEXP = /([A-Z])/g;
const DASH_CASE_REGEXP = /-([a-z])/g;


export function camelCaseToDashCase(input: string): string {
  return input.replace(CAMEL_CASE_REGEXP, (...m: string[]) => '-' + m[1].toLowerCase());
}

export function dashCaseToCamelCase(input: string): string {
  return input.replace(DASH_CASE_REGEXP, (...m: string[]) => m[1].toUpperCase());
}

// Declare global variable in a closure friendly way.
declare let ng: any;

/**
 * Wrapper around the namespace `ng` to lasily initialize it
 * and to access properties in a way so that closure
 * compiler won't rename them.
 *
 * Note: We have to use globalForWrite also for reading
 * as otherwise closure will complain when this is used together with ng1,
 * as there `ng` is a namespace as closure does not like redeclaring namespaces.
 */
export class NgGlobal {
  constructor() { globalForWrite.ng = {}; }
  get profiler() { return globalForWrite.ng['profiler']; }
  set profiler(value: AngularProfiler|undefined) { globalForWrite.ng['profiler'] = value; }
  get inspect() { return globalForWrite.ng['inspect']; }
  set inspect(value: ((element: any) => DebugNode | null)|undefined) {
    globalForWrite.ng['inspect'] = value;
  }
  get coreTokens() { return globalForWrite.ng['coreTokens']; }
  set coreTokens(value: {[name: string]: any}|undefined) {
    globalForWrite.ng['coreTokens'] = value;
  }
}

let _ngGlobal: NgGlobal;

export function getNgGlobal(): NgGlobal {
  if (!_ngGlobal) {
    _ngGlobal = new NgGlobal();
  }
  return _ngGlobal;
}
