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

import {assertDefined} from './assert';
import {getComponentDef, getDirectiveDef, getPipeDef} from './definition';
import {NG_ELEMENT_ID} from './fields';
import {_getViewData, assertPreviousIsParent, getPreviousOrParentTNode, resolveDirective, setEnvironment} from './instructions';
import {DirectiveDef} from './interfaces/definition';
import {INJECTOR_SIZE, InjectorLocationFlags, PARENT_INJECTOR, TNODE,} from './interfaces/injector';
import {AttributeMarker, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeType} from './interfaces/node';
import {isProceduralRenderer} from './interfaces/renderer';
import {DECLARATION_VIEW, DIRECTIVES, HOST_NODE, INJECTOR, LViewData, PARENT, RENDERER, TData, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';

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
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export function bloomAdd(injectorIndex: number, tView: TView, type: Type<any>): void {
  if (tView.firstTemplatePass) {
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
    const tData = tView.data as number[];

    if (b7) {
      b6 ? (b5 ? (tData[injectorIndex + 7] |= mask) : (tData[injectorIndex + 6] |= mask)) :
           (b5 ? (tData[injectorIndex + 5] |= mask) : (tData[injectorIndex + 4] |= mask));
    } else {
      b6 ? (b5 ? (tData[injectorIndex + 3] |= mask) : (tData[injectorIndex + 2] |= mask)) :
           (b5 ? (tData[injectorIndex + 1] |= mask) : (tData[injectorIndex] |= mask));
    }
  }
}

export function getOrCreateNodeInjector(): number {
  ngDevMode && assertPreviousIsParent();
  return getOrCreateNodeInjectorForNode(
      getPreviousOrParentTNode() as TElementNode | TElementContainerNode | TContainerNode,
      _getViewData());
}

/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param hostView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(
    tNode: TElementNode | TContainerNode | TElementContainerNode, hostView: LViewData): number {
  const existingInjectorIndex = getInjectorIndex(tNode, hostView);
  if (existingInjectorIndex !== -1) {
    return existingInjectorIndex;
  }

  const tView = hostView[TVIEW];
  if (tView.firstTemplatePass) {
    // TODO(kara): Store node injector with host bindings for that node (see VIEW_DATA.md)
    tNode.injectorIndex = hostView.length;
    setUpBloom(tView.data, tNode);  // foundation for node bloom
    setUpBloom(hostView, null);     // foundation for cumulative bloom
    setUpBloom(tView.blueprint, null);
    tView.hostBindingStartIndex += INJECTOR_SIZE;
  }

  const parentLoc = getParentInjectorLocation(tNode, hostView);
  const parentIndex = parentLoc & InjectorLocationFlags.InjectorIndexMask;
  const parentView: LViewData = getParentInjectorView(parentLoc, hostView);

  const parentData = parentView[TVIEW].data as any;
  const injectorIndex = tNode.injectorIndex;

  // If a parent injector can't be found, its location is set to -1.
  // In that case, we don't need to set up a cumulative bloom
  if (parentLoc !== -1) {
    for (let i = 0; i < PARENT_INJECTOR; i++) {
      const bloomIndex = parentIndex + i;
      // Creates a cumulative bloom filter that merges the parent's bloom filter
      // and its own cumulative bloom (which contains tokens for all ancestors)
      hostView[injectorIndex + i] = parentView[bloomIndex] | parentData[bloomIndex];
    }
  }

  hostView[injectorIndex + PARENT_INJECTOR] = parentLoc;
  return injectorIndex;
}

function setUpBloom(arr: any[], footer: TNode | null) {
  arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}

export function getInjectorIndex(tNode: TNode, hostView: LViewData): number {
  if (tNode.injectorIndex === -1 ||
      // If the injector index is the same as its parent's injector index, then the index has been
      // copied down from the parent node. No injector has been created yet on this node.
      (tNode.parent && tNode.parent.injectorIndex === tNode.injectorIndex) ||
      // After the first template pass, the injector index might exist but the parent values
      // might not have been calculated yet for this instance
      hostView[tNode.injectorIndex + PARENT_INJECTOR] == null) {
    return -1;
  } else {
    return tNode.injectorIndex;
  }
}

/**
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 */
export function getParentInjectorLocation(tNode: TNode, view: LViewData): number {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    return tNode.parent.injectorIndex;  // view offset is 0
  }

  // For most cases, the parent injector index can be found on the host node (e.g. for component
  // or container), so this loop will be skipped, but we must keep the loop here to support
  // the rarer case of deeply nested <ng-template> tags or inline views.
  let hostTNode = view[HOST_NODE];
  let viewOffset = 1;
  while (hostTNode && hostTNode.injectorIndex === -1) {
    view = view[DECLARATION_VIEW] !;
    hostTNode = view[HOST_NODE] !;
    viewOffset++;
  }
  return hostTNode ?
      hostTNode.injectorIndex | (viewOffset << InjectorLocationFlags.ViewOffsetShift) :
      -1;
}

