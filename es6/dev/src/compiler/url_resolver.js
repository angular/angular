var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, Inject } from 'angular2/src/core/di';
import { StringWrapper, isPresent, isBlank, RegExpWrapper } from 'angular2/src/facade/lang';
import { PACKAGE_ROOT_URL } from 'angular2/src/core/application_tokens';
import { Provider } from 'angular2/src/core/di';
/**
 * Create a {@link UrlResolver} with no package prefix.
 */
export function createWithoutPackagePrefix() {
    return new UrlResolver();
}
/**
 * A default provider for {@link PACKAGE_ROOT_URL} that maps to '/'.
 */
export var DEFAULT_PACKAGE_URL_PROVIDER = new Provider(PACKAGE_ROOT_URL, { useValue: "/" });
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
export let UrlResolver = class {
    constructor(packagePrefix = null) {
        if (isPresent(packagePrefix)) {
            this._packagePrefix = StringWrapper.stripRight(packagePrefix, "/") + "/";
        }
    }
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
    resolve(baseUrl, url) {
        var resolvedUrl = url;
        if (isPresent(baseUrl) && baseUrl.length > 0) {
            resolvedUrl = _resolveUrl(baseUrl, resolvedUrl);
        }
        if (isPresent(this._packagePrefix) && getUrlScheme(resolvedUrl) == "package") {
            resolvedUrl = resolvedUrl.replace("package:", this._packagePrefix);
        }
        return resolvedUrl;
    }
};
UrlResolver = __decorate([
    Injectable(),
    __param(0, Inject(PACKAGE_ROOT_URL)), 
    __metadata('design:paramtypes', [String])
], UrlResolver);
/**
 * Extract the scheme of a URL.
 */
export function getUrlScheme(url) {
    var match = _split(url);
    return (match && match[_ComponentIndex.Scheme]) || "";
}
// The code below is adapted from Traceur:
// https://github.com/google/traceur-compiler/blob/9511c1dafa972bf0de1202a8a863bad02f0f95a8/src/runtime/url.js
/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param {?string=} opt_scheme The scheme such as 'http'.
 * @param {?string=} opt_userInfo The user name before the '@'.
 * @param {?string=} opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param {(string|null)=} opt_port The port number.
 * @param {?string=} opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param {?string=} opt_queryData The URI-encoded query data.
 * @param {?string=} opt_fragment The URI-encoded fragment identifier.
 * @return {string} The fully combined URI.
 */
function _buildFromEncodedParts(opt_scheme, opt_userInfo, opt_domain, opt_port, opt_path, opt_queryData, opt_fragment) {
    var out = [];
    if (isPresent(opt_scheme)) {
        out.push(opt_scheme + ':');
    }
    if (isPresent(opt_domain)) {
        out.push('//');
        if (isPresent(opt_userInfo)) {
            out.push(opt_userInfo + '@');
        }
        out.push(opt_domain);
        if (isPresent(opt_port)) {
            out.push(':' + opt_port);
        }
    }
    if (isPresent(opt_path)) {
        out.push(opt_path);
    }
    if (isPresent(opt_queryData)) {
        out.push('?' + opt_queryData);
    }
    if (isPresent(opt_fragment)) {
        out.push('#' + opt_fragment);
    }
    return out.join('');
}
/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link http://www.gbiv.com/protocols/uri/rfc/rfc3986.html#RFC2234} says
 * As the "first-match-wins" algorithm is identical to the "greedy"
 * disambiguation method used by POSIX regular expressions, it is natural and
 * commonplace to use a regular expression for parsing the potential five
 * components of a URI reference.
 *
 * The following line is the regular expression for breaking-down a
 * well-formed URI reference into its components.
 *
 * <pre>
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 * </pre>
 *
 * The numbers in the second line above are only to assist readability; they
 * indicate the reference points for each subexpression (i.e., each paired
 * parenthesis). We refer to the value matched for subexpression <n> as $<n>.
 * For example, matching the above expression to
 * <pre>
 *     http://www.ics.uci.edu/pub/ietf/uri/#Related
 * </pre>
 * results in the following subexpression matches:
 * <pre>
 *    $1 = http:
 *    $2 = http
 *    $3 = //www.ics.uci.edu
 *    $4 = www.ics.uci.edu
 *    $5 = /pub/ietf/uri/
 *    $6 = <undefined>
 *    $7 = <undefined>
 *    $8 = #Related
 *    $9 = Related
 * </pre>
 * where <undefined> indicates that the component is not present, as is the
 * case for the query component in the above example. Therefore, we can
 * determine the value of the five components as
 * <pre>
 *    scheme    = $2
 *    authority = $4
 *    path      = $5
 *    query     = $7
 *    fragment  = $9
 * </pre>
 *
 * The regular expression has been modified slightly to expose the
 * userInfo, domain, and port separately from the authority.
 * The modified version yields
 * <pre>
 *    $1 = http              scheme
 *    $2 = <undefined>       userInfo -\
 *    $3 = www.ics.uci.edu   domain     | authority
 *    $4 = <undefined>       port     -/
 *    $5 = /pub/ietf/uri/    path
 *    $6 = <undefined>       query without ?
 *    $7 = Related           fragment without #
 * </pre>
 * @type {!RegExp}
 * @internal
 */
