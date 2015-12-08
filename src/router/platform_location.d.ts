/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
export declare class PlatformLocation {
    private _location;
    private _history;
    constructor();
    getBaseHrefFromDOM(): string;
    onPopState(fn: EventListener): void;
    onHashChange(fn: EventListener): void;
    pathname: string;
    search: string;
    hash: string;
    pushState(state: any, title: string, url: string): void;
    replaceState(state: any, title: string, url: string): void;
    forward(): void;
    back(): void;
}
