/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DefaultUrlSerializer} from '@angular/router';

describe('DefaultUrlSerializer trailing slash handling', () => {
  function serialize(url: string, trailingSlash: 'always' | 'never' | 'preserve'): string {
    const serializer = new DefaultUrlSerializer();
    (serializer as any).trailingSlash = trailingSlash;
    const subtree = serializer.parse(url);
    return serializer.serialize(subtree);
  }

  describe('trailingSlash: "always"', () => {
    it('should add trailing slash to simple paths', () => {
      expect(serialize('/a/b', 'always')).toEqual('/a/b/');
    });

    it('should preserve existing trailing slash', () => {
      expect(serialize('/a/b/', 'always')).toEqual('/a/b/');
    });

    it('should not add slash to root', () => {
      expect(serialize('/', 'always')).toEqual('/');
    });

    it('should add slash before query params', () => {
      expect(serialize('/a?q=1', 'always')).toEqual('/a/?q=1');
    });

    it('should add slash before fragment', () => {
      expect(serialize('/a#f', 'always')).toEqual('/a/#f');
    });
  });

  describe('trailingSlash: "never"', () => {
    it('should remove trailing slash from simple paths', () => {
      expect(serialize('/a/b/', 'never')).toEqual('/a/b');
    });

    it('should preserve lack of trailing slash', () => {
      expect(serialize('/a/b', 'never')).toEqual('/a/b');
    });

    it('should preserve root slash', () => {
      expect(serialize('/', 'never')).toEqual('/');
    });

    it('should remove slash before query params', () => {
      expect(serialize('/a/?q=1', 'never')).toEqual('/a?q=1');
    });
  });

  describe('trailingSlash: "preserve"', () => {
    it('should preserve trailing slash', () => {
      expect(serialize('/a/b/', 'preserve')).toEqual('/a/b/');
    });

    it('should preserve lack of trailing slash', () => {
      expect(serialize('/a/b', 'preserve')).toEqual('/a/b');
    });
  });
});
