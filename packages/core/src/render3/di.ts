/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isForwardRef, resolveForwardRef} from '../di/forward_ref';
import {injectRootLimpMode, setInjectImplementation} from '../di/inject_switch';
import {Injector} from '../di/injector';
import {convertToBitFlags} from '../di/injector_compatibility';
import {InjectorMarkers} from '../di/injector_marker';
import {InjectFlags, InjectOptions} from '../di/interface/injector';
import {ProviderToken} from '../di/provider_token';
import {Type} from '../interface/type';
import {assertDefined, assertEqual, assertIndexInRange} from '../util/assert';
import {noSideEffects} from '../util/closure';

import {assertDirectiveDef, assertNodeInjector, assertTNodeForLView} from './assert';
import {FactoryFn, getFactoryDef} from './definition_factory';
import {throwCyclicDependencyError, throwProviderNotFoundError} from './errors_di';
import {NG_ELEMENT_ID, NG_FACTORY_DEF} from './fields';
import {registerPreOrderHooks} from './hooks';
import {DirectiveDef} from './interfaces/definition';
import {isFactory, NO_PARENT_INJECTOR, NodeInjectorFactory, NodeInjectorOffset, RelativeInjectorLocation, RelativeInjectorLocationFlags} from './interfaces/injector';
import {AttributeMarker, TContainerNode, TDirectiveHostNode, TElementContainerNode, TElementNode, TNode, TNodeProviderIndexes, TNodeType} from './interfaces/node';
import {isComponentDef, isComponentHost} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, DECLARATION_VIEW, EMBEDDED_VIEW_INJECTOR, FLAGS, INJECTOR, LView, LViewFlags, T_HOST, TData, TVIEW, TView, TViewType} from './interfaces/view';
import {assertTNodeType} from './node_assert';
import {enterDI, getCurrentTNode, getLView, leaveDI} from './state';
import {isNameOnlyAttributeMarker} from './util/attrs_utils';
import {getParentInjectorIndex, getParentInjectorView, hasParentInjector} from './util/injector_utils';
import {stringifyForError} from './util/stringify_utils';



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
let includeViewProviders = true;

export function setIncludeViewProviders(v: boolean): boolean {
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

/**
 * The number of bits that is represented by a single bloom bucket. JS bit operations are 32 bits,
 * so each bucket represents 32 distinct tokens which accounts for log2(32) = 5 bits of a bloom hash
 * number.
 */
const BLOOM_BUCKET_BITS = 5;

/** Counter used to generate unique IDs for directives. */
let nextNgElementId = 0;

/** Value used when something wasn't found by an injector. */
const NOT_FOUND = {};

/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export function bloomAdd(
    injectorIndex: number, tView: TView, type: ProviderToken<any>|string): void {
  ngDevMode && assertEqual(tView.firstCreatePass, true, 'expected firstCreatePass to be true');
  let id: number|undefined;
  if (typeof type === 'string') {
    id = type.charCodeAt(0) || 0;
  } else if (type.hasOwnProperty(NG_ELEMENT_ID)) {
    id = (type as any)[NG_ELEMENT_ID];
  }

  // Set a unique ID on the directive type, so if something tries to inject the directive,
  // we can easily retrieve the ID and hash it into the bloom bit that should be checked.
  if (id == null) {
    id = (type as any)[NG_ELEMENT_ID] = nextNgElementId++;
  }

  // We only have BLOOM_SIZE (256) slots in our bloom filter (8 buckets * 32 bits each),
  // so all unique IDs must be modulo-ed into a number from 0 - 255 to fit into the filter.
  const bloomHash = id & BLOOM_MASK;

  // Create a mask that targets the specific bit associated with the directive.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomHash;

  // Each bloom bucket in `tData` represents `BLOOM_BUCKET_BITS` number of bits of `bloomHash`.
  // Any bits in `bloomHash` beyond `BLOOM_BUCKET_BITS` indicate the bucket offset that the mask
  // should be written to.
  (tView.data as number[])[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)] |= mask;
}

/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param lView View where the node is stored
 * @returns Node injector
 */
