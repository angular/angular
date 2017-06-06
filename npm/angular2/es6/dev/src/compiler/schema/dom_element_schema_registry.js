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
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { splitNsName } from 'angular2/src/compiler/html_tags';
import { ElementSchemaRegistry } from './element_schema_registry';
const NAMESPACE_URIS = 
/*@ts2dart_const*/
{ 'xlink': 'http://www.w3.org/1999/xlink', 'svg': 'http://www.w3.org/2000/svg' };
export let DomElementSchemaRegistry = class DomElementSchemaRegistry extends ElementSchemaRegistry {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxTQUFTLEVBQUUsT0FBTyxFQUFDLE1BQU0sMEJBQTBCO09BQ3BELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDeEQsRUFBQyxHQUFHLEVBQUMsTUFBTSx1Q0FBdUM7T0FDbEQsRUFBQyxXQUFXLEVBQUMsTUFBTSxpQ0FBaUM7T0FFcEQsRUFBQyxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQjtBQUUvRCxNQUFNLGNBQWM7QUFDaEIsa0JBQWtCO0FBQ2xCLEVBQUMsT0FBTyxFQUFFLDhCQUE4QixFQUFFLEtBQUssRUFBRSw0QkFBNEIsRUFBQyxDQUFDO0FBR25GLDZFQUE4QyxxQkFBcUI7SUFBbkU7UUFBOEMsZUFBcUI7UUFDekQsbUJBQWMsR0FBRyxJQUFJLEdBQUcsRUFBbUIsQ0FBQztJQTZCdEQsQ0FBQztJQTNCUyxnQkFBZ0IsQ0FBQyxPQUFlO1FBQ3RDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9DLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxTQUFTLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixHQUFHLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9ELEdBQUcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZSxFQUFFLFFBQWdCO1FBQzNDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLDZFQUE2RTtZQUM3RSwwQkFBMEI7WUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QyxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztJQUNILENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxRQUFnQjtRQUNoQyxJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN2RSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFDL0QsQ0FBQztBQUNILENBQUM7QUEvQkQ7SUFBQyxVQUFVLEVBQUU7OzRCQUFBO0FBK0JaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcbmltcG9ydCB7c3BsaXROc05hbWV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX3RhZ3MnO1xuXG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5cbmNvbnN0IE5BTUVTUEFDRV9VUklTID1cbiAgICAvKkB0czJkYXJ0X2NvbnN0Ki9cbiAgICB7J3hsaW5rJzogJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCAnc3ZnJzogJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJ307XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkgZXh0ZW5kcyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBwcml2YXRlIF9wcm90b0VsZW1lbnRzID0gbmV3IE1hcDxzdHJpbmcsIEVsZW1lbnQ+KCk7XG5cbiAgcHJpdmF0ZSBfZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWU6IHN0cmluZyk6IEVsZW1lbnQge1xuICAgIHZhciBlbGVtZW50ID0gdGhpcy5fcHJvdG9FbGVtZW50cy5nZXQodGFnTmFtZSk7XG4gICAgaWYgKGlzQmxhbmsoZWxlbWVudCkpIHtcbiAgICAgIHZhciBuc0FuZE5hbWUgPSBzcGxpdE5zTmFtZSh0YWdOYW1lKTtcbiAgICAgIGVsZW1lbnQgPSBpc1ByZXNlbnQobnNBbmROYW1lWzBdKSA/XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50TlMoTkFNRVNQQUNFX1VSSVNbbnNBbmROYW1lWzBdXSwgbnNBbmROYW1lWzFdKSA6XG4gICAgICAgICAgICAgICAgICAgIERPTS5jcmVhdGVFbGVtZW50KG5zQW5kTmFtZVsxXSk7XG4gICAgICB0aGlzLl9wcm90b0VsZW1lbnRzLnNldCh0YWdOYW1lLCBlbGVtZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGFnTmFtZS5pbmRleE9mKCctJykgIT09IC0xKSB7XG4gICAgICAvLyBjYW4ndCB0ZWxsIG5vdyBhcyB3ZSBkb24ndCBrbm93IHdoaWNoIHByb3BlcnRpZXMgYSBjdXN0b20gZWxlbWVudCB3aWxsIGdldFxuICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxtID0gdGhpcy5fZ2V0UHJvdG9FbGVtZW50KHRhZ05hbWUpO1xuICAgICAgcmV0dXJuIERPTS5oYXNQcm9wZXJ0eShlbG0sIHByb3BOYW1lKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGVkUHJvcE5hbWUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChET00uYXR0clRvUHJvcE1hcCwgcHJvcE5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobWFwcGVkUHJvcE5hbWUpID8gbWFwcGVkUHJvcE5hbWUgOiBwcm9wTmFtZTtcbiAgfVxufVxuIl19