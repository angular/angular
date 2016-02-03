import {
  isPresent,
  isBlank,
  Type,
  isString,
  StringWrapper,
  IS_DART,
  CONST_EXPR
} from 'angular2/src/facade/lang';
import {SetWrapper, StringMapWrapper, ListWrapper} from 'angular2/src/facade/collection';
import {
  TemplateAst,
  TemplateAstVisitor,
  NgContentAst,
  EmbeddedTemplateAst,
  ElementAst,
  VariableAst,
  BoundEventAst,
  BoundElementPropertyAst,
  AttrAst,
  BoundTextAst,
  TextAst,
  DirectiveAst,
  BoundDirectivePropertyAst,
  templateVisitAll
} from './template_ast';
import {CompileTypeMetadata, CompileDirectiveMetadata} from './directive_metadata';
import {SourceExpressions, SourceExpression, moduleRef} from './source_module';
import {
  AppProtoView,
  AppView,
  flattenNestedViewRenderNodes,
  checkSlotCount
} from 'angular2/src/core/linker/view';
import {ViewType} from 'angular2/src/core/linker/view_type';
import {AppViewManager_} from 'angular2/src/core/linker/view_manager';
import {AppProtoElement, AppElement} from 'angular2/src/core/linker/element';
import {Renderer, ParentRenderer} from 'angular2/src/core/render/api';
import {ViewEncapsulation} from 'angular2/src/core/metadata/view';
import {
  escapeSingleQuoteString,
  codeGenConstConstructorCall,
  codeGenValueFn,
  codeGenFnHeader,
  MODULE_SUFFIX,
  Statement,
  escapeValue,
  codeGenArray,
  codeGenFlatArray,
  Expression,
  flattenArray,
  CONST_VAR
} from './util';
import {ResolvedProvider, Injectable, Injector} from 'angular2/src/core/di';

import {
  APP_VIEW_MODULE_REF,
  APP_EL_MODULE_REF,
  METADATA_MODULE_REF,
  CompileProtoView,
  CompileProtoElement
} from './proto_view_compiler';

export const VIEW_JIT_IMPORTS = CONST_EXPR({
  'AppView': AppView,
  'AppElement': AppElement,
  'flattenNestedViewRenderNodes': flattenNestedViewRenderNodes,
  'checkSlotCount': checkSlotCount
});


@Injectable()
export class ViewCompiler {
  constructor() {}

  compileComponentRuntime(component: CompileDirectiveMetadata, template: TemplateAst[],
                          styles: Array<string | any[]>,
                          protoViews: CompileProtoView<AppProtoView, AppProtoElement>[],
                          changeDetectorFactories: Function[],
                          componentViewFactory: Function): Function {
    var viewFactory = new RuntimeViewFactory(component, styles, protoViews, changeDetectorFactories,
                                             componentViewFactory);
    return viewFactory.createViewFactory(template, 0, []);
  }

  compileComponentCodeGen(component: CompileDirectiveMetadata, template: TemplateAst[],
                          styles: SourceExpression,
                          protoViews: CompileProtoView<Expression, Expression>[],
                          changeDetectorFactoryExpressions: SourceExpressions,
                          componentViewFactory: Function): SourceExpression {
    var viewFactory = new CodeGenViewFactory(
        component, styles, protoViews, changeDetectorFactoryExpressions, componentViewFactory);
    var targetStatements: Statement[] = [];
    var viewFactoryExpression = viewFactory.createViewFactory(template, 0, targetStatements);
    return new SourceExpression(targetStatements.map(stmt => stmt.statement),
                                viewFactoryExpression.expression);
  }
}

interface ViewFactory<EXPRESSION, STATEMENT> {
  createText(renderer: EXPRESSION, parent: EXPRESSION, text: string,
             targetStatements: STATEMENT[]): EXPRESSION;

