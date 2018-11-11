/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getInjectableDef, getInjectorDef} from '../di/defs';
import {InjectionToken} from '../di/injection_token';
import {Injector} from '../di/injector';
import {InjectFlags, injectRootLimpMode, setInjectImplementation} from '../di/injector_compatibility';
import {Type} from '../type';

import {assertDefined, assertEqual} from './assert';
import {getComponentDef, getDirectiveDef, getPipeDef} from './definition';
import {NG_ELEMENT_ID} from './fields';
import {DirectiveDef} from './interfaces/definition';
import {NO_PARENT_INJECTOR, NodeInjectorFactory, PARENT_INJECTOR, RelativeInjectorLocation, RelativeInjectorLocationFlags, TNODE, isFactory} from './interfaces/injector';
import {AttributeMarker, TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeFlags, TNodeProviderIndexes, TNodeType} from './interfaces/node';
import {DECLARATION_VIEW, HOST_NODE, INJECTOR, LViewData, TData, TVIEW, TView} from './interfaces/view';
import {assertNodeOfPossibleTypes} from './node_assert';
import {getPreviousOrParentTNode, getViewData, setTNodeAndViewData} from './state';
import {getParentInjectorIndex, getParentInjectorView, hasParentInjector, isComponent, stringify} from './util';

/**
 * Defines if the call to `inject` should include `viewProviders` in its resolution.
 *
 * This is set to true when we try to instantiate a component. This value is reset in
 * `getNodeInjectable` to a value which matches the declaration location of the token about to be
 * instantiated. This is done so that if we are injecting a token which was declared outside of
 * `viewProviders` we don't accidentally pull `viewProviders` in.
 *
 * Example:
 *
 * ```
 * @Injectable()
 * class MyService {
 *   constructor(public value: String) {}
 * }
 *
 * @Component({
 *   providers: [
 *     MyService,
 *     {provide: String, value: 'providers' }
 *   ]
 *   viewProviders: [
 *     {provide: String, value: 'viewProviders'}
 *   ]
 * })
 * class MyComponent {
 *   constructor(myService: MyService, value: String) {
 *     // We expect that Component can see into `viewProviders`.
 *     expect(value).toEqual('viewProviders');
 *     // `MyService` was not declared in `viewProviders` hence it can't see it.
 *     expect(myService.value).toEqual('providers');
 *   }
 * }
 *
 * ```
 */
let includeViewProviders = false;

function setIncludeViewProviders(v: boolean): boolean {
  const oldValue = includeViewProviders;
  includeViewProviders = v;
  return oldValue;
}

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
export function bloomAdd(
    injectorIndex: number, tView: TView, type: Type<any>| InjectionToken<any>): void {
  ngDevMode && assertEqual(tView.firstTemplatePass, true, 'expected firstTemplatePass to be true');
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
  const parentView: LViewData = getParentInjectorView(parentLoc, hostView);

  const injectorIndex = tNode.injectorIndex;

  // If a parent injector can't be found, its location is set to -1.
  // In that case, we don't need to set up a cumulative bloom
  if (hasParentInjector(parentLoc)) {
    const parentData = parentView[TVIEW].data as any;
    // Creates a cumulative bloom filter that merges the parent's bloom filter
    // and its own cumulative bloom (which contains tokens for all ancestors)
    for (let i = 0; i < 8; i++) {
      hostView[injectorIndex + i] = parentView[parentIndex + i] | parentData[parentIndex + i];
    }
  }

  hostView[injectorIndex + PARENT_INJECTOR] = parentLoc;
  return injectorIndex;
}

