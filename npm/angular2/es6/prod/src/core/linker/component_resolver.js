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
import { isBlank, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { ComponentFactory } from './component_factory';
/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 */
export class ComponentResolver {
}
function _isComponentFactory(type) {
    return type instanceof ComponentFactory;
}
export let ReflectorComponentResolver = class ReflectorComponentResolver extends ComponentResolver {
    resolveComponent(componentType) {
        var metadatas = reflector.annotations(componentType);
        var componentFactory = metadatas.find(_isComponentFactory);
        if (isBlank(componentFactory)) {
            throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(componentFactory);
    }
    clearCache() { }
};
ReflectorComponentResolver = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ReflectorComponentResolver);
