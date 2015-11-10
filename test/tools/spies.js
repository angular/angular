var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var angular2_1 = require('angular2/angular2');
var lang_1 = require('angular2/src/facade/lang');
var application_ref_1 = require('angular2/src/core/application_ref');
var SpyApplicationRef = (function (_super) {
    __extends(SpyApplicationRef, _super);
    function SpyApplicationRef() {
        _super.call(this, application_ref_1.ApplicationRef_);
    }
    return SpyApplicationRef;
})(testing_internal_1.SpyObject);
exports.SpyApplicationRef = SpyApplicationRef;
var SpyComponentRef = (function (_super) {
    __extends(SpyComponentRef, _super);
    function SpyComponentRef() {
        _super.call(this);
        this.injector =
            angular2_1.Injector.resolveAndCreate([angular2_1.provide(application_ref_1.ApplicationRef, { useClass: SpyApplicationRef })]);
    }
    return SpyComponentRef;
})(testing_internal_1.SpyObject);
exports.SpyComponentRef = SpyComponentRef;
function callNgProfilerTimeChangeDetection(config) {
    lang_1.global.ng.profiler.timeChangeDetection(config);
}
exports.callNgProfilerTimeChangeDetection = callNgProfilerTimeChangeDetection;
//# sourceMappingURL=spies.js.map