/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setInjectImplementation} from '../../di/fallback/inject_impl';
import {injectRootLimpMode} from '../../di/fallback/limp_mode_injector';
import {InjectionToken} from '../../di/interfaces/injection_token';
import {IInjector, InjectFlags} from '../../di/interfaces/injector';
import {Type} from '../../interfaces/type';
import {stringify} from '../../utils/stringify';
import {DirectiveDef} from '../interfaces/definition';
import {NO_PARENT_INJECTOR, NodeInjectorFactory, PARENT_INJECTOR, RelativeInjectorLocation, RelativeInjectorLocationFlags, TNODE, isFactory} from '../interfaces/injector';
import {TContainerNode, TElementContainerNode, TElementNode, TNode, TNodeProviderIndexes, TNodeType} from '../interfaces/node';
import {DECLARATION_VIEW, HOST_NODE, INJECTOR, LView, TData, TVIEW, TView} from '../interfaces/view';
import {getLView, getPreviousOrParentTNode, setTNodeAndViewData} from '../state/state';
import {findComponentView, getParentInjectorIndex, getParentInjectorView, isComponent, isComponentDef} from '../utils/util';

import {bloomHasToken, bloomHashBitOrFactory} from './bloom';

export function injectInjector() {
  const tNode = getPreviousOrParentTNode() as TElementNode | TContainerNode | TElementContainerNode;
  return new NodeInjector(tNode, getLView());
}

export class NodeInjector implements IInjector {
  constructor(
      private _tNode: TElementNode|TContainerNode|TElementContainerNode|null,
      private _lView: LView) {}

  get(token: any, notFoundValue?: any): any {
    return getOrCreateInjectable(this._tNode, this._lView, token, undefined, notFoundValue);
  }
}

/**
 * Returns the value associated to the given token from the NodeInjectors => ModuleInjector.
 *
 * Look for the injector providing the token by walking up the node injector tree and then
 * the module injector tree.
 *
 * @param tNode The Node where the search for the injector should start
 * @param lView The `LView` that contains the `tNode`
 * @param token The token to look for
 * @param flags Injection flags
 * @param notFoundValue The value to return when the injection flags is `InjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
export function getOrCreateInjectable<T>(
    tNode: TElementNode | TContainerNode | TElementContainerNode | null, lView: LView,
    token: Type<T>| InjectionToken<T>, flags: InjectFlags = InjectFlags.Default,
    notFoundValue?: any): T|null {
  if (tNode) {
    const bloomHash = bloomHashBitOrFactory(token);
    // If the ID stored here is a function, this is a special object like ElementRef or TemplateRef
    // so just call the factory function to create it.
    if (typeof bloomHash === 'function') {
      const savePreviousOrParentTNode = getPreviousOrParentTNode();
      const saveLView = getLView();
      setTNodeAndViewData(tNode, lView);
      try {
        const value = bloomHash();
        if (value == null && !(flags & InjectFlags.Optional)) {
          throw new Error(`No provider for ${stringify(token)}!`);
        } else {
          return value;
        }
      } finally {
        setTNodeAndViewData(savePreviousOrParentTNode, saveLView);
      }
    } else if (typeof bloomHash == 'number') {
      // If the token has a bloom hash, then it is a token which could be in NodeInjector.

      // A reference to the previous injector TView that was found while climbing the element
      // injector tree. This is used to know if viewProviders can be accessed on the current
      // injector.
      let previousTView: TView|null = null;
      let injectorIndex = getInjectorIndex(tNode, lView);
      let parentLocation: RelativeInjectorLocation = NO_PARENT_INJECTOR;
      let hostTElementNode: TNode|null =
          flags & InjectFlags.Host ? findComponentView(lView)[HOST_NODE] : null;

      // If we should skip this injector, or if there is no injector on this node, start by
      // searching
      // the parent injector.
      if (injectorIndex === -1 || flags & InjectFlags.SkipSelf) {
        parentLocation = injectorIndex === -1 ? getParentInjectorLocation(tNode, lView) :
                                                lView[injectorIndex + PARENT_INJECTOR];

        if (!shouldSearchParent(flags, false)) {
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
        parentLocation = lView[injectorIndex + PARENT_INJECTOR];

        // Check the current injector. If it matches, see if it contains token.
        const tView = lView[TVIEW];
        if (bloomHasToken(bloomHash, injectorIndex, tView.data)) {
          // At this point, we have an injector which *may* contain the token, so we step through
          // the providers and directives associated with the injector's corresponding node to get
          // the instance.
          const instance: T|null = searchTokensOnInjector<T>(
              injectorIndex, lView, token, previousTView, flags, hostTElementNode);
          if (instance !== NOT_FOUND) {
            return instance;
          }
        }
        if (shouldSearchParent(
                flags, lView[TVIEW].data[injectorIndex + TNODE] === hostTElementNode) &&
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
  }

  if (flags & InjectFlags.Optional && notFoundValue === undefined) {
    // This must be set or the NullInjector will throw for optional deps
    notFoundValue = null;
  }

  if ((flags & (InjectFlags.Self | InjectFlags.Host)) === 0) {
    const moduleInjector = lView[INJECTOR];
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

export function getInjectorIndex(tNode: TNode, hostView: LView): number {
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

/** Returns true if flags prevent parent injector from being searched for tokens */
function shouldSearchParent(flags: InjectFlags, isFirstHostTNode: boolean): boolean|number {
  return !(flags & InjectFlags.Self) && !(flags & InjectFlags.Host && isFirstHostTNode);
}

