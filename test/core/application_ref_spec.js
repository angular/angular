var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('./spies');
var application_ref_1 = require("angular2/src/core/application_ref");
var change_detector_ref_1 = require("angular2/src/core/change_detection/change_detector_ref");
function main() {
    testing_internal_1.describe("ApplicationRef", function () {
        testing_internal_1.it("should throw when reentering tick", function () {
            var cd = new spies_1.SpyChangeDetector();
            var ref = new application_ref_1.ApplicationRef_(null, null, null);
            ref.registerChangeDetector(new change_detector_ref_1.ChangeDetectorRef_(cd));
            cd.spy("detectChanges").andCallFake(function () { return ref.tick(); });
            testing_internal_1.expect(function () { return ref.tick(); }).toThrowError("ApplicationRef.tick is called recursively");
        });
    });
}
exports.main = main;
//# sourceMappingURL=application_ref_spec.js.map