var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var router_1 = require('angular2/router');
var testing_internal_1 = require('angular2/testing_internal');
var SpyRouter = (function (_super) {
    __extends(SpyRouter, _super);
    function SpyRouter() {
        _super.call(this, router_1.Router);
    }
    return SpyRouter;
})(testing_internal_1.SpyObject);
exports.SpyRouter = SpyRouter;
var SpyRouterOutlet = (function (_super) {
    __extends(SpyRouterOutlet, _super);
    function SpyRouterOutlet() {
        _super.call(this, router_1.RouterOutlet);
    }
    return SpyRouterOutlet;
})(testing_internal_1.SpyObject);
exports.SpyRouterOutlet = SpyRouterOutlet;
var SpyLocation = (function (_super) {
    __extends(SpyLocation, _super);
    function SpyLocation() {
        _super.call(this, router_1.Location);
    }
    return SpyLocation;
})(testing_internal_1.SpyObject);
exports.SpyLocation = SpyLocation;
//# sourceMappingURL=spies.js.map