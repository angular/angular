export declare class SpyLocation implements Location {
    urlChanges: string[];
    back(): void;
    forward(): void;
    go(path: string, query?: string): void;
    isCurrentPathEqualTo(path: string, query?: string): boolean;
    normalize(url: string): string;
    path(): string;
    prepareExternalUrl(url: string): string;
    replaceState(path: string, query?: string): void;
    setBaseHref(url: string): void;
    setInitialPath(url: string): void;
    simulateHashChange(pathname: string): void;
    simulateUrlPop(pathname: string): void;
    subscribe(onNext: (value: any) => void, onThrow?: (error: any) => void, onReturn?: () => void): Object;
}
