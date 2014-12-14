import {describe, it, iit, xit, expect, beforeEach, afterEach} from 'test_lib/test_lib';
import {KeyValueChanges} from 'change_detection/keyvalue_changes';
import {NumberWrapper, isJsObject} from 'facade/lang';
import {MapWrapper} from 'facade/collection';
import {kvChangesAsString} from './util';

// todo(vicb): Update the code & tests for object equality
export function main() {
  describe('keyvalue_changes', function() {
    describe('KeyValueChanges', function() {
      var changes;
      var m;

      beforeEach(() => {
        changes = new KeyValueChanges();
        m = MapWrapper.create();
      });

      afterEach(() => {
        changes = null;
      });

      it('should detect additions', () => {
        changes.check(m);

        MapWrapper.set(m, 'a', 1);
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['a[null->1]'],
          additions: ['a[null->1]']
        }));

        MapWrapper.set(m, 'b', 2);
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
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
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['1[10->20]', '2[20->10]'],
          previous: ['1[10->20]', '2[20->10]'],
          changes: ['1[10->20]', '2[20->10]']
        }));
      });

      it('should do basic map watching', () => {
        changes.check(m);

        MapWrapper.set(m, 'a', 'A');
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['a[null->A]'],
          additions: ['a[null->A]']
        }));

        MapWrapper.set(m, 'b', 'B');
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['a', 'b[null->B]'],
          previous: ['a'],
          additions: ['b[null->B]']
        }));

        MapWrapper.set(m, 'b', 'BB');
        MapWrapper.set(m, 'd', 'D');
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['a', 'b[B->BB]', 'd[null->D]'],
          previous: ['a', 'b[B->BB]'],
          additions: ['d[null->D]'],
          changes: ['b[B->BB]']
        }));

        MapWrapper.delete(m, 'b');
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['a', 'd'],
          previous: ['a', 'b[BB->null]', 'd'],
          removals: ['b[BB->null]']
        }));

        MapWrapper.clear(m);
        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
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

        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['foo'],
          previous: ['foo']
        }));
      });

      it('should not see a NaN value as a change (JS)', () => {
        MapWrapper.set(m, 'foo', NumberWrapper.NaN);
        changes.check(m);

        changes.check(m);
        expect(changes.toString()).toEqual(kvChangesAsString({
          map: ['foo'],
          previous: ['foo']
        }));
      });

      // JS specific tests (JS Objects)
      if (isJsObject({})) {
        describe('JsObject changes', () => {
          it('should support JS Object', () => {
            expect(KeyValueChanges.supports({})).toBeTruthy();
            expect(KeyValueChanges.supports("not supported")).toBeFalsy();
            expect(KeyValueChanges.supports(0)).toBeFalsy();
            expect(KeyValueChanges.supports(null)).toBeFalsy();
          });

          it('should do basic object watching', () => {
            m = {};
            changes.check(m);

            m['a'] = 'A';
            changes.check(m);
            expect(changes.toString()).toEqual(kvChangesAsString({
              map: ['a[null->A]'],
              additions: ['a[null->A]']
            }));

            m['b'] = 'B';
            changes.check(m);
            expect(changes.toString()).toEqual(kvChangesAsString({
              map: ['a', 'b[null->B]'],
              previous: ['a'],
              additions: ['b[null->B]']
            }));

            m['b'] = 'BB';
            m['d'] = 'D';
            changes.check(m);
            expect(changes.toString()).toEqual(kvChangesAsString({
              map: ['a', 'b[B->BB]', 'd[null->D]'],
              previous: ['a', 'b[B->BB]'],
              additions: ['d[null->D]'],
              changes: ['b[B->BB]']
            }));

            m = {};
            m['a'] = 'A';
            m['d'] = 'D';
            changes.check(m);
            expect(changes.toString()).toEqual(kvChangesAsString({
              map: ['a', 'd'],
              previous: ['a', 'b[BB->null]', 'd'],
              removals: ['b[BB->null]']
            }));

            m = {};
            changes.check(m);
            expect(changes.toString()).toEqual(kvChangesAsString({
              previous: ['a[A->null]', 'd[D->null]'],
              removals: ['a[A->null]', 'd[D->null]']
            }));
          });
        });
      }
    });
  });
}
