var testing_internal_1 = require('angular2/testing_internal');
var key_1 = require('angular2/src/core/di/key');
function main() {
    testing_internal_1.describe("key", function () {
        var registry;
        testing_internal_1.beforeEach(function () { registry = new key_1.KeyRegistry(); });
        testing_internal_1.it('should be equal to another key if type is the same', function () { testing_internal_1.expect(registry.get('car')).toBe(registry.get('car')); });
        testing_internal_1.it('should not be equal to another key if types are different', function () { testing_internal_1.expect(registry.get('car')).not.toBe(registry.get('porsche')); });
        testing_internal_1.it('should return the passed in key', function () { testing_internal_1.expect(registry.get(registry.get('car'))).toBe(registry.get('car')); });
    });
}
exports.main = main;
//# sourceMappingURL=key_spec.js.map