export function getOrCreateNodeInjectorForNode(
    tNode: TElementNode|TContainerNode|TElementContainerNode, lView: LView): number {
  const existingInjectorIndex = getInjectorIndex(tNode, lView);
  if (existingInjectorIndex !== -1) {
    return existingInjectorIndex;
  }

  const tView = lView[TVIEW];
  if (tView.firstCreatePass) {
    tNode.injectorIndex = lView.length;
    insertBloom(tView.data, tNode);  // foundation for node bloom
    insertBloom(lView, null);        // foundation for cumulative bloom
    insertBloom(tView.blueprint, null);
  }

  const parentLoc = getParentInjectorLocation(tNode, lView);
  const injectorIndex = tNode.injectorIndex;

  // If a parent injector can't be found, its location is set to -1.
  // In that case, we don't need to set up a cumulative bloom
  if (hasParentInjector(parentLoc)) {
    const parentIndex = getParentInjectorIndex(parentLoc);
    const parentLView = getParentInjectorView(parentLoc, lView);
    const parentData = parentLView[TVIEW].data as any;
    // Creates a cumulative bloom filter that merges the parent's bloom filter
    // and its own cumulative bloom (which contains tokens for all ancestors)
    for (let i = 0; i < NodeInjectorOffset.BLOOM_SIZE; i++) {
      lView[injectorIndex + i] = parentLView[parentIndex + i] | parentData[parentIndex + i];
    }
  }

  lView[injectorIndex + NodeInjectorOffset.PARENT] = parentLoc;
  return injectorIndex;
}

function insertBloom(arr: any[], footer: TNode|null): void {
  arr.push(0, 0, 0, 0, 0, 0, 0, 0, footer);
}


export function getInjectorIndex(tNode: TNode, lView: LView): number {
  if (tNode.injectorIndex === -1 ||
      // If the injector index is the same as its parent's injector index, then the index has been
      // copied down from the parent node. No injector has been created yet on this node.
      (tNode.parent && tNode.parent.injectorIndex === tNode.injectorIndex) ||
      // After the first template pass, the injector index might exist but the parent values
      // might not have been calculated yet for this instance
      lView[tNode.injectorIndex + NodeInjectorOffset.PARENT] === null) {
    return -1;
  } else {
    ngDevMode && assertIndexInRange(lView, tNode.injectorIndex);
    return tNode.injectorIndex;
  }
}

/**
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 *
 * @returns Returns a number that is the combination of the number of LViews that we have to go up
 * to find the LView containing the parent inject AND the index of the injector within that LView.
 */