  createElement(renderer: EXPRESSION, parent: EXPRESSION, name: string, rootSelector: EXPRESSION,
                targetStatements: STATEMENT[]): EXPRESSION;

  createTemplateAnchor(renderer: EXPRESSION, parent: EXPRESSION,
                       targetStatements: STATEMENT[]): EXPRESSION;

  createGlobalEventListener(renderer: EXPRESSION, view: EXPRESSION, boundElementIndex: number,
                            eventAst: BoundEventAst, targetStatements: STATEMENT[]): EXPRESSION;

  createElementEventListener(renderer: EXPRESSION, view: EXPRESSION, boundElementIndex: number,
                             renderNode: EXPRESSION, eventAst: BoundEventAst,
                             targetStatements: STATEMENT[]): EXPRESSION;

  setElementAttribute(renderer: EXPRESSION, renderNode: EXPRESSION, attrName: string,
                      attrValue: string, targetStatements: STATEMENT[]);

  createAppElement(appProtoEl: EXPRESSION, view: EXPRESSION, renderNode: EXPRESSION,
                   parentAppEl: EXPRESSION, embeddedViewFactory: EXPRESSION,
                   targetStatements: STATEMENT[]): EXPRESSION;

  createAndSetComponentView(renderer: EXPRESSION, viewManager: EXPRESSION, view: EXPRESSION,
                            appEl: EXPRESSION, component: CompileDirectiveMetadata,
                            contentNodesByNgContentIndex: EXPRESSION[][],
                            targetStatements: STATEMENT[]);

  getProjectedNodes(projectableNodes: EXPRESSION, ngContentIndex: number): EXPRESSION;

  appendProjectedNodes(renderer: EXPRESSION, parent: EXPRESSION, nodes: EXPRESSION,
                       targetStatements: STATEMENT[]);

  createViewFactory(asts: TemplateAst[], embeddedTemplateIndex: number,
                    targetStatements: STATEMENT[]): EXPRESSION;
}

class CodeGenViewFactory implements ViewFactory<Expression, Statement> {
  private _nextVarId: number = 0;
  constructor(public component: CompileDirectiveMetadata, public styles: SourceExpression,
              public protoViews: CompileProtoView<Expression, Expression>[],
              public changeDetectorExpressions: SourceExpressions,
              public componentViewFactory: Function) {}

  private _nextVar(prefix: string): string {
    return `${prefix}${this._nextVarId++}_${this.component.type.name}`;
  }

  private _nextRenderVar(): string { return this._nextVar('render'); }

  private _nextAppVar(): string { return this._nextVar('app'); }

  private _nextDisposableVar(): string {
    return `disposable${this._nextVarId++}_${this.component.type.name}`;
  }

  createText(renderer: Expression, parent: Expression, text: string,
             targetStatements: Statement[]): Expression {
    var varName = this._nextRenderVar();
    var statement =
        `var ${varName} = ${renderer.expression}.createText(${isPresent(parent) ? parent.expression : null}, ${escapeSingleQuoteString(text)});`;
    targetStatements.push(new Statement(statement));
    return new Expression(varName);
  }

  createElement(renderer: Expression, parentRenderNode: Expression, name: string,
                rootSelector: Expression, targetStatements: Statement[]): Expression {
    var varName = this._nextRenderVar();
    var valueExpr;
    if (isPresent(rootSelector)) {
      valueExpr = `${rootSelector.expression} == null ?
        ${renderer.expression}.createElement(${isPresent(parentRenderNode) ? parentRenderNode.expression : null}, ${escapeSingleQuoteString(name)}) :
        ${renderer.expression}.selectRootElement(${rootSelector.expression});`;
    } else {
      valueExpr =
          `${renderer.expression}.createElement(${isPresent(parentRenderNode) ? parentRenderNode.expression : null}, ${escapeSingleQuoteString(name)})`;
    }
    var statement = `var ${varName} = ${valueExpr};`;
    targetStatements.push(new Statement(statement));
    return new Expression(varName);
  }

