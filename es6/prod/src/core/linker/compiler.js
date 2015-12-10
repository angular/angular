var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { Injectable } from 'angular2/src/core/di';
import { isBlank, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { CompiledHostTemplate } from 'angular2/src/core/linker/template_commands';
/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export class Compiler {
}
function _isCompiledHostTemplate(type) {
    return type instanceof CompiledHostTemplate;
}
export let Compiler_ = class extends Compiler {
    constructor(_protoViewFactory) {
        super();
        this._protoViewFactory = _protoViewFactory;
    }
    compileInHost(componentType) {
        var metadatas = reflector.annotations(componentType);
        var compiledHostTemplate = metadatas.find(_isCompiledHostTemplate);
        if (isBlank(compiledHostTemplate)) {
            throw new BaseException(`No precompiled template for component ${stringify(componentType)} found`);
        }
        return PromiseWrapper.resolve(this._createProtoView(compiledHostTemplate));
    }
    _createProtoView(compiledHostTemplate) {
        return this._protoViewFactory.createHost(compiledHostTemplate).ref;
    }
    clearCache() { this._protoViewFactory.clearCache(); }
};
Compiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ProtoViewFactory])
], Compiler_);
export function internalCreateProtoView(compiler, compiledHostTemplate) {
    return compiler._createProtoView(compiledHostTemplate);
}
