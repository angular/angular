/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentRef, EmbeddedViewRef, Injector} from '../core';
import {assertNotNull} from './assert';
import {NG_HOST_SYMBOL, createError, createViewState, directiveCreate, elementHost, enterView, leaveView} from './instructions';
import {LElement} from './interfaces';
import {ComponentDef, ComponentType} from './public_interfaces';
import {RElement, Renderer3, RendererFactory3} from './renderer';
import {stringify} from './util';



/**
 * Options which control how the component should be bootstrapped.
 */
export interface CreateComponentOptionArgs {
  /**
   * Which renderer to use.
   */
  renderer?: Renderer3;

  rendererFactory?: RendererFactory3;

  /**
   * Which host element should the component be bootstrapped on. If not specified
   * the component definition's `tag` is used to query the existing DOM for the
   * element to bootstrap.
   */
  host?: RElement|string;

  /**
   * Optional Injector which is the Module Injector for the component.
   */
  injector?: Injector;

  /**
   * a set of features which should be applied to this component.
   */
  features?: (<T>(component: T, componentDef: ComponentDef<T>) => void)[];
}


/**
 * Bootstrap a Component into an existing host element and return `ComponentRef`.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function createComponentRef<T>(
    componentType: ComponentType<T>, opts: CreateComponentOptionArgs): ComponentRef<T> {
  const component = renderComponent(componentType, opts);
  const hostView = createViewRef(detectChanges.bind(component), component);
  return {
    location: {nativeElement: getHostElement(component)},
    injector: opts.injector || NULL_INJECTOR,
    instance: component,
    hostView: hostView,
    changeDetectorRef: hostView,
    componentType: componentType,
    destroy: function() {},
    onDestroy: function(cb: Function): void {}
  };
}

function createViewRef<T>(detectChanges: () => void, context: T): EmbeddedViewRef<T> {
  return addDestroyable(
      {
        rootNodes: null !,
        // inherited from core/ChangeDetectorRef
        markForCheck: () => {
          if (ngDevMode) {
            implement();
          }
        },
        detach: () => {
          if (ngDevMode) {
            implement();
          }
        },
        detectChanges: detectChanges,
        checkNoChanges: () => {
          if (ngDevMode) {
            implement();
          }
        },
        reattach: () => {
          if (ngDevMode) {
            implement();
          }
        },
      },
      context);
}

interface DestroyRef<T> {
  context: T;
  destroyed: boolean;
  destroy(): void;
  onDestroy(cb: Function): void;
}

function implement() {
  throw new Error('NotImplemented');
}

function addDestroyable<T, C>(obj: any, context: C): T&DestroyRef<C> {
  let destroyFn: Function[]|null = null;
  obj.destroyed = false;
  obj.destroy = function() {
    destroyFn && destroyFn.forEach((fn) => fn());
    this.destroyed = true;
  };
  obj.onDestroy = (fn: Function) => (destroyFn || (destroyFn = [])).push(fn);
  return obj;
}


// TODO: A hack to not pull in the NullInjector from @angular/core.
export const NULL_INJECTOR: Injector = {
  get: function(token: any, notFoundValue?: any) {
    throw new Error('NullInjector: Not found: ' + stringify(token));
  }
};


/**
 * Bootstrap a Component into an existing host element and return `NgComponent`.
 *
 * NgComponent is a light weight Custom Elements inspired API for bootstrapping and
 * interacting with bootstrapped component.
 *
 * @param componentType Component to bootstrap
 * @param options Optional parameters which control bootstrapping
 */
export function renderComponent<T>(
    componentType: ComponentType<T>, opts: CreateComponentOptionArgs = {}): T {
  const renderer = opts.renderer || document;
  const componentDef = componentType.ngComponentDef;
  let component: T;
  const oldView = enterView(createViewState(-1, renderer, []), null);
  try {
    // Create element node at index 0 in data array
    elementHost(opts.host || componentDef.tag, componentDef);
    // Create directive instance with n() and store at index 1 in data array (el is 0)
    component = directiveCreate(1, componentDef.n(), componentDef);
  } finally {
    leaveView(oldView);
  }

  opts.features && opts.features.forEach((feature) => feature(component, componentDef));
  detectChanges(component);
  return component;
}

export function detectChanges<T>(component: T) {
  ngDevMode && assertNotNull(component, 'component');
  const hostNode = (component as any)[NG_HOST_SYMBOL] as LElement;
  if (ngDevMode && !hostNode) {
    createError('Not a directive instance', component);
  }
  ngDevMode && assertNotNull(hostNode.data, 'hostNode.data');
  const oldView = enterView(hostNode.view !, hostNode);
  try {
    // Element was stored at 0 and directive was stored at 1 in renderComponent
    // so to refresh the component, r() needs to be called with (1, 0)
    (component.constructor as ComponentType<T>).ngComponentDef.r(1, 0);
    isDirty = false;
  } finally {
    leaveView(oldView);
  }
}

let isDirty = false;
export function markDirty<T>(
    component: T, scheduler: (fn: () => void) => void = requestAnimationFrame) {
  ngDevMode && assertNotNull(component, 'component');
  if (!isDirty) {
    isDirty = true;
    scheduler(detectChanges.bind(null, component));
  }
}

export function getHostElement<T>(component: T): RElement {
  return ((component as any)[NG_HOST_SYMBOL] as LElement).native;
}