  createTemplateAnchor(renderer: Expression, parentRenderNode: Expression,
                       targetStatements: Statement[]): Expression {
    var varName = this._nextRenderVar();
    var valueExpr =
        `${renderer.expression}.createTemplateAnchor(${isPresent(parentRenderNode) ? parentRenderNode.expression : null});`;
    targetStatements.push(new Statement(`var ${varName} = ${valueExpr}`));
    return new Expression(varName);
  }

  createGlobalEventListener(renderer: Expression, appView: Expression, boundElementIndex: number,
                            eventAst: BoundEventAst, targetStatements: Statement[]): Expression {
    var disposableVar = this._nextDisposableVar();
    var eventHandlerExpr = codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
    targetStatements.push(new Statement(
        `var ${disposableVar} = ${renderer.expression}.listenGlobal(${escapeValue(eventAst.target)}, ${escapeValue(eventAst.name)}, ${eventHandlerExpr});`));
    return new Expression(disposableVar);
  }

  createElementEventListener(renderer: Expression, appView: Expression, boundElementIndex: number,
                             renderNode: Expression, eventAst: BoundEventAst,
                             targetStatements: Statement[]) {
    var disposableVar = this._nextDisposableVar();
    var eventHandlerExpr = codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
    targetStatements.push(new Statement(
        `var ${disposableVar} = ${renderer.expression}.listen(${renderNode.expression}, ${escapeValue(eventAst.name)}, ${eventHandlerExpr});`));
    return new Expression(disposableVar);
  }

  setElementAttribute(renderer: Expression, renderNode: Expression, attrName: string,
                      attrValue: string, targetStatements: Statement[]) {
    targetStatements.push(new Statement(
        `${renderer.expression}.setElementAttribute(${renderNode.expression}, ${escapeSingleQuoteString(attrName)}, ${escapeSingleQuoteString(attrValue)});`));
  }

  createAppElement(appProtoEl: Expression, appView: Expression, renderNode: Expression,
                   parentAppEl: Expression, embeddedViewFactory: Expression,
                   targetStatements: Statement[]): Expression {
    var appVar = this._nextAppVar();
    var varValue =
        `new ${APP_EL_MODULE_REF}AppElement(${appProtoEl.expression}, ${appView.expression},
      ${isPresent(parentAppEl) ? parentAppEl.expression : null}, ${renderNode.expression}, ${isPresent(embeddedViewFactory) ? embeddedViewFactory.expression : null})`;
    targetStatements.push(new Statement(`var ${appVar} = ${varValue};`));
    return new Expression(appVar);
  }

  createAndSetComponentView(renderer: Expression, viewManager: Expression, view: Expression,
                            appEl: Expression, component: CompileDirectiveMetadata,
                            contentNodesByNgContentIndex: Expression[][],
                            targetStatements: Statement[]) {
    var codeGenContentNodes;
    if (this.component.type.isHost) {
      codeGenContentNodes = `${view.expression}.projectableNodes`;
    } else {
      codeGenContentNodes =
          `[${contentNodesByNgContentIndex.map( nodes => codeGenFlatArray(nodes) ).join(',')}]`;
    }
    targetStatements.push(new Statement(
        `${this.componentViewFactory(component)}(${renderer.expression}, ${viewManager.expression}, ${appEl.expression}, ${codeGenContentNodes}, null, null, null);`));
  }

  getProjectedNodes(projectableNodes: Expression, ngContentIndex: number): Expression {
    return new Expression(`${projectableNodes.expression}[${ngContentIndex}]`, true);
  }

  appendProjectedNodes(renderer: Expression, parent: Expression, nodes: Expression,
                       targetStatements: Statement[]) {
    targetStatements.push(new Statement(
        `${renderer.expression}.projectNodes(${parent.expression}, ${APP_VIEW_MODULE_REF}flattenNestedViewRenderNodes(${nodes.expression}));`));
  }

