import { LocationStrategy } from 'angular2/src/router/location_strategy';
export declare class MockLocationStrategy extends LocationStrategy {
    internalBaseHref: string;
    internalPath: string;
    internalTitle: string;
    urlChanges: string[];
    constructor();
    simulatePopState(url: string): void;
    path(): string;
    prepareExternalUrl(internal: string): string;
    simulateUrlPop(pathname: string): void;
    pushState(ctx: any, title: string, path: string, query: string): void;
    onPopState(fn: (value: any) => void): void;
    getBaseHref(): string;
    back(): void;
    forward(): void;
}
