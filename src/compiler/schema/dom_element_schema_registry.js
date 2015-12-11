'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
            var nsAndName = html_tags_1.splitNsName(tagName);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFDaEUsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQsMEJBQTBCLGlDQUFpQyxDQUFDLENBQUE7QUFFNUQsd0NBQW9DLDJCQUEyQixDQUFDLENBQUE7QUFFaEUsSUFBTSxjQUFjLEdBQ2hCLGlCQUFVLENBQUMsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztBQUUvRjtJQUM4Q0EsNENBQXFCQTtJQURuRUE7UUFDOENDLDhCQUFxQkE7UUFDekRBLG1CQUFjQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFtQkEsQ0FBQ0E7SUE2QnREQSxDQUFDQTtJQTNCU0QsbURBQWdCQSxHQUF4QkEsVUFBeUJBLE9BQWVBO1FBQ3RDRSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLFNBQVNBLEdBQUdBLHVCQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUNyQ0EsT0FBT0EsR0FBR0EsZ0JBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsaUJBQUdBLENBQUNBLGVBQWVBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvREEsaUJBQUdBLENBQUNBLGFBQWFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzlDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUM1Q0EsQ0FBQ0E7UUFDREEsTUFBTUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7SUFDakJBLENBQUNBO0lBRURGLDhDQUFXQSxHQUFYQSxVQUFZQSxPQUFlQSxFQUFFQSxRQUFnQkE7UUFDM0NHLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSw2RUFBNkVBO1lBQzdFQSwwQkFBMEJBO1lBQzFCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUNkQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1lBQ3pDQSxNQUFNQSxDQUFDQSxpQkFBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDeENBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURILG9EQUFpQkEsR0FBakJBLFVBQWtCQSxRQUFnQkE7UUFDaENJLElBQUlBLGNBQWNBLEdBQUdBLDZCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQUdBLENBQUNBLGFBQWFBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3ZFQSxNQUFNQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsY0FBY0EsR0FBR0EsUUFBUUEsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBOUJISjtRQUFDQSxlQUFVQSxFQUFFQTs7aUNBK0JaQTtJQUFEQSwrQkFBQ0E7QUFBREEsQ0FBQ0EsQUEvQkQsRUFDOEMsK0NBQXFCLEVBOEJsRTtBQTlCWSxnQ0FBd0IsMkJBOEJwQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7c3BsaXROc05hbWV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3RhZ3MnO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5cbmNvbnN0IE5BTUVTUEFDRV9VUklTID1cbiAgICBDT05TVF9FWFBSKHsneGxpbmsnOiAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsICdzdmcnOiAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnfSk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkgZXh0ZW5kcyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBwcml2YXRlIF9wcm90b0VsZW1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEVsZW1lbnQ+KCk7XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IEVsZW1lbnQge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5fcHJvdG9FbGVtZW50cy5nZXQodGFnTmFtZSk7XG4gICAgaWYgKGlzQmxhbmsoZWxlbWVudCkpIHtcbiAgICAgIHZhciBuc0FuZE5hbWUgPSBzcGxpdE5zTmFtZSh0YWdOYW1lKTtcbiAgICAgIGVsZW1lbnQgPSBpc1ByZXNlbnQobnNBbmROYW1lWzBdKSA/XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50TlMoTkFNRVNQQUNFX1VSSVNbbnNBbmROYW1lWzBdXSwgbnNBbmROYW1lWzFdKSA6XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50KG5zQW5kTmFtZVsxXSk7XG4gICAgICB0aGlzLl9wcm90b0VsZW1lbnRzLnNldCh0YWdOYW1lLCBlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGFnTmFtZS5pbmRleE9mKCctJykgIT09IC0xKSB7XG4gICAgICAvLyBjYW4ndCB0ZWxsIG5vdyBhcyB3ZSBkb24ndCBrbm93IHdoaWNoIHByb3BlcnRpZXMgYSBjdXN0b20gZWxlbWVudCB3aWxsIGdldFxuICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxtID0gdGhpcy5fZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWUpO1xuICAgICAgcmV0dXJuIERPTS5oYXNQcm9wZXJ0eShlbG0sIHByb3BOYW1lKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGVkUHJvcE5hbWUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChET00uYXR0clRvUHJvcE1hcCwgcHJvcE5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobWFwcGVkUHJvcE5hbWUpID8gbWFwcGVkUHJvcE5hbWUgOiBwcm9wTmFtZTtcbiAgfVxufVxuIl19