  createViewFactory(asts: TemplateAst[], embeddedTemplateIndex: number,
                    targetStatements: Statement[]): Expression {
    var compileProtoView = this.protoViews[embeddedTemplateIndex];
    var isHostView = this.component.type.isHost;
    var isComponentView = embeddedTemplateIndex === 0 && !isHostView;
    var visitor = new ViewBuilderVisitor<Expression, Statement>(
        new Expression('renderer'), new Expression('viewManager'),
        new Expression('projectableNodes'), isHostView ? new Expression('rootSelector') : null,
        new Expression('view'), compileProtoView, targetStatements, this);

    templateVisitAll(
        visitor, asts,
        new ParentElement(isComponentView ? new Expression('parentRenderNode') : null, null, null));

    var appProtoView = compileProtoView.protoView.expression;
    var viewFactoryName = codeGenViewFactoryName(this.component, embeddedTemplateIndex);
    var changeDetectorFactory = this.changeDetectorExpressions.expressions[embeddedTemplateIndex];
    var factoryArgs = [
      'parentRenderer',
      'viewManager',
      'containerEl',
      'projectableNodes',
      'rootSelector',
      'dynamicallyCreatedProviders',
      'rootInjector'
    ];
    var initRendererStmts = [];
    var rendererExpr = `parentRenderer`;
    if (embeddedTemplateIndex === 0) {
      var renderCompTypeVar = this._nextVar('renderType');
      targetStatements.push(new Statement(`var ${renderCompTypeVar} = null;`));
      var stylesVar = this._nextVar('styles');
      targetStatements.push(
          new Statement(`${CONST_VAR} ${stylesVar} = ${this.styles.expression};`));
      var encapsulation = this.component.template.encapsulation;
      initRendererStmts.push(`if (${renderCompTypeVar} == null) {
        ${renderCompTypeVar} = viewManager.createRenderComponentType(${codeGenViewEncapsulation(encapsulation)}, ${stylesVar});
      }`);
      rendererExpr = `parentRenderer.renderComponent(${renderCompTypeVar})`;
    }
    var statement = `
${codeGenFnHeader(factoryArgs, viewFactoryName)}{
  ${initRendererStmts.join('\n')}
  var renderer = ${rendererExpr};
  var view = new ${APP_VIEW_MODULE_REF}AppView(
    ${appProtoView}, renderer, viewManager,
    projectableNodes,
    containerEl,
    dynamicallyCreatedProviders, rootInjector,
    ${changeDetectorFactory}()
  );
  ${APP_VIEW_MODULE_REF}checkSlotCount(${escapeValue(this.component.type.name)}, ${this.component.template.ngContentSelectors.length}, projectableNodes);
  ${isComponentView ? 'var parentRenderNode = renderer.createViewRoot(view.containerAppElement.nativeElement);' : ''}
  ${visitor.renderStmts.map(stmt => stmt.statement).join('\n')}
  ${visitor.appStmts.map(stmt => stmt.statement).join('\n')}

  view.init(${codeGenFlatArray(visitor.rootNodesOrAppElements)}, ${codeGenArray(visitor.renderNodes)}, ${codeGenArray(visitor.appDisposables)},
            ${codeGenArray(visitor.appElements)});
  return view;
}`;
    targetStatements.push(new Statement(statement));
    return new Expression(viewFactoryName);
  }
}

class RuntimeViewFactory implements ViewFactory<any, any> {
  constructor(public component: CompileDirectiveMetadata, public styles: Array<string | any[]>,
              public protoViews: CompileProtoView<AppProtoView, AppProtoElement>[],
              public changeDetectorFactories: Function[], public componentViewFactory: Function) {}

  createText(renderer: Renderer, parent: any, text: string, targetStatements: any[]): any {
    return renderer.createText(parent, text);
  }

