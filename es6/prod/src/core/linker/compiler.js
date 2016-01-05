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
import { HostViewFactory } from 'angular2/src/core/linker/view';
import { HostViewFactoryRef_ } from 'angular2/src/core/linker/view_ref';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export class Compiler {
}
function isHostViewFactory(type) {
    return type instanceof HostViewFactory;
}
export let Compiler_ = class extends Compiler {
    compileInHost(componentType) {
        var metadatas = reflector.annotations(componentType);
        var hostViewFactory = metadatas.find(isHostViewFactory);
        if (isBlank(hostViewFactory)) {
            throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(new HostViewFactoryRef_(hostViewFactory));
    }
    clearCache() { }
};
Compiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], Compiler_);
