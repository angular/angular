/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileDiDependencyMetadata, CompileDirectiveSummary, CompileProviderMetadata, CompileQueryMetadata, CompileTokenMetadata, tokenName, tokenReference} from '../compile_metadata';
import {createDiTokenExpression} from '../compiler_util/identifier_util';
import {DirectiveWrapperExpressions} from '../directive_wrapper_compiler';
import {isPresent} from '../facade/lang';
import {Identifiers, createIdentifier, createIdentifierToken, identifierToken, resolveIdentifier} from '../identifiers';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ProviderAst, ProviderAstType, ReferenceAst, TemplateAst} from '../template_parser/template_ast';

import {CompileMethod} from './compile_method';
import {CompileQuery, addQueryToTokenMap, createQueryList} from './compile_query';
import {CompileView, CompileViewRootNode} from './compile_view';
import {InjectMethodVars} from './constants';
import {ComponentFactoryDependency, DirectiveWrapperDependency} from './deps';
import {getPropertyInView, injectFromViewParentInjector} from './util';

export class CompileNode {
  constructor(
      public parent: CompileElement, public view: CompileView, public nodeIndex: number,
      public renderNode: o.Expression, public sourceAst: TemplateAst) {}

  isNull(): boolean { return !this.renderNode; }

  isRootElement(): boolean { return this.view != this.parent.view; }
}

export class CompileElement extends CompileNode {
  static createNull(): CompileElement {
    return new CompileElement(null, null, null, null, null, null, [], [], false, false, []);
  }

  public compViewExpr: o.Expression = null;
  public viewContainer: o.ReadPropExpr;
  public elementRef: o.Expression;
  public instances = new Map<any, o.Expression>();
  public directiveWrapperInstance = new Map<any, o.Expression>();
  private _resolvedProviders: Map<any, ProviderAst>;

  private _queryCount = 0;
  private _queries = new Map<any, CompileQuery[]>();

  public contentNodesByNgContentIndex: Array<CompileViewRootNode>[] = null;
  public embeddedView: CompileView;
  public referenceTokens: {[key: string]: CompileTokenMetadata};

