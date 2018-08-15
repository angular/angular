/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileDirectiveSummary, CompileNgModuleMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTokenMetadata, CompileTypeMetadata, tokenName, tokenReference} from './compile_metadata';
import {CompileReflector} from './compile_reflector';
import {createTokenForExternalReference, Identifiers} from './identifiers';
import {ParseError, ParseSourceSpan} from './parse_util';
import {AttrAst, DirectiveAst, ProviderAst, ProviderAstType, QueryMatch, ReferenceAst} from './template_parser/template_ast';

export class ProviderError extends ParseError {
  constructor(message: string, span: ParseSourceSpan) {
    super(span, message);
  }
}

export interface QueryWithId {
  meta: CompileQueryMetadata;
  queryId: number;
}

export class ProviderViewContext {
  /**
   * @internal
   */
  viewQueries: Map<any, QueryWithId[]>;
  /**
   * @internal
   */
  viewProviders: Map<any, boolean>;
  errors: ProviderError[] = [];

  constructor(public reflector: CompileReflector, public component: CompileDirectiveMetadata) {
    this.viewQueries = _getViewQueries(component);
    this.viewProviders = new Map<any, boolean>();
    component.viewProviders.forEach((provider) => {
      if (this.viewProviders.get(tokenReference(provider.token)) == null) {
        this.viewProviders.set(tokenReference(provider.token), true);
      }
    });
  }
}

export class ProviderElementContext {
  private _contentQueries: Map<any, QueryWithId[]>;

  private _transformedProviders = new Map<any, ProviderAst>();
  private _seenProviders = new Map<any, boolean>();
  private _allProviders: Map<any, ProviderAst>;
  private _attrs: {[key: string]: string};
  private _queriedTokens = new Map<any, QueryMatch[]>();

  public readonly transformedHasViewContainer: boolean = false;

  constructor(
      public viewContext: ProviderViewContext, private _parent: ProviderElementContext,
      private _isViewRoot: boolean, private _directiveAsts: DirectiveAst[], attrs: AttrAst[],
      refs: ReferenceAst[], isTemplate: boolean, contentQueryStartId: number,
      private _sourceSpan: ParseSourceSpan) {
    this._attrs = {};
    attrs.forEach((attrAst) => this._attrs[attrAst.name] = attrAst.value);
    const directivesMeta = _directiveAsts.map(directiveAst => directiveAst.directive);
    this._allProviders =
        _resolveProvidersFromDirectives(directivesMeta, _sourceSpan, viewContext.errors);
    this._contentQueries = _getContentQueries(contentQueryStartId, directivesMeta);
    Array.from(this._allProviders.values()).forEach((provider) => {
      this._addQueryReadsTo(provider.token, provider.token, this._queriedTokens);
    });
    if (isTemplate) {
      const templateRefId =
          createTokenForExternalReference(this.viewContext.reflector, Identifiers.TemplateRef);
      this._addQueryReadsTo(templateRefId, templateRefId, this._queriedTokens);
    }
    refs.forEach((refAst) => {
      let defaultQueryValue = refAst.value ||
          createTokenForExternalReference(this.viewContext.reflector, Identifiers.ElementRef);
      this._addQueryReadsTo({value: refAst.name}, defaultQueryValue, this._queriedTokens);
    });
    if (this._queriedTokens.get(
            this.viewContext.reflector.resolveExternalReference(Identifiers.ViewContainerRef))) {
      this.transformedHasViewContainer = true;
    }

    // create the providers that we know are eager first
    Array.from(this._allProviders.values()).forEach((provider) => {
      const eager = provider.eager || this._queriedTokens.get(tokenReference(provider.token));
      if (eager) {
        this._getOrCreateLocalProvider(provider.providerType, provider.token, true);
      }
    });
  }

  afterElement() {
    // collect lazy providers
    Array.from(this._allProviders.values()).forEach((provider) => {
      this._getOrCreateLocalProvider(provider.providerType, provider.token, false);
    });
  }

  get transformProviders(): ProviderAst[] {
    // Note: Maps keep their insertion order.
    const lazyProviders: ProviderAst[] = [];
    const eagerProviders: ProviderAst[] = [];
    this._transformedProviders.forEach(provider => {
      if (provider.eager) {
        eagerProviders.push(provider);
      } else {
        lazyProviders.push(provider);
      }
    });
    return lazyProviders.concat(eagerProviders);
  }

