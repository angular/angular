import * as o from '../output/output_ast';
import {Identifiers, identifierToken} from '../identifiers';
import {InjectMethodVars} from './constants';
import {CompileView} from './compile_view';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {TemplateAst, ProviderAst, ProviderAstType} from '../template_ast';
import {
  CompileTokenMap,
  CompileDirectiveMetadata,
  CompileTokenMetadata,
  CompileQueryMetadata,
  CompileProviderMetadata,
  CompileDiDependencyMetadata,
  CompileIdentifierMetadata,
  CompileTypeMetadata
} from '../compile_metadata';
import {getPropertyInView, createDiTokenExpression, injectFromViewParentInjector} from './util';
import {CompileQuery, createQueryList, addQueryToTokenMap} from './compile_query';
import {CompileMethod} from './compile_method';

export class CompileNode {
  constructor(public parent: CompileElement, public view: CompileView, public nodeIndex: number,
              public renderNode: o.Expression, public sourceAst: TemplateAst) {}

  isNull(): boolean { return isBlank(this.renderNode); }

  isRootElement(): boolean { return this.view != this.parent.view; }
}

export class CompileElement extends CompileNode {
  static createNull(): CompileElement {
    return new CompileElement(null, null, null, null, null, [], [], {});
  }

  private _compViewExpr: o.Expression = null;
  public component: CompileDirectiveMetadata = null;
  private _appElement: o.Expression;
  private _defaultInjector: o.Expression;
  private _instances = new CompileTokenMap<o.Expression>();
  private _resolvedProviders: CompileTokenMap<ProviderAst>;

  private _queryCount = 0;
  private _queries = new CompileTokenMap<CompileQuery[]>();
  private _componentConstructorViewQueryLists: o.Expression[] = [];

  public contentNodesByNgContentIndex: Array<o.Expression>[] = null;
  public embeddedView: CompileView;
  public directiveInstances: o.Expression[];

  constructor(parent: CompileElement, view: CompileView, nodeIndex: number,
              renderNode: o.Expression, sourceAst: TemplateAst,
              private _directives: CompileDirectiveMetadata[],
              private _resolvedProvidersArray: ProviderAst[],
              public variableTokens: {[key: string]: CompileTokenMetadata}) {
    super(parent, view, nodeIndex, renderNode, sourceAst);
  }