/**
 * Unwraps a parent injector location number to find the view offset from the current injector,
 * then walks up the declaration view tree until the view is found that contains the parent
 * injector.
 *
 * @param location The location of the parent injector, which contains the view offset
 * @param startView The LViewData instance from which to start walking up the view tree
 * @returns The LViewData instance that contains the parent injector
 */
export function getParentInjectorView(location: number, startView: LViewData): LViewData {
  let viewOffset = location >> InjectorLocationFlags.ViewOffsetShift;
  let parentView = startView;
  // For most cases, the parent injector can be found on the host node (e.g. for component
  // or container), but we must keep the loop here to support the rarer case of deeply nested
  // <ng-template> tags or inline views, where the parent injector might live many views
  // above the child injector.
  while (viewOffset > 0) {
    parentView = parentView[DECLARATION_VIEW] !;
    viewOffset--;
  }
  return parentView;
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param def The definition of the directive to be made public
 */
export function diPublicInInjector(
    injectorIndex: number, view: LViewData, def: DirectiveDef<any>): void {
  bloomAdd(injectorIndex, view[TVIEW], def.type);
}

/**
 * Makes a directive public to the DI system by adding it to an injector's bloom filter.
 *
 * @param def The definition of the directive to be made public
 */
export function diPublic(def: DirectiveDef<any>): void {
  diPublicInInjector(getOrCreateNodeInjector(), _getViewData(), def);
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
  return getOrCreateInjectable<T>(getOrCreateNodeInjector(), _getViewData(), token, flags);
}

export function injectRenderer2(): Renderer2 {
  return getOrCreateRenderer2(_getViewData());
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

function getOrCreateRenderer2(view: LViewData): Renderer2 {
  const renderer = view[RENDERER];
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
    startInjectorIndex: number, hostView: LViewData, token: Type<T>| InjectionToken<T>,
    flags: InjectFlags = InjectFlags.Default): T|null {
  const bloomHash = bloomHashBitOrFactory(token);
  // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
  // so just call the factory function to create it.
  if (typeof bloomHash === 'function') return bloomHash();

  // If the token has a bloom hash, then it is a directive that is public to the injection system
  // (diPublic) otherwise fall back to the module injector.
  if (bloomHash != null) {
    let injectorIndex = startInjectorIndex;
    let injectorView = hostView;

    if (flags & InjectFlags.SkipSelf) {
      const parentLocation = injectorView[injectorIndex + PARENT_INJECTOR];
      injectorIndex = parentLocation & InjectorLocationFlags.InjectorIndexMask;
      injectorView = getParentInjectorView(parentLocation, injectorView);
    }

    while (injectorIndex !== -1) {
      // Traverse up the injector tree until we find a potential match or until we know there
      // *isn't* a match. Outer loop is necessary in case we get a false positive injector.
      while (injectorIndex !== -1) {
        // Check the current injector. If it matches, stop searching for an injector.
        if (injectorHasToken(bloomHash, injectorIndex, injectorView[TVIEW].data)) {
          break;
        }

        if (flags & InjectFlags.Self ||
            flags & InjectFlags.Host &&
                !sameHostView(injectorView[injectorIndex + PARENT_INJECTOR])) {
          injectorIndex = -1;
          break;
        }

        // If the ancestor bloom filter value has the bit corresponding to the directive, traverse
        // up to find the specific injector. If the ancestor bloom filter does not have the bit, we
        // can abort.
        if (injectorHasToken(bloomHash, injectorIndex, injectorView)) {
          const parentLocation = injectorView[injectorIndex + PARENT_INJECTOR];
          injectorIndex = parentLocation & InjectorLocationFlags.InjectorIndexMask;
          injectorView = getParentInjectorView(parentLocation, injectorView);
        } else {
          injectorIndex = -1;
          break;
        }
      }

      // If no injector is found, we *know* that there is no ancestor injector that contains the
      // token, so we abort.
      if (injectorIndex === -1) {
        break;
      }

      // At this point, we have an injector which *may* contain the token, so we step through the
      // directives associated with the injector's corresponding node to get the directive instance.
      let instance: T|null;
      if (instance = searchDirectivesOnInjector<T>(injectorIndex, injectorView, token)) {
        return instance;
      }

      // If we *didn't* find the directive for the token and we are searching the current node's
      // injector, it's possible the directive is on this node and hasn't been created yet.
      if (injectorIndex === startInjectorIndex && hostView === injectorView &&
          (instance = searchMatchesQueuedForCreation<T>(token, injectorView[TVIEW]))) {
        return instance;
      }

      // The def wasn't found anywhere on this node, so it was a false positive.
      // Traverse up the tree and continue searching.
      const parentLocation = injectorView[injectorIndex + PARENT_INJECTOR];
      injectorIndex = parentLocation & InjectorLocationFlags.InjectorIndexMask;
      injectorView = getParentInjectorView(parentLocation, injectorView);
    }
  }

  const moduleInjector = hostView[INJECTOR];
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
      const def = matches[i] as DirectiveDef<any>;
      if (def.type === token) {
        return resolveDirective(def, i + 1, matches, hostTView);
      }
    }
  }
  return null;
}