  get transformedDirectiveAsts(): DirectiveAst[] {
    const sortedProviderTypes = this.transformProviders.map(provider => provider.token.identifier);
    const sortedDirectives = this._directiveAsts.slice();
    sortedDirectives.sort(
        (dir1, dir2) => sortedProviderTypes.indexOf(dir1.directive.type) -
            sortedProviderTypes.indexOf(dir2.directive.type));
    return sortedDirectives;
  }

  get queryMatches(): QueryMatch[] {
    const allMatches: QueryMatch[] = [];
    this._queriedTokens.forEach((matches: QueryMatch[]) => {
      allMatches.push(...matches);
    });
    return allMatches;
  }

  private _addQueryReadsTo(
      token: CompileTokenMetadata, defaultValue: CompileTokenMetadata,
      queryReadTokens: Map<any, QueryMatch[]>) {
    this._getQueriesFor(token).forEach((query) => {
      const queryValue = query.meta.read || defaultValue;
      const tokenRef = tokenReference(queryValue);
      let queryMatches = queryReadTokens.get(tokenRef);
      if (!queryMatches) {
        queryMatches = [];
        queryReadTokens.set(tokenRef, queryMatches);
      }
      queryMatches.push({queryId: query.queryId, value: queryValue});
    });
  }

  private _getQueriesFor(token: CompileTokenMetadata): QueryWithId[] {
    const result: QueryWithId[] = [];
    let currentEl: ProviderElementContext = this;
    let distance = 0;
    let queries: QueryWithId[]|undefined;
    while (currentEl !== null) {
      queries = currentEl._contentQueries.get(tokenReference(token));
      if (queries) {
        result.push(...queries.filter((query) => query.meta.descendants || distance <= 1));
      }
      if (currentEl._directiveAsts.length > 0) {
        distance++;
      }
      currentEl = currentEl._parent;
    }
    queries = this.viewContext.viewQueries.get(tokenReference(token));
    if (queries) {
      result.push(...queries);
    }
    return result;
  }


