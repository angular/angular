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
import { splitNsName } from 'angular2/src/compiler/html_tags';
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
            var nsAndName = splitNsName(tagName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDaEUsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUN4RCxFQUFDLEdBQUcsRUFBQyxNQUFNLHVDQUF1QztPQUNsRCxFQUFDLFdBQVcsRUFBQyxNQUFNLGlDQUFpQztPQUVwRCxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJCO0FBRS9ELE1BQU0sY0FBYyxHQUNoQixVQUFVLENBQUMsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztBQUUvRixvREFDOEMscUJBQXFCO0lBRG5FQTtRQUM4Q0MsZUFBcUJBO1FBQ3pEQSxtQkFBY0EsR0FBR0EsSUFBSUEsR0FBR0EsRUFBbUJBLENBQUNBO0lBNkJ0REEsQ0FBQ0E7SUEzQlNELGdCQUFnQkEsQ0FBQ0EsT0FBZUE7UUFDdENFLElBQUlBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQy9DQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNyQkEsSUFBSUEsU0FBU0EsR0FBR0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDckNBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9EQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVERixXQUFXQSxDQUFDQSxPQUFlQSxFQUFFQSxRQUFnQkE7UUFDM0NHLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSw2RUFBNkVBO1lBQzdFQSwwQkFBMEJBO1lBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREgsaUJBQWlCQSxDQUFDQSxRQUFnQkE7UUFDaENJLElBQUlBLGNBQWNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLFFBQVFBLENBQUNBO0lBQy9EQSxDQUFDQTtBQUNISixDQUFDQTtBQS9CRDtJQUFDLFVBQVUsRUFBRTs7NkJBK0JaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtzcGxpdE5zTmFtZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfdGFncyc7XG5cbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuY29uc3QgTkFNRVNQQUNFX1VSSVMgPVxuICAgIENPTlNUX0VYUFIoeyd4bGluayc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3N2Zyc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyd9KTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSBleHRlbmRzIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSB7XG4gIHByaXZhdGUgX3Byb3RvRWxlbWVudHMgPSBuZXcgTWFwPHN0cmluZywgRWxlbWVudD4oKTtcblxuICBwcml2YXRlIF9nZXRQcm90b0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogRWxlbWVudCB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9wcm90b0VsZW1lbnRzLmdldCh0YWdOYW1lKTtcbiAgICBpZiAoaXNCbGFuayhlbGVtZW50KSkge1xuICAgICAgdmFyIG5zQW5kTmFtZSA9IHNwbGl0TnNOYW1lKHRhZ05hbWUpO1xuICAgICAgZWxlbWVudCA9IGlzUHJlc2VudChuc0FuZE5hbWVbMF0pID9cbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnROUyhOQU1FU1BBQ0VfVVJJU1tuc0FuZE5hbWVbMF1dLCBuc0FuZE5hbWVbMV0pIDpcbiAgICAgICAgICAgICAgICAgICAgRE9NLmNyZWF0ZUVsZW1lbnQobnNBbmROYW1lWzFdKTtcbiAgICAgIHRoaXMuX3Byb3RvRWxlbWVudHMuc2V0KHRhZ05hbWUsIGVsZW1lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGNhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAvLyBvbmNlIGl0IGlzIGluc3RhbnRpYXRlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbG0gPSB0aGlzLl9nZXRQcm90b0VsZW1lbnQodGFnTmFtZSk7XG4gICAgICByZXR1cm4gRE9NLmhhc1Byb3BlcnR5KGVsbSwgcHJvcE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBtYXBwZWRQcm9wTmFtZSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KERPTS5hdHRyVG9Qcm9wTWFwLCBwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChtYXBwZWRQcm9wTmFtZSkgPyBtYXBwZWRQcm9wTmFtZSA6IHByb3BOYW1lO1xuICB9XG59XG4iXX0=