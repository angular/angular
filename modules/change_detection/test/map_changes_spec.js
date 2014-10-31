import {describe, it, iit, xit, expect, beforeEach, afterEach} from 'test_lib/test_lib';

import {MapChanges} from 'change_detection/map_changes';

import {isBlank, NumberWrapper} from 'facade/lang';

import {MapWrapper} from 'facade/collection';

// todo(vicb): Update the code & tests for object equality
export function main() {
  describe('map_changes', function() {
    describe('MapChanges', function() {
      var changes;
      var m;

      beforeEach(() => {
        changes = new MapChanges();
        m = MapWrapper.create();
      });

      afterEach(() => {
        changes = null;
      });

      it('should detect additions', () => {
        changes.check(m);

        MapWrapper.set(m, 'a', 1);
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a[null->1]'],
          additions: ['a[null->1]']
        }));

        MapWrapper.set(m, 'b', 2);
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a', 'b[null->2]'],
          previous: ['a'],
          additions: ['b[null->2]']
        }));
      });

      it('should handle changing key/values correctly', () => {
        MapWrapper.set(m, 1, 10);
        MapWrapper.set(m, 2, 20);
        changes.check(m);

        MapWrapper.set(m, 2, 10);
        MapWrapper.set(m, 1, 20);
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['1[10->20]', '2[20->10]'],
          previous: ['1[10->20]', '2[20->10]'],
          changes: ['1[10->20]', '2[20->10]']
        }));
      });

      it('should do basic map watching', () => {
        changes.check(m);

        MapWrapper.set(m, 'a', 'A');
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a[null->A]'],
          additions: ['a[null->A]']
        }));

        MapWrapper.set(m, 'b', 'B');
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a', 'b[null->B]'],
          previous: ['a'],
          additions: ['b[null->B]']
        }));

        MapWrapper.set(m, 'b', 'BB');
        MapWrapper.set(m, 'd', 'D');
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a', 'b[B->BB]', 'd[null->D]'],
          previous: ['a', 'b[B->BB]'],
          additions: ['d[null->D]'],
          changes: ['b[B->BB]']
        }));

        MapWrapper.delete(m, 'b');
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['a', 'd'],
          previous: ['a', 'b[BB->null]', 'd'],
          removals: ['b[BB->null]']
        }));

        MapWrapper.clear(m);
        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          previous: ['a[A->null]', 'd[D->null]'],
          removals: ['a[A->null]', 'd[D->null]']
        }));
      });

      it('should test string by value rather than by reference (DART)', () => {
        MapWrapper.set(m, 'foo', 'bar');
        changes.check(m);

        var f = 'f';
        var oo = 'oo';
        var b = 'b';
        var ar = 'ar';

        MapWrapper.set(m, f + oo, b + ar);
        changes.check(m);

        expect(changes.toString()).toEqual(changesAsString({
          map: ['foo'],
          previous: ['foo']
        }));
      });

      it('should not see a NaN value as a change (JS)', () => {
        MapWrapper.set(m, 'foo', NumberWrapper.NaN);
        changes.check(m);

        changes.check(m);
        expect(changes.toString()).toEqual(changesAsString({
          map: ['foo'],
          previous: ['foo']
        }));
      });
    });
  });
}

function changesAsString({map, previous, additions, changes, removals}) {
  if (isBlank(map)) map = [];
  if (isBlank(previous)) previous = [];
  if (isBlank(additions)) additions = [];
  if (isBlank(changes)) changes = [];
  if (isBlank(removals)) removals = [];

  return "map: " + map.join(', ') + "\n" +
         "previous: " + previous.join(', ') + "\n" +
         "additions: " + additions.join(', ') + "\n" +
         "changes: " + changes.join(', ') + "\n" +
         "removals: " + removals.join(', ') + "\n";
}