  createElement(renderer: Renderer, parent: any, name: string, rootSelector: string,
                targetStatements: any[]): any {
    var el;
    if (isPresent(rootSelector)) {
      el = renderer.selectRootElement(rootSelector);
    } else {
      el = renderer.createElement(parent, name);
    }
    return el;
  }

  createTemplateAnchor(renderer: Renderer, parent: any, targetStatements: any[]): any {
    return renderer.createTemplateAnchor(parent);
  }

  createGlobalEventListener(renderer: Renderer, appView: AppView, boundElementIndex: number,
                            eventAst: BoundEventAst, targetStatements: any[]): any {
    return renderer.listenGlobal(
        eventAst.target, eventAst.name,
        (event) => appView.triggerEventHandlers(eventAst.fullName, event, boundElementIndex));
  }

  createElementEventListener(renderer: Renderer, appView: AppView, boundElementIndex: number,
                             renderNode: any, eventAst: BoundEventAst,
                             targetStatements: any[]): any {
    return renderer.listen(
        renderNode, eventAst.name,
        (event) => appView.triggerEventHandlers(eventAst.fullName, event, boundElementIndex));
  }

  setElementAttribute(renderer: Renderer, renderNode: any, attrName: string, attrValue: string,
                      targetStatements: any[]) {
    renderer.setElementAttribute(renderNode, attrName, attrValue);
  }

  createAppElement(appProtoEl: AppProtoElement, appView: AppView, renderNode: any,
                   parentAppEl: AppElement, embeddedViewFactory: Function,
                   targetStatements: any[]): any {
    return new AppElement(appProtoEl, appView, parentAppEl, renderNode, embeddedViewFactory);
  }

  createAndSetComponentView(renderer: Renderer, viewManager: AppViewManager_, appView: AppView,
                            appEl: AppElement, component: CompileDirectiveMetadata,
                            contentNodesByNgContentIndex: Array<Array<any | any[]>>,
                            targetStatements: any[]) {
    var flattenedContentNodes;
    if (this.component.type.isHost) {
      flattenedContentNodes = appView.projectableNodes;
    } else {
      flattenedContentNodes = ListWrapper.createFixedSize(contentNodesByNgContentIndex.length);
      for (var i = 0; i < contentNodesByNgContentIndex.length; i++) {
        flattenedContentNodes[i] = flattenArray(contentNodesByNgContentIndex[i], []);
      }
    }
    this.componentViewFactory(component)(renderer, viewManager, appEl, flattenedContentNodes);
  }

  getProjectedNodes(projectableNodes: any[][], ngContentIndex: number): any[] {
    return projectableNodes[ngContentIndex];
  }

  appendProjectedNodes(renderer: Renderer, parent: any, nodes: any[], targetStatements: any[]) {
    renderer.projectNodes(parent, flattenNestedViewRenderNodes(nodes));
  }

  createViewFactory(asts: TemplateAst[], embeddedTemplateIndex: number,
                    targetStatements: any[]): Function {
    var compileProtoView = this.protoViews[embeddedTemplateIndex];
    var isComponentView = compileProtoView.protoView.type === ViewType.COMPONENT;
    var renderComponentType = null;
    return (parentRenderer: ParentRenderer, viewManager: AppViewManager_, containerEl: AppElement,
            projectableNodes: any[][], rootSelector: string = null,
            dynamicallyCreatedProviders: ResolvedProvider[] = null,
            rootInjector: Injector = null) => {
      checkSlotCount(this.component.type.name, this.component.template.ngContentSelectors.length,
                     projectableNodes);
      var renderer;
      if (embeddedTemplateIndex === 0) {
        if (isBlank(renderComponentType)) {
          renderComponentType = viewManager.createRenderComponentType(
              this.component.template.encapsulation, this.styles);
        }
        renderer = parentRenderer.renderComponent(renderComponentType);
      } else {
        renderer = <Renderer>parentRenderer;
      }
      var changeDetector = this.changeDetectorFactories[embeddedTemplateIndex]();
      var view =
          new AppView(compileProtoView.protoView, renderer, viewManager, projectableNodes,
                      containerEl, dynamicallyCreatedProviders, rootInjector, changeDetector);
      var visitor = new ViewBuilderVisitor<any, any>(
          renderer, viewManager, projectableNodes, rootSelector, view, compileProtoView, [], this);
      var parentRenderNode =
          isComponentView ? renderer.createViewRoot(containerEl.nativeElement) : null;
      templateVisitAll(visitor, asts, new ParentElement(parentRenderNode, null, null));
      view.init(flattenArray(visitor.rootNodesOrAppElements, []), visitor.renderNodes,
                visitor.appDisposables, visitor.appElements);
      return view;
    };
  }
}

