/** @experimental */
export declare function Dynamic(strategies: DynamicStrategy[]): PluginFactory<DynamicImpl>;

/** @experimental */
export declare function ExternalContentCache(options?: ExternalContentCacheOptions): PluginFactory<ExternalPlugin>;

/** @experimental */
export interface ExternalContentCacheOptions {
    manifestKey?: string;
}

/** @experimental */
export interface FreshnessCacheConfig extends CacheConfig {
    networkTimeoutMs?: number;
    optimizeFor: 'freshness';
}

/** @experimental */
export declare class FreshnessStrategy implements DynamicStrategy {
    readonly name: string;
    config(group: DynamicGroup): FreshnessCacheConfig;
    fetch(group: DynamicGroup, req: Request, delegate: () => Promise<Response>): Promise<ResponseWithSideEffect>;
}

/** @experimental */
export interface PerformanceCacheConfig extends CacheConfig {
    optimizeFor: 'performance';
    refreshAheadMs?: number;
}

/** @experimental */
export declare class PerformanceStrategy implements DynamicStrategy {
    readonly name: string;
    config(group: DynamicGroup): PerformanceCacheConfig;
    fetch(group: DynamicGroup, req: Request, delegate: () => Promise<Response>): Promise<ResponseWithSideEffect>;
}

/** @experimental */
export declare function Push(): PluginFactory<PushImpl>;

/** @experimental */
export declare function RouteRedirection(): PluginFactory<RouteRedirectionImpl>;

/** @experimental */
export declare function StaticContentCache(options?: StaticContentCacheOptions): PluginFactory<StaticContentCacheImpl>;

/** @experimental */
export interface StaticContentCacheOptions {
    manifestKey?: string;
}
