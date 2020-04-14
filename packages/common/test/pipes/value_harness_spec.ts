/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ArrayHarness, DefaultValueHarness, MapHarness} from '@angular/common/src/pipes/value_harness';

fdescribe('ValueHarness', () => {
  describe('ArrayHarness', () => {
    it('should produce a new array whenever the contents differ', () => {
      const a = [1, 2, 3];
      const h = new ArrayHarness(a);

      const v1 = h.value;
      expect(v1).toEqual([1, 2, 3]);

      h.update([1, 2, 3]);

      const v2 = h.value;
      expect(v2).toBe(v1);
      expect(v2).toEqual([1, 2, 3]);

      h.update([1, 2, 3, 4]);

      const v3 = h.value;
      expect(v3).not.toBe(v2);
      expect(v3).not.toBe(v1);
      expect(v3).toEqual([1, 2, 3, 4]);
    });

    it('should produce a new array whenever it is mutated', () => {
      const a: {[key: string]: any} = {one: 1, two: 2};
      const h = new MapHarness(a);

      expect(h.value).toEqual({one: 1, two: 2});

      delete a['one'];
      h.update(a);
      expect(h.value).toEqual({two: 2});

      a['two'] = 4;
      h.update(a);
      expect(h.value).toEqual({two: 4});

      a['five'] = 5;
      h.update(a);
      expect(h.value).toEqual({two: 4, five: 5});
    });

    it('should update the array contents when called', () => {
      const h = new ArrayHarness([]);

      h.update([1]);
      expect(h.value).toEqual([1]);

      h.update([1, 2]);
      expect(h.value).toEqual([1, 2]);

      h.update([3]);
      expect(h.value).toEqual([3]);
    });
  });

  describe('MapHarness', () => {
    it('should produce a new map whenever the contents differ', () => {
      const a = {one: 1, two: 2};
      const h = new MapHarness(a);

      const v1 = h.value;
      expect(v1).toEqual({one: 1, two: 2});

      h.update({one: 1, two: 2});

      const v2 = h.value;
      expect(v2).toBe(v1);
      expect(v2).toEqual({one: 1, two: 2});

      h.update({one: 1, two: 2, three: 3});

      const v3 = h.value;
      expect(v3).not.toBe(v2);
      expect(v3).not.toBe(v1);
      expect(v3).toEqual({one: 1, two: 2, three: 3});
    });

    it('should produce a new map whenever map is mutated', () => {
      const a: {[key: string]: any} = {one: 1, two: 2};
      const h = new MapHarness(a);

      expect(h.value).toEqual({one: 1, two: 2});

      delete a['one'];
      h.update(a);
      expect(h.value).toEqual({two: 2});

      a['two'] = 4;
      h.update(a);
      expect(h.value).toEqual({two: 4});

      a['five'] = 5;
      h.update(a);
      expect(h.value).toEqual({two: 4, five: 5});
    });

    it('should update the map contents when called', () => {
      const h = new MapHarness({});

      expect(h.value).toEqual({});

      h.update({one: 1});
      expect(h.value).toEqual({one: 1});

      h.update({one: 1, two: 2});
      expect(h.value).toEqual({one: 1, two: 2});

      h.update({three: 3});
      expect(h.value).toEqual({three: 3});
    });
  });

  describe('DefaultValueHarness', () => {
    it('should update the value when update() is called', () => {
      const h = new DefaultValueHarness(null);
      expect(h.value).toEqual(null);

      h.update(undefined);
      expect(h.value).toEqual(undefined);

      h.update(1);
      expect(h.value).toEqual(1);

      h.update('one');
      expect(h.value).toEqual('one');

      h.update(true);
      expect(h.value).toEqual(true);

      h.update({});
      expect(h.value).toEqual({});
    });
  });
});
