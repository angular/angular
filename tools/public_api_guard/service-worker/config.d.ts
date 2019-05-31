export interface AssetGroup {
    installMode?: 'prefetch' | 'lazy';
    name: string;
    resources: {
        files?: Glob[];
        /** @deprecated */ versionedFiles?: Glob[];
        urls?: Glob[];
    };
    updateMode?: 'prefetch' | 'lazy';
}

export interface Config {
    appData?: {};
    assetGroups?: AssetGroup[];
    dataGroups?: DataGroup[];
    index: string;
    navigationUrls?: string[];
}

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

export declare type Duration = string;

export interface Filesystem {
    hash(file: string): Promise<string>;
    list(dir: string): Promise<string[]>;
    read(file: string): Promise<string>;
    write(file: string, contents: string): Promise<void>;
}

export declare class Generator {
    readonly fs: Filesystem;
    constructor(fs: Filesystem, baseHref: string);
    process(config: Config): Promise<Object>;
}

export declare type Glob = string;
