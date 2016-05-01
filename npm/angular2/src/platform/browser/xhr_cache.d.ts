import { XHR } from 'angular2/src/compiler/xhr';
/**
 * An implementation of XHR that uses a template cache to avoid doing an actual
 * XHR.
 *
 * The template cache needs to be built and loaded into window.$templateCache
 * via a separate mechanism.
 */
export declare class CachedXHR extends XHR {
    private _cache;
    constructor();
    get(url: string): Promise<string>;
}
