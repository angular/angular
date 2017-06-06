import { LocationStrategy } from 'angular2/platform/common';
/**
 * A mock implementation of {@link LocationStrategy} that allows tests to fire simulated
 * location events.
 */
export declare class MockLocationStrategy extends LocationStrategy {
    internalBaseHref: string;
    internalPath: string;
    internalTitle: string;
    urlChanges: string[];
    constructor();
    simulatePopState(url: string): void;
    path(): string;
    prepareExternalUrl(internal: string): string;
    pushState(ctx: any, title: string, path: string, query: string): void;
    replaceState(ctx: any, title: string, path: string, query: string): void;
    onPopState(fn: (value: any) => void): void;
    getBaseHref(): string;
    back(): void;
    forward(): void;
}
