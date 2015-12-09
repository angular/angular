var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlci50cyJdLCJuYW1lcyI6WyJjcmVhdGVXaXRob3V0UGFja2FnZVByZWZpeCIsIlVybFJlc29sdmVyIiwiVXJsUmVzb2x2ZXIucmVzb2x2ZSIsIl9idWlsZEZyb21FbmNvZGVkUGFydHMiLCJfQ29tcG9uZW50SW5kZXgiLCJfc3BsaXQiLCJfcmVtb3ZlRG90U2VnbWVudHMiLCJfam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgiLCJfcmVzb2x2ZVVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFpQixNQUFNLDBCQUEwQjtBQUkxRjtJQUNFQSxNQUFNQSxDQUFDQSxJQUFJQSxXQUFXQSxFQUFFQSxDQUFDQTtBQUMzQkEsQ0FBQ0E7QUFHRDs7Ozs7O0dBTUc7QUFDSDtJQUVFQzs7Ozs7Ozs7Ozs7T0FXR0E7SUFDSEEsT0FBT0EsQ0FBQ0EsT0FBZUEsRUFBRUEsR0FBV0EsSUFBWUMsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDckZELENBQUNBO0FBZkQ7SUFBQyxVQUFVLEVBQUU7O2dCQWVaO0FBRUQsMENBQTBDO0FBQzFDLDhHQUE4RztBQUU5Rzs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILGdDQUFnQyxVQUFtQixFQUFFLFlBQXFCLEVBQUUsVUFBbUIsRUFDL0QsUUFBaUIsRUFBRSxRQUFpQixFQUFFLGFBQXNCLEVBQzVELFlBQXFCO0lBQ25ERSxJQUFJQSxHQUFHQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUViQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxQkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDN0JBLENBQUNBO0lBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzFCQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUVmQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBRURBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBRXJCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDM0JBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ3hCQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7SUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLGFBQWFBLENBQUNBLENBQUNBO0lBQ2hDQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1QkEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsR0FB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QUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxZQUFZQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2QkEsT0FBT0EsRUFBRUEsRUFBRUEsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDaEJBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUN0Q0EsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsWUFBWUEsR0FBR0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsYUFBYUEsQ0FBQ0E7QUFDdERBLENBQUNBO0FBRUQ7Ozs7O0dBS0c7QUFDSCxrQ0FBa0MsS0FBWTtJQUM1Q0MsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLElBQUlBLEdBQUdBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBRW5DQSxNQUFNQSxDQUFDQSxzQkFBc0JBLENBQUNBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLFFBQVFBLENBQUNBLEVBQzlEQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUNoRUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDbkdBLENBQUNBO0FBRUQ7Ozs7O0dBS0c7QUFDSCxxQkFBcUIsSUFBWSxFQUFFLEdBQVc7SUFDNUNDLElBQUlBLEtBQUtBLEdBQUdBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ25DQSxJQUFJQSxTQUFTQSxHQUFHQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUU3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLE1BQU1BLENBQUNBLHdCQUF3QkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDekNBLENBQUNBO0lBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ05BLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3BFQSxDQUFDQTtJQUVEQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxlQUFlQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQzFCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxlQUFlQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0Esd0JBQXdCQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN6Q0EsQ0FBQ0E7SUFFREEsSUFBSUEsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDM0NBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQUNBLElBQUlBLEdBQUdBLEdBQUdBLENBQUNBO0lBQzlCQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNsQ0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsS0FBS0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDbEVBLEtBQUtBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25DQSxNQUFNQSxDQUFDQSx3QkFBd0JBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0FBQ3pDQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIFJlZ0V4cFdyYXBwZXIsIG5vcm1hbGl6ZUJsYW5rfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdpdGhvdXRQYWNrYWdlUHJlZml4KCk6IFVybFJlc29sdmVyIHtcbiAgcmV0dXJuIG5ldyBVcmxSZXNvbHZlcigpO1xufVxuXG5cbi8qKlxuICogVXNlZCBieSB0aGUge0BsaW5rIENvbXBpbGVyfSB3aGVuIHJlc29sdmluZyBIVE1MIGFuZCBDU1MgdGVtcGxhdGUgVVJMcy5cbiAqXG4gKiBUaGlzIGludGVyZmFjZSBjYW4gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb24gZGV2ZWxvcGVyIHRvIGNyZWF0ZSBjdXN0b20gYmVoYXZpb3IuXG4gKlxuICogU2VlIHtAbGluayBDb21waWxlcn1cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFVybFJlc29sdmVyIHtcbiAgLyoqXG4gICAqIFJlc29sdmVzIHRoZSBgdXJsYCBnaXZlbiB0aGUgYGJhc2VVcmxgOlxuICAgKiAtIHdoZW4gdGhlIGB1cmxgIGlzIG51bGwsIHRoZSBgYmFzZVVybGAgaXMgcmV0dXJuZWQsXG4gICAqIC0gaWYgYHVybGAgaXMgcmVsYXRpdmUgKCdwYXRoL3RvL2hlcmUnLCAnLi9wYXRoL3RvL2hlcmUnKSwgdGhlIHJlc29sdmVkIHVybCBpcyBhIGNvbWJpbmF0aW9uIG9mXG4gICAqIGBiYXNlVXJsYCBhbmQgYHVybGAsXG4gICAqIC0gaWYgYHVybGAgaXMgYWJzb2x1dGUgKGl0IGhhcyBhIHNjaGVtZTogJ2h0dHA6Ly8nLCAnaHR0cHM6Ly8nIG9yIHN0YXJ0IHdpdGggJy8nKSwgdGhlIGB1cmxgIGlzXG4gICAqIHJldHVybmVkIGFzIGlzIChpZ25vcmluZyB0aGUgYGJhc2VVcmxgKVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVVybFxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9IHRoZSByZXNvbHZlZCBVUkxcbiAgICovXG4gIHJlc29sdmUoYmFzZVVybDogc3RyaW5nLCB1cmw6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBfcmVzb2x2ZVVybChiYXNlVXJsLCB1cmwpOyB9XG59XG5cbi8vIFRoZSBjb2RlIGJlbG93IGlzIGFkYXB0ZWQgZnJvbSBUcmFjZXVyOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjZXVyLWNvbXBpbGVyL2Jsb2IvOTUxMWMxZGFmYTk3MmJmMGRlMTIwMmE4YTg2M2JhZDAyZjBmOTVhOC9zcmMvcnVudGltZS91cmwuanNcblxuLyoqXG4gKiBCdWlsZHMgYSBVUkkgc3RyaW5nIGZyb20gYWxyZWFkeS1lbmNvZGVkIHBhcnRzLlxuICpcbiAqIE5vIGVuY29kaW5nIGlzIHBlcmZvcm1lZC4gIEFueSBjb21wb25lbnQgbWF5IGJlIG9taXR0ZWQgYXMgZWl0aGVyIG51bGwgb3JcbiAqIHVuZGVmaW5lZC5cbiAqXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfc2NoZW1lIFRoZSBzY2hlbWUgc3VjaCBhcyAnaHR0cCcuXG4gKiBAcGFyYW0gez9zdHJpbmc9fSBvcHRfdXNlckluZm8gVGhlIHVzZXIgbmFtZSBiZWZvcmUgdGhlICdAJy5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9kb21haW4gVGhlIGRvbWFpbiBzdWNoIGFzICd3d3cuZ29vZ2xlLmNvbScsIGFscmVhZHlcbiAqICAgICBVUkktZW5jb2RlZC5cbiAqIEBwYXJhbSB7KHN0cmluZ3xudWxsKT19IG9wdF9wb3J0IFRoZSBwb3J0IG51bWJlci5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9wYXRoIFRoZSBwYXRoLCBhbHJlYWR5IFVSSS1lbmNvZGVkLiAgSWYgaXQgaXMgbm90XG4gKiAgICAgZW1wdHksIGl0IG11c3QgYmVnaW4gd2l0aCBhIHNsYXNoLlxuICogQHBhcmFtIHs/c3RyaW5nPX0gb3B0X3F1ZXJ5RGF0YSBUaGUgVVJJLWVuY29kZWQgcXVlcnkgZGF0YS5cbiAqIEBwYXJhbSB7P3N0cmluZz19IG9wdF9mcmFnbWVudCBUaGUgVVJJLWVuY29kZWQgZnJhZ21lbnQgaWRlbnRpZmllci5cbiAqIEByZXR1cm4ge3N0cmluZ30gVGhlIGZ1bGx5IGNvbWJpbmVkIFVSSS5cbiAqL1xuZnVuY3Rpb24gX2J1aWxkRnJvbUVuY29kZWRQYXJ0cyhvcHRfc2NoZW1lPzogc3RyaW5nLCBvcHRfdXNlckluZm8/OiBzdHJpbmcsIG9wdF9kb21haW4/OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdF9wb3J0Pzogc3RyaW5nLCBvcHRfcGF0aD86IHN0cmluZywgb3B0X3F1ZXJ5RGF0YT86IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0X2ZyYWdtZW50Pzogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFyIG91dCA9IFtdO1xuXG4gIGlmIChpc1ByZXNlbnQob3B0X3NjaGVtZSkpIHtcbiAgICBvdXQucHVzaChvcHRfc2NoZW1lICsgJzonKTtcbiAgfVxuXG4gIGlmIChpc1ByZXNlbnQob3B0X2RvbWFpbikpIHtcbiAgICBvdXQucHVzaCgnLy8nKTtcblxuICAgIGlmIChpc1ByZXNlbnQob3B0X3VzZXJJbmZvKSkge1xuICAgICAgb3V0LnB1c2gob3B0X3VzZXJJbmZvICsgJ0AnKTtcbiAgICB9XG5cbiAgICBvdXQucHVzaChvcHRfZG9tYWluKTtcblxuICAgIGlmIChpc1ByZXNlbnQob3B0X3BvcnQpKSB7XG4gICAgICBvdXQucHVzaCgnOicgKyBvcHRfcG9ydCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGlzUHJlc2VudChvcHRfcGF0aCkpIHtcbiAgICBvdXQucHVzaChvcHRfcGF0aCk7XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KG9wdF9xdWVyeURhdGEpKSB7XG4gICAgb3V0LnB1c2goJz8nICsgb3B0X3F1ZXJ5RGF0YSk7XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KG9wdF9mcmFnbWVudCkpIHtcbiAgICBvdXQucHVzaCgnIycgKyBvcHRfZnJhZ21lbnQpO1xuICB9XG5cbiAgcmV0dXJuIG91dC5qb2luKCcnKTtcbn1cblxuLyoqXG4gKiBBIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgYnJlYWtpbmcgYSBVUkkgaW50byBpdHMgY29tcG9uZW50IHBhcnRzLlxuICpcbiAqIHtAbGluayBodHRwOi8vd3d3LmdiaXYuY29tL3Byb3RvY29scy91cmkvcmZjL3JmYzM5ODYuaHRtbCNSRkMyMjM0fSBzYXlzXG4gKiBBcyB0aGUgXCJmaXJzdC1tYXRjaC13aW5zXCIgYWxnb3JpdGhtIGlzIGlkZW50aWNhbCB0byB0aGUgXCJncmVlZHlcIlxuICogZGlzYW1iaWd1YXRpb24gbWV0aG9kIHVzZWQgYnkgUE9TSVggcmVndWxhciBleHByZXNzaW9ucywgaXQgaXMgbmF0dXJhbCBhbmRcbiAqIGNvbW1vbnBsYWNlIHRvIHVzZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgcGFyc2luZyB0aGUgcG90ZW50aWFsIGZpdmVcbiAqIGNvbXBvbmVudHMgb2YgYSBVUkkgcmVmZXJlbmNlLlxuICpcbiAqIFRoZSBmb2xsb3dpbmcgbGluZSBpcyB0aGUgcmVndWxhciBleHByZXNzaW9uIGZvciBicmVha2luZy1kb3duIGFcbiAqIHdlbGwtZm9ybWVkIFVSSSByZWZlcmVuY2UgaW50byBpdHMgY29tcG9uZW50cy5cbiAqXG4gKiA8cHJlPlxuICogXigoW146Lz8jXSspOik/KC8vKFteLz8jXSopKT8oW14/I10qKShcXD8oW14jXSopKT8oIyguKikpP1xuICogIDEyICAgICAgICAgICAgMyAgNCAgICAgICAgICA1ICAgICAgIDYgIDcgICAgICAgIDggOVxuICogPC9wcmU+XG4gKlxuICogVGhlIG51bWJlcnMgaW4gdGhlIHNlY29uZCBsaW5lIGFib3ZlIGFyZSBvbmx5IHRvIGFzc2lzdCByZWFkYWJpbGl0eTsgdGhleVxuICogaW5kaWNhdGUgdGhlIHJlZmVyZW5jZSBwb2ludHMgZm9yIGVhY2ggc3ViZXhwcmVzc2lvbiAoaS5lLiwgZWFjaCBwYWlyZWRcbiAqIHBhcmVudGhlc2lzKS4gV2UgcmVmZXIgdG8gdGhlIHZhbHVlIG1hdGNoZWQgZm9yIHN1YmV4cHJlc3Npb24gPG4+IGFzICQ8bj4uXG4gKiBGb3IgZXhhbXBsZSwgbWF0Y2hpbmcgdGhlIGFib3ZlIGV4cHJlc3Npb24gdG9cbiAqIDxwcmU+XG4gKiAgICAgaHR0cDovL3d3dy5pY3MudWNpLmVkdS9wdWIvaWV0Zi91cmkvI1JlbGF0ZWRcbiAqIDwvcHJlPlxuICogcmVzdWx0cyBpbiB0aGUgZm9sbG93aW5nIHN1YmV4cHJlc3Npb24gbWF0Y2hlczpcbiAqIDxwcmU+XG4gKiAgICAkMSA9IGh0dHA6XG4gKiAgICAkMiA9IGh0dHBcbiAqICAgICQzID0gLy93d3cuaWNzLnVjaS5lZHVcbiAqICAgICQ0ID0gd3d3Lmljcy51Y2kuZWR1XG4gKiAgICAkNSA9IC9wdWIvaWV0Zi91cmkvXG4gKiAgICAkNiA9IDx1bmRlZmluZWQ+XG4gKiAgICAkNyA9IDx1bmRlZmluZWQ+XG4gKiAgICAkOCA9ICNSZWxhdGVkXG4gKiAgICAkOSA9IFJlbGF0ZWRcbiAqIDwvcHJlPlxuICogd2hlcmUgPHVuZGVmaW5lZD4gaW5kaWNhdGVzIHRoYXQgdGhlIGNvbXBvbmVudCBpcyBub3QgcHJlc2VudCwgYXMgaXMgdGhlXG4gKiBjYXNlIGZvciB0aGUgcXVlcnkgY29tcG9uZW50IGluIHRoZSBhYm92ZSBleGFtcGxlLiBUaGVyZWZvcmUsIHdlIGNhblxuICogZGV0ZXJtaW5lIHRoZSB2YWx1ZSBvZiB0aGUgZml2ZSBjb21wb25lbnRzIGFzXG4gKiA8cHJlPlxuICogICAgc2NoZW1lICAgID0gJDJcbiAqICAgIGF1dGhvcml0eSA9ICQ0XG4gKiAgICBwYXRoICAgICAgPSAkNVxuICogICAgcXVlcnkgICAgID0gJDdcbiAqICAgIGZyYWdtZW50ICA9ICQ5XG4gKiA8L3ByZT5cbiAqXG4gKiBUaGUgcmVndWxhciBleHByZXNzaW9uIGhhcyBiZWVuIG1vZGlmaWVkIHNsaWdodGx5IHRvIGV4cG9zZSB0aGVcbiAqIHVzZXJJbmZvLCBkb21haW4sIGFuZCBwb3J0IHNlcGFyYXRlbHkgZnJvbSB0aGUgYXV0aG9yaXR5LlxuICogVGhlIG1vZGlmaWVkIHZlcnNpb24geWllbGRzXG4gKiA8cHJlPlxuICogICAgJDEgPSBodHRwICAgICAgICAgICAgICBzY2hlbWVcbiAqICAgICQyID0gPHVuZGVmaW5lZD4gICAgICAgdXNlckluZm8gLVxcXG4gKiAgICAkMyA9IHd3dy5pY3MudWNpLmVkdSAgIGRvbWFpbiAgICAgfCBhdXRob3JpdHlcbiAqICAgICQ0ID0gPHVuZGVmaW5lZD4gICAgICAgcG9ydCAgICAgLS9cbiAqICAgICQ1ID0gL3B1Yi9pZXRmL3VyaS8gICAgcGF0aFxuICogICAgJDYgPSA8dW5kZWZpbmVkPiAgICAgICBxdWVyeSB3aXRob3V0ID9cbiAqICAgICQ3ID0gUmVsYXRlZCAgICAgICAgICAgZnJhZ21lbnQgd2l0aG91dCAjXG4gKiA8L3ByZT5cbiAqIEB0eXBlIHshUmVnRXhwfVxuICogQGludGVybmFsXG4gKi9cbnZhciBfc3BsaXRSZSA9XG4gICAgUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyhbXjovPyMuXSspJyArICAvLyBzY2hlbWUgLSBpZ25vcmUgc3BlY2lhbCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB1c2VkIGJ5IG90aGVyIFVSTCBwYXJ0cyBzdWNoIGFzIDosXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA/LCAvLCAjLCBhbmQgLlxuICAgICAgICAgICAgICAgICAgICAgICAgICc6KT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKD86Ly8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKD86KFteLz8jXSopQCk/JyArICAgICAgICAgICAgICAgICAgLy8gdXNlckluZm9cbiAgICAgICAgICAgICAgICAgICAgICAgICAnKFtcXFxcd1xcXFxkXFxcXC1cXFxcdTAxMDAtXFxcXHVmZmZmLiVdKiknICsgIC8vIGRvbWFpbiAtIHJlc3RyaWN0IHRvIGxldHRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpZ2l0cywgZGFzaGVzLCBkb3RzLCBwZXJjZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVzY2FwZXMsIGFuZCB1bmljb2RlIGNoYXJhY3RlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OjooWzAtOV0rKSk/JyArICAgICAgICAgICAgICAgICAgIC8vIHBvcnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnKFtePyNdKyk/JyArICAgICAgICAvLyBwYXRoXG4gICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFw/KFteI10qKSk/JyArICAvLyBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAgICAgICcoPzojKC4qKSk/JyArICAgICAgIC8vIGZyYWdtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgJyQnKTtcblxuLyoqXG4gKiBUaGUgaW5kZXggb2YgZWFjaCBVUkkgY29tcG9uZW50IGluIHRoZSByZXR1cm4gdmFsdWUgb2YgZ29vZy51cmkudXRpbHMuc3BsaXQuXG4gKiBAZW51bSB7bnVtYmVyfVxuICovXG5lbnVtIF9Db21wb25lbnRJbmRleCB7XG4gIFNjaGVtZSA9IDEsXG4gIFVzZXJJbmZvLFxuICBEb21haW4sXG4gIFBvcnQsXG4gIFBhdGgsXG4gIFF1ZXJ5RGF0YSxcbiAgRnJhZ21lbnRcbn1cblxuLyoqXG4gKiBTcGxpdHMgYSBVUkkgaW50byBpdHMgY29tcG9uZW50IHBhcnRzLlxuICpcbiAqIEVhY2ggY29tcG9uZW50IGNhbiBiZSBhY2Nlc3NlZCB2aWEgdGhlIGNvbXBvbmVudCBpbmRpY2VzOyBmb3IgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiBnb29nLnVyaS51dGlscy5zcGxpdChzb21lU3RyKVtnb29nLnVyaS51dGlscy5Db21wb250ZW50SW5kZXguUVVFUllfREFUQV07XG4gKiA8L3ByZT5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJpIFRoZSBVUkkgc3RyaW5nIHRvIGV4YW1pbmUuXG4gKiBAcmV0dXJuIHshQXJyYXkuPHN0cmluZ3x1bmRlZmluZWQ+fSBFYWNoIGNvbXBvbmVudCBzdGlsbCBVUkktZW5jb2RlZC5cbiAqICAgICBFYWNoIGNvbXBvbmVudCB0aGF0IGlzIHByZXNlbnQgd2lsbCBjb250YWluIHRoZSBlbmNvZGVkIHZhbHVlLCB3aGVyZWFzXG4gKiAgICAgY29tcG9uZW50cyB0aGF0IGFyZSBub3QgcHJlc2VudCB3aWxsIGJlIHVuZGVmaW5lZCBvciBlbXB0eSwgZGVwZW5kaW5nXG4gKiAgICAgb24gdGhlIGJyb3dzZXIncyByZWd1bGFyIGV4cHJlc3Npb24gaW1wbGVtZW50YXRpb24uICBOZXZlciBudWxsLCBzaW5jZVxuICogICAgIGFyYml0cmFyeSBzdHJpbmdzIG1heSBzdGlsbCBsb29rIGxpa2UgcGF0aCBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gX3NwbGl0KHVyaTogc3RyaW5nKTogQXJyYXk8c3RyaW5nIHwgYW55PiB7XG4gIHJldHVybiBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3NwbGl0UmUsIHVyaSk7XG59XG5cbi8qKlxuICAqIFJlbW92ZXMgZG90IHNlZ21lbnRzIGluIGdpdmVuIHBhdGggY29tcG9uZW50LCBhcyBkZXNjcmliZWQgaW5cbiAgKiBSRkMgMzk4Niwgc2VjdGlvbiA1LjIuNC5cbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIEEgbm9uLWVtcHR5IHBhdGggY29tcG9uZW50LlxuICAqIEByZXR1cm4ge3N0cmluZ30gUGF0aCBjb21wb25lbnQgd2l0aCByZW1vdmVkIGRvdCBzZWdtZW50cy5cbiAgKi9cbmZ1bmN0aW9uIF9yZW1vdmVEb3RTZWdtZW50cyhwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAocGF0aCA9PSAnLycpIHJldHVybiAnLyc7XG5cbiAgdmFyIGxlYWRpbmdTbGFzaCA9IHBhdGhbMF0gPT0gJy8nID8gJy8nIDogJyc7XG4gIHZhciB0cmFpbGluZ1NsYXNoID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSAnLycgPyAnLycgOiAnJztcbiAgdmFyIHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuXG4gIHZhciBvdXQ6IHN0cmluZ1tdID0gW107XG4gIHZhciB1cCA9IDA7XG4gIGZvciAodmFyIHBvcyA9IDA7IHBvcyA8IHNlZ21lbnRzLmxlbmd0aDsgcG9zKyspIHtcbiAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRzW3Bvc107XG4gICAgc3dpdGNoIChzZWdtZW50KSB7XG4gICAgICBjYXNlICcnOlxuICAgICAgY2FzZSAnLic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnLi4nOlxuICAgICAgICBpZiAob3V0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBvdXQucG9wKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXArKztcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dC5wdXNoKHNlZ21lbnQpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChsZWFkaW5nU2xhc2ggPT0gJycpIHtcbiAgICB3aGlsZSAodXAtLSA+IDApIHtcbiAgICAgIG91dC51bnNoaWZ0KCcuLicpO1xuICAgIH1cblxuICAgIGlmIChvdXQubGVuZ3RoID09PSAwKSBvdXQucHVzaCgnLicpO1xuICB9XG5cbiAgcmV0dXJuIGxlYWRpbmdTbGFzaCArIG91dC5qb2luKCcvJykgKyB0cmFpbGluZ1NsYXNoO1xufVxuXG4vKipcbiAqIFRha2VzIGFuIGFycmF5IG9mIHRoZSBwYXJ0cyBmcm9tIHNwbGl0IGFuZCBjYW5vbmljYWxpemVzIHRoZSBwYXRoIHBhcnRcbiAqIGFuZCB0aGVuIGpvaW5zIGFsbCB0aGUgcGFydHMuXG4gKiBAcGFyYW0ge0FycmF5LjxzdHJpbmc/Pn0gcGFydHNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzOiBhbnlbXSk6IHN0cmluZyB7XG4gIHZhciBwYXRoID0gcGFydHNbX0NvbXBvbmVudEluZGV4LlBhdGhdO1xuICBwYXRoID0gaXNCbGFuayhwYXRoKSA/ICcnIDogX3JlbW92ZURvdFNlZ21lbnRzKHBhdGgpO1xuICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF0gPSBwYXRoO1xuXG4gIHJldHVybiBfYnVpbGRGcm9tRW5jb2RlZFBhcnRzKHBhcnRzW19Db21wb25lbnRJbmRleC5TY2hlbWVdLCBwYXJ0c1tfQ29tcG9uZW50SW5kZXguVXNlckluZm9dLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguRG9tYWluXSwgcGFydHNbX0NvbXBvbmVudEluZGV4LlBvcnRdLCBwYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUXVlcnlEYXRhXSwgcGFydHNbX0NvbXBvbmVudEluZGV4LkZyYWdtZW50XSk7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgYSBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZSBUaGUgVVJMIGFjdGluZyBhcyB0aGUgYmFzZSBVUkwuXG4gKiBAcGFyYW0ge3N0cmluZ30gdG8gVGhlIFVSTCB0byByZXNvbHZlLlxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBfcmVzb2x2ZVVybChiYXNlOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgdmFyIHBhcnRzID0gX3NwbGl0KGVuY29kZVVSSSh1cmwpKTtcbiAgdmFyIGJhc2VQYXJ0cyA9IF9zcGxpdChiYXNlKTtcblxuICBpZiAoaXNQcmVzZW50KHBhcnRzW19Db21wb25lbnRJbmRleC5TY2hlbWVdKSkge1xuICAgIHJldHVybiBfam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xuICB9IGVsc2Uge1xuICAgIHBhcnRzW19Db21wb25lbnRJbmRleC5TY2hlbWVdID0gYmFzZVBhcnRzW19Db21wb25lbnRJbmRleC5TY2hlbWVdO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IF9Db21wb25lbnRJbmRleC5TY2hlbWU7IGkgPD0gX0NvbXBvbmVudEluZGV4LlBvcnQ7IGkrKykge1xuICAgIGlmIChpc0JsYW5rKHBhcnRzW2ldKSkge1xuICAgICAgcGFydHNbaV0gPSBiYXNlUGFydHNbaV07XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXVswXSA9PSAnLycpIHtcbiAgICByZXR1cm4gX2pvaW5BbmRDYW5vbmljYWxpemVQYXRoKHBhcnRzKTtcbiAgfVxuXG4gIHZhciBwYXRoID0gYmFzZVBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXTtcbiAgaWYgKGlzQmxhbmsocGF0aCkpIHBhdGggPSAnLyc7XG4gIHZhciBpbmRleCA9IHBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgcGF0aCA9IHBhdGguc3Vic3RyaW5nKDAsIGluZGV4ICsgMSkgKyBwYXJ0c1tfQ29tcG9uZW50SW5kZXguUGF0aF07XG4gIHBhcnRzW19Db21wb25lbnRJbmRleC5QYXRoXSA9IHBhdGg7XG4gIHJldHVybiBfam9pbkFuZENhbm9uaWNhbGl6ZVBhdGgocGFydHMpO1xufVxuIl19