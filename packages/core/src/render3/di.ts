/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// We are temporarily importing the existing viewEngine_from core so we can be sure we are
// correctly implementing its interfaces for backwards compatibility.

import {getInjectableDef, getInjectorDef} from '../di/defs';
import {InjectionToken} from '../di/injection_token';
import {InjectFlags, Injector, NullInjector, inject, setCurrentInjector} from '../di/injector';
import {Renderer2} from '../render';
import {Type} from '../type';

import {assertDefined, assertGreaterThan, assertLessThan} from './assert';
import {getComponentDef, getDirectiveDef, getPipeDef} from './definition';
import {NG_ELEMENT_ID} from './fields';
import {_getViewData, addToViewTree, assertPreviousIsParent, createEmbeddedViewAndNode, createLContainer, createLNodeObject, createTNode, getPreviousOrParentNode, getPreviousOrParentTNode, getRenderer, loadElement, renderEmbeddedTemplate, resolveDirective, setEnvironment} from './instructions';
import {DirectiveDefInternal, RenderFlags} from './interfaces/definition';
import {LInjector} from './interfaces/injector';
import {AttributeMarker, LContainerNode, LElementContainerNode, LElementNode, LNode, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType, TViewNode} from './interfaces/node';
import {Renderer3, isProceduralRenderer} from './interfaces/renderer';
import {CONTEXT, DIRECTIVES, HOST_NODE, INJECTOR, LViewData, QUERIES, RENDERER, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes, assertNodeType} from './node_assert';
import {addRemoveViewFromContainer, appendChild, detachView, findComponentView, getBeforeNodeForView, getHostElementNode, getParentLNode, getParentOrContainerNode, getRenderParent, insertView, removeView} from './node_manipulation';

/**
 * The number of slots in each bloom filter (used by DI). The larger this number, the fewer
 * directives that will share slots, and thus, the fewer false positives when checking for
 * the existence of a directive.
 */
const BLOOM_SIZE = 256;
const BLOOM_MASK = BLOOM_SIZE - 1;

/** Counter used to generate unique IDs for directives. */
let nextNgElementId = 0;

/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injector The node injector in which the directive should be registered
 * @param type The directive to register
 */
export function bloomAdd(injector: LInjector, type: Type<any>): void {
  let id: number|undefined = (type as any)[NG_ELEMENT_ID];

  // Set a unique ID on the directive type, so if something tries to inject the directive,
  // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
  if (id == null) {
    id = (type as any)[NG_ELEMENT_ID] = nextNgElementId++;
  }

  // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
  const bloomBit = id & BLOOM_MASK;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;

  // Use the raw bloomBit number to determine which bloom filter bucket we should check
  // e.g: bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc
  const b7 = bloomBit & 0x80;
  const b6 = bloomBit & 0x40;
  const b5 = bloomBit & 0x20;

  if (b7) {
    b6 ? (b5 ? (injector.bf7 |= mask) : (injector.bf6 |= mask)) :
         (b5 ? (injector.bf5 |= mask) : (injector.bf4 |= mask));
  } else {
    b6 ? (b5 ? (injector.bf3 |= mask) : (injector.bf2 |= mask)) :
         (b5 ? (injector.bf1 |= mask) : (injector.bf0 |= mask));
  }
}

export function getOrCreateNodeInjector(): LInjector {
  ngDevMode && assertPreviousIsParent();
  return getOrCreateNodeInjectorForNode(
      getPreviousOrParentNode() as LElementNode | LElementContainerNode | LContainerNode,
      getPreviousOrParentTNode() as TElementNode | TElementContainerNode | TContainerNode,
      _getViewData());
}

/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param node for which an injector should be retrieved / created.
 * @param tNode for which an injector should be retrieved / created.
 * @param hostView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(
    node: LElementNode | LElementContainerNode | LContainerNode,
    tNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LViewData): LInjector {
  // TODO: remove LNode arg when nodeInjector refactor is done
  const nodeInjector = node.nodeInjector;
  const parentLNode = getParentOrContainerNode(tNode, hostView);
  const parentInjector = parentLNode && parentLNode.nodeInjector;
  if (nodeInjector != parentInjector) {
    return nodeInjector !;
  }
  return node.nodeInjector = {
    parent: parentInjector,
    tNode: tNode,
    view: hostView,
    bf0: 0,
    bf1: 0,
    bf2: 0,
    bf3: 0,
    bf4: 0,
    bf5: 0,
    bf6: 0,
    bf7: 0,
    cbf0: parentInjector == null ? 0 : parentInjector.cbf0 | parentInjector.bf0,
    cbf1: parentInjector == null ? 0 : parentInjector.cbf1 | parentInjector.bf1,
    cbf2: parentInjector == null ? 0 : parentInjector.cbf2 | parentInjector.bf2,
    cbf3: parentInjector == null ? 0 : parentInjector.cbf3 | parentInjector.bf3,
    cbf4: parentInjector == null ? 0 : parentInjector.cbf4 | parentInjector.bf4,
    cbf5: parentInjector == null ? 0 : parentInjector.cbf5 | parentInjector.bf5,
    cbf6: parentInjector == null ? 0 : parentInjector.cbf6 | parentInjector.bf6,
    cbf7: parentInjector == null ? 0 : parentInjector.cbf7 | parentInjector.bf7,
  };
}


