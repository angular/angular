'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var cpl = require('./compile_metadata');
var md = require('angular2/src/core/metadata/directives');
var directive_resolver_1 = require('./directive_resolver');
var pipe_resolver_1 = require('./pipe_resolver');
var view_resolver_1 = require('./view_resolver');
var directive_lifecycle_reflector_1 = require('./directive_lifecycle_reflector');
var lifecycle_hooks_1 = require('angular2/src/core/metadata/lifecycle_hooks');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var di_2 = require('angular2/src/core/di');
var platform_directives_and_pipes_1 = require('angular2/src/core/platform_directives_and_pipes');
var util_1 = require('./util');
var assertions_1 = require('./assertions');
var url_resolver_1 = require('angular2/src/compiler/url_resolver');
var provider_1 = require('angular2/src/core/di/provider');
var metadata_1 = require('angular2/src/core/di/metadata');
var di_3 = require('angular2/src/core/metadata/di');
var reflector_reader_1 = require('angular2/src/core/reflection/reflector_reader');
var provider_util_1 = require('../core/di/provider_util');
var CompileMetadataResolver = (function () {
    function CompileMetadataResolver(_directiveResolver, _pipeResolver, _viewResolver, _platformDirectives, _platformPipes, _reflector) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._platformPipes = _platformPipes;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
        if (lang_1.isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflection_1.reflector;
        }
    }
    CompileMetadataResolver.prototype.sanitizeTokenName = function (token) {
        var identifier = lang_1.stringify(token);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            var found = this._anonymousTypes.get(token);
            if (lang_1.isBlank(found)) {
                this._anonymousTypes.set(token, this._anonymousTypeIndex++);
                found = this._anonymousTypes.get(token);
            }
            identifier = "anonymous_token_" + found + "_";
        }
        return util_1.sanitizeIdentifier(identifier);
    };
    CompileMetadataResolver.prototype.getDirectiveMetadata = function (directiveType) {
        var meta = this._directiveCache.get(directiveType);
        if (lang_1.isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            if (dirMeta instanceof md.ComponentMetadata) {
                assertions_1.assertArrayOfStrings('styles', dirMeta.styles);
                var cmpMeta = dirMeta;
                var viewMeta = this._viewResolver.resolve(directiveType);
                assertions_1.assertArrayOfStrings('styles', viewMeta.styles);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls,
                    baseUrl: calcTemplateBaseUrl(this._reflector, directiveType, cmpMeta)
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
                if (lang_1.isPresent(dirMeta.viewProviders)) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders);
                }
            }
            var providers = [];
            if (lang_1.isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers);
            }
            var queries = [];
            var viewQueries = [];
            if (lang_1.isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: lang_1.isPresent(templateMeta),
                type: this.getTypeMetadata(directiveType, staticTypeModuleUrl(directiveType)),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, directiveType); }),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    };
    /**
     * @param someType a symbol which may or may not be a directive type
     * @returns {cpl.CompileDirectiveMetadata} if possible, otherwise null.
     */
    CompileMetadataResolver.prototype.maybeGetDirectiveMetadata = function (someType) {
        try {
            return this.getDirectiveMetadata(someType);
        }
        catch (e) {
            if (e.message.indexOf('No Directive annotation') !== -1) {
                return null;
            }
            throw e;
        }
    };
    CompileMetadataResolver.prototype.getTypeMetadata = function (type, moduleUrl) {
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeTokenName(type),
            moduleUrl: moduleUrl,
            runtime: type,
            diDeps: this.getDependenciesMetadata(type, null)
        });
    };
    CompileMetadataResolver.prototype.getFactoryMetadata = function (factory, moduleUrl) {
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeTokenName(factory),
            moduleUrl: moduleUrl,
            runtime: factory,
            diDeps: this.getDependenciesMetadata(factory, null)
        });
    };
    CompileMetadataResolver.prototype.getPipeMetadata = function (pipeType) {
        var meta = this._pipeCache.get(pipeType);
        if (lang_1.isBlank(meta)) {
            var pipeMeta = this._pipeResolver.resolve(pipeType);
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, staticTypeModuleUrl(pipeType)),
                name: pipeMeta.name,
                pure: pipeMeta.pure,
                lifecycleHooks: lifecycle_hooks_1.LIFECYCLE_HOOKS_VALUES.filter(function (hook) { return directive_lifecycle_reflector_1.hasLifecycleHook(hook, pipeType); }),
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    };
    CompileMetadataResolver.prototype.getViewDirectivesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidType(directives[i])) {
                throw new exceptions_1.BaseException("Unexpected directive value '" + lang_1.stringify(directives[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return directives.map(function (type) { return _this.getDirectiveMetadata(type); });
    };
    CompileMetadataResolver.prototype.getViewPipesMetadata = function (component) {
        var _this = this;
        var view = this._viewResolver.resolve(component);
        var pipes = flattenPipes(view, this._platformPipes);
        for (var i = 0; i < pipes.length; i++) {
            if (!isValidType(pipes[i])) {
                throw new exceptions_1.BaseException("Unexpected piped value '" + lang_1.stringify(pipes[i]) + "' on the View of component '" + lang_1.stringify(component) + "'");
            }
        }
        return pipes.map(function (type) { return _this.getPipeMetadata(type); });
    };
    CompileMetadataResolver.prototype.getDependenciesMetadata = function (typeOrFunc, dependencies) {
        var _this = this;
        var params = lang_1.isPresent(dependencies) ? dependencies : this._reflector.parameters(typeOrFunc);
        if (lang_1.isBlank(params)) {
            params = [];
        }
        return params.map(function (param) {
            if (lang_1.isBlank(param)) {
                return null;
            }
            var isAttribute = false;
            var isHost = false;
            var isSelf = false;
            var isSkipSelf = false;
            var isOptional = false;
            var query = null;
            var viewQuery = null;
            var token = null;
            if (lang_1.isArray(param)) {
                param
                    .forEach(function (paramEntry) {
                    if (paramEntry instanceof metadata_1.HostMetadata) {
                        isHost = true;
                    }
                    else if (paramEntry instanceof metadata_1.SelfMetadata) {
                        isSelf = true;
                    }
                    else if (paramEntry instanceof metadata_1.SkipSelfMetadata) {
                        isSkipSelf = true;
                    }
                    else if (paramEntry instanceof metadata_1.OptionalMetadata) {
                        isOptional = true;
                    }
                    else if (paramEntry instanceof di_3.AttributeMetadata) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (paramEntry instanceof di_3.QueryMetadata) {
                        if (paramEntry.isViewQuery) {
                            viewQuery = paramEntry;
                        }
                        else {
                            query = paramEntry;
                        }
                    }
                    else if (paramEntry instanceof metadata_1.InjectMetadata) {
                        token = paramEntry.token;
                    }
                    else if (isValidType(paramEntry) && lang_1.isBlank(token)) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (lang_1.isBlank(token)) {
                return null;
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: isHost,
                isSelf: isSelf,
                isSkipSelf: isSkipSelf,
                isOptional: isOptional,
                query: lang_1.isPresent(query) ? _this.getQueryMetadata(query, null) : null,
                viewQuery: lang_1.isPresent(viewQuery) ? _this.getQueryMetadata(viewQuery, null) : null,
                token: _this.getTokenMetadata(token)
            });
        });
    };
    CompileMetadataResolver.prototype.getTokenMetadata = function (token) {
        token = di_1.resolveForwardRef(token);
        var compileToken;
        if (lang_1.isString(token)) {
            compileToken = new cpl.CompileTokenMetadata({ value: token });
        }
        else {
            compileToken = new cpl.CompileTokenMetadata({
                identifier: new cpl.CompileIdentifierMetadata({
                    runtime: token,
                    name: this.sanitizeTokenName(token),
                    moduleUrl: staticTypeModuleUrl(token)
                })
            });
        }
        return compileToken;
    };
    CompileMetadataResolver.prototype.getProvidersMetadata = function (providers) {
        var _this = this;
        return providers.map(function (provider) {
            provider = di_1.resolveForwardRef(provider);
            if (lang_1.isArray(provider)) {
                return _this.getProvidersMetadata(provider);
            }
            else if (provider instanceof provider_1.Provider) {
                return _this.getProviderMetadata(provider);
            }
            else if (provider_util_1.isProviderLiteral(provider)) {
                return _this.getProviderMetadata(provider_util_1.createProvider(provider));
            }
            else {
                return _this.getTypeMetadata(provider, staticTypeModuleUrl(provider));
            }
        });
    };
    CompileMetadataResolver.prototype.getProviderMetadata = function (provider) {
        var compileDeps;
        if (lang_1.isPresent(provider.useClass)) {
            compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
        }
        else if (lang_1.isPresent(provider.useFactory)) {
            compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: lang_1.isPresent(provider.useClass) ?
                this.getTypeMetadata(provider.useClass, staticTypeModuleUrl(provider.useClass)) :
                null,
            useValue: convertToCompileValue(provider.useValue),
            useFactory: lang_1.isPresent(provider.useFactory) ?
                this.getFactoryMetadata(provider.useFactory, staticTypeModuleUrl(provider.useFactory)) :
                null,
            useExisting: lang_1.isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                null,
            deps: compileDeps,
            multi: provider.multi
        });
    };
    CompileMetadataResolver.prototype.getQueriesMetadata = function (queries, isViewQuery) {
        var _this = this;
        var compileQueries = [];
        collection_1.StringMapWrapper.forEach(queries, function (query, propertyName) {
            if (query.isViewQuery === isViewQuery) {
                compileQueries.push(_this.getQueryMetadata(query, propertyName));
            }
        });
        return compileQueries;
    };
    CompileMetadataResolver.prototype.getQueryMetadata = function (q, propertyName) {
        var _this = this;
        var selectors;
        if (q.isVarBindingQuery) {
            selectors = q.varBindings.map(function (varName) { return _this.getTokenMetadata(varName); });
        }
        else {
            selectors = [this.getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants,
            propertyName: propertyName,
            read: lang_1.isPresent(q.read) ? this.getTokenMetadata(q.read) : null
        });
    };
    CompileMetadataResolver = __decorate([
        di_2.Injectable(),
        __param(3, di_2.Optional()),
        __param(3, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_DIRECTIVES)),
        __param(4, di_2.Optional()),
        __param(4, di_2.Inject(platform_directives_and_pipes_1.PLATFORM_PIPES)), 
        __metadata('design:paramtypes', [directive_resolver_1.DirectiveResolver, pipe_resolver_1.PipeResolver, view_resolver_1.ViewResolver, Array, Array, reflector_reader_1.ReflectorReader])
    ], CompileMetadataResolver);
    return CompileMetadataResolver;
}());
exports.CompileMetadataResolver = CompileMetadataResolver;
function flattenDirectives(view, platformDirectives) {
    var directives = [];
    if (lang_1.isPresent(platformDirectives)) {
        flattenArray(platformDirectives, directives);
    }
    if (lang_1.isPresent(view.directives)) {
        flattenArray(view.directives, directives);
    }
    return directives;
}
function flattenPipes(view, platformPipes) {
    var pipes = [];
    if (lang_1.isPresent(platformPipes)) {
        flattenArray(platformPipes, pipes);
    }
    if (lang_1.isPresent(view.pipes)) {
        flattenArray(view.pipes, pipes);
    }
    return pipes;
}
function flattenArray(tree, out) {
    for (var i = 0; i < tree.length; i++) {
        var item = di_1.resolveForwardRef(tree[i]);
        if (lang_1.isArray(item)) {
            flattenArray(item, out);
        }
        else {
            out.push(item);
        }
    }
}
function isStaticType(value) {
    return lang_1.isStringMap(value) && lang_1.isPresent(value['name']) && lang_1.isPresent(value['moduleId']);
}
function isValidType(value) {
    return isStaticType(value) || (value instanceof lang_1.Type);
}
function staticTypeModuleUrl(value) {
    return isStaticType(value) ? value['moduleId'] : null;
}
function calcTemplateBaseUrl(reflector, type, cmpMetadata) {
    if (isStaticType(type)) {
        return type['filePath'];
    }
    if (lang_1.isPresent(cmpMetadata.moduleId)) {
        var moduleId = cmpMetadata.moduleId;
        var scheme = url_resolver_1.getUrlScheme(moduleId);
        return lang_1.isPresent(scheme) && scheme.length > 0 ? moduleId :
            "package:" + moduleId + util_1.MODULE_SUFFIX;
    }
    return reflector.importUri(type);
}
// Only fill CompileIdentifierMetadata.runtime if needed...
function convertToCompileValue(value) {
    return util_1.visitValue(value, new _CompileValueConverter(), null);
}
var _CompileValueConverter = (function (_super) {
    __extends(_CompileValueConverter, _super);
    function _CompileValueConverter() {
        _super.apply(this, arguments);
    }
    _CompileValueConverter.prototype.visitOther = function (value, context) {
        if (isStaticType(value)) {
            return new cpl.CompileIdentifierMetadata({ name: value['name'], moduleUrl: staticTypeModuleUrl(value) });
        }
        else {
            return new cpl.CompileIdentifierMetadata({ runtime: value });
        }
    };
    return _CompileValueConverter;
}(util_1.ValueTransformer));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvbWV0YWRhdGFfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFDdkQscUJBVU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM3RCxJQUFZLEdBQUcsV0FBTSxvQkFBb0IsQ0FBQyxDQUFBO0FBQzFDLElBQVksRUFBRSxXQUFNLHVDQUF1QyxDQUFDLENBQUE7QUFFNUQsbUNBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFDdkQsOEJBQTJCLGlCQUFpQixDQUFDLENBQUE7QUFDN0MsOEJBQTJCLGlCQUFpQixDQUFDLENBQUE7QUFFN0MsOENBQStCLGlDQUFpQyxDQUFDLENBQUE7QUFDakUsZ0NBQXFELDRDQUE0QyxDQUFDLENBQUE7QUFDbEcsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUsbUJBQTJDLHNCQUFzQixDQUFDLENBQUE7QUFDbEUsOENBQWtELGlEQUFpRCxDQUFDLENBQUE7QUFDcEcscUJBQThFLFFBQVEsQ0FBQyxDQUFBO0FBQ3ZGLDJCQUFtQyxjQUFjLENBQUMsQ0FBQTtBQUNsRCw2QkFBMkIsb0NBQW9DLENBQUMsQ0FBQTtBQUNoRSx5QkFBdUIsK0JBQStCLENBQUMsQ0FBQTtBQUN2RCx5QkFNTywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3ZDLG1CQUErQywrQkFBK0IsQ0FBQyxDQUFBO0FBQy9FLGlDQUE4QiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzlFLDhCQUFnRCwwQkFBMEIsQ0FBQyxDQUFBO0FBRzNFO0lBT0UsaUNBQW9CLGtCQUFxQyxF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QUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELDJEQUEyRDtBQUMzRCwrQkFBK0IsS0FBVTtJQUN2QyxNQUFNLENBQUMsaUJBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxzQkFBc0IsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFFRDtJQUFxQywwQ0FBZ0I7SUFBckQ7UUFBcUMsOEJBQWdCO0lBU3JELENBQUM7SUFSQywyQ0FBVSxHQUFWLFVBQVcsS0FBVSxFQUFFLE9BQVk7UUFDakMsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMseUJBQXlCLENBQ3BDLEVBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3BFLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxFQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDSCxDQUFDO0lBQ0gsNkJBQUM7QUFBRCxDQUFDLEFBVEQsQ0FBcUMsdUJBQWdCLEdBU3BEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtyZXNvbHZlRm9yd2FyZFJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgVHlwZSxcbiAgaXNCbGFuayxcbiAgaXNQcmVzZW50LFxuICBpc0FycmF5LFxuICBzdHJpbmdpZnksXG4gIGlzU3RyaW5nLFxuICBpc1N0cmluZ01hcCxcbiAgUmVnRXhwV3JhcHBlcixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0ICogYXMgY3BsIGZyb20gJy4vY29tcGlsZV9tZXRhZGF0YSc7XG5pbXBvcnQgKiBhcyBtZCBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaXJlY3RpdmVzJztcbmltcG9ydCAqIGFzIGRpbWQgZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGknO1xuaW1wb3J0IHtEaXJlY3RpdmVSZXNvbHZlcn0gZnJvbSAnLi9kaXJlY3RpdmVfcmVzb2x2ZXInO1xuaW1wb3J0IHtQaXBlUmVzb2x2ZXJ9IGZyb20gJy4vcGlwZV9yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdSZXNvbHZlcn0gZnJvbSAnLi92aWV3X3Jlc29sdmVyJztcbmltcG9ydCB7Vmlld01ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9kaXJlY3RpdmVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge0xpZmVjeWNsZUhvb2tzLCBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9saWZlY3ljbGVfaG9va3MnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3B0aW9uYWx9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UExBVEZPUk1fRElSRUNUSVZFUywgUExBVEZPUk1fUElQRVN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BsYXRmb3JtX2RpcmVjdGl2ZXNfYW5kX3BpcGVzJztcbmltcG9ydCB7TU9EVUxFX1NVRkZJWCwgc2FuaXRpemVJZGVudGlmaWVyLCBWYWx1ZVRyYW5zZm9ybWVyLCB2aXNpdFZhbHVlfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHthc3NlcnRBcnJheU9mU3RyaW5nc30gZnJvbSAnLi9hc3NlcnRpb25zJztcbmltcG9ydCB7Z2V0VXJsU2NoZW1lfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIvdXJsX3Jlc29sdmVyJztcbmltcG9ydCB7UHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcbmltcG9ydCB7XG4gIE9wdGlvbmFsTWV0YWRhdGEsXG4gIFNlbGZNZXRhZGF0YSxcbiAgSG9zdE1ldGFkYXRhLFxuICBTa2lwU2VsZk1ldGFkYXRhLFxuICBJbmplY3RNZXRhZGF0YVxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhLCBRdWVyeU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS9kaSc7XG5pbXBvcnQge1JlZmxlY3RvclJlYWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0b3JfcmVhZGVyJztcbmltcG9ydCB7aXNQcm92aWRlckxpdGVyYWwsIGNyZWF0ZVByb3ZpZGVyfSBmcm9tICcuLi9jb3JlL2RpL3Byb3ZpZGVyX3V0aWwnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ29tcGlsZU1ldGFkYXRhUmVzb2x2ZXIge1xuICBwcml2YXRlIF9kaXJlY3RpdmVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfcGlwZUNhY2hlID0gbmV3IE1hcDxUeXBlLCBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YT4oKTtcbiAgcHJpdmF0ZSBfYW5vbnltb3VzVHlwZXMgPSBuZXcgTWFwPE9iamVjdCwgbnVtYmVyPigpO1xuICBwcml2YXRlIF9hbm9ueW1vdXNUeXBlSW5kZXggPSAwO1xuICBwcml2YXRlIF9yZWZsZWN0b3I6IFJlZmxlY3RvclJlYWRlcjtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kaXJlY3RpdmVSZXNvbHZlcjogRGlyZWN0aXZlUmVzb2x2ZXIsIHByaXZhdGUgX3BpcGVSZXNvbHZlcjogUGlwZVJlc29sdmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF92aWV3UmVzb2x2ZXI6IFZpZXdSZXNvbHZlcixcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChQTEFURk9STV9ESVJFQ1RJVkVTKSBwcml2YXRlIF9wbGF0Zm9ybURpcmVjdGl2ZXM6IFR5cGVbXSxcbiAgICAgICAgICAgICAgQE9wdGlvbmFsKCkgQEluamVjdChQTEFURk9STV9QSVBFUykgcHJpdmF0ZSBfcGxhdGZvcm1QaXBlczogVHlwZVtdLFxuICAgICAgICAgICAgICBfcmVmbGVjdG9yPzogUmVmbGVjdG9yUmVhZGVyKSB7XG4gICAgaWYgKGlzUHJlc2VudChfcmVmbGVjdG9yKSkge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gX3JlZmxlY3RvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcmVmbGVjdG9yID0gcmVmbGVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgc2FuaXRpemVUb2tlbk5hbWUodG9rZW46IGFueSk6IHN0cmluZyB7XG4gICAgbGV0IGlkZW50aWZpZXIgPSBzdHJpbmdpZnkodG9rZW4pO1xuICAgIGlmIChpZGVudGlmaWVyLmluZGV4T2YoJygnKSA+PSAwKSB7XG4gICAgICAvLyBjYXNlOiBhbm9ueW1vdXMgZnVuY3Rpb25zIVxuICAgICAgbGV0IGZvdW5kID0gdGhpcy5fYW5vbnltb3VzVHlwZXMuZ2V0KHRva2VuKTtcbiAgICAgIGlmIChpc0JsYW5rKGZvdW5kKSkge1xuICAgICAgICB0aGlzLl9hbm9ueW1vdXNUeXBlcy5zZXQodG9rZW4sIHRoaXMuX2Fub255bW91c1R5cGVJbmRleCsrKTtcbiAgICAgICAgZm91bmQgPSB0aGlzLl9hbm9ueW1vdXNUeXBlcy5nZXQodG9rZW4pO1xuICAgICAgfVxuICAgICAgaWRlbnRpZmllciA9IGBhbm9ueW1vdXNfdG9rZW5fJHtmb3VuZH1fYDtcbiAgICB9XG4gICAgcmV0dXJuIHNhbml0aXplSWRlbnRpZmllcihpZGVudGlmaWVyKTtcbiAgfVxuXG4gIGdldERpcmVjdGl2ZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX2RpcmVjdGl2ZUNhY2hlLmdldChkaXJlY3RpdmVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIGRpck1ldGEgPSB0aGlzLl9kaXJlY3RpdmVSZXNvbHZlci5yZXNvbHZlKGRpcmVjdGl2ZVR5cGUpO1xuICAgICAgdmFyIHRlbXBsYXRlTWV0YSA9IG51bGw7XG4gICAgICB2YXIgY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kgPSBudWxsO1xuICAgICAgdmFyIHZpZXdQcm92aWRlcnMgPSBbXTtcblxuICAgICAgaWYgKGRpck1ldGEgaW5zdGFuY2VvZiBtZC5Db21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgICBhc3NlcnRBcnJheU9mU3RyaW5ncygnc3R5bGVzJywgZGlyTWV0YS5zdHlsZXMpO1xuICAgICAgICB2YXIgY21wTWV0YSA9IDxtZC5Db21wb25lbnRNZXRhZGF0YT5kaXJNZXRhO1xuICAgICAgICB2YXIgdmlld01ldGEgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlKTtcbiAgICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlcycsIHZpZXdNZXRhLnN0eWxlcyk7XG4gICAgICAgIHRlbXBsYXRlTWV0YSA9IG5ldyBjcGwuQ29tcGlsZVRlbXBsYXRlTWV0YWRhdGEoe1xuICAgICAgICAgIGVuY2Fwc3VsYXRpb246IHZpZXdNZXRhLmVuY2Fwc3VsYXRpb24sXG4gICAgICAgICAgdGVtcGxhdGU6IHZpZXdNZXRhLnRlbXBsYXRlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiB2aWV3TWV0YS50ZW1wbGF0ZVVybCxcbiAgICAgICAgICBzdHlsZXM6IHZpZXdNZXRhLnN0eWxlcyxcbiAgICAgICAgICBzdHlsZVVybHM6IHZpZXdNZXRhLnN0eWxlVXJscyxcbiAgICAgICAgICBiYXNlVXJsOiBjYWxjVGVtcGxhdGVCYXNlVXJsKHRoaXMuX3JlZmxlY3RvciwgZGlyZWN0aXZlVHlwZSwgY21wTWV0YSlcbiAgICAgICAgfSk7XG4gICAgICAgIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gY21wTWV0YS5jaGFuZ2VEZXRlY3Rpb247XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS52aWV3UHJvdmlkZXJzKSkge1xuICAgICAgICAgIHZpZXdQcm92aWRlcnMgPSB0aGlzLmdldFByb3ZpZGVyc01ldGFkYXRhKGRpck1ldGEudmlld1Byb3ZpZGVycyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIHByb3ZpZGVycyA9IFtdO1xuICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnByb3ZpZGVycykpIHtcbiAgICAgICAgcHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShkaXJNZXRhLnByb3ZpZGVycyk7XG4gICAgICB9XG4gICAgICB2YXIgcXVlcmllcyA9IFtdO1xuICAgICAgdmFyIHZpZXdRdWVyaWVzID0gW107XG4gICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEucXVlcmllcykpIHtcbiAgICAgICAgcXVlcmllcyA9IHRoaXMuZ2V0UXVlcmllc01ldGFkYXRhKGRpck1ldGEucXVlcmllcywgZmFsc2UpO1xuICAgICAgICB2aWV3UXVlcmllcyA9IHRoaXMuZ2V0UXVlcmllc01ldGFkYXRhKGRpck1ldGEucXVlcmllcywgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBtZXRhID0gY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YS5jcmVhdGUoe1xuICAgICAgICBzZWxlY3RvcjogZGlyTWV0YS5zZWxlY3RvcixcbiAgICAgICAgZXhwb3J0QXM6IGRpck1ldGEuZXhwb3J0QXMsXG4gICAgICAgIGlzQ29tcG9uZW50OiBpc1ByZXNlbnQodGVtcGxhdGVNZXRhKSxcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEoZGlyZWN0aXZlVHlwZSwgc3RhdGljVHlwZU1vZHVsZVVybChkaXJlY3RpdmVUeXBlKSksXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZU1ldGEsXG4gICAgICAgIGNoYW5nZURldGVjdGlvbjogY2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgICAgIGlucHV0czogZGlyTWV0YS5pbnB1dHMsXG4gICAgICAgIG91dHB1dHM6IGRpck1ldGEub3V0cHV0cyxcbiAgICAgICAgaG9zdDogZGlyTWV0YS5ob3N0LFxuICAgICAgICBsaWZlY3ljbGVIb29rczpcbiAgICAgICAgICAgIExJRkVDWUNMRV9IT09LU19WQUxVRVMuZmlsdGVyKGhvb2sgPT4gaGFzTGlmZWN5Y2xlSG9vayhob29rLCBkaXJlY3RpdmVUeXBlKSksXG4gICAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgICB2aWV3UHJvdmlkZXJzOiB2aWV3UHJvdmlkZXJzLFxuICAgICAgICBxdWVyaWVzOiBxdWVyaWVzLFxuICAgICAgICB2aWV3UXVlcmllczogdmlld1F1ZXJpZXNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fZGlyZWN0aXZlQ2FjaGUuc2V0KGRpcmVjdGl2ZVR5cGUsIG1ldGEpO1xuICAgIH1cbiAgICByZXR1cm4gbWV0YTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gc29tZVR5cGUgYSBzeW1ib2wgd2hpY2ggbWF5IG9yIG1heSBub3QgYmUgYSBkaXJlY3RpdmUgdHlwZVxuICAgKiBAcmV0dXJucyB7Y3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YX0gaWYgcG9zc2libGUsIG90aGVyd2lzZSBudWxsLlxuICAgKi9cbiAgbWF5YmVHZXREaXJlY3RpdmVNZXRhZGF0YShzb21lVHlwZTogVHlwZSk6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXREaXJlY3RpdmVNZXRhZGF0YShzb21lVHlwZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUubWVzc2FnZS5pbmRleE9mKCdObyBEaXJlY3RpdmUgYW5ub3RhdGlvbicpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgZ2V0VHlwZU1ldGFkYXRhKHR5cGU6IFR5cGUsIG1vZHVsZVVybDogc3RyaW5nKTogY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEge1xuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEoe1xuICAgICAgbmFtZTogdGhpcy5zYW5pdGl6ZVRva2VuTmFtZSh0eXBlKSxcbiAgICAgIG1vZHVsZVVybDogbW9kdWxlVXJsLFxuICAgICAgcnVudGltZTogdHlwZSxcbiAgICAgIGRpRGVwczogdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlLCBudWxsKVxuICAgIH0pO1xuICB9XG5cbiAgZ2V0RmFjdG9yeU1ldGFkYXRhKGZhY3Rvcnk6IEZ1bmN0aW9uLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlRmFjdG9yeU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVUb2tlbk5hbWUoZmFjdG9yeSksXG4gICAgICBtb2R1bGVVcmw6IG1vZHVsZVVybCxcbiAgICAgIHJ1bnRpbWU6IGZhY3RvcnksXG4gICAgICBkaURlcHM6IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEoZmFjdG9yeSwgbnVsbClcbiAgICB9KTtcbiAgfVxuXG4gIGdldFBpcGVNZXRhZGF0YShwaXBlVHlwZTogVHlwZSk6IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhIHtcbiAgICB2YXIgbWV0YSA9IHRoaXMuX3BpcGVDYWNoZS5nZXQocGlwZVR5cGUpO1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICB2YXIgcGlwZU1ldGEgPSB0aGlzLl9waXBlUmVzb2x2ZXIucmVzb2x2ZShwaXBlVHlwZSk7XG4gICAgICBtZXRhID0gbmV3IGNwbC5Db21waWxlUGlwZU1ldGFkYXRhKHtcbiAgICAgICAgdHlwZTogdGhpcy5nZXRUeXBlTWV0YWRhdGEocGlwZVR5cGUsIHN0YXRpY1R5cGVNb2R1bGVVcmwocGlwZVR5cGUpKSxcbiAgICAgICAgbmFtZTogcGlwZU1ldGEubmFtZSxcbiAgICAgICAgcHVyZTogcGlwZU1ldGEucHVyZSxcbiAgICAgICAgbGlmZWN5Y2xlSG9va3M6IExJRkVDWUNMRV9IT09LU19WQUxVRVMuZmlsdGVyKGhvb2sgPT4gaGFzTGlmZWN5Y2xlSG9vayhob29rLCBwaXBlVHlwZSkpLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9waXBlQ2FjaGUuc2V0KHBpcGVUeXBlLCBtZXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1ldGE7XG4gIH1cblxuICBnZXRWaWV3RGlyZWN0aXZlc01ldGFkYXRhKGNvbXBvbmVudDogVHlwZSk6IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSB7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShjb21wb25lbnQpO1xuICAgIHZhciBkaXJlY3RpdmVzID0gZmxhdHRlbkRpcmVjdGl2ZXModmlldywgdGhpcy5fcGxhdGZvcm1EaXJlY3RpdmVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRpcmVjdGl2ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNWYWxpZFR5cGUoZGlyZWN0aXZlc1tpXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgVW5leHBlY3RlZCBkaXJlY3RpdmUgdmFsdWUgJyR7c3RyaW5naWZ5KGRpcmVjdGl2ZXNbaV0pfScgb24gdGhlIFZpZXcgb2YgY29tcG9uZW50ICcke3N0cmluZ2lmeShjb21wb25lbnQpfSdgKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRpcmVjdGl2ZXMubWFwKHR5cGUgPT4gdGhpcy5nZXREaXJlY3RpdmVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXRWaWV3UGlwZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YVtdIHtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ZpZXdSZXNvbHZlci5yZXNvbHZlKGNvbXBvbmVudCk7XG4gICAgdmFyIHBpcGVzID0gZmxhdHRlblBpcGVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtUGlwZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghaXNWYWxpZFR5cGUocGlwZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgcGlwZWQgdmFsdWUgJyR7c3RyaW5naWZ5KHBpcGVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwaXBlcy5tYXAodHlwZSA9PiB0aGlzLmdldFBpcGVNZXRhZGF0YSh0eXBlKSk7XG4gIH1cblxuICBnZXREZXBlbmRlbmNpZXNNZXRhZGF0YSh0eXBlT3JGdW5jOiBUeXBlIHwgRnVuY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRlcGVuZGVuY2llczogYW55W10pOiBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhW10ge1xuICAgIGxldCBwYXJhbXMgPSBpc1ByZXNlbnQoZGVwZW5kZW5jaWVzKSA/IGRlcGVuZGVuY2llcyA6IHRoaXMuX3JlZmxlY3Rvci5wYXJhbWV0ZXJzKHR5cGVPckZ1bmMpO1xuICAgIGlmIChpc0JsYW5rKHBhcmFtcykpIHtcbiAgICAgIHBhcmFtcyA9IFtdO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zLm1hcCgocGFyYW0pID0+IHtcbiAgICAgIGlmIChpc0JsYW5rKHBhcmFtKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGxldCBpc0F0dHJpYnV0ZSA9IGZhbHNlO1xuICAgICAgbGV0IGlzSG9zdCA9IGZhbHNlO1xuICAgICAgbGV0IGlzU2VsZiA9IGZhbHNlO1xuICAgICAgbGV0IGlzU2tpcFNlbGYgPSBmYWxzZTtcbiAgICAgIGxldCBpc09wdGlvbmFsID0gZmFsc2U7XG4gICAgICBsZXQgcXVlcnk6IGRpbWQuUXVlcnlNZXRhZGF0YSA9IG51bGw7XG4gICAgICBsZXQgdmlld1F1ZXJ5OiBkaW1kLlZpZXdRdWVyeU1ldGFkYXRhID0gbnVsbDtcbiAgICAgIHZhciB0b2tlbiA9IG51bGw7XG4gICAgICBpZiAoaXNBcnJheShwYXJhbSkpIHtcbiAgICAgICAgKDxhbnlbXT5wYXJhbSlcbiAgICAgICAgICAgIC5mb3JFYWNoKChwYXJhbUVudHJ5KSA9PiB7XG4gICAgICAgICAgICAgIGlmIChwYXJhbUVudHJ5IGluc3RhbmNlb2YgSG9zdE1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgaXNIb3N0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbUVudHJ5IGluc3RhbmNlb2YgU2VsZk1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgaXNTZWxmID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbUVudHJ5IGluc3RhbmNlb2YgU2tpcFNlbGZNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlzU2tpcFNlbGYgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtRW50cnkgaW5zdGFuY2VvZiBPcHRpb25hbE1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgaXNPcHRpb25hbCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1FbnRyeSBpbnN0YW5jZW9mIEF0dHJpYnV0ZU1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgaXNBdHRyaWJ1dGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeS5hdHRyaWJ1dGVOYW1lO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtRW50cnkgaW5zdGFuY2VvZiBRdWVyeU1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtRW50cnkuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgICAgICAgICAgIHZpZXdRdWVyeSA9IHBhcmFtRW50cnk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHF1ZXJ5ID0gcGFyYW1FbnRyeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1FbnRyeSBpbnN0YW5jZW9mIEluamVjdE1ldGFkYXRhKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4gPSBwYXJhbUVudHJ5LnRva2VuO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzVmFsaWRUeXBlKHBhcmFtRW50cnkpICYmIGlzQmxhbmsodG9rZW4pKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4gPSBwYXJhbUVudHJ5O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gcGFyYW07XG4gICAgICB9XG4gICAgICBpZiAoaXNCbGFuayh0b2tlbikpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlRGlEZXBlbmRlbmN5TWV0YWRhdGEoe1xuICAgICAgICBpc0F0dHJpYnV0ZTogaXNBdHRyaWJ1dGUsXG4gICAgICAgIGlzSG9zdDogaXNIb3N0LFxuICAgICAgICBpc1NlbGY6IGlzU2VsZixcbiAgICAgICAgaXNTa2lwU2VsZjogaXNTa2lwU2VsZixcbiAgICAgICAgaXNPcHRpb25hbDogaXNPcHRpb25hbCxcbiAgICAgICAgcXVlcnk6IGlzUHJlc2VudChxdWVyeSkgPyB0aGlzLmdldFF1ZXJ5TWV0YWRhdGEocXVlcnksIG51bGwpIDogbnVsbCxcbiAgICAgICAgdmlld1F1ZXJ5OiBpc1ByZXNlbnQodmlld1F1ZXJ5KSA/IHRoaXMuZ2V0UXVlcnlNZXRhZGF0YSh2aWV3UXVlcnksIG51bGwpIDogbnVsbCxcbiAgICAgICAgdG9rZW46IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YSh0b2tlbilcbiAgICAgIH0pO1xuXG4gICAgfSk7XG4gIH1cblxuICBnZXRUb2tlbk1ldGFkYXRhKHRva2VuOiBhbnkpOiBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEge1xuICAgIHRva2VuID0gcmVzb2x2ZUZvcndhcmRSZWYodG9rZW4pO1xuICAgIHZhciBjb21waWxlVG9rZW47XG4gICAgaWYgKGlzU3RyaW5nKHRva2VuKSkge1xuICAgICAgY29tcGlsZVRva2VuID0gbmV3IGNwbC5Db21waWxlVG9rZW5NZXRhZGF0YSh7dmFsdWU6IHRva2VufSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IG5ldyBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEoe1xuICAgICAgICBpZGVudGlmaWVyOiBuZXcgY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoe1xuICAgICAgICAgIHJ1bnRpbWU6IHRva2VuLFxuICAgICAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVUb2tlbk5hbWUodG9rZW4pLFxuICAgICAgICAgIG1vZHVsZVVybDogc3RhdGljVHlwZU1vZHVsZVVybCh0b2tlbilcbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGlsZVRva2VuO1xuICB9XG5cbiAgZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXJzOiBhbnlbXSk6XG4gICAgICBBcnJheTxjcGwuQ29tcGlsZVByb3ZpZGVyTWV0YWRhdGEgfCBjcGwuQ29tcGlsZVR5cGVNZXRhZGF0YSB8IGFueVtdPiB7XG4gICAgcmV0dXJuIHByb3ZpZGVycy5tYXAoKHByb3ZpZGVyKSA9PiB7XG4gICAgICBwcm92aWRlciA9IHJlc29sdmVGb3J3YXJkUmVmKHByb3ZpZGVyKTtcbiAgICAgIGlmIChpc0FycmF5KHByb3ZpZGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUHJvdmlkZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJNZXRhZGF0YShwcm92aWRlcik7XG4gICAgICB9IGVsc2UgaWYgKGlzUHJvdmlkZXJMaXRlcmFsKHByb3ZpZGVyKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRQcm92aWRlck1ldGFkYXRhKGNyZWF0ZVByb3ZpZGVyKHByb3ZpZGVyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRUeXBlTWV0YWRhdGEocHJvdmlkZXIsIHN0YXRpY1R5cGVNb2R1bGVVcmwocHJvdmlkZXIpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXI6IFByb3ZpZGVyKTogY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHtcbiAgICB2YXIgY29tcGlsZURlcHM7XG4gICAgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykpIHtcbiAgICAgIGNvbXBpbGVEZXBzID0gdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgcHJvdmlkZXIuZGVwZW5kZW5jaWVzKTtcbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChwcm92aWRlci51c2VGYWN0b3J5KSkge1xuICAgICAgY29tcGlsZURlcHMgPSB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhKHtcbiAgICAgIHRva2VuOiB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudG9rZW4pLFxuICAgICAgdXNlQ2xhc3M6XG4gICAgICAgICAgaXNQcmVzZW50KHByb3ZpZGVyLnVzZUNsYXNzKSA/XG4gICAgICAgICAgICAgIHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLnVzZUNsYXNzLCBzdGF0aWNUeXBlTW9kdWxlVXJsKHByb3ZpZGVyLnVzZUNsYXNzKSkgOlxuICAgICAgICAgICAgICBudWxsLFxuICAgICAgdXNlVmFsdWU6IGNvbnZlcnRUb0NvbXBpbGVWYWx1ZShwcm92aWRlci51c2VWYWx1ZSksXG4gICAgICB1c2VGYWN0b3J5OiBpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkgP1xuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ2V0RmFjdG9yeU1ldGFkYXRhKHByb3ZpZGVyLnVzZUZhY3RvcnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGljVHlwZU1vZHVsZVVybChwcm92aWRlci51c2VGYWN0b3J5KSkgOlxuICAgICAgICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICB1c2VFeGlzdGluZzogaXNQcmVzZW50KHByb3ZpZGVyLnVzZUV4aXN0aW5nKSA/IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShwcm92aWRlci51c2VFeGlzdGluZykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgZGVwczogY29tcGlsZURlcHMsXG4gICAgICBtdWx0aTogcHJvdmlkZXIubXVsdGlcbiAgICB9KTtcbiAgfVxuXG4gIGdldFF1ZXJpZXNNZXRhZGF0YShxdWVyaWVzOiB7W2tleTogc3RyaW5nXTogZGltZC5RdWVyeU1ldGFkYXRhfSxcbiAgICAgICAgICAgICAgICAgICAgIGlzVmlld1F1ZXJ5OiBib29sZWFuKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhW10ge1xuICAgIHZhciBjb21waWxlUXVlcmllcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChxdWVyaWVzLCAocXVlcnksIHByb3BlcnR5TmFtZSkgPT4ge1xuICAgICAgaWYgKHF1ZXJ5LmlzVmlld1F1ZXJ5ID09PSBpc1ZpZXdRdWVyeSkge1xuICAgICAgICBjb21waWxlUXVlcmllcy5wdXNoKHRoaXMuZ2V0UXVlcnlNZXRhZGF0YShxdWVyeSwgcHJvcGVydHlOYW1lKSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNvbXBpbGVRdWVyaWVzO1xuICB9XG5cbiAgZ2V0UXVlcnlNZXRhZGF0YShxOiBkaW1kLlF1ZXJ5TWV0YWRhdGEsIHByb3BlcnR5TmFtZTogc3RyaW5nKTogY3BsLkNvbXBpbGVRdWVyeU1ldGFkYXRhIHtcbiAgICB2YXIgc2VsZWN0b3JzO1xuICAgIGlmIChxLmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICBzZWxlY3RvcnMgPSBxLnZhckJpbmRpbmdzLm1hcCh2YXJOYW1lID0+IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YSh2YXJOYW1lKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdG9ycyA9IFt0aGlzLmdldFRva2VuTWV0YWRhdGEocS5zZWxlY3RvcildO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSh7XG4gICAgICBzZWxlY3RvcnM6IHNlbGVjdG9ycyxcbiAgICAgIGZpcnN0OiBxLmZpcnN0LFxuICAgICAgZGVzY2VuZGFudHM6IHEuZGVzY2VuZGFudHMsXG4gICAgICBwcm9wZXJ0eU5hbWU6IHByb3BlcnR5TmFtZSxcbiAgICAgIHJlYWQ6IGlzUHJlc2VudChxLnJlYWQpID8gdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHEucmVhZCkgOiBudWxsXG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdHRlbkRpcmVjdGl2ZXModmlldzogVmlld01ldGFkYXRhLCBwbGF0Zm9ybURpcmVjdGl2ZXM6IGFueVtdKTogVHlwZVtdIHtcbiAgbGV0IGRpcmVjdGl2ZXMgPSBbXTtcbiAgaWYgKGlzUHJlc2VudChwbGF0Zm9ybURpcmVjdGl2ZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHBsYXRmb3JtRGlyZWN0aXZlcywgZGlyZWN0aXZlcyk7XG4gIH1cbiAgaWYgKGlzUHJlc2VudCh2aWV3LmRpcmVjdGl2ZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHZpZXcuZGlyZWN0aXZlcywgZGlyZWN0aXZlcyk7XG4gIH1cbiAgcmV0dXJuIGRpcmVjdGl2ZXM7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5QaXBlcyh2aWV3OiBWaWV3TWV0YWRhdGEsIHBsYXRmb3JtUGlwZXM6IGFueVtdKTogVHlwZVtdIHtcbiAgbGV0IHBpcGVzID0gW107XG4gIGlmIChpc1ByZXNlbnQocGxhdGZvcm1QaXBlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkocGxhdGZvcm1QaXBlcywgcGlwZXMpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQodmlldy5waXBlcykpIHtcbiAgICBmbGF0dGVuQXJyYXkodmlldy5waXBlcywgcGlwZXMpO1xuICB9XG4gIHJldHVybiBwaXBlcztcbn1cblxuZnVuY3Rpb24gZmxhdHRlbkFycmF5KHRyZWU6IGFueVtdLCBvdXQ6IEFycmF5PFR5cGUgfCBhbnlbXT4pOiB2b2lkIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSByZXNvbHZlRm9yd2FyZFJlZih0cmVlW2ldKTtcbiAgICBpZiAoaXNBcnJheShpdGVtKSkge1xuICAgICAgZmxhdHRlbkFycmF5KGl0ZW0sIG91dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1N0YXRpY1R5cGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNTdHJpbmdNYXAodmFsdWUpICYmIGlzUHJlc2VudCh2YWx1ZVsnbmFtZSddKSAmJiBpc1ByZXNlbnQodmFsdWVbJ21vZHVsZUlkJ10pO1xufVxuXG5mdW5jdGlvbiBpc1ZhbGlkVHlwZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1N0YXRpY1R5cGUodmFsdWUpIHx8ICh2YWx1ZSBpbnN0YW5jZW9mIFR5cGUpO1xufVxuXG5mdW5jdGlvbiBzdGF0aWNUeXBlTW9kdWxlVXJsKHZhbHVlOiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gaXNTdGF0aWNUeXBlKHZhbHVlKSA/IHZhbHVlWydtb2R1bGVJZCddIDogbnVsbDtcbn1cblxuXG5mdW5jdGlvbiBjYWxjVGVtcGxhdGVCYXNlVXJsKHJlZmxlY3RvcjogUmVmbGVjdG9yUmVhZGVyLCB0eXBlOiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcE1ldGFkYXRhOiBtZC5Db21wb25lbnRNZXRhZGF0YSk6IHN0cmluZyB7XG4gIGlmIChpc1N0YXRpY1R5cGUodHlwZSkpIHtcbiAgICByZXR1cm4gdHlwZVsnZmlsZVBhdGgnXTtcbiAgfVxuXG4gIGlmIChpc1ByZXNlbnQoY21wTWV0YWRhdGEubW9kdWxlSWQpKSB7XG4gICAgdmFyIG1vZHVsZUlkID0gY21wTWV0YWRhdGEubW9kdWxlSWQ7XG4gICAgdmFyIHNjaGVtZSA9IGdldFVybFNjaGVtZShtb2R1bGVJZCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChzY2hlbWUpICYmIHNjaGVtZS5sZW5ndGggPiAwID8gbW9kdWxlSWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwYWNrYWdlOiR7bW9kdWxlSWR9JHtNT0RVTEVfU1VGRklYfWA7XG4gIH1cblxuICByZXR1cm4gcmVmbGVjdG9yLmltcG9ydFVyaSh0eXBlKTtcbn1cblxuLy8gT25seSBmaWxsIENvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEucnVudGltZSBpZiBuZWVkZWQuLi5cbmZ1bmN0aW9uIGNvbnZlcnRUb0NvbXBpbGVWYWx1ZSh2YWx1ZTogYW55KTogYW55IHtcbiAgcmV0dXJuIHZpc2l0VmFsdWUodmFsdWUsIG5ldyBfQ29tcGlsZVZhbHVlQ29udmVydGVyKCksIG51bGwpO1xufVxuXG5jbGFzcyBfQ29tcGlsZVZhbHVlQ29udmVydGVyIGV4dGVuZHMgVmFsdWVUcmFuc2Zvcm1lciB7XG4gIHZpc2l0T3RoZXIodmFsdWU6IGFueSwgY29udGV4dDogYW55KTogYW55IHtcbiAgICBpZiAoaXNTdGF0aWNUeXBlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YShcbiAgICAgICAgICB7bmFtZTogdmFsdWVbJ25hbWUnXSwgbW9kdWxlVXJsOiBzdGF0aWNUeXBlTW9kdWxlVXJsKHZhbHVlKX0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtydW50aW1lOiB2YWx1ZX0pO1xuICAgIH1cbiAgfVxufVxuIl19