var testing_internal_1 = require('angular2/testing_internal');
var change_detector_ref_1 = require('angular2/src/core/change_detection/change_detector_ref');
var spies_1 = require('../spies');
function main() {
    testing_internal_1.describe('ChangeDetectorRef', function () {
        testing_internal_1.it('should delegate detectChanges()', function () {
            var changeDetector = new spies_1.SpyChangeDetector();
            changeDetector.spy('detectChanges');
            var changeDetectorRef = new change_detector_ref_1.ChangeDetectorRef_(changeDetector);
            changeDetectorRef.detectChanges();
            testing_internal_1.expect(changeDetector.spy('detectChanges')).toHaveBeenCalled();
        });
    });
}
exports.main = main;
//# sourceMappingURL=change_detector_ref_spec.js.map