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
import { Compiler, Compiler_, internalCreateProtoView } from 'angular2/src/core/linker/compiler';
import { ProtoViewFactory } from 'angular2/src/core/linker/proto_view_factory';
import { TemplateCompiler } from './template_compiler';
import { Injectable } from 'angular2/src/core/di';
export class RuntimeCompiler extends Compiler {
}
export let RuntimeCompiler_ = class extends Compiler_ {
    constructor(_protoViewFactory, _templateCompiler) {
        super(_protoViewFactory);
        this._templateCompiler = _templateCompiler;
    }
    compileInHost(componentType) {
        return this._templateCompiler.compileHostComponentRuntime(componentType)
            .then(compiledHostTemplate => internalCreateProtoView(this, compiledHostTemplate));
    }
    clearCache() {
        super.clearCache();
        this._templateCompiler.clearCache();
    }
};
RuntimeCompiler_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ProtoViewFactory, TemplateCompiler])
], RuntimeCompiler_);
//# sourceMappingURL=runtime_compiler.js.map