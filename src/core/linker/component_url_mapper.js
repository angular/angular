'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var reflection_1 = require('angular2/src/core/reflection/reflection');
/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
var ComponentUrlMapper = (function () {
    function ComponentUrlMapper() {
    }
    /**
     * Returns the base URL to the component source file.
     * The returned URL could be:
     * - an absolute URL,
     * - a path relative to the application
     */
    ComponentUrlMapper.prototype.getUrl = function (component) {
        return reflection_1.reflector.isReflectionEnabled() ? reflection_1.reflector.importUri(component) : './';
    };
    ComponentUrlMapper = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ComponentUrlMapper);
    return ComponentUrlMapper;
})();
exports.ComponentUrlMapper = ComponentUrlMapper;
var RuntimeComponentUrlMapper = (function (_super) {
    __extends(RuntimeComponentUrlMapper, _super);
    function RuntimeComponentUrlMapper() {
        _super.call(this);
        /** @internal */
        this._componentUrls = new collection_1.Map();
    }
    RuntimeComponentUrlMapper.prototype.setComponentUrl = function (component, url) { this._componentUrls.set(component, url); };
    RuntimeComponentUrlMapper.prototype.getUrl = function (component) {
        var url = this._componentUrls.get(component);
        if (lang_1.isPresent(url))
            return url;
        return _super.prototype.getUrl.call(this, component);
    };
    return RuntimeComponentUrlMapper;
})(ComponentUrlMapper);
exports.RuntimeComponentUrlMapper = RuntimeComponentUrlMapper;
//# sourceMappingURL=component_url_mapper.js.map