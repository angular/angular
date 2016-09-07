/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationAnimateMetadata, AnimationEntryMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationStateDeclarationMetadata, AnimationStateMetadata, AnimationStateTransitionMetadata, AnimationStyleMetadata, AnimationWithStepsMetadata, AttributeMetadata, ChangeDetectionStrategy, ComponentMetadata, HostMetadata, InjectMetadata, Injectable, ModuleWithProviders, OptionalMetadata, Provider, QueryMetadata, SchemaMetadata, SelfMetadata, SkipSelfMetadata, Type, ViewQueryMetadata, resolveForwardRef} from '@angular/core';

import {StringMapWrapper} from '../src/facade/collection';

import {assertArrayOfStrings, assertInterpolationSymbols} from './assertions';
import * as cpl from './compile_metadata';
import {DirectiveResolver} from './directive_resolver';
import {isArray, isBlank, isPresent, isString, stringify} from './facade/lang';
import {Identifiers, resolveIdentifierToken} from './identifiers';
import {hasLifecycleHook} from './lifecycle_reflector';
import {NgModuleResolver} from './ng_module_resolver';
import {PipeResolver} from './pipe_resolver';
import {LIFECYCLE_HOOKS_VALUES, ReflectorReader, reflector} from './private_import_core';
import {ElementSchemaRegistry} from './schema/element_schema_registry';
import {getUrlScheme} from './url_resolver';
import {MODULE_SUFFIX, ValueTransformer, sanitizeIdentifier, visitValue} from './util';

@Injectable()
export class CompileMetadataResolver {
  private _directiveCache = new Map<Type<any>, cpl.CompileDirectiveMetadata>();
  private _pipeCache = new Map<Type<any>, cpl.CompilePipeMetadata>();
  private _ngModuleCache = new Map<Type<any>, cpl.CompileNgModuleMetadata>();
  private _ngModuleOfTypes = new Map<Type<any>, Type<any>>();
  private _anonymousTypes = new Map<Object, number>();
  private _anonymousTypeIndex = 0;

