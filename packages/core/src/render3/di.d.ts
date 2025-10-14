/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { InternalInjectFlags, InjectOptions } from '../di/interface/injector';
import { ProviderToken } from '../di/provider_token';
import { Type } from '../interface/type';
import { RelativeInjectorLocation } from './interfaces/injector';
import { TContainerNode, TDirectiveHostNode, TElementContainerNode, TElementNode, TNode } from './interfaces/node';
import { LView, TData, TView } from './interfaces/view';
export declare function setIncludeViewProviders(v: boolean): boolean;
/**
 * Registers this directive as present in its node's injector by flipping the directive's
 * corresponding bit in the injector's bloom filter.
 *
 * @param injectorIndex The index of the node injector where this token should be registered
 * @param tView The TView for the injector's bloom filters
 * @param type The directive token to register
 */
export declare function bloomAdd(injectorIndex: number, tView: TView, type: ProviderToken<any> | string): void;
/**
 * Creates (or gets an existing) injector for a given element or container.
 *
 * @param tNode for which an injector should be retrieved / created.
 * @param lView View where the node is stored
 * @returns Node injector
 */
export declare function getOrCreateNodeInjectorForNode(tNode: TElementNode | TContainerNode | TElementContainerNode, lView: LView): number;
export declare function getInjectorIndex(tNode: TNode, lView: LView): number;
/**
 * Finds the index of the parent injector, with a view offset if applicable. Used to set the
 * parent injector initially.
 *
 * @returns Returns a number that is the combination of the number of LViews that we have to go up
 * to find the LView containing the parent inject AND the index of the injector within that LView.
 */
export declare function getParentInjectorLocation(tNode: TNode, lView: LView): RelativeInjectorLocation;
/**
 * Makes a type or an injection token public to the DI system by adding it to an
 * injector's bloom filter.
 *
 * @param di The node injector in which a directive will be added
 * @param token The type or the injection token to be made public
 */
export declare function diPublicInInjector(injectorIndex: number, tView: TView, token: ProviderToken<any>): void;
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
 * ```ts
 * @Component(...)
 * class MyComponent {
 *   constructor(@Attribute('title') title: string) { ... }
 * }
 * ```
 * When instantiated with
 * ```html
 * <my-component title="Hello"></my-component>
 * ```
 *
 * Then factory method generated is:
 * ```ts
 * MyComponent.ɵcmp = defineComponent({
 *   factory: () => new MyComponent(injectAttribute('title'))
 *   ...
 * })
 * ```
 *
 * @publicApi
 */
export declare function injectAttributeImpl(tNode: TNode, attrNameToInject: string): string | null;
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
 * @param notFoundValue The value to return when the injection flags is `InternalInjectFlags.Optional`
 * @returns the value from the injector, `null` when not found, or `notFoundValue` if provided
 */
export declare function getOrCreateInjectable<T>(tNode: TDirectiveHostNode | null, lView: LView, token: ProviderToken<T>, flags?: InternalInjectFlags, notFoundValue?: any): T | null;
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
export declare function locateDirectiveOrProvider<T>(tNode: TNode, tView: TView, token: ProviderToken<T> | string, canAccessViewProviders: boolean, isHostSpecialCase: boolean | number): number | null;
/**
 * Retrieve or instantiate the injectable from the `LView` at particular `index`.
 *
 * This function checks to see if the value has already been instantiated and if so returns the
 * cached `injectable`. Otherwise if it detects that the value is still a factory it
 * instantiates the `injectable` and caches the value.
 */
export declare function getNodeInjectable(lView: LView, tView: TView, index: number, tNode: TDirectiveHostNode, flags?: InternalInjectFlags): any;
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
export declare function bloomHashBitOrFactory(token: ProviderToken<any> | string): number | Function | undefined;
export declare function bloomHasToken(bloomHash: number, injectorIndex: number, injectorView: LView | TData): boolean;
export declare function getNodeInjectorLView(nodeInjector: NodeInjector): LView;
export declare function getNodeInjectorTNode(nodeInjector: NodeInjector): TElementNode | TContainerNode | TElementContainerNode | null;
export declare class NodeInjector implements Injector {
    private _tNode;
    private _lView;
    constructor(_tNode: TElementNode | TContainerNode | TElementContainerNode | null, _lView: LView);
    get(token: any, notFoundValue?: any, flags?: InternalInjectFlags | InjectOptions): any;
}
/** Creates a `NodeInjector` for the current node. */
export declare function createNodeInjector(): Injector;
/**
 * @codeGenApi
 */
export declare function ɵɵgetInheritedFactory<T>(type: Type<any>): (type: Type<T>) => T;
