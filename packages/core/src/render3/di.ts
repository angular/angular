/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentFactory, ComponentRef as IComponentRef, ElementRef as IElementRef, EmbeddedViewRef as IEmbeddedViewRef, Injector, NgModuleRef as INgModuleRef, TemplateRef as ITemplateRef, Type, ViewContainerRef as IViewContainerRef, ViewRef as IViewRef} from '../core';
import {BLOOM_SIZE, NG_ELEMENT_ID, getOrCreateNodeInjector} from './instructions';
import {LContainer, LNodeFlags, LNodeInjector} from './interfaces';
import {ComponentTemplate} from './public_interfaces';
import {stringify} from './util';

export const enum InjectFlags {
  Optional = 1 << 0,
  CheckSelf = 1 << 1,
  CheckParent = 1 << 2,
  Default = CheckSelf | CheckParent
}

function createError(text: string, token: any) {
  return new Error(`ElementInjector: ${text} [${stringify(token)}]`);
}

export function inject<T>(token: Type<T>, flags?: InjectFlags): T {
  const di = getOrCreateNodeInjector();
  const bloomHash = bloomHashBit(token);
  if (bloomHash === null) {
    const moduleInjector = di.injector;
    if (!moduleInjector) {
      throw createError('NotFound', token);
    }
    moduleInjector.get(token);
  } else {
    let injector: LNodeInjector|null = di;
    while (injector) {
      injector = bloomFindPossibleInjector(injector, bloomHash);
      if (injector) {
        const node = injector.node;
        const flags = node.flags;
        let size = flags & LNodeFlags.SIZE_MASK;
        if (size !== 0) {
          size = size >> LNodeFlags.SIZE_SHIFT;
          const start = flags >> LNodeFlags.INDX_SHIFT;
          const directives = node.view.directives;
          if (directives) {
            for (let i = start, ii = start + size; i < ii; i++) {
              const def = directives[(i << 1) | 1];
              if (def.diPublic && def.type == token) {
                return directives[i << 1];
              }
            }
          }
        }
        injector = injector.parent;
      }
    }
  }
  throw createError('Not found', token);
}

function bloomHashBit(type: Type<any>): number|null {
  let id: number|undefined = (type as any)[NG_ELEMENT_ID];
  return typeof id === 'number' ? id % BLOOM_SIZE : null;
}

export function bloomFindPossibleInjector(injector: LNodeInjector, bloomBit: number): LNodeInjector|
    null {
  const mask = 1 << bloomBit;
  let di: LNodeInjector|null = injector;
  while (di) {
    // See if the current injector may have the value.
    let value: number =
        bloomBit < 64 ? (bloomBit < 32 ? di.bf0 : di.bf1) : (bloomBit < 96 ? di.bf2 : di.bf3);
    if ((value & mask) === mask) {
      return di;
    }
    // See if the parent injectors may have the value
    value =
        bloomBit < 64 ? (bloomBit < 32 ? di.cbf0 : di.cbf1) : (bloomBit < 96 ? di.cbf2 : di.cbf3);
    // Only go to parent if parent may have value otherwise exit.
    di = (value & mask) ? di.parent : null;
  }
  return null;
}


export function injectElementRef(): IElementRef {
  let di = getOrCreateNodeInjector();
  return di.elementRef || (di.elementRef = new ElementRef(di.node.native));
}

class ElementRef implements IElementRef {
  readonly nativeElement: any;
  constructor(nativeElement: any) { this.nativeElement = nativeElement; }
}


export function injectTemplateRef(): ITemplateRef<any> {
  let di = getOrCreateNodeInjector();
  const data = (di.node as LContainer).data;
  if (data === null || data.template === null) {
    throw createError('Directive not used in structural way.', null);
  }
  return di.templateRef ||
      (di.templateRef = new TemplateRef<any>(injectElementRef(), data.template));
}

class TemplateRef<T> implements ITemplateRef<T> {
  readonly elementRef: IElementRef;

  constructor(elementRef: IElementRef, template: ComponentTemplate<T>) {
    this.elementRef = elementRef;
  }

  createEmbeddedView(context: T): IEmbeddedViewRef<T> { throw notImplemented(); }
}

export function injectViewContainerRef(): IViewContainerRef {
  let di = getOrCreateNodeInjector();
  return di.viewContainerRef || (di.viewContainerRef = new ViewContainerRef(di.node as LContainer));
}

class ViewContainerRef implements IViewContainerRef {
  element: IElementRef;
  injector: Injector;
  parentInjector: Injector;

  constructor(node: LContainer) {}

  clear(): void { throw notImplemented(); }
  get(index: number): IViewRef|null { throw notImplemented(); }
  length: number;
  createEmbeddedView<C>(
      templateRef: ITemplateRef<C>, context?: C|undefined,
      index?: number|undefined): IEmbeddedViewRef<C> {
    throw notImplemented();
  }
  createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number|undefined,
      injector?: Injector|undefined, projectableNodes?: any[][]|undefined,
      ngModule?: INgModuleRef<any>|undefined): IComponentRef<C> {
    throw notImplemented();
  }
  insert(viewRef: IViewRef, index?: number|undefined): IViewRef { throw notImplemented(); }
  move(viewRef: IViewRef, currentIndex: number): IViewRef { throw notImplemented(); }
  indexOf(viewRef: IViewRef): number { throw notImplemented(); }
  remove(index?: number|undefined): void { throw notImplemented(); }
  detach(index?: number|undefined): IViewRef|null { throw notImplemented(); }
}


function notImplemented() {
  return new Error('Method not implemented.');
}
