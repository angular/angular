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
import {DirectiveNormalizer} from './directive_normalizer';
import {DirectiveResolver} from './directive_resolver';
import {ListWrapper, StringMapWrapper} from './facade/collection';
import {isBlank, isPresent, stringify} from './facade/lang';
import {Identifiers, resolveIdentifierToken} from './identifiers';
import {hasLifecycleHook} from './lifecycle_reflector';
import {NgModuleResolver} from './ng_module_resolver';
import {PipeResolver} from './pipe_resolver';
import {ComponentStillLoadingError, LIFECYCLE_HOOKS_VALUES, ReflectorReader, reflector} from './private_import_core';
import {ElementSchemaRegistry} from './schema/element_schema_registry';
import {getUrlScheme} from './url_resolver';
import {MODULE_SUFFIX, SyncAsyncResult, ValueTransformer, sanitizeIdentifier, visitValue} from './util';



// Design notes:
// - don't lazily create metadata:
//   For some metadata, we need to do async work sometimes,
//   so the user has to kick off this loading.
//   But we want to report errors even when the async work is
//   not required to check that the user would have been able
//   to wait correctly.
@Injectable()
export class CompileMetadataResolver {
  private _directiveCache = new Map<Type<any>, cpl.CompileDirectiveMetadata>();
  private _directiveSummaryCache = new Map<Type<any>, cpl.CompileDirectiveSummary>();
  private _pipeCache = new Map<Type<any>, cpl.CompilePipeMetadata>();
  private _pipeSummaryCache = new Map<Type<any>, cpl.CompilePipeSummary>();
  private _ngModuleCache = new Map<Type<any>, cpl.CompileNgModuleMetadata>();
  private _ngModuleOfTypes = new Map<Type<any>, Type<any>>();
  private _anonymousTypes = new Map<Object, number>();
  private _anonymousTypeIndex = 0;

  constructor(
      private _ngModuleResolver: NgModuleResolver, private _directiveResolver: DirectiveResolver,
      private _pipeResolver: PipeResolver, private _schemaRegistry: ElementSchemaRegistry,
      private _directiveNormalizer: DirectiveNormalizer,
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
    const dirMeta = this._directiveCache.get(type);
    this._directiveCache.delete(type);
    this._directiveSummaryCache.delete(type);
    this._pipeCache.delete(type);
    this._pipeSummaryCache.delete(type);
    this._ngModuleOfTypes.delete(type);
    // Clear all of the NgModule as they contain transitive information!
    this._ngModuleCache.clear();
    if (dirMeta) {
      this._directiveNormalizer.clearCacheFor(dirMeta);
    }
  }

  clearCache() {
    this._directiveCache.clear();
    this._directiveSummaryCache.clear();
    this._pipeCache.clear();
    this._pipeSummaryCache.clear();
    this._ngModuleCache.clear();
    this._ngModuleOfTypes.clear();
    this._directiveNormalizer.clearCache();
  }

  getAnimationEntryMetadata(entry: AnimationEntryMetadata): cpl.CompileAnimationEntryMetadata {
    const defs = entry.definitions.map(def => this._getAnimationStateMetadata(def));
    return new cpl.CompileAnimationEntryMetadata(entry.name, defs);
  }

  private _getAnimationStateMetadata(value: AnimationStateMetadata):
      cpl.CompileAnimationStateMetadata {
    if (value instanceof AnimationStateDeclarationMetadata) {
      const styles = this._getAnimationStyleMetadata(value.styles);
      return new cpl.CompileAnimationStateDeclarationMetadata(value.stateNameExpr, styles);
    }

    if (value instanceof AnimationStateTransitionMetadata) {
      return new cpl.CompileAnimationStateTransitionMetadata(
          value.stateChangeExpr, this._getAnimationMetadata(value.steps));
    }

    return null;
  }

  private _getAnimationStyleMetadata(value: AnimationStyleMetadata):
      cpl.CompileAnimationStyleMetadata {
    return new cpl.CompileAnimationStyleMetadata(value.offset, value.styles);
  }