const NOT_FOUND = {};

function searchTokensOnInjector<T>(
    injectorIndex: number, lView: LView, token: Type<T>| InjectionToken<T>,
    previousTView: TView | null, flags: InjectFlags, hostTElementNode: TNode | null) {
  const currentTView = lView[TVIEW];
  const tNode = currentTView.data[injectorIndex + TNODE] as TNode;
  // First, we need to determine if view providers can be accessed by the starting element.
  // There are two possibities
  const canAccessViewProviders = previousTView == null ?
      // 1) This is the first invocation `previousTView == null` which means that we are at the
      // `TNode` of where injector is starting to look. In such a case the only time we are allowed
      // to look into the ViewProviders is if:
      // - we are on a component
      // - AND the injector set `includeViewProviders` to true (implying that the token can see
      // ViewProviders because it is the Component or a Service which itself was declared in
      // ViewProviders)
      (isComponent(tNode) && includeViewProviders) :
      // 2) `previousTView != null` which means that we are now walking across the parent nodes.
      // In such a case we are only allowed to look into the ViewProviders if:
      // - We just crossed from child View to Parent View `previousTView != currentTView`
      // - AND the parent TNode is an Element.
      // This means that we just came from the Component's View and therefore are allowed to see
      // into the ViewProviders.
      (previousTView != currentTView && (tNode.type === TNodeType.Element));

  // This special case happens when there is a @host on the inject and when we are searching
  // on the host element node.
  const isHostSpecialCase = (flags & InjectFlags.Host) && hostTElementNode === tNode;

  const injectableIdx =
      locateDirectiveOrProvider(tNode, lView, token, canAccessViewProviders, isHostSpecialCase);
  if (injectableIdx !== null) {
    return getNodeInjectable(currentTView.data, lView, injectableIdx, tNode as TElementNode);
  } else {
    return NOT_FOUND;
  }
}

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

function setIncludeViewProviders(v: boolean): boolean {
  const oldValue = includeViewProviders;
  includeViewProviders = v;
  return oldValue;
}

/**
* Retrieve or instantiate the injectable from the `lData` at particular `index`.
*
* This function checks to see if the value has already been instantiated and if so returns the
* cached `injectable`. Otherwise if it detects that the value is still a factory it
* instantiates the `injectable` and caches the value.
*/
export function getNodeInjectable(
    tData: TData, lData: LView, index: number, tNode: TElementNode): any {
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
    const saveLView = getLView();
    setTNodeAndViewData(tNode, lData);
    try {
      value = lData[index] = factory.factory(null, tData, lData, tNode);
      const tView = lData[TVIEW];
      if (value && factory.isProvider && value.ngOnDestroy) {
        (tView.destroyHooks || (tView.destroyHooks = [])).push(index, value.ngOnDestroy);
      }
    } finally {
      if (factory.injectImpl) setInjectImplementation(previousInjectImplementation);
      setIncludeViewProviders(previousIncludeViewProviders);
      factory.resolving = false;
      setTNodeAndViewData(savePreviousOrParentTNode, saveLView);
    }
  }
  return value;
}


/**
 * Searches for the given token among the node's directives and providers.
 *
 * @param tNode TNode on which directives are present.
 * @param lView The view we are currently processing
 * @param token Provider token or type of a directive to look for.
 * @param canAccessViewProviders Whether view providers should be considered.
 * @param isHostSpecialCase Whether the host special case applies.
 * @returns Index of a found directive or provider, or null when none found.
 */
export function locateDirectiveOrProvider<T>(
    tNode: TNode, lView: LView, token: Type<T>| InjectionToken<T>, canAccessViewProviders: boolean,
    isHostSpecialCase: boolean | number): number|null {
  const tView = lView[TVIEW];
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
    const providerTokenOrDef = tInjectables[i] as InjectionToken<any>| Type<any>| DirectiveDef<any>;
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
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 *
 * Returns a combination of number of `ViewData` we have to go up and index in that `Viewdata`
 */
export function getParentInjectorLocation(tNode: TNode, view: LView): RelativeInjectorLocation {
  if (tNode.parent && tNode.parent.injectorIndex !== -1) {
    return tNode.parent.injectorIndex as any;  // ViewOffset is 0
  }

  // For most cases, the parent injector index can be found on the host node (e.g. for component
  // or container), so this loop will be skipped, but we must keep the loop here to support
  // the rarer case of deeply nested <ng-template> tags or inline views.
  let hostTNode = view[HOST_NODE];
  let viewOffset = 1;
  while (hostTNode && hostTNode.injectorIndex === -1) {
    view = view[DECLARATION_VIEW] !;
    hostTNode = view ? view[HOST_NODE] : null;
    viewOffset++;
  }

  return hostTNode ?
      hostTNode.injectorIndex | (viewOffset << RelativeInjectorLocationFlags.ViewOffsetShift) :
      -1 as any;
}