function insertBloom(arr: any[], footer: TNode | null): void {
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
 *
 * Returns a combination of number of `ViewData` we have to go up and index in that `Viewdata`
 */
export function getParentInjectorLocation(tNode: TNode, view: LViewData): RelativeInjectorLocation {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    return tNode.parent.injectorIndex as any;  // ViewOffset is 0, AcrossHostBoundary is 0
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
  const acrossHostBoundary = hostTNode && hostTNode.type === TNodeType.Element ?
      RelativeInjectorLocationFlags.AcrossHostBoundary :
      0;

  return hostTNode ?
      hostTNode.injectorIndex | (viewOffset << RelativeInjectorLocationFlags.ViewOffsetShift) |
          acrossHostBoundary :
      -1 as any;
}

/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export function diPublicInInjector(
    injectorIndex: number, view: LViewData, token: InjectionToken<any>| Type<any>): void {
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
export function injectAttributeImpl(tNode: TNode, attrNameToInject: string): string|undefined {
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


/**
 * Returns the value associated to the given token from the NodeInjectors => ModuleInjector.
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
    tNode: TElementNode | TContainerNode | TElementContainerNode, lViewData: LViewData,
    token: Type<T>| InjectionToken<T>, flags: InjectFlags = InjectFlags.Default,
    notFoundValue?: any): T|null {
  const bloomHash = bloomHashBitOrFactory(token);
  // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
  // so just call the factory function to create it.
  if (typeof bloomHash === 'function') {
    const savePreviousOrParentTNode = getPreviousOrParentTNode();
    const saveViewData = getViewData();
    setTNodeAndViewData(tNode, lViewData);
    try {
      const value = bloomHash();
      if (value == null && !(flags & InjectFlags.Optional)) {
        throw new Error(`No provider for ${stringify(token)}`);
      } else {
        return value;
      }
    } finally {
      setTNodeAndViewData(savePreviousOrParentTNode, saveViewData);
    }
  } else if (typeof bloomHash == 'number') {
    // If the token has a bloom hash, then it is a token which could be in NodeInjector.

    // A reference to the previous injector TView that was found while climbing the element injector
    // tree. This is used to know if viewProviders can be accessed on the current injector.
    let previousTView: TView|null = null;
    let injectorIndex = getInjectorIndex(tNode, lViewData);
    let parentLocation: RelativeInjectorLocation = NO_PARENT_INJECTOR;

    // If we should skip this injector, start by searching the parent injector.
    if (flags & InjectFlags.SkipSelf) {
      parentLocation = injectorIndex === -1 ? getParentInjectorLocation(tNode, lViewData) :
                                              lViewData[injectorIndex + PARENT_INJECTOR];

      if (!shouldSearchParent(flags, parentLocation)) {
        injectorIndex = -1;
      } else {
        previousTView = lViewData[TVIEW];
        injectorIndex = getParentInjectorIndex(parentLocation);
        lViewData = getParentInjectorView(parentLocation, lViewData);
      }
    }

    // Traverse up the injector tree until we find a potential match or until we know there
    // *isn't* a match.
    while (injectorIndex !== -1) {
      parentLocation = lViewData[injectorIndex + PARENT_INJECTOR];

      // Check the current injector. If it matches, see if it contains token.
      const tView = lViewData[TVIEW];
      if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
        // At this point, we have an injector which *may* contain the token, so we step through
        // the providers and directives associated with the injector's corresponding node to get
        // the instance.
        const instance: T|null =
            searchTokensOnInjector<T>(injectorIndex, lViewData, token, previousTView);
        if (instance !== NOT_FOUND) {
          return instance;
        }
      }
      if (shouldSearchParent(flags, parentLocation) &&
          bloomHasToken(bloomHash, injectorIndex, lViewData)) {
        // The def wasn't found anywhere on this node, so it was a false positive.
        // Traverse up the tree and continue searching.
        previousTView = tView;
        injectorIndex = getParentInjectorIndex(parentLocation);
        lViewData = getParentInjectorView(parentLocation, lViewData);
      } else {
        // If we should not search parent OR If the ancestor bloom filter value does not have the
        // bit corresponding to the directive we can give up on traversing up to find the specific
        // injector.
        injectorIndex = -1;
      }
    }
  }

  if (flags & InjectFlags.Optional && notFoundValue === undefined) {
    // This must be set or the NullInjector will throw for optional deps
    notFoundValue = null;
  }

  if ((flags & (InjectFlags.Self | InjectFlags.Host)) === 0) {
    const moduleInjector = lViewData[INJECTOR];
    if (moduleInjector) {
      return moduleInjector.get(token, notFoundValue, flags & InjectFlags.Optional);
    } else {
      return injectRootLimpMode(token, notFoundValue, flags & InjectFlags.Optional);
    }
  }
  if (flags & InjectFlags.Optional) {
    return notFoundValue;
  } else {
    throw new Error(`NodeInjector: NOT_FOUND [${stringify(token)}]`);
  }
}

const NOT_FOUND = {};

function searchTokensOnInjector<T>(
    injectorIndex: number, injectorView: LViewData, token: Type<T>| InjectionToken<T>,
    previousTView: TView | null) {
  const currentTView = injectorView[TVIEW];
  const tNode = currentTView.data[injectorIndex + TNODE] as TNode;
  const nodeFlags = tNode.flags;
  const nodeProviderIndexes = tNode.providerIndexes;
  const tInjectables = currentTView.data;
  // First, we step through providers
  let canAccessViewProviders = false;
  // We need to determine if view providers can be accessed by the starting element.
  // It happens in 2 cases:
  // 1) On the initial element injector , if we are instantiating a token which can see the
  // viewProviders of the component of that element. Such token are:
  // - the component itself (but not other directives)
  // - viewProviders tokens of the component (but not providers tokens)
  // 2) Upper in the element injector tree, if the starting element is actually in the view of
  // the current element. To determine this, we track the transition of view during the climb,
  // and check the host node of the current view to identify component views.
  if (previousTView == null && isComponent(tNode) && includeViewProviders ||
      previousTView != null && previousTView != currentTView &&
          (currentTView.node == null || currentTView.node !.type === TNodeType.Element)) {
    canAccessViewProviders = true;
  }
  const startInjectables = nodeProviderIndexes & TNodeProviderIndexes.ProvidersStartIndexMask;
  const startDirectives = nodeFlags >> TNodeFlags.DirectiveStartingIndexShift;
  const cptViewProvidersCount =
      nodeProviderIndexes >> TNodeProviderIndexes.CptViewProvidersCountShift;
  const startingIndex =
      canAccessViewProviders ? startInjectables : startInjectables + cptViewProvidersCount;
  const directiveCount = nodeFlags & TNodeFlags.DirectiveCountMask;
  for (let i = startingIndex; i < startDirectives + directiveCount; i++) {
    const providerTokenOrDef = tInjectables[i] as InjectionToken<any>| Type<any>| DirectiveDef<any>;
    if (i < startDirectives && token === providerTokenOrDef ||
        i >= startDirectives && (providerTokenOrDef as DirectiveDef<any>).type === token) {
      return getNodeInjectable(tInjectables, injectorView, i, tNode as TElementNode);
    }
  }
  return NOT_FOUND;
}

/**
* Retrieve or instantiate the injectable from the `lData` at particular `index`.
*
* This function checks to see if the value has already been instantiated and if so returns the
* cached `injectable`. Otherwise if it detects that the value is still a factory it
* instantiates the `injectable` and caches the value.
*/
export function getNodeInjectable(
    tData: TData, lData: LViewData, index: number, tNode: TElementNode): any {
  let value = lData[index];
  if (isFactory(value)) {
    const factory: NodeInjectorFactory = value;
    if (factory.resolving) {
      throw new Error(`Circular dep for ${stringify(tData[index])}`);
    }
    const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
    factory.resolving = true;
    let previousInjectImplementation;
    if (factory.injectImpl) {
      previousInjectImplementation = setInjectImplementation(factory.injectImpl);
    }
    const savePreviousOrParentTNode = getPreviousOrParentTNode();
    const saveViewData = getViewData();
    setTNodeAndViewData(tNode, lData);
    try {
      value = lData[index] = factory.factory(null, tData, lData, tNode);
    } finally {
      if (factory.injectImpl) setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      setTNodeAndViewData(savePreviousOrParentTNode, saveViewData);
    }
  }
  return value;
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
  ngDevMode && assertDefined(token, 'token must be defined');
  const tokenId: number|undefined = (token as any)[NG_ELEMENT_ID];
  return typeof tokenId === 'number' ? tokenId & BLOOM_MASK : tokenId;
}

export function bloomHasToken(
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

/** Returns true if flags prevent parent injector from being searched for tokens */
function shouldSearchParent(flags: InjectFlags, parentLocation: RelativeInjectorLocation): boolean|
    number {
  return !(
      flags & InjectFlags.Self ||
      (flags & InjectFlags.Host &&
       ((parentLocation as any as number) & RelativeInjectorLocationFlags.AcrossHostBoundary)));
}

export function injectInjector() {
  const tNode = getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode;
  return new NodeInjector(tNode, getViewData());
}

export class NodeInjector implements Injector {
  private _injectorIndex: number;

  constructor(
      private _tNode: TElementNode|TContainerNode|TElementContainerNode,
      private _hostView: LViewData) {
    this._injectorIndex = getOrCreateNodeInjectorForNode(_tNode, _hostView);
  }

  get(token: any): any {
    setTNodeAndViewData(this._tNode, this._hostView);
    return getOrCreateInjectable(this._tNode, this._hostView, token);
  }
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