  constructor(
      parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression,
      sourceAst: TemplateAst, public component: CompileDirectiveSummary,
      private _directives: CompileDirectiveSummary[],
      private _resolvedProvidersArray: ProviderAst[], public hasViewContainer: boolean,
      public hasEmbeddedView: boolean, references: ReferenceAst[]) {
    super(parent, view, nodeIndex, renderNode, sourceAst);
    this.referenceTokens = {};
    references.forEach(ref => this.referenceTokens[ref.name] = ref.value);

    this.elementRef =
        o.importExpr(createIdentifier(Identifiers.ElementRef)).instantiate([this.renderNode]);
    this.instances.set(resolveIdentifier(Identifiers.ElementRef), this.elementRef);
    this.instances.set(
        resolveIdentifier(Identifiers.Injector),
        o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]));
    this.instances.set(resolveIdentifier(Identifiers.Renderer), o.THIS_EXPR.prop('renderer'));
    if (this.hasViewContainer || this.hasEmbeddedView) {
      this._createViewContainer();
    }
    if (this.component) {
      this._createComponentFactoryResolver();
    }
  }

  private _createViewContainer() {
    const fieldName = `_vc_${this.nodeIndex}`;
    const parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
    // private is fine here as no child view will reference a ViewContainer
    this.view.fields.push(new o.ClassField(
        fieldName, o.importType(createIdentifier(Identifiers.ViewContainer)),
        [o.StmtModifier.Private]));
    const statement =
        o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(createIdentifier(Identifiers.ViewContainer)).instantiate([
              o.literal(this.nodeIndex), o.literal(parentNodeIndex), o.THIS_EXPR, this.renderNode
            ]))
            .toStmt();
    this.view.createMethod.addStmt(statement);
    this.viewContainer = o.THIS_EXPR.prop(fieldName);
    this.instances.set(resolveIdentifier(Identifiers.ViewContainer), this.viewContainer);
    this.view.viewContainers.push(this.viewContainer);
  }

  private _createComponentFactoryResolver() {
    const entryComponents = this.component.entryComponents.map((entryComponent) => {
      this.view.targetDependencies.push(
          new ComponentFactoryDependency(entryComponent.componentType));
      return {reference: entryComponent.componentFactory};
    });
    if (!entryComponents || entryComponents.length === 0) {
      return;
    }
    const createComponentFactoryResolverExpr =
        o.importExpr(createIdentifier(Identifiers.CodegenComponentFactoryResolver)).instantiate([
          o.literalArr(entryComponents.map((entryComponent) => o.importExpr(entryComponent))),
          injectFromViewParentInjector(
              this.view, createIdentifierToken(Identifiers.ComponentFactoryResolver), false)
        ]);
    const provider: CompileProviderMetadata = {
      token: createIdentifierToken(Identifiers.ComponentFactoryResolver),
      useValue: createComponentFactoryResolverExpr
    };
    // Add ComponentFactoryResolver as first provider as it does not have deps on other providers
    // ProviderAstType.PrivateService as only the component and its view can see it,
    // but nobody else
    this._resolvedProvidersArray.unshift(new ProviderAst(
        provider.token, false, true, [provider], ProviderAstType.PrivateService, [],
        this.sourceAst.sourceSpan));
  }

  setComponentView(compViewExpr: o.Expression) {
    this.compViewExpr = compViewExpr;
    this.contentNodesByNgContentIndex =
        new Array(this.component.template.ngContentSelectors.length);
    for (let i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
      this.contentNodesByNgContentIndex[i] = [];
    }
  }

  setEmbeddedView(embeddedView: CompileView) {
    this.embeddedView = embeddedView;
    if (isPresent(embeddedView)) {
      const createTemplateRefExpr =
          o.importExpr(createIdentifier(Identifiers.TemplateRef_)).instantiate([
            o.THIS_EXPR, o.literal(this.nodeIndex), this.renderNode
          ]);
      const provider: CompileProviderMetadata = {
        token: createIdentifierToken(Identifiers.TemplateRef),
        useValue: createTemplateRefExpr
      };
      // Add TemplateRef as first provider as it does not have deps on other providers
      this._resolvedProvidersArray.unshift(new ProviderAst(
          provider.token, false, true, [provider], ProviderAstType.Builtin, [],
          this.sourceAst.sourceSpan));
    }
  }

  beforeChildren(): void {
    if (this.hasViewContainer) {
      this.instances.set(
          resolveIdentifier(Identifiers.ViewContainerRef), this.viewContainer.prop('vcRef'));
    }

    this._resolvedProviders = new Map<any, ProviderAst>();
    this._resolvedProvidersArray.forEach(
        provider => this._resolvedProviders.set(tokenReference(provider.token), provider));

    // create all the provider instances, some in the view constructor,
    // some as getters. We rely on the fact that they are already sorted topologically.
    Array.from(this._resolvedProviders.values()).forEach((resolvedProvider) => {
      const isDirectiveWrapper = resolvedProvider.providerType === ProviderAstType.Component ||
          resolvedProvider.providerType === ProviderAstType.Directive;
      const providerValueExpressions = resolvedProvider.providers.map((provider) => {
        if (provider.useExisting) {
          return this._getDependency(resolvedProvider.providerType, {token: provider.useExisting});
        } else if (provider.useFactory) {
          const deps = provider.deps || provider.useFactory.diDeps;
          const depsExpr =
              deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
          return o.importExpr(provider.useFactory).callFn(depsExpr);
        } else if (provider.useClass) {
          const deps = provider.deps || provider.useClass.diDeps;
          const depsExpr =
              deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
          if (isDirectiveWrapper) {
            const dirMeta =
                this._directives.find(dir => dir.type.reference === provider.useClass.reference);
            this.view.targetDependencies.push(
                new DirectiveWrapperDependency(dirMeta.type.reference));
            return DirectiveWrapperExpressions.create({reference: dirMeta.wrapperType}, depsExpr);
          } else {
            return o.importExpr(provider.useClass)
                .instantiate(depsExpr, o.importType(provider.useClass));
          }
        } else {
          return convertValueToOutputAst(provider.useValue);
        }
      });
      const propName =
          `_${tokenName(resolvedProvider.token)}_${this.nodeIndex}_${this.instances.size}`;
      const instance = createProviderProperty(
          propName, providerValueExpressions, resolvedProvider.multiProvider,
          resolvedProvider.eager, this);
      if (isDirectiveWrapper) {
        this.directiveWrapperInstance.set(tokenReference(resolvedProvider.token), instance);
        this.instances.set(
            tokenReference(resolvedProvider.token), DirectiveWrapperExpressions.context(instance));
      } else {
        this.instances.set(tokenReference(resolvedProvider.token), instance);
      }
    });

    for (let i = 0; i < this._directives.length; i++) {
      const directive = this._directives[i];
      const directiveInstance = this.instances.get(tokenReference(identifierToken(directive.type)));
      directive.queries.forEach((queryMeta) => { this._addQuery(queryMeta, directiveInstance); });
    }

    Object.keys(this.referenceTokens).forEach(varName => {
      const token = this.referenceTokens[varName];
      let varValue: o.Expression;
      if (token) {
        varValue = this.instances.get(tokenReference(token));
      } else {
        varValue = this.renderNode;
      }
      this.view.locals.set(varName, varValue);
    });
  }

  afterChildren(childNodeCount: number) {
    Array.from(this._resolvedProviders.values()).forEach((resolvedProvider) => {
      // Note: afterChildren is called after recursing into children.
      // This is good so that an injector match in an element that is closer to a requesting element
      // matches first.
      const providerExpr = this.instances.get(tokenReference(resolvedProvider.token));
      // Note: view providers are only visible on the injector of that element.
      // This is not fully correct as the rules during codegen don't allow a directive
      // to get hold of a view provdier on the same element. We still do this semantic
      // as it simplifies our model to having only one runtime injector per element.
      const providerChildNodeCount =
          resolvedProvider.providerType === ProviderAstType.PrivateService ? 0 : childNodeCount;
      this.view.injectorGetMethod.addStmt(createInjectInternalCondition(
          this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
    });
  }

  finish() {
    Array.from(this._queries.values())
        .forEach(
            queries => queries.forEach(
                q => q.generateStatements(
                    this.view.createMethod, this.view.updateContentQueriesMethod)));
  }

  addContentNode(ngContentIndex: number, nodeExpr: CompileViewRootNode) {
    this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
  }

  getComponent(): o.Expression {
    return isPresent(this.component) ?
        this.instances.get(tokenReference(identifierToken(this.component.type))) :
        null;
  }

  getProviderTokens(): CompileTokenMetadata[] {
    return Array.from(this._resolvedProviders.values()).map(provider => provider.token);
  }

  getQueriesFor(token: CompileTokenMetadata): CompileQuery[] {
    const result: CompileQuery[] = [];
    let currentEl: CompileElement = this;
    let distance = 0;
    let queries: CompileQuery[];
    while (!currentEl.isNull()) {
      queries = currentEl._queries.get(tokenReference(token));
      if (isPresent(queries)) {
        result.push(...queries.filter((query) => query.meta.descendants || distance <= 1));
      }
      if (currentEl._directives.length > 0) {
        distance++;
      }
      currentEl = currentEl.parent;
    }
    queries = this.view.componentView.viewQueries.get(tokenReference(token));
    if (isPresent(queries)) {
      result.push(...queries);
    }
    return result;
  }

  private _addQuery(queryMeta: CompileQueryMetadata, directiveInstance: o.Expression):
      CompileQuery {
    const propName =
        `_query_${tokenName(queryMeta.selectors[0])}_${this.nodeIndex}_${this._queryCount++}`;
    const queryList = createQueryList(propName, this.view);
    const query = new CompileQuery(queryMeta, queryList, directiveInstance, this.view);
    addQueryToTokenMap(this._queries, query);
    return query;
  }

  private _getLocalDependency(
      requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata): o.Expression {
    let result: o.Expression = null;
    if (isPresent(dep.token)) {
      // access builtins with special visibility
      if (!result) {
        if (tokenReference(dep.token) === resolveIdentifier(Identifiers.ChangeDetectorRef)) {
          if (requestingProviderType === ProviderAstType.Component) {
            return this.compViewExpr.prop('ref');
          } else {
            return getPropertyInView(o.THIS_EXPR.prop('ref'), this.view, this.view.componentView);
          }
        }
      }
      // access regular providers on the element
      if (!result) {
        const resolvedProvider = this._resolvedProviders.get(tokenReference(dep.token));
        // don't allow directives / public services to access private services.
        // only components and private services can access private services.
        if (resolvedProvider && (requestingProviderType === ProviderAstType.Directive ||
                                 requestingProviderType === ProviderAstType.PublicService) &&
            resolvedProvider.providerType === ProviderAstType.PrivateService) {
          return null;
        }
        result = this.instances.get(tokenReference(dep.token));
      }
    }
    return result;
  }

  private _getDependency(requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata):
      o.Expression {
    let currElement: CompileElement = this;
    let result: o.Expression = null;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (!result && !dep.isSkipSelf) {
      result = this._getLocalDependency(requestingProviderType, dep);
    }
    // check parent elements
    while (!result && !currElement.parent.isNull()) {
      currElement = currElement.parent;
      result = currElement._getLocalDependency(ProviderAstType.PublicService, {token: dep.token});
    }

    if (!result) {
      result = injectFromViewParentInjector(this.view, dep.token, dep.isOptional);
    }
    if (!result) {
      result = o.NULL_EXPR;
    }
    return getPropertyInView(result, this.view, currElement.view);
  }
}

function createInjectInternalCondition(
    nodeIndex: number, childNodeCount: number, provider: ProviderAst,
    providerExpr: o.Expression): o.Statement {
  let indexCondition: o.Expression;
  if (childNodeCount > 0) {
    indexCondition = o.literal(nodeIndex)
                         .lowerEquals(InjectMethodVars.requestNodeIndex)
                         .and(InjectMethodVars.requestNodeIndex.lowerEquals(
                             o.literal(nodeIndex + childNodeCount)));
  } else {
    indexCondition = o.literal(nodeIndex).identical(InjectMethodVars.requestNodeIndex);
  }
  return new o.IfStmt(
      InjectMethodVars.token.identical(createDiTokenExpression(provider.token)).and(indexCondition),
      [new o.ReturnStatement(providerExpr)]);
}

function createProviderProperty(
    propName: string, providerValueExpressions: o.Expression[], isMulti: boolean, isEager: boolean,
    compileElement: CompileElement): o.Expression {
  const view = compileElement.view;
  let resolvedProviderValueExpr: o.Expression;
  let type: o.Type;
  if (isMulti) {
    resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
    type = new o.ArrayType(o.DYNAMIC_TYPE);
  } else {
    resolvedProviderValueExpr = providerValueExpressions[0];
    type = providerValueExpressions[0].type;
  }
  if (!type) {
    type = o.DYNAMIC_TYPE;
  }
  if (isEager) {
    view.fields.push(new o.ClassField(propName, type));
    view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
  } else {
    const internalField = `_${propName}`;
    view.fields.push(new o.ClassField(internalField, type));
    const getter = new CompileMethod(view);
    getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
    // Note: Equals is important for JS so that it also checks the undefined case!
    getter.addStmt(new o.IfStmt(
        o.THIS_EXPR.prop(internalField).isBlank(),
        [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
    getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
    view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
  }
  return o.THIS_EXPR.prop(propName);
}
