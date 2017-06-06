'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var instruction_1 = require('../../instruction');
var AsyncRouteHandler = (function () {
    function AsyncRouteHandler(_loader, data) {
        if (data === void 0) { data = null; }
        this._loader = _loader;
        /** @internal */
        this._resolvedComponent = null;
        this.data = lang_1.isPresent(data) ? new instruction_1.RouteData(data) : instruction_1.BLANK_ROUTE_DATA;
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
}());
exports.AsyncRouteHandler = AsyncRouteHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcm91dGVfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcnVsZXMvcm91dGVfaGFuZGxlcnMvYXN5bmNfcm91dGVfaGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQThCLDBCQUEwQixDQUFDLENBQUE7QUFHekQsNEJBQTBDLG1CQUFtQixDQUFDLENBQUE7QUFHOUQ7SUFNRSwyQkFBb0IsT0FBNEIsRUFBRSxJQUFpQztRQUFqQyxvQkFBaUMsR0FBakMsV0FBaUM7UUFBL0QsWUFBTyxHQUFQLE9BQU8sQ0FBcUI7UUFMaEQsZ0JBQWdCO1FBQ2hCLHVCQUFrQixHQUFrQixJQUFJLENBQUM7UUFLdkMsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksdUJBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyw4QkFBZ0IsQ0FBQztJQUN2RSxDQUFDO0lBRUQsZ0RBQW9CLEdBQXBCO1FBQUEsaUJBU0M7UUFSQyxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2QyxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2pDLENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxhQUFhO1lBQ2pFLEtBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDdkIsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBcEJELElBb0JDO0FBcEJZLHlCQUFpQixvQkFvQjdCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuaW1wb3J0IHtSb3V0ZUhhbmRsZXJ9IGZyb20gJy4vcm91dGVfaGFuZGxlcic7XG5pbXBvcnQge1JvdXRlRGF0YSwgQkxBTktfUk9VVEVfREFUQX0gZnJvbSAnLi4vLi4vaW5zdHJ1Y3Rpb24nO1xuXG5cbmV4cG9ydCBjbGFzcyBBc3luY1JvdXRlSGFuZGxlciBpbXBsZW1lbnRzIFJvdXRlSGFuZGxlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Jlc29sdmVkQ29tcG9uZW50OiBQcm9taXNlPFR5cGU+ID0gbnVsbDtcbiAgY29tcG9uZW50VHlwZTogVHlwZTtcbiAgcHVibGljIGRhdGE6IFJvdXRlRGF0YTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9sb2FkZXI6ICgpID0+IFByb21pc2U8VHlwZT4sIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gbnVsbCkge1xuICAgIHRoaXMuZGF0YSA9IGlzUHJlc2VudChkYXRhKSA/IG5ldyBSb3V0ZURhdGEoZGF0YSkgOiBCTEFOS19ST1VURV9EQVRBO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudFR5cGUoKTogUHJvbWlzZTxUeXBlPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9yZXNvbHZlZENvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlZENvbXBvbmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZWRDb21wb25lbnQgPSB0aGlzLl9sb2FkZXIoKS50aGVuKChjb21wb25lbnRUeXBlKSA9PiB7XG4gICAgICB0aGlzLmNvbXBvbmVudFR5cGUgPSBjb21wb25lbnRUeXBlO1xuICAgICAgcmV0dXJuIGNvbXBvbmVudFR5cGU7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==