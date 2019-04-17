/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectFlags, InjectionToken, resolveForwardRef} from '../../di';
import {ɵɵinject} from '../../di/injector_compatibility';
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
 * ```ts
 * class SomeDirective {
 *   constructor(directive: DirectiveA) {}
 *
 *   static ngDirectiveDef = ɵɵdefineDirective({
 *     type: SomeDirective,
 *     factory: () => new SomeDirective(ɵɵdirectiveInject(DirectiveA))
 *   });
 * }
 * ```
 * @param token the type or token to inject
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 *
 * @codeGenApi
 */
export function ɵɵdirectiveInject<T>(token: Type<T>| InjectionToken<T>): T;
export function ɵɵdirectiveInject<T>(token: Type<T>| InjectionToken<T>, flags: InjectFlags): T;
export function ɵɵdirectiveInject<T>(
    token: Type<T>| InjectionToken<T>, flags = InjectFlags.Default): T|null {
  token = resolveForwardRef(token);
  const lView = getLView();
  // Fall back to inject() if view hasn't been created. This situation can happen in tests
  // if inject utilities are used before bootstrapping.
  if (lView == null) return ɵɵinject(token, flags);

  return getOrCreateInjectable<T>(
      getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode, lView,
      token, flags);
}

/**
 * Facade for the attribute injection from DI.
 *
 * @codeGenApi
 */
export function ɵɵinjectAttribute(attrNameToInject: string): string|null {
  return injectAttributeImpl(getPreviousOrParentTNode(), attrNameToInject);
}
