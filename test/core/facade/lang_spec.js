var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('RegExp', function () {
        testing_internal_1.it('should expose the index for each match', function () {
            var re = /(!)/g;
            var matcher = lang_1.RegExpWrapper.matcher(re, '0!23!567!!');
            var indexes = [];
            var m;
            while (lang_1.isPresent(m = lang_1.RegExpMatcherWrapper.next(matcher))) {
                indexes.push(m.index);
                testing_internal_1.expect(m[0]).toEqual('!');
                testing_internal_1.expect(m[1]).toEqual('!');
                testing_internal_1.expect(m.length).toBe(2);
            }
            testing_internal_1.expect(indexes).toEqual([1, 4, 8, 9]);
        });
        testing_internal_1.it('should reset before it is reused', function () {
            var re = /^['"]/g;
            var str = "'";
            testing_internal_1.expect(lang_1.RegExpWrapper.test(re, str)).toEqual(true);
            // If not reset, the second attempt to test results in false
            testing_internal_1.expect(lang_1.RegExpWrapper.test(re, str)).toEqual(true);
        });
    });
    testing_internal_1.describe('const', function () {
        testing_internal_1.it('should support const expressions both in TS and Dart', function () {
            var numbers = lang_1.CONST_EXPR([1, 2, 3]);
            testing_internal_1.expect(numbers).toEqual([1, 2, 3]);
        });
    });
    testing_internal_1.describe('String', function () {
        var s;
        testing_internal_1.describe('slice', function () {
            testing_internal_1.beforeEach(function () { s = "abcdefghij"; });
            testing_internal_1.it('should return the whole string if neither start nor end are specified', function () { testing_internal_1.expect(lang_1.StringWrapper.slice(s)).toEqual("abcdefghij"); });
            testing_internal_1.it('should return up to the end if end is not specified', function () { testing_internal_1.expect(lang_1.StringWrapper.slice(s, 1)).toEqual("bcdefghij"); });
            testing_internal_1.it('should support negative start', function () { testing_internal_1.expect(lang_1.StringWrapper.slice(s, -1)).toEqual("j"); });
            testing_internal_1.it('should support negative end', function () { testing_internal_1.expect(lang_1.StringWrapper.slice(s, -3, -1)).toEqual("hi"); });
            testing_internal_1.it('should return empty string if start is greater than end', function () {
                testing_internal_1.expect(lang_1.StringWrapper.slice(s, 4, 2)).toEqual("");
                testing_internal_1.expect(lang_1.StringWrapper.slice(s, -2, -4)).toEqual("");
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=lang_spec.js.map