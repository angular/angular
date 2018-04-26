/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UrlResolver, createOfflineCompileUrlResolver} from '@angular/compiler/src/url_resolver';
import {beforeEach, describe, expect, inject, it} from '@angular/core/testing/src/testing_internal';

{
  describe('UrlResolver', () => {
    let resolver = new UrlResolver();

    describe('absolute base url', () => {
      it('should add a relative path to the base url', () => {
        expect(resolver.resolve('http://www.foo.com', 'bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/', 'bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com', './bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/', './bar')).toEqual('http://www.foo.com/bar');
      });

      it('should replace the base path', () => {
        expect(resolver.resolve('http://www.foo.com/baz', 'bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/baz', './bar'))
            .toEqual('http://www.foo.com/bar');
      });

      it('should append to the base path', () => {
        expect(resolver.resolve('http://www.foo.com/baz/', 'bar'))
            .toEqual('http://www.foo.com/baz/bar');
        expect(resolver.resolve('http://www.foo.com/baz/', './bar'))
            .toEqual('http://www.foo.com/baz/bar');
      });

      it('should support ".." in the path', () => {
        expect(resolver.resolve('http://www.foo.com/baz/', '../bar'))
            .toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/1/2/3/', '../../bar'))
            .toEqual('http://www.foo.com/1/bar');
        expect(resolver.resolve('http://www.foo.com/1/2/3/', '../biz/bar'))
            .toEqual('http://www.foo.com/1/2/biz/bar');
        expect(resolver.resolve('http://www.foo.com/1/2/baz', '../../bar'))
            .toEqual('http://www.foo.com/bar');
      });

      it('should ignore the base path when the url has a scheme', () => {
        expect(resolver.resolve('http://www.foo.com', 'http://www.bar.com'))
            .toEqual('http://www.bar.com');
      });

      it('should support absolute urls', () => {
        expect(resolver.resolve('http://www.foo.com', '/bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/', '/bar')).toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/baz', '/bar'))
            .toEqual('http://www.foo.com/bar');
        expect(resolver.resolve('http://www.foo.com/baz/', '/bar'))
            .toEqual('http://www.foo.com/bar');
      });
    });

    describe('relative base url', () => {
      it('should add a relative path to the base url', () => {
        expect(resolver.resolve('foo/', './bar')).toEqual('foo/bar');
        expect(resolver.resolve('foo/baz', './bar')).toEqual('foo/bar');
        expect(resolver.resolve('foo/baz', 'bar')).toEqual('foo/bar');

      });

      it('should support ".." in the path', () => {
        expect(resolver.resolve('foo/baz', '../bar')).toEqual('bar');
        expect(resolver.resolve('foo/baz', '../biz/bar')).toEqual('biz/bar');
      });

      it('should support absolute urls', () => {
        expect(resolver.resolve('foo/baz', '/bar')).toEqual('/bar');
        expect(resolver.resolve('foo/baz/', '/bar')).toEqual('/bar');
      });

      it('should not resolve urls against the baseUrl when the url contains a scheme', () => {
        expect(resolver.resolve('base/', 'http:super_file')).toEqual('http:super_file');
        expect(resolver.resolve('base/', './mega_file')).toEqual('base/mega_file');
      });
    });

    describe('corner and error cases', () => {
      it('should encode URLs before resolving',
         () => {
           expect(resolver.resolve('foo/baz', `<p #p>Hello
        </p>`)).toEqual('foo/%3Cp%20#p%3EHello%0A%20%20%20%20%20%20%20%20%3C/p%3E');
         });
    });
  });
}
