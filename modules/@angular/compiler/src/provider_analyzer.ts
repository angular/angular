/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileDirectiveSummary, CompileNgModuleMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTokenMetadata, CompileTypeMetadata, tokenName, tokenReference} from './compile_metadata';
import {isBlank, isPresent} from './facade/lang';
import {Identifiers, resolveIdentifier} from './identifiers';
import {ParseError, ParseSourceSpan} from './parse_util';
import {AttrAst, DirectiveAst, ProviderAst, ProviderAstType, ReferenceAst} from './template_parser/template_ast';

export class ProviderError extends ParseError {
  constructor(message: string, span: ParseSourceSpan) { super(span, message); }
}

export class ProviderViewContext {
  /**
   * @internal
   */
  viewQueries: Map<any, CompileQueryMetadata[]>;
  /**
   * @internal
   */
  viewProviders: Map<any, boolean>;
  errors: ProviderError[] = [];

  constructor(public component: CompileDirectiveMetadata, public sourceSpan: ParseSourceSpan) {
    this.viewQueries = _getViewQueries(component);
    this.viewProviders = new Map<any, boolean>();
    component.viewProviders.forEach((provider) => {
      if (isBlank(this.viewProviders.get(tokenReference(provider.token)))) {
        this.viewProviders.set(tokenReference(provider.token), true);
      }
    });
  }
}

export class ProviderElementContext {
  private _contentQueries: Map<any, CompileQueryMetadata[]>;

  private _transformedProviders = new Map<any, ProviderAst>();
  private _seenProviders = new Map<any, boolean>();
  private _allProviders: Map<any, ProviderAst>;
  private _attrs: {[key: string]: string};
  private _hasViewContainer: boolean = false;

