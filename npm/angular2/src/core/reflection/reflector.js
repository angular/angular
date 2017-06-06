'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var reflector_reader_1 = require('./reflector_reader');
/**
 * Reflective information about a symbol, including annotations, interfaces, and other metadata.
 */
var ReflectionInfo = (function () {
    function ReflectionInfo(annotations, parameters, factory, interfaces, propMetadata) {
        this.annotations = annotations;
        this.parameters = parameters;
        this.factory = factory;
        this.interfaces = interfaces;
        this.propMetadata = propMetadata;
    }
    return ReflectionInfo;
}());
exports.ReflectionInfo = ReflectionInfo;
/**
 * Provides access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
var Reflector = (function (_super) {
    __extends(Reflector, _super);
    function Reflector(reflectionCapabilities) {
        _super.call(this);
        /** @internal */
        this._injectableInfo = new collection_1.Map();
        /** @internal */
        this._getters = new collection_1.Map();
        /** @internal */
        this._setters = new collection_1.Map();
        /** @internal */
        this._methods = new collection_1.Map();
        this._usedKeys = null;
        this.reflectionCapabilities = reflectionCapabilities;
    }
    Reflector.prototype.isReflectionEnabled = function () { return this.reflectionCapabilities.isReflectionEnabled(); };
    /**
     * Causes `this` reflector to track keys used to access
     * {@link ReflectionInfo} objects.
     */
    Reflector.prototype.trackUsage = function () { this._usedKeys = new collection_1.Set(); };
    /**
     * Lists types for which reflection information was not requested since
     * {@link #trackUsage} was called. This list could later be audited as
     * potential dead code.
     */
    Reflector.prototype.listUnusedKeys = function () {
        var _this = this;
        if (this._usedKeys == null) {
            throw new exceptions_1.BaseException('Usage tracking is disabled');
        }
        var allTypes = collection_1.MapWrapper.keys(this._injectableInfo);
        return allTypes.filter(function (key) { return !collection_1.SetWrapper.has(_this._usedKeys, key); });
    };
    Reflector.prototype.registerFunction = function (func, funcInfo) {
        this._injectableInfo.set(func, funcInfo);
    };
    Reflector.prototype.registerType = function (type, typeInfo) {
        this._injectableInfo.set(type, typeInfo);
    };
    Reflector.prototype.registerGetters = function (getters) { _mergeMaps(this._getters, getters); };
    Reflector.prototype.registerSetters = function (setters) { _mergeMaps(this._setters, setters); };
    Reflector.prototype.registerMethods = function (methods) { _mergeMaps(this._methods, methods); };
    Reflector.prototype.factory = function (type) {
        if (this._containsReflectionInfo(type)) {
            var res = this._getReflectionInfo(type).factory;
            return lang_1.isPresent(res) ? res : null;
        }
        else {
            return this.reflectionCapabilities.factory(type);
        }
    };
    Reflector.prototype.parameters = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).parameters;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
    };
    Reflector.prototype.annotations = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).annotations;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
    };
    Reflector.prototype.propMetadata = function (typeOrFunc) {
        if (this._injectableInfo.has(typeOrFunc)) {
            var res = this._getReflectionInfo(typeOrFunc).propMetadata;
            return lang_1.isPresent(res) ? res : {};
        }
        else {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        }
    };
    Reflector.prototype.interfaces = function (type) {
        if (this._injectableInfo.has(type)) {
            var res = this._getReflectionInfo(type).interfaces;
            return lang_1.isPresent(res) ? res : [];
        }
        else {
            return this.reflectionCapabilities.interfaces(type);
        }
    };
    Reflector.prototype.getter = function (name) {
        if (this._getters.has(name)) {
            return this._getters.get(name);
        }
        else {
            return this.reflectionCapabilities.getter(name);
        }
    };
    Reflector.prototype.setter = function (name) {
        if (this._setters.has(name)) {
            return this._setters.get(name);
        }
        else {
            return this.reflectionCapabilities.setter(name);
        }
    };
    Reflector.prototype.method = function (name) {
        if (this._methods.has(name)) {
            return this._methods.get(name);
        }
        else {
            return this.reflectionCapabilities.method(name);
        }
    };
    /** @internal */
    Reflector.prototype._getReflectionInfo = function (typeOrFunc) {
        if (lang_1.isPresent(this._usedKeys)) {
            this._usedKeys.add(typeOrFunc);
        }
        return this._injectableInfo.get(typeOrFunc);
    };
    /** @internal */
    Reflector.prototype._containsReflectionInfo = function (typeOrFunc) { return this._injectableInfo.has(typeOrFunc); };
    Reflector.prototype.importUri = function (type) { return this.reflectionCapabilities.importUri(type); };
    return Reflector;
}(reflector_reader_1.ReflectorReader));
exports.Reflector = Reflector;
function _mergeMaps(target, config) {
    collection_1.StringMapWrapper.forEach(config, function (v, k) { return target.set(k, v); });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmbGVjdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUJBQXlDLDBCQUEwQixDQUFDLENBQUE7QUFDcEUsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBT08sZ0NBQWdDLENBQUMsQ0FBQTtBQUV4QyxpQ0FBOEIsb0JBQW9CLENBQUMsQ0FBQTtBQUtuRDs7R0FFRztBQUNIO0lBQ0Usd0JBQW1CLFdBQW1CLEVBQVMsVUFBb0IsRUFBUyxPQUFrQixFQUMzRSxVQUFrQixFQUFTLFlBQXFDO1FBRGhFLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBVTtRQUFTLFlBQU8sR0FBUCxPQUFPLENBQVc7UUFDM0UsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUF5QjtJQUFHLENBQUM7SUFDekYscUJBQUM7QUFBRCxDQUFDLEFBSEQsSUFHQztBQUhZLHNCQUFjLGlCQUcxQixDQUFBO0FBRUQ7OztHQUdHO0FBQ0g7SUFBK0IsNkJBQWU7SUFhNUMsbUJBQVksc0JBQXNEO1FBQ2hFLGlCQUFPLENBQUM7UUFiVixnQkFBZ0I7UUFDaEIsb0JBQWUsR0FBRyxJQUFJLGdCQUFHLEVBQXVCLENBQUM7UUFDakQsZ0JBQWdCO1FBQ2hCLGFBQVEsR0FBRyxJQUFJLGdCQUFHLEVBQW9CLENBQUM7UUFDdkMsZ0JBQWdCO1FBQ2hCLGFBQVEsR0FBRyxJQUFJLGdCQUFHLEVBQW9CLENBQUM7UUFDdkMsZ0JBQWdCO1FBQ2hCLGFBQVEsR0FBRyxJQUFJLGdCQUFHLEVBQW9CLENBQUM7UUFPckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLHNC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QUM7SUFDSCxDQUFDO0lBRUQsZ0JBQWdCO0lBQ2hCLHNDQUFrQixHQUFsQixVQUFtQixVQUFlO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQkFBZ0I7SUFDaEIsMkNBQXVCLEdBQXZCLFVBQXdCLFVBQWUsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXpGLDZCQUFTLEdBQVQsVUFBVSxJQUFVLElBQVksTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZGLGdCQUFDO0FBQUQsQ0FBQyxBQXZJRCxDQUErQixrQ0FBZSxHQXVJN0M7QUF2SVksaUJBQVMsWUF1SXJCLENBQUE7QUFFRCxvQkFBb0IsTUFBNkIsRUFBRSxNQUFpQztJQUNsRiw2QkFBZ0IsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQUMsQ0FBVyxFQUFFLENBQVMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFoQixDQUFnQixDQUFDLENBQUM7QUFDakYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7VHlwZSwgaXNQcmVzZW50LCBzdHJpbmdpZnl9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb24sIFdyYXBwZWRFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1xuICBMaXN0V3JhcHBlcixcbiAgTWFwLFxuICBNYXBXcmFwcGVyLFxuICBTZXQsXG4gIFNldFdyYXBwZXIsXG4gIFN0cmluZ01hcFdyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7U2V0dGVyRm4sIEdldHRlckZuLCBNZXRob2RGbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQge1JlZmxlY3RvclJlYWRlcn0gZnJvbSAnLi9yZWZsZWN0b3JfcmVhZGVyJztcbmltcG9ydCB7UGxhdGZvcm1SZWZsZWN0aW9uQ2FwYWJpbGl0aWVzfSBmcm9tICcuL3BsYXRmb3JtX3JlZmxlY3Rpb25fY2FwYWJpbGl0aWVzJztcbmV4cG9ydCB7U2V0dGVyRm4sIEdldHRlckZuLCBNZXRob2RGbn0gZnJvbSAnLi90eXBlcyc7XG5leHBvcnQge1BsYXRmb3JtUmVmbGVjdGlvbkNhcGFiaWxpdGllc30gZnJvbSAnLi9wbGF0Zm9ybV9yZWZsZWN0aW9uX2NhcGFiaWxpdGllcyc7XG5cbi8qKlxuICogUmVmbGVjdGl2ZSBpbmZvcm1hdGlvbiBhYm91dCBhIHN5bWJvbCwgaW5jbHVkaW5nIGFubm90YXRpb25zLCBpbnRlcmZhY2VzLCBhbmQgb3RoZXIgbWV0YWRhdGEuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWZsZWN0aW9uSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBhbm5vdGF0aW9ucz86IGFueVtdLCBwdWJsaWMgcGFyYW1ldGVycz86IGFueVtdW10sIHB1YmxpYyBmYWN0b3J5PzogRnVuY3Rpb24sXG4gICAgICAgICAgICAgIHB1YmxpYyBpbnRlcmZhY2VzPzogYW55W10sIHB1YmxpYyBwcm9wTWV0YWRhdGE/OiB7W2tleTogc3RyaW5nXTogYW55W119KSB7fVxufVxuXG4vKipcbiAqIFByb3ZpZGVzIGFjY2VzcyB0byByZWZsZWN0aW9uIGRhdGEgYWJvdXQgc3ltYm9scy4gVXNlZCBpbnRlcm5hbGx5IGJ5IEFuZ3VsYXJcbiAqIHRvIHBvd2VyIGRlcGVuZGVuY3kgaW5qZWN0aW9uIGFuZCBjb21waWxhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlZmxlY3RvciBleHRlbmRzIFJlZmxlY3RvclJlYWRlciB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luamVjdGFibGVJbmZvID0gbmV3IE1hcDxhbnksIFJlZmxlY3Rpb25JbmZvPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9nZXR0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIEdldHRlckZuPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9zZXR0ZXJzID0gbmV3IE1hcDxzdHJpbmcsIFNldHRlckZuPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9tZXRob2RzID0gbmV3IE1hcDxzdHJpbmcsIE1ldGhvZEZuPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF91c2VkS2V5czogU2V0PGFueT47XG4gIHJlZmxlY3Rpb25DYXBhYmlsaXRpZXM6IFBsYXRmb3JtUmVmbGVjdGlvbkNhcGFiaWxpdGllcztcblxuICBjb25zdHJ1Y3RvcihyZWZsZWN0aW9uQ2FwYWJpbGl0aWVzOiBQbGF0Zm9ybVJlZmxlY3Rpb25DYXBhYmlsaXRpZXMpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3VzZWRLZXlzID0gbnVsbDtcbiAgICB0aGlzLnJlZmxlY3Rpb25DYXBhYmlsaXRpZXMgPSByZWZsZWN0aW9uQ2FwYWJpbGl0aWVzO1xuICB9XG5cbiAgaXNSZWZsZWN0aW9uRW5hYmxlZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5pc1JlZmxlY3Rpb25FbmFibGVkKCk7IH1cblxuICAvKipcbiAgICogQ2F1c2VzIGB0aGlzYCByZWZsZWN0b3IgdG8gdHJhY2sga2V5cyB1c2VkIHRvIGFjY2Vzc1xuICAgKiB7QGxpbmsgUmVmbGVjdGlvbkluZm99IG9iamVjdHMuXG4gICAqL1xuICB0cmFja1VzYWdlKCk6IHZvaWQgeyB0aGlzLl91c2VkS2V5cyA9IG5ldyBTZXQoKTsgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0eXBlcyBmb3Igd2hpY2ggcmVmbGVjdGlvbiBpbmZvcm1hdGlvbiB3YXMgbm90IHJlcXVlc3RlZCBzaW5jZVxuICAgKiB7QGxpbmsgI3RyYWNrVXNhZ2V9IHdhcyBjYWxsZWQuIFRoaXMgbGlzdCBjb3VsZCBsYXRlciBiZSBhdWRpdGVkIGFzXG4gICAqIHBvdGVudGlhbCBkZWFkIGNvZGUuXG4gICAqL1xuICBsaXN0VW51c2VkS2V5cygpOiBhbnlbXSB7XG4gICAgaWYgKHRoaXMuX3VzZWRLZXlzID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKCdVc2FnZSB0cmFja2luZyBpcyBkaXNhYmxlZCcpO1xuICAgIH1cbiAgICB2YXIgYWxsVHlwZXMgPSBNYXBXcmFwcGVyLmtleXModGhpcy5faW5qZWN0YWJsZUluZm8pO1xuICAgIHJldHVybiBhbGxUeXBlcy5maWx0ZXIoa2V5ID0+ICFTZXRXcmFwcGVyLmhhcyh0aGlzLl91c2VkS2V5cywga2V5KSk7XG4gIH1cblxuICByZWdpc3RlckZ1bmN0aW9uKGZ1bmM6IEZ1bmN0aW9uLCBmdW5jSW5mbzogUmVmbGVjdGlvbkluZm8pOiB2b2lkIHtcbiAgICB0aGlzLl9pbmplY3RhYmxlSW5mby5zZXQoZnVuYywgZnVuY0luZm8pO1xuICB9XG5cbiAgcmVnaXN0ZXJUeXBlKHR5cGU6IFR5cGUsIHR5cGVJbmZvOiBSZWZsZWN0aW9uSW5mbyk6IHZvaWQge1xuICAgIHRoaXMuX2luamVjdGFibGVJbmZvLnNldCh0eXBlLCB0eXBlSW5mbyk7XG4gIH1cblxuICByZWdpc3RlckdldHRlcnMoZ2V0dGVyczoge1trZXk6IHN0cmluZ106IEdldHRlckZufSk6IHZvaWQgeyBfbWVyZ2VNYXBzKHRoaXMuX2dldHRlcnMsIGdldHRlcnMpOyB9XG5cbiAgcmVnaXN0ZXJTZXR0ZXJzKHNldHRlcnM6IHtba2V5OiBzdHJpbmddOiBTZXR0ZXJGbn0pOiB2b2lkIHsgX21lcmdlTWFwcyh0aGlzLl9zZXR0ZXJzLCBzZXR0ZXJzKTsgfVxuXG4gIHJlZ2lzdGVyTWV0aG9kcyhtZXRob2RzOiB7W2tleTogc3RyaW5nXTogTWV0aG9kRm59KTogdm9pZCB7IF9tZXJnZU1hcHModGhpcy5fbWV0aG9kcywgbWV0aG9kcyk7IH1cblxuICBmYWN0b3J5KHR5cGU6IFR5cGUpOiBGdW5jdGlvbiB7XG4gICAgaWYgKHRoaXMuX2NvbnRhaW5zUmVmbGVjdGlvbkluZm8odHlwZSkpIHtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9nZXRSZWZsZWN0aW9uSW5mbyh0eXBlKS5mYWN0b3J5O1xuICAgICAgcmV0dXJuIGlzUHJlc2VudChyZXMpID8gcmVzIDogbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5mYWN0b3J5KHR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIHBhcmFtZXRlcnModHlwZU9yRnVuYzogLypUeXBlKi8gYW55KTogYW55W11bXSB7XG4gICAgaWYgKHRoaXMuX2luamVjdGFibGVJbmZvLmhhcyh0eXBlT3JGdW5jKSkge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX2dldFJlZmxlY3Rpb25JbmZvKHR5cGVPckZ1bmMpLnBhcmFtZXRlcnM7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHJlcykgPyByZXMgOiBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpO1xuICAgIH1cbiAgfVxuXG4gIGFubm90YXRpb25zKHR5cGVPckZ1bmM6IC8qVHlwZSovIGFueSk6IGFueVtdIHtcbiAgICBpZiAodGhpcy5faW5qZWN0YWJsZUluZm8uaGFzKHR5cGVPckZ1bmMpKSB7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fZ2V0UmVmbGVjdGlvbkluZm8odHlwZU9yRnVuYykuYW5ub3RhdGlvbnM7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHJlcykgPyByZXMgOiBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5hbm5vdGF0aW9ucyh0eXBlT3JGdW5jKTtcbiAgICB9XG4gIH1cblxuICBwcm9wTWV0YWRhdGEodHlwZU9yRnVuYzogLypUeXBlKi8gYW55KToge1trZXk6IHN0cmluZ106IGFueVtdfSB7XG4gICAgaWYgKHRoaXMuX2luamVjdGFibGVJbmZvLmhhcyh0eXBlT3JGdW5jKSkge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX2dldFJlZmxlY3Rpb25JbmZvKHR5cGVPckZ1bmMpLnByb3BNZXRhZGF0YTtcbiAgICAgIHJldHVybiBpc1ByZXNlbnQocmVzKSA/IHJlcyA6IHt9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWZsZWN0aW9uQ2FwYWJpbGl0aWVzLnByb3BNZXRhZGF0YSh0eXBlT3JGdW5jKTtcbiAgICB9XG4gIH1cblxuICBpbnRlcmZhY2VzKHR5cGU6IFR5cGUpOiBhbnlbXSB7XG4gICAgaWYgKHRoaXMuX2luamVjdGFibGVJbmZvLmhhcyh0eXBlKSkge1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX2dldFJlZmxlY3Rpb25JbmZvKHR5cGUpLmludGVyZmFjZXM7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHJlcykgPyByZXMgOiBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5pbnRlcmZhY2VzKHR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIGdldHRlcihuYW1lOiBzdHJpbmcpOiBHZXR0ZXJGbiB7XG4gICAgaWYgKHRoaXMuX2dldHRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZ2V0dGVycy5nZXQobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZmxlY3Rpb25DYXBhYmlsaXRpZXMuZ2V0dGVyKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIHNldHRlcihuYW1lOiBzdHJpbmcpOiBTZXR0ZXJGbiB7XG4gICAgaWYgKHRoaXMuX3NldHRlcnMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2V0dGVycy5nZXQobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZmxlY3Rpb25DYXBhYmlsaXRpZXMuc2V0dGVyKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIG1ldGhvZChuYW1lOiBzdHJpbmcpOiBNZXRob2RGbiB7XG4gICAgaWYgKHRoaXMuX21ldGhvZHMuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fbWV0aG9kcy5nZXQobmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLnJlZmxlY3Rpb25DYXBhYmlsaXRpZXMubWV0aG9kKG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2dldFJlZmxlY3Rpb25JbmZvKHR5cGVPckZ1bmM6IGFueSk6IFJlZmxlY3Rpb25JbmZvIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VzZWRLZXlzKSkge1xuICAgICAgdGhpcy5fdXNlZEtleXMuYWRkKHR5cGVPckZ1bmMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faW5qZWN0YWJsZUluZm8uZ2V0KHR5cGVPckZ1bmMpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfY29udGFpbnNSZWZsZWN0aW9uSW5mbyh0eXBlT3JGdW5jOiBhbnkpIHsgcmV0dXJuIHRoaXMuX2luamVjdGFibGVJbmZvLmhhcyh0eXBlT3JGdW5jKTsgfVxuXG4gIGltcG9ydFVyaSh0eXBlOiBUeXBlKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMucmVmbGVjdGlvbkNhcGFiaWxpdGllcy5pbXBvcnRVcmkodHlwZSk7IH1cbn1cblxuZnVuY3Rpb24gX21lcmdlTWFwcyh0YXJnZXQ6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiwgY29uZmlnOiB7W2tleTogc3RyaW5nXTogRnVuY3Rpb259KTogdm9pZCB7XG4gIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChjb25maWcsICh2OiBGdW5jdGlvbiwgazogc3RyaW5nKSA9PiB0YXJnZXQuc2V0KGssIHYpKTtcbn1cbiJdfQ==