  constructor(
      private _ngModuleResolver: NgModuleResolver, private _directiveResolver: DirectiveResolver,
      private _pipeResolver: PipeResolver, private _schemaRegistry: ElementSchemaRegistry,
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

  clearCacheFor(type: Type<any>) {
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

  getDirectiveMetadata(directiveType: Type<any>, throwIfNotFound = true):
      cpl.CompileDirectiveMetadata {
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
      var entryComponentMetadata: cpl.CompileTypeMetadata[] = [];
      let selector = dirMeta.selector;
      if (dirMeta instanceof ComponentMetadata) {
        var cmpMeta = <ComponentMetadata>dirMeta;
        assertArrayOfStrings('styles', cmpMeta.styles);
        assertInterpolationSymbols('interpolation', cmpMeta.interpolation);
        var animations = isPresent(cmpMeta.animations) ?
            cmpMeta.animations.map(e => this.getAnimationEntryMetadata(e)) :
            null;
        assertArrayOfStrings('styles', cmpMeta.styles);
        assertArrayOfStrings('styleUrls', cmpMeta.styleUrls);

        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: cmpMeta.encapsulation,
          template: cmpMeta.template,
          templateUrl: cmpMeta.templateUrl,
          styles: cmpMeta.styles,
          styleUrls: cmpMeta.styleUrls,
          animations: animations,
          interpolation: cmpMeta.interpolation
        });
        changeDetectionStrategy = cmpMeta.changeDetection;
        if (isPresent(dirMeta.viewProviders)) {
          viewProviders = this.getProvidersMetadata(
              dirMeta.viewProviders, entryComponentMetadata,
              `viewProviders for "${stringify(directiveType)}"`);
        }
        moduleUrl = componentModuleUrl(this._reflector, directiveType, cmpMeta);
        if (cmpMeta.entryComponents) {
          entryComponentMetadata =
              flattenArray(cmpMeta.entryComponents)
                  .map((type) => this.getTypeMetadata(type, staticTypeModuleUrl(type)))
                  .concat(entryComponentMetadata);
        }
        if (!selector) {
          selector = this._schemaRegistry.getDefaultComponentElementName();
        }
      } else {
        if (!selector) {
          throw new Error(`Directive ${stringify(directiveType)} has no selector, please add it!`);
        }
      }

      var providers: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      if (isPresent(dirMeta.providers)) {
        providers = this.getProvidersMetadata(
            dirMeta.providers, entryComponentMetadata,
            `providers for "${stringify(directiveType)}"`);
      }
      var queries: cpl.CompileQueryMetadata[] = [];
      var viewQueries: cpl.CompileQueryMetadata[] = [];
      if (isPresent(dirMeta.queries)) {
        queries = this.getQueriesMetadata(dirMeta.queries, false, directiveType);
        viewQueries = this.getQueriesMetadata(dirMeta.queries, true, directiveType);
      }
      meta = cpl.CompileDirectiveMetadata.create({
        selector: selector,
        exportAs: dirMeta.exportAs,
        isComponent: isPresent(templateMeta),
        type: this.getTypeMetadata(directiveType, moduleUrl),
        template: templateMeta,
        changeDetection: changeDetectionStrategy,
        inputs: dirMeta.inputs,
        outputs: dirMeta.outputs,
        host: dirMeta.host,
        providers: providers,
        viewProviders: viewProviders,
        queries: queries,
        viewQueries: viewQueries,
        entryComponents: entryComponentMetadata
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
      const providers: any[] = [];
      const entryComponents: cpl.CompileTypeMetadata[] = [];
      const bootstrapComponents: cpl.CompileTypeMetadata[] = [];
      const schemas: SchemaMetadata[] = [];

      if (meta.imports) {
        flattenArray(meta.imports).forEach((importedType) => {
          let importedModuleType: Type<any>;
          if (isValidType(importedType)) {
            importedModuleType = importedType;
          } else if (importedType && importedType.ngModule) {
            const moduleWithProviders: ModuleWithProviders = importedType;
            importedModuleType = moduleWithProviders.ngModule;
            if (moduleWithProviders.providers) {
              providers.push(...this.getProvidersMetadata(
                  moduleWithProviders.providers, entryComponents,
                  `provider for the NgModule '${stringify(importedModuleType)}'`));
            }
          }
          if (importedModuleType) {
            let importedMeta = this.getNgModuleMetadata(importedModuleType, false);
            if (importedMeta === null) {
              throw new Error(
                  `Unexpected ${this._getTypeDescriptor(importedType)} '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
            }
            importedModules.push(importedMeta);
          } else {
            throw new Error(
                `Unexpected value '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
          }
        });
      }

      if (meta.exports) {
        flattenArray(meta.exports).forEach((exportedType) => {
          if (!isValidType(exportedType)) {
            throw new Error(
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
            throw new Error(
                `Unexpected ${this._getTypeDescriptor(exportedType)} '${stringify(exportedType)}' exported by the module '${stringify(moduleType)}'`);
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
            throw new Error(
                `Unexpected value '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
          }
          let declaredDirMeta: cpl.CompileDirectiveMetadata;
          let declaredPipeMeta: cpl.CompilePipeMetadata;
          if (declaredDirMeta = this.getDirectiveMetadata(declaredType, false)) {
            this._addDirectiveToModule(
                declaredDirMeta, moduleType, transitiveModule, declaredDirectives, true);
          } else if (declaredPipeMeta = this.getPipeMetadata(declaredType, false)) {
            this._addPipeToModule(
                declaredPipeMeta, moduleType, transitiveModule, declaredPipes, true);
          } else {
            throw new Error(
                `Unexpected ${this._getTypeDescriptor(declaredType)} '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
          }
        });
      }

      // The providers of the module have to go last
      // so that they overwrite any other provider we already added.
      if (meta.providers) {
        providers.push(...this.getProvidersMetadata(
            meta.providers, entryComponents,
            `provider for the NgModule '${stringify(moduleType)}'`));
      }
      if (meta.entryComponents) {
        entryComponents.push(
            ...flattenArray(meta.entryComponents)
                .map(type => this.getTypeMetadata(type, staticTypeModuleUrl(type))));
      }
      if (meta.bootstrap) {
        const typeMetadata = flattenArray(meta.bootstrap).map(type => {
          if (!isValidType(type)) {
            throw new Error(
                `Unexpected value '${stringify(type)}' used in the bootstrap property of module '${stringify(moduleType)}'`);
          }
          return this.getTypeMetadata(type, staticTypeModuleUrl(type));
        });
        bootstrapComponents.push(...typeMetadata);
      }
      entryComponents.push(...bootstrapComponents);
      if (meta.schemas) {
        schemas.push(...flattenArray(meta.schemas));
      }

      transitiveModule.entryComponents.push(...entryComponents);
      transitiveModule.providers.push(...providers);

      compileMeta = new cpl.CompileNgModuleMetadata({
        type: this.getTypeMetadata(moduleType, staticTypeModuleUrl(moduleType)),
        providers: providers,
        entryComponents: entryComponents,
        bootstrapComponents: bootstrapComponents,
        schemas: schemas,
        declaredDirectives: declaredDirectives,
        exportedDirectives: exportedDirectives,
        declaredPipes: declaredPipes,
        exportedPipes: exportedPipes,
        importedModules: importedModules,
        exportedModules: exportedModules,
        transitiveModule: transitiveModule,
        id: meta.id,
      });
      transitiveModule.modules.push(compileMeta);
      this._verifyModule(compileMeta);
      this._ngModuleCache.set(moduleType, compileMeta);
    }
    return compileMeta;
  }


  private _verifyModule(moduleMeta: cpl.CompileNgModuleMetadata) {
    moduleMeta.exportedDirectives.forEach((dirMeta) => {
      if (!moduleMeta.transitiveModule.directivesSet.has(dirMeta.type.reference)) {
        throw new Error(
            `Can't export directive ${stringify(dirMeta.type.reference)} from ${stringify(moduleMeta.type.reference)} as it was neither declared nor imported!`);
      }
    });
    moduleMeta.exportedPipes.forEach((pipeMeta) => {
      if (!moduleMeta.transitiveModule.pipesSet.has(pipeMeta.type.reference)) {
        throw new Error(
            `Can't export pipe ${stringify(pipeMeta.type.reference)} from ${stringify(moduleMeta.type.reference)} as it was neither declared nor imported!`);
      }
    });
  }

  private _getTypeDescriptor(type: Type<any>): string {
    if (this._directiveResolver.resolve(type, false) !== null) {
      return 'directive';
    } else if (this._pipeResolver.resolve(type, false) !== null) {
      return 'pipe';
    } else if (this._ngModuleResolver.resolve(type, false) !== null) {
      return 'module';
    } else if ((type as any).provide) {
      return 'provider';
    } else {
      return 'value';
    }
  }

  private _addTypeToModule(type: Type<any>, moduleType: Type<any>) {
    const oldModule = this._ngModuleOfTypes.get(type);
    if (oldModule && oldModule !== moduleType) {
      throw new Error(
          `Type ${stringify(type)} is part of the declarations of 2 modules: ${stringify(oldModule)} and ${stringify(moduleType)}! ` +
          `Please consider moving ${stringify(type)} to a higher module that imports ${stringify(oldModule)} and ${stringify(moduleType)}. ` +
          `You can also create a new NgModule that exports and includes ${stringify(type)} then import that NgModule in ${stringify(oldModule)} and ${stringify(moduleType)}.`);
    }
    this._ngModuleOfTypes.set(type, moduleType);
  }

  private _getTransitiveNgModuleMetadata(
      importedModules: cpl.CompileNgModuleMetadata[],
      exportedModules: cpl.CompileNgModuleMetadata[]): cpl.TransitiveCompileNgModuleMetadata {
    // collect `providers` / `entryComponents` from all imported and all exported modules
    const transitiveModules = getTransitiveModules(importedModules.concat(exportedModules), true);
    const providers = flattenArray(transitiveModules.map((ngModule) => ngModule.providers));
    const entryComponents =
        flattenArray(transitiveModules.map((ngModule) => ngModule.entryComponents));

    const transitiveExportedModules = getTransitiveModules(importedModules, false);
    const directives =
        flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedDirectives));
    const pipes = flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedPipes));
    return new cpl.TransitiveCompileNgModuleMetadata(
        transitiveModules, providers, entryComponents, directives, pipes);
  }

  private _addDirectiveToModule(
      dirMeta: cpl.CompileDirectiveMetadata, moduleType: any,
      transitiveModule: cpl.TransitiveCompileNgModuleMetadata,
      declaredDirectives: cpl.CompileDirectiveMetadata[], force: boolean = false): boolean {
    if (force || !transitiveModule.directivesSet.has(dirMeta.type.reference)) {
      transitiveModule.directivesSet.add(dirMeta.type.reference);
      transitiveModule.directives.push(dirMeta);
      declaredDirectives.push(dirMeta);
      this._addTypeToModule(dirMeta.type.reference, moduleType);
      return true;
    }
    return false;
  }

  private _addPipeToModule(
      pipeMeta: cpl.CompilePipeMetadata, moduleType: any,
      transitiveModule: cpl.TransitiveCompileNgModuleMetadata,
      declaredPipes: cpl.CompilePipeMetadata[], force: boolean = false): boolean {
    if (force || !transitiveModule.pipesSet.has(pipeMeta.type.reference)) {
      transitiveModule.pipesSet.add(pipeMeta.type.reference);
      transitiveModule.pipes.push(pipeMeta);
      declaredPipes.push(pipeMeta);
      this._addTypeToModule(pipeMeta.type.reference, moduleType);
      return true;
    }
    return false;
  }

  getTypeMetadata(type: Type<any>, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileTypeMetadata {
    type = resolveForwardRef(type);
    return new cpl.CompileTypeMetadata({
      name: this.sanitizeTokenName(type),
      moduleUrl: moduleUrl,
      reference: type,
      diDeps: this.getDependenciesMetadata(type, dependencies),
      lifecycleHooks: LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, type)),
    });
  }

