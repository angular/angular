/** @experimental */
export interface AssetGroup {
    installMode?: 'prefetch' | 'lazy';
    name: string;
    resources: {
        files?: Glob[];
        versionedFiles?: Glob[];
        urls?: Glob[];
    };
    updateMode?: 'prefetch' | 'lazy';
}

/** @experimental */
export interface Config {
    appData?: {};
    assetGroups?: AssetGroup[];
    dataGroups?: DataGroup[];
    index: string;
}

/** @experimental */
export interface DataGroup {
    cacheConfig: {
        maxSize: number;
        maxAge: Duration;
        timeout?: Duration;
        strategy?: 'freshness' | 'performance';
    };
    name: string;
    urls: Glob[];
    version?: number;
}

/** @experimental */
export declare type Duration = string;

/** @experimental */
export interface Filesystem {
    list(dir: string): Promise<string[]>;
    read(file: string): Promise<string>;
    write(file: string, contents: string): Promise<void>;
}

/** @experimental */
export declare class Generator {
    readonly fs: Filesystem;
    constructor(fs: Filesystem, baseHref: string);
    process(config: Config): Promise<Object>;
}

/** @experimental */
export declare type Glob = string;