export function getParentInjectorLocation(tNode: TNode, lView: LView): RelativeInjectorLocation {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    // If we have a parent `TNode` and there is an injector associated with it we are done, because
    // the parent injector is within the current `LView`.
    return tNode.parent.injectorIndex as any;  // ViewOffset is 0
  }

  // When parent injector location is computed it may be outside of the current view. (ie it could
  // be pointing to a declared parent location). This variable stores number of declaration parents
  // we need to walk up in order to find the parent injector location.
  let declarationViewOffset = 0;
  let parentTNode: TNode|null = null;
  let lViewCursor: LView|null = lView;

  // The parent injector is not in the current `LView`. We will have to walk the declared parent
  // `LView` hierarchy and look for it. If we walk of the top, that means that there is no parent
  // `NodeInjector`.
  while (lViewCursor !== null) {
    parentTNode = getTNodeFromLView(lViewCursor);

    if (parentTNode === null) {
      // If we have no parent, than we are done.
      return NO_PARENT_INJECTOR;
    }

    ngDevMode && parentTNode && assertTNodeForLView(parentTNode!, lViewCursor[DECLARATION_VIEW]!);
    // Every iteration of the loop requires that we go to the declared parent.
    declarationViewOffset++;
    lViewCursor = lViewCursor[DECLARATION_VIEW];

    if (parentTNode.injectorIndex !== -1) {
      // We found a NodeInjector which points to something.
      return (parentTNode.injectorIndex |
              (declarationViewOffset << RelativeInjectorLocationFlags.ViewOffsetShift)) as any;
    }
  }
  return NO_PARENT_INJECTOR;
}
/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export function diPublicInInjector(
    injectorIndex: number, tView: TView, token: ProviderToken<any>): void {
  bloomAdd(injectorIndex, tView, token);
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
 * MyComponent.ɵcmp = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @publicApi
 */
export function injectAttributeImpl(tNode: TNode, attrNameToInject: string): string|null {
  ngDevMode && assertTNodeType(tNode, TNodeType.AnyContainer | TNodeType.AnyRNode);
  ngDevMode && assertDefined(tNode, 'expecting tNode');
  if (attrNameToInject === 'class') {
    return tNode.classes;
  }
  if (attrNameToInject === 'style') {
    return tNode.styles;
  }

  const attrs = tNode.attrs;
  if (attrs) {
    const attrsLength = attrs.length;
    let i = 0;
    while (i < attrsLength) {
      const value = attrs[i];

      // If we hit a `Bindings` or `Template` marker then we are done.
      if (isNameOnlyAttributeMarker(value)) break;

      // Skip namespaced attributes
      if (value === AttributeMarker.NamespaceURI) {
        // we skip the next two values
        // as namespaced attributes looks like
        // [..., AttributeMarker.NamespaceURI, 'http://someuri.com/test', 'test:exist',
        // 'existValue', ...]
        i = i + 2;
      } else if (typeof value === 'number') {
        // Skip to the first value of the marked attribute.
        i++;
        while (i < attrsLength && typeof attrs[i] === 'string') {
          i++;
        }
      } else if (value === attrNameToInject) {
        return attrs[i + 1] as string;
      } else {
        i = i + 2;
      }
    }
  }
  return null;
}


function notFoundValueOrThrow<T>(
    notFoundValue: T|null, token: ProviderToken<T>, flags: InjectFlags): T|null {
  if ((flags & InjectFlags.Optional) || notFoundValue !== undefined) {
    return notFoundValue;
  } else {
    throwProviderNotFoundError(token, 'NodeInjector');
  }
}

/**
 * Returns the value associated to the given token from the ModuleInjector or throws exception
 *
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector or throws an exception
 */
function lookupTokenUsingModuleInjector<T>(
    lView: LView, token: ProviderToken<T>, flags: InjectFlags, notFoundValue?: any): T|null {
  if ((flags & InjectFlags.Optional) && notFoundValue === undefined) {
    // This must be set or the NullInjector will throw for optional deps
    notFoundValue = null;
  }

  if ((flags & (InjectFlags.Self | InjectFlags.Host)) === 0) {
    const moduleInjector = lView[INJECTOR];
    // switch to `injectInjectorOnly` implementation for module injector, since module injector
    // should not have access to Component/Directive DI scope (that may happen through
    // `directiveInject` implementation)
    const previousInjectImplementation = setInjectImplementation(undefined);
    try {
      if (moduleInjector) {
        return moduleInjector.get(token, notFoundValue, flags & InjectFlags.Optional);
      } else {
        return injectRootLimpMode(token, notFoundValue, flags & InjectFlags.Optional);
      }
    } finally {
      setInjectImplementation(previousInjectImplementation);
    }
  }
  return notFoundValueOrThrow<T>(notFoundValue, token, flags);
}

/**
 * Returns the value associated to the given token from the NodeInjectors => ModuleInjector.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * This function patches `token` with `__NG_ELEMENT_ID__` which contains the id for the bloom
 * filter. `-1` is reserved for injecting `Injector` (implemented by `NodeInjector`)
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
export function getOrCreateInjectable<T>(
    tNode: TDirectiveHostNode|null, lView: LView, token: ProviderToken<T>,
    flags: InjectFlags = InjectFlags.Default, notFoundValue?: any): T|null {
  if (tNode !== null) {
    // If the view or any of its ancestors have an embedded
    // view injector, we have to look it up there first.
    if (lView[FLAGS] & LViewFlags.HasEmbeddedViewInjector) {
      const embeddedInjectorValue =
          lookupTokenUsingEmbeddedInjector(tNode, lView, token, flags, NOT_FOUND);
      if (embeddedInjectorValue !== NOT_FOUND) {
        return embeddedInjectorValue;
      }
    }

    // Otherwise try the node injector.
    const value = lookupTokenUsingNodeInjector(tNode, lView, token, flags, NOT_FOUND);
    if (value !== NOT_FOUND) {
      return value;
    }
  }

  // Finally, fall back to the module injector.
  return lookupTokenUsingModuleInjector<T>(lView, token, flags, notFoundValue);
}

/**
 * Returns the value associated to the given token from the node injector.
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
function lookupTokenUsingNodeInjector<T>(
    tNode: TDirectiveHostNode, lView: LView, token: ProviderToken<T>, flags: InjectFlags,
    notFoundValue?: any) {
  const bloomHash = bloomHashBitOrFactory(token);
  // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
  // so just call the factory function to create it.
  if (typeof bloomHash === 'function') {
    if (!enterDI(lView, tNode, flags)) {
      // Failed to enter DI, try module injector instead. If a token is injected with the @Host
      // flag, the module injector is not searched for that token in Ivy.
      return (flags & InjectFlags.Host) ?
          notFoundValueOrThrow<T>(notFoundValue, token, flags) :
          lookupTokenUsingModuleInjector<T>(lView, token, flags, notFoundValue);
    }
    try {
      const value = bloomHash(flags);
      if (value == null && !(flags & InjectFlags.Optional)) {
        throwProviderNotFoundError(token);
      } else {
        return value;
      }
    } finally {
      leaveDI();
    }
  } else if (typeof bloomHash === 'number') {
    // A reference to the previous injector TView that was found while climbing the element
    // injector tree. This is used to know if viewProviders can be accessed on the current
    // injector.
    let previousTView: TView|null = null;
    let injectorIndex = getInjectorIndex(tNode, lView);
    let parentLocation: RelativeInjectorLocation = NO_PARENT_INJECTOR;
    let hostTElementNode: TNode|null =
        flags & InjectFlags.Host ? lView[DECLARATION_COMPONENT_VIEW][T_HOST] : null;

    // If we should skip this injector, or if there is no injector on this node, start by
    // searching the parent injector.
    if (injectorIndex === -1 || flags & InjectFlags.SkipSelf) {
      parentLocation = injectorIndex === -1 ? getParentInjectorLocation(tNode, lView) :
                                              lView[injectorIndex + NodeInjectorOffset.PARENT];

      if (parentLocation === NO_PARENT_INJECTOR || !shouldSearchParent(flags, false)) {
        injectorIndex = -1;
      } else {
        previousTView = lView[TVIEW];
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      }
    }

    // Traverse up the injector tree until we find a potential match or until we know there
    // *isn't* a match.
    while (injectorIndex !== -1) {
      ngDevMode && assertNodeInjector(lView, injectorIndex);

      // Check the current injector. If it matches, see if it contains token.
      const tView = lView[TVIEW];
      ngDevMode &&
          assertTNodeForLView(tView.data[injectorIndex + NodeInjectorOffset.TNODE] as TNode, lView);
      if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
        // At this point, we have an injector which *may* contain the token, so we step through
        // the providers and directives associated with the injector's corresponding node to get
        // the instance.
        const instance: T|{}|null = searchTokensOnInjector<T>(
            injectorIndex, lView, token, previousTView, flags, hostTElementNode);
        if (instance !== NOT_FOUND) {
          return instance;
        }
      }
      parentLocation = lView[injectorIndex + NodeInjectorOffset.PARENT];
      if (parentLocation !== NO_PARENT_INJECTOR &&
          shouldSearchParent(
              flags,
              lView[TVIEW].data[injectorIndex + NodeInjectorOffset.TNODE] === hostTElementNode) &&
          bloomHasToken(bloomHash, injectorIndex, lView)) {
        // The def wasn't found anywhere on this node, so it was a false positive.
        // Traverse up the tree and continue searching.
        previousTView = tView;
        injectorIndex = getParentInjectorIndex(parentLocation);
        lView = getParentInjectorView(parentLocation, lView);
      } else {
        // If we should not search parent OR If the ancestor bloom filter value does not have the
        // bit corresponding to the directive we can give up on traversing up to find the specific
        // injector.
        injectorIndex = -1;
      }
    }
  }

  return notFoundValue;
}

function searchTokensOnInjector<T>(
    injectorIndex: number, lView: LView, token: ProviderToken<T>, previousTView: TView|null,
    flags: InjectFlags, hostTElementNode: TNode|null) {
  const currentTView = lView[TVIEW];
  const tNode = currentTView.data[injectorIndex + NodeInjectorOffset.TNODE] as TNode;
  // First, we need to determine if view providers can be accessed by the starting element.
  // There are two possibilities
  const canAccessViewProviders = previousTView == null ?
      // 1) This is the first invocation `previousTView == null` which means that we are at the
      // `TNode` of where injector is starting to look. In such a case the only time we are allowed
      // to look into the ViewProviders is if:
      // - we are on a component
      // - AND the injector set `includeViewProviders` to true (implying that the token can see
      // ViewProviders because it is the Component or a Service which itself was declared in
      // ViewProviders)
      (isComponentHost(tNode) && includeViewProviders) :
      // 2) `previousTView != null` which means that we are now walking across the parent nodes.
      // In such a case we are only allowed to look into the ViewProviders if:
      // - We just crossed from child View to Parent View `previousTView != currentTView`
      // - AND the parent TNode is an Element.
      // This means that we just came from the Component's View and therefore are allowed to see
      // into the ViewProviders.
      (previousTView != currentTView && ((tNode.type & TNodeType.AnyRNode) !== 0));

  // This special case happens when there is a @host on the inject and when we are searching
  // on the host element node.
  const isHostSpecialCase = (flags & InjectFlags.Host) && hostTElementNode === tNode;

  const injectableIdx = locateDirectiveOrProvider(
      tNode, currentTView, token, canAccessViewProviders, isHostSpecialCase);
  if (injectableIdx !== null) {
    return getNodeInjectable(lView, currentTView, injectableIdx, tNode as TElementNode);
  } else {
    return NOT_FOUND;
  }
}

/**
 * Searches for the given token among the node's directives and providers.
 *
 * @param tNode TNode on which directives are present.
 * @param tView The tView we are currently processing
 * @param token Provider token or type of a directive to look for.
 * @param canAccessViewProviders Whether view providers should be considered.
 * @param isHostSpecialCase Whether the host special case applies.
 * @returns Index of a found directive or provider, or null when none found.
 */
export function locateDirectiveOrProvider<T>(
    tNode: TNode, tView: TView, token: ProviderToken<T>|string, canAccessViewProviders: boolean,
    isHostSpecialCase: boolean|number): number|null {
  const nodeProviderIndexes = tNode.providerIndexes;
  const tInjectables = tView.data;

  const injectablesStart = nodeProviderIndexes & TNodeProviderIndexes.ProvidersStartIndexMask;
  const directivesStart = tNode.directiveStart;
  const directiveEnd = tNode.directiveEnd;
  const cptViewProvidersCount =
      nodeProviderIndexes >> TNodeProviderIndexes.CptViewProvidersCountShift;
  const startingIndex =
      canAccessViewProviders ? injectablesStart : injectablesStart + cptViewProvidersCount;
  // When the host special case applies, only the viewProviders and the component are visible
  const endIndex = isHostSpecialCase ? injectablesStart + cptViewProvidersCount : directiveEnd;
  for (let i = startingIndex; i < endIndex; i++) {
    const providerTokenOrDef = tInjectables[i] as ProviderToken<any>| DirectiveDef<any>| string;
    if (i < directivesStart && token === providerTokenOrDef ||
        i >= directivesStart && (providerTokenOrDef as DirectiveDef<any>).type === token) {
      return i;
    }
  }
  if (isHostSpecialCase) {
    const dirDef = tInjectables[directivesStart] as DirectiveDef<any>;
    if (dirDef && isComponentDef(dirDef) && dirDef.type === token) {
      return directivesStart;
    }
  }
  return null;
}

/**
 * Retrieve or instantiate the injectable from the `LView` at particular `index`.
 *
 * This function checks to see if the value has already been instantiated and if so returns the
 * cached `injectable`. Otherwise if it detects that the value is still a factory it
 * instantiates the `injectable` and caches the value.
 */
export function getNodeInjectable(
    lView: LView, tView: TView, index: number, tNode: TDirectiveHostNode): any {
  let value = lView[index];
  const tData = tView.data;
  if (isFactory(value)) {
    const factory: NodeInjectorFactory = value;
    if (factory.resolving) {
      throwCyclicDependencyError(stringifyForError(tData[index]));
    }
    const previousIncludeViewProviders = setIncludeViewProviders(factory.canSeeViewProviders);
    factory.resolving = true;
    const previousInjectImplementation =
        factory.injectImpl ? setInjectImplementation(factory.injectImpl) : null;
    const success = enterDI(lView, tNode, InjectFlags.Default);
    ngDevMode &&
        assertEqual(
            success, true,
            'Because flags do not contain \`SkipSelf\' we expect this to always succeed.');
    try {
      value = lView[index] = factory.factory(undefined, tData, lView, tNode);
      // This code path is hit for both directives and providers.
      // For perf reasons, we want to avoid searching for hooks on providers.
      // It does no harm to try (the hooks just won't exist), but the extra
      // checks are unnecessary and this is a hot path. So we check to see
      // if the index of the dependency is in the directive range for this
      // tNode. If it's not, we know it's a provider and skip hook registration.
      if (tView.firstCreatePass && index >= tNode.directiveStart) {
        ngDevMode && assertDirectiveDef(tData[index]);
        registerPreOrderHooks(index, tData[index] as DirectiveDef<any>, tView);
      }
    } finally {
      previousInjectImplementation !== null &&
          setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      leaveDI();
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
 *   When the returned value is negative then it represents special values such as `Injector`.
 */
export function bloomHashBitOrFactory(token: ProviderToken<any>|string): number|Function|undefined {
  ngDevMode && assertDefined(token, 'token must be defined');
  if (typeof token === 'string') {
    return token.charCodeAt(0) || 0;
  }
  const tokenId: number|undefined =
      // First check with `hasOwnProperty` so we don't get an inherited ID.
      token.hasOwnProperty(NG_ELEMENT_ID) ? (token as any)[NG_ELEMENT_ID] : undefined;
  // Negative token IDs are used for special objects such as `Injector`
  if (typeof tokenId === 'number') {
    if (tokenId >= 0) {
      return tokenId & BLOOM_MASK;
    } else {
      ngDevMode &&
          assertEqual(tokenId, InjectorMarkers.Injector, 'Expecting to get Special Injector Id');
      return createNodeInjector;
    }
  } else {
    return tokenId;
  }
}

export function bloomHasToken(bloomHash: number, injectorIndex: number, injectorView: LView|TData) {
  // Create a mask that targets the specific bit associated with the directive we're looking for.
  // JS bit operations are 32 bits, so this will be a number between 2^0 and 2^31, corresponding
  // to bit positions 0 - 31 in a 32 bit integer.
  const mask = 1 << bloomHash;

  // Each bloom bucket in `injectorView` represents `BLOOM_BUCKET_BITS` number of bits of
  // `bloomHash`. Any bits in `bloomHash` beyond `BLOOM_BUCKET_BITS` indicate the bucket offset
  // that should be used.
  const value = injectorView[injectorIndex + (bloomHash >> BLOOM_BUCKET_BITS)];

  // If the bloom filter value has the bit corresponding to the directive's bloomBit flipped on,
  // this injector is a potential match.
  return !!(value & mask);
}

/** Returns true if flags prevent parent injector from being searched for tokens */
function shouldSearchParent(flags: InjectFlags, isFirstHostTNode: boolean): boolean|number {
  return !(flags & InjectFlags.Self) && !(flags & InjectFlags.Host && isFirstHostTNode);
}

export class NodeInjector implements Injector {
  constructor(
      private _tNode: TElementNode|TContainerNode|TElementContainerNode|null,
      private _lView: LView) {}

  get(token: any, notFoundValue?: any, flags?: InjectFlags|InjectOptions): any {
    return getOrCreateInjectable(
        this._tNode, this._lView, token, convertToBitFlags(flags), notFoundValue);
  }
}

/** Creates a `NodeInjector` for the current node. */
export function createNodeInjector(): Injector {
  return new NodeInjector(getCurrentTNode()! as TDirectiveHostNode, getLView()) as any;
}

/**
 * @codeGenApi
 */
export function ɵɵgetInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T {
  return noSideEffects(() => {
    const ownConstructor = type.prototype.constructor;
    const ownFactory = ownConstructor[NG_FACTORY_DEF] || getFactoryOf(ownConstructor);
    const objectPrototype = Object.prototype;
    let parent = Object.getPrototypeOf(type.prototype).constructor;

    // Go up the prototype until we hit `Object`.
    while (parent && parent !== objectPrototype) {
      const factory = parent[NG_FACTORY_DEF] || getFactoryOf(parent);

      // If we hit something that has a factory and the factory isn't the same as the type,
      // we've found the inherited factory. Note the check that the factory isn't the type's
      // own factory is redundant in most cases, but if the user has custom decorators on the
      // class, this lookup will start one level down in the prototype chain, causing us to
      // find the own factory first and potentially triggering an infinite loop downstream.
      if (factory && factory !== ownFactory) {
        return factory;
      }

      parent = Object.getPrototypeOf(parent);
    }

    // There is no factory defined. Either this was improper usage of inheritance
    // (no Angular decorator on the superclass) or there is no constructor at all
    // in the inheritance chain. Since the two cases cannot be distinguished, the
    // latter has to be assumed.
    return t => new t();
  });
}

function getFactoryOf<T>(type: Type<any>): ((type?: Type<T>) => T | null)|null {
  if (isForwardRef(type)) {
    return () => {
      const factory = getFactoryOf<T>(resolveForwardRef(type));
      return factory && factory();
    };
  }
  return getFactoryDef<T>(type);
}

/**
 * Returns a value from the closest embedded or node injector.
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
function lookupTokenUsingEmbeddedInjector<T>(
    tNode: TDirectiveHostNode, lView: LView, token: ProviderToken<T>, flags: InjectFlags,
    notFoundValue?: any) {
  let currentTNode: TDirectiveHostNode|null = tNode;
  let currentLView: LView|null = lView;

  // When an LView with an embedded view injector is inserted, it'll likely be interlaced with
  // nodes who may have injectors (e.g. node injector -> embedded view injector -> node injector).
  // Since the bloom filters for the node injectors have already been constructed and we don't
  // have a way of extracting the records from an injector, the only way to maintain the correct
  // hierarchy when resolving the value is to walk it node-by-node while attempting to resolve
  // the token at each level.
  while (currentTNode !== null && currentLView !== null &&
         (currentLView[FLAGS] & LViewFlags.HasEmbeddedViewInjector) &&
         !(currentLView[FLAGS] & LViewFlags.IsRoot)) {
    ngDevMode && assertTNodeForLView(currentTNode, currentLView);

    // Note that this lookup on the node injector is using the `Self` flag, because
    // we don't want the node injector to look at any parent injectors since we
    // may hit the embedded view injector first.
    const nodeInjectorValue = lookupTokenUsingNodeInjector(
        currentTNode, currentLView, token, flags | InjectFlags.Self, NOT_FOUND);
    if (nodeInjectorValue !== NOT_FOUND) {
      return nodeInjectorValue;
    }

    // Has an explicit type due to a TS bug: https://github.com/microsoft/TypeScript/issues/33191
    let parentTNode: TElementNode|TContainerNode|null = currentTNode.parent;

    // `TNode.parent` includes the parent within the current view only. If it doesn't exist,
    // it means that we've hit the view boundary and we need to go up to the next view.
    if (!parentTNode) {
      // Before we go to the next LView, check if the token exists on the current embedded injector.
      const embeddedViewInjector = currentLView[EMBEDDED_VIEW_INJECTOR];
      if (embeddedViewInjector) {
        const embeddedViewInjectorValue =
            embeddedViewInjector.get(token, NOT_FOUND as T | {}, flags);
        if (embeddedViewInjectorValue !== NOT_FOUND) {
          return embeddedViewInjectorValue;
        }
      }

      // Otherwise keep going up the tree.
      parentTNode = getTNodeFromLView(currentLView);
      currentLView = currentLView[DECLARATION_VIEW];
    }

    currentTNode = parentTNode;
  }

  return notFoundValue;
}

/** Gets the TNode associated with an LView inside of the declaration view. */
function getTNodeFromLView(lView: LView): TElementNode|TElementContainerNode|null {
  const tView = lView[TVIEW];
  const tViewType = tView.type;

  // The parent pointer differs based on `TView.type`.
  if (tViewType === TViewType.Embedded) {
    ngDevMode && assertDefined(tView.declTNode, 'Embedded TNodes should have declaration parents.');
    return tView.declTNode as TElementContainerNode;
  } else if (tViewType === TViewType.Component) {
    // Components don't have `TView.declTNode` because each instance of component could be
    // inserted in different location, hence `TView.declTNode` is meaningless.
    return lView[T_HOST] as TElementNode;
  }

  return null;
}