  setComponent(component: CompileDirectiveMetadata, compViewExpr: o.Expression) {
    this.component = component;
    this._compViewExpr = compViewExpr;
    this.contentNodesByNgContentIndex =
        ListWrapper.createFixedSize(component.template.ngContentSelectors.length);
    for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
      this.contentNodesByNgContentIndex[i] = [];
    }
  }

  setEmbeddedView(embeddedView: CompileView) {
    this.embeddedView = embeddedView;
    if (isPresent(embeddedView)) {
      var createTemplateRefExpr =
          o.importExpr(Identifiers.TemplateRef_)
              .instantiate([this.getOrCreateAppElement(), this.embeddedView.viewFactory]);
      var provider = new CompileProviderMetadata(
          {token: identifierToken(Identifiers.TemplateRef), useValue: createTemplateRefExpr});
      // Add TemplateRef as first provider as it does not have deps on other providers
      this._resolvedProvidersArray.unshift(new ProviderAst(provider.token, false, true, [provider],
                                                           ProviderAstType.Builtin,
                                                           this.sourceAst.sourceSpan));
    }
  }

  beforeChildren(): void {
    this._resolvedProviders = new CompileTokenMap<ProviderAst>();
    this._resolvedProvidersArray.forEach(provider =>
                                             this._resolvedProviders.add(provider.token, provider));

    // create all the provider instances, some in the view constructor,
    // some as getters. We rely on the fact that they are already sorted topologically.
    this._resolvedProviders.values().forEach((resolvedProvider) => {
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
          if (provider.useValue instanceof CompileIdentifierMetadata) {
            return o.importExpr(provider.useValue);
          } else if (provider.useValue instanceof o.Expression) {
            return provider.useValue;
          } else {
            return o.literal(provider.useValue);
          }
        }
      });
      var propName = `_${resolvedProvider.token.name}_${this.nodeIndex}_${this._instances.size}`;
      var instance =
          createProviderProperty(propName, resolvedProvider, providerValueExpressions,
                                 resolvedProvider.multiProvider, resolvedProvider.eager, this);
      this._instances.add(resolvedProvider.token, instance);
    });

    this.directiveInstances =
        this._directives.map((directive) => this._instances.get(identifierToken(directive.type)));
    for (var i = 0; i < this.directiveInstances.length; i++) {
      var directiveInstance = this.directiveInstances[i];
      var directive = this._directives[i];
      directive.queries.forEach((queryMeta) => { this._addQuery(queryMeta, directiveInstance); });
    }
    this._resolvedProviders.values().forEach((resolvedProvider) => {
      var queriesForProvider = this._getQueriesFor(resolvedProvider.token);
      var providerExpr = this._instances.get(resolvedProvider.token);
      queriesForProvider.forEach((query) => { query.addValue(providerExpr, this.view); });
    });
    StringMapWrapper.forEach(this.variableTokens, (_, varName) => {
      var token = this.variableTokens[varName];
      var varValue;
      var varValueForQuery;
      if (isPresent(token)) {
        varValue = varValueForQuery = this._instances.get(token);
      } else {
        varValueForQuery = this.getOrCreateAppElement().prop('ref');
        varValue = this.renderNode;
      }
      this.view.variables.set(varName, varValue);
      this.view.namedAppElements.push([varName, this.getOrCreateAppElement()]);

      var queriesForProvider = this._getQueriesFor(new CompileTokenMetadata({value: varName}));
      queriesForProvider.forEach((query) => { query.addValue(varValueForQuery, this.view); });
    });
    if (isPresent(this.component)) {
      var componentConstructorViewQueryList =
          isPresent(this.component) ? o.literalArr(this._componentConstructorViewQueryLists) :
                                      o.NULL_EXPR;
      var compExpr = isPresent(this.getComponent()) ? this.getComponent() : o.NULL_EXPR;
      this.view.createMethod.addStmt(
          this.getOrCreateAppElement()
              .callMethod('initComponent',
                          [compExpr, componentConstructorViewQueryList, this._compViewExpr])
              .toStmt());
    }
  }

  afterChildren(childNodeCount: number) {
    this._resolvedProviders.values().forEach((resolvedProvider) => {
      // Note: afterChildren is called after recursing into children.
      // This is good so that an injector match in an element that is closer to a requesting element
      // matches first.
      var providerExpr = this._instances.get(resolvedProvider.token);
      // Note: view providers are only visible on the injector of that element.
      // This is not fully correct as the rules during codegen don't allow a directive
      // to get hold of a view provdier on the same element. We still do this semantic
      // as it simplifies our model to having only one runtime injector per element.
      var providerChildNodeCount =
          resolvedProvider.providerType === ProviderAstType.PrivateService ? 0 : childNodeCount;
      this.view.injectorGetMethod.addStmt(createInjectInternalCondition(
          this.nodeIndex, providerChildNodeCount, resolvedProvider, providerExpr));
    });

    this._queries.values().forEach(
        (queries) =>
            queries.forEach((query) => query.afterChildren(this.view.updateContentQueriesMethod)));
  }

  addContentNode(ngContentIndex: number, nodeExpr: o.Expression) {
    this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
  }

  getComponent(): o.Expression {
    return isPresent(this.component) ? this._instances.get(identifierToken(this.component.type)) :
                                       null;
  }

  getProviderTokens(): o.Expression[] {
    return this._resolvedProviders.values().map(
        (resolvedProvider) => createDiTokenExpression(resolvedProvider.token));
  }

  getDeclaredVariablesNames(): string[] {
    var res = [];
    StringMapWrapper.forEach(this.variableTokens, (_, key) => { res.push(key); });
    return res;
  }

  getOptionalAppElement(): o.Expression { return this._appElement; }

  getOrCreateAppElement(): o.Expression {
    if (isBlank(this._appElement)) {
      var parentNodeIndex = this.isRootElement() ? null : this.parent.nodeIndex;
      var fieldName = `_appEl_${this.nodeIndex}`;
      this.view.fields.push(new o.ClassField(fieldName, o.importType(Identifiers.AppElement),
                                             [o.StmtModifier.Private]));
      var statement = o.THIS_EXPR.prop(fieldName)
                          .set(o.importExpr(Identifiers.AppElement)
                                   .instantiate([
                                     o.literal(this.nodeIndex),
                                     o.literal(parentNodeIndex),
                                     o.THIS_EXPR,
                                     this.renderNode
                                   ]))
                          .toStmt();
      this.view.createMethod.addStmt(statement);
      this._appElement = o.THIS_EXPR.prop(fieldName);
    }
    return this._appElement;
  }

  getOrCreateInjector(): o.Expression {
    if (isBlank(this._defaultInjector)) {
      var fieldName = `_inj_${this.nodeIndex}`;
      this.view.fields.push(new o.ClassField(fieldName, o.importType(Identifiers.Injector),
                                             [o.StmtModifier.Private]));
      var statement = o.THIS_EXPR.prop(fieldName)
                          .set(o.THIS_EXPR.callMethod('injector', [o.literal(this.nodeIndex)]))
                          .toStmt();
      this.view.createMethod.addStmt(statement);
      this._defaultInjector = o.THIS_EXPR.prop(fieldName);
    }
    return this._defaultInjector;
  }

  private _getQueriesFor(token: CompileTokenMetadata): CompileQuery[] {
    var result: CompileQuery[] = [];
    var currentEl: CompileElement = this;
    var distance = 0;
    var queries: CompileQuery[];
    while (!currentEl.isNull()) {
      queries = currentEl._queries.get(token);
      if (isPresent(queries)) {
        ListWrapper.addAll(result,
                           queries.filter((query) => query.meta.descendants || distance <= 1));
      }
      if (currentEl._directives.length > 0) {
        distance++;
      }
      currentEl = currentEl.parent;
    }
    queries = this.view.componentView.viewQueries.get(token);
    if (isPresent(queries)) {
      ListWrapper.addAll(result, queries);
    }
    return result;
  }

  private _addQuery(queryMeta: CompileQueryMetadata,
                    directiveInstance: o.Expression): CompileQuery {
    var propName = `_query_${queryMeta.selectors[0].name}_${this.nodeIndex}_${this._queryCount++}`;
    var queryList = createQueryList(queryMeta, directiveInstance, propName, this.view);
    var query = new CompileQuery(queryMeta, queryList, directiveInstance, this.view);
    addQueryToTokenMap(this._queries, query);
    return query;
  }

  private _getLocalDependency(requestingProviderType: ProviderAstType,
                              dep: CompileDiDependencyMetadata): o.Expression {
    var result = null;
    // constructor content query
    if (isBlank(result) && isPresent(dep.query)) {
      result = this._addQuery(dep.query, null).queryList;
    }

    // constructor view query
    if (isBlank(result) && isPresent(dep.viewQuery)) {
      result = createQueryList(
          dep.viewQuery, null,
          `_viewQuery_${dep.viewQuery.selectors[0].name}_${this.nodeIndex}_${this._componentConstructorViewQueryLists.length}`,
          this.view);
      this._componentConstructorViewQueryLists.push(result);
    }

    if (isPresent(dep.token)) {
      // access builtins
      if (isBlank(result)) {
        if (dep.token.equalsTo(identifierToken(Identifiers.Renderer))) {
          result = o.THIS_EXPR.prop('renderer');
        } else if (dep.token.equalsTo(identifierToken(Identifiers.ElementRef))) {
          result = this.getOrCreateAppElement().prop('ref');
        } else if (dep.token.equalsTo(identifierToken(Identifiers.ChangeDetectorRef))) {
          if (requestingProviderType === ProviderAstType.Component) {
            return this._compViewExpr.prop('ref');
          } else {
            return o.THIS_EXPR.prop('ref');
          }
        } else if (dep.token.equalsTo(identifierToken(Identifiers.ViewContainerRef))) {
          result = this.getOrCreateAppElement().prop('vcRef');
        }
      }
      // access providers
      if (isBlank(result)) {
        result = this._instances.get(dep.token);
      }
      // access the injector
      if (isBlank(result) && dep.token.equalsTo(identifierToken(Identifiers.Injector))) {
        result = this.getOrCreateInjector();
      }
    }
    return result;
  }

  private _getDependency(requestingProviderType: ProviderAstType,
                         dep: CompileDiDependencyMetadata): o.Expression {
    var currElement: CompileElement = this;
    var currView = currElement.view;
    var result = null;
    if (dep.isValue) {
      result = o.literal(dep.value);
    }
    if (isBlank(result) && !dep.isSkipSelf) {
      result = this._getLocalDependency(requestingProviderType, dep);
    }
    var resultViewPath = [];
    // check parent elements
    while (isBlank(result) && !currElement.parent.isNull()) {
      currElement = currElement.parent;
      while (currElement.view !== currView && currView != null) {
        currView = currView.declarationElement.view;
        resultViewPath.push(currView);
      }
      result = currElement._getLocalDependency(ProviderAstType.PublicService,
                                               new CompileDiDependencyMetadata({token: dep.token}));
    }

    if (isBlank(result)) {
      result = injectFromViewParentInjector(dep.token, dep.isOptional);
    }
    if (isBlank(result)) {
      result = o.NULL_EXPR;
    }
    return getPropertyInView(result, resultViewPath);
  }
}

