/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EnvironmentInjector } from '../di';
import { LView } from '../render3/interfaces/view';
/**
 * `DestroyRef` lets you set callbacks to run for any cleanup or destruction behavior.
 * The scope of this destruction depends on where `DestroyRef` is injected. If `DestroyRef`
 * is injected in a component or directive, the callbacks run when that component or
 * directive is destroyed. Otherwise the callbacks run when a corresponding injector is destroyed.
 *
 * @publicApi
 */
export declare abstract class DestroyRef {
    /**
     * Registers a destroy callback in a given lifecycle scope.  Returns a cleanup function that can
     * be invoked to unregister the callback.
     *
     * @usageNotes
     * ### Example
     * ```ts
     * const destroyRef = inject(DestroyRef);
     *
     * // register a destroy callback
     * const unregisterFn = destroyRef.onDestroy(() => doSomethingOnDestroy());
     *
     * // stop the destroy callback from executing if needed
     * unregisterFn();
     * ```
     */
    abstract onDestroy(callback: () => void): () => void;
    /**
     * Indicates whether the instance has already been destroyed.
     */
    abstract get destroyed(): boolean;
    /**
     * @internal
     * @nocollapse
     */
    static __NG_ELEMENT_ID__: () => DestroyRef;
    /**
     * @internal
     * @nocollapse
     */
    static __NG_ENV_ID__: (injector: EnvironmentInjector) => DestroyRef;
}
export declare class NodeInjectorDestroyRef extends DestroyRef {
    readonly _lView: LView;
    constructor(_lView: LView);
    get destroyed(): boolean;
    onDestroy(callback: () => void): () => void;
}