  getFactoryMetadata(factory: Function, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileFactoryMetadata {
    factory = resolveForwardRef(factory);
    return new cpl.CompileFactoryMetadata({
      name: this.sanitizeTokenName(factory),
      moduleUrl: moduleUrl,
      reference: factory,
      diDeps: this.getDependenciesMetadata(factory, dependencies)
    });
  }

  getPipeMetadata(pipeType: Type<any>, throwIfNotFound = true): cpl.CompilePipeMetadata {
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
        pure: pipeMeta.pure
      });
      this._pipeCache.set(pipeType, meta);
    }
    return meta;
  }

  getDependenciesMetadata(typeOrFunc: Type<any>|Function, dependencies: any[]):
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
      throw new Error(
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
          reference: token,
          name: this.sanitizeTokenName(token),
          moduleUrl: staticTypeModuleUrl(token)
        })
      });
    }
    return compileToken;
  }

  getProvidersMetadata(
      providers: Provider[], targetEntryComponents: cpl.CompileTypeMetadata[],
      debugInfo?: string): Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> {
    const compileProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
    providers.forEach((provider: any, providerIdx: number) => {
      provider = resolveForwardRef(provider);
      if (provider && typeof provider == 'object' && provider.hasOwnProperty('provide')) {
        provider = new cpl.ProviderMeta(provider.provide, provider);
      }
      let compileProvider: cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[];
      if (isArray(provider)) {
        compileProvider = this.getProvidersMetadata(provider, targetEntryComponents, debugInfo);
      } else if (provider instanceof cpl.ProviderMeta) {
        let tokenMeta = this.getTokenMetadata(provider.token);
        if (tokenMeta.reference ===
            resolveIdentifierToken(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS).reference) {
          targetEntryComponents.push(...this._getEntryComponentsFromProvider(provider));
        } else {
          compileProvider = this.getProviderMetadata(provider);
        }
      } else if (isValidType(provider)) {
        compileProvider = this.getTypeMetadata(provider, staticTypeModuleUrl(provider));
      } else {
        let providersInfo = (<string[]>providers.reduce(
                                 (soFar: string[], seenProvider: any, seenProviderIdx: number) => {
                                   if (seenProviderIdx < providerIdx) {
                                     soFar.push(`${stringify(seenProvider)}`);
                                   } else if (seenProviderIdx == providerIdx) {
                                     soFar.push(`?${stringify(seenProvider)}?`);
                                   } else if (seenProviderIdx == providerIdx + 1) {
                                     soFar.push('...');
                                   }
                                   return soFar;
                                 },
                                 []))
                                .join(', ');

        throw new Error(
            `Invalid ${debugInfo ? debugInfo : 'provider'} - only instances of Provider and Type are allowed, got: [${providersInfo}]`);
      }
      if (compileProvider) {
        compileProviders.push(compileProvider);
      }
    });
    return compileProviders;
  }

  private _getEntryComponentsFromProvider(provider: cpl.ProviderMeta): cpl.CompileTypeMetadata[] {
    let components: cpl.CompileTypeMetadata[] = [];
    let collectedIdentifiers: cpl.CompileIdentifierMetadata[] = [];
    if (provider.useFactory || provider.useExisting || provider.useClass) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`);
    }
    if (!provider.multi) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`);
    }
    convertToCompileValue(provider.useValue, collectedIdentifiers);
    collectedIdentifiers.forEach((identifier) => {
      let dirMeta = this.getDirectiveMetadata(identifier.reference, false);
      if (dirMeta) {
        components.push(dirMeta.type);
      }
    });
    return components;
  }

  getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata {
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
      directiveType: Type<any>): cpl.CompileQueryMetadata[] {
    var res: cpl.CompileQueryMetadata[] = [];
    StringMapWrapper.forEach(queries, (query: QueryMetadata, propertyName: string) => {
      if (query.isViewQuery === isViewQuery) {
        res.push(this.getQueryMetadata(query, propertyName, directiveType));
      }
    });
    return res;
  }

  getQueryMetadata(q: QueryMetadata, propertyName: string, typeOrFunc: Type<any>|Function):
      cpl.CompileQueryMetadata {
    var selectors: cpl.CompileTokenMetadata[];
    if (q.isVarBindingQuery) {
      selectors = q.varBindings.map(varName => this.getTokenMetadata(varName));
    } else {
      if (!isPresent(q.selector)) {
        throw new Error(
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
    visitedModules = new Set<Type<any>>()): cpl.CompileNgModuleMetadata[] {
  modules.forEach((ngModule) => {
    if (!visitedModules.has(ngModule.type.reference)) {
      visitedModules.add(ngModule.type.reference);
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
          {name: value.name, moduleUrl: value.filePath, reference: value});
    } else {
      identifier = new cpl.CompileIdentifierMetadata({reference: value});
    }
    targetIdentifiers.push(identifier);
    return identifier;
  }
}
