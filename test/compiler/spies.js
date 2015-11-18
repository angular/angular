var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var xhr_1 = require('angular2/src/compiler/xhr');
var testing_internal_1 = require('angular2/testing_internal');
var SpyXHR = (function (_super) {
    __extends(SpyXHR, _super);
    function SpyXHR() {
        _super.call(this, xhr_1.XHR);
    }
    return SpyXHR;
})(testing_internal_1.SpyObject);
exports.SpyXHR = SpyXHR;
//# sourceMappingURL=spies.js.map