function createInjectInternalCondition(nodeIndex: number, childNodeCount: number,
                                       provider: ProviderAst,
                                       providerExpr: o.Expression): o.Statement {
  var indexCondition;
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

function createProviderProperty(propName: string, provider: ProviderAst,
                                providerValueExpressions: o.Expression[], isMulti: boolean,
                                isEager: boolean, compileElement: CompileElement): o.Expression {
  var view = compileElement.view;
  var resolvedProviderValueExpr;
  var type;
  if (isMulti) {
    resolvedProviderValueExpr = o.literalArr(providerValueExpressions);
    type = new o.ArrayType(o.DYNAMIC_TYPE);
  } else {
    resolvedProviderValueExpr = providerValueExpressions[0];
    type = providerValueExpressions[0].type;
  }
  if (isBlank(type)) {
    type = o.DYNAMIC_TYPE;
  }
  if (isEager) {
    view.fields.push(new o.ClassField(propName, type, [o.StmtModifier.Private]));
    view.createMethod.addStmt(o.THIS_EXPR.prop(propName).set(resolvedProviderValueExpr).toStmt());
  } else {
    var internalField = `_${propName}`;
    view.fields.push(new o.ClassField(internalField, type, [o.StmtModifier.Private]));
    var getter = new CompileMethod(view);
    getter.resetDebugInfo(compileElement.nodeIndex, compileElement.sourceAst);
    // Note: Equals is important for JS so that it also checks the undefined case!
    getter.addStmt(
        new o.IfStmt(o.THIS_EXPR.prop(internalField).isBlank(),
                     [o.THIS_EXPR.prop(internalField).set(resolvedProviderValueExpr).toStmt()]));
    getter.addStmt(new o.ReturnStatement(o.THIS_EXPR.prop(internalField)));
    view.getters.push(new o.ClassGetter(propName, getter.finish(), type));
  }
  return o.THIS_EXPR.prop(propName);
}