  private _getAnimationMetadata(value: AnimationMetadata): cpl.CompileAnimationMetadata {
    if (value instanceof AnimationStyleMetadata) {
      return this._getAnimationStyleMetadata(value);
    }

    if (value instanceof AnimationKeyframesSequenceMetadata) {
      return new cpl.CompileAnimationKeyframesSequenceMetadata(
          value.steps.map(entry => this._getAnimationStyleMetadata(entry)));
    }

    if (value instanceof AnimationAnimateMetadata) {
      const animateData =
          <cpl.CompileAnimationStyleMetadata|cpl.CompileAnimationKeyframesSequenceMetadata>this
              ._getAnimationMetadata(value.styles);
      return new cpl.CompileAnimationAnimateMetadata(value.timings, animateData);
    }

    if (value instanceof AnimationWithStepsMetadata) {
      const steps = value.steps.map(step => this._getAnimationMetadata(step));

      if (value instanceof AnimationGroupMetadata) {
        return new cpl.CompileAnimationGroupMetadata(steps);
      }

      return new cpl.CompileAnimationSequenceMetadata(steps);
    }
    return null;
  }

  private _loadDirectiveMetadata(directiveType: any, isSync: boolean): Promise<any> {
    if (this._directiveCache.has(directiveType)) {
      return;
    }
    directiveType = resolveForwardRef(directiveType);
    const dirMeta = this._directiveResolver.resolve(directiveType);
    if (!dirMeta) {
      return null;
    }
    let moduleUrl = staticTypeModuleUrl(directiveType);

    const createDirectiveMetadata = (templateMeta: cpl.CompileTemplateMetadata) => {
      let changeDetectionStrategy: ChangeDetectionStrategy = null;
      let viewProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
      let entryComponentMetadata: cpl.CompileIdentifierMetadata[] = [];
      let selector = dirMeta.selector;

      if (dirMeta instanceof Component) {
        // Component
        changeDetectionStrategy = dirMeta.changeDetection;
        if (dirMeta.viewProviders) {
          viewProviders = this._getProvidersMetadata(
              dirMeta.viewProviders, entryComponentMetadata,
              `viewProviders for "${stringify(directiveType)}"`);
        }
        if (dirMeta.entryComponents) {
          entryComponentMetadata =
              flattenAndDedupeArray(dirMeta.entryComponents)
                  .map((type) => this._getIdentifierMetadata(type, staticTypeModuleUrl(type)))
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
        providers = this._getProvidersMetadata(
            dirMeta.providers, entryComponentMetadata,
            `providers for "${stringify(directiveType)}"`);
      }
      let queries: cpl.CompileQueryMetadata[] = [];
      let viewQueries: cpl.CompileQueryMetadata[] = [];
      if (isPresent(dirMeta.queries)) {
        queries = this._getQueriesMetadata(dirMeta.queries, false, directiveType);
        viewQueries = this._getQueriesMetadata(dirMeta.queries, true, directiveType);
      }

      const meta = cpl.CompileDirectiveMetadata.create({
        selector: selector,
        exportAs: dirMeta.exportAs,
        isComponent: !!templateMeta,
        type: this._getTypeMetadata(directiveType, moduleUrl),
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
      this._directiveSummaryCache.set(directiveType, meta.toSummary());
      return meta;
    };

    if (dirMeta instanceof Component) {
      // component
      moduleUrl = componentModuleUrl(this._reflector, directiveType, dirMeta);
      assertArrayOfStrings('styles', dirMeta.styles);
      assertArrayOfStrings('styleUrls', dirMeta.styleUrls);
      assertInterpolationSymbols('interpolation', dirMeta.interpolation);

      const animations = dirMeta.animations ?
          dirMeta.animations.map(e => this.getAnimationEntryMetadata(e)) :
          null;

      const templateMeta = this._directiveNormalizer.normalizeTemplate({
        componentType: directiveType,
        moduleUrl: moduleUrl,
        encapsulation: dirMeta.encapsulation,
        template: dirMeta.template,
        templateUrl: dirMeta.templateUrl,
        styles: dirMeta.styles,
        styleUrls: dirMeta.styleUrls,
        animations: animations,
        interpolation: dirMeta.interpolation
      });
      if (templateMeta.syncResult) {
        createDirectiveMetadata(templateMeta.syncResult);
        return null;
      } else {
        if (isSync) {
          throw new ComponentStillLoadingError(directiveType);
        }
        return templateMeta.asyncResult.then(createDirectiveMetadata);
      }
    } else {
      // directive
      createDirectiveMetadata(null);
      return null;
    }
  }

  /**
   * Gets the metadata for the given directive.
   * This assumes `loadNgModuleMetadata` has been called first.
   */
  getDirectiveMetadata(directiveType: any): cpl.CompileDirectiveMetadata {
    const dirMeta = this._directiveCache.get(directiveType);
    if (!dirMeta) {
      throw new Error(
          `Illegal state: getDirectiveMetadata can only be called after loadNgModuleMetadata for a module that declares it. Directive ${stringify(directiveType)}.`);
    }
    return dirMeta;
  }

  getDirectiveSummary(dirType: any): cpl.CompileDirectiveSummary {
    const dirSummary = this._directiveSummaryCache.get(dirType);
    if (!dirSummary) {
      throw new Error(
          `Illegal state: getDirectiveSummary can only be called after loadNgModuleMetadata for a module that imports it. Directive ${stringify(dirType)}.`);
    }
    return dirSummary;
  }

  isDirective(type: any) { return this._directiveResolver.isDirective(type); }

  isPipe(type: any) { return this._pipeResolver.isPipe(type); }

  /**
   * Gets the metadata for the given module.
   * This assumes `loadNgModuleMetadata` has been called first.
   */
  getNgModuleMetadata(moduleType: any): cpl.CompileNgModuleMetadata {
    const modMeta = this._ngModuleCache.get(moduleType);
    if (!modMeta) {
      throw new Error(
          `Illegal state: getNgModuleMetadata can only be called after loadNgModuleMetadata. Module ${stringify(moduleType)}.`);
    }
    return modMeta;
  }

  private _loadNgModuleSummary(moduleType: any, isSync: boolean): cpl.CompileNgModuleSummary {
    // TODO(tbosch): add logic to read summary files!
    // - needs to add directive / pipe summaries to this._directiveSummaryCache /
    // this._pipeSummaryCache as well!
    const moduleMeta = this._loadNgModuleMetadata(moduleType, isSync, false);
    return moduleMeta ? moduleMeta.toSummary() : null;
  }

  /**
   * Loads an NgModule and all of its directives. This includes loading the exported directives of
   * imported modules,
   * but not private directives of imported modules.
   */
  loadNgModuleMetadata(moduleType: any, isSync: boolean, throwIfNotFound = true):
      {ngModule: cpl.CompileNgModuleMetadata, loading: Promise<any>} {
    const ngModule = this._loadNgModuleMetadata(moduleType, isSync, throwIfNotFound);
    const loading =
        ngModule ? Promise.all(ngModule.transitiveModule.loadingPromises) : Promise.resolve(null);
    return {ngModule, loading};
  }

  private _loadNgModuleMetadata(moduleType: any, isSync: boolean, throwIfNotFound = true):
      cpl.CompileNgModuleMetadata {
    moduleType = resolveForwardRef(moduleType);
    let compileMeta = this._ngModuleCache.get(moduleType);
    if (compileMeta) {
      return compileMeta;
    }
    const meta = this._ngModuleResolver.resolve(moduleType, throwIfNotFound);
    if (!meta) {
      return null;
    }
    const declaredDirectives: cpl.CompileIdentifierMetadata[] = [];
    const exportedNonModuleIdentifiers: cpl.CompileIdentifierMetadata[] = [];
    const declaredPipes: cpl.CompileIdentifierMetadata[] = [];
    const importedModules: cpl.CompileNgModuleSummary[] = [];
    const exportedModules: cpl.CompileNgModuleSummary[] = [];
    const providers: any[] = [];
    const entryComponents: cpl.CompileIdentifierMetadata[] = [];
    const bootstrapComponents: cpl.CompileIdentifierMetadata[] = [];
    const schemas: SchemaMetadata[] = [];

    if (meta.imports) {
      flattenAndDedupeArray(meta.imports).forEach((importedType) => {
        let importedModuleType: Type<any>;
        if (isValidType(importedType)) {
          importedModuleType = importedType;
        } else if (importedType && importedType.ngModule) {
          const moduleWithProviders: ModuleWithProviders = importedType;
          importedModuleType = moduleWithProviders.ngModule;
          if (moduleWithProviders.providers) {
            providers.push(...this._getProvidersMetadata(
                moduleWithProviders.providers, entryComponents,
                `provider for the NgModule '${stringify(importedModuleType)}'`));
          }
        }

        if (importedModuleType) {
          const importedModuleSummary = this._loadNgModuleSummary(importedModuleType, isSync);
          if (!importedModuleSummary) {
            throw new Error(
                `Unexpected ${this._getTypeDescriptor(importedType)} '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
          }
          importedModules.push(importedModuleSummary);
        } else {
          throw new Error(
              `Unexpected value '${stringify(importedType)}' imported by the module '${stringify(moduleType)}'`);
        }
      });
    }

    if (meta.exports) {
      flattenAndDedupeArray(meta.exports).forEach((exportedType) => {
        if (!isValidType(exportedType)) {
          throw new Error(
              `Unexpected value '${stringify(exportedType)}' exported by the module '${stringify(moduleType)}'`);
        }
        const exportedModuleSummary = this._loadNgModuleSummary(exportedType, isSync);
        if (exportedModuleSummary) {
          exportedModules.push(exportedModuleSummary);
        } else {
          exportedNonModuleIdentifiers.push(
              this._getIdentifierMetadata(exportedType, staticTypeModuleUrl(exportedType)));
        }
      });
    }

    // Note: This will be modified later, so we rely on
    // getting a new instance every time!
    const transitiveModule = this._getTransitiveNgModuleMetadata(importedModules, exportedModules);
    if (meta.declarations) {
      flattenAndDedupeArray(meta.declarations).forEach((declaredType) => {
        if (!isValidType(declaredType)) {
          throw new Error(
              `Unexpected value '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
        }
        const declaredIdentifier =
            this._getIdentifierMetadata(declaredType, staticTypeModuleUrl(declaredType));
        if (this._directiveResolver.isDirective(declaredType)) {
          transitiveModule.directivesSet.add(declaredType);
          transitiveModule.directives.push(declaredIdentifier);
          declaredDirectives.push(declaredIdentifier);
          this._addTypeToModule(declaredType, moduleType);
          const loadingPromise = this._loadDirectiveMetadata(declaredType, isSync);
          if (loadingPromise) {
            transitiveModule.loadingPromises.push(loadingPromise);
          }
        } else if (this._pipeResolver.isPipe(declaredType)) {
          transitiveModule.pipesSet.add(declaredType);
          transitiveModule.pipes.push(declaredIdentifier);
          declaredPipes.push(declaredIdentifier);
          this._addTypeToModule(declaredType, moduleType);
          this._loadPipeMetadata(declaredType);
        } else {
          throw new Error(
              `Unexpected ${this._getTypeDescriptor(declaredType)} '${stringify(declaredType)}' declared by the module '${stringify(moduleType)}'`);
        }
      });
    }

    const exportedDirectives: cpl.CompileIdentifierMetadata[] = [];
    const exportedPipes: cpl.CompileIdentifierMetadata[] = [];
    exportedNonModuleIdentifiers.forEach((exportedId) => {
      if (transitiveModule.directivesSet.has(exportedId.reference)) {
        exportedDirectives.push(exportedId);
      } else if (transitiveModule.pipesSet.has(exportedId.reference)) {
        exportedPipes.push(exportedId);
      } else {
        throw new Error(
            `Can't export ${this._getTypeDescriptor(exportedId.reference)} ${stringify(exportedId.reference)} from ${stringify(moduleType)} as it was neither declared nor imported!`);
      }
    });

    // The providers of the module have to go last
    // so that they overwrite any other provider we already added.
    if (meta.providers) {
      providers.push(...this._getProvidersMetadata(
          meta.providers, entryComponents, `provider for the NgModule '${stringify(moduleType)}'`));
    }

    if (meta.entryComponents) {
      entryComponents.push(
          ...flattenAndDedupeArray(meta.entryComponents)
              .map(type => this._getTypeMetadata(type, staticTypeModuleUrl(type))));
    }

    if (meta.bootstrap) {
      const typeMetadata = flattenAndDedupeArray(meta.bootstrap).map(type => {
        if (!isValidType(type)) {
          throw new Error(
              `Unexpected value '${stringify(type)}' used in the bootstrap property of module '${stringify(moduleType)}'`);
        }
        return this._getTypeMetadata(type, staticTypeModuleUrl(type));
      });
      bootstrapComponents.push(...typeMetadata);
    }

    entryComponents.push(...bootstrapComponents);

    if (meta.schemas) {
      schemas.push(...flattenAndDedupeArray(meta.schemas));
    }

    transitiveModule.entryComponents.push(...entryComponents);
    transitiveModule.providers.push(...providers);

    compileMeta = new cpl.CompileNgModuleMetadata({
      type: this._getTypeMetadata(moduleType, staticTypeModuleUrl(moduleType)),
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

    transitiveModule.modules.push(compileMeta.toInjectorSummary());
    this._ngModuleCache.set(moduleType, compileMeta);
    return compileMeta;
  }

  private _getTypeDescriptor(type: Type<any>): string {
    if (this._directiveResolver.isDirective(type)) {
      return 'directive';
    }

    if (this._pipeResolver.isPipe(type)) {
      return 'pipe';
    }

    if (this._ngModuleResolver.isNgModule(type)) {
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
      importedModules: cpl.CompileNgModuleSummary[],
      exportedModules: cpl.CompileNgModuleSummary[]): cpl.TransitiveCompileNgModuleMetadata {
    // collect `providers` / `entryComponents` from all imported and all exported modules
    const transitiveModules = getTransitiveImportedModules(importedModules.concat(exportedModules));
    const providers = flattenArray(transitiveModules.map((ngModule) => ngModule.providers));
    const entryComponents =
        flattenArray(transitiveModules.map((ngModule) => ngModule.entryComponents));

    const transitiveExportedModules = getTransitiveExportedModules(importedModules);
    const directives =
        flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedDirectives));
    const pipes = flattenArray(transitiveExportedModules.map((ngModule) => ngModule.exportedPipes));
    const loadingPromises =
        ListWrapper.flatten(transitiveExportedModules.map(ngModule => ngModule.loadingPromises));
    return new cpl.TransitiveCompileNgModuleMetadata(
        transitiveModules, providers, entryComponents, directives, pipes, loadingPromises);
  }

  private _getIdentifierMetadata(type: Type<any>, moduleUrl: string):
      cpl.CompileIdentifierMetadata {
    type = resolveForwardRef(type);
    return new cpl.CompileIdentifierMetadata(
        {name: this.sanitizeTokenName(type), moduleUrl, reference: type});
  }

  private _getTypeMetadata(type: Type<any>, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileTypeMetadata {
    const identifier = this._getIdentifierMetadata(type, moduleUrl);
    return new cpl.CompileTypeMetadata({
      name: identifier.name,
      moduleUrl: identifier.moduleUrl,
      reference: identifier.reference,
      diDeps: this._getDependenciesMetadata(identifier.reference, dependencies),
      lifecycleHooks:
          LIFECYCLE_HOOKS_VALUES.filter(hook => hasLifecycleHook(hook, identifier.reference)),
    });
  }

  private _getFactoryMetadata(factory: Function, moduleUrl: string, dependencies: any[] = null):
      cpl.CompileFactoryMetadata {
    factory = resolveForwardRef(factory);
    return new cpl.CompileFactoryMetadata({
      name: this.sanitizeTokenName(factory),
      moduleUrl,
      reference: factory,
      diDeps: this._getDependenciesMetadata(factory, dependencies)
    });
  }

  /**
   * Gets the metadata for the given pipe.
   * This assumes `loadNgModuleMetadata` has been called first.
   */
  getPipeMetadata(pipeType: any): cpl.CompilePipeMetadata {
    const pipeMeta = this._pipeCache.get(pipeType);
    if (!pipeMeta) {
      throw new Error(
          `Illegal state: getPipeMetadata can only be called after loadNgModuleMetadata for a module that declares it. Pipe ${stringify(pipeType)}.`);
    }
    return pipeMeta;
  }

  getPipeSummary(pipeType: any): cpl.CompilePipeSummary {
    const pipeSummary = this._pipeSummaryCache.get(pipeType);
    if (!pipeSummary) {
      throw new Error(
          `Illegal state: getPipeSummary can only be called after loadNgModuleMetadata for a module that imports it. Pipe ${stringify(pipeType)}.`);
    }
    return pipeSummary;
  }

  private _loadPipeMetadata(pipeType: Type<any>): void {
    pipeType = resolveForwardRef(pipeType);
    const pipeMeta = this._pipeResolver.resolve(pipeType);
    if (!pipeMeta) {
      return null;
    }

    const meta = new cpl.CompilePipeMetadata({
      type: this._getTypeMetadata(pipeType, staticTypeModuleUrl(pipeType)),
      name: pipeMeta.name,
      pure: pipeMeta.pure
    });
    this._pipeCache.set(pipeType, meta);
    this._pipeSummaryCache.set(pipeType, meta.toSummary());
  }

  private _getDependenciesMetadata(typeOrFunc: Type<any>|Function, dependencies: any[]):
      cpl.CompileDiDependencyMetadata[] {
    let hasUnknownDeps = false;
    let params = dependencies || this._reflector.parameters(typeOrFunc) || [];

    let dependenciesMetadata: cpl.CompileDiDependencyMetadata[] = params.map((param) => {
      let isAttribute = false;
      let isHost = false;
      let isSelf = false;
      let isSkipSelf = false;
      let isOptional = false;
      let token: any = null;
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
        token: this._getTokenMetadata(token)
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

  private _getTokenMetadata(token: any): cpl.CompileTokenMetadata {
    token = resolveForwardRef(token);
    let compileToken: cpl.CompileTokenMetadata;
    if (typeof token === 'string') {
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

  private _getProvidersMetadata(
      providers: Provider[], targetEntryComponents: cpl.CompileIdentifierMetadata[],
      debugInfo?: string): Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> {
    const compileProviders: Array<cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[]> = [];
    providers.forEach((provider: any, providerIdx: number) => {
      provider = resolveForwardRef(provider);
      if (provider && typeof provider == 'object' && provider.hasOwnProperty('provide')) {
        provider = new cpl.ProviderMeta(provider.provide, provider);
      }
      let compileProvider: cpl.CompileProviderMetadata|cpl.CompileTypeMetadata|any[];
      if (Array.isArray(provider)) {
        compileProvider = this._getProvidersMetadata(provider, targetEntryComponents, debugInfo);
      } else if (provider instanceof cpl.ProviderMeta) {
        let tokenMeta = this._getTokenMetadata(provider.token);
        if (tokenMeta.reference ===
            resolveIdentifierToken(Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS).reference) {
          targetEntryComponents.push(...this._getEntryComponentsFromProvider(provider));
        } else {
          compileProvider = this.getProviderMetadata(provider);
        }
      } else if (isValidType(provider)) {
        compileProvider = this._getTypeMetadata(provider, staticTypeModuleUrl(provider));
      } else {
        const providersInfo =
            (<string[]>providers.reduce(
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

  private _getEntryComponentsFromProvider(provider: cpl.ProviderMeta):
      cpl.CompileIdentifierMetadata[] {
    const components: cpl.CompileIdentifierMetadata[] = [];
    const collectedIdentifiers: cpl.CompileIdentifierMetadata[] = [];

    if (provider.useFactory || provider.useExisting || provider.useClass) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports useValue!`);
    }

    if (!provider.multi) {
      throw new Error(`The ANALYZE_FOR_ENTRY_COMPONENTS token only supports 'multi = true'!`);
    }

    convertToCompileValue(provider.useValue, collectedIdentifiers);
    collectedIdentifiers.forEach((identifier) => {
      if (this._directiveResolver.isDirective(identifier.reference)) {
        components.push(identifier);
      }
    });
    return components;
  }

  getProviderMetadata(provider: cpl.ProviderMeta): cpl.CompileProviderMetadata {
    let compileDeps: cpl.CompileDiDependencyMetadata[];
    let compileTypeMetadata: cpl.CompileTypeMetadata = null;
    let compileFactoryMetadata: cpl.CompileFactoryMetadata = null;

    if (provider.useClass) {
      compileTypeMetadata = this._getTypeMetadata(
          provider.useClass, staticTypeModuleUrl(provider.useClass), provider.dependencies);
      compileDeps = compileTypeMetadata.diDeps;
    } else if (provider.useFactory) {
      compileFactoryMetadata = this._getFactoryMetadata(
          provider.useFactory, staticTypeModuleUrl(provider.useFactory), provider.dependencies);
      compileDeps = compileFactoryMetadata.diDeps;
    }

    return new cpl.CompileProviderMetadata({
      token: this._getTokenMetadata(provider.token),
      useClass: compileTypeMetadata,
      useValue: convertToCompileValue(provider.useValue, []),
      useFactory: compileFactoryMetadata,
      useExisting: provider.useExisting ? this._getTokenMetadata(provider.useExisting) : null,
      deps: compileDeps,
      multi: provider.multi
    });
  }

  private _getQueriesMetadata(
      queries: {[key: string]: Query}, isViewQuery: boolean,
      directiveType: Type<any>): cpl.CompileQueryMetadata[] {
    const res: cpl.CompileQueryMetadata[] = [];

    Object.keys(queries).forEach((propertyName: string) => {
      const query = queries[propertyName];
      if (query.isViewQuery === isViewQuery) {
        res.push(this._getQueryMetadata(query, propertyName, directiveType));
      }
    });

    return res;
  }

  private _queryVarBindings(selector: any): string[] { return selector.split(/\s*,\s*/); }

  private _getQueryMetadata(q: Query, propertyName: string, typeOrFunc: Type<any>|Function):
      cpl.CompileQueryMetadata {
    var selectors: cpl.CompileTokenMetadata[];
    if (typeof q.selector === 'string') {
      selectors =
          this._queryVarBindings(q.selector).map(varName => this._getTokenMetadata(varName));
    } else {
      if (!q.selector) {
        throw new Error(
            `Can't construct a query for the property "${propertyName}" of "${stringify(typeOrFunc)}" since the query selector wasn't defined.`);
      }
      selectors = [this._getTokenMetadata(q.selector)];
    }

    return new cpl.CompileQueryMetadata({
      selectors,
      first: q.first,
      descendants: q.descendants, propertyName,
      read: q.read ? this._getTokenMetadata(q.read) : null
    });
  }
}

function getTransitiveExportedModules(
    modules: cpl.CompileNgModuleDirectiveSummary[],
    targetModules: cpl.CompileNgModuleDirectiveSummary[] = [],
    visitedModules = new Set<Type<any>>()): cpl.CompileNgModuleDirectiveSummary[] {
  modules.forEach((ngModule) => {
    if (!visitedModules.has(ngModule.type.reference)) {
      visitedModules.add(ngModule.type.reference);
      getTransitiveExportedModules(ngModule.exportedModules, targetModules, visitedModules);
      // Add after recursing so imported/exported modules are before the module itself.
      // This is important for overwriting providers of imported modules!
      targetModules.push(ngModule);
    }
  });
  return targetModules;
}

function getTransitiveImportedModules(
    modules: cpl.CompileNgModuleInjectorSummary[],
    targetModules: cpl.CompileNgModuleInjectorSummary[] = [],
    visitedModules = new Set<Type<any>>()): cpl.CompileNgModuleInjectorSummary[] {
  modules.forEach((ngModule) => {
    if (!visitedModules.has(ngModule.type.reference)) {
      visitedModules.add(ngModule.type.reference);
      const nestedModules = ngModule.importedModules.concat(ngModule.exportedModules);
      getTransitiveImportedModules(nestedModules, targetModules, visitedModules);
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

function dedupeArray(array: any[]): Array<any> {
  if (array) {
    return Array.from(new Set(array));
  }
  return [];
}

function flattenAndDedupeArray(tree: any[]): Array<any> {
  return dedupeArray(flattenArray(tree));
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
