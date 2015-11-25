'use strict';var async_1 = require('angular2/src/facade/async');
var SyncRouteHandler = (function () {
    function SyncRouteHandler(componentType, data) {
        this.componentType = componentType;
        this.data = data;
        /** @internal */
        this._resolvedComponent = null;
        this._resolvedComponent = async_1.PromiseWrapper.resolve(componentType);
    }
    SyncRouteHandler.prototype.resolveComponentType = function () { return this._resolvedComponent; };
    return SyncRouteHandler;
})();
exports.SyncRouteHandler = SyncRouteHandler;
//# sourceMappingURL=sync_route_handler.js.map