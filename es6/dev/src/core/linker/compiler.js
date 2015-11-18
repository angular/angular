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
//# sourceMappingURL=compiler.js.map