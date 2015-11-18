var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe('dev mode', function () {
        testing_internal_1.it('is enabled in our tests by default', function () { testing_internal_1.expect(lang_1.assertionsEnabled()).toBe(true); });
    });
}
exports.main = main;
//# sourceMappingURL=dev_mode_spec.js.map