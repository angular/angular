/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TView, LViewFlags, LViewEnvironment, TViewType, LView } from '../interfaces/view';
import { RElement } from '../interfaces/renderer_dom';
import { TConstantsOrFactory, TElementNode, TNode } from '../interfaces/node';
import { Renderer } from '../interfaces/renderer';
import { Injector } from '../../di';
import { DehydratedView } from '../../hydration/interfaces';
import { ComponentDef, ComponentTemplate, DirectiveDefListOrFactory, PipeDefListOrFactory, ViewQueriesFunction } from '../interfaces/definition';
import { SchemaMetadata } from '../../metadata/schema';
import { LContainer } from '../interfaces/container';
/**
 * Creates a TView instance
 *
 * @param type Type of `TView`.
 * @param declTNode Declaration location of this `TView`.
 * @param templateFn Template function
 * @param decls The number of nodes, local refs, and pipes in this template
 * @param directives Registry of directives for this view
 * @param pipes Registry of pipes for this view
 * @param viewQuery View queries for this view
 * @param schemas Schemas for this view
 * @param consts Constants for this view
 */
export declare function createTView(type: TViewType, declTNode: TNode | null, templateFn: ComponentTemplate<any> | null, decls: number, vars: number, directives: DirectiveDefListOrFactory | null, pipes: PipeDefListOrFactory | null, viewQuery: ViewQueriesFunction<any> | null, schemas: SchemaMetadata[] | null, constsOrFactory: TConstantsOrFactory | null, ssrId: string | null): TView;
/**
 * Gets TView from a template function or creates a new TView
 * if it doesn't already exist.
 *
 * @param def ComponentDef
 * @returns TView
 */
export declare function getOrCreateComponentTView(def: ComponentDef<any>): TView;
export declare function createLView<T>(parentLView: LView | null, tView: TView, context: T | null, flags: LViewFlags, host: RElement | null, tHostNode: TNode | null, environment: LViewEnvironment | null, renderer: Renderer | null, injector: Injector | null, embeddedViewInjector: Injector | null, hydrationInfo: DehydratedView | null): LView<T>;
export declare function createComponentLView<T>(lView: LView, hostTNode: TElementNode, def: ComponentDef<T>): LView;
/**
 * Gets the initial set of LView flags based on the component definition that the LView represents.
 * @param def Component definition from which to determine the flags.
 */
export declare function getInitialLViewFlagsFromDef(def: ComponentDef<unknown>): LViewFlags;
/**
 * When elements are created dynamically after a view blueprint is created (e.g. through
 * i18nApply()), we need to adjust the blueprint for future template passes.
 *
 * @param tView `TView` associated with `LView`
 * @param lView The `LView` containing the blueprint to adjust
 * @param numSlotsToAlloc The number of slots to alloc in the LView, should be >0
 * @param initialValue Initial value to store in blueprint
 */
export declare function allocExpando(tView: TView, lView: LView, numSlotsToAlloc: number, initialValue: unknown): number;
/**
 * Adds LView or LContainer to the end of the current view tree.
 *
 * This structure will be used to traverse through nested views to remove listeners
 * and call onDestroy callbacks.
 *
 * @param lView The view where LView or LContainer should be added
 * @param adjustedHostIndex Index of the view's host node in LView[], adjusted for header
 * @param lViewOrLContainer The LView or LContainer to add to the view tree
 * @returns The state passed in
 */
export declare function addToEndOfViewTree<T extends LView | LContainer>(lView: LView, lViewOrLContainer: T): T;
