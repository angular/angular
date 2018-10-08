/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

type FnWithArg<T> = (arg?: any) => T;

function callableClassDecorator(): FnWithArg<(clazz: any) => any> {
  return null !;
}

function callableParamDecorator(): FnWithArg<(a: any, b: any, c: any) => void> {
  return null !;
}

export const Injectable = callableClassDecorator();
export const NgModule = callableClassDecorator();

export const Inject = callableParamDecorator();
export const Self = callableParamDecorator();
export const SkipSelf = callableParamDecorator();
export const Optional = callableParamDecorator();
