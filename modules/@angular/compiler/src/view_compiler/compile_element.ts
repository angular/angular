/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompileIdentifierMetadata, CompileProviderMetadata, CompileQueryMetadata, CompileTokenMetadata} from '../compile_metadata';
import {ListWrapper, MapWrapper, StringMapWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
import {Identifiers, identifierToken, resolveIdentifier, resolveIdentifierToken} from '../identifiers';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ProviderAst, ProviderAstType, ReferenceAst, TemplateAst} from '../template_parser/template_ast';
import {createDiTokenExpression} from '../util';

import {CompileMethod} from './compile_method';
import {CompileQuery, addQueryToTokenMap, createQueryList} from './compile_query';
import {CompileView} from './compile_view';
import {InjectMethodVars} from './constants';
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

  private _compViewExpr: o.Expression = null;
  public appElement: o.ReadPropExpr;
  public elementRef: o.Expression;
  public injector: o.Expression;
  public instances = new Map<any, o.Expression>();
  private _resolvedProviders: Map<any, ProviderAst>;

  private _queryCount = 0;
  private _queries = new Map<any, CompileQuery[]>();
  private _componentConstructorViewQueryLists: o.Expression[] = [];

  public contentNodesByNgContentIndex: Array<o.Expression>[] = null;
  public embeddedView: CompileView;
  public referenceTokens: {[key: string]: CompileTokenMetadata};

  constructor(
      parent: CompileElement, view: CompileView, nodeIndex: number, renderNode: o.Expression,
      sourceAst: TemplateAst, public component: CompileDirectiveMetadata,
      private _directives: CompileDirectiveMetadata[],
      private _resolvedProvidersArray: ProviderAst[], public hasViewContainer: boolean,
      public hasEmbeddedView: boolean, references: ReferenceAst[]) {
    super(parent, view, nodeIndex, renderNode, sourceAst);
    this.referenceTokens = {};
    references.forEach(ref => this.referenceTokens[ref.name] = ref.value);

    this.elementRef =
        o.importExpr(resolveIdentifier(Identifiers.ElementRef)).instantiate([this.renderNode]);
    this.instances.set(resolveIdentifierToken(Identifiers.ElementRef).reference, this.elementRef);
    this.injector = o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]);
    this.instances.set(resolveIdentifierToken(Identifiers.Injector).reference, this.injector);
    this.instances.set(
        resolveIdentifierToken(Identifiers.Renderer).reference, o.THIS_EXPR.prop('renderer'));
    if (this.hasViewContainer || this.hasEmbeddedView || isPresent(this.component)) {
      this._createAppElement();
    }
  }

  private _createAppElement() {
    var fieldName = `_appEl_${this.nodeIndex}`;
    var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
    // private is fine here as no child view will reference an AppElement
    this.view.fields.push(new o.ClassField(
        fieldName, o.importType(resolveIdentifier(Identifiers.AppElement)),
        [o.StmtModifier.Private]));
    var statement =
        o.THIS_EXPR.prop(fieldName)
            .set(o.importExpr(resolveIdentifier(Identifiers.AppElement)).instantiate([
              o.literal(this.nodeIndex), o.literal(parentNodeIndex), o.THIS_EXPR, this.renderNode
            ]))
            .toStmt();
    this.view.createMethod.addStmt(statement);
    this.appElement = o.THIS_EXPR.prop(fieldName);
    this.instances.set(resolveIdentifierToken(Identifiers.AppElement).reference, this.appElement);
  }

  public createComponentFactoryResolver(entryComponents: CompileIdentifierMetadata[]) {
    if (!entryComponents || entryComponents.length === 0) {
      return;
    }
    var createComponentFactoryResolverExpr =
        o.importExpr(resolveIdentifier(Identifiers.CodegenComponentFactoryResolver)).instantiate([
          o.literalArr(entryComponents.map((entryComponent) => o.importExpr(entryComponent))),
          injectFromViewParentInjector(
              resolveIdentifierToken(Identifiers.ComponentFactoryResolver), false)
        ]);
    var provider = new CompileProviderMetadata({
      token: resolveIdentifierToken(Identifiers.ComponentFactoryResolver),
      useValue: createComponentFactoryResolverExpr
    });
    // Add ComponentFactoryResolver as first provider as it does not have deps on other providers
    // ProviderAstType.PrivateService as only the component and its view can see it,
    // but nobody else
    this._resolvedProvidersArray.unshift(new ProviderAst(
        provider.token, false, true, [provider], ProviderAstType.PrivateService, [],
        this.sourceAst.sourceSpan));
  }

  setComponentView(compViewExpr: o.Expression) {
    this._compViewExpr = compViewExpr;
    this.contentNodesByNgContentIndex =
        new Array(this.component.template.ngContentSelectors.length);
    for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
      this.contentNodesByNgContentIndex[i] = [];
    }
  }

  setEmbeddedView(embeddedView: CompileView) {
    this.embeddedView = embeddedView;
    if (isPresent(embeddedView)) {
      var createTemplateRefExpr =
          o.importExpr(resolveIdentifier(Identifiers.TemplateRef_)).instantiate([
            this.appElement, this.embeddedView.viewFactory
          ]);
      var provider = new CompileProviderMetadata({
        token: resolveIdentifierToken(Identifiers.TemplateRef),
        useValue: createTemplateRefExpr
      });
      // Add TemplateRef as first provider as it does not have deps on other providers
      this._resolvedProvidersArray.unshift(new ProviderAst(
          provider.token, false, true, [provider], ProviderAstType.Builtin, [],
          this.sourceAst.sourceSpan));
    }
  }

  beforeChildren(): void {
    if (this.hasViewContainer) {
      this.instances.set(
          resolveIdentifierToken(Identifiers.ViewContainerRef).reference,
          this.appElement.prop('vcRef'));
    }

    this._resolvedProviders = new Map<any, ProviderAst>();
    this._resolvedProvidersArray.forEach(
        provider => this._resolvedProviders.set(provider.token.reference, provider));

    // create all the provider instances, some in the view constructor,
    // some as getters. We rely on the fact that they are already sorted topologically.
    MapWrapper.values(this._resolvedProviders).forEach((resolvedProvider) => {
      var providerValueExpressions = resolvedProvider.providers.map((provider) => {
        if (isPresent(provider.useExisting)) {
          return this._getDependency(
              resolvedProvider.providerType,
              new CompileDiDependencyMetadata({token: provider.useExisting}));
        } else if (isPresent(provider.useFactory)) {
          var deps = isPresent(provider.deps) ? provider.deps : provider.useFactory.diDeps;
          var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
          return o.importExpr(provider.useFactory).callFn(depsExpr);
        } else if (isPresent(provider.useClass)) {
          var deps = isPresent(provider.deps) ? provider.deps : provider.useClass.diDeps;
          var depsExpr = deps.map((dep) => this._getDependency(resolvedProvider.providerType, dep));
          return o.importExpr(provider.useClass)
              .instantiate(depsExpr, o.importType(provider.useClass));
        } else {
          return convertValueToOutputAst(provider.useValue);
        }
      });
      var propName = `_${resolvedProvider.token.name}_${this.nodeIndex}_${this.instances.size}`;
      var instance = createProviderProperty(
          propName, resolvedProvider, providerValueExpressions, resolvedProvider.multiProvider,
          resolvedProvider.eager, this);
      this.instances.set(resolvedProvider.token.reference, instance);
    });

    for (var i = 0; i < this._directives.length; i++) {
      var directive = this._directives[i];
      var directiveInstance = this.instances.get(identifierToken(directive.type).reference);
      directive.queries.forEach((queryMeta) => { this._addQuery(queryMeta, directiveInstance); });
    }
    var queriesWithReads: _QueryWithRead[] = [];
    MapWrapper.values(this._resolvedProviders).forEach((resolvedProvider) => {
      var queriesForProvider = this._getQueriesFor(resolvedProvider.token);
      ListWrapper.addAll(
          queriesWithReads,
          queriesForProvider.map(query => new _QueryWithRead(query, resolvedProvider.token)));
    });
    StringMapWrapper.forEach(this.referenceTokens, (_: CompileTokenMetadata, varName: string) => {
      var token = this.referenceTokens[varName];
      var varValue: o.Expression;
      if (isPresent(token)) {
        varValue = this.instances.get(token.reference);
      } else {
        varValue = this.renderNode;
      }
      this.view.locals.set(varName, varValue);
      var varToken = new CompileTokenMetadata({value: varName});
      ListWrapper.addAll(
          queriesWithReads,
          this._getQueriesFor(varToken).map(query => new _QueryWithRead(query, varToken)));
    });
    queriesWithReads.forEach((queryWithRead) => {
      var value: o.Expression;
      if (isPresent(queryWithRead.read.identifier)) {
        // query for an identifier
        value = this.instances.get(queryWithRead.read.reference);
      } else {
        // query for a reference
        var token = this.referenceTokens[queryWithRead.read.value];
        if (isPresent(token)) {
          value = this.instances.get(token.reference);
        } else {
          value = this.elementRef;
        }
      }
      if (isPresent(value)) {
        queryWithRead.query.addValue(value, this.view);
      }
    });

    if (isPresent(this.component)) {
      var componentConstructorViewQueryList = isPresent(this.component) ?
          o.literalArr(this._componentConstructorViewQueryLists) :
          o.NULL_EXPR;
      var compExpr = isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
      this.view.createMethod.addStmt(
          this.appElement
              .callMethod(
                  'initComponent',
                  [compExpr, componentConstructorViewQueryList, this._compViewExpr])
              .toStmt());
    }
  }

  afterChildren(childNodeCount: number) {
    MapWrapper.values(this._resolvedProviders).forEach((resolvedProvider) => {
      // Note: afterChildren is called after recursing into children.
      // This is good so that an injector match in an element that is closer to a requesting element
      // matches first.
      var providerExpr = this.instances.get(resolvedProvider.token.reference);
      // Note: view providers are only visible on the injector of that element.
      // This is not fully correct as the rules during codegen don't allow a directive
      // to get hold of a view provdier on the same element. We still do this semantic
      // as it simplifies our model to having only one runtime injector per element.
      var providerChildNodeCount =
          resolvedProvider.providerType === ProviderAstType.PrivateService ? 0 : childNodeCount;
      this.view.injectorGetMethod.addStmt(createInjectInternalCondition(
          this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
    });

    MapWrapper.values(this._queries)
        .forEach(
            (queries) => queries.forEach(
                (query) => query.afterChildren(
                    this.view.createMethod, this.view.updateContentQueriesMethod)));
  }

  addContentNode(ngContentIndex: number, nodeExpr: o.Expression) {
    this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
  }

  getComponent(): o.Expression {
    return isPresent(this.component) ?
        this.instances.get(identifierToken(this.component.type).reference) :
        null;
  }

  getProviderTokens(): o.Expression[] {
    return MapWrapper.values(this._resolvedProviders)
        .map((resolvedProvider) => createDiTokenExpression(resolvedProvider.token));
  }

  private _getQueriesFor(token: CompileTokenMetadata): CompileQuery[] {
    var result: CompileQuery[] = [];
    var currentEl: CompileElement = this;
    var distance = 0;
    var queries: CompileQuery[];
    while (!currentEl.isNull()) {
      queries = currentEl._queries.get(token.reference);
      if (isPresent(queries)) {
        ListWrapper.addAll(
            result, queries.filter((query) => query.meta.descendants || distance <= 1));
      }
      if (currentEl._directives.length > 0) {
        distance++;
      }
      currentEl = currentEl.parent;
    }
    queries = this.view.componentView.viewQueries.get(token.reference);
    if (isPresent(queries)) {
      ListWrapper.addAll(result, queries);
    }
    return result;
  }

  private _addQuery(queryMeta: CompileQueryMetadata, directiveInstance: o.Expression):
      CompileQuery {
    var propName = `_query_${queryMeta.selectors[0].name}_${this.nodeIndex}_${this._queryCount++}`;
    var queryList = createQueryList(queryMeta, directiveInstance, propName, this.view);
    var query = new CompileQuery(queryMeta, queryList, directiveInstance, this.view);
    addQueryToTokenMap(this._queries, query);
    return query;
  }

  private _getLocalDependency(
      requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata): o.Expression {
    var result: o.Expression = null;
    // constructor content query
    if (!result && isPresent(dep.query)) {
      result = this._addQuery(dep.query, null).queryList;
    }

    // constructor view query
    if (!result && isPresent(dep.viewQuery)) {
      result = createQueryList(
          dep.viewQuery, null,
          `_viewQuery_${dep.viewQuery.selectors[0].name}_${this.nodeIndex}_${this._componentConstructorViewQueryLists.length}`,
          this.view);
      this._componentConstructorViewQueryLists.push(result);
    }

    if (isPresent(dep.token)) {
      // access builtins with special visibility
      if (!result) {
        if (dep.token.reference ===
            resolveIdentifierToken(Identifiers.ChangeDetectorRef).reference) {
          if (requestingProviderType === ProviderAstType.Component) {
            return this._compViewExpr.prop('ref');
          } else {
            return getPropertyInView(o.THIS_EXPR.prop('ref'), this.view, this.view.componentView);
          }
        }
      }
      // access regular providers on the element
      if (!result) {
        let resolvedProvider = this._resolvedProviders.get(dep.token.reference);
        // don't allow directives / public services to access private services.
        // only components and private services can access private services.
        if (resolvedProvider && (requestingProviderType === ProviderAstType.Directive ||
                                 requestingProviderType === ProviderAstType.PublicService) &&
            resolvedProvider.providerType === ProviderAstType.PrivateService) {
          return null;
        }
        result = this.instances.get(dep.token.reference);
      }
    }
    return result;
  }

  private _getDependency(requestingProviderType: ProviderAstType, dep: CompileDiDependencyMetadata):
      o.Expression {
    var currElement: CompileElement = this;
    var result: o.Expression = null;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (!result && !dep.isSkipSelf) {
      result = this._getLocalDependency(requestingProviderType, dep);
    }
    // check parent elements
    while (!result && !currElement.parent.isNull()) {
      currElement = currElement.parent;
      result = currElement._getLocalDependency(
          ProviderAstType.PublicService, new CompileDiDependencyMetadata({token: dep.token}));
    }

    if (!result) {
      result = injectFromViewParentInjector(dep.token, dep.isOptional);
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
  var indexCondition: o.Expression;
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
    propName: string, provider: ProviderAst, providerValueExpressions: o.Expression[],
    isMulti: boolean, isEager: boolean, compileElement: CompileElement): o.Expression {
  var view = compileElement.view;
  var resolvedProviderValueExpr: o.Expression;
  var type: o.Type;
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
    var internalField = `_${propName}`;
    view.fields.push(new o.ClassField(internalField, type));
    var getter = new CompileMethod(view);
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

class _QueryWithRead {
  public read: CompileTokenMetadata;
  constructor(public query: CompileQuery, match: CompileTokenMetadata) {
    this.read = isPresent(query.meta.read) ? query.meta.read : match;
  }
}
