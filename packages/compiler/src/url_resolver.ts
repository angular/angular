/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Create a {@link UrlResolver} with no package prefix.
 */
export function createUrlResolverWithoutPackagePrefix(): UrlResolver {
  return new UrlResolver();
}

export function createOfflineCompileUrlResolver(): UrlResolver {
  return new UrlResolver('.');
}

/**
 * Used by the {@link Compiler} when resolving HTML and CSS template URLs.
 *
 * This class can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 *
 * ## Example
 *
 * <code-example path="compiler/ts/url_resolver/url_resolver.ts"></code-example>
 *
 * @security  When compiling templates at runtime, you must
 * ensure that the entire template comes from a trusted source.
 * Attacker-controlled data introduced by a template could expose your
 * application to XSS risks. For more detail, see the [Security Guide](https://g.co/ng/security).
 */
export interface UrlResolver {
  resolve(baseUrl: string, url: string): string;
}

export interface UrlResolverCtor {
  new(packagePrefix?: string|null): UrlResolver;
}

export const UrlResolver: UrlResolverCtor = class UrlResolverImpl {
  constructor(private _packagePrefix: string|null = null) {}

  /**
   * Resolves the `url` given the `baseUrl`:
   * - when the `url` is null, the `baseUrl` is returned,
   * - if `url` is relative ('path/to/here', './path/to/here'), the resolved url is a combination of
   * `baseUrl` and `url`,
   * - if `url` is absolute (it has a scheme: 'http://', 'https://' or start with '/'), the `url` is
   * returned as is (ignoring the `baseUrl`)
   */
  resolve(baseUrl: string, url: string): string {
    let resolvedUrl = url;
    if (baseUrl != null && baseUrl.length > 0) {
      resolvedUrl = _resolveUrl(baseUrl, resolvedUrl);
    }
    const resolvedParts = _split(resolvedUrl);
    let prefix = this._packagePrefix;
    if (prefix != null && resolvedParts != null &&
        resolvedParts[_ComponentIndex.Scheme] == 'package') {
      let path = resolvedParts[_ComponentIndex.Path];
      prefix = prefix.replace(/\/+$/, '');
      path = path.replace(/^\/+/, '');
      return `${prefix}/${path}`;
    }
    return resolvedUrl;
  }
};

/**
 * Extract the scheme of a URL.
 */
export function getUrlScheme(url: string): string {
  const match = _split(url);
  return (match && match[_ComponentIndex.Scheme]) || '';
}

// The code below is adapted from Traceur:
// https://github.com/google/traceur-compiler/blob/9511c1dafa972bf0de1202a8a863bad02f0f95a8/src/runtime/url.js

/**
 * Builds a URI string from already-encoded parts.
 *
 * No encoding is performed.  Any component may be omitted as either null or
 * undefined.
 *
 * @param opt_scheme The scheme such as 'http'.
 * @param opt_userInfo The user name before the '@'.
 * @param opt_domain The domain such as 'www.google.com', already
 *     URI-encoded.
 * @param opt_port The port number.
 * @param opt_path The path, already URI-encoded.  If it is not
 *     empty, it must begin with a slash.
 * @param opt_queryData The URI-encoded query data.
 * @param opt_fragment The URI-encoded fragment identifier.
 * @return The fully combined URI.
 */
function _buildFromEncodedParts(
    opt_scheme?: string, opt_userInfo?: string, opt_domain?: string, opt_port?: string,
    opt_path?: string, opt_queryData?: string, opt_fragment?: string): string {
  const out: string[] = [];

  if (opt_scheme != null) {
    out.push(opt_scheme + ':');
  }

  if (opt_domain != null) {
    out.push('//');

    if (opt_userInfo != null) {
      out.push(opt_userInfo + '@');
    }

    out.push(opt_domain);

    if (opt_port != null) {
      out.push(':' + opt_port);
    }
  }

  if (opt_path != null) {
    out.push(opt_path);
  }

  if (opt_queryData != null) {
    out.push('?' + opt_queryData);
  }

  if (opt_fragment != null) {
    out.push('#' + opt_fragment);
  }

  return out.join('');
}

/**
 * A regular expression for breaking a URI into its component parts.
 *
 * {@link https://tools.ietf.org/html/rfc3986#appendix-B} says
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
 * @internal
 */
