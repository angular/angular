/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A codec for encoding and decoding URL parts.
 *
 * @publicApi
 **/
export abstract class UrlCodec {
  abstract encodePath(path: string): string;
  abstract decodePath(path: string): string;

  abstract encodeSearch(search: string|{[k: string]: unknown}): string;
  abstract decodeSearch(search: string): {[k: string]: unknown};

  abstract encodeHash(hash: string): string;
  abstract decodeHash(hash: string): string;

  abstract normalize(href: string): string;
  abstract normalize(path: string, search: {[k: string]: unknown}, hash: string, baseUrl?: string):
      string;

  abstract areEqual(a: string, b: string): boolean;

  abstract parse(url: string, base?: string): {
    href: string,
    protocol: string,
    host: string,
    search: string,
    hash: string,
    hostname: string,
    port: string,
    pathname: string
  };
}

/**
 * A `AngularJSUrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters
 *
 * @publicApi
 */
export class AngularJSUrlCodec implements UrlCodec {
  encodePath(path: string): string {
    const segments = path.split('/');
    let i = segments.length;

    while (i--) {
      // decode forward slashes to prevent them from being double encoded
      segments[i] = encodeUriSegment(segments[i].replace(/%2F/g, '/'));
    }

    path = segments.join('/');
    return _stripIndexHtml((path && path[0] !== '/' && '/' || '') + path);
  }

  encodeSearch(search: string|{[k: string]: unknown}): string {
    if (typeof search === 'string') {
      search = parseKeyValue(search);
    }

    search = toKeyValue(search);
    return search ? '?' + search : '';
  }

  encodeHash(hash: string) {
    hash = encodeUriSegment(hash);
    return hash ? '#' + hash : '';
  }

  decodePath(path: string, html5Mode = true): string {
    const segments = path.split('/');
    let i = segments.length;

    while (i--) {
      segments[i] = decodeURIComponent(segments[i]);
      if (html5Mode) {
        // encode forward slashes to prevent them from being mistaken for path separators
        segments[i] = segments[i].replace(/\//g, '%2F');
      }
    }

    return segments.join('/');
  }

  decodeSearch(search: string) { return parseKeyValue(search); }

  decodeHash(hash: string) {
    hash = decodeURIComponent(hash);
    return hash[0] === '#' ? hash.substring(1) : hash;
  }

  normalize(href: string): string;
  normalize(path: string, search: {[k: string]: unknown}, hash: string, baseUrl?: string): string;
  normalize(pathOrHref: string, search?: {[k: string]: unknown}, hash?: string, baseUrl?: string):
      string {
    if (arguments.length === 1) {
      const parsed = this.parse(pathOrHref, baseUrl);

      if (typeof parsed === 'string') {
        return parsed;
      }

      const serverUrl =
          `${parsed.protocol}://${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;

      return this.normalize(
          this.decodePath(parsed.pathname), this.decodeSearch(parsed.search),
          this.decodeHash(parsed.hash), serverUrl);
    } else {
      const encPath = this.encodePath(pathOrHref);
      const encSearch = search && this.encodeSearch(search) || '';
      const encHash = hash && this.encodeHash(hash) || '';

      let joinedPath = (baseUrl || '') + encPath;

      if (!joinedPath.length || joinedPath[0] !== '/') {
        joinedPath = '/' + joinedPath;
      }
      return joinedPath + encSearch + encHash;
    }
  }

  areEqual(a: string, b: string) { return this.normalize(a) === this.normalize(b); }

  parse(url: string, base?: string) {
    try {
      const parsed = new URL(url, base);
      return {
        href: parsed.href,
        protocol: parsed.protocol ? parsed.protocol.replace(/:$/, '') : '',
        host: parsed.host,
        search: parsed.search ? parsed.search.replace(/^\?/, '') : '',
        hash: parsed.hash ? parsed.hash.replace(/^#/, '') : '',
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: (parsed.pathname.charAt(0) === '/') ? parsed.pathname : '/' + parsed.pathname
      };
    } catch (e) {
      throw new Error(`Invalid URL (${url}) with base (${base})`);
    }
  }
}

function _stripIndexHtml(url: string): string {
  return url.replace(/\/index.html$/, '');
}

/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @private
 * @param str value potential URI component to check.
 * @returns {boolean} True if `value` can be decoded
 * with the decodeURIComponent function.
 */
function tryDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value);
  } catch (e) {
    // Ignore any invalid uri component.
    return undefined;
  }
}


/**
 * Parses an escaped url query string into key-value pairs.
 * @returns {Object.<string,boolean|Array>}
 */
function parseKeyValue(keyValue: string): {[k: string]: unknown} {
  const obj: {[k: string]: unknown} = {};
  (keyValue || '').split('&').forEach((keyValue) => {
    let splitPoint, key, val;
    if (keyValue) {
      key = keyValue = keyValue.replace(/\+/g, '%20');
      splitPoint = keyValue.indexOf('=');
      if (splitPoint !== -1) {
        key = keyValue.substring(0, splitPoint);
        val = keyValue.substring(splitPoint + 1);
      }
      key = tryDecodeURIComponent(key);
      if (typeof key !== 'undefined') {
        val = typeof val !== 'undefined' ? tryDecodeURIComponent(val) : true;
        if (!obj.hasOwnProperty(key)) {
          obj[key] = val;
        } else if (Array.isArray(obj[key])) {
          (obj[key] as unknown[]).push(val);
        } else {
          obj[key] = [obj[key], val];
        }
      }
    }
  });
  return obj;
}

function toKeyValue(obj: {[k: string]: unknown}) {
  const parts: unknown[] = [];
  for (const key in obj) {
    let value = obj[key];
    if (Array.isArray(value)) {
      value.forEach((arrayValue) => {
        parts.push(
            encodeUriQuery(key, true) +
            (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
      });
    } else {
      parts.push(
          encodeUriQuery(key, true) +
          (value === true ? '' : '=' + encodeUriQuery(value as any, true)));
    }
  }
  return parts.length ? parts.join('&') : '';
}


/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * http://www.ietf.org/rfc/rfc3986.txt with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriSegment(val: string) {
  return encodeUriQuery(val, true)
      .replace(/%26/gi, '&')
      .replace(/%3D/gi, '=')
      .replace(/%2B/gi, '+');
}


/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per http://tools.ietf.org/html/rfc3986:
 *    query         = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 */
function encodeUriQuery(val: string, pctEncodeSpaces: boolean = false) {
  return encodeURIComponent(val)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/g, '$')
      .replace(/%2C/gi, ',')
      .replace(/%3B/gi, ';')
      .replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
}