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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOlsiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5IiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiRG9tRWxlbWVudFNjaGVtYVJlZ2lzdHJ5Ll9nZXRQcm90b0VsZW1lbnQiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuaGFzUHJvcGVydHkiLCJEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkuZ2V0TWFwcGVkUHJvcE5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQscUJBQTZDLDBCQUEwQixDQUFDLENBQUE7QUFDeEUsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFDaEUsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFDMUQsMEJBQW9DLGlDQUFpQyxDQUFDLENBQUE7QUFFdEUsd0NBQW9DLDJCQUEyQixDQUFDLENBQUE7QUFFaEUsSUFBTSxjQUFjLEdBQ2hCLGlCQUFVLENBQUMsRUFBQyxPQUFPLEVBQUUsOEJBQThCLEVBQUUsS0FBSyxFQUFFLDRCQUE0QixFQUFDLENBQUMsQ0FBQztBQUUvRjtJQUM4Q0EsNENBQXFCQTtJQURuRUE7UUFDOENDLDhCQUFxQkE7UUFDekRBLG1CQUFjQSxHQUFHQSxJQUFJQSxHQUFHQSxFQUFtQkEsQ0FBQ0E7SUE2QnREQSxDQUFDQTtJQTNCU0QsbURBQWdCQSxHQUF4QkEsVUFBeUJBLE9BQWVBO1FBQ3RDRSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxHQUFHQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLFNBQVNBLEdBQUdBLGlDQUFxQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLE9BQU9BLEdBQUdBLGdCQUFTQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLGlCQUFHQSxDQUFDQSxlQUFlQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLGlCQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDNUNBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLE9BQU9BLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVERiw4Q0FBV0EsR0FBWEEsVUFBWUEsT0FBZUEsRUFBRUEsUUFBZ0JBO1FBQzNDRyxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsNkVBQTZFQTtZQUM3RUEsMEJBQTBCQTtZQUMxQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtZQUN6Q0EsTUFBTUEsQ0FBQ0EsaUJBQUdBLENBQUNBLFdBQVdBLENBQUNBLEdBQUdBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESCxvREFBaUJBLEdBQWpCQSxVQUFrQkEsUUFBZ0JBO1FBQ2hDSSxJQUFJQSxjQUFjQSxHQUFHQSw2QkFBZ0JBLENBQUNBLEdBQUdBLENBQUNBLGlCQUFHQSxDQUFDQSxhQUFhQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUN2RUEsTUFBTUEsQ0FBQ0EsZ0JBQVNBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLGNBQWNBLEdBQUdBLFFBQVFBLENBQUNBO0lBQy9EQSxDQUFDQTtJQTlCSEo7UUFBQ0EsZUFBVUEsRUFBRUE7O2lDQStCWkE7SUFBREEsK0JBQUNBO0FBQURBLENBQUNBLEFBL0JELEVBQzhDLCtDQUFxQixFQThCbEU7QUE5QlksZ0NBQXdCLDJCQThCcEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0RPTX0gZnJvbSAnYW5ndWxhcjIvc3JjL3BsYXRmb3JtL2RvbS9kb21fYWRhcHRlcic7XG5pbXBvcnQge3NwbGl0SHRtbFRhZ05hbWVzcGFjZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL2h0bWxfdGFncyc7XG5cbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuY29uc3QgTkFNRVNQQUNFX1VSSVMgPVxuICAgIENPTlNUX0VYUFIoeyd4bGluayc6ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rJywgJ3N2Zyc6ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyd9KTtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSBleHRlbmRzIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSB7XG4gIHByaXZhdGUgX3Byb3RvRWxlbWVudHMgPSBuZXcgTWFwPHN0cmluZywgRWxlbWVudD4oKTtcblxuICBwcml2YXRlIF9nZXRQcm90b0VsZW1lbnQodGFnTmFtZTogc3RyaW5nKTogRWxlbWVudCB7XG4gICAgdmFyIGVsZW1lbnQgPSB0aGlzLl9wcm90b0VsZW1lbnRzLmdldCh0YWdOYW1lKTtcbiAgICBpZiAoaXNCbGFuayhlbGVtZW50KSkge1xuICAgICAgdmFyIG5zQW5kTmFtZSA9IHNwbGl0SHRtbFRhZ05hbWVzcGFjZSh0YWdOYW1lKTtcbiAgICAgIGVsZW1lbnQgPSBpc1ByZXNlbnQobnNBbmROYW1lWzBdKSA/XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50TlMoTkFNRVNQQUNFX1VSSVNbbnNBbmROYW1lWzBdXSwgbnNBbmROYW1lWzFdKSA6XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50KG5zQW5kTmFtZVsxXSk7XG4gICAgICB0aGlzLl9wcm90b0VsZW1lbnRzLnNldCh0YWdOYW1lLCBlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGFnTmFtZS5pbmRleE9mKCctJykgIT09IC0xKSB7XG4gICAgICAvLyBjYW4ndCB0ZWxsIG5vdyBhcyB3ZSBkb24ndCBrbm93IHdoaWNoIHByb3BlcnRpZXMgYSBjdXN0b20gZWxlbWVudCB3aWxsIGdldFxuICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxtID0gdGhpcy5fZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWUpO1xuICAgICAgcmV0dXJuIERPTS5oYXNQcm9wZXJ0eShlbG0sIHByb3BOYW1lKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGVkUHJvcE5hbWUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChET00uYXR0clRvUHJvcE1hcCwgcHJvcE5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobWFwcGVkUHJvcE5hbWUpID8gbWFwcGVkUHJvcE5hbWUgOiBwcm9wTmFtZTtcbiAgfVxufVxuIl19