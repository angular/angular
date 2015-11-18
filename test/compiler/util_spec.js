var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var util_1 = require('angular2/src/compiler/util');
function main() {
    testing_internal_1.describe('util', function () {
        testing_internal_1.describe('escapeSingleQuoteString', function () {
            testing_internal_1.it('should escape single quotes', function () { testing_internal_1.expect(util_1.escapeSingleQuoteString("'")).toEqual("'\\''"); });
            testing_internal_1.it('should escape backslash', function () { testing_internal_1.expect(util_1.escapeSingleQuoteString('\\')).toEqual("'\\\\'"); });
            testing_internal_1.it('should escape newlines', function () { testing_internal_1.expect(util_1.escapeSingleQuoteString('\n')).toEqual("'\\n'"); });
            if (lang_1.IS_DART) {
                testing_internal_1.it('should escape $', function () { testing_internal_1.expect(util_1.escapeSingleQuoteString('$')).toEqual("'\\$'"); });
            }
            else {
                testing_internal_1.it('should not escape $', function () { testing_internal_1.expect(util_1.escapeSingleQuoteString('$')).toEqual("'$'"); });
            }
        });
        testing_internal_1.describe('escapeDoubleQuoteString', function () {
            testing_internal_1.it('should escape double quotes', function () { testing_internal_1.expect(util_1.escapeDoubleQuoteString("\"")).toEqual("\"\\\"\""); });
            testing_internal_1.it('should escape backslash', function () { testing_internal_1.expect(util_1.escapeDoubleQuoteString('\\')).toEqual("\"\\\\\""); });
            testing_internal_1.it('should escape newlines', function () { testing_internal_1.expect(util_1.escapeDoubleQuoteString('\n')).toEqual("\"\\n\""); });
            if (lang_1.IS_DART) {
                testing_internal_1.it('should escape $', function () { testing_internal_1.expect(util_1.escapeDoubleQuoteString('$')).toEqual("\"\\$\""); });
            }
            else {
                testing_internal_1.it('should not escape $', function () { testing_internal_1.expect(util_1.escapeDoubleQuoteString('$')).toEqual("\"$\""); });
            }
        });
    });
}
exports.main = main;
//# sourceMappingURL=util_spec.js.map