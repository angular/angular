var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var change_detector_ref_1 = require('angular2/src/core/change_detection/change_detector_ref');
var testing_internal_1 = require('angular2/testing_internal');
var SpyChangeDetectorRef = (function (_super) {
    __extends(SpyChangeDetectorRef, _super);
    function SpyChangeDetectorRef() {
        _super.call(this, change_detector_ref_1.ChangeDetectorRef_);
    }
    return SpyChangeDetectorRef;
})(testing_internal_1.SpyObject);
exports.SpyChangeDetectorRef = SpyChangeDetectorRef;
var SpyNgControl = (function (_super) {
    __extends(SpyNgControl, _super);
    function SpyNgControl() {
        _super.apply(this, arguments);
    }
    return SpyNgControl;
})(testing_internal_1.SpyObject);
exports.SpyNgControl = SpyNgControl;
var SpyValueAccessor = (function (_super) {
    __extends(SpyValueAccessor, _super);
    function SpyValueAccessor() {
        _super.apply(this, arguments);
    }
    return SpyValueAccessor;
})(testing_internal_1.SpyObject);
exports.SpyValueAccessor = SpyValueAccessor;
//# sourceMappingURL=spies.js.map