  constructor(
      public viewContext: ProviderViewContext, private _parent: ProviderElementContext,
      private _isViewRoot: boolean, private _directiveAsts: DirectiveAst[], attrs: AttrAst[],
      refs: ReferenceAst[], private _sourceSpan: ParseSourceSpan) {
    this._attrs = {};
    attrs.forEach((attrAst) => this._attrs[attrAst.name] = attrAst.value);
    const directivesMeta = _directiveAsts.map(directiveAst => directiveAst.directive);
    this._allProviders =
        _resolveProvidersFromDirectives(directivesMeta, _sourceSpan, viewContext.errors);
    this._contentQueries = _getContentQueries(directivesMeta);
    const queriedTokens = new Map<any, boolean>();
    Array.from(this._allProviders.values()).forEach((provider) => {
      this._addQueryReadsTo(provider.token, queriedTokens);
    });
    refs.forEach((refAst) => { this._addQueryReadsTo({value: refAst.name}, queriedTokens); });
    if (isPresent(queriedTokens.get(resolveIdentifier(Identifiers.ViewContainerRef)))) {
      this._hasViewContainer = true;
    }

    // create the providers that we know are eager first
    Array.from(this._allProviders.values()).forEach((provider) => {
      const eager = provider.eager || isPresent(queriedTokens.get(tokenReference(provider.token)));
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
    return Array.from(this._transformedProviders.values());
  }

  get transformedDirectiveAsts(): DirectiveAst[] {
    const sortedProviderTypes = this.transformProviders.map(provider => provider.token.identifier);
    const sortedDirectives = this._directiveAsts.slice();
    sortedDirectives.sort(
        (dir1, dir2) => sortedProviderTypes.indexOf(dir1.directive.type) -
            sortedProviderTypes.indexOf(dir2.directive.type));
    return sortedDirectives;
  }

  get transformedHasViewContainer(): boolean { return this._hasViewContainer; }

  private _addQueryReadsTo(token: CompileTokenMetadata, queryReadTokens: Map<any, boolean>) {
    this._getQueriesFor(token).forEach((query) => {
      const queryReadToken = query.read || token;
      if (isBlank(queryReadTokens.get(tokenReference(queryReadToken)))) {
        queryReadTokens.set(tokenReference(queryReadToken), true);
      }
    });
  }

  private _getQueriesFor(token: CompileTokenMetadata): CompileQueryMetadata[] {
    const result: CompileQueryMetadata[] = [];
    let currentEl: ProviderElementContext = this;
    let distance = 0;
    let queries: CompileQueryMetadata[];
    while (currentEl !== null) {
      queries = currentEl._contentQueries.get(tokenReference(token));
      if (queries) {
        result.push(...queries.filter((query) => query.descendants || distance <= 1));
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
      eager: boolean): ProviderAst {
    const resolvedProvider = this._allProviders.get(tokenReference(token));
    if (!resolvedProvider || ((requestingProviderType === ProviderAstType.Directive ||
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
    if (isPresent(this._seenProviders.get(tokenReference(token)))) {
      this.viewContext.errors.push(new ProviderError(
          `Cannot instantiate cyclic dependency! ${tokenName(token)}`, this._sourceSpan));
      return null;
    }
    this._seenProviders.set(tokenReference(token), true);
    const transformedProviders = resolvedProvider.providers.map((provider) => {
      let transformedUseValue = provider.useValue;
      let transformedUseExisting = provider.useExisting;
      let transformedDeps: CompileDiDependencyMetadata[];
      if (isPresent(provider.useExisting)) {
        const existingDiDep = this._getDependency(
            resolvedProvider.providerType, {token: provider.useExisting}, eager);
        if (isPresent(existingDiDep.token)) {
          transformedUseExisting = existingDiDep.token;
        } else {
          transformedUseExisting = null;
          transformedUseValue = existingDiDep.value;
        }
      } else if (provider.useFactory) {
        const deps = provider.deps || provider.useFactory.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager));
      } else if (provider.useClass) {
        const deps = provider.deps || provider.useClass.diDeps;
        transformedDeps =
            deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep, eager));
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
      eager: boolean = null): CompileDiDependencyMetadata {
    if (dep.isAttribute) {
      const attrValue = this._attrs[dep.token.value];
      return {isValue: true, value: attrValue == null ? null : attrValue};
    }

    if (isPresent(dep.token)) {
      // access builtints
      if ((requestingProviderType === ProviderAstType.Directive ||
           requestingProviderType === ProviderAstType.Component)) {
        if (tokenReference(dep.token) === resolveIdentifier(Identifiers.Renderer) ||
            tokenReference(dep.token) === resolveIdentifier(Identifiers.ElementRef) ||
            tokenReference(dep.token) === resolveIdentifier(Identifiers.ChangeDetectorRef) ||
            tokenReference(dep.token) === resolveIdentifier(Identifiers.TemplateRef)) {
          return dep;
        }
        if (tokenReference(dep.token) === resolveIdentifier(Identifiers.ViewContainerRef)) {
          this._hasViewContainer = true;
        }
      }
      // access the injector
      if (tokenReference(dep.token) === resolveIdentifier(Identifiers.Injector)) {
        return dep;
      }
      // access providers
      if (isPresent(this._getOrCreateLocalProvider(requestingProviderType, dep.token, eager))) {
        return dep;
      }
    }
    return null;
  }

  private _getDependency(
      requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata,
      eager: boolean = null): CompileDiDependencyMetadata {
    let currElement: ProviderElementContext = this;
    let currEager: boolean = eager;
    let result: CompileDiDependencyMetadata = null;
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
            this.viewContext.component.type.reference === tokenReference(dep.token) ||
            isPresent(this.viewContext.viewProviders.get(tokenReference(dep.token)))) {
          result = dep;
        } else {
          result = dep.isOptional ? result = {isValue: true, value: null} : null;
        }
      }
    }
    if (!result) {
      this.viewContext.errors.push(
          new ProviderError(`No provider for ${tokenName(dep.token)}`, this._sourceSpan));
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
      ngModule: CompileNgModuleMetadata, extraProviders: CompileProviderMetadata[],
      sourceSpan: ParseSourceSpan) {
    this._allProviders = new Map<any, ProviderAst>();
    ngModule.transitiveModule.modules.forEach((ngModuleType: CompileTypeMetadata) => {
      const ngModuleProvider = {token: {identifier: ngModuleType}, useClass: ngModuleType};
      _resolveProviders(
          [ngModuleProvider], ProviderAstType.PublicService, true, sourceSpan, this._errors,
          this._allProviders);
    });
    _resolveProviders(
        ngModule.transitiveModule.providers.map(entry => entry.provider).concat(extraProviders),
        ProviderAstType.PublicService, false, sourceSpan, this._errors, this._allProviders);
  }

  parse(): ProviderAst[] {
    Array.from(this._allProviders.values()).forEach((provider) => {
      this._getOrCreateLocalProvider(provider.token, provider.eager);
    });
    if (this._errors.length > 0) {
      const errorString = this._errors.join('\n');
      throw new Error(`Provider parse errors:\n${errorString}`);
    }
    return Array.from(this._transformedProviders.values());
  }

  private _getOrCreateLocalProvider(token: CompileTokenMetadata, eager: boolean): ProviderAst {
    const resolvedProvider = this._allProviders.get(tokenReference(token));
    if (!resolvedProvider) {
      return null;
    }
    let transformedProviderAst = this._transformedProviders.get(tokenReference(token));
    if (transformedProviderAst) {
      return transformedProviderAst;
    }
    if (isPresent(this._seenProviders.get(tokenReference(token)))) {
      this._errors.push(new ProviderError(
          `Cannot instantiate cyclic dependency! ${tokenName(token)}`,
          resolvedProvider.sourceSpan));
      return null;
    }
    this._seenProviders.set(tokenReference(token), true);
    const transformedProviders = resolvedProvider.providers.map((provider) => {
      let transformedUseValue = provider.useValue;
      let transformedUseExisting = provider.useExisting;
      let transformedDeps: CompileDiDependencyMetadata[];
      if (isPresent(provider.useExisting)) {
        const existingDiDep =
            this._getDependency({token: provider.useExisting}, eager, resolvedProvider.sourceSpan);
        if (isPresent(existingDiDep.token)) {
          transformedUseExisting = existingDiDep.token;
        } else {
          transformedUseExisting = null;
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
      dep: CompileDiDependencyMetadata, eager: boolean = null,
      requestorSourceSpan: ParseSourceSpan): CompileDiDependencyMetadata {
    let foundLocal = false;
    if (!dep.isSkipSelf && isPresent(dep.token)) {
      // access the injector
      if (tokenReference(dep.token) === resolveIdentifier(Identifiers.Injector) ||
          tokenReference(dep.token) === resolveIdentifier(Identifiers.ComponentFactoryResolver)) {
        foundLocal = true;
        // access providers
      } else if (isPresent(this._getOrCreateLocalProvider(dep.token, eager))) {
        foundLocal = true;
      }
    }
    let result: CompileDiDependencyMetadata = dep;
    if (dep.isSelf && !foundLocal) {
      if (dep.isOptional) {
        result = {isValue: true, value: null};
      } else {
        this._errors.push(
            new ProviderError(`No provider for ${tokenName(dep.token)}`, requestorSourceSpan));
      }
    }
    return result;
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
      provider.providerType, provider.lifecycleHooks, provider.sourceSpan);
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
        sourceSpan, targetErrors, providersByToken);
  });

  // Note: directives need to be able to overwrite providers of a component!
  const directivesWithComponentFirst =
      directives.filter(dir => dir.isComponent).concat(directives.filter(dir => !dir.isComponent));
  directivesWithComponentFirst.forEach((directive) => {
    _resolveProviders(
        directive.providers, ProviderAstType.PublicService, false, sourceSpan, targetErrors,
        providersByToken);
    _resolveProviders(
        directive.viewProviders, ProviderAstType.PrivateService, false, sourceSpan, targetErrors,
        providersByToken);
  });
  return providersByToken;
}

function _resolveProviders(
    providers: CompileProviderMetadata[], providerType: ProviderAstType, eager: boolean,
    sourceSpan: ParseSourceSpan, targetErrors: ParseError[],
    targetProvidersByToken: Map<any, ProviderAst>) {
  providers.forEach((provider) => {
    let resolvedProvider = targetProvidersByToken.get(tokenReference(provider.token));
    if (isPresent(resolvedProvider) && !!resolvedProvider.multiProvider !== !!provider.multi) {
      targetErrors.push(new ProviderError(
          `Mixing multi and non multi provider is not possible for token ${tokenName(resolvedProvider.token)}`,
          sourceSpan));
    }
    if (!resolvedProvider) {
      const lifecycleHooks = provider.token.identifier &&
              (<CompileTypeMetadata>provider.token.identifier).lifecycleHooks ?
          (<CompileTypeMetadata>provider.token.identifier).lifecycleHooks :
          [];
      resolvedProvider = new ProviderAst(
          provider.token, provider.multi, eager || lifecycleHooks.length > 0, [provider],
          providerType, lifecycleHooks, sourceSpan);
      targetProvidersByToken.set(tokenReference(provider.token), resolvedProvider);
    } else {
      if (!provider.multi) {
        resolvedProvider.providers.length = 0;
      }
      resolvedProvider.providers.push(provider);
    }
  });
}


function _getViewQueries(component: CompileDirectiveMetadata): Map<any, CompileQueryMetadata[]> {
  const viewQueries = new Map<any, CompileQueryMetadata[]>();
  if (component.viewQueries) {
    component.viewQueries.forEach((query) => _addQueryToTokenMap(viewQueries, query));
  }
  return viewQueries;
}

function _getContentQueries(directives: CompileDirectiveSummary[]):
    Map<any, CompileQueryMetadata[]> {
  const contentQueries = new Map<any, CompileQueryMetadata[]>();
  directives.forEach(directive => {
    if (directive.queries) {
      directive.queries.forEach((query) => _addQueryToTokenMap(contentQueries, query));
    }
  });
  return contentQueries;
}

function _addQueryToTokenMap(map: Map<any, CompileQueryMetadata[]>, query: CompileQueryMetadata) {
  query.selectors.forEach((token: CompileTokenMetadata) => {
    let entry = map.get(tokenReference(token));
    if (!entry) {
      entry = [];
      map.set(tokenReference(token), entry);
    }
    entry.push(query);
  });
}
