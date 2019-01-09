/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getInjectableDef, getInjectorDef} from '../di/interfaces/defs';
import {InjectionToken} from '../di/interfaces/injection_token';
import {Type} from '../interfaces/type';
import {assertDefined, assertEqual} from '../utils/assert';

import {bloomAdd} from './di/bloom';
import {getInjectorIndex, getParentInjectorLocation} from './di/node_injector';
import {getComponentDef, getDirectiveDef, getPipeDef} from './interfaces/fields';
import {PARENT_INJECTOR, RelativeInjectorLocation, RelativeInjectorLocationFlags} from './interfaces/injector';
import {AttributeMarker, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType} from './interfaces/node';
import {DECLARATION_VIEW, HOST_NODE, LView, TVIEW} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';
import {getParentInjectorIndex, getParentInjectorView, hasParentInjector} from './utils/util';



/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param hostView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(
    tNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LView): number {
  const existingInjectorIndex = getInjectorIndex(tNode, hostView);
  if (existingInjectorIndex !== -1) {
    return existingInjectorIndex;
  }

  const tView = hostView[TVIEW];
  if (tView.firstTemplatePass) {
    tNode.injectorIndex = hostView.length;
    insertBloom(tView.data, tNode);  // foundation for node bloom
    insertBloom(hostView, null);     // foundation for cumulative bloom
    insertBloom(tView.blueprint, null);

    ngDevMode && assertEqual(
                     tNode.flags === 0 || tNode.flags === TNodeFlags.isComponent, true,
                     'expected tNode.flags to not be initialized');
  }

  const parentLoc = getParentInjectorLocation(tNode, hostView);
  const parentIndex = getParentInjectorIndex(parentLoc);
  const parentLView = getParentInjectorView(parentLoc, hostView);

  const injectorIndex = tNode.injectorIndex;

  // If a parent injector can't be found, its location is set to -1.
  // In that case, we don't need to set up a cumulative bloom
  if (hasParentInjector(parentLoc)) {
    const parentData = parentLView[TVIEW].data as any;
    // Creates a cumulative bloom filter that merges the parent's bloom filter
    // and its own cumulative bloom (which contains tokens for all ancestors)
    for (let i = 0; i < 8; i++) {
      hostView[injectorIndex + i] = parentLView[parentIndex + i] | parentData[parentIndex + i];
    }
  }

  hostView[injectorIndex + PARENT_INJECTOR] = parentLoc;
  return injectorIndex;
}

function insertBloom(arr: any[], footer: TNode | null): void {
  arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}

/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export function diPublicInInjector(
    injectorIndex: number, view: LView, token: InjectionToken<any>| Type<any>): void {
  bloomAdd(injectorIndex, view[TVIEW], token);
}

/**
 * Inject static attribute value into directive constructor.
 *
 * This method is used with `factory` functions which are generated as part of
 * `defineDirective` or `defineComponent`. The method retrieves the static value
 * of an attribute. (Dynamic attributes are not supported since they are not resolved
 *  at the time of injection and can change over time.)
 *
 * # Example
 * Given:
 * ```
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```
 * MyComponent.ngComponentDef = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @publicApi
 */
export function injectAttributeImpl(tNode: TNode, attrNameToInject: string): string|null {
  ngDevMode && assertNodeOfPossibleTypes(
                   tNode, TNodeType.Container, TNodeType.Element, TNodeType.ElementContainer);
  ngDevMode && assertDefined(tNode, 'expecting tNode');
  const attrs = tNode.attrs;
  if (attrs) {
    for (let i = 0; i < attrs.length; i = i + 2) {
      const attrName = attrs[i];
      if (attrName === AttributeMarker.SelectOnly) break;
      if (attrName == attrNameToInject) {
        return attrs[i + 1] as string;
      }
    }
  }
  return null;
}


export function getFactoryOf<T>(type: Type<any>): ((type: Type<T>| null) => T)|null {
  const typeAny = type as any;
  const def = getComponentDef<T>(typeAny) || getDirectiveDef<T>(typeAny) ||
      getPipeDef<T>(typeAny) || getInjectableDef<T>(typeAny) || getInjectorDef<T>(typeAny);
  if (!def || def.factory === undefined) {
    return null;
  }
  return def.factory;
}

export function getInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T {
  const proto = Object.getPrototypeOf(type.prototype).constructor as Type<any>;
  const factory = getFactoryOf<T>(proto);
  if (factory !== null) {
    return factory;
  } else {
    // There is no factory defined. Either this was improper usage of inheritance
    // (no Angular decorator on the superclass) or there is no constructor at all
    // in the inheritance chain. Since the two cases cannot be distinguished, the
    // latter has to be assumed.
    return (t) => new t();
  }
}