/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param def The definition of the directive to be made public
 */
export function diPublicInInjector(di: LInjector, def: DirectiveDefInternal<any>): void {
  bloomAdd(di, def.type);
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export function diPublic(def: DirectiveDefInternal<any>): void {
  diPublicInInjector(getOrCreateNodeInjector(), def);
}

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
  return getOrCreateInjectable<T>(getOrCreateNodeInjector(), token, flags);
}

export function injectRenderer2(): Renderer2 {
  return getOrCreateRenderer2(getOrCreateNodeInjector());
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
 * @experimental
 */
export function injectAttribute(attrNameToInject: string): string|undefined {
  const tNode = getPreviousOrParentTNode();
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
  return undefined;
}

function getOrCreateRenderer2(di: LInjector): Renderer2 {
  const renderer = di.view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
}

/**
 * Returns the value associated to the given token from the injectors.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * @param nodeInjector Node injector where the search should start
 * @param token The token to look for
 * @param flags Injection flags
 * @returns the value from the injector or `null` when not found
 */
export function getOrCreateInjectable<T>(
    nodeInjector: LInjector, token: Type<T>| InjectionToken<T>,
    flags: InjectFlags = InjectFlags.Default): T|null {
  const bloomHash = bloomHashBitOrFactory(token);
  // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
  // so just call the factory function to create it.
  if (typeof bloomHash === 'function') return bloomHash();

  // If the token has a bloom hash, then it is a directive that is public to the injection system
  // (diPublic) otherwise fall back to the module injector.
  if (bloomHash != null) {
    let injector: LInjector|null = nodeInjector;

    while (injector) {
      // Get the closest potential matching injector (upwards in the injector tree) that
      // *potentially* has the token.
      injector = bloomFindPossibleInjector(injector, bloomHash, flags);

      // If no injector is found, we *know* that there is no ancestor injector that contains the
      // token, so we abort.
      if (!injector) {
        break;
      }

      // At this point, we have an injector which *may* contain the token, so we step through the
      // directives associated with the injector's corresponding node to get the directive instance.
      const tNode = injector.tNode;
      const injectorView = injector.view;
      const nodeFlags = tNode.flags;
      const count = nodeFlags & TNodeFlags.DirectiveCountMask;

      if (count !== 0) {
        const start = nodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
        const end = start + count;
        const defs = injectorView[TVIEW].directives !;

        for (let i = start; i < end; i++) {
          // Get the definition for the directive at this index and, if it is injectable (diPublic),
          // and matches the given token, return the directive instance.
          const directiveDef = defs[i] as DirectiveDefInternal<any>;
          if (directiveDef.type === token && directiveDef.diPublic) {
            return injectorView[DIRECTIVES] ![i];
          }
        }
      }

      // If we *didn't* find the directive for the token and we are searching the current node's
      // injector, it's possible the directive is on this node and hasn't been created yet.
      let instance: T|null;
      if (injector === nodeInjector &&
          (instance = searchMatchesQueuedForCreation<T>(token, injectorView[TVIEW]))) {
        return instance;
      }

      // The def wasn't found anywhere on this node, so it was a false positive.
      // If flags permit, traverse up the tree and continue searching.
      if (flags & InjectFlags.Self || flags & InjectFlags.Host && !sameHostView(injector)) {
        injector = null;
      } else {
        injector = injector.parent;
      }
    }
  }

  const moduleInjector = nodeInjector.view[INJECTOR];
  const formerInjector = setCurrentInjector(moduleInjector);
  try {
    return inject(token, flags);
  } finally {
    setCurrentInjector(formerInjector);
  }
}

function searchMatchesQueuedForCreation<T>(token: any, hostTView: TView): T|null {
  const matches = hostTView.currentMatches;
  if (matches) {
    for (let i = 0; i < matches.length; i += 2) {
      const def = matches[i] as DirectiveDefInternal<any>;
      if (def.type === token) {
        return resolveDirective(def, i + 1, matches, hostTView);
      }
    }
  }
  return null;
}

/**
 * Returns the bit in an injector's bloom filter that should be used to determine whether or not
 * the directive might be provided by the injector.
 *
 * When a directive is public, it is added to the bloom filter and given a unique ID that can be
 * retrieved on the Type. When the directive isn't public or the token is not a directive `null`
 * is returned as the node injector can not possibly provide that token.
 *
 * @param token the injection token
 * @returns the matching bit to check in the bloom filter or `null` if the token is not known.
 */
function bloomHashBitOrFactory(token: Type<any>| InjectionToken<any>): number|Function|undefined {
  const tokenId: number|undefined = (token as any)[NG_ELEMENT_ID] || null;
  return typeof tokenId === 'number' ? tokenId & BLOOM_MASK : tokenId;
}

/**
 * Finds the closest injector that might have a certain directive.
 *
 * Each directive corresponds to a bit in an injector's bloom filter. Given the bloom bit to
 * check and a starting injector, this function traverses up injectors until it finds an
 * injector that contains a 1 for that bit in its bloom filter. A 1 indicates that the
 * injector may have that directive. It only *may* have the directive because directives begin
 * to share bloom filter bits after the BLOOM_SIZE is reached, and it could correspond to a
 * different directive sharing the bit.
 *
 * Note: We can skip checking further injectors up the tree if an injector's cbf structure
 * has a 0 for that bloom bit. Since cbf contains the merged value of all the parent
 * injectors, a 0 in the bloom bit indicates that the parents definitely do not contain
 * the directive and do not need to be checked.
 *
 * @param injector The starting node injector to check
 * @param  bloomBit The bit to check in each injector's bloom filter
 * @param  flags The injection flags for this injection site (e.g. Optional or SkipSelf)
 * @returns An injector that might have the directive
 */
export function bloomFindPossibleInjector(
    startInjector: LInjector, bloomBit: number, flags: InjectFlags): LInjector|null {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomBit;
  const b7 = bloomBit & 0x80;
  const b6 = bloomBit & 0x40;
  const b5 = bloomBit & 0x20;

  // Traverse up the injector tree until we find a potential match or until we know there *isn't* a
  // match.
  let injector: LInjector|null =
      flags & InjectFlags.SkipSelf ? startInjector.parent : startInjector;

  while (injector) {
    // Our bloom filter size is 256 bits, which is eight 32-bit bloom filter buckets:
    // bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc.
    // Get the bloom filter value from the appropriate bucket based on the directive's bloomBit.
    let value: number;

    if (b7) {
      value = b6 ? (b5 ? injector.bf7 : injector.bf6) : (b5 ? injector.bf5 : injector.bf4);
    } else {
      value = b6 ? (b5 ? injector.bf3 : injector.bf2) : (b5 ? injector.bf1 : injector.bf0);
    }

    // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
    // this injector is a potential match.
    if (value & mask) {
      return injector;
    }

    if (flags & InjectFlags.Self || flags & InjectFlags.Host && !sameHostView(injector)) {
      return null;
    }

    // If the current injector does not have the directive, check the bloom filters for the ancestor
    // injectors (cbf0 - cbf7). These filters capture *all* ancestor injectors.
    if (b7) {
      value = b6 ? (b5 ? injector.cbf7 : injector.cbf6) : (b5 ? injector.cbf5 : injector.cbf4);
    } else {
      value = b6 ? (b5 ? injector.cbf3 : injector.cbf2) : (b5 ? injector.cbf1 : injector.cbf0);
    }

    // If the ancestor bloom filter value has the bit corresponding to the directive, traverse up to
    // find the specific injector. If the ancestor bloom filter does not have the bit, we can abort.
    if (value & mask) {
      injector = injector.parent;
    } else {
      return null;
    }
  }

  return null;
}

/**
 * Checks whether the current injector and its parent are in the same host view.
 *
 * This is necessary to support @Host() decorators. If @Host() is set, we should stop searching once
 * the injector and its parent view don't match because it means we'd cross the view boundary.
 */
function sameHostView(injector: LInjector): boolean {
  return !!injector.parent && injector.parent.view === injector.view;
}

export class NodeInjector implements Injector {
  constructor(private _lInjector: LInjector) {}

  get(token: any): any {
    if (token === Renderer2) {
      return getOrCreateRenderer2(this._lInjector);
    }

    setEnvironment(this._lInjector.tNode, this._lInjector.view);
    return getOrCreateInjectable(this._lInjector, token);
  }
}
export function getFactoryOf<T>(type: Type<any>): ((type?: Type<T>) => T)|null {
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
