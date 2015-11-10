var testing_internal_1 = require('angular2/testing_internal');
var collection_1 = require('angular2/src/facade/collection');
function main() {
    testing_internal_1.describe('ListWrapper', function () {
        var l;
        testing_internal_1.describe('splice', function () {
            testing_internal_1.it('should remove sublist of given length and return it', function () {
                var list = [1, 2, 3, 4, 5, 6];
                testing_internal_1.expect(collection_1.ListWrapper.splice(list, 1, 3)).toEqual([2, 3, 4]);
                testing_internal_1.expect(list).toEqual([1, 5, 6]);
            });
            testing_internal_1.it('should support negative start', function () {
                var list = [1, 2, 3, 4, 5, 6];
                testing_internal_1.expect(collection_1.ListWrapper.splice(list, -5, 3)).toEqual([2, 3, 4]);
                testing_internal_1.expect(list).toEqual([1, 5, 6]);
            });
        });
        testing_internal_1.describe('fill', function () {
            testing_internal_1.beforeEach(function () { l = [1, 2, 3, 4]; });
            testing_internal_1.it('should fill the whole list if neither start nor end are specified', function () {
                collection_1.ListWrapper.fill(l, 9);
                testing_internal_1.expect(l).toEqual([9, 9, 9, 9]);
            });
            testing_internal_1.it('should fill up to the end if end is not specified', function () {
                collection_1.ListWrapper.fill(l, 9, 1);
                testing_internal_1.expect(l).toEqual([1, 9, 9, 9]);
            });
            testing_internal_1.it('should support negative start', function () {
                collection_1.ListWrapper.fill(l, 9, -1);
                testing_internal_1.expect(l).toEqual([1, 2, 3, 9]);
            });
            testing_internal_1.it('should support negative end', function () {
                collection_1.ListWrapper.fill(l, 9, -2, -1);
                testing_internal_1.expect(l).toEqual([1, 2, 9, 4]);
            });
        });
        testing_internal_1.describe('slice', function () {
            testing_internal_1.beforeEach(function () { l = [1, 2, 3, 4]; });
            testing_internal_1.it('should return the whole list if neither start nor end are specified', function () { testing_internal_1.expect(collection_1.ListWrapper.slice(l)).toEqual([1, 2, 3, 4]); });
            testing_internal_1.it('should return up to the end if end is not specified', function () { testing_internal_1.expect(collection_1.ListWrapper.slice(l, 1)).toEqual([2, 3, 4]); });
            testing_internal_1.it('should support negative start', function () { testing_internal_1.expect(collection_1.ListWrapper.slice(l, -1)).toEqual([4]); });
            testing_internal_1.it('should support negative end', function () { testing_internal_1.expect(collection_1.ListWrapper.slice(l, -3, -1)).toEqual([2, 3]); });
            testing_internal_1.it('should return empty list if start is greater than end', function () {
                testing_internal_1.expect(collection_1.ListWrapper.slice(l, 4, 2)).toEqual([]);
                testing_internal_1.expect(collection_1.ListWrapper.slice(l, -2, -4)).toEqual([]);
            });
        });
        testing_internal_1.describe('indexOf', function () {
            testing_internal_1.beforeEach(function () { l = [1, 2, 3, 4]; });
            testing_internal_1.it('should find values that exist', function () { testing_internal_1.expect(collection_1.ListWrapper.indexOf(l, 1)).toEqual(0); });
            testing_internal_1.it('should not find values that do not exist', function () { testing_internal_1.expect(collection_1.ListWrapper.indexOf(l, 9)).toEqual(-1); });
            testing_internal_1.it('should respect the startIndex parameter', function () { testing_internal_1.expect(collection_1.ListWrapper.indexOf(l, 1, 1)).toEqual(-1); });
        });
        testing_internal_1.describe('maximum', function () {
            testing_internal_1.it('should return the maximal element', function () { testing_internal_1.expect(collection_1.ListWrapper.maximum([1, 2, 3, 4], function (x) { return x; })).toEqual(4); });
            testing_internal_1.it('should ignore null values', function () { testing_internal_1.expect(collection_1.ListWrapper.maximum([null, 2, 3, null], function (x) { return x; })).toEqual(3); });
            testing_internal_1.it('should use the provided function to determine maximum', function () { testing_internal_1.expect(collection_1.ListWrapper.maximum([1, 2, 3, 4], function (x) { return -x; })).toEqual(1); });
            testing_internal_1.it('should return null for an empty list', function () { testing_internal_1.expect(collection_1.ListWrapper.maximum([], function (x) { return x; })).toEqual(null); });
        });
        testing_internal_1.describe('forEachWithIndex', function () {
            var l;
            testing_internal_1.beforeEach(function () { l = ["a", "b"]; });
            testing_internal_1.it('should iterate over an array passing values and indices', function () {
                var record = [];
                collection_1.ListWrapper.forEachWithIndex(l, function (value, index) { return record.push([value, index]); });
                testing_internal_1.expect(record).toEqual([["a", 0], ["b", 1]]);
            });
        });
    });
    testing_internal_1.describe('StringMapWrapper', function () {
        testing_internal_1.describe('equals', function () {
            testing_internal_1.it('should return true when comparing empty maps', function () { testing_internal_1.expect(collection_1.StringMapWrapper.equals({}, {})).toBe(true); });
            testing_internal_1.it('should return true when comparing the same map', function () {
                var m1 = { 'a': 1, 'b': 2, 'c': 3 };
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m1, m1)).toBe(true);
            });
            testing_internal_1.it('should return true when comparing different maps with the same keys and values', function () {
                var m1 = { 'a': 1, 'b': 2, 'c': 3 };
                var m2 = { 'a': 1, 'b': 2, 'c': 3 };
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m1, m2)).toBe(true);
            });
            testing_internal_1.it('should return false when comparing maps with different numbers of keys', function () {
                var m1 = { 'a': 1, 'b': 2, 'c': 3 };
                var m2 = { 'a': 1, 'b': 2, 'c': 3, 'd': 4 };
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m1, m2)).toBe(false);
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m2, m1)).toBe(false);
            });
            testing_internal_1.it('should return false when comparing maps with different keys', function () {
                var m1 = { 'a': 1, 'b': 2, 'c': 3 };
                var m2 = { 'a': 1, 'b': 2, 'CC': 3 };
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m1, m2)).toBe(false);
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m2, m1)).toBe(false);
            });
            testing_internal_1.it('should return false when comparing maps with different values', function () {
                var m1 = { 'a': 1, 'b': 2, 'c': 3 };
                var m2 = { 'a': 1, 'b': 20, 'c': 3 };
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m1, m2)).toBe(false);
                testing_internal_1.expect(collection_1.StringMapWrapper.equals(m2, m1)).toBe(false);
            });
        });
        testing_internal_1.describe('MapWrapper', function () {
            testing_internal_1.it('should return a list of keys values', function () {
                var m = new Map();
                m.set('a', 'b');
                testing_internal_1.expect(collection_1.MapWrapper.keys(m)).toEqual(['a']);
                testing_internal_1.expect(collection_1.MapWrapper.values(m)).toEqual(['b']);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=collection_spec.js.map