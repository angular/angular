import { UrlChangeListener } from './platform_location';
import { PlatformLocation } from './platform_location';
/**
 * `PlatformLocation` encapsulates all of the direct calls to platform APIs.
 * This class should not be used directly by an application developer. Instead, use
 * {@link Location}.
 */
export declare class BrowserPlatformLocation extends PlatformLocation {
    private _location;
    private _history;
    constructor();
    getBaseHrefFromDOM(): string;
    onPopState(fn: UrlChangeListener): void;
    onHashChange(fn: UrlChangeListener): void;
    pathname: string;
    search: string;
    hash: string;
    pushState(state: any, title: string, url: string): void;
    replaceState(state: any, title: string, url: string): void;
    forward(): void;
    back(): void;
}
