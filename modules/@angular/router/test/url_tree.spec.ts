/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultUrlSerializer, containsTree} from '../src/url_tree';

describe('UrlTree', () => {
  const serializer = new DefaultUrlSerializer();

  describe('containsTree', () => {
    describe('exact = true', () => {
      it('should return true when two tree are the same', () => {
        const url = '/one/(one//left:three)(right:four)';
        const t1 = serializer.parse(url);
        const t2 = serializer.parse(url);
        expect(containsTree(t1, t2, true)).toBe(true);
        expect(containsTree(t2, t1, true)).toBe(true);
      });

      it('should return false when paths are not the same', () => {
        const t1 = serializer.parse('/one/two(right:three)');
        const t2 = serializer.parse('/one/two2(right:three)');
        expect(containsTree(t1, t2, true)).toBe(false);
      });

      it('should return false when container has an extra child', () => {
        const t1 = serializer.parse('/one/two(right:three)');
        const t2 = serializer.parse('/one/two');
        expect(containsTree(t1, t2, true)).toBe(false);
      });

      it('should return false when containee has an extra child', () => {
        const t1 = serializer.parse('/one/two');
        const t2 = serializer.parse('/one/two(right:three)');
        expect(containsTree(t1, t2, true)).toBe(false);
      });
    });

    describe('exact = false', () => {
      it('should return true when containee is missing a segment', () => {
        const t1 = serializer.parse('/one/(two//left:three)(right:four)');
        const t2 = serializer.parse('/one/(two//left:three)');
        expect(containsTree(t1, t2, false)).toBe(true);
      });

      it('should return true when containee is missing some paths', () => {
        const t1 = serializer.parse('/one/two/three');
        const t2 = serializer.parse('/one/two');
        expect(containsTree(t1, t2, false)).toBe(true);
      });

      it('should return true container has its paths splitted into multiple segments', () => {
        const t1 = serializer.parse('/one/(two//left:three)');
        const t2 = serializer.parse('/one/two');
        expect(containsTree(t1, t2, false)).toBe(true);
      });

      it('should return false when containee has extra segments', () => {
        const t1 = serializer.parse('/one/two');
        const t2 = serializer.parse('/one/(two//left:three)');
        expect(containsTree(t1, t2, false)).toBe(false);
      });

      it('should return containee has segments that the container does not have', () => {
        const t1 = serializer.parse('/one/(two//left:three)');
        const t2 = serializer.parse('/one/(two//right:four)');
        expect(containsTree(t1, t2, false)).toBe(false);
      });

      it('should return false when containee has extra paths', () => {
        const t1 = serializer.parse('/one');
        const t2 = serializer.parse('/one/two');
        expect(containsTree(t1, t2, false)).toBe(false);
      });
    });
  });
});