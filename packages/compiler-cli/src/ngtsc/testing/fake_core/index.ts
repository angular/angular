/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface FnWithArg<T> {
  (...args: any[]): T;
  new(...args: any[]): T;
}

function callableClassDecorator(): FnWithArg<(clazz: any) => any> {
  return null!;
}

function callableParamDecorator(): FnWithArg<(a: any, b: any, c: any) => void> {
  return null!;
}

function callablePropDecorator(): FnWithArg<(a: any, b: any) => any> {
  return null!;
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
export const Host = callableParamDecorator();

export const ContentChild = callablePropDecorator();
export const ContentChildren = callablePropDecorator();
export const HostBinding = callablePropDecorator();
export const HostListener = callablePropDecorator();
export const Input = callablePropDecorator();
export const Output = callablePropDecorator();
export const ViewChild = callablePropDecorator();
export const ViewChildren = callablePropDecorator();

// T defaults to `any` to reflect what is currently in core.
export type ModuleWithProviders<T = any> = any;

export class ChangeDetectorRef {}
export class ElementRef {}
export class Injector {}
export class TemplateRef<T = any> {}
export class ViewContainerRef {}
export class Renderer2 {}
export class ɵNgModuleFactory<T> {
  constructor(public clazz: T) {}
}

export class InjectionToken<T> {
  constructor(description: string) {}
}

export function forwardRef<T>(fn: () => T): T {
  return fn();
}

export interface SimpleChanges {
  [propName: string]: any;
}

export type ɵɵNgModuleDeclaration<ModuleT, DeclarationsT, ImportsT, ExportsT> = unknown;
export type ɵɵDirectiveDeclaration<DirT, SelectorT, ExportAsT, InputsT, OutputsT, QueriesT> =
    unknown;
export type ɵɵPipeDeclaration<PipeT, NameT> = unknown;

export enum ViewEncapsulation {
  Emulated = 0,
  // Historically the 1 value was for `Native` encapsulation which has been removed as of v11.
  None = 2,
  ShadowDom = 3
}

export enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1
}

export const CUSTOM_ELEMENTS_SCHEMA: any = false;
export const NO_ERRORS_SCHEMA: any = false;

export class EventEmitter<T> {
  subscribe(next?: (value: T) => void, error?: (error: any) => void, complete?: () => void):
      unknown;
  subscribe(observerOrNext?: any, error?: any, complete?: any): unknown;
  subscribe(observerOrNext?: any, error?: any, complete?: any): unknown {
    return null;
  }
}

export interface QueryList<T>/* implements Iterable<T> */ {
  [Symbol.iterator]: () => Iterator<T>;
}

export type NgIterable<T> = Array<T>|Iterable<T>;

export class NgZone {}

export interface PipeTransform {
  transform(value: any, ...args: any[]): any;
}

export interface OnDestroy {
  ngOnDestroy(): void;
}
