var testing_internal_1 = require('angular2/testing_internal');
var default_keyvalue_differ_1 = require('angular2/src/core/change_detection/differs/default_keyvalue_differ');
var lang_1 = require('angular2/src/facade/lang');
var util_1 = require('../../../core/change_detection/util');
// todo(vicb): Update the code & tests for object equality
function main() {
    testing_internal_1.describe('keyvalue differ', function () {
        testing_internal_1.describe('DefaultKeyValueDiffer', function () {
            var differ;
            var m;
            testing_internal_1.beforeEach(function () {
                differ = new default_keyvalue_differ_1.DefaultKeyValueDiffer();
                m = new Map();
            });
            testing_internal_1.afterEach(function () { differ = null; });
            testing_internal_1.it('should detect additions', function () {
                differ.check(m);
                m.set('a', 1);
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ map: ['a[null->1]'], additions: ['a[null->1]'] }));
                m.set('b', 2);
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ map: ['a', 'b[null->2]'], previous: ['a'], additions: ['b[null->2]'] }));
            });
            testing_internal_1.it('should handle changing key/values correctly', function () {
                m.set(1, 10);
                m.set(2, 20);
                differ.check(m);
                m.set(2, 10);
                m.set(1, 20);
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({
                    map: ['1[10->20]', '2[20->10]'],
                    previous: ['1[10->20]', '2[20->10]'],
                    changes: ['1[10->20]', '2[20->10]']
                }));
            });
            testing_internal_1.it('should expose previous and current value', function () {
                var previous, current;
                m.set(1, 10);
                differ.check(m);
                m.set(1, 20);
                differ.check(m);
                differ.forEachChangedItem(function (record) {
                    previous = record.previousValue;
                    current = record.currentValue;
                });
                testing_internal_1.expect(previous).toEqual(10);
                testing_internal_1.expect(current).toEqual(20);
            });
            testing_internal_1.it('should do basic map watching', function () {
                differ.check(m);
                m.set('a', 'A');
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ map: ['a[null->A]'], additions: ['a[null->A]'] }));
                m.set('b', 'B');
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ map: ['a', 'b[null->B]'], previous: ['a'], additions: ['b[null->B]'] }));
                m.set('b', 'BB');
                m.set('d', 'D');
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({
                    map: ['a', 'b[B->BB]', 'd[null->D]'],
                    previous: ['a', 'b[B->BB]'],
                    additions: ['d[null->D]'],
                    changes: ['b[B->BB]']
                }));
                m.delete('b');
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ map: ['a', 'd'], previous: ['a', 'b[BB->null]', 'd'], removals: ['b[BB->null]'] }));
                m.clear();
                differ.check(m);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.kvChangesAsString({ previous: ['a[A->null]', 'd[D->null]'], removals: ['a[A->null]', 'd[D->null]'] }));
            });
            testing_internal_1.it('should test string by value rather than by reference (DART)', function () {
                m.set('foo', 'bar');
                differ.check(m);
                var f = 'f';
                var oo = 'oo';
                var b = 'b';
                var ar = 'ar';
                m.set(f + oo, b + ar);
                differ.check(m);
                testing_internal_1.expect(differ.toString()).toEqual(util_1.kvChangesAsString({ map: ['foo'], previous: ['foo'] }));
            });
            testing_internal_1.it('should not see a NaN value as a change (JS)', function () {
                m.set('foo', lang_1.NumberWrapper.NaN);
                differ.check(m);
                differ.check(m);
                testing_internal_1.expect(differ.toString()).toEqual(util_1.kvChangesAsString({ map: ['foo'], previous: ['foo'] }));
            });
            // JS specific tests (JS Objects)
            if (lang_1.isJsObject({})) {
                testing_internal_1.describe('JsObject changes', function () {
                    testing_internal_1.it('should support JS Object', function () {
                        var f = new default_keyvalue_differ_1.DefaultKeyValueDifferFactory();
                        testing_internal_1.expect(f.supports({})).toBeTruthy();
                        testing_internal_1.expect(f.supports("not supported")).toBeFalsy();
                        testing_internal_1.expect(f.supports(0)).toBeFalsy();
                        testing_internal_1.expect(f.supports(null)).toBeFalsy();
                    });
                    testing_internal_1.it('should do basic object watching', function () {
                        var m = {};
                        differ.check(m);
                        m['a'] = 'A';
                        differ.check(m);
                        testing_internal_1.expect(differ.toString())
                            .toEqual(util_1.kvChangesAsString({ map: ['a[null->A]'], additions: ['a[null->A]'] }));
                        m['b'] = 'B';
                        differ.check(m);
                        testing_internal_1.expect(differ.toString())
                            .toEqual(util_1.kvChangesAsString({ map: ['a', 'b[null->B]'], previous: ['a'], additions: ['b[null->B]'] }));
                        m['b'] = 'BB';
                        m['d'] = 'D';
                        differ.check(m);
                        testing_internal_1.expect(differ.toString())
                            .toEqual(util_1.kvChangesAsString({
                            map: ['a', 'b[B->BB]', 'd[null->D]'],
                            previous: ['a', 'b[B->BB]'],
                            additions: ['d[null->D]'],
                            changes: ['b[B->BB]']
                        }));
                        m = {};
                        m['a'] = 'A';
                        m['d'] = 'D';
                        differ.check(m);
                        testing_internal_1.expect(differ.toString())
                            .toEqual(util_1.kvChangesAsString({
                            map: ['a', 'd'],
                            previous: ['a', 'b[BB->null]', 'd'],
                            removals: ['b[BB->null]']
                        }));
                        m = {};
                        differ.check(m);
                        testing_internal_1.expect(differ.toString())
                            .toEqual(util_1.kvChangesAsString({
                            previous: ['a[A->null]', 'd[D->null]'],
                            removals: ['a[A->null]', 'd[D->null]']
                        }));
                    });
                });
                testing_internal_1.describe('diff', function () {
                    testing_internal_1.it('should return self when there is a change', function () {
                        m.set('a', 'A');
                        testing_internal_1.expect(differ.diff(m)).toBe(differ);
                    });
                    testing_internal_1.it('should return null when there is no change', function () {
                        m.set('a', 'A');
                        differ.diff(m);
                        testing_internal_1.expect(differ.diff(m)).toEqual(null);
                    });
                    testing_internal_1.it('should treat null as an empty list', function () {
                        m.set('a', 'A');
                        differ.diff(m);
                        testing_internal_1.expect(differ.diff(null).toString())
                            .toEqual(util_1.kvChangesAsString({ previous: ['a[A->null]'], removals: ['a[A->null]'] }));
                    });
                    testing_internal_1.it('should throw when given an invalid collection', function () {
                        testing_internal_1.expect(function () { return differ.diff("invalid"); }).toThrowErrorWith("Error trying to diff 'invalid'");
                    });
                });
            }
        });
    });
}
exports.main = main;
//# sourceMappingURL=default_keyvalue_differ_spec.js.map