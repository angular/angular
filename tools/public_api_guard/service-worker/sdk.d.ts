/** @experimental */
export interface BootstrapOptions {
    logHandlers?: LogHandler[];
    logLevel?: Verbosity;
    manifestUrl?: string;
    plugins?: PluginFactory<any>[];
}

/** @experimental */
export declare function bootstrapServiceWorker(options?: BootstrapOptions): Driver;

/** @experimental */
export declare class BrowserClock implements Clock {
    dateNow(): number;
    setTimeout(fn: Function, delay: number): number;
}

/** @experimental */
export declare function cacheFromNetworkOp(worker: VersionWorker, url: string, cache: string, cacheBust?: boolean): Operation;

/** @experimental */
export interface Callback<T> {
    (event: T): void;
}

/** @experimental */
export interface Clock {
    dateNow(): number;
    setTimeout(fn: Function, delay: number): any;
}

/** @experimental */
export declare class ConsoleHandler implements LogHandler {
    handle(entry: LogEntry): void;
}

/** @experimental */
export declare function copyExistingCacheOp(oldWorker: VersionWorker, newWorker: VersionWorker, url: string, cache: string): Operation;

/** @experimental */
export declare function copyExistingOrFetchOp(oldWorker: VersionWorker, newWorker: VersionWorker, url: string, cache: string): Operation;

/** @experimental */
export declare function deleteCacheOp(worker: VersionWorker, key: string): Operation;

/** @experimental */
export declare class Driver {
    clock: Clock;
    fetcher: NgSwFetch;
    ready: Promise<any>;
    readyResolve: Function;
    updatePending: Promise<any>;
    updatePendingResolve: Function;
    constructor(manifestUrl: string, plugins: PluginFactory<any>[], scope: ServiceWorkerGlobalScope, adapter: NgSwAdapter, cache: NgSwCache, events: NgSwEvents, fetcher: NgSwFetch, clock: Clock);
    closeStream(id: number): void;
    sendToStream(id: number, message: Object): void;
}

/** @experimental */
export declare enum DriverState {
    STARTUP = 0,
    READY = 1,
    UPDATE_PENDING = 2,
    INSTALLING = 3,
    LAME = 4,
}

/** @experimental */
export declare type FetchDelegate = () => Promise<Response>;

/** @experimental */
export declare function fetchFromCacheInstruction(worker: VersionWorker, req: string | Request, cache: string): FetchInstruction;

/** @experimental */
export declare function fetchFromNetworkInstruction(worker: VersionWorker, req: Request, shouldRefresh?: boolean): FetchInstruction;

/** @experimental */
export interface FetchInstruction {
    desc?: Object;
    (next: FetchDelegate): Promise<Response>;
}

/** @experimental */
export declare class HttpHandler implements LogHandler {
    constructor(url: string);
    handle(entry: LogEntry): void;
}

/** @experimental */
export declare const LOG: Logging;

/** @experimental */
export interface LogEntry {
    message: string;
    verbosity: Verbosity;
}

/** @experimental */
export declare class Logger implements Logging {
    messages: Function;
    constructor();
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    log(verbosity: Verbosity, message: string, ...args: any[]): void;
    release(): void;
    setVerbosity(verbosity: Verbosity): void;
    status(message: string, ...args: any[]): void;
    technical(message: string, ...args: any[]): void;
}

/** @experimental */
export declare const LOGGER: Logger;

/** @experimental */
export interface Logging {
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    log(verbosity: Verbosity, message: string, ...args: any[]): void;
    status(message: string, ...args: any[]): void;
    technical(message: string, ...args: any[]): void;
}

/** @experimental */
export interface LogHandler {
    handle(msg: LogEntry): void;
}

/** @experimental */
export interface Manifest {
    _hash: string;
    _json: string;
    [key: string]: any;
}

/** @experimental */
export interface NgSwAdapter {
    readonly scope: string;
    newRequest(req: string | Request, init?: Object): Request;
    newResponse(body: string | Blob, init?: Object): Response;
}

/** @experimental */
export interface NgSwCache {
    invalidate(cache: string, req: string | Request): Promise<void>;
    keys(): Promise<string[]>;
    keysOf(cache: string): Promise<Request[]>;
    load(cache: string, req: string | Request): Promise<Response>;
    remove(cache: string): Promise<any>;
    store(cache: string, req: string | Request, resp: Response): Promise<any>;
}