const _splitRe = new RegExp(
    '^' +
    '(?:' +
    '([^:/?#.]+)' +  // scheme - ignore special characters
                     // used by other URL parts such as :,
                     // ?, /, #, and .
    ':)?' +
    '(?://' +
    '(?:([^/?#]*)@)?' +                  // userInfo
    '([\\w\\d\\-\\u0100-\\uffff.%]*)' +  // domain - restrict to letters,
                                         // digits, dashes, dots, percent
                                         // escapes, and unicode characters.
    '(?::([0-9]+))?' +                   // port
    ')?' +
    '([^?#]+)?' +        // path
    '(?:\\?([^#]*))?' +  // query
    '(?:#(.*))?' +       // fragment
    '$');

/**
 * The index of each URI component in the return value of goog.uri.utils.split.
 * @enum {number}
 */
enum _ComponentIndex {
  Scheme = 1,
  UserInfo,
  Domain,
  Port,
  Path,
  QueryData,
  Fragment
}

/**
 * Splits a URI into its component parts.
 *
 * Each component can be accessed via the component indices; for example:
 * <pre>
 * goog.uri.utils.split(someStr)[goog.uri.utils.CompontentIndex.QUERY_DATA];
 * </pre>
 *
 * @param uri The URI string to examine.
 * @return Each component still URI-encoded.
 *     Each component that is present will contain the encoded value, whereas
 *     components that are not present will be undefined or empty, depending
 *     on the browser's regular expression implementation.  Never null, since
 *     arbitrary strings may still look like path names.
 */
function _split(uri: string): Array<string|any> {
  return uri.match(_splitRe)!;
}

/**
 * Removes dot segments in given path component, as described in
 * RFC 3986, section 5.2.4.
 *
 * @param path A non-empty path component.
 * @return Path component with removed dot segments.
 */
function _removeDotSegments(path: string): string {
  if (path == '/') return '/';

  const leadingSlash = path[0] == '/' ? '/' : '';
  const trailingSlash = path[path.length - 1] === '/' ? '/' : '';
  const segments = path.split('/');

  const out: string[] = [];
  let up = 0;
  for (let pos = 0; pos < segments.length; pos++) {
    const segment = segments[pos];
    switch (segment) {
      case '':
      case '.':
        break;
      case '..':
        if (out.length > 0) {
          out.pop();
        } else {
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

    if (out.length === 0) out.push('.');
  }

  return leadingSlash + out.join('/') + trailingSlash;
}

/**
 * Takes an array of the parts from split and canonicalizes the path part
 * and then joins all the parts.
 */
function _joinAndCanonicalizePath(parts: any[]): string {
  let path = parts[_ComponentIndex.Path];
  path = path == null ? '' : _removeDotSegments(path);
  parts[_ComponentIndex.Path] = path;

  return _buildFromEncodedParts(
      parts[_ComponentIndex.Scheme], parts[_ComponentIndex.UserInfo], parts[_ComponentIndex.Domain],
      parts[_ComponentIndex.Port], path, parts[_ComponentIndex.QueryData],
      parts[_ComponentIndex.Fragment]);
}

/**
 * Resolves a URL.
 * @param base The URL acting as the base URL.
 * @param to The URL to resolve.
 */
function _resolveUrl(base: string, url: string): string {
  const parts = _split(encodeURI(url));
  const baseParts = _split(base);

  if (parts[_ComponentIndex.Scheme] != null) {
    return _joinAndCanonicalizePath(parts);
  } else {
    parts[_ComponentIndex.Scheme] = baseParts[_ComponentIndex.Scheme];
  }

  for (let i = _ComponentIndex.Scheme; i <= _ComponentIndex.Port; i++) {
    if (parts[i] == null) {
      parts[i] = baseParts[i];
    }
  }

  if (parts[_ComponentIndex.Path][0] == '/') {
    return _joinAndCanonicalizePath(parts);
  }

  let path = baseParts[_ComponentIndex.Path];
  if (path == null) path = '/';
  const index = path.lastIndexOf('/');
  path = path.substring(0, index + 1) + parts[_ComponentIndex.Path];
  parts[_ComponentIndex.Path] = path;
  return _joinAndCanonicalizePath(parts);
}
