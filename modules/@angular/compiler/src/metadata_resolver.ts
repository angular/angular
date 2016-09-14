/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationAnimateMetadata, AnimationEntryMetadata, AnimationGroupMetadata, AnimationKeyframesSequenceMetadata, AnimationMetadata, AnimationStateDeclarationMetadata, AnimationStateMetadata, AnimationStateTransitionMetadata, AnimationStyleMetadata, AnimationWithStepsMetadata, Attribute, ChangeDetectionStrategy, Component, Host, Inject, Injectable, ModuleWithProviders, Optional, Provider, Query, SchemaMetadata, Self, SkipSelf, Type, resolveForwardRef} from '@angular/core';

import {assertArrayOfStrings, assertInterpolationSymbols} from './assertions';
import * as cpl from './compile_metadata';
import {DirectiveResolver} from './directive_resolver';
import {isBlank, isPresent, isString, stringify} from './facade/lang';
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
      if (!found) {
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
    // Clear all of the NgModule as they contain transitive information!
    this._ngModuleCache.clear();
  }

  clearCache() {
    this._directiveCache.clear();
    this._pipeCache.clear();
    this._ngModuleCache.clear();
    this._ngModuleOfTypes.clear();
  }

  getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata {
    const defs = entry.definitions.map(def => this.getAnimationStateMetadata(def));
    return new cpl.CompileAnimationEntryMetadata(entry.name, defs);
  }

  getAnimationStateMetadata(value: AnimationStateMetadata): cpl.CompileAnimationStateMetadata {
    if (value instanceof AnimationStateDeclarationMetadata) {
      const styles = this.getAnimationStyleMetadata(value.styles);
      return new cpl.CompileAnimationStateDeclarationMetadata(value.stateNameExpr, styles);
    }

    if (value instanceof AnimationStateTransitionMetadata) {
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
    }

    if (value instanceof AnimationKeyframesSequenceMetadata) {
      return new cpl.CompileAnimationKeyframesSequenceMetadata(
          value.steps.map(entry => this.getAnimationStyleMetadata(entry)));
    }

    if (value instanceof AnimationAnimateMetadata) {
      const animateData =
          <cpl.CompileAnimationStyleMetadata|cpl.CompileAnimationKeyframesSequenceMetadata>this
              .getAnimationMetadata(value.styles);
      return new cpl.CompileAnimationAnimateMetadata(value.timings, animateData);
    }

    if (value instanceof AnimationWithStepsMetadata) {
      const steps = value.steps.map(step => this.getAnimationMetadata(step));

      if (value instanceof AnimationGroupMetadata) {
        return new cpl.CompileAnimationGroupMetadata(steps);
      }

      return new cpl.CompileAnimationSequenceMetadata(steps);
    }
    return null;
  }

  getDirectiveMetadata(directiveType: Type<any>, throwIfNotFound = true):
      cpl.CompileDirectiveMetadata {
    directiveType = resolveForwardRef(directiveType);
    let meta = this._directiveCache.get(directiveType);
    if (!meta) {
      const dirMeta = this._directiveResolver.resolve(directiveType, throwIfNotFound);
      if (!dirMeta) {
        return null;
      }
      let templateMeta: cpl.CompileTemplateMetadata = null;
      let changeDetectionStrategy: ChangeDetectionStrategy = null;
      let viewProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      let moduleUrl = staticTypeModuleUrl(directiveType);
      let entryComponentMetadata: cpl.CompileTypeMetadata[] = [];
      let selector = dirMeta.selector;

      if (dirMeta instanceof Component) {
        // Component
        assertArrayOfStrings('styles', dirMeta.styles);
        assertArrayOfStrings('styleUrls', dirMeta.styleUrls);
        assertInterpolationSymbols('interpolation', dirMeta.interpolation);

        const animations = dirMeta.animations ?
            dirMeta.animations.map(e => this.getAnimationEntryMetadata(e)) :
            null;

        templateMeta = new cpl.CompileTemplateMetadata({
          encapsulation: dirMeta.encapsulation,
          template: dirMeta.template,
          templateUrl: dirMeta.templateUrl,
          styles: dirMeta.styles,
          styleUrls: dirMeta.styleUrls,
          animations: animations,
          interpolation: dirMeta.interpolation
        });

        changeDetectionStrategy = dirMeta.changeDetection;
        if (dirMeta.viewProviders) {
          viewProviders = this.getProvidersMetadata(
              dirMeta.viewProviders, entryComponentMetadata,
              `viewProviders for "${stringify(directiveType)}"`);
        }
        moduleUrl = componentModuleUrl(this._reflector, directiveType, dirMeta);
        if (dirMeta.entryComponents) {
          entryComponentMetadata =
              flattenArray(dirMeta.entryComponents)
                  .map((type) => this.getTypeMetadata(type, staticTypeModuleUrl(type)))
                  .concat(entryComponentMetadata);
        }
        if (!selector) {
          selector = this._schemaRegistry.getDefaultComponentElementName();
        }
      } else {
        // Directive
        if (!selector) {
          throw new Error(`Directive ${stringify(directiveType)} has no selector, please add it!`);
        }
      }

      let providers: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      if (isPresent(dirMeta.providers)) {
        providers = this.getProvidersMetadata(
            dirMeta.providers, entryComponentMetadata,
            `providers for "${stringify(directiveType)}"`);
      }
      let queries: cpl.CompileQueryMetadata[] = [];
      let viewQueries: cpl.CompileQueryMetadata[] = [];
      if (isPresent(dirMeta.queries)) {
        queries = this.getQueriesMetadata(dirMeta.queries, false, directiveType);
        viewQueries = this.getQueriesMetadata(dirMeta.queries, true, directiveType);
      }

      meta = cpl.CompileDirectiveMetadata.create({
        selector: selector,
        exportAs: dirMeta.exportAs,
        isComponent: !!templateMeta,
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
    let compileMeta = this._ngModuleCache.get(moduleType);
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
            const importedMeta = this.getNgModuleMetadata(importedModuleType, false);
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
        providers,
        entryComponents,
        bootstrapComponents,
        schemas,
        declaredDirectives,
        exportedDirectives,
        declaredPipes,
        exportedPipes,
        importedModules,
        exportedModules,
        transitiveModule,
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
    }

    if (this._pipeResolver.resolve(type, false) !== null) {
      return 'pipe';
    }

    if (this._ngModuleResolver.resolve(type, false) !== null) {
      return 'module';
    }

    if ((type as any).provide) {
      return 'provider';
    }

    return 'value';
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
      moduleUrl,
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
      moduleUrl,
      reference: factory,
      diDeps: this.getDependenciesMetadata(factory, dependencies)
    });
  }

  getPipeMetadata(pipeType: Type<any>, throwIfNotFound = true): cpl.CompilePipeMetadata {
    pipeType = resolveForwardRef(pipeType);
    let meta = this._pipeCache.get(pipeType);
    if (!meta) {
      const pipeMeta = this._pipeResolver.resolve(pipeType, throwIfNotFound);
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
    let params = dependencies || this._reflector.parameters(typeOrFunc) || [];

    let dependenciesMetadata: cpl.CompileDiDependencyMetadata[] = params.map((param) => {
      let isAttribute = false;
      let isHost = false;
      let isSelf = false;
      let isSkipSelf = false;
      let isOptional = false;
      let query: Query = null;
      let viewQuery: Query = null;
      var token: any = null;
      if (Array.isArray(param)) {
        param.forEach((paramEntry) => {
          if (paramEntry instanceof Host) {
            isHost = true;
          } else if (paramEntry instanceof Self) {
            isSelf = true;
          } else if (paramEntry instanceof SkipSelf) {
            isSkipSelf = true;
          } else if (paramEntry instanceof Optional) {
            isOptional = true;
          } else if (paramEntry instanceof Attribute) {
            isAttribute = true;
            token = paramEntry.attributeName;
          } else if (paramEntry instanceof Query) {
            if (paramEntry.isViewQuery) {
              viewQuery = paramEntry;
            } else {
              query = paramEntry;
            }
          } else if (paramEntry instanceof Inject) {
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
        isAttribute,
        isHost,
        isSelf,
        isSkipSelf,
        isOptional,
        query: query ? this.getQueryMetadata(query, null, typeOrFunc) : null,
        viewQuery: viewQuery ? this.getQueryMetadata(viewQuery, null, typeOrFunc) : null,
        token: this.getTokenMetadata(token)
      });

    });

    if (hasUnknownDeps) {
      let depsTokens =
          dependenciesMetadata.map((dep) => dep ? stringify(dep.token) : '?').join(', ');
      throw new Error(
          `Can't resolve all parameters for ${stringify(typeOrFunc)}: (${depsTokens}).`);
    }

    return dependenciesMetadata;
  }

  getTokenMetadata(token: any): cpl.CompileTokenMetadata {
    token = resolveForwardRef(token);
    let compileToken: cpl.CompileTokenMetadata;
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
      if (Array.isArray(provider)) {
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
    const components: cpl.CompileTypeMetadata[] = [];
    const collectedIdentifiers: cpl.CompileIdentifierMetadata[] = [];

    if (provider.useFactory || provider.useExisting || provider.useClass) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`);
    }

    if (!provider.multi) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`);
    }

    convertToCompileValue(provider.useValue, collectedIdentifiers);
    collectedIdentifiers.forEach((identifier) => {
      const dirMeta = this.getDirectiveMetadata(identifier.reference, false);
      if (dirMeta) {
        components.push(dirMeta.type);
      }
    });
    return components;
  }

  getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata {
    let compileDeps: cpl.CompileDiDependencyMetadata[];
    let compileTypeMetadata: cpl.CompileTypeMetadata = null;
    let compileFactoryMetadata: cpl.CompileFactoryMetadata = null;

    if (provider.useClass) {
      compileTypeMetadata = this.getTypeMetadata(
          provider.useClass, staticTypeModuleUrl(provider.useClass), provider.dependencies);
      compileDeps = compileTypeMetadata.diDeps;
    } else if (provider.useFactory) {
      compileFactoryMetadata = this.getFactoryMetadata(
          provider.useFactory, staticTypeModuleUrl(provider.useFactory), provider.dependencies);
      compileDeps = compileFactoryMetadata.diDeps;
    }

    return new cpl.CompileProviderMetadata({
      token: this.getTokenMetadata(provider.token),
      useClass: compileTypeMetadata,
      useValue: convertToCompileValue(provider.useValue, []),
      useFactory: compileFactoryMetadata,
      useExisting: provider.useExisting ? this.getTokenMetadata(provider.useExisting) : null,
      deps: compileDeps,
      multi: provider.multi
    });
  }

  getQueriesMetadata(
      queries: {[key: string]: Query}, isViewQuery: boolean,
      directiveType: Type<any>): cpl.CompileQueryMetadata[] {
    const res: cpl.CompileQueryMetadata[] = [];

    Object.keys(queries).forEach((propertyName: string) => {
      const query = queries[propertyName];
      if (query.isViewQuery === isViewQuery) {
        res.push(this.getQueryMetadata(query, propertyName, directiveType));
      }
    });

    return res;
  }

  private _queryVarBindings(selector: any): string[] { return selector.split(/\s*,\s*/); }

  getQueryMetadata(q: Query, propertyName: string, typeOrFunc: Type<any>|Function):
      cpl.CompileQueryMetadata {
    var selectors: cpl.CompileTokenMetadata[];
    if (typeof q.selector === 'string') {
      selectors = this._queryVarBindings(q.selector).map(varName => this.getTokenMetadata(varName));
    } else {
      if (!q.selector) {
        throw new Error(
            `Can't construct a query for the property "${propertyName}" of "${stringify(typeOrFunc)}" since the query selector wasn't defined.`);
      }
      selectors = [this.getTokenMetadata(q.selector)];
    }

    return new cpl.CompileQueryMetadata({
      selectors,
      first: q.first,
      descendants: q.descendants, propertyName,
      read: q.read ? this.getTokenMetadata(q.read) : null
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
    for (let i = 0; i < tree.length; i++) {
      const item = resolveForwardRef(tree[i]);
      if (Array.isArray(item)) {
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
    reflector: ReflectorReader, type: Type<any>, cmpMetadata: Component): string {
  if (cpl.isStaticSymbol(type)) {
    return staticTypeModuleUrl(type);
  }

  const moduleId = cmpMetadata.moduleId;

  if (typeof moduleId === 'string') {
    const scheme = getUrlScheme(moduleId);
    return scheme ? moduleId : `package:${moduleId}${MODULE_SUFFIX}`;
  } else if (moduleId !== null && moduleId !== void 0) {
    throw new Error(
        `moduleId should be a string in "${stringify(type)}". See https://goo.gl/wIDDiL for more information.\n` +
        `If you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.`);
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