function searchDirectivesOnInjector<T>(
    injectorIndex: number, injectorView: LViewData, token: Type<T>| InjectionToken<T>) {
  const tNode = injectorView[TVIEW].data[injectorIndex + TNODE] as TNode;
  const nodeFlags = tNode.flags;
  const count = nodeFlags & TNodeFlags.DirectiveCountMask;

  if (count !== 0) {
    const start = nodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
    const end = start + count;
    const defs = injectorView[TVIEW].directives !;

    for (let i = start; i < end; i++) {
      // Get the definition for the directive at this index and, if it is injectable (diPublic),
      // and matches the given token, return the directive instance.
      const directiveDef = defs[i] as DirectiveDef<any>;
      if (directiveDef.type === token && directiveDef.diPublic) {
        return injectorView[DIRECTIVES] ![i];
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
export function bloomHashBitOrFactory(token: Type<any>| InjectionToken<any>): number|Function|
    undefined {
  const tokenId: number|undefined = (token as any)[NG_ELEMENT_ID];
  return typeof tokenId === 'number' ? tokenId & BLOOM_MASK : tokenId;
}

export function injectorHasToken(
    bloomHash: number, injectorIndex: number, injectorView: LViewData | TData) {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomHash;
  const b7 = bloomHash & 0x80;
  const b6 = bloomHash & 0x40;
  const b5 = bloomHash & 0x20;

  // Our bloom filter size is 256 bits, which is eight 32-bit bloom filter buckets:
  // bf0 = [0 - 31], bf1 = [32 - 63], bf2 = [64 - 95], bf3 = [96 - 127], etc.
  // Get the bloom filter value from the appropriate bucket based on the directive's bloomBit.
  let value: number;

  if (b7) {
    value = b6 ? (b5 ? injectorView[injectorIndex + 7] : injectorView[injectorIndex + 6]) :
                 (b5 ? injectorView[injectorIndex + 5] : injectorView[injectorIndex + 4]);
  } else {
    value = b6 ? (b5 ? injectorView[injectorIndex + 3] : injectorView[injectorIndex + 2]) :
                 (b5 ? injectorView[injectorIndex + 1] : injectorView[injectorIndex]);
  }

  // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
  // this injector is a potential match.
  return !!(value & mask);
}


/**
 * Checks whether the current injector and its parent are in the same host view.
 *
 * This is necessary to support @Host() decorators. If @Host() is set, we should stop searching once
 * the injector and its parent view don't match because it means we'd cross the view boundary.
 */
function sameHostView(parentLocation: number): boolean {
  return !!parentLocation && (parentLocation >> InjectorLocationFlags.ViewOffsetShift) === 0;
}

export class NodeInjector implements Injector {
  private _injectorIndex: number;

  constructor(
      private _tNode: TElementNode|TContainerNode|TElementContainerNode,
      private _hostView: LViewData) {
    this._injectorIndex = getOrCreateNodeInjectorForNode(_tNode, _hostView);
  }

  get(token: any): any {
    if (token === Renderer2) {
      return getOrCreateRenderer2(this._hostView);
    }

    setEnvironment(this._tNode, this._hostView);
    return getOrCreateInjectable(this._injectorIndex, this._hostView, token);
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