class ParentElement<EXPRESSION> {
  public contentNodesByNgContentIndex: Array<EXPRESSION>[];

  constructor(public renderNode: EXPRESSION, public appEl: EXPRESSION,
              public component: CompileDirectiveMetadata) {
    if (isPresent(component)) {
      this.contentNodesByNgContentIndex =
          ListWrapper.createFixedSize(component.template.ngContentSelectors.length);
      for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
        this.contentNodesByNgContentIndex[i] = [];
      }
    } else {
      this.contentNodesByNgContentIndex = null;
    }
  }

  addContentNode(ngContentIndex: number, nodeExpr: EXPRESSION) {
    this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
  }
}

class ViewBuilderVisitor<EXPRESSION, STATEMENT> implements TemplateAstVisitor {
  renderStmts: Array<STATEMENT> = [];
  renderNodes: EXPRESSION[] = [];
  appStmts: Array<STATEMENT> = [];
  appElements: EXPRESSION[] = [];
  appDisposables: EXPRESSION[] = [];

  rootNodesOrAppElements: EXPRESSION[] = [];

  elementCount: number = 0;

  constructor(public renderer: EXPRESSION, public viewManager: EXPRESSION,
              public projectableNodes: EXPRESSION, public rootSelector: EXPRESSION,
              public view: EXPRESSION, public protoView: CompileProtoView<EXPRESSION, EXPRESSION>,
              public targetStatements: STATEMENT[],
              public factory: ViewFactory<EXPRESSION, STATEMENT>) {}

  private _addRenderNode(renderNode: EXPRESSION, appEl: EXPRESSION, ngContentIndex: number,
                         parent: ParentElement<EXPRESSION>) {
    this.renderNodes.push(renderNode);
    if (isPresent(parent.component)) {
      if (isPresent(ngContentIndex)) {
        parent.addContentNode(ngContentIndex, isPresent(appEl) ? appEl : renderNode);
      }
    } else if (isBlank(parent.renderNode)) {
      this.rootNodesOrAppElements.push(isPresent(appEl) ? appEl : renderNode);
    }
  }

  private _getParentRenderNode(ngContentIndex: number,
                               parent: ParentElement<EXPRESSION>): EXPRESSION {
    return isPresent(parent.component) &&
                   parent.component.template.encapsulation !== ViewEncapsulation.Native ?
               null :
               parent.renderNode;
  }

  visitBoundText(ast: BoundTextAst, parent: ParentElement<EXPRESSION>): any {
    return this._visitText('', ast.ngContentIndex, parent);
  }
  visitText(ast: TextAst, parent: ParentElement<EXPRESSION>): any {
    return this._visitText(ast.value, ast.ngContentIndex, parent);
  }
  private _visitText(value: string, ngContentIndex: number, parent: ParentElement<EXPRESSION>) {
    var renderNode = this.factory.createText(
        this.renderer, this._getParentRenderNode(ngContentIndex, parent), value, this.renderStmts);
    this._addRenderNode(renderNode, null, ngContentIndex, parent);
    return null;
  }

