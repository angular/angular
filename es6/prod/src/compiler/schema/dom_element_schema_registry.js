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
