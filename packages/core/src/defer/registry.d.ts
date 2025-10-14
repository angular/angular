import { InjectionToken } from '../di/injection_token';
import { DehydratedDeferBlock } from './interfaces';
import type { PromiseWithResolvers } from '../util/promise_with_resolvers';
/**
 * An internal injection token to reference `DehydratedBlockRegistry` implementation
 * in a tree-shakable way.
 */
export declare const DEHYDRATED_BLOCK_REGISTRY: InjectionToken<DehydratedBlockRegistry>;
/**
 * The DehydratedBlockRegistry is used for incremental hydration purposes. It keeps
 * track of the Defer Blocks that need hydration so we can effectively
 * navigate up to the top dehydrated defer block and fire appropriate cleanup
 * functions post hydration.
 */
export declare class DehydratedBlockRegistry {
    private registry;
    private cleanupFns;
    private jsActionMap;
    private contract;
    add(blockId: string, info: DehydratedDeferBlock): void;
    get(blockId: string): DehydratedDeferBlock | null;
    has(blockId: string): boolean;
    cleanup(hydratedBlocks: string[]): void;
    get size(): number;
    addCleanupFn(blockId: string, fn: Function): void;
    invokeTriggerCleanupFns(blockId: string): void;
    hydrating: Map<string, PromiseWithResolvers<void>>;
    private awaitingCallbacks;
    awaitParentBlock(topmostParentBlock: string, callback: Function): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
