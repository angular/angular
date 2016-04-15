import {resolveForwardRef} from 'angular2/src/core/di';
import {
  Type,
  isBlank,
  isPresent,
  isArray,
  stringify,
  isString,
  RegExpWrapper,
  StringWrapper
} from 'angular2/src/facade/lang';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/exceptions';
import {NoAnnotationError} from 'angular2/src/core/di/exceptions';
import * as cpl from './compile_metadata';
import * as md from 'angular2/src/core/metadata/directives';
import * as dimd from 'angular2/src/core/metadata/di';
import {DirectiveResolver} from './directive_resolver';
import {PipeResolver} from './pipe_resolver';
import {ViewResolver} from './view_resolver';
import {ViewMetadata} from 'angular2/src/core/metadata/view';
import {hasLifecycleHook} from './directive_lifecycle_reflector';
import {LifecycleHooks, LIFECYCLE_HOOKS_VALUES} from 'angular2/src/core/metadata/lifecycle_hooks';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Injectable, Inject, Optional} from 'angular2/src/core/di';
import {PLATFORM_DIRECTIVES, PLATFORM_PIPES} from 'angular2/src/core/platform_directives_and_pipes';
import {MODULE_SUFFIX} from './util';
import {assertArrayOfStrings} from './assertions';
import {getUrlScheme} from 'angular2/src/compiler/url_resolver';
import {Provider, constructDependencies, Dependency} from 'angular2/src/core/di/provider';
import {
  OptionalMetadata,
  SelfMetadata,
  HostMetadata,
  SkipSelfMetadata
} from 'angular2/src/core/di/metadata';
import {AttributeMetadata} from 'angular2/src/core/metadata/di';

@Injectable()
export class RuntimeMetadataResolver {
  private _directiveCache = new Map<Type, cpl.CompileDirectiveMetadata>();
  private _pipeCache = new Map<Type, cpl.CompilePipeMetadata>();
  private _anonymousTypes = new Map<Object, number>();
  private _anonymousTypeIndex = 0;

  constructor(private _directiveResolver: DirectiveResolver, private _pipeResolver: PipeResolver,
              private _viewResolver: ViewResolver,
              @Optional() @Inject(PLATFORM_DIRECTIVES) private _platformDirectives: Type[],
              @Optional() @Inject(PLATFORM_PIPES) private _platformPipes: Type[]) {}

  /**
   * Wrap the stringify method to avoid naming things `function (arg1...) {`
   */
  private sanitizeName(obj: any): string {
    let result = StringWrapper.replaceAll(stringify(obj), /[\s-]/g, '_');
    if (result.indexOf('(') < 0) {
      return result;
    }
    let found = this._anonymousTypes.get(obj);
    if (isBlank(found)) {
      this._anonymousTypes.set(obj, this._anonymousTypeIndex++);
      found = this._anonymousTypes.get(obj);
    }
    return `anonymous_type_${found}_`;
  }

