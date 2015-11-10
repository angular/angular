var testing_internal_1 = require('angular2/testing_internal');
var locals_1 = require('angular2/src/core/change_detection/parser/locals');
var collection_1 = require('angular2/src/facade/collection');
function main() {
    testing_internal_1.describe('Locals', function () {
        var locals;
        testing_internal_1.beforeEach(function () {
            locals = new locals_1.Locals(null, collection_1.MapWrapper.createFromPairs([['key', 'value'], ['nullKey', null]]));
        });
        testing_internal_1.it('should support getting values', function () {
            testing_internal_1.expect(locals.get('key')).toBe('value');
            testing_internal_1.expect(function () { return locals.get('notPresent'); }).toThrowError(new RegExp("Cannot find"));
        });
        testing_internal_1.it('should support checking if key is present', function () {
            testing_internal_1.expect(locals.contains('key')).toBe(true);
            testing_internal_1.expect(locals.contains('nullKey')).toBe(true);
            testing_internal_1.expect(locals.contains('notPresent')).toBe(false);
        });
        testing_internal_1.it('should support setting keys', function () {
            locals.set('key', 'bar');
            testing_internal_1.expect(locals.get('key')).toBe('bar');
        });
        testing_internal_1.it('should not support setting keys that are not present already', function () { testing_internal_1.expect(function () { return locals.set('notPresent', 'bar'); }).toThrowError(); });
        testing_internal_1.it('should clearValues', function () {
            locals.clearValues();
            testing_internal_1.expect(locals.get('key')).toBe(null);
        });
    });
}
exports.main = main;
//# sourceMappingURL=locals_spec.js.map