var _splitRe = RegExpWrapper.create('^' +
    '(?:' +
    '([^:/?#.]+)' +
    // used by other URL parts such as :,
    // ?, /, #, and .
    ':)?' +
    '(?://' +
    '(?:([^/?#]*)@)?' +
    '([\\w\\d\\-\\u0100-\\uffff.%]*)' +
    // digits, dashes, dots, percent
    // escapes, and unicode characters.
    '(?::([0-9]+))?' +
    ')?' +
    '([^?#]+)?' +
    '(?:\\?([^#]*))?' +
    '(?:#(.*))?' +
    '$');
/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
var _ComponentIndex;
(function (_ComponentIndex) {
    _ComponentIndex[_ComponentIndex["Scheme"] = 1] = "Scheme";
    _ComponentIndex[_ComponentIndex["UserInfo"] = 2] = "UserInfo";
    _ComponentIndex[_ComponentIndex["Domain"] = 3] = "Domain";
    _ComponentIndex[_ComponentIndex["Port"] = 4] = "Port";
    _ComponentIndex[_ComponentIndex["Path"] = 5] = "Path";
    _ComponentIndex[_ComponentIndex["QueryData"] = 6] = "QueryData";
    _ComponentIndex[_ComponentIndex["Fragment"] = 7] = "Fragment";
})(_ComponentIndex || (_ComponentIndex = {}));
/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param {string} uri The URI string to examine.
 * @return {!Array.<string|undefined>} Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
function _split(uri) {
    return RegExpWrapper.firstMatch(_splitRe, uri);
}
/**
  * Removes dot segments in given path component, as described in
  * RFC 3986, section 5.2.4.
  *
  * @param {string} path A non-empty path component.
  * @return {string} Path component with removed dot segments.
  */
function _removeDotSegments(path) {
    if (path == '/')
        return '/';
    var leadingSlash = path[0] == '/' ? '/' : '';
    var trailingSlash = path[path.length - 1] === '/' ? '/' : '';
    var segments = path.split('/');
    var out = [];
    var up = 0;
    for (var pos = 0; pos < segments.length; pos++) {
        var segment = segments[pos];
        switch (segment) {
            case '':
            case '.':
                break;
            case '..':
                if (out.length > 0) {
                    out.pop();
                }
                else {
                    up++;
                }
                break;
            default:
                out.push(segment);
        }
    }
    if (leadingSlash == '') {
        while (up-- > 0) {
            out.unshift('..');
        }
        if (out.length === 0)
            out.push('.');
    }
    return leadingSlash + out.join('/') + trailingSlash;
}
/**
 * Takes an array of the parts from split and canonicalizes the path part
 * and then joins all the parts.
 * @param {Array.<string?>} parts
 * @return {string}
 */
function _joinAndCanonicalizePath(parts) {
    var path = parts[_ComponentIndex.Path];
    path = isBlank(path) ? '' : _removeDotSegments(path);
    parts[_ComponentIndex.Path] = path;
    return _buildFromEncodedParts(parts[_ComponentIndex.Scheme], parts[_ComponentIndex.UserInfo], parts[_ComponentIndex.Domain], parts[_ComponentIndex.Port], path, parts[_ComponentIndex.QueryData], parts[_ComponentIndex.Fragment]);
}
/**
 * Resolves a URL.
 * @param {string} base The URL acting as the base URL.
 * @param {string} to The URL to resolve.
 * @return {string}
 */
