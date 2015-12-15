import { Location } from 'angular2/src/router/location';
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 */
export declare class SpyLocation implements Location {
    urlChanges: string[];
    setInitialPath(url: string): void;
    setBaseHref(url: string): void;
    path(): string;
    simulateUrlPop(pathname: string): void;
    simulateHashChange(pathname: string): void;
    prepareExternalUrl(url: string): string;
    go(path: string, query?: string): void;
    replaceState(path: string, query?: string): void;
    forward(): void;
    back(): void;
    subscribe(onNext: (value: any) => void, onThrow?: (error: any) => void, onReturn?: () => void): Object;
    platformStrategy: any;
    normalize(url: string): string;
}
