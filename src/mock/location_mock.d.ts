import { Location } from 'angular2/src/router/location';
export declare class SpyLocation implements Location {
    urlChanges: string[];
    setInitialPath(url: string): void;
    setBaseHref(url: string): void;
    path(): string;
    simulateUrlPop(pathname: string): void;
    prepareExternalUrl(url: string): string;
    go(path: string, query?: string): void;
    forward(): void;
    back(): void;
    subscribe(onNext: (value: any) => void, onThrow?: (error: any) => void, onReturn?: () => void): Object;
    platformStrategy: any;
    normalize(url: string): string;
}
