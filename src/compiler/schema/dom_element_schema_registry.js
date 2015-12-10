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
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var html_tags_1 = require('angular2/src/compiler/html_tags');
var element_schema_registry_1 = require('./element_schema_registry');
var NAMESPACE_URIS = lang_1.CONST_EXPR({ 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' });
var DomElementSchemaRegistry = (function (_super) {
    __extends(DomElementSchemaRegistry, _super);
    function DomElementSchemaRegistry() {
        _super.apply(this, arguments);
        this._protoElements = new Map();
    }
    DomElementSchemaRegistry.prototype._getProtoElement = function (tagName) {
        var element = this._protoElements.get(tagName);
        if (lang_1.isBlank(element)) {
            var nsAndName = html_tags_1.splitHtmlTagNamespace(tagName);
            element = lang_1.isPresent(nsAndName[0]) ?
                dom_adapter_1.DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
                dom_adapter_1.DOM.createElement(nsAndName[1]);
            this._protoElements.set(tagName, element);
        }
        return element;
    };
    DomElementSchemaRegistry.prototype.hasProperty = function (tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elm = this._getProtoElement(tagName);
            return dom_adapter_1.DOM.hasProperty(elm, propName);
        }
    };
    DomElementSchemaRegistry.prototype.getMappedPropName = function (propName) {
        var mappedPropName = collection_1.StringMapWrapper.get(dom_adapter_1.DOM.attrToPropMap, propName);
        return lang_1.isPresent(mappedPropName) ? mappedPropName : propName;
    };
    DomElementSchemaRegistry = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DomElementSchemaRegistry);
    return DomElementSchemaRegistry;
})(element_schema_registry_1.ElementSchemaRegistry);
exports.DomElementSchemaRegistry = DomElementSchemaRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUNoRCxxQkFBNkMsMEJBQTBCLENBQUMsQ0FBQTtBQUN4RSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUMxRCwwQkFBb0MsaUNBQWlDLENBQUMsQ0FBQTtBQUV0RSx3Q0FBb0MsMkJBQTJCLENBQUMsQ0FBQTtBQUVoRSxJQUFNLGNBQWMsR0FDaEIsaUJBQVUsQ0FBQyxFQUFDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO0FBRS9GO0lBQzhDQSw0Q0FBcUJBO0lBRG5FQTtRQUM4Q0MsOEJBQXFCQTtRQUN6REEsbUJBQWNBLEdBQUdBLElBQUlBLEdBQUdBLEVBQW1CQSxDQUFDQTtJQTZCdERBLENBQUNBO0lBM0JTRCxtREFBZ0JBLEdBQXhCQSxVQUF5QkEsT0FBZUE7UUFDdENFLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQy9DQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsSUFBSUEsU0FBU0EsR0FBR0EsaUNBQXFCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUMvQ0EsT0FBT0EsR0FBR0EsZ0JBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsaUJBQUdBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvREEsaUJBQUdBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzlDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7SUFDakJBLENBQUNBO0lBRURGLDhDQUFXQSxHQUFYQSxVQUFZQSxPQUFlQSxFQUFFQSxRQUFnQkE7UUFDM0NHLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSw2RUFBNkVBO1lBQzdFQSwwQkFBMEJBO1lBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURILG9EQUFpQkEsR0FBakJBLFVBQWtCQSxRQUFnQkE7UUFDaENJLElBQUlBLGNBQWNBLEdBQUdBLDZCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQUdBLENBQUNBLGFBQWFBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3ZFQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsY0FBY0EsR0FBR0EsUUFBUUEsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBOUJISjtRQUFDQSxlQUFVQSxFQUFFQTs7aUNBK0JaQTtJQUFEQSwrQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvQkQsRUFDOEMsK0NBQXFCLEVBOEJsRTtBQTlCWSxnQ0FBd0IsMkJBOEJwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7c3BsaXRIdG1sVGFnTmFtZXNwYWNlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF90YWdzJztcblxuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5jb25zdCBOQU1FU1BBQ0VfVVJJUyA9XG4gICAgQ09OU1RfRVhQUih7J3hsaW5rJzogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAnc3ZnJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ30pO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IGV4dGVuZHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcHJvdG9FbGVtZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBFbGVtZW50PigpO1xuXG4gIHByaXZhdGUgX2dldFByb3RvRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBFbGVtZW50IHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuX3Byb3RvRWxlbWVudHMuZ2V0KHRhZ05hbWUpO1xuICAgIGlmIChpc0JsYW5rKGVsZW1lbnQpKSB7XG4gICAgICB2YXIgbnNBbmROYW1lID0gc3BsaXRIdG1sVGFnTmFtZXNwYWNlKHRhZ05hbWUpO1xuICAgICAgZWxlbWVudCA9IGlzUHJlc2VudChuc0FuZE5hbWVbMF0pID9cbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnROUyhOQU1FU1BBQ0VfVVJJU1tuc0FuZE5hbWVbMF1dLCBuc0FuZE5hbWVbMV0pIDpcbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnQobnNBbmROYW1lWzFdKTtcbiAgICAgIHRoaXMuX3Byb3RvRWxlbWVudHMuc2V0KHRhZ05hbWUsIGVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGNhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAvLyBvbmNlIGl0IGlzIGluc3RhbnRpYXRlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbG0gPSB0aGlzLl9nZXRQcm90b0VsZW1lbnQodGFnTmFtZSk7XG4gICAgICByZXR1cm4gRE9NLmhhc1Byb3BlcnR5KGVsbSwgcHJvcE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBtYXBwZWRQcm9wTmFtZSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KERPTS5hdHRyVG9Qcm9wTWFwLCBwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChtYXBwZWRQcm9wTmFtZSkgPyBtYXBwZWRQcm9wTmFtZSA6IHByb3BOYW1lO1xuICB9XG59XG4iXX0=