/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../../di/injector';
import { ViewEncapsulation } from '../../metadata/view';
import { ComponentTemplate, DirectiveDef, RenderFlags } from '../interfaces/definition';
import { LocalRefExtractor, TContainerNode, TDirectiveHostNode, TElementContainerNode, TElementNode, TNode } from '../interfaces/node';
import { Renderer } from '../interfaces/renderer';
import { RElement, RNode } from '../interfaces/renderer_dom';
import { SanitizerFn } from '../interfaces/sanitization';
import { LView, TData, TView } from '../interfaces/view';
export declare function executeTemplate<T>(tView: TView, lView: LView<T>, templateFn: ComponentTemplate<T>, rf: RenderFlags, context: T): void;
/**
 * Creates directive instances.
 */
export declare function createDirectivesInstances(tView: TView, lView: LView, tNode: TDirectiveHostNode): void;
/**
 * Takes a list of local names and indices and pushes the resolved local variable values
 * to LView in the same order as they are loaded in the template with load().
 */
export declare function saveResolvedLocalsInData(viewData: LView, tNode: TDirectiveHostNode, localRefExtractor?: LocalRefExtractor): void;
/**
 * Locates the host native element, used for bootstrapping existing nodes into rendering pipeline.
 *
 * @param renderer the renderer used to locate the element.
 * @param elementOrSelector Render element or CSS selector to locate the element.
 * @param encapsulation View Encapsulation defined for component that requests host element.
 * @param injector Root view injector instance.
 */
export declare function locateHostElement(renderer: Renderer, elementOrSelector: RElement | string, encapsulation: ViewEncapsulation, injector: Injector): RElement;
/**
 * Applies any root element transformations that are needed. If hydration is enabled,
 * this will process corrupted text nodes.
 *
 * @param rootElement the app root HTML Element
 */
export declare function applyRootElementTransform(rootElement: HTMLElement): void;
/**
 * Processes text node markers before hydration begins. This replaces any special comment
 * nodes that were added prior to serialization are swapped out to restore proper text
 * nodes before hydration.
 *
 * @param rootElement the app root HTML Element
 */
export declare function applyRootElementTransformImpl(rootElement: HTMLElement): void;
/**
 * Sets the implementation for the `applyRootElementTransform` function.
 */
export declare function enableApplyRootElementTransformImpl(): void;
export declare function setPropertyAndInputs<T>(tNode: TNode, lView: LView, propName: string, value: T, renderer: Renderer, sanitizer: SanitizerFn | null | undefined): void;
/**
 * Sets a DOM property on a specific node.
 * @param tNode TNode on which to set the value.
 * @param lView View in which the node is located.
 * @param propName Name of the property.
 * @param value Value to set on the property.
 * @param renderer Renderer to use when setting the property.
 * @param sanitizer Function used to sanitize the value before setting it.
 */
export declare function setDomProperty<T>(tNode: TNode, lView: LView, propName: string, value: T, renderer: Renderer, sanitizer: SanitizerFn | null | undefined): void;
/** If node is an OnPush component, marks its LView dirty. */
export declare function markDirtyIfOnPush(lView: LView, viewIndex: number): void;
export declare function setNgReflectProperties(lView: LView, tView: TView, tNode: TNode, publicName: string, value: any): void;
export declare function invokeDirectivesHostBindings(tView: TView, lView: LView, tNode: TNode): void;
/**
 * Invoke the host bindings in creation mode.
 *
 * @param def `DirectiveDef` which may contain the `hostBindings` function.
 * @param directive Instance of directive.
 */
export declare function invokeHostBindingsInCreationMode(def: DirectiveDef<any>, directive: any): void;
/**
 * Matches the current node against all available selectors.
 * If a component is matched (at most one), it is returned in first position in the array.
 */
export declare function findDirectiveDefMatches(tView: TView, tNode: TElementNode | TContainerNode | TElementContainerNode): DirectiveDef<unknown>[] | null;
export declare function elementAttributeInternal(tNode: TNode, lView: LView, name: string, value: any, sanitizer: SanitizerFn | null | undefined, namespace: string | null | undefined): void;
export declare function setElementAttribute(renderer: Renderer, element: RElement, namespace: string | null | undefined, tagName: string | null, name: string, value: any, sanitizer: SanitizerFn | null | undefined): void;
/** Shared code between instructions that indicate the start of an element. */
export declare function elementLikeStartShared(tNode: TElementNode | TElementContainerNode, lView: LView, index: number, name: string, locateOrCreateNativeNode: (tView: TView, lView: LView, tNode: TNode, name: string, index: number) => RNode): TElementNode | TElementContainerNode;
/** Shared code between instructions that indicate the end of an element. */
export declare function elementLikeEndShared(tNode: TNode): TNode;
/**
 * Stores meta-data for a property binding to be used by TestBed's `DebugElement.properties`.
 *
 * In order to support TestBed's `DebugElement.properties` we need to save, for each binding:
 * - a bound property name;
 * - a static parts of interpolated strings;
 *
 * A given property metadata is saved at the binding's index in the `TView.data` (in other words, a
 * property binding metadata will be stored in `TView.data` at the same index as a bound value in
 * `LView`). Metadata are represented as `INTERPOLATION_DELIMITER`-delimited string with the
 * following format:
 * - `propertyName` for bound properties;
 * - `propertyName�prefix�interpolation_static_part1�..interpolation_static_partN�suffix` for
 * interpolated properties.
 *
 * @param tData `TData` where meta-data will be saved;
 * @param tNode `TNode` that is a target of the binding;
 * @param propertyName bound property name;
 * @param bindingIndex binding index in `LView`
 * @param interpolationParts static interpolation parts (for property interpolations)
 */
export declare function storePropertyBindingMetadata(tData: TData, tNode: TNode, propertyName: string, bindingIndex: number, ...interpolationParts: string[]): void;
/**
 * There are cases where the sub component's renderer needs to be included
 * instead of the current renderer (see the componentSyntheticHost* instructions).
 */
export declare function loadComponentRenderer(currentDef: DirectiveDef<any> | null, tNode: TNode, lView: LView): Renderer;
/** Handles an error thrown in an LView. */
export declare function handleUncaughtError(lView: LView, error: any): void;
/**
 * Set all directive inputs with the specific public name on the node.
 *
 * @param tNode TNode on which the input is being set.
 * @param tView Current TView
 * @param lView `LView` which contains the directives.
 * @param publicName Public name of the input being set.
 * @param value Value to set.
 */
export declare function setAllInputsForProperty(tNode: TNode, tView: TView, lView: LView, publicName: string, value: unknown): boolean;
/**
 * Sets an input value only on a specific directive and its host directives.
 * @param tNode TNode on which the input is being set.
 * @param tView Current TView
 * @param lView `LView` which contains the directives.
 * @param target Directive on which to set the input.
 * @param publicName Public name of the input being set.
 * @param value Value to set.
 */
export declare function setDirectiveInput(tNode: TNode, tView: TView, lView: LView, target: DirectiveDef<unknown>, publicName: string, value: unknown): boolean;
