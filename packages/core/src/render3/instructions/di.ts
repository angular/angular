/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectFlags, InjectionToken, resolveForwardRef} from '../../di';
import {Type} from '../../interface/type';
import {getOrCreateInjectable, injectAttributeImpl} from '../di';
import {TContainerNode, TElementContainerNode, TElementNode} from '../interfaces/node';
import {getLView, getPreviousOrParentTNode} from '../state';

/**
 * Returns the value associated to the given token from the injectors.
 *
 * `directiveInject` is intended to be used for directive, component and pipe factories.
 *  All other injection use `inject` which does not walk the node injector tree.
 *
 * Usage example (in factory function):
 *
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = defineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(directiveInject(DirectiveA))
 *   });
 * }
 *
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export function directiveInject<T>(token: Type<T>| InjectionToken<T>): T;
export function directiveInject<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags): T;
export function directiveInject<T>(
    token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  token = resolveForwardRef(token);
  return getOrCreateInjectable<T>(
      getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode,
      getLView(), token, flags);
}

/**
 * Facade for the attribute injection from DI.
 */
export function injectAttribute(attrNameToInject: string): string|null {
  return injectAttributeImpl(getPreviousOrParentTNode(), attrNameToInject);
}
