/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseCookieValue} from '../src/cookie';

describe('cookies', () => {
  it('parses cookies', () => {
    const cookie = 'other-cookie=false; xsrf-token=token-value; is_awesome=true; ffo=true;';
    expect(parseCookieValue(cookie, 'xsrf-token')).toBe('token-value');
  });

  it('handles encoded keys', () => {
    expect(parseCookieValue('whitespace%20token=token-value', 'whitespace token')).toBe(
      'token-value',
    );
  });

  it('handles encoded values', () => {
    expect(parseCookieValue('token=whitespace%20', 'token')).toBe('whitespace ');
    expect(parseCookieValue('token=whitespace%0A', 'token')).toBe('whitespace\n');
  });

  it('strips DQUOTE characters per RFC 6265 Section 4.1.1', () => {
    expect(parseCookieValue('token="abc123"', 'token')).toBe('abc123');
    expect(parseCookieValue('token=%22abc123%22', 'token')).toBe('abc123');
    expect(parseCookieValue('token="abc=def"', 'token')).toBe('abc=def');
    expect(parseCookieValue('token="abc def"', 'token')).toBe('abc def');
    expect(parseCookieValue('token=""', 'token')).toBe('');
    expect(parseCookieValue('token="abc"', 'token')).toBe('abc');
    expect(parseCookieValue('token="', 'token')).toBe('"');
  });

  it('handles malformed percent-encoding without throwing URIError', () => {
    expect(parseCookieValue('token=%ZZ', 'token')).toBe('%ZZ');
    expect(parseCookieValue('token="abc%ZZ"', 'token')).toBe('abc%ZZ');
  });
});
