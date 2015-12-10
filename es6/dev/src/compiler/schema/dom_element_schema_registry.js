var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isPresent, isBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { splitHtmlTagNamespace } from 'angular2/src/compiler/html_tags';
import { ElementSchemaRegistry } from './element_schema_registry';
const NAMESPACE_URIS = CONST_EXPR({ 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' });
export let DomElementSchemaRegistry = class extends ElementSchemaRegistry {
    constructor(...args) {
        super(...args);
        this._protoElements = new Map();
    }
    _getProtoElement(tagName) {
        var element = this._protoElements.get(tagName);
        if (isBlank(element)) {
            var nsAndName = splitHtmlTagNamespace(tagName);
            element = isPresent(nsAndName[0]) ?
                DOM.createElementNS(NAMESPACE_URIS[nsAndName[0]], nsAndName[1]) :
                DOM.createElement(nsAndName[1]);
            this._protoElements.set(tagName, element);
        }
        return element;
    }
    hasProperty(tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elm = this._getProtoElement(tagName);
            return DOM.hasProperty(elm, propName);
        }
    }
    getMappedPropName(propName) {
        var mappedPropName = StringMapWrapper.get(DOM.attrToPropMap, propName);
        return isPresent(mappedPropName) ? mappedPropName : propName;
    }
};
DomElementSchemaRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomElementSchemaRegistry);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDaEUsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztPQUNsRCxFQUFDLHFCQUFxQixFQUFDLE1BQU0saUNBQWlDO09BRTlELEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkI7QUFFL0QsTUFBTSxjQUFjLEdBQ2hCLFVBQVUsQ0FBQyxFQUFDLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxLQUFLLEVBQUUsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO0FBRS9GLG9EQUM4QyxxQkFBcUI7SUFEbkVBO1FBQzhDQyxlQUFxQkE7UUFDekRBLG1CQUFjQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFtQkEsQ0FBQ0E7SUE2QnREQSxDQUFDQTtJQTNCU0QsZ0JBQWdCQSxDQUFDQSxPQUFlQTtRQUN0Q0UsSUFBSUEsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JCQSxJQUFJQSxTQUFTQSxHQUFHQSxxQkFBcUJBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQy9DQSxPQUFPQSxHQUFHQSxTQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEdBQUdBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvREEsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLEVBQUVBLE9BQU9BLENBQUNBLENBQUNBO1FBQzVDQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxPQUFPQSxDQUFDQTtJQUNqQkEsQ0FBQ0E7SUFFREYsV0FBV0EsQ0FBQ0EsT0FBZUEsRUFBRUEsUUFBZ0JBO1FBQzNDRyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsNkVBQTZFQTtZQUM3RUEsMEJBQTBCQTtZQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUN6Q0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURILGlCQUFpQkEsQ0FBQ0EsUUFBZ0JBO1FBQ2hDSSxJQUFJQSxjQUFjQSxHQUFHQSxnQkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLGFBQWFBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3ZFQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxjQUFjQSxHQUFHQSxRQUFRQSxDQUFDQTtJQUMvREEsQ0FBQ0E7QUFDSEosQ0FBQ0E7QUEvQkQ7SUFBQyxVQUFVLEVBQUU7OzZCQStCWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7c3BsaXRIdG1sVGFnTmFtZXNwYWNlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvaHRtbF90YWdzJztcblxuaW1wb3J0IHtFbGVtZW50U2NoZW1hUmVnaXN0cnl9IGZyb20gJy4vZWxlbWVudF9zY2hlbWFfcmVnaXN0cnknO1xuXG5jb25zdCBOQU1FU1BBQ0VfVVJJUyA9XG4gICAgQ09OU1RfRVhQUih7J3hsaW5rJzogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAnc3ZnJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ30pO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IGV4dGVuZHMgRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcHJvdG9FbGVtZW50cyA9IG5ldyBNYXA8c3RyaW5nLCBFbGVtZW50PigpO1xuXG4gIHByaXZhdGUgX2dldFByb3RvRWxlbWVudCh0YWdOYW1lOiBzdHJpbmcpOiBFbGVtZW50IHtcbiAgICB2YXIgZWxlbWVudCA9IHRoaXMuX3Byb3RvRWxlbWVudHMuZ2V0KHRhZ05hbWUpO1xuICAgIGlmIChpc0JsYW5rKGVsZW1lbnQpKSB7XG4gICAgICB2YXIgbnNBbmROYW1lID0gc3BsaXRIdG1sVGFnTmFtZXNwYWNlKHRhZ05hbWUpO1xuICAgICAgZWxlbWVudCA9IGlzUHJlc2VudChuc0FuZE5hbWVbMF0pID9cbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnROUyhOQU1FU1BBQ0VfVVJJU1tuc0FuZE5hbWVbMF1dLCBuc0FuZE5hbWVbMV0pIDpcbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnQobnNBbmROYW1lWzFdKTtcbiAgICAgIHRoaXMuX3Byb3RvRWxlbWVudHMuc2V0KHRhZ05hbWUsIGVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGNhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAvLyBvbmNlIGl0IGlzIGluc3RhbnRpYXRlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbG0gPSB0aGlzLl9nZXRQcm90b0VsZW1lbnQodGFnTmFtZSk7XG4gICAgICByZXR1cm4gRE9NLmhhc1Byb3BlcnR5KGVsbSwgcHJvcE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBtYXBwZWRQcm9wTmFtZSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KERPTS5hdHRyVG9Qcm9wTWFwLCBwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChtYXBwZWRQcm9wTmFtZSkgPyBtYXBwZWRQcm9wTmFtZSA6IHByb3BOYW1lO1xuICB9XG59XG4iXX0=