'use strict';var lang_1 = require('angular2/src/facade/lang');
var AsyncRouteHandler = (function () {
    function AsyncRouteHandler(_loader, data) {
        this._loader = _loader;
        this.data = data;
        /** @internal */
        this._resolvedComponent = null;
    }
    AsyncRouteHandler.prototype.resolveComponentType = function () {
        var _this = this;
        if (lang_1.isPresent(this._resolvedComponent)) {
            return this._resolvedComponent;
        }
        return this._resolvedComponent = this._loader().then(function (componentType) {
            _this.componentType = componentType;
            return componentType;
        });
    };
    return AsyncRouteHandler;
})();
exports.AsyncRouteHandler = AsyncRouteHandler;
//# sourceMappingURL=async_route_handler.js.map