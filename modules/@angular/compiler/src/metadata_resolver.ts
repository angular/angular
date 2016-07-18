/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationAnimateMetadata, AnimationEntryMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationStateDeclarationMetadata, AnimationStateMetadata, AnimationStateTransitionMetadata, AnimationStyleMetadata, AnimationWithStepsMetadata, AttributeMetadata, ChangeDetectionStrategy, ComponentMetadata, HostMetadata, Inject, InjectMetadata, Injectable, NgModule, NgModuleMetadata, Optional, OptionalMetadata, Provider, QueryMetadata, SelfMetadata, SkipSelfMetadata, ViewMetadata, ViewQueryMetadata, resolveForwardRef} from '@angular/core';

import {Console, LIFECYCLE_HOOKS_VALUES, ReflectorReader, createProvider, isProviderLiteral, reflector} from '../core_private';
import {MapWrapper, StringMapWrapper} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {Type, isArray, isBlank, isPresent, isString, isStringMap, stringify} from '../src/facade/lang';

import {assertArrayOfStrings, assertInterpolationSymbols} from './assertions';
import * as cpl from './compile_metadata';
import {CompilerConfig} from './config';
import {hasLifecycleHook} from './directive_lifecycle_reflector';
import {DirectiveResolver} from './directive_resolver';
import {Identifiers, identifierToken} from './identifiers';
import {NgModuleResolver} from './ng_module_resolver';
import {PipeResolver} from './pipe_resolver';
import {getUrlScheme} from './url_resolver';
import {MODULE_SUFFIX, ValueTransformer, sanitizeIdentifier, visitValue} from './util';
import {ViewResolver} from './view_resolver';

@Injectable()
export class CompileMetadataResolver {
  private _directiveCache = new Map<Type, cpl.CompileDirectiveMetadata>();
  private _pipeCache = new Map<Type, cpl.CompilePipeMetadata>();
  private _ngModuleCache = new Map<Type, cpl.CompileNgModuleMetadata>();
  private _ngModuleOfTypes = new Map<Type, Type>();
  private _anonymousTypes = new Map<Object, number>();
  private _anonymousTypeIndex = 0;

  constructor(
      private _ngModuleResolver: NgModuleResolver, private _directiveResolver: DirectiveResolver,
      private _pipeResolver: PipeResolver, private _viewResolver: ViewResolver,
      private _config: CompilerConfig, private _console: Console,
      private _reflector: ReflectorReader = reflector) {}

