var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank, IS_DART, CONST_EXPR } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { templateVisitAll } from './template_ast';
import { SourceExpression } from './source_module';
import { AppView, flattenNestedViewRenderNodes, checkSlotCount } from 'angular2/src/core/linker/view';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { AppElement } from 'angular2/src/core/linker/element';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { escapeSingleQuoteString, codeGenValueFn, codeGenFnHeader, Statement, escapeValue, codeGenArray, codeGenFlatArray, Expression, flattenArray, CONST_VAR } from './util';
import { Injectable } from 'angular2/src/core/di';
import { APP_VIEW_MODULE_REF, APP_EL_MODULE_REF, METADATA_MODULE_REF } from './proto_view_compiler';
export const VIEW_JIT_IMPORTS = CONST_EXPR({
    'AppView': AppView,
    'AppElement': AppElement,
    'flattenNestedViewRenderNodes': flattenNestedViewRenderNodes,
    'checkSlotCount': checkSlotCount
});
export let ViewCompiler = class {
    constructor() {
    }
    compileComponentRuntime(component, template, styles, protoViews, changeDetectorFactories, componentViewFactory) {
        var viewFactory = new RuntimeViewFactory(component, styles, protoViews, changeDetectorFactories, componentViewFactory);
        return viewFactory.createViewFactory(template, 0, []);
    }
    compileComponentCodeGen(component, template, styles, protoViews, changeDetectorFactoryExpressions, componentViewFactory) {
        var viewFactory = new CodeGenViewFactory(component, styles, protoViews, changeDetectorFactoryExpressions, componentViewFactory);
        var targetStatements = [];
        var viewFactoryExpression = viewFactory.createViewFactory(template, 0, targetStatements);
        return new SourceExpression(targetStatements.map(stmt => stmt.statement), viewFactoryExpression.expression);
    }
};
ViewCompiler = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], ViewCompiler);
class CodeGenViewFactory {
    constructor(component, styles, protoViews, changeDetectorExpressions, componentViewFactory) {
        this.component = component;
        this.styles = styles;
        this.protoViews = protoViews;
        this.changeDetectorExpressions = changeDetectorExpressions;
        this.componentViewFactory = componentViewFactory;
        this._nextVarId = 0;
    }
    _nextVar(prefix) {
        return `${prefix}${this._nextVarId++}_${this.component.type.name}`;
    }
    _nextRenderVar() { return this._nextVar('render'); }
    _nextAppVar() { return this._nextVar('app'); }
    _nextDisposableVar() {
        return `disposable${this._nextVarId++}_${this.component.type.name}`;
    }
    createText(renderer, parent, text, targetStatements) {
        var varName = this._nextRenderVar();
        var statement = `var ${varName} = ${renderer.expression}.createText(${isPresent(parent) ? parent.expression : null}, ${escapeSingleQuoteString(text)});`;
        targetStatements.push(new Statement(statement));
        return new Expression(varName);
    }
    createElement(renderer, parentRenderNode, name, rootSelector, targetStatements) {
        var varName = this._nextRenderVar();
        var valueExpr;
        if (isPresent(rootSelector)) {
            valueExpr = `${rootSelector.expression} == null ?
        ${renderer.expression}.createElement(${isPresent(parentRenderNode) ? parentRenderNode.expression : null}, ${escapeSingleQuoteString(name)}) :
        ${renderer.expression}.selectRootElement(${rootSelector.expression});`;
        }
        else {
            valueExpr =
                `${renderer.expression}.createElement(${isPresent(parentRenderNode) ? parentRenderNode.expression : null}, ${escapeSingleQuoteString(name)})`;
        }
        var statement = `var ${varName} = ${valueExpr};`;
        targetStatements.push(new Statement(statement));
        return new Expression(varName);
    }
    createTemplateAnchor(renderer, parentRenderNode, targetStatements) {
        var varName = this._nextRenderVar();
        var valueExpr = `${renderer.expression}.createTemplateAnchor(${isPresent(parentRenderNode) ? parentRenderNode.expression : null});`;
        targetStatements.push(new Statement(`var ${varName} = ${valueExpr}`));
        return new Expression(varName);
    }
    createGlobalEventListener(renderer, appView, boundElementIndex, eventAst, targetStatements) {
        var disposableVar = this._nextDisposableVar();
        var eventHandlerExpr = codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
        targetStatements.push(new Statement(`var ${disposableVar} = ${renderer.expression}.listenGlobal(${escapeValue(eventAst.target)}, ${escapeValue(eventAst.name)}, ${eventHandlerExpr});`));
        return new Expression(disposableVar);
    }
    createElementEventListener(renderer, appView, boundElementIndex, renderNode, eventAst, targetStatements) {
        var disposableVar = this._nextDisposableVar();
        var eventHandlerExpr = codeGenEventHandler(appView, boundElementIndex, eventAst.fullName);
        targetStatements.push(new Statement(`var ${disposableVar} = ${renderer.expression}.listen(${renderNode.expression}, ${escapeValue(eventAst.name)}, ${eventHandlerExpr});`));
        return new Expression(disposableVar);
    }
    setElementAttribute(renderer, renderNode, attrName, attrValue, targetStatements) {
        targetStatements.push(new Statement(`${renderer.expression}.setElementAttribute(${renderNode.expression}, ${escapeSingleQuoteString(attrName)}, ${escapeSingleQuoteString(attrValue)});`));
    }
    createAppElement(appProtoEl, appView, renderNode, parentAppEl, embeddedViewFactory, targetStatements) {
        var appVar = this._nextAppVar();
        var varValue = `new ${APP_EL_MODULE_REF}AppElement(${appProtoEl.expression}, ${appView.expression},
      ${isPresent(parentAppEl) ? parentAppEl.expression : null}, ${renderNode.expression}, ${isPresent(embeddedViewFactory) ? embeddedViewFactory.expression : null})`;
        targetStatements.push(new Statement(`var ${appVar} = ${varValue};`));
        return new Expression(appVar);
    }
    createAndSetComponentView(renderer, viewManager, view, appEl, component, contentNodesByNgContentIndex, targetStatements) {
        var codeGenContentNodes;
        if (this.component.type.isHost) {
            codeGenContentNodes = `${view.expression}.projectableNodes`;
        }
        else {
            codeGenContentNodes =
                `[${contentNodesByNgContentIndex.map(nodes => codeGenFlatArray(nodes)).join(',')}]`;
        }
        targetStatements.push(new Statement(`${this.componentViewFactory(component)}(${renderer.expression}, ${viewManager.expression}, ${appEl.expression}, ${codeGenContentNodes}, null, null, null);`));
    }
    getProjectedNodes(projectableNodes, ngContentIndex) {
        return new Expression(`${projectableNodes.expression}[${ngContentIndex}]`, true);
    }
    appendProjectedNodes(renderer, parent, nodes, targetStatements) {
        targetStatements.push(new Statement(`${renderer.expression}.projectNodes(${parent.expression}, ${APP_VIEW_MODULE_REF}flattenNestedViewRenderNodes(${nodes.expression}));`));
    }
    createViewFactory(asts, embeddedTemplateIndex, targetStatements) {
        var compileProtoView = this.protoViews[embeddedTemplateIndex];
        var isHostView = this.component.type.isHost;
        var isComponentView = embeddedTemplateIndex === 0 && !isHostView;
        var visitor = new ViewBuilderVisitor(new Expression('renderer'), new Expression('viewManager'), new Expression('projectableNodes'), isHostView ? new Expression('rootSelector') : null, new Expression('view'), compileProtoView, targetStatements, this);
        templateVisitAll(visitor, asts, new ParentElement(isComponentView ? new Expression('parentRenderNode') : null, null, null));
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
            targetStatements.push(new Statement(`${CONST_VAR} ${stylesVar} = ${this.styles.expression};`));
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
class RuntimeViewFactory {
    constructor(component, styles, protoViews, changeDetectorFactories, componentViewFactory) {
        this.component = component;
        this.styles = styles;
        this.protoViews = protoViews;
        this.changeDetectorFactories = changeDetectorFactories;
        this.componentViewFactory = componentViewFactory;
    }
    createText(renderer, parent, text, targetStatements) {
        return renderer.createText(parent, text);
    }
    createElement(renderer, parent, name, rootSelector, targetStatements) {
        var el;
        if (isPresent(rootSelector)) {
            el = renderer.selectRootElement(rootSelector);
        }
        else {
            el = renderer.createElement(parent, name);
        }
        return el;
    }
    createTemplateAnchor(renderer, parent, targetStatements) {
        return renderer.createTemplateAnchor(parent);
    }
    createGlobalEventListener(renderer, appView, boundElementIndex, eventAst, targetStatements) {
        return renderer.listenGlobal(eventAst.target, eventAst.name, (event) => appView.triggerEventHandlers(eventAst.fullName, event, boundElementIndex));
    }
    createElementEventListener(renderer, appView, boundElementIndex, renderNode, eventAst, targetStatements) {
        return renderer.listen(renderNode, eventAst.name, (event) => appView.triggerEventHandlers(eventAst.fullName, event, boundElementIndex));
    }
    setElementAttribute(renderer, renderNode, attrName, attrValue, targetStatements) {
        renderer.setElementAttribute(renderNode, attrName, attrValue);
    }
    createAppElement(appProtoEl, appView, renderNode, parentAppEl, embeddedViewFactory, targetStatements) {
        return new AppElement(appProtoEl, appView, parentAppEl, renderNode, embeddedViewFactory);
    }
    createAndSetComponentView(renderer, viewManager, appView, appEl, component, contentNodesByNgContentIndex, targetStatements) {
        var flattenedContentNodes;
        if (this.component.type.isHost) {
            flattenedContentNodes = appView.projectableNodes;
        }
        else {
            flattenedContentNodes = ListWrapper.createFixedSize(contentNodesByNgContentIndex.length);
            for (var i = 0; i < contentNodesByNgContentIndex.length; i++) {
                flattenedContentNodes[i] = flattenArray(contentNodesByNgContentIndex[i], []);
            }
        }
        this.componentViewFactory(component)(renderer, viewManager, appEl, flattenedContentNodes);
    }
    getProjectedNodes(projectableNodes, ngContentIndex) {
        return projectableNodes[ngContentIndex];
    }
    appendProjectedNodes(renderer, parent, nodes, targetStatements) {
        renderer.projectNodes(parent, flattenNestedViewRenderNodes(nodes));
    }
    createViewFactory(asts, embeddedTemplateIndex, targetStatements) {
        var compileProtoView = this.protoViews[embeddedTemplateIndex];
        var isComponentView = compileProtoView.protoView.type === ViewType.COMPONENT;
        var renderComponentType = null;
        return (parentRenderer, viewManager, containerEl, projectableNodes, rootSelector = null, dynamicallyCreatedProviders = null, rootInjector = null) => {
            checkSlotCount(this.component.type.name, this.component.template.ngContentSelectors.length, projectableNodes);
            var renderer;
            if (embeddedTemplateIndex === 0) {
                if (isBlank(renderComponentType)) {
                    renderComponentType = viewManager.createRenderComponentType(this.component.template.encapsulation, this.styles);
                }
                renderer = parentRenderer.renderComponent(renderComponentType);
            }
            else {
                renderer = parentRenderer;
            }
            var changeDetector = this.changeDetectorFactories[embeddedTemplateIndex]();
            var view = new AppView(compileProtoView.protoView, renderer, viewManager, projectableNodes, containerEl, dynamicallyCreatedProviders, rootInjector, changeDetector);
            var visitor = new ViewBuilderVisitor(renderer, viewManager, projectableNodes, rootSelector, view, compileProtoView, [], this);
            var parentRenderNode = isComponentView ? renderer.createViewRoot(containerEl.nativeElement) : null;
            templateVisitAll(visitor, asts, new ParentElement(parentRenderNode, null, null));
            view.init(flattenArray(visitor.rootNodesOrAppElements, []), visitor.renderNodes, visitor.appDisposables, visitor.appElements);
            return view;
        };
    }
}
class ParentElement {
    constructor(renderNode, appEl, component) {
        this.renderNode = renderNode;
        this.appEl = appEl;
        this.component = component;
        if (isPresent(component)) {
            this.contentNodesByNgContentIndex =
                ListWrapper.createFixedSize(component.template.ngContentSelectors.length);
            for (var i = 0; i < this.contentNodesByNgContentIndex.length; i++) {
                this.contentNodesByNgContentIndex[i] = [];
            }
        }
        else {
            this.contentNodesByNgContentIndex = null;
        }
    }
    addContentNode(ngContentIndex, nodeExpr) {
        this.contentNodesByNgContentIndex[ngContentIndex].push(nodeExpr);
    }
}
class ViewBuilderVisitor {
    constructor(renderer, viewManager, projectableNodes, rootSelector, view, protoView, targetStatements, factory) {
        this.renderer = renderer;
        this.viewManager = viewManager;
        this.projectableNodes = projectableNodes;
        this.rootSelector = rootSelector;
        this.view = view;
        this.protoView = protoView;
        this.targetStatements = targetStatements;
        this.factory = factory;
        this.renderStmts = [];
        this.renderNodes = [];
        this.appStmts = [];
        this.appElements = [];
        this.appDisposables = [];
        this.rootNodesOrAppElements = [];
        this.elementCount = 0;
    }
    _addRenderNode(renderNode, appEl, ngContentIndex, parent) {
        this.renderNodes.push(renderNode);
        if (isPresent(parent.component)) {
            if (isPresent(ngContentIndex)) {
                parent.addContentNode(ngContentIndex, isPresent(appEl) ? appEl : renderNode);
            }
        }
        else if (isBlank(parent.renderNode)) {
            this.rootNodesOrAppElements.push(isPresent(appEl) ? appEl : renderNode);
        }
    }
    _getParentRenderNode(ngContentIndex, parent) {
        return isPresent(parent.component) &&
            parent.component.template.encapsulation !== ViewEncapsulation.Native ?
            null :
            parent.renderNode;
    }
    visitBoundText(ast, parent) {
        return this._visitText('', ast.ngContentIndex, parent);
    }
    visitText(ast, parent) {
        return this._visitText(ast.value, ast.ngContentIndex, parent);
    }
    _visitText(value, ngContentIndex, parent) {
        var renderNode = this.factory.createText(this.renderer, this._getParentRenderNode(ngContentIndex, parent), value, this.renderStmts);
        this._addRenderNode(renderNode, null, ngContentIndex, parent);
        return null;
    }
    visitNgContent(ast, parent) {
        var nodesExpression = this.factory.getProjectedNodes(this.projectableNodes, ast.index);
        if (isPresent(parent.component)) {
            if (isPresent(ast.ngContentIndex)) {
                parent.addContentNode(ast.ngContentIndex, nodesExpression);
            }
        }
        else {
            if (isPresent(parent.renderNode)) {
                this.factory.appendProjectedNodes(this.renderer, parent.renderNode, nodesExpression, this.renderStmts);
            }
            else {
                this.rootNodesOrAppElements.push(nodesExpression);
            }
        }
        return null;
    }
    visitElement(ast, parent) {
        var renderNode = this.factory.createElement(this.renderer, this._getParentRenderNode(ast.ngContentIndex, parent), ast.name, this.rootSelector, this.renderStmts);
        var component = ast.getComponent();
        var elementIndex = this.elementCount++;
        var protoEl = this.protoView.protoElements[elementIndex];
        protoEl.renderEvents.forEach((eventAst) => {
            var disposable;
            if (isPresent(eventAst.target)) {
                disposable = this.factory.createGlobalEventListener(this.renderer, this.view, protoEl.boundElementIndex, eventAst, this.renderStmts);
            }
            else {
                disposable = this.factory.createElementEventListener(this.renderer, this.view, protoEl.boundElementIndex, renderNode, eventAst, this.renderStmts);
            }
            this.appDisposables.push(disposable);
        });
        for (var i = 0; i < protoEl.attrNameAndValues.length; i++) {
            var attrName = protoEl.attrNameAndValues[i][0];
            var attrValue = protoEl.attrNameAndValues[i][1];
            this.factory.setElementAttribute(this.renderer, renderNode, attrName, attrValue, this.renderStmts);
        }
        var appEl = null;
        if (isPresent(protoEl.appProtoEl)) {
            appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view, renderNode, parent.appEl, null, this.appStmts);
            this.appElements.push(appEl);
        }
        this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);
        var newParent = new ParentElement(renderNode, isPresent(appEl) ? appEl : parent.appEl, component);
        templateVisitAll(this, ast.children, newParent);
        if (isPresent(appEl) && isPresent(component)) {
            this.factory.createAndSetComponentView(this.renderer, this.viewManager, this.view, appEl, component, newParent.contentNodesByNgContentIndex, this.appStmts);
        }
        return null;
    }
    visitEmbeddedTemplate(ast, parent) {
        var renderNode = this.factory.createTemplateAnchor(this.renderer, this._getParentRenderNode(ast.ngContentIndex, parent), this.renderStmts);
        var elementIndex = this.elementCount++;
        var protoEl = this.protoView.protoElements[elementIndex];
        var embeddedViewFactory = this.factory.createViewFactory(ast.children, protoEl.embeddedTemplateIndex, this.targetStatements);
        var appEl = this.factory.createAppElement(protoEl.appProtoEl, this.view, renderNode, parent.appEl, embeddedViewFactory, this.appStmts);
        this._addRenderNode(renderNode, appEl, ast.ngContentIndex, parent);
        this.appElements.push(appEl);
        return null;
    }
    visitVariable(ast, ctx) { return null; }
    visitAttr(ast, ctx) { return null; }
    visitDirective(ast, ctx) { return null; }
    visitEvent(ast, ctx) { return null; }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function codeGenEventHandler(view, boundElementIndex, eventName) {
    return codeGenValueFn(['event'], `${view.expression}.triggerEventHandlers(${escapeValue(eventName)}, event, ${boundElementIndex})`);
}
function codeGenViewFactoryName(component, embeddedTemplateIndex) {
    return `viewFactory_${component.type.name}${embeddedTemplateIndex}`;
}
function codeGenViewEncapsulation(value) {
    if (IS_DART) {
        return `${METADATA_MODULE_REF}${value}`;
    }
    else {
        return `${value}`;
    }
}
