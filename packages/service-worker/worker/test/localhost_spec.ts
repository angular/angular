/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isLocalhost} from '../src/driver';

describe('isLocalhost', () => {
  it('should return true for localhost HTTP URLs', () => {
    expect(isLocalhost('http://localhost')).toBe(true);
    expect(isLocalhost('http://localhost/')).toBe(true);
    expect(isLocalhost('http://localhost:8080')).toBe(true);
    expect(isLocalhost('http://localhost:8080/')).toBe(true);
    expect(isLocalhost('http://localhost:3000/app')).toBe(true);
  });

  it('should return true for localhost HTTPS URLs', () => {
    expect(isLocalhost('https://localhost')).toBe(true);
    expect(isLocalhost('https://localhost/')).toBe(true);
    expect(isLocalhost('https://localhost:8080')).toBe(true);
    expect(isLocalhost('https://localhost:8080/')).toBe(true);
    expect(isLocalhost('https://localhost:3000/app')).toBe(true);
  });

  it('should return true for IPv6 localhost URLs', () => {
    expect(isLocalhost('http://[::1]')).toBe(true);
    expect(isLocalhost('http://[::1]/')).toBe(true);
    expect(isLocalhost('http://[::1]:8080')).toBe(true);
    expect(isLocalhost('https://[::1]:8080/')).toBe(true);
    expect(isLocalhost('[::1]:3000/path')).toBe(true);
  });

  it('should return true for IPv4 localhost (127.x.x.x) URLs', () => {
    expect(isLocalhost('http://127.0.0.1')).toBe(true);
    expect(isLocalhost('http://127.0.0.1/')).toBe(true);
    expect(isLocalhost('http://127.0.0.1:8080')).toBe(true);
    expect(isLocalhost('https://127.0.0.1:3000/app')).toBe(true);
    expect(isLocalhost('http://127.1.2.3:8080')).toBe(true);
    expect(isLocalhost('127.0.0.1:5000/test')).toBe(true);
  });

  it('should return true for URLs without protocol', () => {
    expect(isLocalhost('localhost')).toBe(true);
    expect(isLocalhost('localhost:8080')).toBe(true);
    expect(isLocalhost('localhost/path')).toBe(true);
    expect(isLocalhost('127.0.0.1')).toBe(true);
    expect(isLocalhost('[::1]:8080')).toBe(true);
  });

  it('should return false for non-localhost URLs', () => {
    expect(isLocalhost('http://example.com')).toBe(false);
    expect(isLocalhost('https://angular.dev')).toBe(false);
    expect(isLocalhost('http://192.168.1.1')).toBe(false);
    expect(isLocalhost('https://10.0.0.1:8080')).toBe(false);
    expect(isLocalhost('http://google.com')).toBe(false);
  });

  it('should return false for localhost-like domains that are not actual localhost', () => {
    expect(isLocalhost('http://mylocalhost.com')).toBe(false);
    expect(isLocalhost('https://sub.localhost.domain.com')).toBe(false);
    expect(isLocalhost('https://notlocalhost.com')).toBe(false);
    expect(isLocalhost('http://localhost.example.com')).toBe(false);
    expect(isLocalhost('fake-localhost.net')).toBe(false);
  });

  it('should return false for malformed URLs', () => {
    expect(isLocalhost('')).toBe(false);
    expect(isLocalhost('not-a-url')).toBe(false);
    expect(isLocalhost('http://')).toBe(false);
  });

  it('should handle edge cases correctly', () => {
    expect(isLocalhost('localhost/')).toBe(true);
    expect(isLocalhost('localhost:80/')).toBe(true);
    expect(isLocalhost('127.0.0.1/')).toBe(true);
    expect(isLocalhost('[::1]/')).toBe(true);
    expect(isLocalhost('http://localhost/very/long/path')).toBe(true);
    expect(isLocalhost('https://127.0.0.1:443/api/endpoint')).toBe(true);
  });

  it('should properly handle word boundaries for localhost', () => {
    expect(isLocalhost('http://mylocalhost.com')).toBe(false);
    expect(isLocalhost('https://sublocalhost.org')).toBe(false);
    expect(isLocalhost('notlocalhost.net')).toBe(false);

    expect(isLocalhost('http://localhost')).toBe(true);
    expect(isLocalhost('localhost:3000')).toBe(true);
  });
});
