var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isPresent, isBlank, RegExpWrapper } from 'angular2/src/facade/lang';
export function createWithoutPackagePrefix() {
    return new UrlResolver();
}
/**
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let UrlResolver = class {
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
    resolve(baseUrl, url) { return _resolveUrl(baseUrl, url); }
};
UrlResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], UrlResolver);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCIsIlVybFJlc29sdmVyIiwiVXJsUmVzb2x2ZXIucmVzb2x2ZSIsIl9idWlsZEZyb21FbmNvZGVkUGFydHMiLCJfQ29tcG9uZW50SW5kZXgiLCJfc3BsaXQiLCJfcmVtb3ZlRG90U2VnbWVudHMiLCJfam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgiLCJfcmVzb2x2ZVVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBaUIsTUFBTSwwQkFBMEI7QUFJMUY7SUFDRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsV0FBV0EsRUFBRUEsQ0FBQ0E7QUFDM0JBLENBQUNBO0FBR0Q7Ozs7OztHQU1HO0FBQ0g7SUFFRUM7Ozs7Ozs7Ozs7O09BV0dBO0lBQ0hBLE9BQU9BLENBQUNBLE9BQWVBLEVBQUVBLEdBQVdBLElBQVlDLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3JGRCxDQUFDQTtBQWZEO0lBQUMsVUFBVSxFQUFFOztnQkFlWjtBQUVELDBDQUEwQztBQUMxQyw4R0FBOEc7QUFFOUc7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxnQ0FBZ0MsVUFBbUIsRUFBRSxZQUFxQixFQUFFLFVBQW1CLEVBQy9ELFFBQWlCLEVBQUUsUUFBaUIsRUFBRSxhQUFzQixFQUM1RCxZQUFxQjtJQUNuREUsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFFYkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO0lBQzdCQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxQkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFZkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBO1FBQy9CQSxDQUFDQTtRQUVEQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUVyQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBO1FBQzNCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4QkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzdCQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxhQUFhQSxDQUFDQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7SUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdB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Q0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUNBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBRURBLElBQUlBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQzNDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUFDQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUM5QkEsSUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDbENBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ2xFQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUNuQ0EsTUFBTUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtBQUN6Q0EsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBSZWdFeHBXcmFwcGVyLCBub3JtYWxpemVCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCgpOiBVcmxSZXNvbHZlciB7XG4gIHJldHVybiBuZXcgVXJsUmVzb2x2ZXIoKTtcbn1cblxuXG4vKipcbiAqIFVzZWQgYnkgdGhlIHtAbGluayBDb21waWxlcn0gd2hlbiByZXNvbHZpbmcgSFRNTCBhbmQgQ1NTIHRlbXBsYXRlIFVSTHMuXG4gKlxuICogVGhpcyBpbnRlcmZhY2UgY2FuIGJlIG92ZXJyaWRkZW4gYnkgdGhlIGFwcGxpY2F0aW9uIGRldmVsb3BlciB0byBjcmVhdGUgY3VzdG9tIGJlaGF2aW9yLlxuICpcbiAqIFNlZSB7QGxpbmsgQ29tcGlsZXJ9XG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBVcmxSZXNvbHZlciB7XG4gIC8qKlxuICAgKiBSZXNvbHZlcyB0aGUgYHVybGAgZ2l2ZW4gdGhlIGBiYXNlVXJsYDpcbiAgICogLSB3aGVuIHRoZSBgdXJsYCBpcyBudWxsLCB0aGUgYGJhc2VVcmxgIGlzIHJldHVybmVkLFxuICAgKiAtIGlmIGB1cmxgIGlzIHJlbGF0aXZlICgncGF0aC90by9oZXJlJywgJy4vcGF0aC90by9oZXJlJyksIHRoZSByZXNvbHZlZCB1cmwgaXMgYSBjb21iaW5hdGlvbiBvZlxuICAgKiBgYmFzZVVybGAgYW5kIGB1cmxgLFxuICAgKiAtIGlmIGB1cmxgIGlzIGFic29sdXRlIChpdCBoYXMgYSBzY2hlbWU6ICdodHRwOi8vJywgJ2h0dHBzOi8vJyBvciBzdGFydCB3aXRoICcvJyksIHRoZSBgdXJsYCBpc1xuICAgKiByZXR1cm5lZCBhcyBpcyAoaWdub3JpbmcgdGhlIGBiYXNlVXJsYClcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VVcmxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgcmVzb2x2ZWQgVVJMXG4gICAqL1xuICByZXNvbHZlKGJhc2VVcmw6IHN0cmluZywgdXJsOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gX3Jlc29sdmVVcmwoYmFzZVVybCwgdXJsKTsgfVxufVxuXG4vLyBUaGUgY29kZSBiZWxvdyBpcyBhZGFwdGVkIGZyb20gVHJhY2V1cjpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9nb29nbGUvdHJhY2V1ci1jb21waWxlci9ibG9iLzk1MTFjMWRhZmE5NzJiZjBkZTEyMDJhOGE4NjNiYWQwMmYwZjk1YTgvc3JjL3J1bnRpbWUvdXJsLmpzXG5cbi8qKlxuICogQnVpbGRzIGEgVVJJIHN0cmluZyBmcm9tIGFscmVhZHktZW5jb2RlZCBwYXJ0cy5cbiAqXG4gKiBObyBlbmNvZGluZyBpcyBwZXJmb3JtZWQuICBBbnkgY29tcG9uZW50IG1heSBiZSBvbWl0dGVkIGFzIGVpdGhlciBudWxsIG9yXG4gKiB1bmRlZmluZWQuXG4gKlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3NjaGVtZSBUaGUgc2NoZW1lIHN1Y2ggYXMgJ2h0dHAnLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3VzZXJJbmZvIFRoZSB1c2VyIG5hbWUgYmVmb3JlIHRoZSAnQCcuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfZG9tYWluIFRoZSBkb21haW4gc3VjaCBhcyAnd3d3Lmdvb2dsZS5jb20nLCBhbHJlYWR5XG4gKiAgICAgVVJJLWVuY29kZWQuXG4gKiBAcGFyYW0geyhzdHJpbmd8bnVsbCk9fSBvcHRfcG9ydCBUaGUgcG9ydCBudW1iZXIuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfcGF0aCBUaGUgcGF0aCwgYWxyZWFkeSBVUkktZW5jb2RlZC4gIElmIGl0IGlzIG5vdFxuICogICAgIGVtcHR5LCBpdCBtdXN0IGJlZ2luIHdpdGggYSBzbGFzaC5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9xdWVyeURhdGEgVGhlIFVSSS1lbmNvZGVkIHF1ZXJ5IGRhdGEuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfZnJhZ21lbnQgVGhlIFVSSS1lbmNvZGVkIGZyYWdtZW50IGlkZW50aWZpZXIuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IFRoZSBmdWxseSBjb21iaW5lZCBVUkkuXG4gKi9cbmZ1bmN0aW9uIF9idWlsZEZyb21FbmNvZGVkUGFydHMob3B0X3NjaGVtZT86IHN0cmluZywgb3B0X3VzZXJJbmZvPzogc3RyaW5nLCBvcHRfZG9tYWluPzogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRfcG9ydD86IHN0cmluZywgb3B0X3BhdGg/OiBzdHJpbmcsIG9wdF9xdWVyeURhdGE/OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9mcmFnbWVudD86IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBvdXQgPSBbXTtcblxuICBpZiAoaXNQcmVzZW50KG9wdF9zY2hlbWUpKSB7XG4gICAgb3V0LnB1c2gob3B0X3NjaGVtZSArICc6Jyk7XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KG9wdF9kb21haW4pKSB7XG4gICAgb3V0LnB1c2goJy8vJyk7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF91c2VySW5mbykpIHtcbiAgICAgIG91dC5wdXNoKG9wdF91c2VySW5mbyArICdAJyk7XG4gICAgfVxuXG4gICAgb3V0LnB1c2gob3B0X2RvbWFpbik7XG5cbiAgICBpZiAoaXNQcmVzZW50KG9wdF9wb3J0KSkge1xuICAgICAgb3V0LnB1c2goJzonICsgb3B0X3BvcnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChpc1ByZXNlbnQob3B0X3BhdGgpKSB7XG4gICAgb3V0LnB1c2gob3B0X3BhdGgpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfcXVlcnlEYXRhKSkge1xuICAgIG91dC5wdXNoKCc/JyArIG9wdF9xdWVyeURhdGEpO1xuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfZnJhZ21lbnQpKSB7XG4gICAgb3V0LnB1c2goJyMnICsgb3B0X2ZyYWdtZW50KTtcbiAgfVxuXG4gIHJldHVybiBvdXQuam9pbignJyk7XG59XG5cbi8qKlxuICogQSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIGJyZWFraW5nIGEgVVJJIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0cy5cbiAqXG4gKiB7QGxpbmsgaHR0cDovL3d3dy5nYml2LmNvbS9wcm90b2NvbHMvdXJpL3JmYy9yZmMzOTg2Lmh0bWwjUkZDMjIzNH0gc2F5c1xuICogQXMgdGhlIFwiZmlyc3QtbWF0Y2gtd2luc1wiIGFsZ29yaXRobSBpcyBpZGVudGljYWwgdG8gdGhlIFwiZ3JlZWR5XCJcbiAqIGRpc2FtYmlndWF0aW9uIG1ldGhvZCB1c2VkIGJ5IFBPU0lYIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGl0IGlzIG5hdHVyYWwgYW5kXG4gKiBjb21tb25wbGFjZSB0byB1c2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHBhcnNpbmcgdGhlIHBvdGVudGlhbCBmaXZlXG4gKiBjb21wb25lbnRzIG9mIGEgVVJJIHJlZmVyZW5jZS5cbiAqXG4gKiBUaGUgZm9sbG93aW5nIGxpbmUgaXMgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmctZG93biBhXG4gKiB3ZWxsLWZvcm1lZCBVUkkgcmVmZXJlbmNlIGludG8gaXRzIGNvbXBvbmVudHMuXG4gKlxuICogPHByZT5cbiAqIF4oKFteOi8/I10rKTopPygvLyhbXi8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT9cbiAqICAxMiAgICAgICAgICAgIDMgIDQgICAgICAgICAgNSAgICAgICA2ICA3ICAgICAgICA4IDlcbiAqIDwvcHJlPlxuICpcbiAqIFRoZSBudW1iZXJzIGluIHRoZSBzZWNvbmQgbGluZSBhYm92ZSBhcmUgb25seSB0byBhc3Npc3QgcmVhZGFiaWxpdHk7IHRoZXlcbiAqIGluZGljYXRlIHRoZSByZWZlcmVuY2UgcG9pbnRzIGZvciBlYWNoIHN1YmV4cHJlc3Npb24gKGkuZS4sIGVhY2ggcGFpcmVkXG4gKiBwYXJlbnRoZXNpcykuIFdlIHJlZmVyIHRvIHRoZSB2YWx1ZSBtYXRjaGVkIGZvciBzdWJleHByZXNzaW9uIDxuPiBhcyAkPG4+LlxuICogRm9yIGV4YW1wbGUsIG1hdGNoaW5nIHRoZSBhYm92ZSBleHByZXNzaW9uIHRvXG4gKiA8cHJlPlxuICogICAgIGh0dHA6Ly93d3cuaWNzLnVjaS5lZHUvcHViL2lldGYvdXJpLyNSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHJlc3VsdHMgaW4gdGhlIGZvbGxvd2luZyBzdWJleHByZXNzaW9uIG1hdGNoZXM6XG4gKiA8cHJlPlxuICogICAgJDEgPSBodHRwOlxuICogICAgJDIgPSBodHRwXG4gKiAgICAkMyA9IC8vd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNCA9IHd3dy5pY3MudWNpLmVkdVxuICogICAgJDUgPSAvcHViL2lldGYvdXJpL1xuICogICAgJDYgPSA8dW5kZWZpbmVkPlxuICogICAgJDcgPSA8dW5kZWZpbmVkPlxuICogICAgJDggPSAjUmVsYXRlZFxuICogICAgJDkgPSBSZWxhdGVkXG4gKiA8L3ByZT5cbiAqIHdoZXJlIDx1bmRlZmluZWQ+IGluZGljYXRlcyB0aGF0IHRoZSBjb21wb25lbnQgaXMgbm90IHByZXNlbnQsIGFzIGlzIHRoZVxuICogY2FzZSBmb3IgdGhlIHF1ZXJ5IGNvbXBvbmVudCBpbiB0aGUgYWJvdmUgZXhhbXBsZS4gVGhlcmVmb3JlLCB3ZSBjYW5cbiAqIGRldGVybWluZSB0aGUgdmFsdWUgb2YgdGhlIGZpdmUgY29tcG9uZW50cyBhc1xuICogPHByZT5cbiAqICAgIHNjaGVtZSAgICA9ICQyXG4gKiAgICBhdXRob3JpdHkgPSAkNFxuICogICAgcGF0aCAgICAgID0gJDVcbiAqICAgIHF1ZXJ5ICAgICA9ICQ3XG4gKiAgICBmcmFnbWVudCAgPSAkOVxuICogPC9wcmU+XG4gKlxuICogVGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiBoYXMgYmVlbiBtb2RpZmllZCBzbGlnaHRseSB0byBleHBvc2UgdGhlXG4gKiB1c2VySW5mbywgZG9tYWluLCBhbmQgcG9ydCBzZXBhcmF0ZWx5IGZyb20gdGhlIGF1dGhvcml0eS5cbiAqIFRoZSBtb2RpZmllZCB2ZXJzaW9uIHlpZWxkc1xuICogPHByZT5cbiAqICAgICQxID0gaHR0cCAgICAgICAgICAgICAgc2NoZW1lXG4gKiAgICAkMiA9IDx1bmRlZmluZWQ+ICAgICAgIHVzZXJJbmZvIC1cXFxuICogICAgJDMgPSB3d3cuaWNzLnVjaS5lZHUgICBkb21haW4gICAgIHwgYXV0aG9yaXR5XG4gKiAgICAkNCA9IDx1bmRlZmluZWQ+ICAgICAgIHBvcnQgICAgIC0vXG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvICAgIHBhdGhcbiAqICAgICQ2ID0gPHVuZGVmaW5lZD4gICAgICAgcXVlcnkgd2l0aG91dCA/XG4gKiAgICAkNyA9IFJlbGF0ZWQgICAgICAgICAgIGZyYWdtZW50IHdpdGhvdXQgI1xuICogPC9wcmU+XG4gKiBAdHlwZSB7IVJlZ0V4cH1cbiAqIEBpbnRlcm5hbFxuICovXG52YXIgX3NwbGl0UmUgPVxuICAgIFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCdeJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICcoW146Lz8jLl0rKScgKyAgLy8gc2NoZW1lIC0gaWdub3JlIHNwZWNpYWwgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXNlZCBieSBvdGhlciBVUkwgcGFydHMgc3VjaCBhcyA6LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPywgLywgIywgYW5kIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAnOik/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/Oi8vJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OihbXi8/I10qKUApPycgKyAgICAgICAgICAgICAgICAgIC8vIHVzZXJJbmZvXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyhbXFxcXHdcXFxcZFxcXFwtXFxcXHUwMTAwLVxcXFx1ZmZmZi4lXSopJyArICAvLyBkb21haW4gLSByZXN0cmljdCB0byBsZXR0ZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBkaWdpdHMsIGRhc2hlcywgZG90cywgcGVyY2VudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlc2NhcGVzLCBhbmQgdW5pY29kZSBjaGFyYWN0ZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgICcoPzo6KFswLTldKykpPycgKyAgICAgICAgICAgICAgICAgICAvLyBwb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICAgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyhbXj8jXSspPycgKyAgICAgICAgLy8gcGF0aFxuICAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcPyhbXiNdKikpPycgKyAgLy8gcXVlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKD86IyguKikpPycgKyAgICAgICAvLyBmcmFnbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICckJyk7XG5cbi8qKlxuICogVGhlIGluZGV4IG9mIGVhY2ggVVJJIGNvbXBvbmVudCBpbiB0aGUgcmV0dXJuIHZhbHVlIG9mIGdvb2cudXJpLnV0aWxzLnNwbGl0LlxuICogQGVudW0ge251bWJlcn1cbiAqL1xuZW51bSBfQ29tcG9uZW50SW5kZXgge1xuICBTY2hlbWUgPSAxLFxuICBVc2VySW5mbyxcbiAgRG9tYWluLFxuICBQb3J0LFxuICBQYXRoLFxuICBRdWVyeURhdGEsXG4gIEZyYWdtZW50XG59XG5cbi8qKlxuICogU3BsaXRzIGEgVVJJIGludG8gaXRzIGNvbXBvbmVudCBwYXJ0cy5cbiAqXG4gKiBFYWNoIGNvbXBvbmVudCBjYW4gYmUgYWNjZXNzZWQgdmlhIHRoZSBjb21wb25lbnQgaW5kaWNlczsgZm9yIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogZ29vZy51cmkudXRpbHMuc3BsaXQoc29tZVN0cilbZ29vZy51cmkudXRpbHMuQ29tcG9udGVudEluZGV4LlFVRVJZX0RBVEFdO1xuICogPC9wcmU+XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHVyaSBUaGUgVVJJIHN0cmluZyB0byBleGFtaW5lLlxuICogQHJldHVybiB7IUFycmF5LjxzdHJpbmd8dW5kZWZpbmVkPn0gRWFjaCBjb21wb25lbnQgc3RpbGwgVVJJLWVuY29kZWQuXG4gKiAgICAgRWFjaCBjb21wb25lbnQgdGhhdCBpcyBwcmVzZW50IHdpbGwgY29udGFpbiB0aGUgZW5jb2RlZCB2YWx1ZSwgd2hlcmVhc1xuICogICAgIGNvbXBvbmVudHMgdGhhdCBhcmUgbm90IHByZXNlbnQgd2lsbCBiZSB1bmRlZmluZWQgb3IgZW1wdHksIGRlcGVuZGluZ1xuICogICAgIG9uIHRoZSBicm93c2VyJ3MgcmVndWxhciBleHByZXNzaW9uIGltcGxlbWVudGF0aW9uLiAgTmV2ZXIgbnVsbCwgc2luY2VcbiAqICAgICBhcmJpdHJhcnkgc3RyaW5ncyBtYXkgc3RpbGwgbG9vayBsaWtlIHBhdGggbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIF9zcGxpdCh1cmk6IHN0cmluZyk6IEFycmF5PHN0cmluZyB8IGFueT4ge1xuICByZXR1cm4gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9zcGxpdFJlLCB1cmkpO1xufVxuXG4vKipcbiAgKiBSZW1vdmVzIGRvdCBzZWdtZW50cyBpbiBnaXZlbiBwYXRoIGNvbXBvbmVudCwgYXMgZGVzY3JpYmVkIGluXG4gICogUkZDIDM5ODYsIHNlY3Rpb24gNS4yLjQuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBBIG5vbi1lbXB0eSBwYXRoIGNvbXBvbmVudC5cbiAgKiBAcmV0dXJuIHtzdHJpbmd9IFBhdGggY29tcG9uZW50IHdpdGggcmVtb3ZlZCBkb3Qgc2VnbWVudHMuXG4gICovXG5mdW5jdGlvbiBfcmVtb3ZlRG90U2VnbWVudHMocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKHBhdGggPT0gJy8nKSByZXR1cm4gJy8nO1xuXG4gIHZhciBsZWFkaW5nU2xhc2ggPSBwYXRoWzBdID09ICcvJyA/ICcvJyA6ICcnO1xuICB2YXIgdHJhaWxpbmdTbGFzaCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXSA9PT0gJy8nID8gJy8nIDogJyc7XG4gIHZhciBzZWdtZW50cyA9IHBhdGguc3BsaXQoJy8nKTtcblxuICB2YXIgb3V0OiBzdHJpbmdbXSA9IFtdO1xuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBwb3MgPSAwOyBwb3MgPCBzZWdtZW50cy5sZW5ndGg7IHBvcysrKSB7XG4gICAgdmFyIHNlZ21lbnQgPSBzZWdtZW50c1twb3NdO1xuICAgIHN3aXRjaCAoc2VnbWVudCkge1xuICAgICAgY2FzZSAnJzpcbiAgICAgIGNhc2UgJy4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJy4uJzpcbiAgICAgICAgaWYgKG91dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgb3V0LnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVwKys7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQucHVzaChzZWdtZW50KTtcbiAgICB9XG4gIH1cblxuICBpZiAobGVhZGluZ1NsYXNoID09ICcnKSB7XG4gICAgd2hpbGUgKHVwLS0gPiAwKSB7XG4gICAgICBvdXQudW5zaGlmdCgnLi4nKTtcbiAgICB9XG5cbiAgICBpZiAob3V0Lmxlbmd0aCA9PT0gMCkgb3V0LnB1c2goJy4nKTtcbiAgfVxuXG4gIHJldHVybiBsZWFkaW5nU2xhc2ggKyBvdXQuam9pbignLycpICsgdHJhaWxpbmdTbGFzaDtcbn1cblxuLyoqXG4gKiBUYWtlcyBhbiBhcnJheSBvZiB0aGUgcGFydHMgZnJvbSBzcGxpdCBhbmQgY2Fub25pY2FsaXplcyB0aGUgcGF0aCBwYXJ0XG4gKiBhbmQgdGhlbiBqb2lucyBhbGwgdGhlIHBhcnRzLlxuICogQHBhcmFtIHtBcnJheS48c3RyaW5nPz59IHBhcnRzXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0czogYW55W10pOiBzdHJpbmcge1xuICB2YXIgcGF0aCA9IHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgcGF0aCA9IGlzQmxhbmsocGF0aCkgPyAnJyA6IF9yZW1vdmVEb3RTZWdtZW50cyhwYXRoKTtcbiAgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdID0gcGF0aDtcblxuICByZXR1cm4gX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyhwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSwgcGFydHNbX0NvbXBvbmVudEluZGV4LlVzZXJJbmZvXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LkRvbWFpbl0sIHBhcnRzW19Db21wb25lbnRJbmRleC5Qb3J0XSwgcGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFydHNbX0NvbXBvbmVudEluZGV4LlF1ZXJ5RGF0YV0sIHBhcnRzW19Db21wb25lbnRJbmRleC5GcmFnbWVudF0pO1xufVxuXG4vKipcbiAqIFJlc29sdmVzIGEgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2UgVGhlIFVSTCBhY3RpbmcgYXMgdGhlIGJhc2UgVVJMLlxuICogQHBhcmFtIHtzdHJpbmd9IHRvIFRoZSBVUkwgdG8gcmVzb2x2ZS5cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gX3Jlc29sdmVVcmwoYmFzZTogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHZhciBwYXJ0cyA9IF9zcGxpdChlbmNvZGVVUkkodXJsKSk7XG4gIHZhciBiYXNlUGFydHMgPSBfc3BsaXQoYmFzZSk7XG5cbiAgaWYgKGlzUHJlc2VudChwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSkpIHtcbiAgICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfSBlbHNlIHtcbiAgICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXSA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguU2NoZW1lXTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSBfQ29tcG9uZW50SW5kZXguU2NoZW1lOyBpIDw9IF9Db21wb25lbnRJbmRleC5Qb3J0OyBpKyspIHtcbiAgICBpZiAoaXNCbGFuayhwYXJ0c1tpXSkpIHtcbiAgICAgIHBhcnRzW2ldID0gYmFzZVBhcnRzW2ldO1xuICAgIH1cbiAgfVxuXG4gIGlmIChwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF1bMF0gPT0gJy8nKSB7XG4gICAgcmV0dXJuIF9qb2luQW5kQ2Fub25pY2FsaXplUGF0aChwYXJ0cyk7XG4gIH1cblxuICB2YXIgcGF0aCA9IGJhc2VQYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF07XG4gIGlmIChpc0JsYW5rKHBhdGgpKSBwYXRoID0gJy8nO1xuICB2YXIgaW5kZXggPSBwYXRoLmxhc3RJbmRleE9mKCcvJyk7XG4gIHBhdGggPSBwYXRoLnN1YnN0cmluZygwLCBpbmRleCArIDEpICsgcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbn1cbiJdfQ==