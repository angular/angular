/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface FnWithArg<T> {
  (...args: any[]): T;
  new (...args: any[]): T;
}

function callableClassDecorator(): FnWithArg<(clazz: any) => any> {
  return null !;
}

function callableParamDecorator(): FnWithArg<(a: any, b: any, c: any) => void> {
  return null !;
}

function callablePropDecorator(): FnWithArg<(a: any, b: any) => any> {
  return null !;
}

export const Component = callableClassDecorator();
export const Directive = callableClassDecorator();
export const Injectable = callableClassDecorator();
export const NgModule = callableClassDecorator();
export const Pipe = callableClassDecorator();

export const Attribute = callableParamDecorator();
export const Inject = callableParamDecorator();
export const Self = callableParamDecorator();
export const SkipSelf = callableParamDecorator();
export const Optional = callableParamDecorator();

export const ContentChild = callablePropDecorator();
export const ContentChildren = callablePropDecorator();
export const HostBinding = callablePropDecorator();
export const HostListener = callablePropDecorator();
export const Input = callablePropDecorator();
export const Output = callablePropDecorator();
export const ViewChild = callablePropDecorator();
export const ViewChildren = callablePropDecorator();

export type ModuleWithProviders<T> = any;

export class ChangeDetectorRef {}
export class ElementRef {}
export class Injector {}
export class TemplateRef<T = any> {}
export class ViewContainerRef {}
export class Renderer2 {}
export class ɵNgModuleFactory<T> {
  constructor(public clazz: T) {}
}

export function forwardRef<T>(fn: () => T): T {
  return fn();
}

export interface SimpleChanges { [propName: string]: any; }

export type ɵNgModuleDefWithMeta<ModuleT, DeclarationsT, ImportsT, ExportsT> = any;
export type ɵDirectiveDefWithMeta<DirT, SelectorT, ExportAsT, InputsT, OutputsT, QueriesT> = any;