  private _getOrCreateLocalProvider(
      requestingProviderType: ProviderAstType, token: CompileTokenMetadata,
      eager: boolean): ProviderAst|null {
    const resolvedProvider = this._allProviders.get(tokenReference(token));
    if (!resolvedProvider ||
        ((requestingProviderType === ProviderAstType.Directive ||
          requestingProviderType === ProviderAstType.PublicService) &&
         resolvedProvider.providerType === ProviderAstType.PrivateService) ||
        ((requestingProviderType === ProviderAstType.PrivateService ||
          requestingProviderType === ProviderAstType.PublicService) &&
         resolvedProvider.providerType === ProviderAstType.Builtin)) {
      return null;
    }
    let transformedProviderAst = this._transformedProviders.get(tokenReference(token));
    if (transformedProviderAst) {
      return transformedProviderAst;
    }
    if (this._seenProviders.get(tokenReference(token)) != null) {
      this.viewContext.errors.push(new ProviderError(
          `Cannot instantiate cyclic dependency! ${tokenName(token)}`, this._sourceSpan));
      return null;
    }
    this._seenProviders.set(tokenReference(token), true);
    const transformedProviders = resolvedProvider.providers.map((provider) => {
      let transformedUseValue = provider.useValue;
      let transformedUseExisting = provider.useExisting!;
      let transformedDeps: CompileDiDependencyMetadata[] = undefined!;
      if (provider.useExisting != null) {
        const existingDiDep = this._getDependency(
            resolvedProvider.providerType, {token: provider.useExisting}, eager)!;
        if (existingDiDep.token != null) {
          transformedUseExisting = existingDiDep.token;
        } else {
          transformedUseExisting = null!;
          transformedUseValue = existingDiDep.value;
        }
      } else if (provider.useFactory) {
        const deps = provider.deps || provider.useFactory.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager)!);
      } else if (provider.useClass) {
        const deps = provider.deps || provider.useClass.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager)!);
      }
      return _transformProvider(provider, {
        useExisting: transformedUseExisting,
        useValue: transformedUseValue,
        deps: transformedDeps
      });
    });
    transformedProviderAst =
        _transformProviderAst(resolvedProvider, {eager: eager, providers: transformedProviders});
    this._transformedProviders.set(tokenReference(token), transformedProviderAst);
    return transformedProviderAst;
  }

  private _getLocalDependency(
      requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata,
      eager: boolean = false): CompileDiDependencyMetadata|null {
    if (dep.isAttribute) {
      const attrValue = this._attrs[dep.token!.value];
      return {isValue: true, value: attrValue == null ? null : attrValue};
    }

    if (dep.token != null) {
      // access builtints
      if ((requestingProviderType === ProviderAstType.Directive ||
           requestingProviderType === ProviderAstType.Component)) {
        if (tokenReference(dep.token) ===
                this.viewContext.reflector.resolveExternalReference(Identifiers.Renderer) ||
            tokenReference(dep.token) ===
                this.viewContext.reflector.resolveExternalReference(Identifiers.ElementRef) ||
            tokenReference(dep.token) ===
                this.viewContext.reflector.resolveExternalReference(
                    Identifiers.ChangeDetectorRef) ||
            tokenReference(dep.token) ===
                this.viewContext.reflector.resolveExternalReference(Identifiers.TemplateRef)) {
          return dep;
        }
        if (tokenReference(dep.token) ===
            this.viewContext.reflector.resolveExternalReference(Identifiers.ViewContainerRef)) {
          (this as {transformedHasViewContainer: boolean}).transformedHasViewContainer = true;
        }
      }
      // access the injector
      if (tokenReference(dep.token) ===
          this.viewContext.reflector.resolveExternalReference(Identifiers.Injector)) {
        return dep;
      }
      // access providers
      if (this._getOrCreateLocalProvider(requestingProviderType, dep.token, eager) != null) {
        return dep;
      }
    }
    return null;
  }

  private _getDependency(
      requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata,
      eager: boolean = false): CompileDiDependencyMetadata|null {
    let currElement: ProviderElementContext = this;
    let currEager: boolean = eager;
    let result: CompileDiDependencyMetadata|null = null;
    if (!dep.isSkipSelf) {
      result = this._getLocalDependency(requestingProviderType, dep, eager);
    }
    if (dep.isSelf) {
      if (!result && dep.isOptional) {
        result = {isValue: true, value: null};
      }
    } else {
      // check parent elements
      while (!result && currElement._parent) {
        const prevElement = currElement;
        currElement = currElement._parent;
        if (prevElement._isViewRoot) {
          currEager = false;
        }
        result = currElement._getLocalDependency(ProviderAstType.PublicService, dep, currEager);
      }
      // check @Host restriction
      if (!result) {
        if (!dep.isHost || this.viewContext.component.isHost ||
            this.viewContext.component.type.reference === tokenReference(dep.token!) ||
            this.viewContext.viewProviders.get(tokenReference(dep.token!)) != null) {
          result = dep;
        } else {
          result = dep.isOptional ? {isValue: true, value: null} : null;
        }
      }
    }
    if (!result) {
      this.viewContext.errors.push(
          new ProviderError(`No provider for ${tokenName(dep.token!)}`, this._sourceSpan));
    }
    return result;
  }
}


export class NgModuleProviderAnalyzer {
  private _transformedProviders = new Map<any, ProviderAst>();
  private _seenProviders = new Map<any, boolean>();
  private _allProviders: Map<any, ProviderAst>;
  private _errors: ProviderError[] = [];

  constructor(
      private reflector: CompileReflector, ngModule: CompileNgModuleMetadata,
      extraProviders: CompileProviderMetadata[], sourceSpan: ParseSourceSpan) {
    this._allProviders = new Map<any, ProviderAst>();
    ngModule.transitiveModule.modules.forEach((ngModuleType: CompileTypeMetadata) => {
      const ngModuleProvider = {token: {identifier: ngModuleType}, useClass: ngModuleType};
      _resolveProviders(
          [ngModuleProvider], ProviderAstType.PublicService, true, sourceSpan, this._errors,
          this._allProviders, /* isModule */ true);
    });
    _resolveProviders(
        ngModule.transitiveModule.providers.map(entry => entry.provider).concat(extraProviders),
        ProviderAstType.PublicService, false, sourceSpan, this._errors, this._allProviders,
        /* isModule */ false);
  }

