var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '../di';
import { isBlank } from 'angular2/src/facade/lang';
import { DirectiveProvider } from './element';
import { DirectiveResolver, CODEGEN_DIRECTIVE_RESOLVER } from './directive_resolver';
import { PipeProvider } from '../pipes/pipe_provider';
import { PipeResolver, CODEGEN_PIPE_RESOLVER } from './pipe_resolver';
export let ResolvedMetadataCache = class {
    constructor(_directiveResolver, _pipeResolver) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
    }
    getResolvedDirectiveMetadata(type) {
        var result = this._directiveCache.get(type);
        if (isBlank(result)) {
            result = DirectiveProvider.createFromType(type, this._directiveResolver.resolve(type));
            this._directiveCache.set(type, result);
        }
        return result;
    }
    getResolvedPipeMetadata(type) {
        var result = this._pipeCache.get(type);
        if (isBlank(result)) {
            result = PipeProvider.createFromType(type, this._pipeResolver.resolve(type));
            this._pipeCache.set(type, result);
        }
        return result;
    }
};
ResolvedMetadataCache = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [DirectiveResolver, PipeResolver])
], ResolvedMetadataCache);
export var CODEGEN_RESOLVED_METADATA_CACHE = new ResolvedMetadataCache(CODEGEN_DIRECTIVE_RESOLVER, CODEGEN_PIPE_RESOLVER);