  private sanitizeTokenName(token: any): string {
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

  clearCacheFor(type: Type) {
    this._directiveCache.delete(type);
    this._pipeCache.delete(type);
    this._ngModuleOfTypes.delete(type);
    // Clear all of the NgModuleMetadata as they contain transitive information!
    this._ngModuleCache.clear();
  }

  clearCache() {
    this._directiveCache.clear();
    this._pipeCache.clear();
    this._ngModuleCache.clear();
    this._ngModuleOfTypes.clear();
  }

  getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata {
    var defs = entry.definitions.map(def => this.getAnimationStateMetadata(def));
    return new cpl.CompileAnimationEntryMetadata(entry.name, defs);
  }

  getAnimationStateMetadata(value: AnimationStateMetadata): cpl.CompileAnimationStateMetadata {
    if (value instanceof AnimationStateDeclarationMetadata) {
      var styles = this.getAnimationStyleMetadata(value.styles);
      return new cpl.CompileAnimationStateDeclarationMetadata(value.stateNameExpr, styles);
    } else if (value instanceof AnimationStateTransitionMetadata) {
      return new cpl.CompileAnimationStateTransitionMetadata(
          value.stateChangeExpr, this.getAnimationMetadata(value.steps));
    }
    return null;
  }

  getAnimationStyleMetadata(value: AnimationStyleMetadata): cpl.CompileAnimationStyleMetadata {
    return new cpl.CompileAnimationStyleMetadata(value.offset, value.styles);
  }

  getAnimationMetadata(value: AnimationMetadata): cpl.CompileAnimationMetadata {
    if (value instanceof AnimationStyleMetadata) {
      return this.getAnimationStyleMetadata(value);
    } else if (value instanceof AnimationKeyframesSequenceMetadata) {
      return new cpl.CompileAnimationKeyframesSequenceMetadata(
          value.steps.map(entry => this.getAnimationStyleMetadata(entry)));
    } else if (value instanceof AnimationAnimateMetadata) {
      let animateData =
          <cpl.CompileAnimationStyleMetadata|cpl.CompileAnimationKeyframesSequenceMetadata>this
              .getAnimationMetadata(value.styles);
      return new cpl.CompileAnimationAnimateMetadata(value.timings, animateData);
    } else if (value instanceof AnimationWithStepsMetadata) {
      var steps = value.steps.map(step => this.getAnimationMetadata(step));
      if (value instanceof AnimationGroupMetadata) {
        return new cpl.CompileAnimationGroupMetadata(steps);
      } else {
        return new cpl.CompileAnimationSequenceMetadata(steps);
      }
    }
    return null;
  }

  getDirectiveMetadata(directiveType: Type, throwIfNotFound = true): cpl.CompileDirectiveMetadata {
    directiveType = resolveForwardRef(directiveType);
    var meta = this._directiveCache.get(directiveType);
    if (isBlank(meta)) {
      var dirMeta = this._directiveResolver.resolve(directiveType, throwIfNotFound);
      if (!dirMeta) {
        return null;
      }
      var templateMeta: cpl.CompileTemplateMetadata = null;
      var changeDetectionStrategy: ChangeDetectionStrategy = null;
      var viewProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      var moduleUrl = staticTypeModuleUrl(directiveType);
      var precompileTypes: cpl.CompileTypeMetadata[] = [];
      if (dirMeta instanceof ComponentMetadata) {
        var cmpMeta = <ComponentMetadata>dirMeta;
        var viewMeta = this._viewResolver.resolve(directiveType);
        assertArrayOfStrings('styles', viewMeta.styles);
        assertInterpolationSymbols('interpolation', viewMeta.interpolation);
        var animations = isPresent(viewMeta.animations) ?
            viewMeta.animations.map(e => this.getAnimationEntryMetadata(e)) :
            null;
        assertArrayOfStrings('styles', viewMeta.styles);
        assertArrayOfStrings('styleUrls', viewMeta.styleUrls);

        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: viewMeta.encapsulation,
          template: viewMeta.template,
          templateUrl: viewMeta.templateUrl,
          styles: viewMeta.styles,
          styleUrls: viewMeta.styleUrls,
          animations: animations,
          interpolation: viewMeta.interpolation
        });
        changeDetectionStrategy = cmpMeta.changeDetection;
        if (isPresent(dirMeta.viewProviders)) {
          viewProviders = this.getProvidersMetadata(
              verifyNonBlankProviders(directiveType, dirMeta.viewProviders, 'viewProviders'), []);
        }
        moduleUrl = componentModuleUrl(this._reflector, directiveType, cmpMeta);
        if (cmpMeta.precompile) {
          precompileTypes = flattenArray(cmpMeta.precompile)
                                .map((cmp) => this.getTypeMetadata(cmp, staticTypeModuleUrl(cmp)));
        }
      }

      var providers: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      if (isPresent(dirMeta.providers)) {
        providers = this.getProvidersMetadata(
            verifyNonBlankProviders(directiveType, dirMeta.providers, 'providers'),
            precompileTypes);
      }
      var queries: cpl.CompileQueryMetadata[] = [];
      var viewQueries: cpl.CompileQueryMetadata[] = [];
      if (isPresent(dirMeta.queries)) {
        queries = this.getQueriesMetadata(dirMeta.queries, false, directiveType);
        viewQueries = this.getQueriesMetadata(dirMeta.queries, true, directiveType);
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
        viewQueries: viewQueries,
        precompile: precompileTypes
      });
      this._directiveCache.set(directiveType, meta);
    }
    return meta;
  }

  getNgModuleMetadata(moduleType: any, throwIfNotFound = true): cpl.CompileNgModuleMetadata {
    moduleType = resolveForwardRef(moduleType);
    var compileMeta = this._ngModuleCache.get(moduleType);
    if (!compileMeta) {
      const meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
      if (!meta) {
        return null;
      }
      const declaredDirectives: cpl.CompileDirectiveMetadata[] = [];
      const exportedDirectives: cpl.CompileDirectiveMetadata[] = [];
      const declaredPipes: cpl.CompilePipeMetadata[] = [];
      const exportedPipes: cpl.CompilePipeMetadata[] = [];
      const importedModules: cpl.CompileNgModuleMetadata[] = [];
      const exportedModules: cpl.CompileNgModuleMetadata[] = [];

      if (meta.imports) {
        flattenArray(meta.imports).forEach((importedType) => {
          if (!isValidType(importedType)) {
            throw new BaseException(
                `Unexpected value '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
          }
          let importedModuleMeta: cpl.CompileNgModuleMetadata;
          if (importedModuleMeta = this.getNgModuleMetadata(importedType, false)) {
            importedModules.push(importedModuleMeta);
          } else {
            throw new BaseException(
                `Unexpected value '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
          }
        });
      }

      if (meta.exports) {
        flattenArray(meta.exports).forEach((exportedType) => {
          if (!isValidType(exportedType)) {
            throw new BaseException(
                `Unexpected value '${stringify(exportedType)}' exported by the module '${stringify(moduleType)}'`);
          }
          let exportedDirMeta: cpl.CompileDirectiveMetadata;
          let exportedPipeMeta: cpl.CompilePipeMetadata;
          let exportedModuleMeta: cpl.CompileNgModuleMetadata;
          if (exportedDirMeta = this.getDirectiveMetadata(exportedType, false)) {
            exportedDirectives.push(exportedDirMeta);
          } else if (exportedPipeMeta = this.getPipeMetadata(exportedType, false)) {
            exportedPipes.push(exportedPipeMeta);
          } else if (exportedModuleMeta = this.getNgModuleMetadata(exportedType, false)) {
            exportedModules.push(exportedModuleMeta);
          } else {
            throw new BaseException(
                `Unexpected value '${stringify(exportedType)}' exported by the module '${stringify(moduleType)}'`);
          }
        });
      }

      // Note: This will be modified later, so we rely on
      // getting a new instance every time!
      const transitiveModule =
          this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
      if (meta.declarations) {
        flattenArray(meta.declarations).forEach((declaredType) => {
          if (!isValidType(declaredType)) {
            throw new BaseException(
                `Unexpected value '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
          }
          let declaredDirMeta: cpl.CompileDirectiveMetadata;
          let declaredPipeMeta: cpl.CompilePipeMetadata;
          if (declaredDirMeta = this.getDirectiveMetadata(declaredType, false)) {
            this._addDirectiveToModule(
                declaredDirMeta, moduleType, transitiveModule, declaredDirectives, true);
            // Collect @Component.directives/pipes/precompile into our declared directives/pipes.
            this._getTransitiveViewDirectivesAndPipes(
                declaredDirMeta, moduleType, transitiveModule, declaredDirectives, declaredPipes);
          } else if (declaredPipeMeta = this.getPipeMetadata(declaredType, false)) {
            this._addPipeToModule(
                declaredPipeMeta, moduleType, transitiveModule, declaredPipes, true);
          } else {
            throw new BaseException(
                `Unexpected value '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
          }
        });
      }

      const providers: any[] = [];
      const precompile: cpl.CompileTypeMetadata[] = [];
      if (meta.providers) {
        providers.push(...this.getProvidersMetadata(meta.providers, precompile));
      }
      if (meta.precompile) {
        precompile.push(...flattenArray(meta.precompile)
                            .map(type => this.getTypeMetadata(type, staticTypeModuleUrl(type))));
      }

      transitiveModule.precompile.push(...precompile);
      transitiveModule.providers.push(...providers);

      compileMeta = new cpl.CompileNgModuleMetadata({
        type: this.getTypeMetadata(moduleType, staticTypeModuleUrl(moduleType)),
        providers: providers,
        precompile: precompile,
        declaredDirectives: declaredDirectives,
        exportedDirectives: exportedDirectives,
        declaredPipes: declaredPipes,
        exportedPipes: exportedPipes,
        importedModules: importedModules,
        exportedModules: exportedModules,
        transitiveModule: transitiveModule
      });
      transitiveModule.modules.push(compileMeta);
      this._verifyModule(compileMeta);
      this._ngModuleCache.set(moduleType, compileMeta);
    }
    return compileMeta;
  }

  addComponentToModule(moduleType: Type, compType: Type) {
    const moduleMeta = this.getNgModuleMetadata(moduleType);
    // Collect @Component.directives/pipes/precompile into our declared directives/pipes.
    const compMeta = this.getDirectiveMetadata(compType, false);
    this._addDirectiveToModule(
        compMeta, moduleMeta.type.runtime, moduleMeta.transitiveModule,
        moduleMeta.declaredDirectives);
    this._getTransitiveViewDirectivesAndPipes(
        compMeta, moduleMeta.type.runtime, moduleMeta.transitiveModule,
        moduleMeta.declaredDirectives, moduleMeta.declaredPipes);

    moduleMeta.transitiveModule.precompile.push(compMeta.type);
    moduleMeta.precompile.push(compMeta.type);

    this._verifyModule(moduleMeta);
  }

  private _verifyModule(moduleMeta: cpl.CompileNgModuleMetadata) {
    moduleMeta.exportedDirectives.forEach((dirMeta) => {
      if (!moduleMeta.transitiveModule.directivesSet.has(dirMeta.type.runtime)) {
        throw new BaseException(
            `Can't export directive ${stringify(dirMeta.type.runtime)} from ${stringify(moduleMeta.type.runtime)} as it was neither declared nor imported!`);
      }
    });
    moduleMeta.exportedPipes.forEach((pipeMeta) => {
      if (!moduleMeta.transitiveModule.pipesSet.has(pipeMeta.type.runtime)) {
        throw new BaseException(
            `Can't export pipe ${stringify(pipeMeta.type.runtime)} from ${stringify(moduleMeta.type.runtime)} as it was neither declared nor imported!`);
      }
    });
    moduleMeta.declaredDirectives.forEach((dirMeta) => {
      dirMeta.precompile.forEach((precompileComp) => {
        if (!moduleMeta.transitiveModule.directivesSet.has(precompileComp.runtime)) {
          throw new BaseException(
              `Component ${stringify(dirMeta.type.runtime)} in NgModule ${stringify(moduleMeta.type.runtime)} uses ${stringify(precompileComp.runtime)} via "precompile" but it was neither declared nor imported into the module!`);
        }
      });
    });
    moduleMeta.precompile.forEach((precompileType) => {
      if (!moduleMeta.transitiveModule.directivesSet.has(precompileType.runtime)) {
        throw new BaseException(
            `NgModule ${stringify(moduleMeta.type.runtime)} uses ${stringify(precompileType.runtime)} via "precompile" but it was neither declared nor imported!`);
      }
    });
  }

  private _addTypeToModule(type: Type, moduleType: Type) {
    const oldModule = this._ngModuleOfTypes.get(type);
    if (oldModule && oldModule !== moduleType) {
      throw new BaseException(
          `Type ${stringify(type)} is part of the declarations of 2 modules: ${stringify(oldModule)} and ${stringify(moduleType)}!`);
    }
    this._ngModuleOfTypes.set(type, moduleType);
  }


  private _getTransitiveViewDirectivesAndPipes(
      compMeta: cpl.CompileDirectiveMetadata, moduleType: any,
      transitiveModule: cpl.TransitiveCompileNgModuleMetadata,
      declaredDirectives: cpl.CompileDirectiveMetadata[],
      declaredPipes: cpl.CompilePipeMetadata[]) {
    if (!compMeta.isComponent) {
      return;
    }
    const addPipe = (pipeType: Type) => {
      if (!pipeType) {
        throw new BaseException(
            `Unexpected pipe value '${pipeType}' on the View of component '${stringify(compMeta.type.runtime)}'`);
      }
      const pipeMeta = this.getPipeMetadata(pipeType);
      this._addPipeToModule(pipeMeta, moduleType, transitiveModule, declaredPipes);
    };

    const addDirective = (dirType: Type) => {
      if (!dirType) {
        throw new BaseException(
            `Unexpected directive value '${dirType}' on the View of component '${stringify(compMeta.type.runtime)}'`);
      }
      const dirMeta = this.getDirectiveMetadata(dirType);
      if (this._addDirectiveToModule(dirMeta, moduleType, transitiveModule, declaredDirectives)) {
        this._getTransitiveViewDirectivesAndPipes(
            dirMeta, moduleType, transitiveModule, declaredDirectives, declaredPipes);
      }
    };
    const view = this._viewResolver.resolve(compMeta.type.runtime);
    if (view.pipes) {
      flattenArray(view.pipes).forEach(addPipe);
    }
    if (view.directives) {
      flattenArray(view.directives).forEach(addDirective);
    }
  }

  private _getTransitiveNgModuleMetadata(
      importedModules: cpl.CompileNgModuleMetadata[],
      exportedModules: cpl.CompileNgModuleMetadata[]): cpl.TransitiveCompileNgModuleMetadata {
    // collect `providers` / `precompile` from all imported and all exported modules
    const transitiveModules = getTransitiveModules(importedModules.concat(exportedModules), true);
    const providers = flattenArray(transitiveModules.map((ngModule) => ngModule.providers));
    const precompile = flattenArray(transitiveModules.map((ngModule) => ngModule.precompile));

    const transitiveExportedModules = getTransitiveModules(importedModules, false);
    const directives =
        flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedDirectives));
    const pipes = flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedPipes));
    return new cpl.TransitiveCompileNgModuleMetadata(
        transitiveModules, providers, precompile, directives, pipes);
  }

  private _addDirectiveToModule(
      dirMeta: cpl.CompileDirectiveMetadata, moduleType: any,
      transitiveModule: cpl.TransitiveCompileNgModuleMetadata,
      declaredDirectives: cpl.CompileDirectiveMetadata[], force: boolean = false): boolean {
    if (force || !transitiveModule.directivesSet.has(dirMeta.type.runtime)) {
      transitiveModule.directivesSet.add(dirMeta.type.runtime);
      transitiveModule.directives.push(dirMeta);
      declaredDirectives.push(dirMeta);
      this._addTypeToModule(dirMeta.type.runtime, moduleType);
      return true;
    }
    return false;
  }

  private _addPipeToModule(
      pipeMeta: cpl.CompilePipeMetadata, moduleType: any,
      transitiveModule: cpl.TransitiveCompileNgModuleMetadata,
      declaredPipes: cpl.CompilePipeMetadata[], force: boolean = false): boolean {
    if (force || !transitiveModule.pipesSet.has(pipeMeta.type.runtime)) {
      transitiveModule.pipesSet.add(pipeMeta.type.runtime);
      transitiveModule.pipes.push(pipeMeta);
      declaredPipes.push(pipeMeta);
      this._addTypeToModule(pipeMeta.type.runtime, moduleType);
      return true;
    }
    return false;
  }

  getTypeMetadata(type: Type, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileTypeMetadata {
    type = resolveForwardRef(type);
    return new cpl.CompileTypeMetadata({
      name: this.sanitizeTokenName(type),
      moduleUrl: moduleUrl,
      runtime: type,
      diDeps: this.getDependenciesMetadata(type, dependencies)
    });
  }

  getFactoryMetadata(factory: Function, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileFactoryMetadata {
    factory = resolveForwardRef(factory);
    return new cpl.CompileFactoryMetadata({
      name: this.sanitizeTokenName(factory),
      moduleUrl: moduleUrl,
      runtime: factory,
      diDeps: this.getDependenciesMetadata(factory, dependencies)
    });
  }

  getPipeMetadata(pipeType: Type, throwIfNotFound = true): cpl.CompilePipeMetadata {
    pipeType = resolveForwardRef(pipeType);
    var meta = this._pipeCache.get(pipeType);
    if (isBlank(meta)) {
      var pipeMeta = this._pipeResolver.resolve(pipeType, throwIfNotFound);
      if (!pipeMeta) {
        return null;
      }
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

  getDependenciesMetadata(typeOrFunc: Type|Function, dependencies: any[]):
      cpl.CompileDiDependencyMetadata[] {
    let hasUnknownDeps = false;
    let params = isPresent(dependencies) ? dependencies : this._reflector.parameters(typeOrFunc);
    if (isBlank(params)) {
      params = [];
    }
    let dependenciesMetadata: cpl.CompileDiDependencyMetadata[] = params.map((param) => {
      let isAttribute = false;
      let isHost = false;
      let isSelf = false;
      let isSkipSelf = false;
      let isOptional = false;
      let query: QueryMetadata = null;
      let viewQuery: ViewQueryMetadata = null;
      var token: any = null;
      if (isArray(param)) {
        (<any[]>param).forEach((paramEntry) => {
          if (paramEntry instanceof HostMetadata) {
            isHost = true;
          } else if (paramEntry instanceof SelfMetadata) {
            isSelf = true;
          } else if (paramEntry instanceof SkipSelfMetadata) {
            isSkipSelf = true;
          } else if (paramEntry instanceof OptionalMetadata) {
            isOptional = true;
          } else if (paramEntry instanceof AttributeMetadata) {
            isAttribute = true;
            token = paramEntry.attributeName;
          } else if (paramEntry instanceof QueryMetadata) {
            if (paramEntry.isViewQuery) {
              viewQuery = paramEntry;
            } else {
              query = paramEntry;
            }
          } else if (paramEntry instanceof InjectMetadata) {
            token = paramEntry.token;
          } else if (isValidType(paramEntry) && isBlank(token)) {
            token = paramEntry;
          }
        });
      } else {
        token = param;
      }
      if (isBlank(token)) {
        hasUnknownDeps = true;
        return null;
      }
      return new cpl.CompileDiDependencyMetadata({
        isAttribute: isAttribute,
        isHost: isHost,
        isSelf: isSelf,
        isSkipSelf: isSkipSelf,
        isOptional: isOptional,
        query: isPresent(query) ? this.getQueryMetadata(query, null, typeOrFunc) : null,
        viewQuery: isPresent(viewQuery) ? this.getQueryMetadata(viewQuery, null, typeOrFunc) : null,
        token: this.getTokenMetadata(token)
      });

    });

    if (hasUnknownDeps) {
      let depsTokens =
          dependenciesMetadata.map((dep) => { return dep ? stringify(dep.token) : '?'; })
              .join(', ');
      throw new BaseException(
          `Can't resolve all parameters for ${stringify(typeOrFunc)}: (${depsTokens}).`);
    }

    return dependenciesMetadata;
  }

  getTokenMetadata(token: any): cpl.CompileTokenMetadata {
    token = resolveForwardRef(token);
    var compileToken: any /** TODO #9100 */;
    if (isString(token)) {
      compileToken = new cpl.CompileTokenMetadata({value: token});
    } else {
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

  getProvidersMetadata(providers: any[], targetPrecompileComponents: cpl.CompileTypeMetadata[]):
      Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> {
    const compileProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
    providers.forEach((provider) => {
      provider = resolveForwardRef(provider);
      if (isProviderLiteral(provider)) {
        provider = createProvider(provider);
      }
      let compileProvider: cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[];
      if (isArray(provider)) {
        compileProvider = this.getProvidersMetadata(provider, targetPrecompileComponents);
      } else if (provider instanceof Provider) {
        let tokenMeta = this.getTokenMetadata(provider.token);
        if (tokenMeta.equalsTo(identifierToken(Identifiers.ANALYZE_FOR_PRECOMPILE))) {
          targetPrecompileComponents.push(...this.getPrecompileComponentsFromProvider(provider));
        } else {
          compileProvider = this.getProviderMetadata(provider);
        }
      } else if (isValidType(provider)) {
        compileProvider = this.getTypeMetadata(provider, staticTypeModuleUrl(provider));
      } else {
        throw new BaseException(
            `Invalid provider - only instances of Provider and Type are allowed, got: ${stringify(provider)}`);
      }
      if (compileProvider) {
        compileProviders.push(compileProvider);
      }
    });
    return compileProviders;
  }

  getPrecompileComponentsFromProvider(provider: Provider): cpl.CompileTypeMetadata[] {
    let components: cpl.CompileTypeMetadata[] = [];
    let collectedIdentifiers: cpl.CompileIdentifierMetadata[] = [];
    if (provider.useFactory || provider.useExisting || provider.useClass) {
      throw new BaseException(`The ANALYZE_FOR_PRECOMPILE token only supports useValue!`);
    }
    if (!provider.multi) {
      throw new BaseException(`The ANALYZE_FOR_PRECOMPILE token only supports 'multi = true'!`);
    }
    convertToCompileValue(provider.useValue, collectedIdentifiers);
    collectedIdentifiers.forEach((identifier) => {
      let dirMeta = this.getDirectiveMetadata(identifier.runtime, false);
      if (dirMeta) {
        components.push(dirMeta.type);
      }
    });
    return components;
  }

  getProviderMetadata(provider: Provider): cpl.CompileProviderMetadata {
    var compileDeps: cpl.CompileDiDependencyMetadata[];
    var compileTypeMetadata: cpl.CompileTypeMetadata = null;
    var compileFactoryMetadata: cpl.CompileFactoryMetadata = null;

    if (isPresent(provider.useClass)) {
      compileTypeMetadata = this.getTypeMetadata(
          provider.useClass, staticTypeModuleUrl(provider.useClass), provider.dependencies);
      compileDeps = compileTypeMetadata.diDeps;
    } else if (isPresent(provider.useFactory)) {
      compileFactoryMetadata = this.getFactoryMetadata(
          provider.useFactory, staticTypeModuleUrl(provider.useFactory), provider.dependencies);
      compileDeps = compileFactoryMetadata.diDeps;
    }

    return new cpl.CompileProviderMetadata({
      token: this.getTokenMetadata(provider.token),
      useClass: compileTypeMetadata,
      useValue: convertToCompileValue(provider.useValue, []),
      useFactory: compileFactoryMetadata,
      useExisting: isPresent(provider.useExisting) ? this.getTokenMetadata(provider.useExisting) :
                                                     null,
      deps: compileDeps,
      multi: provider.multi
    });
  }

  getQueriesMetadata(
      queries: {[key: string]: QueryMetadata}, isViewQuery: boolean,
      directiveType: Type): cpl.CompileQueryMetadata[] {
    var res: cpl.CompileQueryMetadata[] = [];
    StringMapWrapper.forEach(queries, (query: QueryMetadata, propertyName: string) => {
      if (query.isViewQuery === isViewQuery) {
        res.push(this.getQueryMetadata(query, propertyName, directiveType));
      }
    });
    return res;
  }

  getQueryMetadata(q: QueryMetadata, propertyName: string, typeOrFunc: Type|Function):
      cpl.CompileQueryMetadata {
    var selectors: cpl.CompileTokenMetadata[];
    if (q.isVarBindingQuery) {
      selectors = q.varBindings.map(varName => this.getTokenMetadata(varName));
    } else {
      if (!isPresent(q.selector)) {
        throw new BaseException(
            `Can't construct a query for the property "${propertyName}" of "${stringify(typeOrFunc)}" since the query selector wasn't defined.`);
      }
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
}

function getTransitiveModules(
    modules: cpl.CompileNgModuleMetadata[], includeImports: boolean,
    targetModules: cpl.CompileNgModuleMetadata[] = [],
    visitedModules = new Set<Type>()): cpl.CompileNgModuleMetadata[] {
  modules.forEach((ngModule) => {
    if (!visitedModules.has(ngModule.type.runtime)) {
      visitedModules.add(ngModule.type.runtime);
      const nestedModules = includeImports ?
          ngModule.importedModules.concat(ngModule.exportedModules) :
          ngModule.exportedModules;
      getTransitiveModules(nestedModules, includeImports, targetModules, visitedModules);
      // Add after recursing so imported/exported modules are before the module itself.
      // This is important for overwriting providers of imported modules!
      targetModules.push(ngModule);
    }
  });
  return targetModules;
}


function flattenArray(tree: any[], out: Array<any> = []): Array<any> {
  if (tree) {
    for (var i = 0; i < tree.length; i++) {
      var item = resolveForwardRef(tree[i]);
      if (isArray(item)) {
        flattenArray(item, out);
      } else {
        out.push(item);
      }
    }
  }
  return out;
}

function verifyNonBlankProviders(
    directiveType: Type, providersTree: any[], providersType: string): any[] {
  var flat: any[] = [];
  var errMsg: string;

  flattenArray(providersTree, flat);
  for (var i = 0; i < flat.length; i++) {
    if (isBlank(flat[i])) {
      errMsg = flat.map(provider => isBlank(provider) ? '?' : stringify(provider)).join(', ');
      throw new BaseException(
          `One or more of ${providersType} for "${stringify(directiveType)}" were not defined: [${errMsg}].`);
    }
  }

  return providersTree;
}

function isValidType(value: any): boolean {
  return cpl.isStaticSymbol(value) || (value instanceof Type);
}

function staticTypeModuleUrl(value: any): string {
  return cpl.isStaticSymbol(value) ? value.filePath : null;
}

function componentModuleUrl(
    reflector: ReflectorReader, type: any, cmpMetadata: ComponentMetadata): string {
  if (cpl.isStaticSymbol(type)) {
    return staticTypeModuleUrl(type);
  }

  if (isPresent(cmpMetadata.moduleId)) {
    var moduleId = cmpMetadata.moduleId;
    var scheme = getUrlScheme(moduleId);
    return isPresent(scheme) && scheme.length > 0 ? moduleId :
                                                    `package:${moduleId}${MODULE_SUFFIX}`;
  }

  return reflector.importUri(type);
}

function convertToCompileValue(
    value: any, targetIdentifiers: cpl.CompileIdentifierMetadata[]): any {
  return visitValue(value, new _CompileValueConverter(), targetIdentifiers);
}

class _CompileValueConverter extends ValueTransformer {
  visitOther(value: any, targetIdentifiers: cpl.CompileIdentifierMetadata[]): any {
    let identifier: cpl.CompileIdentifierMetadata;
    if (cpl.isStaticSymbol(value)) {
      identifier = new cpl.CompileIdentifierMetadata(
          {name: value.name, moduleUrl: value.filePath, runtime: value});
    } else {
      identifier = new cpl.CompileIdentifierMetadata({runtime: value});
    }
    targetIdentifiers.push(identifier);
    return identifier;
  }
}
