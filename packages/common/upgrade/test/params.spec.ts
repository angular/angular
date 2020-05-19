/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AngularJSUrlCodec} from '../src/params';

describe('AngularJSUrlCodec', () => {
  const codec = new AngularJSUrlCodec();

  describe('parse', () => {
    it('should parse a complex URL', () => {
      const result = codec.parse('http://server.com:1234/foo?bar=true#heading');
      expect(result.href).toBe('http://server.com:1234/foo?bar=true#heading');
      expect(result.protocol).toBe('http');
      expect(result.host).toBe('server.com:1234');
      expect(result.search).toBe('bar=true');
      expect(result.hash).toBe('heading');
      expect(result.hostname).toBe('server.com');
      expect(result.port).toBe('1234');
      expect(result.pathname).toBe('/foo');
    });

    it('should parse a URL without search', () => {
      const result = codec.parse('http://server.com:1234/foo#heading');
      expect(result.href).toBe('http://server.com:1234/foo#heading');
      expect(result.search).toBe('');
      expect(result.hash).toBe('heading');
      expect(result.pathname).toBe('/foo');
    });

    it('should parse a URL without hash', () => {
      const result = codec.parse('http://server.com:1234/foo?bar=true');
      expect(result.href).toBe('http://server.com:1234/foo?bar=true');
      expect(result.search).toBe('bar=true');
      expect(result.hash).toBe('');
      expect(result.pathname).toBe('/foo');
    });

    it('should parse a basic URL', () => {
      const result = codec.parse('http://server.com');
      expect(result.href).toBe('http://server.com/');
      expect(result.protocol).toBe('http');
      expect(result.host).toBe('server.com');
      expect(result.search).toBe('');
      expect(result.hash).toBe('');
      expect(result.hostname).toBe('server.com');
      expect(result.port).toBe('');
      expect(result.pathname).toBe('/');
    });

    it('should apply a base', () => {
      const withoutSlash = codec.parse('foo/bar', 'http://abc.xyz');
      expect(withoutSlash.href).toBe('http://abc.xyz/foo/bar');
      const withSlash = codec.parse('/foo/bar', 'http://abc.xyz/');
      expect(withSlash.href).toBe('http://abc.xyz/foo/bar');
    });

    it('should ignore an empty base', () => {
      const result = codec.parse('http://abc.xyz', '');
      expect(result.href).toBe('http://abc.xyz/');
    });

    it('should throw an error for an invalid URL', () => {
      expect(() => {
        codec.parse('/foo/bar');
      }).toThrowError('Invalid URL (/foo/bar) with base (undefined)');
    });

    it('should throw an error for an invalid base', () => {
      expect(() => {
        codec.parse('http://foo.bar', 'abc');
      }).toThrowError('Invalid URL (http://foo.bar) with base (abc)');
    });
  });
});
