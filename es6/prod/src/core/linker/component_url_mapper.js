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
import { isPresent } from 'angular2/src/facade/lang';
import { Map } from 'angular2/src/facade/collection';
import { reflector } from 'angular2/src/core/reflection/reflection';
/**
 * Resolve a `Type` from a {@link ComponentMetadata} into a URL.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
export let ComponentUrlMapper = class {
    /**
     * Returns the base URL to the component source file.
     * The returned URL could be:
     * - an absolute URL,
     * - a path relative to the application
     */
    getUrl(component) {
        return reflector.isReflectionEnabled() ? reflector.importUri(component) : './';
    }
};
ComponentUrlMapper = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ComponentUrlMapper);
export class RuntimeComponentUrlMapper extends ComponentUrlMapper {
    constructor() {
        super();
        /** @internal */
        this._componentUrls = new Map();
    }
    setComponentUrl(component, url) { this._componentUrls.set(component, url); }
    getUrl(component) {
        var url = this._componentUrls.get(component);
        if (isPresent(url))
            return url;
        return super.getUrl(component);
    }
}