/** @experimental */
export declare class NgSwCacheImpl implements NgSwCache {
    constructor(caches: CacheStorage, adapter: NgSwAdapter);
    invalidate(cache: string, req: string | Request): Promise<any>;
    keys(): Promise<string[]>;
    keysOf(cache: string): Promise<Request[]>;
    load(cache: string, req: string | Request): Promise<Response>;
    remove(cache: string): Promise<any>;
    store(cache: string, req: string | Request, resp: Response): Promise<any>;
}

/** @experimental */
export declare class NgSwEvents {
    activate: Callback<ActivateEvent>;
    fetch: Callback<FetchEvent>;
    install: Callback<InstallEvent>;
    message: Callback<MessageEvent>;
    push: Callback<PushEvent>;
    constructor(scope: ServiceWorkerGlobalScope);
}

/** @experimental */
export declare class NgSwFetch {
    constructor(scope: ServiceWorkerGlobalScope, adapter: NgSwAdapter);
    refresh(req: string | Request): Promise<Response>;
    request(req: Request, redirectSafe?: boolean): Promise<Response>;
}

/** @experimental */
export interface Operation {
    desc?: Object;
    (): Promise<any>;
}

/** @experimental */
export declare function parseManifest(data: string): Manifest;

/** @experimental */
export interface Plugin<T extends Plugin<T>> {
    cleanup?(operations: Operation[]): void;
    fetch?(req: Request): FetchInstruction | null;
    message?(message: any, id: number): Promise<any>;
    messageClosed?(id: number): void;
    push?(data: any): void;
    setup(operations: Operation[]): void;
    update?(operations: Operation[], previous: T): void;
    validate?(): Promise<boolean>;
}

/** @experimental */
export interface PluginFactory<T extends Plugin<T>> {
    (worker: VersionWorker): Plugin<T>;
}

/** @experimental */
export declare function rewriteUrlInstruction(worker: VersionWorker, req: Request, destUrl: string): FetchInstruction;

/** @experimental */
export declare class ScopedCache implements NgSwCache {
    constructor(delegate: NgSwCache, prefix: string);
    invalidate(cache: string, req: string | Request): Promise<void>;
    keys(): Promise<string[]>;
    keysOf(cache: string): Promise<Request[]>;
    load(cache: string, req: string | Request): Promise<Response>;
    remove(cache: string): Promise<any>;
    store(cache: string, req: string | Request, resp: Response): Promise<any>;
}

/** @experimental */
export interface StreamController {
    closeStream(id: number): void;
    sendToStream(id: number, message: Object): void;
}

/** @experimental */
export interface UrlConfig {
    match?: UrlMatchType;
}

/** @experimental */
export declare class UrlMatcher {
    match: UrlMatchType;
    pattern: string;
    scope: string;
    constructor(pattern: string, config: UrlConfig | undefined, scope: string);
    matches(url: string): boolean;
}

/** @experimental */
export declare type UrlMatchType = 'exact' | 'prefix' | 'regex';

/** @experimental */
export declare enum Verbosity {
    DEBUG = 1,
    TECHNICAL = 2,
    INFO = 3,
    STATUS = 4,
    DISABLED = 1000,
}

/** @experimental */
export interface VersionWorker extends StreamController {
    readonly adapter: NgSwAdapter;
    readonly cache: NgSwCache;
    readonly manifest: Manifest;
    closeStream(id: number): void;
    fetch(req: Request): Promise<Response>;
    refresh(req: Request, cacheBust?: boolean): Promise<Response>;
    sendToStream(id: number, message: Object): void;
    showNotification(title: string, options?: Object): void;
}

/** @experimental */
export declare class VersionWorkerImpl implements VersionWorker {
    adapter: NgSwAdapter;
    cache: ScopedCache;
    clock: Clock;
    manifest: Manifest;
    scope: ServiceWorkerGlobalScope;
    streamController: StreamController;
    constructor(streamController: StreamController, scope: ServiceWorkerGlobalScope, manifest: Manifest, adapter: NgSwAdapter, cache: ScopedCache, clock: Clock, fetcher: NgSwFetch, plugins: Plugin<any>[]);
    cleanup(): Operation[];
    closeStream(id: number): void;
    fetch(req: Request): Promise<Response>;
    message(message: any, id: number): Promise<any>;
    messageClosed(id: number): void;
    push(data: any): Promise<any>;
    refresh(req: Request, cacheBust?: boolean): Promise<Response>;
    sendToStream(id: number, message: Object): void;
    setup(previous: VersionWorkerImpl): Promise<any>;
    showNotification(title: string, options?: Object): void;
    validate(): Promise<boolean>;
}