function _resolveUrl(base, url) {
    var parts = _split(encodeURI(url));
    var baseParts = _split(base);
    if (isPresent(parts[_ComponentIndex.Scheme])) {
        return _joinAndCanonicalizePath(parts);
    }
    else {
        parts[_ComponentIndex.Scheme] = baseParts[_ComponentIndex.Scheme];
    }
    for (var i = _ComponentIndex.Scheme; i <= _ComponentIndex.Port; i++) {
        if (isBlank(parts[i])) {
            parts[i] = baseParts[i];
        }
    }
    if (parts[_ComponentIndex.Path][0] == '/') {
        return _joinAndCanonicalizePath(parts);
    }
    var path = baseParts[_ComponentIndex.Path];
    if (isBlank(path))
        path = '/';
    var index = path.lastIndexOf('/');
    path = path.substring(0, index + 1) + parts[_ComponentIndex.Path];
    parts[_ComponentIndex.Path] = path;
    return _joinAndCanonicalizePath(parts);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCIsIlVybFJlc29sdmVyIiwiVXJsUmVzb2x2ZXIuY29uc3RydWN0b3IiLCJVcmxSZXNvbHZlci5yZXNvbHZlIiwiZ2V0VXJsU2NoZW1lIiwiX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyIsIl9Db21wb25lbnRJbmRleCIsIl9zcGxpdCIsIl9yZW1vdmVEb3RTZWdtZW50cyIsIl9qb2luQW5kQ2Fub25pY2FsaXplUGF0aCIsIl9yZXNvbHZlVXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxzQkFBc0I7T0FDaEQsRUFDTCxhQUFhLEVBQ2IsU0FBUyxFQUNULE9BQU8sRUFDUCxhQUFhLEVBRWQsTUFBTSwwQkFBMEI7T0FHMUIsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNDQUFzQztPQUM5RCxFQUFDLFFBQVEsRUFBQyxNQUFNLHNCQUFzQjtBQUU3Qzs7R0FFRztBQUNIO0lBQ0VBLE1BQU1BLENBQUNBLElBQUlBLFdBQVdBLEVBQUVBLENBQUNBO0FBQzNCQSxDQUFDQTtBQUVEOztHQUVHO0FBQ0gsV0FBVyw0QkFBNEIsR0FBRyxJQUFJLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO0FBRTFGOzs7Ozs7Ozs7O0dBVUc7QUFDSDtJQUlFQyxZQUFzQ0EsYUFBYUEsR0FBV0EsSUFBSUE7UUFDaEVDLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxhQUFhQSxDQUFDQSxVQUFVQSxDQUFDQSxhQUFhQSxFQUFFQSxHQUFHQSxDQUFD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QU1BLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLFFBQVFBLENBQUNBLEVBQzlEQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUNoRUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbkdBLENBQUNBO0FBRUQ7Ozs7O0dBS0c7QUFDSCxxQkFBcUIsSUFBWSxFQUFFLEdBQVc7SUFDNUNDLElBQUlBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ25DQSxJQUFJQSxTQUFTQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUU3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3BFQSxDQUFDQTtJQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxlQUFlQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzFCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFREEsSUFBSUEsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDM0NBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBO0lBQzlCQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNsQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDbEVBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25DQSxNQUFNQSxDQUFDQSx3QkFBd0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0FBQ3pDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZSwgSW5qZWN0fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBTdHJpbmdXcmFwcGVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIG5vcm1hbGl6ZUJsYW5rXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQQUNLQUdFX1JPT1RfVVJMfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9hcHBsaWNhdGlvbl90b2tlbnMnO1xuaW1wb3J0IHtQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG4vKipcbiAqIENyZWF0ZSBhIHtAbGluayBVcmxSZXNvbHZlcn0gd2l0aCBubyBwYWNrYWdlIHByZWZpeC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdpdGhvdXRQYWNrYWdlUHJlZml4KCk6IFVybFJlc29sdmVyIHtcbiAgcmV0dXJuIG5ldyBVcmxSZXNvbHZlcigpO1xufVxuXG4vKipcbiAqIEEgZGVmYXVsdCBwcm92aWRlciBmb3Ige0BsaW5rIFBBQ0tBR0VfUk9PVF9VUkx9IHRoYXQgbWFwcyB0byAnLycuXG4gKi9cbmV4cG9ydCB2YXIgREVGQVVMVF9QQUNLQUdFX1VSTF9QUk9WSURFUiA9IG5ldyBQcm92aWRlcihQQUNLQUdFX1JPT1RfVVJMLCB7dXNlVmFsdWU6IFwiL1wifSk7XG5cbi8qKlxuICogVXNlZCBieSB0aGUge0BsaW5rIENvbXBpbGVyfSB3aGVuIHJlc29sdmluZyBIVE1MIGFuZCBDU1MgdGVtcGxhdGUgVVJMcy5cbiAqXG4gKiBUaGlzIGNsYXNzIGNhbiBiZSBvdmVycmlkZGVuIGJ5IHRoZSBhcHBsaWNhdGlvbiBkZXZlbG9wZXIgdG8gY3JlYXRlIGN1c3RvbSBiZWhhdmlvci5cbiAqXG4gKiBTZWUge0BsaW5rIENvbXBpbGVyfVxuICpcbiAqICMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tcGlsZXIvdHMvdXJsX3Jlc29sdmVyL3VybF9yZXNvbHZlci50cyByZWdpb249J3VybF9yZXNvbHZlcid9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVcmxSZXNvbHZlciB7XG4gIHByaXZhdGUgX3BhY2thZ2VQcmVmaXg6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFBBQ0tBR0VfUk9PVF9VUkwpIHBhY2thZ2VQcmVmaXg6IHN0cmluZyA9IG51bGwpIHtcbiAgICBpZiAoaXNQcmVzZW50KHBhY2thZ2VQcmVmaXgpKSB7XG4gICAgICB0aGlzLl9wYWNrYWdlUHJlZml4ID0gU3RyaW5nV3JhcHBlci5zdHJpcFJpZ2h0KHBhY2thZ2VQcmVmaXgsIFwiL1wiKSArIFwiL1wiO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgYHVybGAgZ2l2ZW4gdGhlIGBiYXNlVXJsYDpcbiAgICogLSB3aGVuIHRoZSBgdXJsYCBpcyBudWxsLCB0aGUgYGJhc2VVcmxgIGlzIHJldHVybmVkLFxuICAgKiAtIGlmIGB1cmxgIGlzIHJlbGF0aXZlICgncGF0aC90by9oZXJlJywgJy4vcGF0aC90by9oZXJlJyksIHRoZSByZXNvbHZlZCB1cmwgaXMgYSBjb21iaW5hdGlvbiBvZlxuICAgKiBgYmFzZVVybGAgYW5kIGB1cmxgLFxuICAgKiAtIGlmIGB1cmxgIGlzIGFic29sdXRlIChpdCBoYXMgYSBzY2hlbWU6ICdodHRwOi8vJywgJ2h0dHBzOi8vJyBvciBzdGFydCB3aXRoICcvJyksIHRoZSBgdXJsYCBpc1xuICAgKiByZXR1cm5lZCBhcyBpcyAoaWdub3JpbmcgdGhlIGBiYXNlVXJsYClcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVcmxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgcmVzb2x2ZWQgVVJMXG4gICAqL1xuICByZXNvbHZlKGJhc2VVcmw6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciByZXNvbHZlZFVybCA9IHVybDtcbiAgICBpZiAoaXNQcmVzZW50KGJhc2VVcmwpICYmIGJhc2VVcmwubGVuZ3RoID4gMCkge1xuICAgICAgcmVzb2x2ZWRVcmwgPSBfcmVzb2x2ZVVybChiYXNlVXJsLCByZXNvbHZlZFVybCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGFja2FnZVByZWZpeCkgJiYgZ2V0VXJsU2NoZW1lKHJlc29sdmVkVXJsKSA9PSBcInBhY2thZ2VcIikge1xuICAgICAgcmVzb2x2ZWRVcmwgPSByZXNvbHZlZFVybC5yZXBsYWNlKFwicGFja2FnZTpcIiwgdGhpcy5fcGFja2FnZVByZWZpeCk7XG4gICAgfVxuICAgIHJldHVybiByZXNvbHZlZFVybDtcbiAgfVxufVxuXG4vKipcbiAqIEV4dHJhY3QgdGhlIHNjaGVtZSBvZiBhIFVSTC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFVybFNjaGVtZSh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBtYXRjaCA9IF9zcGxpdCh1cmwpO1xuICByZXR1cm4gKG1hdGNoICYmIG1hdGNoW19Db21wb25lbnRJbmRleC5TY2hlbWVdKSB8fCBcIlwiO1xufVxuXG4vLyBUaGUgY29kZSBiZWxvdyBpcyBhZGFwdGVkIGZyb20gVHJhY2V1cjpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9ibG9iLzk1MTFjMWRhZmE5NzJiZjBkZTEyMDJhOGE4NjNiYWQwMmYwZjk1YTgvc3JjL3J1bnRpbWUvdXJsLmpzXG5cbi8qKlxuICogQnVpbGRzIGEgVVJJIHN0cmluZyBmcm9tIGFscmVhZHktZW5jb2RlZCBwYXJ0cy5cbiAqXG4gKiBObyBlbmNvZGluZyBpcyBwZXJmb3JtZWQuICBBbnkgY29tcG9uZW50IG1heSBiZSBvbWl0dGVkIGFzIGVpdGhlciBudWxsIG9yXG4gKiB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3NjaGVtZSBUaGUgc2NoZW1lIHN1Y2ggYXMgJ2h0dHAnLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3VzZXJJbmZvIFRoZSB1c2VyIG5hbWUgYmVmb3JlIHRoZSAnQCcuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfZG9tYWluIFRoZSBkb21haW4gc3VjaCBhcyAnd3d3Lmdvb2dsZS5jb20nLCBhbHJlYWR5XG4gKiAgICAgVVJJLWVuY29kZWQuXG4gKiBAcGFyYW0geyhzdHJpbmd8bnVsbCk9fSBvcHRfcG9ydCBUaGUgcG9ydCBudW1iZXIuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfcGF0aCBUaGUgcGF0aCwgYWxyZWFkeSBVUkktZW5jb2RlZC4gIElmIGl0IGlzIG5vdFxuICogICAgIGVtcHR5LCBpdCBtdXN0IGJlZ2luIHdpdGggYSBzbGFzaC5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9xdWVyeURhdGEgVGhlIFVSSS1lbmNvZGVkIHF1ZXJ5IGRhdGEuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfZnJhZ21lbnQgVGhlIFVSSS1lbmNvZGVkIGZyYWdtZW50IGlkZW50aWZpZXIuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBmdWxseSBjb21iaW5lZCBVUkkuXG4gKi9cbmZ1bmN0aW9uIF9idWlsZEZyb21FbmNvZGVkUGFydHMob3B0X3NjaGVtZT86IHN0cmluZywgb3B0X3VzZXJJbmZvPzogc3RyaW5nLCBvcHRfZG9tYWluPzogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRfcG9ydD86IHN0cmluZywgb3B0X3BhdGg/OiBzdHJpbmcsIG9wdF9xdWVyeURhdGE/OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9mcmFnbWVudD86IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBvdXQgPSBbXTtcblxuICBpZiAoaXNQcmVzZW50KG9wdF9zY2hlbWUpKSB7XG4gICAgb3V0LnB1c2gob3B0X3NjaGVtZSArICc6Jyk7XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KG9wdF9kb21haW4pKSB7XG4gICAgb3V0LnB1c2goJy8vJyk7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF91c2VySW5mbykpIHtcbiAgICAgIG91dC5wdXNoKG9wdF91c2VySW5mbyArICdAJyk7XG4gICAgfVxuXG4gICAgb3V0LnB1c2gob3B0X2RvbWFpbik7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF9wb3J0KSkge1xuICAgICAgb3V0LnB1c2goJzonICsgb3B0X3BvcnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpc1ByZXNlbnQob3B0X3BhdGgpKSB7XG4gICAgb3V0LnB1c2gob3B0X3BhdGgpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfcXVlcnlEYXRhKSkge1xuICAgIG91dC5wdXNoKCc/JyArIG9wdF9xdWVyeURhdGEpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfZnJhZ21lbnQpKSB7XG4gICAgb3V0LnB1c2goJyMnICsgb3B0X2ZyYWdtZW50KTtcbiAgfVxuXG4gIHJldHVybiBvdXQuam9pbignJyk7XG59XG5cbi8qKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGJyZWFraW5nIGEgVVJJIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0cy5cbiAqXG4gKiB7QGxpbmsgaHR0cDovL3d3dy5nYml2LmNvbS9wcm90b2NvbHMvdXJpL3JmYy9yZmMzOTg2Lmh0bWwjUkZDMjIzNH0gc2F5c1xuICogQXMgdGhlIFwiZmlyc3QtbWF0Y2gtd2luc1wiIGFsZ29yaXRobSBpcyBpZGVudGljYWwgdG8gdGhlIFwiZ3JlZWR5XCJcbiAqIGRpc2FtYmlndWF0aW9uIG1ldGhvZCB1c2VkIGJ5IFBPU0lYIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGl0IGlzIG5hdHVyYWwgYW5kXG4gKiBjb21tb25wbGFjZSB0byB1c2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHBhcnNpbmcgdGhlIHBvdGVudGlhbCBmaXZlXG4gKiBjb21wb25lbnRzIG9mIGEgVVJJIHJlZmVyZW5jZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGxpbmUgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmctZG93biBhXG4gKiB3ZWxsLWZvcm1lZCBVUkkgcmVmZXJlbmNlIGludG8gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogPHByZT5cbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqIDwvcHJlPlxuICpcbiAqIFRoZSBudW1iZXJzIGluIHRoZSBzZWNvbmQgbGluZSBhYm92ZSBhcmUgb25seSB0byBhc3Npc3QgcmVhZGFiaWxpdHk7IHRoZXlcbiAqIGluZGljYXRlIHRoZSByZWZlcmVuY2UgcG9pbnRzIGZvciBlYWNoIHN1YmV4cHJlc3Npb24gKGkuZS4sIGVhY2ggcGFpcmVkXG4gKiBwYXJlbnRoZXNpcykuIFdlIHJlZmVyIHRvIHRoZSB2YWx1ZSBtYXRjaGVkIGZvciBzdWJleHByZXNzaW9uIDxuPiBhcyAkPG4+LlxuICogRm9yIGV4YW1wbGUsIG1hdGNoaW5nIHRoZSBhYm92ZSBleHByZXNzaW9uIHRvXG4gKiA8cHJlPlxuICogICAgIGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHJlc3VsdHMgaW4gdGhlIGZvbGxvd2luZyBzdWJleHByZXNzaW9uIG1hdGNoZXM6XG4gKiA8cHJlPlxuICogICAgJDEgPSBodHRwOlxuICogICAgJDIgPSBodHRwXG4gKiAgICAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogICAgJDUgPSAvcHViL2lldGYvdXJpL1xuICogICAgJDYgPSA8dW5kZWZpbmVkPlxuICogICAgJDcgPSA8dW5kZWZpbmVkPlxuICogICAgJDggPSAjUmVsYXRlZFxuICogICAgJDkgPSBSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHdoZXJlIDx1bmRlZmluZWQ+IGluZGljYXRlcyB0aGF0IHRoZSBjb21wb25lbnQgaXMgbm90IHByZXNlbnQsIGFzIGlzIHRoZVxuICogY2FzZSBmb3IgdGhlIHF1ZXJ5IGNvbXBvbmVudCBpbiB0aGUgYWJvdmUgZXhhbXBsZS4gVGhlcmVmb3JlLCB3ZSBjYW5cbiAqIGRldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIGZpdmUgY29tcG9uZW50cyBhc1xuICogPHByZT5cbiAqICAgIHNjaGVtZSAgICA9ICQyXG4gKiAgICBhdXRob3JpdHkgPSAkNFxuICogICAgcGF0aCAgICAgID0gJDVcbiAqICAgIHF1ZXJ5ICAgICA9ICQ3XG4gKiAgICBmcmFnbWVudCAgPSAkOVxuICogPC9wcmU+XG4gKlxuICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBoYXMgYmVlbiBtb2RpZmllZCBzbGlnaHRseSB0byBleHBvc2UgdGhlXG4gKiB1c2VySW5mbywgZG9tYWluLCBhbmQgcG9ydCBzZXBhcmF0ZWx5IGZyb20gdGhlIGF1dGhvcml0eS5cbiAqIFRoZSBtb2RpZmllZCB2ZXJzaW9uIHlpZWxkc1xuICogPHByZT5cbiAqICAgICQxID0gaHR0cCAgICAgICAgICAgICAgc2NoZW1lXG4gKiAgICAkMiA9IDx1bmRlZmluZWQ+ICAgICAgIHVzZXJJbmZvIC1cXFxuICogICAgJDMgPSB3d3cuaWNzLnVjaS5lZHUgICBkb21haW4gICAgIHwgYXV0aG9yaXR5XG4gKiAgICAkNCA9IDx1bmRlZmluZWQ+ICAgICAgIHBvcnQgICAgIC0vXG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvICAgIHBhdGhcbiAqICAgICQ2ID0gPHVuZGVmaW5lZD4gICAgICAgcXVlcnkgd2l0aG91dCA/XG4gKiAgICAkNyA9IFJlbGF0ZWQgICAgICAgICAgIGZyYWdtZW50IHdpdGhvdXQgI1xuICogPC9wcmU+XG4gKiBAdHlwZSB7IVJlZ0V4cH1cbiAqIEBpbnRlcm5hbFxuICovXG52YXIgX3NwbGl0UmUgPVxuICAgIFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCdeJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICcoW146Lz8jLl0rKScgKyAgLy8gc2NoZW1lIC0gaWdub3JlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCBieSBvdGhlciBVUkwgcGFydHMgc3VjaCBhcyA6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPywgLywgIywgYW5kIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAnOik/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/Oi8vJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OihbXi8/I10qKUApPycgKyAgICAgICAgICAgICAgICAgIC8vIHVzZXJJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyhbXFxcXHdcXFxcZFxcXFwtXFxcXHUwMTAwLVxcXFx1ZmZmZi4lXSopJyArICAvLyBkb21haW4gLSByZXN0cmljdCB0byBsZXR0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWdpdHMsIGRhc2hlcywgZG90cywgcGVyY2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2NhcGVzLCBhbmQgdW5pY29kZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICcoPzo6KFswLTldKykpPycgKyAgICAgICAgICAgICAgICAgICAvLyBwb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICAgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyhbXj8jXSspPycgKyAgICAgICAgLy8gcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcPyhbXiNdKikpPycgKyAgLy8gcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKD86IyguKikpPycgKyAgICAgICAvLyBmcmFnbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICckJyk7XG5cbi8qKlxuICogVGhlIGluZGV4IG9mIGVhY2ggVVJJIGNvbXBvbmVudCBpbiB0aGUgcmV0dXJuIHZhbHVlIG9mIGdvb2cudXJpLnV0aWxzLnNwbGl0LlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuZW51bSBfQ29tcG9uZW50SW5kZXgge1xuICBTY2hlbWUgPSAxLFxuICBVc2VySW5mbyxcbiAgRG9tYWluLFxuICBQb3J0LFxuICBQYXRoLFxuICBRdWVyeURhdGEsXG4gIEZyYWdtZW50XG59XG5cbi8qKlxuICogU3BsaXRzIGEgVVJJIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0cy5cbiAqXG4gKiBFYWNoIGNvbXBvbmVudCBjYW4gYmUgYWNjZXNzZWQgdmlhIHRoZSBjb21wb25lbnQgaW5kaWNlczsgZm9yIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogZ29vZy51cmkudXRpbHMuc3BsaXQoc29tZVN0cilbZ29vZy51cmkudXRpbHMuQ29tcG9udGVudEluZGV4LlFVRVJZX0RBVEFdO1xuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVyaSBUaGUgVVJJIHN0cmluZyB0byBleGFtaW5lLlxuICogQHJldHVybiB7IUFycmF5LjxzdHJpbmd8dW5kZWZpbmVkPn0gRWFjaCBjb21wb25lbnQgc3RpbGwgVVJJLWVuY29kZWQuXG4gKiAgICAgRWFjaCBjb21wb25lbnQgdGhhdCBpcyBwcmVzZW50IHdpbGwgY29udGFpbiB0aGUgZW5jb2RlZCB2YWx1ZSwgd2hlcmVhc1xuICogICAgIGNvbXBvbmVudHMgdGhhdCBhcmUgbm90IHByZXNlbnQgd2lsbCBiZSB1bmRlZmluZWQgb3IgZW1wdHksIGRlcGVuZGluZ1xuICogICAgIG9uIHRoZSBicm93c2VyJ3MgcmVndWxhciBleHByZXNzaW9uIGltcGxlbWVudGF0aW9uLiAgTmV2ZXIgbnVsbCwgc2luY2VcbiAqICAgICBhcmJpdHJhcnkgc3RyaW5ncyBtYXkgc3RpbGwgbG9vayBsaWtlIHBhdGggbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIF9zcGxpdCh1cmk6IHN0cmluZyk6IEFycmF5PHN0cmluZyB8IGFueT4ge1xuICByZXR1cm4gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9zcGxpdFJlLCB1cmkpO1xufVxuXG4vKipcbiAgKiBSZW1vdmVzIGRvdCBzZWdtZW50cyBpbiBnaXZlbiBwYXRoIGNvbXBvbmVudCwgYXMgZGVzY3JpYmVkIGluXG4gICogUkZDIDM5ODYsIHNlY3Rpb24gNS4yLjQuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBIG5vbi1lbXB0eSBwYXRoIGNvbXBvbmVudC5cbiAgKiBAcmV0dXJuIHtzdHJpbmd9IFBhdGggY29tcG9uZW50IHdpdGggcmVtb3ZlZCBkb3Qgc2VnbWVudHMuXG4gICovXG5mdW5jdGlvbiBfcmVtb3ZlRG90U2VnbWVudHMocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHBhdGggPT0gJy8nKSByZXR1cm4gJy8nO1xuXG4gIHZhciBsZWFkaW5nU2xhc2ggPSBwYXRoWzBdID09ICcvJyA/ICcvJyA6ICcnO1xuICB2YXIgdHJhaWxpbmdTbGFzaCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXSA9PT0gJy8nID8gJy8nIDogJyc7XG4gIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcblxuICB2YXIgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBwb3MgPSAwOyBwb3MgPCBzZWdtZW50cy5sZW5ndGg7IHBvcysrKSB7XG4gICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1twb3NdO1xuICAgIHN3aXRjaCAoc2VnbWVudCkge1xuICAgICAgY2FzZSAnJzpcbiAgICAgIGNhc2UgJy4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy4uJzpcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgb3V0LnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVwKys7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQucHVzaChzZWdtZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAobGVhZGluZ1NsYXNoID09ICcnKSB7XG4gICAgd2hpbGUgKHVwLS0gPiAwKSB7XG4gICAgICBvdXQudW5zaGlmdCgnLi4nKTtcbiAgICB9XG5cbiAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMCkgb3V0LnB1c2goJy4nKTtcbiAgfVxuXG4gIHJldHVybiBsZWFkaW5nU2xhc2ggKyBvdXQuam9pbignLycpICsgdHJhaWxpbmdTbGFzaDtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiB0aGUgcGFydHMgZnJvbSBzcGxpdCBhbmQgY2Fub25pY2FsaXplcyB0aGUgcGF0aCBwYXJ0XG4gKiBhbmQgdGhlbiBqb2lucyBhbGwgdGhlIHBhcnRzLlxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPz59IHBhcnRzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0czogYW55W10pOiBzdHJpbmcge1xuICB2YXIgcGF0aCA9IHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgcGF0aCA9IGlzQmxhbmsocGF0aCkgPyAnJyA6IF9yZW1vdmVEb3RTZWdtZW50cyhwYXRoKTtcbiAgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdID0gcGF0aDtcblxuICByZXR1cm4gX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyhwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSwgcGFydHNbX0NvbXBvbmVudEluZGV4LlVzZXJJbmZvXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LkRvbWFpbl0sIHBhcnRzW19Db21wb25lbnRJbmRleC5Qb3J0XSwgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlF1ZXJ5RGF0YV0sIHBhcnRzW19Db21wb25lbnRJbmRleC5GcmFnbWVudF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgVGhlIFVSTCBhY3RpbmcgYXMgdGhlIGJhc2UgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHRvIFRoZSBVUkwgdG8gcmVzb2x2ZS5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gX3Jlc29sdmVVcmwoYmFzZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBwYXJ0cyA9IF9zcGxpdChlbmNvZGVVUkkodXJsKSk7XG4gIHZhciBiYXNlUGFydHMgPSBfc3BsaXQoYmFzZSk7XG5cbiAgaWYgKGlzUHJlc2VudChwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSkpIHtcbiAgICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSBfQ29tcG9uZW50SW5kZXguU2NoZW1lOyBpIDw9IF9Db21wb25lbnRJbmRleC5Qb3J0OyBpKyspIHtcbiAgICBpZiAoaXNCbGFuayhwYXJ0c1tpXSkpIHtcbiAgICAgIHBhcnRzW2ldID0gYmFzZVBhcnRzW2ldO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF1bMF0gPT0gJy8nKSB7XG4gICAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cblxuICB2YXIgcGF0aCA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF07XG4gIGlmIChpc0JsYW5rKHBhdGgpKSBwYXRoID0gJy8nO1xuICB2YXIgaW5kZXggPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gIHBhdGggPSBwYXRoLnN1YnN0cmluZygwLCBpbmRleCArIDEpICsgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbn1cbiJdfQ==