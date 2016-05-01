import { UrlResolver } from 'angular2/src/compiler/url_resolver';
export declare class StyleWithImports {
    style: string;
    styleUrls: string[];
    constructor(style: string, styleUrls: string[]);
}
export declare function isStyleUrlResolvable(url: string): boolean;
/**
 * Rewrites stylesheets by resolving and removing the @import urls that
 * are either relative or don't have a `package:` scheme
 */
export declare function extractStyleUrls(resolver: UrlResolver, baseUrl: string, cssText: string): StyleWithImports;
