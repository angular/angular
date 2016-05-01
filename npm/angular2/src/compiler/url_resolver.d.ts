/**
 * Create a {@link UrlResolver} with no package prefix.
 */
export declare function createUrlResolverWithoutPackagePrefix(): UrlResolver;
export declare function createOfflineCompileUrlResolver(): UrlResolver;
/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
export declare var DEFAULT_PACKAGE_URL_PROVIDER: {
    provide: any;
    useValue: string;
};
/**
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This class can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 *
 * ## Example
 *
 * {@example compiler/ts/url_resolver/url_resolver.ts region='url_resolver'}
 */
export declare class UrlResolver {
    private _packagePrefix;
    constructor(_packagePrefix?: string);
    /**
     * Resolves the `url` given the `baseUrl`:
     * - when the `url` is null, the `baseUrl` is returned,
     * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
     * `baseUrl` and `url`,
     * - if `url` is absolute (it has a scheme: 'http://', 'https://' or start with '/'), the `url` is
     * returned as is (ignoring the `baseUrl`)
     *
     * @param {string} baseUrl
     * @param {string} url
     * @returns {string} the resolved URL
     */
    resolve(baseUrl: string, url: string): string;
}
/**
 * Extract the scheme of a URL.
 */
export declare function getUrlScheme(url: string): string;
