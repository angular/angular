var testing_internal_1 = require('angular2/testing_internal');
var default_iterable_differ_1 = require('angular2/src/core/change_detection/differs/default_iterable_differ');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var iterable_1 = require('../../../core/change_detection/iterable');
var util_1 = require('../../../core/change_detection/util');
// todo(vicb): UnmodifiableListView / frozen object when implemented
function main() {
    testing_internal_1.describe('iterable differ', function () {
        testing_internal_1.describe('DefaultIterableDiffer', function () {
            var differ;
            testing_internal_1.beforeEach(function () { differ = new default_iterable_differ_1.DefaultIterableDiffer(); });
            testing_internal_1.it('should support list and iterables', function () {
                var f = new default_iterable_differ_1.DefaultIterableDifferFactory();
                testing_internal_1.expect(f.supports([])).toBeTruthy();
                testing_internal_1.expect(f.supports(new iterable_1.TestIterable())).toBeTruthy();
                testing_internal_1.expect(f.supports(new Map())).toBeFalsy();
                testing_internal_1.expect(f.supports(null)).toBeFalsy();
            });
            testing_internal_1.it('should support iterables', function () {
                var l = new iterable_1.TestIterable();
                differ.check(l);
                testing_internal_1.expect(differ.toString()).toEqual(util_1.iterableChangesAsString({ collection: [] }));
                l.list = [1];
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['1[null->0]'], additions: ['1[null->0]'] }));
                l.list = [2, 1];
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['2[null->0]', '1[0->1]'],
                    previous: ['1[0->1]'],
                    additions: ['2[null->0]'],
                    moves: ['1[0->1]']
                }));
            });
            testing_internal_1.it('should detect additions', function () {
                var l = [];
                differ.check(l);
                testing_internal_1.expect(differ.toString()).toEqual(util_1.iterableChangesAsString({ collection: [] }));
                l.push('a');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['a[null->0]'], additions: ['a[null->0]'] }));
                l.push('b');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['a', 'b[null->1]'], previous: ['a'], additions: ['b[null->1]'] }));
            });
            testing_internal_1.it('should support changing the reference', function () {
                var l = [0];
                differ.check(l);
                l = [1, 0];
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['1[null->0]', '0[0->1]'],
                    previous: ['0[0->1]'],
                    additions: ['1[null->0]'],
                    moves: ['0[0->1]']
                }));
                l = [2, 1, 0];
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['2[null->0]', '1[0->1]', '0[1->2]'],
                    previous: ['1[0->1]', '0[1->2]'],
                    additions: ['2[null->0]'],
                    moves: ['1[0->1]', '0[1->2]']
                }));
            });
            testing_internal_1.it('should handle swapping element', function () {
                var l = [1, 2];
                differ.check(l);
                collection_1.ListWrapper.clear(l);
                l.push(2);
                l.push(1);
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['2[1->0]', '1[0->1]'],
                    previous: ['1[0->1]', '2[1->0]'],
                    moves: ['2[1->0]', '1[0->1]']
                }));
            });
            testing_internal_1.it('should handle swapping element', function () {
                var l = ['a', 'b', 'c'];
                differ.check(l);
                collection_1.ListWrapper.removeAt(l, 1);
                collection_1.ListWrapper.insert(l, 0, 'b');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['b[1->0]', 'a[0->1]', 'c'],
                    previous: ['a[0->1]', 'b[1->0]', 'c'],
                    moves: ['b[1->0]', 'a[0->1]']
                }));
                collection_1.ListWrapper.removeAt(l, 1);
                l.push('a');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['b', 'c[2->1]', 'a[1->2]'],
                    previous: ['b', 'a[1->2]', 'c[2->1]'],
                    moves: ['c[2->1]', 'a[1->2]']
                }));
            });
            testing_internal_1.it('should detect changes in list', function () {
                var l = [];
                differ.check(l);
                l.push('a');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['a[null->0]'], additions: ['a[null->0]'] }));
                l.push('b');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['a', 'b[null->1]'], previous: ['a'], additions: ['b[null->1]'] }));
                l.push('c');
                l.push('d');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['a', 'b', 'c[null->2]', 'd[null->3]'],
                    previous: ['a', 'b'],
                    additions: ['c[null->2]', 'd[null->3]']
                }));
                collection_1.ListWrapper.removeAt(l, 2);
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['a', 'b', 'd[3->2]'],
                    previous: ['a', 'b', 'c[2->null]', 'd[3->2]'],
                    moves: ['d[3->2]'],
                    removals: ['c[2->null]']
                }));
                collection_1.ListWrapper.clear(l);
                l.push('d');
                l.push('c');
                l.push('b');
                l.push('a');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['d[2->0]', 'c[null->1]', 'b[1->2]', 'a[0->3]'],
                    previous: ['a[0->3]', 'b[1->2]', 'd[2->0]'],
                    additions: ['c[null->1]'],
                    moves: ['d[2->0]', 'b[1->2]', 'a[0->3]']
                }));
            });
            testing_internal_1.it('should test string by value rather than by reference (Dart)', function () {
                var l = ['a', 'boo'];
                differ.check(l);
                var b = 'b';
                var oo = 'oo';
                l[1] = b + oo;
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: ['a', 'boo'], previous: ['a', 'boo'] }));
            });
            testing_internal_1.it('should ignore [NaN] != [NaN] (JS)', function () {
                var l = [lang_1.NumberWrapper.NaN];
                differ.check(l);
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({ collection: [lang_1.NumberWrapper.NaN], previous: [lang_1.NumberWrapper.NaN] }));
            });
            testing_internal_1.it('should detect [NaN] moves', function () {
                var l = [lang_1.NumberWrapper.NaN, lang_1.NumberWrapper.NaN];
                differ.check(l);
                collection_1.ListWrapper.insert(l, 0, 'foo');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['foo[null->0]', 'NaN[0->1]', 'NaN[1->2]'],
                    previous: ['NaN[0->1]', 'NaN[1->2]'],
                    additions: ['foo[null->0]'],
                    moves: ['NaN[0->1]', 'NaN[1->2]']
                }));
            });
            testing_internal_1.it('should remove and add same item', function () {
                var l = ['a', 'b', 'c'];
                differ.check(l);
                collection_1.ListWrapper.removeAt(l, 1);
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['a', 'c[2->1]'],
                    previous: ['a', 'b[1->null]', 'c[2->1]'],
                    moves: ['c[2->1]'],
                    removals: ['b[1->null]']
                }));
                collection_1.ListWrapper.insert(l, 1, 'b');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['a', 'b[null->1]', 'c[1->2]'],
                    previous: ['a', 'c[1->2]'],
                    additions: ['b[null->1]'],
                    moves: ['c[1->2]']
                }));
            });
            testing_internal_1.it('should support duplicates', function () {
                var l = ['a', 'a', 'a', 'b', 'b'];
                differ.check(l);
                collection_1.ListWrapper.removeAt(l, 0);
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['a', 'a', 'b[3->2]', 'b[4->3]'],
                    previous: ['a', 'a', 'a[2->null]', 'b[3->2]', 'b[4->3]'],
                    moves: ['b[3->2]', 'b[4->3]'],
                    removals: ['a[2->null]']
                }));
            });
            testing_internal_1.it('should support insertions/moves', function () {
                var l = ['a', 'a', 'b', 'b'];
                differ.check(l);
                collection_1.ListWrapper.insert(l, 0, 'b');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['b[2->0]', 'a[0->1]', 'a[1->2]', 'b', 'b[null->4]'],
                    previous: ['a[0->1]', 'a[1->2]', 'b[2->0]', 'b'],
                    additions: ['b[null->4]'],
                    moves: ['b[2->0]', 'a[0->1]', 'a[1->2]']
                }));
            });
            testing_internal_1.it('should not report unnecessary moves', function () {
                var l = ['a', 'b', 'c'];
                differ.check(l);
                collection_1.ListWrapper.clear(l);
                l.push('b');
                l.push('a');
                l.push('c');
                differ.check(l);
                testing_internal_1.expect(differ.toString())
                    .toEqual(util_1.iterableChangesAsString({
                    collection: ['b[1->0]', 'a[0->1]', 'c'],
                    previous: ['a[0->1]', 'b[1->0]', 'c'],
                    moves: ['b[1->0]', 'a[0->1]']
                }));
            });
            testing_internal_1.describe('diff', function () {
                testing_internal_1.it('should return self when there is a change', function () { testing_internal_1.expect(differ.diff(['a', 'b'])).toBe(differ); });
                testing_internal_1.it('should return null when there is no change', function () {
                    differ.diff(['a', 'b']);
                    testing_internal_1.expect(differ.diff(['a', 'b'])).toEqual(null);
                });
                testing_internal_1.it('should treat null as an empty list', function () {
                    differ.diff(['a', 'b']);
                    testing_internal_1.expect(differ.diff(null).toString())
                        .toEqual(util_1.iterableChangesAsString({
                        previous: ['a[0->null]', 'b[1->null]'],
                        removals: ['a[0->null]', 'b[1->null]']
                    }));
                });
                testing_internal_1.it('should throw when given an invalid collection', function () {
                    testing_internal_1.expect(function () { return differ.diff("invalid"); }).toThrowErrorWith("Error trying to diff 'invalid'");
                });
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=default_iterable_differ_spec.js.map