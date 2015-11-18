'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var constants_1 = require('./constants');
var ChangeDetectorRef = (function () {
    function ChangeDetectorRef() {
    }
    return ChangeDetectorRef;
})();
exports.ChangeDetectorRef = ChangeDetectorRef;
var ChangeDetectorRef_ = (function (_super) {
    __extends(ChangeDetectorRef_, _super);
    function ChangeDetectorRef_(_cd) {
        _super.call(this);
        this._cd = _cd;
    }
    ChangeDetectorRef_.prototype.markForCheck = function () { this._cd.markPathToRootAsCheckOnce(); };
    ChangeDetectorRef_.prototype.detach = function () { this._cd.mode = constants_1.ChangeDetectionStrategy.Detached; };
    ChangeDetectorRef_.prototype.detectChanges = function () { this._cd.detectChanges(); };
    ChangeDetectorRef_.prototype.checkNoChanges = function () { this._cd.checkNoChanges(); };
    ChangeDetectorRef_.prototype.reattach = function () {
        this._cd.mode = constants_1.ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    };
    return ChangeDetectorRef_;
})(ChangeDetectorRef);
exports.ChangeDetectorRef_ = ChangeDetectorRef_;
//# sourceMappingURL=change_detector_ref.js.map