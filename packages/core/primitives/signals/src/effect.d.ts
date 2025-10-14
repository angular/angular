/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ReactiveNode } from './graph';
/**
 * An effect can, optionally, register a cleanup function. If registered, the cleanup is executed
 * before the next effect run. The cleanup function makes it possible to "cancel" any work that the
 * previous effect run might have started.
 */
export type EffectCleanupFn = () => void;
/**
 * A callback passed to the effect function that makes it possible to register cleanup logic.
 */
export type EffectCleanupRegisterFn = (cleanupFn: EffectCleanupFn) => void;
export interface BaseEffectNode extends ReactiveNode {
    fn: () => void;
    destroy(): void;
    cleanup(): void;
    run(): void;
}
export declare const BASE_EFFECT_NODE: Omit<BaseEffectNode, 'fn' | 'destroy' | 'cleanup' | 'run'>;
export declare function runEffect(node: BaseEffectNode): void;