  parse(): ProviderAst[] {
    Array.from(this._allProviders.values()).forEach((provider) => {
      this._getOrCreateLocalProvider(provider.token, provider.eager);
    });
    if (this._errors.length > 0) {
      const errorString = this._errors.join('\n');
      throw new Error(`Provider parse errors:\n${errorString}`);
    }
    // Note: Maps keep their insertion order.
    const lazyProviders: ProviderAst[] = [];
    const eagerProviders: ProviderAst[] = [];
    this._transformedProviders.forEach(provider => {
      if (provider.eager) {
        eagerProviders.push(provider);
      } else {
        lazyProviders.push(provider);
      }
    });
    return lazyProviders.concat(eagerProviders);
  }

  private _getOrCreateLocalProvider(token: CompileTokenMetadata, eager: boolean): ProviderAst|null {
    const resolvedProvider = this._allProviders.get(tokenReference(token));
    if (!resolvedProvider) {
      return null;
    }
    let transformedProviderAst = this._transformedProviders.get(tokenReference(token));
    if (transformedProviderAst) {
      return transformedProviderAst;
    }
    if (this._seenProviders.get(tokenReference(token)) != null) {
      this._errors.push(new ProviderError(
          `Cannot instantiate cyclic dependency! ${tokenName(token)}`,
          resolvedProvider.sourceSpan));
      return null;
    }
    this._seenProviders.set(tokenReference(token), true);
    const transformedProviders = resolvedProvider.providers.map((provider) => {
      let transformedUseValue = provider.useValue;
      let transformedUseExisting = provider.useExisting!;
      let transformedDeps: CompileDiDependencyMetadata[] = undefined!;
      if (provider.useExisting != null) {
        const existingDiDep =
            this._getDependency({token: provider.useExisting}, eager, resolvedProvider.sourceSpan);
        if (existingDiDep.token != null) {
          transformedUseExisting = existingDiDep.token;
        } else {
          transformedUseExisting = null!;
          transformedUseValue = existingDiDep.value;
        }
      } else if (provider.useFactory) {
        const deps = provider.deps || provider.useFactory.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(dep, eager, resolvedProvider.sourceSpan));
      } else if (provider.useClass) {
        const deps = provider.deps || provider.useClass.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(dep, eager, resolvedProvider.sourceSpan));
      }
      return _transformProvider(provider, {
        useExisting: transformedUseExisting,
        useValue: transformedUseValue,
        deps: transformedDeps
      });
    });
    transformedProviderAst =
        _transformProviderAst(resolvedProvider, {eager: eager, providers: transformedProviders});
    this._transformedProviders.set(tokenReference(token), transformedProviderAst);
    return transformedProviderAst;
  }

  private _getDependency(
      dep: CompileDiDependencyMetadata, eager: boolean = false,
      requestorSourceSpan: ParseSourceSpan): CompileDiDependencyMetadata {
    let foundLocal = false;
    if (!dep.isSkipSelf && dep.token != null) {
      // access the injector
      if (tokenReference(dep.token) ===
              this.reflector.resolveExternalReference(Identifiers.Injector) ||
          tokenReference(dep.token) ===
              this.reflector.resolveExternalReference(Identifiers.ComponentFactoryResolver)) {
        foundLocal = true;
        // access providers
      } else if (this._getOrCreateLocalProvider(dep.token, eager) != null) {
        foundLocal = true;
      }
    }
    return dep;
  }
}

function _transformProvider(
    provider: CompileProviderMetadata,
    {useExisting, useValue, deps}:
        {useExisting: CompileTokenMetadata, useValue: any, deps: CompileDiDependencyMetadata[]}) {
  return {
    token: provider.token,
    useClass: provider.useClass,
    useExisting: useExisting,
    useFactory: provider.useFactory,
    useValue: useValue,
    deps: deps,
    multi: provider.multi
  };
}

function _transformProviderAst(
    provider: ProviderAst,
    {eager, providers}: {eager: boolean, providers: CompileProviderMetadata[]}): ProviderAst {
  return new ProviderAst(
      provider.token, provider.multiProvider, provider.eager || eager, providers,
      provider.providerType, provider.lifecycleHooks, provider.sourceSpan, provider.isModule);
}

