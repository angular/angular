var testing_internal_1 = require('angular2/testing_internal');
var lang_1 = require('angular2/src/facade/lang');
var proto_record_1 = require('angular2/src/core/change_detection/proto_record');
function main() {
    function r(_a) {
        var _b = _a === void 0 ? {} : _a, lastInBinding = _b.lastInBinding, mode = _b.mode, name = _b.name, directiveIndex = _b.directiveIndex, argumentToPureFunction = _b.argumentToPureFunction, referencedBySelf = _b.referencedBySelf;
        if (lang_1.isBlank(lastInBinding))
            lastInBinding = false;
        if (lang_1.isBlank(mode))
            mode = proto_record_1.RecordType.PropertyRead;
        if (lang_1.isBlank(name))
            name = "name";
        if (lang_1.isBlank(directiveIndex))
            directiveIndex = null;
        if (lang_1.isBlank(argumentToPureFunction))
            argumentToPureFunction = false;
        if (lang_1.isBlank(referencedBySelf))
            referencedBySelf = false;
        return new proto_record_1.ProtoRecord(mode, name, null, [], null, 0, directiveIndex, 0, null, lastInBinding, false, argumentToPureFunction, referencedBySelf, 0);
    }
    testing_internal_1.describe("ProtoRecord", function () {
        testing_internal_1.describe('shouldBeChecked', function () {
            testing_internal_1.it('should be true for pure functions', function () { testing_internal_1.expect(r({ mode: proto_record_1.RecordType.CollectionLiteral }).shouldBeChecked()).toBeTruthy(); });
            testing_internal_1.it('should be true for args of pure functions', function () {
                testing_internal_1.expect(r({ mode: proto_record_1.RecordType.Const, argumentToPureFunction: true }).shouldBeChecked())
                    .toBeTruthy();
            });
            testing_internal_1.it('should be true for last in binding records', function () {
                testing_internal_1.expect(r({ mode: proto_record_1.RecordType.Const, lastInBinding: true }).shouldBeChecked()).toBeTruthy();
            });
            testing_internal_1.it('should be false otherwise', function () { testing_internal_1.expect(r({ mode: proto_record_1.RecordType.Const }).shouldBeChecked()).toBeFalsy(); });
        });
        testing_internal_1.describe('isUsedByOtherRecord', function () {
            testing_internal_1.it('should be false for lastInBinding records', function () { testing_internal_1.expect(r({ lastInBinding: true }).isUsedByOtherRecord()).toBeFalsy(); });
            testing_internal_1.it('should be true for lastInBinding records that are referenced by self records', function () {
                testing_internal_1.expect(r({ lastInBinding: true, referencedBySelf: true }).isUsedByOtherRecord()).toBeTruthy();
            });
            testing_internal_1.it('should be true for non lastInBinding records', function () { testing_internal_1.expect(r({ lastInBinding: false }).isUsedByOtherRecord()).toBeTruthy(); });
        });
    });
}
exports.main = main;
//# sourceMappingURL=proto_record_spec.js.map