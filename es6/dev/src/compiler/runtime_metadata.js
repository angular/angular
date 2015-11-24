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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { resolveForwardRef } from 'angular2/src/core/di';
import { Type, isBlank, isPresent, isArray, stringify } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { MapWrapper } from 'angular2/src/facade/collection';
import * as cpl from './directive_metadata';
import * as md from 'angular2/src/core/metadata/directives';
import { DirectiveResolver } from 'angular2/src/core/linker/directive_resolver';
import { ViewResolver } from 'angular2/src/core/linker/view_resolver';
import { hasLifecycleHook } from 'angular2/src/core/linker/directive_lifecycle_reflector';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/linker/interfaces';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable, Inject, Optional } from 'angular2/src/core/di';
import { PLATFORM_DIRECTIVES } from 'angular2/src/core/platform_directives_and_pipes';
import { MODULE_SUFFIX } from './util';
export let RuntimeMetadataResolver = class {
    constructor(_directiveResolver, _viewResolver, _platformDirectives) {
        this._directiveResolver = _directiveResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._cache = new Map();
    }
    getMetadata(directiveType) {
        var meta = this._cache.get(directiveType);
        if (isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var moduleUrl = calcModuleUrl(directiveType, dirMeta);
            var templateMeta = null;
            var changeDetectionStrategy = null;
            if (dirMeta instanceof md.ComponentMetadata) {
                var cmpMeta = dirMeta;
                var viewMeta = this._viewResolver.resolve(directiveType);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: isPresent(templateMeta),
                dynamicLoadable: true,
                type: new cpl.CompileTypeMetadata({ name: stringify(directiveType), moduleUrl: moduleUrl, runtime: directiveType }),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, directiveType))
            });
            this._cache.set(directiveType, meta);
        }
        return meta;
    }
    getViewDirectivesMetadata(component) {
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidDirective(directives[i])) {
                throw new BaseException(`Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
            }
        }
        return removeDuplicates(directives).map(type => this.getMetadata(type));
    }
};
RuntimeMetadataResolver = __decorate([
    Injectable(),
    __param(2, Optional()),
    __param(2, Inject(PLATFORM_DIRECTIVES)), 
    __metadata('design:paramtypes', [DirectiveResolver, ViewResolver, Array])
], RuntimeMetadataResolver);
function removeDuplicates(items) {
    let m = new Map();
    items.forEach(i => m.set(i, null));
    return MapWrapper.keys(m);
}
function flattenDirectives(view, platformDirectives) {
    let directives = [];
    if (isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = resolveForwardRef(tree[i]);
        if (isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isValidDirective(value) {
    return isPresent(value) && (value instanceof Type);
}
function calcModuleUrl(type, dirMeta) {
    if (isPresent(dirMeta.moduleId)) {
        return `package:${dirMeta.moduleId}${MODULE_SUFFIX}`;
    }
    else {
        return reflector.importUri(type);
    }
}
//# sourceMappingURL=runtime_metadata.js.map