  getDirectiveMetadata(directiveType: Type): cpl.CompileDirectiveMetadata {
    var meta = this._directiveCache.get(directiveType);
    if (isBlank(meta)) {
      var dirMeta = this._directiveResolver.resolve(directiveType);
      var moduleUrl = null;
      var templateMeta = null;
      var changeDetectionStrategy = null;
      var viewProviders = [];

      if (dirMeta instanceof md.ComponentMetadata) {
        assertArrayOfStrings('styles', dirMeta.styles);
        var cmpMeta = <md.ComponentMetadata>dirMeta;
        moduleUrl = calcModuleUrl(directiveType, cmpMeta);
        var viewMeta = this._viewResolver.resolve(directiveType);
        assertArrayOfStrings('styles', viewMeta.styles);
        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: viewMeta.encapsulation,
          template: viewMeta.template,
          templateUrl: viewMeta.templateUrl,
          styles: viewMeta.styles,
          styleUrls: viewMeta.styleUrls
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
        type: this.getTypeMetadata(directiveType, moduleUrl),
        template: templateMeta,
        changeDetection: changeDetectionStrategy,
        inputs: dirMeta.inputs,
        outputs: dirMeta.outputs,
        host: dirMeta.host,
        lifecycleHooks:
            LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, directiveType)),
        providers: providers,
        viewProviders: viewProviders,
        queries: queries,
        viewQueries: viewQueries
      });
      this._directiveCache.set(directiveType, meta);
    }
    return meta;
  }

  getTypeMetadata(type: Type, moduleUrl: string): cpl.CompileTypeMetadata {
    return new cpl.CompileTypeMetadata({
      name: this.sanitizeName(type),
      moduleUrl: moduleUrl,
      runtime: type,
      diDeps: this.getDependenciesMetadata(type, null)
    });
  }

  getFactoryMetadata(factory: Function, moduleUrl: string): cpl.CompileFactoryMetadata {
    return new cpl.CompileFactoryMetadata({
      name: this.sanitizeName(factory),
      moduleUrl: moduleUrl,
      runtime: factory,
      diDeps: this.getDependenciesMetadata(factory, null)
    });
  }

  getPipeMetadata(pipeType: Type): cpl.CompilePipeMetadata {
    var meta = this._pipeCache.get(pipeType);
    if (isBlank(meta)) {
      var pipeMeta = this._pipeResolver.resolve(pipeType);
      var moduleUrl = reflector.importUri(pipeType);
      meta = new cpl.CompilePipeMetadata({
        type: this.getTypeMetadata(pipeType, moduleUrl),
        name: pipeMeta.name,
        pure: pipeMeta.pure,
        lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, pipeType)),
      });
      this._pipeCache.set(pipeType, meta);
    }
    return meta;
  }

  getViewDirectivesMetadata(component: Type): cpl.CompileDirectiveMetadata[] {
    var view = this._viewResolver.resolve(component);
    var directives = flattenDirectives(view, this._platformDirectives);
    for (var i = 0; i < directives.length; i++) {
      if (!isValidType(directives[i])) {
        throw new BaseException(
            `Unexpected directive value '${stringify(directives[i])}' on the View of component '${stringify(component)}'`);
      }
    }

    return directives.map(type => this.getDirectiveMetadata(type));
  }

  getViewPipesMetadata(component: Type): cpl.CompilePipeMetadata[] {
    var view = this._viewResolver.resolve(component);
    var pipes = flattenPipes(view, this._platformPipes);
    for (var i = 0; i < pipes.length; i++) {
      if (!isValidType(pipes[i])) {
        throw new BaseException(
            `Unexpected piped value '${stringify(pipes[i])}' on the View of component '${stringify(component)}'`);
      }
    }
    return pipes.map(type => this.getPipeMetadata(type));
  }

  getDependenciesMetadata(typeOrFunc: Type | Function,
                          dependencies: any[]): cpl.CompileDiDependencyMetadata[] {
    var deps: Dependency[];
    try {
      deps = constructDependencies(typeOrFunc, dependencies);
    } catch (e) {
      if (e instanceof NoAnnotationError) {
        deps = [];
      } else {
        throw e;
      }
    }
    return deps.map((dep) => {
      var compileToken;
      var p = <AttributeMetadata>dep.properties.find(p => p instanceof AttributeMetadata);
      var isAttribute = false;
      if (isPresent(p)) {
        compileToken = this.getTokenMetadata(p.attributeName);
        isAttribute = true;
      } else {
        compileToken = this.getTokenMetadata(dep.key.token);
      }
      var compileQuery = null;
      var q = <dimd.QueryMetadata>dep.properties.find(p => p instanceof dimd.QueryMetadata);
      if (isPresent(q)) {
        compileQuery = this.getQueryMetadata(q, null);
      }
      return new cpl.CompileDiDependencyMetadata({
        isAttribute: isAttribute,
        isHost: dep.upperBoundVisibility instanceof HostMetadata,
        isSelf: dep.upperBoundVisibility instanceof SelfMetadata,
        isSkipSelf: dep.lowerBoundVisibility instanceof SkipSelfMetadata,
        isOptional: dep.optional,
        query: isPresent(q) && !q.isViewQuery ? compileQuery : null,
        viewQuery: isPresent(q) && q.isViewQuery ? compileQuery : null,
        token: compileToken
      });
    });
  }

  getRuntimeIdentifier(value: any): cpl.CompileIdentifierMetadata {
    return new cpl.CompileIdentifierMetadata({runtime: value, name: this.sanitizeName(value)});
  }

  getTokenMetadata(token: any): cpl.CompileTokenMetadata {
    token = resolveForwardRef(token);
    var compileToken;
    if (isString(token)) {
      compileToken = new cpl.CompileTokenMetadata({value: token});
    } else {
      compileToken = new cpl.CompileTokenMetadata({identifier: this.getRuntimeIdentifier(token)});
    }
    return compileToken;
  }

  getProvidersMetadata(providers: any[]):
      Array<cpl.CompileProviderMetadata | cpl.CompileTypeMetadata | any[]> {
    return providers.map((provider) => {
      provider = resolveForwardRef(provider);
      if (isArray(provider)) {
        return this.getProvidersMetadata(provider);
      } else if (provider instanceof Provider) {
        return this.getProviderMetadata(provider);
      } else {
        return this.getTypeMetadata(provider, null);
      }
    });
  }

  getProviderMetadata(provider: Provider): cpl.CompileProviderMetadata {
    var compileDeps;
    if (isPresent(provider.useClass)) {
      compileDeps = this.getDependenciesMetadata(provider.useClass, provider.dependencies);
    } else if (isPresent(provider.useFactory)) {
      compileDeps = this.getDependenciesMetadata(provider.useFactory, provider.dependencies);
    }
    return new cpl.CompileProviderMetadata({
      token: this.getTokenMetadata(provider.token),
      useClass: isPresent(provider.useClass) ? this.getTypeMetadata(provider.useClass, null) : null,
      useValue: isPresent(provider.useValue) ? this.getRuntimeIdentifier(provider.useValue) : null,
      useFactory: isPresent(provider.useFactory) ?
                      this.getFactoryMetadata(provider.useFactory, null) :
                      null,
      useExisting: isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                                                     null,
      deps: compileDeps,
      multi: provider.multi
    });
  }

  getQueriesMetadata(queries: {[key: string]: dimd.QueryMetadata},
                     isViewQuery: boolean): cpl.CompileQueryMetadata[] {
    var compileQueries = [];
    StringMapWrapper.forEach(queries, (query, propertyName) => {
      if (query.isViewQuery === isViewQuery) {
        compileQueries.push(this.getQueryMetadata(query, propertyName));
      }
    });
    return compileQueries;
  }

  getQueryMetadata(q: dimd.QueryMetadata, propertyName: string): cpl.CompileQueryMetadata {
    var selectors;
    if (q.isVarBindingQuery) {
      selectors = q.varBindings.map(varName => this.getTokenMetadata(varName));
    } else {
      selectors = [this.getTokenMetadata(q.selector)];
    }
    return new cpl.CompileQueryMetadata({
      selectors: selectors,
      first: q.first,
      descendants: q.descendants,
      propertyName: propertyName
    });
  }
}

