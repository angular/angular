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
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var view_listener_1 = require('angular2/src/core/linker/view_listener');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var api_1 = require('angular2/src/core/render/api');
var debug_element_1 = require('angular2/src/core/debug/debug_element');
var NG_ID_PROPERTY = 'ngid';
var INSPECT_GLOBAL_NAME = 'ng.probe';
var NG_ID_SEPARATOR = '#';
// Need to keep the views in a global Map so that multiple angular apps are supported
var _allIdsByView = new collection_1.Map();
var _allViewsById = new collection_1.Map();
var _nextId = 0;
function _setElementId(element, indices) {
    if (lang_1.isPresent(element)) {
        dom_adapter_1.DOM.setData(element, NG_ID_PROPERTY, indices.join(NG_ID_SEPARATOR));
    }
}
function _getElementId(element) {
    var elId = dom_adapter_1.DOM.getData(element, NG_ID_PROPERTY);
    if (lang_1.isPresent(elId)) {
        return elId.split(NG_ID_SEPARATOR).map(function (partStr) { return lang_1.NumberWrapper.parseInt(partStr, 10); });
    }
    else {
        return null;
    }
}
function inspectNativeElement(element) {
    var elId = _getElementId(element);
    if (lang_1.isPresent(elId)) {
        var view = _allViewsById.get(elId[0]);
        if (lang_1.isPresent(view)) {
            return new debug_element_1.DebugElement_(view, elId[1]);
        }
    }
    return null;
}
exports.inspectNativeElement = inspectNativeElement;
var DebugElementViewListener = (function () {
    function DebugElementViewListener(_renderer) {
        this._renderer = _renderer;
        dom_adapter_1.DOM.setGlobalVar(INSPECT_GLOBAL_NAME, inspectNativeElement);
    }
    DebugElementViewListener.prototype.onViewCreated = function (view) {
        var viewId = _nextId++;
        _allViewsById.set(viewId, view);
        _allIdsByView.set(view, viewId);
        for (var i = 0; i < view.elementRefs.length; i++) {
            var el = view.elementRefs[i];
            _setElementId(this._renderer.getNativeElementSync(el), [viewId, i]);
        }
    };
    DebugElementViewListener.prototype.onViewDestroyed = function (view) {
        var viewId = _allIdsByView.get(view);
        _allIdsByView.delete(view);
        _allViewsById.delete(viewId);
    };
    DebugElementViewListener = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [api_1.Renderer])
    ], DebugElementViewListener);
    return DebugElementViewListener;
})();
exports.DebugElementViewListener = DebugElementViewListener;
exports.ELEMENT_PROBE_PROVIDERS = lang_1.CONST_EXPR([
    DebugElementViewListener,
    lang_1.CONST_EXPR(new di_1.Provider(view_listener_1.AppViewListener, { useExisting: DebugElementViewListener })),
]);
exports.ELEMENT_PROBE_BINDINGS = exports.ELEMENT_PROBE_PROVIDERS;
//# sourceMappingURL=debug_element_view_listener.js.map