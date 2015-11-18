var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
function main() {
    testing_internal_1.describe("forwardRef", function () {
        testing_internal_1.it('should wrap and unwrap the reference', function () {
            var ref = core_1.forwardRef(function () { return String; });
            testing_internal_1.expect(ref instanceof lang_1.Type).toBe(true);
            testing_internal_1.expect(core_1.resolveForwardRef(ref)).toBe(String);
        });
    });
}
exports.main = main;
//# sourceMappingURL=forward_ref_spec.js.map