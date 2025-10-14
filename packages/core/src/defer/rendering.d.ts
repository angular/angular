/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../di';
import { LContainer } from '../render3/interfaces/container';
import { TNode } from '../render3/interfaces/node';
import { LView, TView } from '../render3/interfaces/view';
import { DeferBlockConfig, DeferBlockDependencyInterceptor, DeferBlockState, TDeferBlockDetails } from './interfaces';
/**
 * **INTERNAL**, avoid referencing it in application code.
 * *
 * Injector token that allows to provide `DeferBlockDependencyInterceptor` class
 * implementation.
 *
 * This token is only injected in devMode
 */
export declare const DEFER_BLOCK_DEPENDENCY_INTERCEPTOR: InjectionToken<DeferBlockDependencyInterceptor>;
/**
 * **INTERNAL**, token used for configuring defer block behavior.
 */
export declare const DEFER_BLOCK_CONFIG: InjectionToken<DeferBlockConfig>;
/** Rendering Helpers */
/**
 * Transitions a defer block to the new state. Updates the  necessary
 * data structures and renders corresponding block.
 *
 * @param newState New state that should be applied to the defer block.
 * @param tNode TNode that represents a defer block.
 * @param lContainer Represents an instance of a defer block.
 * @param skipTimerScheduling Indicates that `@loading` and `@placeholder` block
 *   should be rendered immediately, even if they have `after` or `minimum` config
 *   options setup. This flag to needed for testing APIs to transition defer block
 *   between states via `DeferFixture.render` method.
 */
export declare function renderDeferBlockState(newState: DeferBlockState, tNode: TNode, lContainer: LContainer, skipTimerScheduling?: boolean): void;
/** Utility function to render placeholder content (if present) */
export declare function renderPlaceholder(lView: LView, tNode: TNode): void;
/**
 * Subscribes to the "loading" Promise and renders corresponding defer sub-block,
 * based on the loading results.
 *
 * @param lContainer Represents an instance of a defer block.
 * @param tNode Represents defer block info shared across all instances.
 */
export declare function renderDeferStateAfterResourceLoading(tDetails: TDeferBlockDetails, tNode: TNode, lContainer: LContainer): void;
/**
 * Enables timer-related scheduling if `after` or `minimum` parameters are setup
 * on the `@loading` or `@placeholder` blocks.
 */
export declare function ɵɵdeferEnableTimerScheduling(tView: TView, tDetails: TDeferBlockDetails, placeholderConfigIndex?: number | null, loadingConfigIndex?: number | null): void;