  visitNgContent(ast: NgContentAst, parent: ParentElement<EXPRESSION>): any {
    var nodesExpression = this.factory.getProjectedNodes(this.projectableNodes, ast.index);
    if (isPresent(parent.component)) {
      if (isPresent(ast.ngContentIndex)) {
        parent.addContentNode(ast.ngContentIndex, nodesExpression);
      }
    } else {
      if (isPresent(parent.renderNode)) {
        this.factory.appendProjectedNodes(this.renderer, parent.renderNode, nodesExpression,
                                          this.renderStmts);
      } else {
        this.rootNodesOrAppElements.push(nodesExpression);
      }
    }
    return null;
  }

  visitElement(ast: ElementAst, parent: ParentElement<EXPRESSION>): any {
    var renderNode = this.factory.createElement(
        this.renderer, this._getParentRenderNode(ast.ngContentIndex, parent), ast.name,
        this.rootSelector, this.renderStmts);

    var component = ast.getComponent();
    var elementIndex = this.elementCount++;
    var protoEl = this.protoView.protoElements[elementIndex];

    protoEl.renderEvents.forEach((eventAst) => {
      var disposable;
      if (isPresent(eventAst.target)) {
        disposable = this.factory.createGlobalEventListener(
            this.renderer, this.view, protoEl.boundElementIndex, eventAst, this.renderStmts);
      } else {
        disposable = this.factory.createElementEventListener(this.renderer, this.view,
                                                             protoEl.boundElementIndex, renderNode,
                                                             eventAst, this.renderStmts);
      }
      this.appDisposables.push(disposable);
    });
    for (var i = 0; i < protoEl.attrNameAndValues.length; i++) {
      var attrName = protoEl.attrNameAndValues[i][0];
      var attrValue = protoEl.attrNameAndValues[i][1];
      this.factory.setElementAttribute(this.renderer, renderNode, attrName, attrValue,
                                       this.renderStmts);
    }
    var appEl = null;
    if (isPresent(protoEl.appProtoEl)) {
      appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view, renderNode, parent.appEl,
                                            null, this.appStmts);
      this.appElements.push(appEl);
    }
    this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);

    var newParent = new ParentElement<EXPRESSION>(
        renderNode, isPresent(appEl) ? appEl : parent.appEl, component);
    templateVisitAll(this, ast.children, newParent);
    if (isPresent(appEl) && isPresent(component)) {
      this.factory.createAndSetComponentView(this.renderer, this.viewManager, this.view, appEl,
                                             component, newParent.contentNodesByNgContentIndex,
                                             this.appStmts);
    }
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: ParentElement<EXPRESSION>): any {
    var renderNode = this.factory.createTemplateAnchor(
        this.renderer, this._getParentRenderNode(ast.ngContentIndex, parent), this.renderStmts);

    var elementIndex = this.elementCount++;
    var protoEl = this.protoView.protoElements[elementIndex];
    var embeddedViewFactory = this.factory.createViewFactory(
        ast.children, protoEl.embeddedTemplateIndex, this.targetStatements);

    var appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view, renderNode,
                                              parent.appEl, embeddedViewFactory, this.appStmts);
    this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);
    this.appElements.push(appEl);
    return null;
  }

  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitAttr(ast: AttrAst, ctx: any): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any { return null; }
  visitEvent(ast: BoundEventAst, ctx: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}


function codeGenEventHandler(view: Expression, boundElementIndex: number,
                             eventName: string): string {
  return codeGenValueFn(
      ['event'],
      `${view.expression}.triggerEventHandlers(${escapeValue(eventName)}, event, ${boundElementIndex})`);
}

function codeGenViewFactoryName(component: CompileDirectiveMetadata,
                                embeddedTemplateIndex: number): string {
  return `viewFactory_${component.type.name}${embeddedTemplateIndex}`;
}

function codeGenViewEncapsulation(value: ViewEncapsulation): string {
  if (IS_DART) {
    return `${METADATA_MODULE_REF}${value}`;
  } else {
    return `${value}`;
  }
}