function flattenDirectives(view: ViewMetadata, platformDirectives: any[]): Type[] {
  let directives = [];
  if (isPresent(platformDirectives)) {
    flattenArray(platformDirectives, directives);
  }
  if (isPresent(view.directives)) {
    flattenArray(view.directives, directives);
  }
  return directives;
}

function flattenPipes(view: ViewMetadata, platformPipes: any[]): Type[] {
  let pipes = [];
  if (isPresent(platformPipes)) {
    flattenArray(platformPipes, pipes);
  }
  if (isPresent(view.pipes)) {
    flattenArray(view.pipes, pipes);
  }
  return pipes;
}

function flattenArray(tree: any[], out: Array<Type | any[]>): void {
  for (var i = 0; i < tree.length; i++) {
    var item = resolveForwardRef(tree[i]);
    if (isArray(item)) {
      flattenArray(item, out);
    } else {
      out.push(item);
    }
  }
}

function isValidType(value: Type): boolean {
  return isPresent(value) && (value instanceof Type);
}

function calcModuleUrl(type: Type, cmpMetadata: md.ComponentMetadata): string {
  var moduleId = cmpMetadata.moduleId;
  if (isPresent(moduleId)) {
    var scheme = getUrlScheme(moduleId);
    return isPresent(scheme) && scheme.length > 0 ? moduleId :
                                                    `package:${moduleId}${MODULE_SUFFIX}`;
  } else {
    return reflector.importUri(type);
  }
}
