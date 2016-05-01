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
import { resolveForwardRef } from 'angular2/src/core/di';
import { Type, isBlank, isPresent, isArray, stringify, isString, isStringMap } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import * as cpl from './compile_metadata';
import * as md from 'angular2/src/core/metadata/directives';
import { DirectiveResolver } from './directive_resolver';
import { PipeResolver } from './pipe_resolver';
import { ViewResolver } from './view_resolver';
import { hasLifecycleHook } from './directive_lifecycle_reflector';
import { LIFECYCLE_HOOKS_VALUES } from 'angular2/src/core/metadata/lifecycle_hooks';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable, Inject, Optional } from 'angular2/src/core/di';
import { PLATFORM_DIRECTIVES, PLATFORM_PIPES } from 'angular2/src/core/platform_directives_and_pipes';
import { MODULE_SUFFIX, sanitizeIdentifier, ValueTransformer, visitValue } from './util';
import { assertArrayOfStrings } from './assertions';
import { getUrlScheme } from 'angular2/src/compiler/url_resolver';
import { Provider } from 'angular2/src/core/di/provider';
import { OptionalMetadata, SelfMetadata, HostMetadata, SkipSelfMetadata, InjectMetadata } from 'angular2/src/core/di/metadata';
import { AttributeMetadata, QueryMetadata } from 'angular2/src/core/metadata/di';
import { ReflectorReader } from 'angular2/src/core/reflection/reflector_reader';
import { isProviderLiteral, createProvider } from '../core/di/provider_util';
export let CompileMetadataResolver = class CompileMetadataResolver {
    constructor(_directiveResolver, _pipeResolver, _viewResolver, _platformDirectives, _platformPipes, _reflector) {
        this._directiveResolver = _directiveResolver;
        this._pipeResolver = _pipeResolver;
        this._viewResolver = _viewResolver;
        this._platformDirectives = _platformDirectives;
        this._platformPipes = _platformPipes;
        this._directiveCache = new Map();
        this._pipeCache = new Map();
        this._anonymousTypes = new Map();
        this._anonymousTypeIndex = 0;
        if (isPresent(_reflector)) {
            this._reflector = _reflector;
        }
        else {
            this._reflector = reflector;
        }
    }
    sanitizeTokenName(token) {
        let identifier = stringify(token);
        if (identifier.indexOf('(') >= 0) {
            // case: anonymous functions!
            let found = this._anonymousTypes.get(token);
            if (isBlank(found)) {
                this._anonymousTypes.set(token, this._anonymousTypeIndex++);
                found = this._anonymousTypes.get(token);
            }
            identifier = `anonymous_token_${found}_`;
        }
        return sanitizeIdentifier(identifier);
    }
    getDirectiveMetadata(directiveType) {
        var meta = this._directiveCache.get(directiveType);
        if (isBlank(meta)) {
            var dirMeta = this._directiveResolver.resolve(directiveType);
            var templateMeta = null;
            var changeDetectionStrategy = null;
            var viewProviders = [];
            if (dirMeta instanceof md.ComponentMetadata) {
                assertArrayOfStrings('styles', dirMeta.styles);
                var cmpMeta = dirMeta;
                var viewMeta = this._viewResolver.resolve(directiveType);
                assertArrayOfStrings('styles', viewMeta.styles);
                templateMeta = new cpl.CompileTemplateMetadata({
                    encapsulation: viewMeta.encapsulation,
                    template: viewMeta.template,
                    templateUrl: viewMeta.templateUrl,
                    styles: viewMeta.styles,
                    styleUrls: viewMeta.styleUrls,
                    baseUrl: calcTemplateBaseUrl(this._reflector, directiveType, cmpMeta)
                });
                changeDetectionStrategy = cmpMeta.changeDetection;
                if (isPresent(dirMeta.viewProviders)) {
                    viewProviders = this.getProvidersMetadata(dirMeta.viewProviders);
                }
            }
            var providers = [];
            if (isPresent(dirMeta.providers)) {
                providers = this.getProvidersMetadata(dirMeta.providers);
            }
            var queries = [];
            var viewQueries = [];
            if (isPresent(dirMeta.queries)) {
                queries = this.getQueriesMetadata(dirMeta.queries, false);
                viewQueries = this.getQueriesMetadata(dirMeta.queries, true);
            }
            meta = cpl.CompileDirectiveMetadata.create({
                selector: dirMeta.selector,
                exportAs: dirMeta.exportAs,
                isComponent: isPresent(templateMeta),
                type: this.getTypeMetadata(directiveType, staticTypeModuleUrl(directiveType)),
                template: templateMeta,
                changeDetection: changeDetectionStrategy,
                inputs: dirMeta.inputs,
                outputs: dirMeta.outputs,
                host: dirMeta.host,
                lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, directiveType)),
                providers: providers,
                viewProviders: viewProviders,
                queries: queries,
                viewQueries: viewQueries
            });
            this._directiveCache.set(directiveType, meta);
        }
        return meta;
    }
    /**
     * @param someType a symbol which may or may not be a directive type
     * @returns {cpl.CompileDirectiveMetadata} if possible, otherwise null.
     */
    maybeGetDirectiveMetadata(someType) {
        try {
            return this.getDirectiveMetadata(someType);
        }
        catch (e) {
            if (e.message.indexOf('No Directive annotation') !== -1) {
                return null;
            }
            throw e;
        }
    }
    getTypeMetadata(type, moduleUrl) {
        return new cpl.CompileTypeMetadata({
            name: this.sanitizeTokenName(type),
            moduleUrl: moduleUrl,
            runtime: type,
            diDeps: this.getDependenciesMetadata(type, null)
        });
    }
    getFactoryMetadata(factory, moduleUrl) {
        return new cpl.CompileFactoryMetadata({
            name: this.sanitizeTokenName(factory),
            moduleUrl: moduleUrl,
            runtime: factory,
            diDeps: this.getDependenciesMetadata(factory, null)
        });
    }
    getPipeMetadata(pipeType) {
        var meta = this._pipeCache.get(pipeType);
        if (isBlank(meta)) {
            var pipeMeta = this._pipeResolver.resolve(pipeType);
            meta = new cpl.CompilePipeMetadata({
                type: this.getTypeMetadata(pipeType, staticTypeModuleUrl(pipeType)),
                name: pipeMeta.name,
                pure: pipeMeta.pure,
                lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, pipeType)),
            });
            this._pipeCache.set(pipeType, meta);
        }
        return meta;
    }
    getViewDirectivesMetadata(component) {
        var view = this._viewResolver.resolve(component);
        var directives = flattenDirectives(view, this._platformDirectives);
        for (var i = 0; i < directives.length; i++) {
            if (!isValidType(directives[i])) {
                throw new BaseException(`Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
            }
        }
        return directives.map(type => this.getDirectiveMetadata(type));
    }
    getViewPipesMetadata(component) {
        var view = this._viewResolver.resolve(component);
        var pipes = flattenPipes(view, this._platformPipes);
        for (var i = 0; i < pipes.length; i++) {
            if (!isValidType(pipes[i])) {
                throw new BaseException(`Unexpected piped value '${stringify(pipes[i])}' on the View of component '${stringify(component)}'`);
            }
        }
        return pipes.map(type => this.getPipeMetadata(type));
    }
    getDependenciesMetadata(typeOrFunc, dependencies) {
        let params = isPresent(dependencies) ? dependencies : this._reflector.parameters(typeOrFunc);
        if (isBlank(params)) {
            params = [];
        }
        return params.map((param) => {
            if (isBlank(param)) {
                return null;
            }
            let isAttribute = false;
            let isHost = false;
            let isSelf = false;
            let isSkipSelf = false;
            let isOptional = false;
            let query = null;
            let viewQuery = null;
            var token = null;
            if (isArray(param)) {
                param
                    .forEach((paramEntry) => {
                    if (paramEntry instanceof HostMetadata) {
                        isHost = true;
                    }
                    else if (paramEntry instanceof SelfMetadata) {
                        isSelf = true;
                    }
                    else if (paramEntry instanceof SkipSelfMetadata) {
                        isSkipSelf = true;
                    }
                    else if (paramEntry instanceof OptionalMetadata) {
                        isOptional = true;
                    }
                    else if (paramEntry instanceof AttributeMetadata) {
                        isAttribute = true;
                        token = paramEntry.attributeName;
                    }
                    else if (paramEntry instanceof QueryMetadata) {
                        if (paramEntry.isViewQuery) {
                            viewQuery = paramEntry;
                        }
                        else {
                            query = paramEntry;
                        }
                    }
                    else if (paramEntry instanceof InjectMetadata) {
                        token = paramEntry.token;
                    }
                    else if (isValidType(paramEntry) && isBlank(token)) {
                        token = paramEntry;
                    }
                });
            }
            else {
                token = param;
            }
            if (isBlank(token)) {
                return null;
            }
            return new cpl.CompileDiDependencyMetadata({
                isAttribute: isAttribute,
                isHost: isHost,
                isSelf: isSelf,
                isSkipSelf: isSkipSelf,
                isOptional: isOptional,
                query: isPresent(query) ? this.getQueryMetadata(query, null) : null,
                viewQuery: isPresent(viewQuery) ? this.getQueryMetadata(viewQuery, null) : null,
                token: this.getTokenMetadata(token)
            });
        });
    }
    getTokenMetadata(token) {
        token = resolveForwardRef(token);
        var compileToken;
        if (isString(token)) {
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
    }
    getProvidersMetadata(providers) {
        return providers.map((provider) => {
            provider = resolveForwardRef(provider);
            if (isArray(provider)) {
                return this.getProvidersMetadata(provider);
            }
            else if (provider instanceof Provider) {
                return this.getProviderMetadata(provider);
            }
            else if (isProviderLiteral(provider)) {
                return this.getProviderMetadata(createProvider(provider));
            }
            else {
                return this.getTypeMetadata(provider, staticTypeModuleUrl(provider));
            }
        });
    }
    getProviderMetadata(provider) {
        var compileDeps;
        if (isPresent(provider.useClass)) {
            compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
        }
        else if (isPresent(provider.useFactory)) {
            compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
        }
        return new cpl.CompileProviderMetadata({
            token: this.getTokenMetadata(provider.token),
            useClass: isPresent(provider.useClass) ?
                this.getTypeMetadata(provider.useClass, staticTypeModuleUrl(provider.useClass)) :
                null,
            useValue: convertToCompileValue(provider.useValue),
            useFactory: isPresent(provider.useFactory) ?
                this.getFactoryMetadata(provider.useFactory, staticTypeModuleUrl(provider.useFactory)) :
                null,
            useExisting: isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                null,
            deps: compileDeps,
            multi: provider.multi
        });
    }
    getQueriesMetadata(queries, isViewQuery) {
        var compileQueries = [];
        StringMapWrapper.forEach(queries, (query, propertyName) => {
            if (query.isViewQuery === isViewQuery) {
                compileQueries.push(this.getQueryMetadata(query, propertyName));
            }
        });
        return compileQueries;
    }
    getQueryMetadata(q, propertyName) {
        var selectors;
        if (q.isVarBindingQuery) {
            selectors = q.varBindings.map(varName => this.getTokenMetadata(varName));
        }
        else {
            selectors = [this.getTokenMetadata(q.selector)];
        }
        return new cpl.CompileQueryMetadata({
            selectors: selectors,
            first: q.first,
            descendants: q.descendants,
            propertyName: propertyName,
            read: isPresent(q.read) ? this.getTokenMetadata(q.read) : null
        });
    }
};
CompileMetadataResolver = __decorate([
    Injectable(),
    __param(3, Optional()),
    __param(3, Inject(PLATFORM_DIRECTIVES)),
    __param(4, Optional()),
    __param(4, Inject(PLATFORM_PIPES)), 
    __metadata('design:paramtypes', [DirectiveResolver, PipeResolver, ViewResolver, Array, Array, ReflectorReader])
], CompileMetadataResolver);
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
function flattenPipes(view, platformPipes) {
    let pipes = [];
    if (isPresent(platformPipes)) {
        flattenArray(platformPipes, pipes);
    }
    if (isPresent(view.pipes)) {
        flattenArray(view.pipes, pipes);
    }
    return pipes;
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
function isStaticType(value) {
    return isStringMap(value) && isPresent(value['name']) && isPresent(value['moduleId']);
}
function isValidType(value) {
    return isStaticType(value) || (value instanceof Type);
}
function staticTypeModuleUrl(value) {
    return isStaticType(value) ? value['moduleId'] : null;
}
function calcTemplateBaseUrl(reflector, type, cmpMetadata) {
    if (isStaticType(type)) {
        return type['filePath'];
    }
    if (isPresent(cmpMetadata.moduleId)) {
        var moduleId = cmpMetadata.moduleId;
        var scheme = getUrlScheme(moduleId);
        return isPresent(scheme) && scheme.length > 0 ? moduleId :
            `package:${moduleId}${MODULE_SUFFIX}`;
    }
    return reflector.importUri(type);
}
// Only fill CompileIdentifierMetadata.runtime if needed...
function convertToCompileValue(value) {
    return visitValue(value, new _CompileValueConverter(), null);
}
class _CompileValueConverter extends ValueTransformer {
    visitOther(value, context) {
        if (isStaticType(value)) {
            return new cpl.CompileIdentifierMetadata({ name: value['name'], moduleUrl: staticTypeModuleUrl(value) });
        }
        else {
            return new cpl.CompileIdentifierMetadata({ runtime: value });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGFfcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvbWV0YWRhdGFfcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQjtPQUMvQyxFQUNMLElBQUksRUFDSixPQUFPLEVBQ1AsU0FBUyxFQUNULE9BQU8sRUFDUCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFdBQVcsRUFHWixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ3hELEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEtBQUssR0FBRyxNQUFNLG9CQUFvQjtPQUNsQyxLQUFLLEVBQUUsTUFBTSx1Q0FBdUM7T0FFcEQsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQjtPQUMvQyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQjtPQUNyQyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQjtPQUVyQyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUNBQWlDO09BQ3pELEVBQWlCLHNCQUFzQixFQUFDLE1BQU0sNENBQTRDO09BQzFGLEVBQUMsU0FBUyxFQUFDLE1BQU0seUNBQXlDO09BQzFELEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUMsTUFBTSxzQkFBc0I7T0FDMUQsRUFBQyxtQkFBbUIsRUFBRSxjQUFjLEVBQUMsTUFBTSxpREFBaUQ7T0FDNUYsRUFBQyxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUUsVUFBVSxFQUFDLE1BQU0sUUFBUTtPQUMvRSxFQUFDLG9CQUFvQixFQUFDLE1BQU0sY0FBYztPQUMxQyxFQUFDLFlBQVksRUFBQyxNQUFNLG9DQUFvQztPQUN4RCxFQUFDLFFBQVEsRUFBQyxNQUFNLCtCQUErQjtPQUMvQyxFQUNMLGdCQUFnQixFQUNoQixZQUFZLEVBQ1osWUFBWSxFQUNaLGdCQUFnQixFQUNoQixjQUFjLEVBQ2YsTUFBTSwrQkFBK0I7T0FDL0IsRUFBQyxpQkFBaUIsRUFBRSxhQUFhLEVBQUMsTUFBTSwrQkFBK0I7T0FDdkUsRUFBQyxlQUFlLEVBQUMsTUFBTSwrQ0FBK0M7T0FDdEUsRUFBQyxpQkFBaUIsRUFBRSxjQUFjLEVBQUMsTUFBTSwwQkFBMEI7QUFHMUU7SUFPRSxZQUFvQixrQkFBcUMsRUFBVSxhQUEyQixFQUMxRSxhQUEyQixFQUNjLG1CQUEyQixFQUNoQyxjQUFzQixFQUNsRSxVQUE0QjtRQUpwQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW1CO1FBQVUsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDMUUsa0JBQWEsR0FBYixhQUFhLENBQWM7UUFDYyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQVE7UUFDaEMsbUJBQWMsR0FBZCxjQUFjLENBQVE7UUFUdEUsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBc0MsQ0FBQztRQUNoRSxlQUFVLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7UUFDdEQsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUM1Qyx3QkFBbUIsR0FBRyxDQUFDLENBQUM7UUFROUIsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUMvQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUM5QixDQUFDO0lBQ0gsQ0FBQztJQUVPLGlCQUFpQixDQUFDLEtBQVU7UUFDbEMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyw2QkFBNkI7WUFDN0IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7Z0JBQzVELEtBQUssR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsVUFBVSxHQUFHLG1CQUFtQixLQUFLLEdBQUcsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsTUFBTSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxhQUFtQjtRQUN0QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNuRCxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDN0QsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksdUJBQXVCLEdBQUcsSUFBSSxDQUFDO1lBQ25DLElBQUksYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUV2QixFQUFFLENBQUMsQ0FBQyxPQUFPLFlBQVksRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztnQkFDNUMsb0JBQW9CLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxPQUFPLEdBQXlCLE9BQU8sQ0FBQztnQkFDNUMsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ3pELG9CQUFvQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ2hELFlBQVksR0FBRyxJQUFJLEdBQUcsQ0FBQyx1QkFBdUIsQ0FBQztvQkFDN0MsYUFBYSxFQUFFLFFBQVEsQ0FBQyxhQUFhO29CQUNyQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7b0JBQzNCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVztvQkFDakMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUN2QixTQUFTLEVBQUUsUUFBUSxDQUFDLFNBQVM7b0JBQzdCLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGFBQWEsRUFBRSxPQUFPLENBQUM7aUJBQ3RFLENBQUMsQ0FBQztnQkFDSCx1QkFBdUIsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDO2dCQUNsRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsYUFBYSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7Z0JBQ25FLENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxTQUFTLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQ0QsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztZQUNyQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0QsQ0FBQztZQUNELElBQUksR0FBRyxHQUFHLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDO2dCQUN6QyxRQUFRLEVBQUUsT0FBTyxDQUFDLFFBQVE7Z0JBQzFCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtnQkFDMUIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxZQUFZLENBQUM7Z0JBQ3BDLElBQUksRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDN0UsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLGVBQWUsRUFBRSx1QkFBdUI7Z0JBQ3hDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtnQkFDdEIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxPQUFPO2dCQUN4QixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUk7Z0JBQ2xCLGNBQWMsRUFDVixzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLGdCQUFnQixDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDaEYsU0FBUyxFQUFFLFNBQVM7Z0JBQ3BCLGFBQWEsRUFBRSxhQUFhO2dCQUM1QixPQUFPLEVBQUUsT0FBTztnQkFDaEIsV0FBVyxFQUFFLFdBQVc7YUFDekIsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNILHlCQUF5QixDQUFDLFFBQWM7UUFDdEMsSUFBSSxDQUFDO1lBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxDQUFFO1FBQUEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sQ0FBQyxDQUFDO1FBQ1YsQ0FBQztJQUNILENBQUM7SUFFRCxlQUFlLENBQUMsSUFBVSxFQUFFLFNBQWlCO1FBQzNDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztZQUNqQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQztZQUNsQyxTQUFTLEVBQUUsU0FBUztZQUNwQixPQUFPLEVBQUUsSUFBSTtZQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztTQUNqRCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsa0JBQWtCLENBQUMsT0FBaUIsRUFBRSxTQUFpQjtRQUNyRCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsc0JBQXNCLENBQUM7WUFDcEMsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUM7WUFDckMsU0FBUyxFQUFFLFNBQVM7WUFDcEIsT0FBTyxFQUFFLE9BQU87WUFDaEIsTUFBTSxFQUFFLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDO1NBQ3BELENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxlQUFlLENBQUMsUUFBYztRQUM1QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BELElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDakMsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7Z0JBQ25CLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtnQkFDbkIsY0FBYyxFQUFFLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQ3hGLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCx5QkFBeUIsQ0FBQyxTQUFlO1FBQ3ZDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksVUFBVSxHQUFHLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNuRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sSUFBSSxhQUFhLENBQ25CLCtCQUErQixTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLCtCQUErQixTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JILENBQUM7UUFDSCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxTQUFlO1FBQ2xDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxJQUFJLGFBQWEsQ0FDbkIsMkJBQTJCLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsK0JBQStCLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUcsQ0FBQztRQUNILENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFFRCx1QkFBdUIsQ0FBQyxVQUEyQixFQUMzQixZQUFtQjtRQUN6QyxJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzdGLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDdEIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUM7WUFDeEIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ25CLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztZQUNuQixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksS0FBSyxHQUF1QixJQUFJLENBQUM7WUFDckMsSUFBSSxTQUFTLEdBQTJCLElBQUksQ0FBQztZQUM3QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDakIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxLQUFNO3FCQUNULE9BQU8sQ0FBQyxDQUFDLFVBQVU7b0JBQ2xCLEVBQUUsQ0FBQyxDQUFDLFVBQVUsWUFBWSxZQUFZLENBQUMsQ0FBQyxDQUFDO3dCQUN2QyxNQUFNLEdBQUcsSUFBSSxDQUFDO29CQUNoQixDQUFDO29CQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLFlBQVksWUFBWSxDQUFDLENBQUMsQ0FBQzt3QkFDOUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDaEIsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQzt3QkFDbEQsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDcEIsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxZQUFZLGdCQUFnQixDQUFDLENBQUMsQ0FBQzt3QkFDbEQsVUFBVSxHQUFHLElBQUksQ0FBQztvQkFDcEIsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxZQUFZLGlCQUFpQixDQUFDLENBQUMsQ0FBQzt3QkFDbkQsV0FBVyxHQUFHLElBQUksQ0FBQzt3QkFDbkIsS0FBSyxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUM7b0JBQ25DLENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsWUFBWSxhQUFhLENBQUMsQ0FBQyxDQUFDO3dCQUMvQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDM0IsU0FBUyxHQUFHLFVBQVUsQ0FBQzt3QkFDekIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDTixLQUFLLEdBQUcsVUFBVSxDQUFDO3dCQUNyQixDQUFDO29CQUNILENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFVBQVUsWUFBWSxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUNoRCxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQztvQkFDM0IsQ0FBQztvQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JELEtBQUssR0FBRyxVQUFVLENBQUM7b0JBQ3JCLENBQUM7Z0JBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDVCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNoQixDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNkLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsMkJBQTJCLENBQUM7Z0JBQ3pDLFdBQVcsRUFBRSxXQUFXO2dCQUN4QixNQUFNLEVBQUUsTUFBTTtnQkFDZCxNQUFNLEVBQUUsTUFBTTtnQkFDZCxVQUFVLEVBQUUsVUFBVTtnQkFDdEIsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJO2dCQUNuRSxTQUFTLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsSUFBSTtnQkFDL0UsS0FBSyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7YUFDcEMsQ0FBQyxDQUFDO1FBRUwsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsS0FBVTtRQUN6QixLQUFLLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsSUFBSSxZQUFZLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUMsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixZQUFZLEdBQUcsSUFBSSxHQUFHLENBQUMsb0JBQW9CLENBQUM7Z0JBQzFDLFVBQVUsRUFBRSxJQUFJLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQztvQkFDNUMsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUM7b0JBQ25DLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxLQUFLLENBQUM7aUJBQ3RDLENBQUM7YUFDSCxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLFlBQVksQ0FBQztJQUN0QixDQUFDO0lBRUQsb0JBQW9CLENBQUMsU0FBZ0I7UUFFbkMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRO1lBQzVCLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdDLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxZQUFZLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNOLE1BQU0sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxRQUFrQjtRQUNwQyxJQUFJLFdBQVcsQ0FBQztRQUNoQixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxXQUFXLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZGLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUMsV0FBVyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLHVCQUF1QixDQUFDO1lBQ3JDLEtBQUssRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM1QyxRQUFRLEVBQ0osU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQy9FLElBQUk7WUFDWixRQUFRLEVBQUUscUJBQXFCLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztZQUNsRCxVQUFVLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUNuQixtQkFBbUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2pFLElBQUk7WUFDcEIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUM7Z0JBQzNDLElBQUk7WUFDbkQsSUFBSSxFQUFFLFdBQVc7WUFDakIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxLQUFLO1NBQ3RCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrQkFBa0IsQ0FBQyxPQUE0QyxFQUM1QyxXQUFvQjtRQUNyQyxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDeEIsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxZQUFZO1lBQ3BELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxXQUFXLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDdEMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDbEUsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLGNBQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsQ0FBcUIsRUFBRSxZQUFvQjtRQUMxRCxJQUFJLFNBQVMsQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7WUFDeEIsU0FBUyxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMzRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztZQUNsQyxTQUFTLEVBQUUsU0FBUztZQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEtBQUs7WUFDZCxXQUFXLEVBQUUsQ0FBQyxDQUFDLFdBQVc7WUFDMUIsWUFBWSxFQUFFLFlBQVk7WUFDMUIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJO1NBQy9ELENBQUMsQ0FBQztJQUNMLENBQUM7QUFDSCxDQUFDO0FBelREO0lBQUMsVUFBVSxFQUFFO2VBVUUsUUFBUSxFQUFFO2VBQUUsTUFBTSxDQUFDLG1CQUFtQixDQUFDO2VBQ3ZDLFFBQVEsRUFBRTtlQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUM7OzJCQVhwQztBQTJUYiwyQkFBMkIsSUFBa0IsRUFBRSxrQkFBeUI7SUFDdEUsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxZQUFZLENBQUMsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFRCxzQkFBc0IsSUFBa0IsRUFBRSxhQUFvQjtJQUM1RCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdCLFlBQVksQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELHNCQUFzQixJQUFXLEVBQUUsR0FBd0I7SUFDekQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDckMsSUFBSSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQixZQUFZLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQsc0JBQXNCLEtBQVU7SUFDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO0FBQ3hGLENBQUM7QUFFRCxxQkFBcUIsS0FBVTtJQUM3QixNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxZQUFZLElBQUksQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFFRCw2QkFBNkIsS0FBVTtJQUNyQyxNQUFNLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDeEQsQ0FBQztBQUdELDZCQUE2QixTQUEwQixFQUFFLElBQVMsRUFDckMsV0FBaUM7SUFDNUQsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLFFBQVEsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDO1FBQ3BDLElBQUksTUFBTSxHQUFHLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNwQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFFBQVE7WUFDUixXQUFXLFFBQVEsR0FBRyxhQUFhLEVBQUUsQ0FBQztJQUN4RixDQUFDO0lBRUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsQ0FBQztBQUVELDJEQUEyRDtBQUMzRCwrQkFBK0IsS0FBVTtJQUN2QyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLHNCQUFzQixFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVELHFDQUFxQyxnQkFBZ0I7SUFDbkQsVUFBVSxDQUFDLEtBQVUsRUFBRSxPQUFZO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLHlCQUF5QixDQUNwQyxFQUFDLElBQUksRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQztRQUNwRSxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFBQyxPQUFPLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7cmVzb2x2ZUZvcndhcmRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIFR5cGUsXG4gIGlzQmxhbmssXG4gIGlzUHJlc2VudCxcbiAgaXNBcnJheSxcbiAgc3RyaW5naWZ5LFxuICBpc1N0cmluZyxcbiAgaXNTdHJpbmdNYXAsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFN0cmluZ1dyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCAqIGFzIGNwbCBmcm9tICcuL2NvbXBpbGVfbWV0YWRhdGEnO1xuaW1wb3J0ICogYXMgbWQgZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQgKiBhcyBkaW1kIGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXJ9IGZyb20gJy4vZGlyZWN0aXZlX3Jlc29sdmVyJztcbmltcG9ydCB7UGlwZVJlc29sdmVyfSBmcm9tICcuL3BpcGVfcmVzb2x2ZXInO1xuaW1wb3J0IHtWaWV3UmVzb2x2ZXJ9IGZyb20gJy4vdmlld19yZXNvbHZlcic7XG5pbXBvcnQge1ZpZXdNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4vZGlyZWN0aXZlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtMaWZlY3ljbGVIb29rcywgTElGRUNZQ0xFX0hPT0tTX1ZBTFVFU30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wdGlvbmFsfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1BMQVRGT1JNX0RJUkVDVElWRVMsIFBMQVRGT1JNX1BJUEVTfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9wbGF0Zm9ybV9kaXJlY3RpdmVzX2FuZF9waXBlcyc7XG5pbXBvcnQge01PRFVMRV9TVUZGSVgsIHNhbml0aXplSWRlbnRpZmllciwgVmFsdWVUcmFuc2Zvcm1lciwgdmlzaXRWYWx1ZX0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7YXNzZXJ0QXJyYXlPZlN0cmluZ3N9IGZyb20gJy4vYXNzZXJ0aW9ucyc7XG5pbXBvcnQge2dldFVybFNjaGVtZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3VybF9yZXNvbHZlcic7XG5pbXBvcnQge1Byb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5pbXBvcnQge1xuICBPcHRpb25hbE1ldGFkYXRhLFxuICBTZWxmTWV0YWRhdGEsXG4gIEhvc3RNZXRhZGF0YSxcbiAgU2tpcFNlbGZNZXRhZGF0YSxcbiAgSW5qZWN0TWV0YWRhdGFcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtBdHRyaWJ1dGVNZXRhZGF0YSwgUXVlcnlNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvZGknO1xuaW1wb3J0IHtSZWZsZWN0b3JSZWFkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdG9yX3JlYWRlcic7XG5pbXBvcnQge2lzUHJvdmlkZXJMaXRlcmFsLCBjcmVhdGVQcm92aWRlcn0gZnJvbSAnLi4vY29yZS9kaS9wcm92aWRlcl91dGlsJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENvbXBpbGVNZXRhZGF0YVJlc29sdmVyIHtcbiAgcHJpdmF0ZSBfZGlyZWN0aXZlQ2FjaGUgPSBuZXcgTWFwPFR5cGUsIGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX3BpcGVDYWNoZSA9IG5ldyBNYXA8VHlwZSwgY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGE+KCk7XG4gIHByaXZhdGUgX2Fub255bW91c1R5cGVzID0gbmV3IE1hcDxPYmplY3QsIG51bWJlcj4oKTtcbiAgcHJpdmF0ZSBfYW5vbnltb3VzVHlwZUluZGV4ID0gMDtcbiAgcHJpdmF0ZSBfcmVmbGVjdG9yOiBSZWZsZWN0b3JSZWFkZXI7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZGlyZWN0aXZlUmVzb2x2ZXI6IERpcmVjdGl2ZVJlc29sdmVyLCBwcml2YXRlIF9waXBlUmVzb2x2ZXI6IFBpcGVSZXNvbHZlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdmlld1Jlc29sdmVyOiBWaWV3UmVzb2x2ZXIsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fRElSRUNUSVZFUykgcHJpdmF0ZSBfcGxhdGZvcm1EaXJlY3RpdmVzOiBUeXBlW10sXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoUExBVEZPUk1fUElQRVMpIHByaXZhdGUgX3BsYXRmb3JtUGlwZXM6IFR5cGVbXSxcbiAgICAgICAgICAgICAgX3JlZmxlY3Rvcj86IFJlZmxlY3RvclJlYWRlcikge1xuICAgIGlmIChpc1ByZXNlbnQoX3JlZmxlY3RvcikpIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IF9yZWZsZWN0b3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3JlZmxlY3RvciA9IHJlZmxlY3RvcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNhbml0aXplVG9rZW5OYW1lKHRva2VuOiBhbnkpOiBzdHJpbmcge1xuICAgIGxldCBpZGVudGlmaWVyID0gc3RyaW5naWZ5KHRva2VuKTtcbiAgICBpZiAoaWRlbnRpZmllci5pbmRleE9mKCcoJykgPj0gMCkge1xuICAgICAgLy8gY2FzZTogYW5vbnltb3VzIGZ1bmN0aW9ucyFcbiAgICAgIGxldCBmb3VuZCA9IHRoaXMuX2Fub255bW91c1R5cGVzLmdldCh0b2tlbik7XG4gICAgICBpZiAoaXNCbGFuayhmb3VuZCkpIHtcbiAgICAgICAgdGhpcy5fYW5vbnltb3VzVHlwZXMuc2V0KHRva2VuLCB0aGlzLl9hbm9ueW1vdXNUeXBlSW5kZXgrKyk7XG4gICAgICAgIGZvdW5kID0gdGhpcy5fYW5vbnltb3VzVHlwZXMuZ2V0KHRva2VuKTtcbiAgICAgIH1cbiAgICAgIGlkZW50aWZpZXIgPSBgYW5vbnltb3VzX3Rva2VuXyR7Zm91bmR9X2A7XG4gICAgfVxuICAgIHJldHVybiBzYW5pdGl6ZUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gIH1cblxuICBnZXREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlOiBUeXBlKTogY3BsLkNvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGEgPSB0aGlzLl9kaXJlY3RpdmVDYWNoZS5nZXQoZGlyZWN0aXZlVHlwZSk7XG4gICAgaWYgKGlzQmxhbmsobWV0YSkpIHtcbiAgICAgIHZhciBkaXJNZXRhID0gdGhpcy5fZGlyZWN0aXZlUmVzb2x2ZXIucmVzb2x2ZShkaXJlY3RpdmVUeXBlKTtcbiAgICAgIHZhciB0ZW1wbGF0ZU1ldGEgPSBudWxsO1xuICAgICAgdmFyIGNoYW5nZURldGVjdGlvblN0cmF0ZWd5ID0gbnVsbDtcbiAgICAgIHZhciB2aWV3UHJvdmlkZXJzID0gW107XG5cbiAgICAgIGlmIChkaXJNZXRhIGluc3RhbmNlb2YgbWQuQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgYXNzZXJ0QXJyYXlPZlN0cmluZ3MoJ3N0eWxlcycsIGRpck1ldGEuc3R5bGVzKTtcbiAgICAgICAgdmFyIGNtcE1ldGEgPSA8bWQuQ29tcG9uZW50TWV0YWRhdGE+ZGlyTWV0YTtcbiAgICAgICAgdmFyIHZpZXdNZXRhID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoZGlyZWN0aXZlVHlwZSk7XG4gICAgICAgIGFzc2VydEFycmF5T2ZTdHJpbmdzKCdzdHlsZXMnLCB2aWV3TWV0YS5zdHlsZXMpO1xuICAgICAgICB0ZW1wbGF0ZU1ldGEgPSBuZXcgY3BsLkNvbXBpbGVUZW1wbGF0ZU1ldGFkYXRhKHtcbiAgICAgICAgICBlbmNhcHN1bGF0aW9uOiB2aWV3TWV0YS5lbmNhcHN1bGF0aW9uLFxuICAgICAgICAgIHRlbXBsYXRlOiB2aWV3TWV0YS50ZW1wbGF0ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogdmlld01ldGEudGVtcGxhdGVVcmwsXG4gICAgICAgICAgc3R5bGVzOiB2aWV3TWV0YS5zdHlsZXMsXG4gICAgICAgICAgc3R5bGVVcmxzOiB2aWV3TWV0YS5zdHlsZVVybHMsXG4gICAgICAgICAgYmFzZVVybDogY2FsY1RlbXBsYXRlQmFzZVVybCh0aGlzLl9yZWZsZWN0b3IsIGRpcmVjdGl2ZVR5cGUsIGNtcE1ldGEpXG4gICAgICAgIH0pO1xuICAgICAgICBjaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSA9IGNtcE1ldGEuY2hhbmdlRGV0ZWN0aW9uO1xuICAgICAgICBpZiAoaXNQcmVzZW50KGRpck1ldGEudmlld1Byb3ZpZGVycykpIHtcbiAgICAgICAgICB2aWV3UHJvdmlkZXJzID0gdGhpcy5nZXRQcm92aWRlcnNNZXRhZGF0YShkaXJNZXRhLnZpZXdQcm92aWRlcnMpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm92aWRlcnMgPSBbXTtcbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyTWV0YS5wcm92aWRlcnMpKSB7XG4gICAgICAgIHByb3ZpZGVycyA9IHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEoZGlyTWV0YS5wcm92aWRlcnMpO1xuICAgICAgfVxuICAgICAgdmFyIHF1ZXJpZXMgPSBbXTtcbiAgICAgIHZhciB2aWV3UXVlcmllcyA9IFtdO1xuICAgICAgaWYgKGlzUHJlc2VudChkaXJNZXRhLnF1ZXJpZXMpKSB7XG4gICAgICAgIHF1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIGZhbHNlKTtcbiAgICAgICAgdmlld1F1ZXJpZXMgPSB0aGlzLmdldFF1ZXJpZXNNZXRhZGF0YShkaXJNZXRhLnF1ZXJpZXMsIHRydWUpO1xuICAgICAgfVxuICAgICAgbWV0YSA9IGNwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGEuY3JlYXRlKHtcbiAgICAgICAgc2VsZWN0b3I6IGRpck1ldGEuc2VsZWN0b3IsXG4gICAgICAgIGV4cG9ydEFzOiBkaXJNZXRhLmV4cG9ydEFzLFxuICAgICAgICBpc0NvbXBvbmVudDogaXNQcmVzZW50KHRlbXBsYXRlTWV0YSksXG4gICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKGRpcmVjdGl2ZVR5cGUsIHN0YXRpY1R5cGVNb2R1bGVVcmwoZGlyZWN0aXZlVHlwZSkpLFxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGVNZXRhLFxuICAgICAgICBjaGFuZ2VEZXRlY3Rpb246IGNoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgICAgICBpbnB1dHM6IGRpck1ldGEuaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBkaXJNZXRhLm91dHB1dHMsXG4gICAgICAgIGhvc3Q6IGRpck1ldGEuaG9zdCxcbiAgICAgICAgbGlmZWN5Y2xlSG9va3M6XG4gICAgICAgICAgICBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgZGlyZWN0aXZlVHlwZSkpLFxuICAgICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgICAgdmlld1Byb3ZpZGVyczogdmlld1Byb3ZpZGVycyxcbiAgICAgICAgcXVlcmllczogcXVlcmllcyxcbiAgICAgICAgdmlld1F1ZXJpZXM6IHZpZXdRdWVyaWVzXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2RpcmVjdGl2ZUNhY2hlLnNldChkaXJlY3RpdmVUeXBlLCBtZXRhKTtcbiAgICB9XG4gICAgcmV0dXJuIG1ldGE7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHNvbWVUeXBlIGEgc3ltYm9sIHdoaWNoIG1heSBvciBtYXkgbm90IGJlIGEgZGlyZWN0aXZlIHR5cGVcbiAgICogQHJldHVybnMge2NwbC5Db21waWxlRGlyZWN0aXZlTWV0YWRhdGF9IGlmIHBvc3NpYmxlLCBvdGhlcndpc2UgbnVsbC5cbiAgICovXG4gIG1heWJlR2V0RGlyZWN0aXZlTWV0YWRhdGEoc29tZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0RGlyZWN0aXZlTWV0YWRhdGEoc29tZVR5cGUpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlLm1lc3NhZ2UuaW5kZXhPZignTm8gRGlyZWN0aXZlIGFubm90YXRpb24nKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIGdldFR5cGVNZXRhZGF0YSh0eXBlOiBUeXBlLCBtb2R1bGVVcmw6IHN0cmluZyk6IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhIHtcbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlVHlwZU1ldGFkYXRhKHtcbiAgICAgIG5hbWU6IHRoaXMuc2FuaXRpemVUb2tlbk5hbWUodHlwZSksXG4gICAgICBtb2R1bGVVcmw6IG1vZHVsZVVybCxcbiAgICAgIHJ1bnRpbWU6IHR5cGUsXG4gICAgICBkaURlcHM6IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEodHlwZSwgbnVsbClcbiAgICB9KTtcbiAgfVxuXG4gIGdldEZhY3RvcnlNZXRhZGF0YShmYWN0b3J5OiBGdW5jdGlvbiwgbW9kdWxlVXJsOiBzdHJpbmcpOiBjcGwuQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZUZhY3RvcnlNZXRhZGF0YSh7XG4gICAgICBuYW1lOiB0aGlzLnNhbml0aXplVG9rZW5OYW1lKGZhY3RvcnkpLFxuICAgICAgbW9kdWxlVXJsOiBtb2R1bGVVcmwsXG4gICAgICBydW50aW1lOiBmYWN0b3J5LFxuICAgICAgZGlEZXBzOiB0aGlzLmdldERlcGVuZGVuY2llc01ldGFkYXRhKGZhY3RvcnksIG51bGwpXG4gICAgfSk7XG4gIH1cblxuICBnZXRQaXBlTWV0YWRhdGEocGlwZVR5cGU6IFR5cGUpOiBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSB7XG4gICAgdmFyIG1ldGEgPSB0aGlzLl9waXBlQ2FjaGUuZ2V0KHBpcGVUeXBlKTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgdmFyIHBpcGVNZXRhID0gdGhpcy5fcGlwZVJlc29sdmVyLnJlc29sdmUocGlwZVR5cGUpO1xuICAgICAgbWV0YSA9IG5ldyBjcGwuQ29tcGlsZVBpcGVNZXRhZGF0YSh7XG4gICAgICAgIHR5cGU6IHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHBpcGVUeXBlLCBzdGF0aWNUeXBlTW9kdWxlVXJsKHBpcGVUeXBlKSksXG4gICAgICAgIG5hbWU6IHBpcGVNZXRhLm5hbWUsXG4gICAgICAgIHB1cmU6IHBpcGVNZXRhLnB1cmUsXG4gICAgICAgIGxpZmVjeWNsZUhvb2tzOiBMSUZFQ1lDTEVfSE9PS1NfVkFMVUVTLmZpbHRlcihob29rID0+IGhhc0xpZmVjeWNsZUhvb2soaG9vaywgcGlwZVR5cGUpKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fcGlwZUNhY2hlLnNldChwaXBlVHlwZSwgbWV0YSk7XG4gICAgfVxuICAgIHJldHVybiBtZXRhO1xuICB9XG5cbiAgZ2V0Vmlld0RpcmVjdGl2ZXNNZXRhZGF0YShjb21wb25lbnQ6IFR5cGUpOiBjcGwuQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhW10ge1xuICAgIHZhciB2aWV3ID0gdGhpcy5fdmlld1Jlc29sdmVyLnJlc29sdmUoY29tcG9uZW50KTtcbiAgICB2YXIgZGlyZWN0aXZlcyA9IGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXcsIHRoaXMuX3BsYXRmb3JtRGlyZWN0aXZlcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKGRpcmVjdGl2ZXNbaV0pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFVuZXhwZWN0ZWQgZGlyZWN0aXZlIHZhbHVlICcke3N0cmluZ2lmeShkaXJlY3RpdmVzW2ldKX0nIG9uIHRoZSBWaWV3IG9mIGNvbXBvbmVudCAnJHtzdHJpbmdpZnkoY29tcG9uZW50KX0nYCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkaXJlY3RpdmVzLm1hcCh0eXBlID0+IHRoaXMuZ2V0RGlyZWN0aXZlTWV0YWRhdGEodHlwZSkpO1xuICB9XG5cbiAgZ2V0Vmlld1BpcGVzTWV0YWRhdGEoY29tcG9uZW50OiBUeXBlKTogY3BsLkNvbXBpbGVQaXBlTWV0YWRhdGFbXSB7XG4gICAgdmFyIHZpZXcgPSB0aGlzLl92aWV3UmVzb2x2ZXIucmVzb2x2ZShjb21wb25lbnQpO1xuICAgIHZhciBwaXBlcyA9IGZsYXR0ZW5QaXBlcyh2aWV3LCB0aGlzLl9wbGF0Zm9ybVBpcGVzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBpcGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIWlzVmFsaWRUeXBlKHBpcGVzW2ldKSkge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBVbmV4cGVjdGVkIHBpcGVkIHZhbHVlICcke3N0cmluZ2lmeShwaXBlc1tpXSl9JyBvbiB0aGUgVmlldyBvZiBjb21wb25lbnQgJyR7c3RyaW5naWZ5KGNvbXBvbmVudCl9J2ApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcGlwZXMubWFwKHR5cGUgPT4gdGhpcy5nZXRQaXBlTWV0YWRhdGEodHlwZSkpO1xuICB9XG5cbiAgZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEodHlwZU9yRnVuYzogVHlwZSB8IEZ1bmN0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBkZXBlbmRlbmNpZXM6IGFueVtdKTogY3BsLkNvbXBpbGVEaURlcGVuZGVuY3lNZXRhZGF0YVtdIHtcbiAgICBsZXQgcGFyYW1zID0gaXNQcmVzZW50KGRlcGVuZGVuY2llcykgPyBkZXBlbmRlbmNpZXMgOiB0aGlzLl9yZWZsZWN0b3IucGFyYW1ldGVycyh0eXBlT3JGdW5jKTtcbiAgICBpZiAoaXNCbGFuayhwYXJhbXMpKSB7XG4gICAgICBwYXJhbXMgPSBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcy5tYXAoKHBhcmFtKSA9PiB7XG4gICAgICBpZiAoaXNCbGFuayhwYXJhbSkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBsZXQgaXNBdHRyaWJ1dGUgPSBmYWxzZTtcbiAgICAgIGxldCBpc0hvc3QgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NlbGYgPSBmYWxzZTtcbiAgICAgIGxldCBpc1NraXBTZWxmID0gZmFsc2U7XG4gICAgICBsZXQgaXNPcHRpb25hbCA9IGZhbHNlO1xuICAgICAgbGV0IHF1ZXJ5OiBkaW1kLlF1ZXJ5TWV0YWRhdGEgPSBudWxsO1xuICAgICAgbGV0IHZpZXdRdWVyeTogZGltZC5WaWV3UXVlcnlNZXRhZGF0YSA9IG51bGw7XG4gICAgICB2YXIgdG9rZW4gPSBudWxsO1xuICAgICAgaWYgKGlzQXJyYXkocGFyYW0pKSB7XG4gICAgICAgICg8YW55W10+cGFyYW0pXG4gICAgICAgICAgICAuZm9yRWFjaCgocGFyYW1FbnRyeSkgPT4ge1xuICAgICAgICAgICAgICBpZiAocGFyYW1FbnRyeSBpbnN0YW5jZW9mIEhvc3RNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlzSG9zdCA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1FbnRyeSBpbnN0YW5jZW9mIFNlbGZNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlzU2VsZiA9IHRydWU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAocGFyYW1FbnRyeSBpbnN0YW5jZW9mIFNraXBTZWxmTWV0YWRhdGEpIHtcbiAgICAgICAgICAgICAgICBpc1NraXBTZWxmID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbUVudHJ5IGluc3RhbmNlb2YgT3B0aW9uYWxNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlzT3B0aW9uYWwgPSB0cnVlO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtRW50cnkgaW5zdGFuY2VvZiBBdHRyaWJ1dGVNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlzQXR0cmlidXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0b2tlbiA9IHBhcmFtRW50cnkuYXR0cmlidXRlTmFtZTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChwYXJhbUVudHJ5IGluc3RhbmNlb2YgUXVlcnlNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJhbUVudHJ5LmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgICB2aWV3UXVlcnkgPSBwYXJhbUVudHJ5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBxdWVyeSA9IHBhcmFtRW50cnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHBhcmFtRW50cnkgaW5zdGFuY2VvZiBJbmplY3RNZXRhZGF0YSkge1xuICAgICAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeS50b2tlbjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1ZhbGlkVHlwZShwYXJhbUVudHJ5KSAmJiBpc0JsYW5rKHRva2VuKSkge1xuICAgICAgICAgICAgICAgIHRva2VuID0gcGFyYW1FbnRyeTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0b2tlbiA9IHBhcmFtO1xuICAgICAgfVxuICAgICAgaWYgKGlzQmxhbmsodG9rZW4pKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZURpRGVwZW5kZW5jeU1ldGFkYXRhKHtcbiAgICAgICAgaXNBdHRyaWJ1dGU6IGlzQXR0cmlidXRlLFxuICAgICAgICBpc0hvc3Q6IGlzSG9zdCxcbiAgICAgICAgaXNTZWxmOiBpc1NlbGYsXG4gICAgICAgIGlzU2tpcFNlbGY6IGlzU2tpcFNlbGYsXG4gICAgICAgIGlzT3B0aW9uYWw6IGlzT3B0aW9uYWwsXG4gICAgICAgIHF1ZXJ5OiBpc1ByZXNlbnQocXVlcnkpID8gdGhpcy5nZXRRdWVyeU1ldGFkYXRhKHF1ZXJ5LCBudWxsKSA6IG51bGwsXG4gICAgICAgIHZpZXdRdWVyeTogaXNQcmVzZW50KHZpZXdRdWVyeSkgPyB0aGlzLmdldFF1ZXJ5TWV0YWRhdGEodmlld1F1ZXJ5LCBudWxsKSA6IG51bGwsXG4gICAgICAgIHRva2VuOiB0aGlzLmdldFRva2VuTWV0YWRhdGEodG9rZW4pXG4gICAgICB9KTtcblxuICAgIH0pO1xuICB9XG5cbiAgZ2V0VG9rZW5NZXRhZGF0YSh0b2tlbjogYW55KTogY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhIHtcbiAgICB0b2tlbiA9IHJlc29sdmVGb3J3YXJkUmVmKHRva2VuKTtcbiAgICB2YXIgY29tcGlsZVRva2VuO1xuICAgIGlmIChpc1N0cmluZyh0b2tlbikpIHtcbiAgICAgIGNvbXBpbGVUb2tlbiA9IG5ldyBjcGwuQ29tcGlsZVRva2VuTWV0YWRhdGEoe3ZhbHVlOiB0b2tlbn0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb21waWxlVG9rZW4gPSBuZXcgY3BsLkNvbXBpbGVUb2tlbk1ldGFkYXRhKHtcbiAgICAgICAgaWRlbnRpZmllcjogbmV3IGNwbC5Db21waWxlSWRlbnRpZmllck1ldGFkYXRhKHtcbiAgICAgICAgICBydW50aW1lOiB0b2tlbixcbiAgICAgICAgICBuYW1lOiB0aGlzLnNhbml0aXplVG9rZW5OYW1lKHRva2VuKSxcbiAgICAgICAgICBtb2R1bGVVcmw6IHN0YXRpY1R5cGVNb2R1bGVVcmwodG9rZW4pXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBpbGVUb2tlbjtcbiAgfVxuXG4gIGdldFByb3ZpZGVyc01ldGFkYXRhKHByb3ZpZGVyczogYW55W10pOlxuICAgICAgQXJyYXk8Y3BsLkNvbXBpbGVQcm92aWRlck1ldGFkYXRhIHwgY3BsLkNvbXBpbGVUeXBlTWV0YWRhdGEgfCBhbnlbXT4ge1xuICAgIHJldHVybiBwcm92aWRlcnMubWFwKChwcm92aWRlcikgPT4ge1xuICAgICAgcHJvdmlkZXIgPSByZXNvbHZlRm9yd2FyZFJlZihwcm92aWRlcik7XG4gICAgICBpZiAoaXNBcnJheShwcm92aWRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJzTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFByb3ZpZGVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFByb3ZpZGVyTWV0YWRhdGEocHJvdmlkZXIpO1xuICAgICAgfSBlbHNlIGlmIChpc1Byb3ZpZGVyTGl0ZXJhbChwcm92aWRlcikpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UHJvdmlkZXJNZXRhZGF0YShjcmVhdGVQcm92aWRlcihwcm92aWRlcikpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VHlwZU1ldGFkYXRhKHByb3ZpZGVyLCBzdGF0aWNUeXBlTW9kdWxlVXJsKHByb3ZpZGVyKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRQcm92aWRlck1ldGFkYXRhKHByb3ZpZGVyOiBQcm92aWRlcik6IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YSB7XG4gICAgdmFyIGNvbXBpbGVEZXBzO1xuICAgIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlQ2xhc3MpKSB7XG4gICAgICBjb21waWxlRGVwcyA9IHRoaXMuZ2V0RGVwZW5kZW5jaWVzTWV0YWRhdGEocHJvdmlkZXIudXNlQ2xhc3MsIHByb3ZpZGVyLmRlcGVuZGVuY2llcyk7XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocHJvdmlkZXIudXNlRmFjdG9yeSkpIHtcbiAgICAgIGNvbXBpbGVEZXBzID0gdGhpcy5nZXREZXBlbmRlbmNpZXNNZXRhZGF0YShwcm92aWRlci51c2VGYWN0b3J5LCBwcm92aWRlci5kZXBlbmRlbmNpZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGNwbC5Db21waWxlUHJvdmlkZXJNZXRhZGF0YSh7XG4gICAgICB0b2tlbjogdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHByb3ZpZGVyLnRva2VuKSxcbiAgICAgIHVzZUNsYXNzOlxuICAgICAgICAgIGlzUHJlc2VudChwcm92aWRlci51c2VDbGFzcykgP1xuICAgICAgICAgICAgICB0aGlzLmdldFR5cGVNZXRhZGF0YShwcm92aWRlci51c2VDbGFzcywgc3RhdGljVHlwZU1vZHVsZVVybChwcm92aWRlci51c2VDbGFzcykpIDpcbiAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIHVzZVZhbHVlOiBjb252ZXJ0VG9Db21waWxlVmFsdWUocHJvdmlkZXIudXNlVmFsdWUpLFxuICAgICAgdXNlRmFjdG9yeTogaXNQcmVzZW50KHByb3ZpZGVyLnVzZUZhY3RvcnkpID9cbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdldEZhY3RvcnlNZXRhZGF0YShwcm92aWRlci51c2VGYWN0b3J5LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRpY1R5cGVNb2R1bGVVcmwocHJvdmlkZXIudXNlRmFjdG9yeSkpIDpcbiAgICAgICAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgdXNlRXhpc3Rpbmc6IGlzUHJlc2VudChwcm92aWRlci51c2VFeGlzdGluZykgPyB0aGlzLmdldFRva2VuTWV0YWRhdGEocHJvdmlkZXIudXNlRXhpc3RpbmcpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIGRlcHM6IGNvbXBpbGVEZXBzLFxuICAgICAgbXVsdGk6IHByb3ZpZGVyLm11bHRpXG4gICAgfSk7XG4gIH1cblxuICBnZXRRdWVyaWVzTWV0YWRhdGEocXVlcmllczoge1trZXk6IHN0cmluZ106IGRpbWQuUXVlcnlNZXRhZGF0YX0sXG4gICAgICAgICAgICAgICAgICAgICBpc1ZpZXdRdWVyeTogYm9vbGVhbik6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YVtdIHtcbiAgICB2YXIgY29tcGlsZVF1ZXJpZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocXVlcmllcywgKHF1ZXJ5LCBwcm9wZXJ0eU5hbWUpID0+IHtcbiAgICAgIGlmIChxdWVyeS5pc1ZpZXdRdWVyeSA9PT0gaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgY29tcGlsZVF1ZXJpZXMucHVzaCh0aGlzLmdldFF1ZXJ5TWV0YWRhdGEocXVlcnksIHByb3BlcnR5TmFtZSkpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjb21waWxlUXVlcmllcztcbiAgfVxuXG4gIGdldFF1ZXJ5TWV0YWRhdGEocTogZGltZC5RdWVyeU1ldGFkYXRhLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IGNwbC5Db21waWxlUXVlcnlNZXRhZGF0YSB7XG4gICAgdmFyIHNlbGVjdG9ycztcbiAgICBpZiAocS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgc2VsZWN0b3JzID0gcS52YXJCaW5kaW5ncy5tYXAodmFyTmFtZSA9PiB0aGlzLmdldFRva2VuTWV0YWRhdGEodmFyTmFtZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RvcnMgPSBbdGhpcy5nZXRUb2tlbk1ldGFkYXRhKHEuc2VsZWN0b3IpXTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZVF1ZXJ5TWV0YWRhdGEoe1xuICAgICAgc2VsZWN0b3JzOiBzZWxlY3RvcnMsXG4gICAgICBmaXJzdDogcS5maXJzdCxcbiAgICAgIGRlc2NlbmRhbnRzOiBxLmRlc2NlbmRhbnRzLFxuICAgICAgcHJvcGVydHlOYW1lOiBwcm9wZXJ0eU5hbWUsXG4gICAgICByZWFkOiBpc1ByZXNlbnQocS5yZWFkKSA/IHRoaXMuZ2V0VG9rZW5NZXRhZGF0YShxLnJlYWQpIDogbnVsbFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5EaXJlY3RpdmVzKHZpZXc6IFZpZXdNZXRhZGF0YSwgcGxhdGZvcm1EaXJlY3RpdmVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBkaXJlY3RpdmVzID0gW107XG4gIGlmIChpc1ByZXNlbnQocGxhdGZvcm1EaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheShwbGF0Zm9ybURpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIGlmIChpc1ByZXNlbnQodmlldy5kaXJlY3RpdmVzKSkge1xuICAgIGZsYXR0ZW5BcnJheSh2aWV3LmRpcmVjdGl2ZXMsIGRpcmVjdGl2ZXMpO1xuICB9XG4gIHJldHVybiBkaXJlY3RpdmVzO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuUGlwZXModmlldzogVmlld01ldGFkYXRhLCBwbGF0Zm9ybVBpcGVzOiBhbnlbXSk6IFR5cGVbXSB7XG4gIGxldCBwaXBlcyA9IFtdO1xuICBpZiAoaXNQcmVzZW50KHBsYXRmb3JtUGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHBsYXRmb3JtUGlwZXMsIHBpcGVzKTtcbiAgfVxuICBpZiAoaXNQcmVzZW50KHZpZXcucGlwZXMpKSB7XG4gICAgZmxhdHRlbkFycmF5KHZpZXcucGlwZXMsIHBpcGVzKTtcbiAgfVxuICByZXR1cm4gcGlwZXM7XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW5BcnJheSh0cmVlOiBhbnlbXSwgb3V0OiBBcnJheTxUeXBlIHwgYW55W10+KTogdm9pZCB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdHJlZS5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gcmVzb2x2ZUZvcndhcmRSZWYodHJlZVtpXSk7XG4gICAgaWYgKGlzQXJyYXkoaXRlbSkpIHtcbiAgICAgIGZsYXR0ZW5BcnJheShpdGVtLCBvdXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBvdXQucHVzaChpdGVtKTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNTdGF0aWNUeXBlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzU3RyaW5nTWFwKHZhbHVlKSAmJiBpc1ByZXNlbnQodmFsdWVbJ25hbWUnXSkgJiYgaXNQcmVzZW50KHZhbHVlWydtb2R1bGVJZCddKTtcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFR5cGUodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNTdGF0aWNUeXBlKHZhbHVlKSB8fCAodmFsdWUgaW5zdGFuY2VvZiBUeXBlKTtcbn1cblxuZnVuY3Rpb24gc3RhdGljVHlwZU1vZHVsZVVybCh2YWx1ZTogYW55KTogc3RyaW5nIHtcbiAgcmV0dXJuIGlzU3RhdGljVHlwZSh2YWx1ZSkgPyB2YWx1ZVsnbW9kdWxlSWQnXSA6IG51bGw7XG59XG5cblxuZnVuY3Rpb24gY2FsY1RlbXBsYXRlQmFzZVVybChyZWZsZWN0b3I6IFJlZmxlY3RvclJlYWRlciwgdHlwZTogYW55LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXBNZXRhZGF0YTogbWQuQ29tcG9uZW50TWV0YWRhdGEpOiBzdHJpbmcge1xuICBpZiAoaXNTdGF0aWNUeXBlKHR5cGUpKSB7XG4gICAgcmV0dXJuIHR5cGVbJ2ZpbGVQYXRoJ107XG4gIH1cblxuICBpZiAoaXNQcmVzZW50KGNtcE1ldGFkYXRhLm1vZHVsZUlkKSkge1xuICAgIHZhciBtb2R1bGVJZCA9IGNtcE1ldGFkYXRhLm1vZHVsZUlkO1xuICAgIHZhciBzY2hlbWUgPSBnZXRVcmxTY2hlbWUobW9kdWxlSWQpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoc2NoZW1lKSAmJiBzY2hlbWUubGVuZ3RoID4gMCA/IG1vZHVsZUlkIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgcGFja2FnZToke21vZHVsZUlkfSR7TU9EVUxFX1NVRkZJWH1gO1xuICB9XG5cbiAgcmV0dXJuIHJlZmxlY3Rvci5pbXBvcnRVcmkodHlwZSk7XG59XG5cbi8vIE9ubHkgZmlsbCBDb21waWxlSWRlbnRpZmllck1ldGFkYXRhLnJ1bnRpbWUgaWYgbmVlZGVkLi4uXG5mdW5jdGlvbiBjb252ZXJ0VG9Db21waWxlVmFsdWUodmFsdWU6IGFueSk6IGFueSB7XG4gIHJldHVybiB2aXNpdFZhbHVlKHZhbHVlLCBuZXcgX0NvbXBpbGVWYWx1ZUNvbnZlcnRlcigpLCBudWxsKTtcbn1cblxuY2xhc3MgX0NvbXBpbGVWYWx1ZUNvbnZlcnRlciBleHRlbmRzIFZhbHVlVHJhbnNmb3JtZXIge1xuICB2aXNpdE90aGVyKHZhbHVlOiBhbnksIGNvbnRleHQ6IGFueSk6IGFueSB7XG4gICAgaWYgKGlzU3RhdGljVHlwZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBuZXcgY3BsLkNvbXBpbGVJZGVudGlmaWVyTWV0YWRhdGEoXG4gICAgICAgICAge25hbWU6IHZhbHVlWyduYW1lJ10sIG1vZHVsZVVybDogc3RhdGljVHlwZU1vZHVsZVVybCh2YWx1ZSl9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBjcGwuQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7cnVudGltZTogdmFsdWV9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==