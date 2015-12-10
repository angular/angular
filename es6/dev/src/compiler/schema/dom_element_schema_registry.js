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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUNoRSxFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO09BQ2xELEVBQUMscUJBQXFCLEVBQUMsTUFBTSxpQ0FBaUM7T0FFOUQsRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQjtBQUUvRCxNQUFNLGNBQWMsR0FDaEIsVUFBVSxDQUFDLEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBQyxDQUFDLENBQUM7QUFFL0Ysb0RBQzhDLHFCQUFxQjtJQURuRUE7UUFDOENDLGVBQXFCQTtRQUN6REEsbUJBQWNBLEdBQUdBLElBQUlBLEdBQUdBLEVBQW1CQSxDQUFDQTtJQTZCdERBLENBQUNBO0lBM0JTRCxnQkFBZ0JBLENBQUNBLE9BQWVBO1FBQ3RDRSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLFNBQVNBLEdBQUdBLHFCQUFxQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLE9BQU9BLEdBQUdBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9EQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVERixXQUFXQSxDQUFDQSxPQUFlQSxFQUFFQSxRQUFnQkE7UUFDM0NHLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSw2RUFBNkVBO1lBQzdFQSwwQkFBMEJBO1lBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN4Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREgsaUJBQWlCQSxDQUFDQSxRQUFnQkE7UUFDaENJLElBQUlBLGNBQWNBLEdBQUdBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDdkVBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLFFBQVFBLENBQUNBO0lBQy9EQSxDQUFDQTtBQUNISixDQUFDQTtBQS9CRDtJQUFDLFVBQVUsRUFBRTs7NkJBK0JaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuaW1wb3J0IHtzcGxpdEh0bWxUYWdOYW1lc3BhY2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3RhZ3MnO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5cbmNvbnN0IE5BTUVTUEFDRV9VUklTID1cbiAgICBDT05TVF9FWFBSKHsneGxpbmsnOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdzdmcnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnfSk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkgZXh0ZW5kcyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBwcml2YXRlIF9wcm90b0VsZW1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEVsZW1lbnQ+KCk7XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IEVsZW1lbnQge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5fcHJvdG9FbGVtZW50cy5nZXQodGFnTmFtZSk7XG4gICAgaWYgKGlzQmxhbmsoZWxlbWVudCkpIHtcbiAgICAgIHZhciBuc0FuZE5hbWUgPSBzcGxpdEh0bWxUYWdOYW1lc3BhY2UodGFnTmFtZSk7XG4gICAgICBlbGVtZW50ID0gaXNQcmVzZW50KG5zQW5kTmFtZVswXSkgP1xuICAgICAgICAgICAgICAgICAgICBET00uY3JlYXRlRWxlbWVudE5TKE5BTUVTUEFDRV9VUklTW25zQW5kTmFtZVswXV0sIG5zQW5kTmFtZVsxXSkgOlxuICAgICAgICAgICAgICAgICAgICBET00uY3JlYXRlRWxlbWVudChuc0FuZE5hbWVbMV0pO1xuICAgICAgdGhpcy5fcHJvdG9FbGVtZW50cy5zZXQodGFnTmFtZSwgZWxlbWVudCk7XG4gICAgfVxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgaGFzUHJvcGVydHkodGFnTmFtZTogc3RyaW5nLCBwcm9wTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKHRhZ05hbWUuaW5kZXhPZignLScpICE9PSAtMSkge1xuICAgICAgLy8gY2FuJ3QgdGVsbCBub3cgYXMgd2UgZG9uJ3Qga25vdyB3aGljaCBwcm9wZXJ0aWVzIGEgY3VzdG9tIGVsZW1lbnQgd2lsbCBnZXRcbiAgICAgIC8vIG9uY2UgaXQgaXMgaW5zdGFudGlhdGVkXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGVsbSA9IHRoaXMuX2dldFByb3RvRWxlbWVudCh0YWdOYW1lKTtcbiAgICAgIHJldHVybiBET00uaGFzUHJvcGVydHkoZWxtLCBwcm9wTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWFwcGVkUHJvcE5hbWUocHJvcE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIG1hcHBlZFByb3BOYW1lID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoRE9NLmF0dHJUb1Byb3BNYXAsIHByb3BOYW1lKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG1hcHBlZFByb3BOYW1lKSA/IG1hcHBlZFByb3BOYW1lIDogcHJvcE5hbWU7XG4gIH1cbn1cbiJdfQ==