function _resolveProvidersFromDirectives(
    directives: CompileDirectiveSummary[], sourceSpan: ParseSourceSpan,
    targetErrors: ParseError[]): Map<any, ProviderAst> {
  const providersByToken = new Map<any, ProviderAst>();
  directives.forEach((directive) => {
    const dirProvider:
        CompileProviderMetadata = {token: {identifier: directive.type}, useClass: directive.type};
    _resolveProviders(
        [dirProvider],
        directive.isComponent ? ProviderAstType.Component : ProviderAstType.Directive, true,
        sourceSpan, targetErrors, providersByToken, /* isModule */ false);
  });

  // Note: directives need to be able to overwrite providers of a component!
  const directivesWithComponentFirst =
      directives.filter(dir => dir.isComponent).concat(directives.filter(dir => !dir.isComponent));
  directivesWithComponentFirst.forEach((directive) => {
    _resolveProviders(
        directive.providers, ProviderAstType.PublicService, false, sourceSpan, targetErrors,
        providersByToken, /* isModule */ false);
    _resolveProviders(
        directive.viewProviders, ProviderAstType.PrivateService, false, sourceSpan, targetErrors,
        providersByToken, /* isModule */ false);
  });
  return providersByToken;
}

function _resolveProviders(
    providers: CompileProviderMetadata[], providerType: ProviderAstType, eager: boolean,
    sourceSpan: ParseSourceSpan, targetErrors: ParseError[],
    targetProvidersByToken: Map<any, ProviderAst>, isModule: boolean) {
  providers.forEach((provider) => {
    let resolvedProvider = targetProvidersByToken.get(tokenReference(provider.token));
    if (resolvedProvider != null && !!resolvedProvider.multiProvider !== !!provider.multi) {
      targetErrors.push(new ProviderError(
          `Mixing multi and non multi provider is not possible for token ${
              tokenName(resolvedProvider.token)}`,
          sourceSpan));
    }
    if (!resolvedProvider) {
      const lifecycleHooks = provider.token.identifier &&
              (<CompileTypeMetadata>provider.token.identifier).lifecycleHooks ?
          (<CompileTypeMetadata>provider.token.identifier).lifecycleHooks :
          [];
      const isUseValue = !(provider.useClass || provider.useExisting || provider.useFactory);
      resolvedProvider = new ProviderAst(
          provider.token, !!provider.multi, eager || isUseValue, [provider], providerType,
          lifecycleHooks, sourceSpan, isModule);
      targetProvidersByToken.set(tokenReference(provider.token), resolvedProvider);
    } else {
      if (!provider.multi) {
        resolvedProvider.providers.length = 0;
      }
      resolvedProvider.providers.push(provider);
    }
  });
}


function _getViewQueries(component: CompileDirectiveMetadata): Map<any, QueryWithId[]> {
  // Note: queries start with id 1 so we can use the number in a Bloom filter!
  let viewQueryId = 1;
  const viewQueries = new Map<any, QueryWithId[]>();
  if (component.viewQueries) {
    component.viewQueries.forEach(
        (query) => _addQueryToTokenMap(viewQueries, {meta: query, queryId: viewQueryId++}));
  }
  return viewQueries;
}

function _getContentQueries(
    contentQueryStartId: number, directives: CompileDirectiveSummary[]): Map<any, QueryWithId[]> {
  let contentQueryId = contentQueryStartId;
  const contentQueries = new Map<any, QueryWithId[]>();
  directives.forEach((directive, directiveIndex) => {
    if (directive.queries) {
      directive.queries.forEach(
          (query) => _addQueryToTokenMap(contentQueries, {meta: query, queryId: contentQueryId++}));
    }
  });
  return contentQueries;
}

function _addQueryToTokenMap(map: Map<any, QueryWithId[]>, query: QueryWithId) {
  query.meta.selectors.forEach((token: CompileTokenMetadata) => {
    let entry = map.get(tokenReference(token));
    if (!entry) {
      entry = [];
      map.set(tokenReference(token), entry);
    }
    entry.push(query);
  });
}
