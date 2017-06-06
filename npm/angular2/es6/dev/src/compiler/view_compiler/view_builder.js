import { isPresent, StringWrapper } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper, SetWrapper } from 'angular2/src/facade/collection';
import * as o from '../output/output_ast';
import { Identifiers, identifierToken } from '../identifiers';
import { ViewConstructorVars, InjectMethodVars, DetectChangesVars, ViewTypeEnum, ViewEncapsulationEnum, ChangeDetectionStrategyEnum, ViewProperties } from './constants';
import { ChangeDetectionStrategy, isDefaultChangeDetectionStrategy } from 'angular2/src/core/change_detection/change_detection';
import { CompileView } from './compile_view';
import { CompileElement, CompileNode } from './compile_element';
import { templateVisitAll } from '../template_ast';
import { getViewFactoryName, createFlatArray, createDiTokenExpression } from './util';
import { ViewType } from 'angular2/src/core/linker/view_type';
import { ViewEncapsulation } from 'angular2/src/core/metadata/view';
import { CompileIdentifierMetadata } from '../compile_metadata';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
var parentRenderNodeVar = o.variable('parentRenderNode');
var rootSelectorVar = o.variable('rootSelector');
export class ViewCompileDependency {
    constructor(comp, factoryPlaceholder) {
        this.comp = comp;
        this.factoryPlaceholder = factoryPlaceholder;
    }
}
export function buildView(view, template, targetDependencies) {
    var builderVisitor = new ViewBuilderVisitor(view, targetDependencies);
    templateVisitAll(builderVisitor, template, view.declarationElement.isNull() ?
        view.declarationElement :
        view.declarationElement.parent);
    return builderVisitor.nestedViewCount;
}
export function finishView(view, targetStatements) {
    view.afterNodes();
    createViewTopLevelStmts(view, targetStatements);
    view.nodes.forEach((node) => {
        if (node instanceof CompileElement && node.hasEmbeddedView) {
            finishView(node.embeddedView, targetStatements);
        }
    });
}
class ViewBuilderVisitor {
    constructor(view, targetDependencies) {
        this.view = view;
        this.targetDependencies = targetDependencies;
        this.nestedViewCount = 0;
    }
    _isRootNode(parent) { return parent.view !== this.view; }
    _addRootNodeAndProject(node, ngContentIndex, parent) {
        var vcAppEl = (node instanceof CompileElement && node.hasViewContainer) ? node.appElement : null;
        if (this._isRootNode(parent)) {
            // store appElement as root node only for ViewContainers
            if (this.view.viewType !== ViewType.COMPONENT) {
                this.view.rootNodesOrAppElements.push(isPresent(vcAppEl) ? vcAppEl : node.renderNode);
            }
        }
        else if (isPresent(parent.component) && isPresent(ngContentIndex)) {
            parent.addContentNode(ngContentIndex, isPresent(vcAppEl) ? vcAppEl : node.renderNode);
        }
    }
    _getParentRenderNode(parent) {
        if (this._isRootNode(parent)) {
            if (this.view.viewType === ViewType.COMPONENT) {
                return parentRenderNodeVar;
            }
            else {
                // root node of an embedded/host view
                return o.NULL_EXPR;
            }
        }
        else {
            return isPresent(parent.component) &&
                parent.component.template.encapsulation !== ViewEncapsulation.Native ?
                o.NULL_EXPR :
                parent.renderNode;
        }
    }
    visitBoundText(ast, parent) {
        return this._visitText(ast, '', ast.ngContentIndex, parent);
    }
    visitText(ast, parent) {
        return this._visitText(ast, ast.value, ast.ngContentIndex, parent);
    }
    _visitText(ast, value, ngContentIndex, parent) {
        var fieldName = `_text_${this.view.nodes.length}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderText)));
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var compileNode = new CompileNode(parent, this.view, this.view.nodes.length, renderNode, ast);
        var createRenderNode = o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createText', [
            this._getParentRenderNode(parent),
            o.literal(value),
            this.view.createMethod.resetDebugInfoExpr(this.view.nodes.length, ast)
        ]))
            .toStmt();
        this.view.nodes.push(compileNode);
        this.view.createMethod.addStmt(createRenderNode);
        this._addRootNodeAndProject(compileNode, ngContentIndex, parent);
        return renderNode;
    }
    visitNgContent(ast, parent) {
        // the projected nodes originate from a different view, so we don't
        // have debug information for them...
        this.view.createMethod.resetDebugInfo(null, ast);
        var parentRenderNode = this._getParentRenderNode(parent);
        var nodesExpression = ViewProperties.projectableNodes.key(o.literal(ast.index), new o.ArrayType(o.importType(this.view.genConfig.renderTypes.renderNode)));
        if (parentRenderNode !== o.NULL_EXPR) {
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('projectNodes', [
                parentRenderNode,
                o.importExpr(Identifiers.flattenNestedViewRenderNodes)
                    .callFn([nodesExpression])
            ])
                .toStmt());
        }
        else if (this._isRootNode(parent)) {
            if (this.view.viewType !== ViewType.COMPONENT) {
                // store root nodes only for embedded/host views
                this.view.rootNodesOrAppElements.push(nodesExpression);
            }
        }
        else {
            if (isPresent(parent.component) && isPresent(ast.ngContentIndex)) {
                parent.addContentNode(ast.ngContentIndex, nodesExpression);
            }
        }
        return null;
    }
    visitElement(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var createRenderNodeExpr;
        var debugContextExpr = this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast);
        if (nodeIndex === 0 && this.view.viewType === ViewType.HOST) {
            createRenderNodeExpr = o.THIS_EXPR.callMethod('selectOrCreateHostElement', [o.literal(ast.name), rootSelectorVar, debugContextExpr]);
        }
        else {
            createRenderNodeExpr = ViewProperties.renderer.callMethod('createElement', [this._getParentRenderNode(parent), o.literal(ast.name), debugContextExpr]);
        }
        var fieldName = `_el_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderElement)));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName).set(createRenderNodeExpr).toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var component = directives.find(directive => directive.isComponent);
        var htmlAttrs = _readHtmlAttrs(ast.attrs);
        var attrNameAndValues = _mergeHtmlAndDirectiveAttrs(htmlAttrs, directives);
        for (var i = 0; i < attrNameAndValues.length; i++) {
            var attrName = attrNameAndValues[i][0];
            var attrValue = attrNameAndValues[i][1];
            this.view.createMethod.addStmt(ViewProperties.renderer.callMethod('setElementAttribute', [renderNode, o.literal(attrName), o.literal(attrValue)])
                .toStmt());
        }
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers, ast.hasViewContainer, false, ast.references);
        this.view.nodes.push(compileElement);
        var compViewExpr = null;
        if (isPresent(component)) {
            var nestedComponentIdentifier = new CompileIdentifierMetadata({ name: getViewFactoryName(component, 0) });
            this.targetDependencies.push(new ViewCompileDependency(component, nestedComponentIdentifier));
            compViewExpr = o.variable(`compView_${nodeIndex}`);
            compileElement.setComponentView(compViewExpr);
            this.view.createMethod.addStmt(compViewExpr.set(o.importExpr(nestedComponentIdentifier)
                .callFn([
                ViewProperties.viewUtils,
                compileElement.injector,
                compileElement.appElement
            ]))
                .toDeclStmt());
        }
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        templateVisitAll(this, ast.children, compileElement);
        compileElement.afterChildren(this.view.nodes.length - nodeIndex - 1);
        if (isPresent(compViewExpr)) {
            var codeGenContentNodes;
            if (this.view.component.type.isHost) {
                codeGenContentNodes = ViewProperties.projectableNodes;
            }
            else {
                codeGenContentNodes = o.literalArr(compileElement.contentNodesByNgContentIndex.map(nodes => createFlatArray(nodes)));
            }
            this.view.createMethod.addStmt(compViewExpr.callMethod('create', [compileElement.getComponent(), codeGenContentNodes, o.NULL_EXPR])
                .toStmt());
        }
        return null;
    }
    visitEmbeddedTemplate(ast, parent) {
        var nodeIndex = this.view.nodes.length;
        var fieldName = `_anchor_${nodeIndex}`;
        this.view.fields.push(new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderComment)));
        this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod('createTemplateAnchor', [
            this._getParentRenderNode(parent),
            this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast)
        ]))
            .toStmt());
        var renderNode = o.THIS_EXPR.prop(fieldName);
        var templateVariableBindings = ast.variables.map(varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);
        var directives = ast.directives.map(directiveAst => directiveAst.directive);
        var compileElement = new CompileElement(parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers, ast.hasViewContainer, true, ast.references);
        this.view.nodes.push(compileElement);
        this.nestedViewCount++;
        var embeddedView = new CompileView(this.view.component, this.view.genConfig, this.view.pipeMetas, o.NULL_EXPR, this.view.viewIndex + this.nestedViewCount, compileElement, templateVariableBindings);
        this.nestedViewCount += buildView(embeddedView, ast.children, this.targetDependencies);
        compileElement.beforeChildren();
        this._addRootNodeAndProject(compileElement, ast.ngContentIndex, parent);
        compileElement.afterChildren(0);
        return null;
    }
    visitAttr(ast, ctx) { return null; }
    visitDirective(ast, ctx) { return null; }
    visitEvent(ast, eventTargetAndNames) {
        return null;
    }
    visitReference(ast, ctx) { return null; }
    visitVariable(ast, ctx) { return null; }
    visitDirectiveProperty(ast, context) { return null; }
    visitElementProperty(ast, context) { return null; }
}
function _mergeHtmlAndDirectiveAttrs(declaredHtmlAttrs, directives) {
    var result = {};
    StringMapWrapper.forEach(declaredHtmlAttrs, (value, key) => { result[key] = value; });
    directives.forEach(directiveMeta => {
        StringMapWrapper.forEach(directiveMeta.hostAttributes, (value, name) => {
            var prevValue = result[name];
            result[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
        });
    });
    return mapToKeyValueArray(result);
}
function _readHtmlAttrs(attrs) {
    var htmlAttrs = {};
    attrs.forEach((ast) => { htmlAttrs[ast.name] = ast.value; });
    return htmlAttrs;
}
function mergeAttributeValue(attrName, attrValue1, attrValue2) {
    if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
        return `${attrValue1} ${attrValue2}`;
    }
    else {
        return attrValue2;
    }
}
function mapToKeyValueArray(data) {
    var entryArray = [];
    StringMapWrapper.forEach(data, (value, name) => { entryArray.push([name, value]); });
    // We need to sort to get a defined output order
    // for tests and for caching generated artifacts...
    ListWrapper.sort(entryArray, (entry1, entry2) => StringWrapper.compare(entry1[0], entry2[0]));
    var keyValueArray = [];
    entryArray.forEach((entry) => { keyValueArray.push([entry[0], entry[1]]); });
    return keyValueArray;
}
function createViewTopLevelStmts(view, targetStatements) {
    var nodeDebugInfosVar = o.NULL_EXPR;
    if (view.genConfig.genDebugInfo) {
        nodeDebugInfosVar = o.variable(`nodeDebugInfos_${view.component.type.name}${view.viewIndex}`);
        targetStatements.push(nodeDebugInfosVar
            .set(o.literalArr(view.nodes.map(createStaticNodeDebugInfo), new o.ArrayType(new o.ExternalType(Identifiers.StaticNodeDebugInfo), [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    var renderCompTypeVar = o.variable(`renderType_${view.component.type.name}`);
    if (view.viewIndex === 0) {
        targetStatements.push(renderCompTypeVar.set(o.NULL_EXPR)
            .toDeclStmt(o.importType(Identifiers.RenderComponentType)));
    }
    var viewClass = createViewClass(view, renderCompTypeVar, nodeDebugInfosVar);
    targetStatements.push(viewClass);
    targetStatements.push(createViewFactory(view, viewClass, renderCompTypeVar));
}
function createStaticNodeDebugInfo(node) {
    var compileElement = node instanceof CompileElement ? node : null;
    var providerTokens = [];
    var componentToken = o.NULL_EXPR;
    var varTokenEntries = [];
    if (isPresent(compileElement)) {
        providerTokens = compileElement.getProviderTokens();
        if (isPresent(compileElement.component)) {
            componentToken = createDiTokenExpression(identifierToken(compileElement.component.type));
        }
        StringMapWrapper.forEach(compileElement.referenceTokens, (token, varName) => {
            varTokenEntries.push([varName, isPresent(token) ? createDiTokenExpression(token) : o.NULL_EXPR]);
        });
    }
    return o.importExpr(Identifiers.StaticNodeDebugInfo)
        .instantiate([
        o.literalArr(providerTokens, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])),
        componentToken,
        o.literalMap(varTokenEntries, new o.MapType(o.DYNAMIC_TYPE, [o.TypeModifier.Const]))
    ], o.importType(Identifiers.StaticNodeDebugInfo, null, [o.TypeModifier.Const]));
}
function createViewClass(view, renderCompTypeVar, nodeDebugInfosVar) {
    var viewConstructorArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var superConstructorArgs = [
        o.variable(view.className),
        renderCompTypeVar,
        ViewTypeEnum.fromValue(view.viewType),
        ViewConstructorVars.viewUtils,
        ViewConstructorVars.parentInjector,
        ViewConstructorVars.declarationEl,
        ChangeDetectionStrategyEnum.fromValue(getChangeDetectionMode(view))
    ];
    if (view.genConfig.genDebugInfo) {
        superConstructorArgs.push(nodeDebugInfosVar);
    }
    var viewConstructor = new o.ClassMethod(null, viewConstructorArgs, [o.SUPER_EXPR.callFn(superConstructorArgs).toStmt()]);
    var viewMethods = [
        new o.ClassMethod('createInternal', [new o.FnParam(rootSelectorVar.name, o.STRING_TYPE)], generateCreateMethod(view), o.importType(Identifiers.AppElement)),
        new o.ClassMethod('injectorGetInternal', [
            new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
            // Note: Can't use o.INT_TYPE here as the method in AppView uses number
            new o.FnParam(InjectMethodVars.requestNodeIndex.name, o.NUMBER_TYPE),
            new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ], addReturnValuefNotEmpty(view.injectorGetMethod.finish(), InjectMethodVars.notFoundResult), o.DYNAMIC_TYPE),
        new o.ClassMethod('detectChangesInternal', [new o.FnParam(DetectChangesVars.throwOnChange.name, o.BOOL_TYPE)], generateDetectChangesMethod(view)),
        new o.ClassMethod('dirtyParentQueriesInternal', [], view.dirtyParentQueriesMethod.finish()),
        new o.ClassMethod('destroyInternal', [], view.destroyMethod.finish())
    ].concat(view.eventHandlerMethods);
    var superClass = view.genConfig.genDebugInfo ? Identifiers.DebugAppView : Identifiers.AppView;
    var viewClass = new o.ClassStmt(view.className, o.importExpr(superClass, [getContextType(view)]), view.fields, view.getters, viewConstructor, viewMethods.filter((method) => method.body.length > 0));
    return viewClass;
}
function createViewFactory(view, viewClass, renderCompTypeVar) {
    var viewFactoryArgs = [
        new o.FnParam(ViewConstructorVars.viewUtils.name, o.importType(Identifiers.ViewUtils)),
        new o.FnParam(ViewConstructorVars.parentInjector.name, o.importType(Identifiers.Injector)),
        new o.FnParam(ViewConstructorVars.declarationEl.name, o.importType(Identifiers.AppElement))
    ];
    var initRenderCompTypeStmts = [];
    var templateUrlInfo;
    if (view.component.template.templateUrl == view.component.type.moduleUrl) {
        templateUrlInfo =
            `${view.component.type.moduleUrl} class ${view.component.type.name} - inline template`;
    }
    else {
        templateUrlInfo = view.component.template.templateUrl;
    }
    if (view.viewIndex === 0) {
        initRenderCompTypeStmts = [
            new o.IfStmt(renderCompTypeVar.identical(o.NULL_EXPR), [
                renderCompTypeVar.set(ViewConstructorVars
                    .viewUtils.callMethod('createRenderComponentType', [
                    o.literal(templateUrlInfo),
                    o.literal(view.component
                        .template.ngContentSelectors.length),
                    ViewEncapsulationEnum
                        .fromValue(view.component.template.encapsulation),
                    view.styles
                ]))
                    .toStmt()
            ])
        ];
    }
    return o.fn(viewFactoryArgs, initRenderCompTypeStmts.concat([
        new o.ReturnStatement(o.variable(viewClass.name)
            .instantiate(viewClass.constructorMethod.params.map((param) => o.variable(param.name))))
    ]), o.importType(Identifiers.AppView, [getContextType(view)]))
        .toDeclStmt(view.viewFactory.name, [o.StmtModifier.Final]);
}
function generateCreateMethod(view) {
    var parentRenderNodeExpr = o.NULL_EXPR;
    var parentRenderNodeStmts = [];
    if (view.viewType === ViewType.COMPONENT) {
        parentRenderNodeExpr = ViewProperties.renderer.callMethod('createViewRoot', [o.THIS_EXPR.prop('declarationAppElement').prop('nativeElement')]);
        parentRenderNodeStmts = [
            parentRenderNodeVar.set(parentRenderNodeExpr)
                .toDeclStmt(o.importType(view.genConfig.renderTypes.renderNode), [o.StmtModifier.Final])
        ];
    }
    var resultExpr;
    if (view.viewType === ViewType.HOST) {
        resultExpr = view.nodes[0].appElement;
    }
    else {
        resultExpr = o.NULL_EXPR;
    }
    return parentRenderNodeStmts.concat(view.createMethod.finish())
        .concat([
        o.THIS_EXPR.callMethod('init', [
            createFlatArray(view.rootNodesOrAppElements),
            o.literalArr(view.nodes.map(node => node.renderNode)),
            o.literalArr(view.disposables),
            o.literalArr(view.subscriptions)
        ])
            .toStmt(),
        new o.ReturnStatement(resultExpr)
    ]);
}
function generateDetectChangesMethod(view) {
    var stmts = [];
    if (view.detectChangesInInputsMethod.isEmpty() && view.updateContentQueriesMethod.isEmpty() &&
        view.afterContentLifecycleCallbacksMethod.isEmpty() &&
        view.detectChangesRenderPropertiesMethod.isEmpty() &&
        view.updateViewQueriesMethod.isEmpty() && view.afterViewLifecycleCallbacksMethod.isEmpty()) {
        return stmts;
    }
    ListWrapper.addAll(stmts, view.detectChangesInInputsMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectContentChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterContentStmts = view.updateContentQueriesMethod.finish().concat(view.afterContentLifecycleCallbacksMethod.finish());
    if (afterContentStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterContentStmts));
    }
    ListWrapper.addAll(stmts, view.detectChangesRenderPropertiesMethod.finish());
    stmts.push(o.THIS_EXPR.callMethod('detectViewChildrenChanges', [DetectChangesVars.throwOnChange])
        .toStmt());
    var afterViewStmts = view.updateViewQueriesMethod.finish().concat(view.afterViewLifecycleCallbacksMethod.finish());
    if (afterViewStmts.length > 0) {
        stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterViewStmts));
    }
    var varStmts = [];
    var readVars = o.findReadVarNames(stmts);
    if (SetWrapper.has(readVars, DetectChangesVars.changed.name)) {
        varStmts.push(DetectChangesVars.changed.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.changes.name)) {
        varStmts.push(DetectChangesVars.changes.set(o.NULL_EXPR)
            .toDeclStmt(new o.MapType(o.importType(Identifiers.SimpleChange))));
    }
    if (SetWrapper.has(readVars, DetectChangesVars.valUnwrapper.name)) {
        varStmts.push(DetectChangesVars.valUnwrapper.set(o.importExpr(Identifiers.ValueUnwrapper).instantiate([]))
            .toDeclStmt(null, [o.StmtModifier.Final]));
    }
    return varStmts.concat(stmts);
}
function addReturnValuefNotEmpty(statements, value) {
    if (statements.length > 0) {
        return statements.concat([new o.ReturnStatement(value)]);
    }
    else {
        return statements;
    }
}
function getContextType(view) {
    if (view.viewType === ViewType.COMPONENT) {
        return o.importType(view.component.type);
    }
    return o.DYNAMIC_TYPE;
}
function getChangeDetectionMode(view) {
    var mode;
    if (view.viewType === ViewType.COMPONENT) {
        mode = isDefaultChangeDetectionStrategy(view.component.changeDetection) ?
            ChangeDetectionStrategy.CheckAlways :
            ChangeDetectionStrategy.CheckOnce;
    }
    else {
        mode = ChangeDetectionStrategy.CheckAlways;
    }
    return mode;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19idWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3ZpZXdfY29tcGlsZXIvdmlld19idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsU0FBUyxFQUFXLGFBQWEsRUFBQyxNQUFNLDBCQUEwQjtPQUNuRSxFQUFDLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxVQUFVLEVBQUMsTUFBTSxnQ0FBZ0M7T0FFakYsS0FBSyxDQUFDLE1BQU0sc0JBQXNCO09BQ2xDLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxNQUFNLGdCQUFnQjtPQUNwRCxFQUNMLG1CQUFtQixFQUNuQixnQkFBZ0IsRUFDaEIsaUJBQWlCLEVBQ2pCLFlBQVksRUFDWixxQkFBcUIsRUFDckIsMkJBQTJCLEVBQzNCLGNBQWMsRUFDZixNQUFNLGFBQWE7T0FDYixFQUNMLHVCQUF1QixFQUN2QixnQ0FBZ0MsRUFDakMsTUFBTSxxREFBcUQ7T0FFckQsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxjQUFjLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CO09BRXRELEVBZUwsZ0JBQWdCLEVBR2pCLE1BQU0saUJBQWlCO09BRWpCLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLE1BQU0sUUFBUTtPQUU1RSxFQUFDLFFBQVEsRUFBQyxNQUFNLG9DQUFvQztPQUNwRCxFQUFDLGlCQUFpQixFQUFDLE1BQU0saUNBQWlDO09BRTFELEVBQ0wseUJBQXlCLEVBRzFCLE1BQU0scUJBQXFCO0FBRTVCLE1BQU0scUJBQXFCLEdBQUcsWUFBWSxDQUFDO0FBQzNDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQztBQUMzQixNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7QUFFM0IsSUFBSSxtQkFBbUIsR0FB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LHVCQUF1QixDQUFDLFdBQVcsQ0FBQztJQUM3QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgU3RyaW5nV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXIsIFNldFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCAqIGFzIG8gZnJvbSAnLi4vb3V0cHV0L291dHB1dF9hc3QnO1xuaW1wb3J0IHtJZGVudGlmaWVycywgaWRlbnRpZmllclRva2VufSBmcm9tICcuLi9pZGVudGlmaWVycyc7XG5pbXBvcnQge1xuICBWaWV3Q29uc3RydWN0b3JWYXJzLFxuICBJbmplY3RNZXRob2RWYXJzLFxuICBEZXRlY3RDaGFuZ2VzVmFycyxcbiAgVmlld1R5cGVFbnVtLFxuICBWaWV3RW5jYXBzdWxhdGlvbkVudW0sXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5RW51bSxcbiAgVmlld1Byb3BlcnRpZXNcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIGlzRGVmYXVsdENoYW5nZURldGVjdGlvblN0cmF0ZWd5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5cbmltcG9ydCB7Q29tcGlsZVZpZXd9IGZyb20gJy4vY29tcGlsZV92aWV3JztcbmltcG9ydCB7Q29tcGlsZUVsZW1lbnQsIENvbXBpbGVOb2RlfSBmcm9tICcuL2NvbXBpbGVfZWxlbWVudCc7XG5cbmltcG9ydCB7XG4gIFRlbXBsYXRlQXN0LFxuICBUZW1wbGF0ZUFzdFZpc2l0b3IsXG4gIE5nQ29udGVudEFzdCxcbiAgRW1iZWRkZWRUZW1wbGF0ZUFzdCxcbiAgRWxlbWVudEFzdCxcbiAgUmVmZXJlbmNlQXN0LFxuICBWYXJpYWJsZUFzdCxcbiAgQm91bmRFdmVudEFzdCxcbiAgQm91bmRFbGVtZW50UHJvcGVydHlBc3QsXG4gIEF0dHJBc3QsXG4gIEJvdW5kVGV4dEFzdCxcbiAgVGV4dEFzdCxcbiAgRGlyZWN0aXZlQXN0LFxuICBCb3VuZERpcmVjdGl2ZVByb3BlcnR5QXN0LFxuICB0ZW1wbGF0ZVZpc2l0QWxsLFxuICBQcm9wZXJ0eUJpbmRpbmdUeXBlLFxuICBQcm92aWRlckFzdFxufSBmcm9tICcuLi90ZW1wbGF0ZV9hc3QnO1xuXG5pbXBvcnQge2dldFZpZXdGYWN0b3J5TmFtZSwgY3JlYXRlRmxhdEFycmF5LCBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbn0gZnJvbSAnLi91dGlsJztcblxuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZSc7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuaW1wb3J0IHtcbiAgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSxcbiAgQ29tcGlsZURpcmVjdGl2ZU1ldGFkYXRhLFxuICBDb21waWxlVG9rZW5NZXRhZGF0YVxufSBmcm9tICcuLi9jb21waWxlX21ldGFkYXRhJztcblxuY29uc3QgSU1QTElDSVRfVEVNUExBVEVfVkFSID0gJ1xcJGltcGxpY2l0JztcbmNvbnN0IENMQVNTX0FUVFIgPSAnY2xhc3MnO1xuY29uc3QgU1RZTEVfQVRUUiA9ICdzdHlsZSc7XG5cbnZhciBwYXJlbnRSZW5kZXJOb2RlVmFyID0gby52YXJpYWJsZSgncGFyZW50UmVuZGVyTm9kZScpO1xudmFyIHJvb3RTZWxlY3RvclZhciA9IG8udmFyaWFibGUoJ3Jvb3RTZWxlY3RvcicpO1xuXG5leHBvcnQgY2xhc3MgVmlld0NvbXBpbGVEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXA6IENvbXBpbGVEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIGZhY3RvcnlQbGFjZWhvbGRlcjogQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkVmlldyh2aWV3OiBDb21waWxlVmlldywgdGVtcGxhdGU6IFRlbXBsYXRlQXN0W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldERlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10pOiBudW1iZXIge1xuICB2YXIgYnVpbGRlclZpc2l0b3IgPSBuZXcgVmlld0J1aWxkZXJWaXNpdG9yKHZpZXcsIHRhcmdldERlcGVuZGVuY2llcyk7XG4gIHRlbXBsYXRlVmlzaXRBbGwoYnVpbGRlclZpc2l0b3IsIHRlbXBsYXRlLCB2aWV3LmRlY2xhcmF0aW9uRWxlbWVudC5pc051bGwoKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5kZWNsYXJhdGlvbkVsZW1lbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZGVjbGFyYXRpb25FbGVtZW50LnBhcmVudCk7XG4gIHJldHVybiBidWlsZGVyVmlzaXRvci5uZXN0ZWRWaWV3Q291bnQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmaW5pc2hWaWV3KHZpZXc6IENvbXBpbGVWaWV3LCB0YXJnZXRTdGF0ZW1lbnRzOiBvLlN0YXRlbWVudFtdKSB7XG4gIHZpZXcuYWZ0ZXJOb2RlcygpO1xuICBjcmVhdGVWaWV3VG9wTGV2ZWxTdG10cyh2aWV3LCB0YXJnZXRTdGF0ZW1lbnRzKTtcbiAgdmlldy5ub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBDb21waWxlRWxlbWVudCAmJiBub2RlLmhhc0VtYmVkZGVkVmlldykge1xuICAgICAgZmluaXNoVmlldyhub2RlLmVtYmVkZGVkVmlldywgdGFyZ2V0U3RhdGVtZW50cyk7XG4gICAgfVxuICB9KTtcbn1cblxuY2xhc3MgVmlld0J1aWxkZXJWaXNpdG9yIGltcGxlbWVudHMgVGVtcGxhdGVBc3RWaXNpdG9yIHtcbiAgbmVzdGVkVmlld0NvdW50OiBudW1iZXIgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3OiBDb21waWxlVmlldywgcHVibGljIHRhcmdldERlcGVuZGVuY2llczogVmlld0NvbXBpbGVEZXBlbmRlbmN5W10pIHt9XG5cbiAgcHJpdmF0ZSBfaXNSb290Tm9kZShwYXJlbnQ6IENvbXBpbGVFbGVtZW50KTogYm9vbGVhbiB7IHJldHVybiBwYXJlbnQudmlldyAhPT0gdGhpcy52aWV3OyB9XG5cbiAgcHJpdmF0ZSBfYWRkUm9vdE5vZGVBbmRQcm9qZWN0KG5vZGU6IENvbXBpbGVOb2RlLCBuZ0NvbnRlbnRJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBDb21waWxlRWxlbWVudCkge1xuICAgIHZhciB2Y0FwcEVsID1cbiAgICAgICAgKG5vZGUgaW5zdGFuY2VvZiBDb21waWxlRWxlbWVudCAmJiBub2RlLmhhc1ZpZXdDb250YWluZXIpID8gbm9kZS5hcHBFbGVtZW50IDogbnVsbDtcbiAgICBpZiAodGhpcy5faXNSb290Tm9kZShwYXJlbnQpKSB7XG4gICAgICAvLyBzdG9yZSBhcHBFbGVtZW50IGFzIHJvb3Qgbm9kZSBvbmx5IGZvciBWaWV3Q29udGFpbmVyc1xuICAgICAgaWYgKHRoaXMudmlldy52aWV3VHlwZSAhPT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICAgIHRoaXMudmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLnB1c2goaXNQcmVzZW50KHZjQXBwRWwpID8gdmNBcHBFbCA6IG5vZGUucmVuZGVyTm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQocGFyZW50LmNvbXBvbmVudCkgJiYgaXNQcmVzZW50KG5nQ29udGVudEluZGV4KSkge1xuICAgICAgcGFyZW50LmFkZENvbnRlbnROb2RlKG5nQ29udGVudEluZGV4LCBpc1ByZXNlbnQodmNBcHBFbCkgPyB2Y0FwcEVsIDogbm9kZS5yZW5kZXJOb2RlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBvLkV4cHJlc3Npb24ge1xuICAgIGlmICh0aGlzLl9pc1Jvb3ROb2RlKHBhcmVudCkpIHtcbiAgICAgIGlmICh0aGlzLnZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgICByZXR1cm4gcGFyZW50UmVuZGVyTm9kZVZhcjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHJvb3Qgbm9kZSBvZiBhbiBlbWJlZGRlZC9ob3N0IHZpZXdcbiAgICAgICAgcmV0dXJuIG8uTlVMTF9FWFBSO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaXNQcmVzZW50KHBhcmVudC5jb21wb25lbnQpICYmXG4gICAgICAgICAgICAgICAgICAgICBwYXJlbnQuY29tcG9uZW50LnRlbXBsYXRlLmVuY2Fwc3VsYXRpb24gIT09IFZpZXdFbmNhcHN1bGF0aW9uLk5hdGl2ZSA/XG4gICAgICAgICAgICAgICAgIG8uTlVMTF9FWFBSIDpcbiAgICAgICAgICAgICAgICAgcGFyZW50LnJlbmRlck5vZGU7XG4gICAgfVxuICB9XG5cbiAgdmlzaXRCb3VuZFRleHQoYXN0OiBCb3VuZFRleHRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl92aXNpdFRleHQoYXN0LCAnJywgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICB9XG4gIHZpc2l0VGV4dChhc3Q6IFRleHRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHJldHVybiB0aGlzLl92aXNpdFRleHQoYXN0LCBhc3QudmFsdWUsIGFzdC5uZ0NvbnRlbnRJbmRleCwgcGFyZW50KTtcbiAgfVxuICBwcml2YXRlIF92aXNpdFRleHQoYXN0OiBUZW1wbGF0ZUFzdCwgdmFsdWU6IHN0cmluZywgbmdDb250ZW50SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBvLkV4cHJlc3Npb24ge1xuICAgIHZhciBmaWVsZE5hbWUgPSBgX3RleHRfJHt0aGlzLnZpZXcubm9kZXMubGVuZ3RofWA7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKFxuICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyVGV4dCkpKTtcbiAgICB2YXIgcmVuZGVyTm9kZSA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKTtcbiAgICB2YXIgY29tcGlsZU5vZGUgPSBuZXcgQ29tcGlsZU5vZGUocGFyZW50LCB0aGlzLnZpZXcsIHRoaXMudmlldy5ub2Rlcy5sZW5ndGgsIHJlbmRlck5vZGUsIGFzdCk7XG4gICAgdmFyIGNyZWF0ZVJlbmRlck5vZGUgPVxuICAgICAgICBvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSlcbiAgICAgICAgICAgIC5zZXQoVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAnY3JlYXRlVGV4dCcsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLFxuICAgICAgICAgICAgICAgICAgby5saXRlcmFsKHZhbHVlKSxcbiAgICAgICAgICAgICAgICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QucmVzZXREZWJ1Z0luZm9FeHByKHRoaXMudmlldy5ub2Rlcy5sZW5ndGgsIGFzdClcbiAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgIC50b1N0bXQoKTtcbiAgICB0aGlzLnZpZXcubm9kZXMucHVzaChjb21waWxlTm9kZSk7XG4gICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KGNyZWF0ZVJlbmRlck5vZGUpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlTm9kZSwgbmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gICAgcmV0dXJuIHJlbmRlck5vZGU7XG4gIH1cblxuICB2aXNpdE5nQ29udGVudChhc3Q6IE5nQ29udGVudEFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgLy8gdGhlIHByb2plY3RlZCBub2RlcyBvcmlnaW5hdGUgZnJvbSBhIGRpZmZlcmVudCB2aWV3LCBzbyB3ZSBkb24ndFxuICAgIC8vIGhhdmUgZGVidWcgaW5mb3JtYXRpb24gZm9yIHRoZW0uLi5cbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLnJlc2V0RGVidWdJbmZvKG51bGwsIGFzdCk7XG4gICAgdmFyIHBhcmVudFJlbmRlck5vZGUgPSB0aGlzLl9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudCk7XG4gICAgdmFyIG5vZGVzRXhwcmVzc2lvbiA9IFZpZXdQcm9wZXJ0aWVzLnByb2plY3RhYmxlTm9kZXMua2V5KFxuICAgICAgICBvLmxpdGVyYWwoYXN0LmluZGV4KSxcbiAgICAgICAgbmV3IG8uQXJyYXlUeXBlKG8uaW1wb3J0VHlwZSh0aGlzLnZpZXcuZ2VuQ29uZmlnLnJlbmRlclR5cGVzLnJlbmRlck5vZGUpKSk7XG4gICAgaWYgKHBhcmVudFJlbmRlck5vZGUgIT09IG8uTlVMTF9FWFBSKSB7XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncHJvamVjdE5vZGVzJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRSZW5kZXJOb2RlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgby5pbXBvcnRFeHByKElkZW50aWZpZXJzLmZsYXR0ZW5OZXN0ZWRWaWV3UmVuZGVyTm9kZXMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGxGbihbbm9kZXNFeHByZXNzaW9uXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIH0gZWxzZSBpZiAodGhpcy5faXNSb290Tm9kZShwYXJlbnQpKSB7XG4gICAgICBpZiAodGhpcy52aWV3LnZpZXdUeXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgICAgLy8gc3RvcmUgcm9vdCBub2RlcyBvbmx5IGZvciBlbWJlZGRlZC9ob3N0IHZpZXdzXG4gICAgICAgIHRoaXMudmlldy5yb290Tm9kZXNPckFwcEVsZW1lbnRzLnB1c2gobm9kZXNFeHByZXNzaW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJlbnQuY29tcG9uZW50KSAmJiBpc1ByZXNlbnQoYXN0Lm5nQ29udGVudEluZGV4KSkge1xuICAgICAgICBwYXJlbnQuYWRkQ29udGVudE5vZGUoYXN0Lm5nQ29udGVudEluZGV4LCBub2Rlc0V4cHJlc3Npb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0RWxlbWVudChhc3Q6IEVsZW1lbnRBc3QsIHBhcmVudDogQ29tcGlsZUVsZW1lbnQpOiBhbnkge1xuICAgIHZhciBub2RlSW5kZXggPSB0aGlzLnZpZXcubm9kZXMubGVuZ3RoO1xuICAgIHZhciBjcmVhdGVSZW5kZXJOb2RlRXhwcjtcbiAgICB2YXIgZGVidWdDb250ZXh0RXhwciA9IHRoaXMudmlldy5jcmVhdGVNZXRob2QucmVzZXREZWJ1Z0luZm9FeHByKG5vZGVJbmRleCwgYXN0KTtcbiAgICBpZiAobm9kZUluZGV4ID09PSAwICYmIHRoaXMudmlldy52aWV3VHlwZSA9PT0gVmlld1R5cGUuSE9TVCkge1xuICAgICAgY3JlYXRlUmVuZGVyTm9kZUV4cHIgPSBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKFxuICAgICAgICAgICdzZWxlY3RPckNyZWF0ZUhvc3RFbGVtZW50JywgW28ubGl0ZXJhbChhc3QubmFtZSksIHJvb3RTZWxlY3RvclZhciwgZGVidWdDb250ZXh0RXhwcl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjcmVhdGVSZW5kZXJOb2RlRXhwciA9IFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgJ2NyZWF0ZUVsZW1lbnQnLFxuICAgICAgICAgIFt0aGlzLl9nZXRQYXJlbnRSZW5kZXJOb2RlKHBhcmVudCksIG8ubGl0ZXJhbChhc3QubmFtZSksIGRlYnVnQ29udGV4dEV4cHJdKTtcbiAgICB9XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfZWxfJHtub2RlSW5kZXh9YDtcbiAgICB0aGlzLnZpZXcuZmllbGRzLnB1c2goXG4gICAgICAgIG5ldyBvLkNsYXNzRmllbGQoZmllbGROYW1lLCBvLmltcG9ydFR5cGUodGhpcy52aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJFbGVtZW50KSkpO1xuICAgIHRoaXMudmlldy5jcmVhdGVNZXRob2QuYWRkU3RtdChvLlRISVNfRVhQUi5wcm9wKGZpZWxkTmFtZSkuc2V0KGNyZWF0ZVJlbmRlck5vZGVFeHByKS50b1N0bXQoKSk7XG5cbiAgICB2YXIgcmVuZGVyTm9kZSA9IG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKTtcblxuICAgIHZhciBkaXJlY3RpdmVzID0gYXN0LmRpcmVjdGl2ZXMubWFwKGRpcmVjdGl2ZUFzdCA9PiBkaXJlY3RpdmVBc3QuZGlyZWN0aXZlKTtcbiAgICB2YXIgY29tcG9uZW50ID0gZGlyZWN0aXZlcy5maW5kKGRpcmVjdGl2ZSA9PiBkaXJlY3RpdmUuaXNDb21wb25lbnQpO1xuICAgIHZhciBodG1sQXR0cnMgPSBfcmVhZEh0bWxBdHRycyhhc3QuYXR0cnMpO1xuICAgIHZhciBhdHRyTmFtZUFuZFZhbHVlcyA9IF9tZXJnZUh0bWxBbmREaXJlY3RpdmVBdHRycyhodG1sQXR0cnMsIGRpcmVjdGl2ZXMpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXR0ck5hbWVBbmRWYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhdHRyTmFtZSA9IGF0dHJOYW1lQW5kVmFsdWVzW2ldWzBdO1xuICAgICAgdmFyIGF0dHJWYWx1ZSA9IGF0dHJOYW1lQW5kVmFsdWVzW2ldWzFdO1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KFxuICAgICAgICAgIFZpZXdQcm9wZXJ0aWVzLnJlbmRlcmVyLmNhbGxNZXRob2QoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NldEVsZW1lbnRBdHRyaWJ1dGUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtyZW5kZXJOb2RlLCBvLmxpdGVyYWwoYXR0ck5hbWUpLCBvLmxpdGVyYWwoYXR0clZhbHVlKV0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICAgIHZhciBjb21waWxlRWxlbWVudCA9XG4gICAgICAgIG5ldyBDb21waWxlRWxlbWVudChwYXJlbnQsIHRoaXMudmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBhc3QsIGNvbXBvbmVudCwgZGlyZWN0aXZlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzdC5wcm92aWRlcnMsIGFzdC5oYXNWaWV3Q29udGFpbmVyLCBmYWxzZSwgYXN0LnJlZmVyZW5jZXMpO1xuICAgIHRoaXMudmlldy5ub2Rlcy5wdXNoKGNvbXBpbGVFbGVtZW50KTtcbiAgICB2YXIgY29tcFZpZXdFeHByOiBvLlJlYWRWYXJFeHByID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudCkpIHtcbiAgICAgIHZhciBuZXN0ZWRDb21wb25lbnRJZGVudGlmaWVyID1cbiAgICAgICAgICBuZXcgQ29tcGlsZUlkZW50aWZpZXJNZXRhZGF0YSh7bmFtZTogZ2V0Vmlld0ZhY3RvcnlOYW1lKGNvbXBvbmVudCwgMCl9KTtcbiAgICAgIHRoaXMudGFyZ2V0RGVwZW5kZW5jaWVzLnB1c2gobmV3IFZpZXdDb21waWxlRGVwZW5kZW5jeShjb21wb25lbnQsIG5lc3RlZENvbXBvbmVudElkZW50aWZpZXIpKTtcbiAgICAgIGNvbXBWaWV3RXhwciA9IG8udmFyaWFibGUoYGNvbXBWaWV3XyR7bm9kZUluZGV4fWApO1xuICAgICAgY29tcGlsZUVsZW1lbnQuc2V0Q29tcG9uZW50Vmlldyhjb21wVmlld0V4cHIpO1xuICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5hZGRTdG10KGNvbXBWaWV3RXhwci5zZXQoby5pbXBvcnRFeHByKG5lc3RlZENvbXBvbmVudElkZW50aWZpZXIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGxGbihbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBWaWV3UHJvcGVydGllcy52aWV3VXRpbHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21waWxlRWxlbWVudC5pbmplY3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBpbGVFbGVtZW50LmFwcEVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQoKSk7XG4gICAgfVxuICAgIGNvbXBpbGVFbGVtZW50LmJlZm9yZUNoaWxkcmVuKCk7XG4gICAgdGhpcy5fYWRkUm9vdE5vZGVBbmRQcm9qZWN0KGNvbXBpbGVFbGVtZW50LCBhc3QubmdDb250ZW50SW5kZXgsIHBhcmVudCk7XG4gICAgdGVtcGxhdGVWaXNpdEFsbCh0aGlzLCBhc3QuY2hpbGRyZW4sIGNvbXBpbGVFbGVtZW50KTtcbiAgICBjb21waWxlRWxlbWVudC5hZnRlckNoaWxkcmVuKHRoaXMudmlldy5ub2Rlcy5sZW5ndGggLSBub2RlSW5kZXggLSAxKTtcblxuICAgIGlmIChpc1ByZXNlbnQoY29tcFZpZXdFeHByKSkge1xuICAgICAgdmFyIGNvZGVHZW5Db250ZW50Tm9kZXM7XG4gICAgICBpZiAodGhpcy52aWV3LmNvbXBvbmVudC50eXBlLmlzSG9zdCkge1xuICAgICAgICBjb2RlR2VuQ29udGVudE5vZGVzID0gVmlld1Byb3BlcnRpZXMucHJvamVjdGFibGVOb2RlcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvZGVHZW5Db250ZW50Tm9kZXMgPSBvLmxpdGVyYWxBcnIoXG4gICAgICAgICAgICBjb21waWxlRWxlbWVudC5jb250ZW50Tm9kZXNCeU5nQ29udGVudEluZGV4Lm1hcChub2RlcyA9PiBjcmVhdGVGbGF0QXJyYXkobm9kZXMpKSk7XG4gICAgICB9XG4gICAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgICAgY29tcFZpZXdFeHByLmNhbGxNZXRob2QoJ2NyZWF0ZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2NvbXBpbGVFbGVtZW50LmdldENvbXBvbmVudCgpLCBjb2RlR2VuQ29udGVudE5vZGVzLCBvLk5VTExfRVhQUl0pXG4gICAgICAgICAgICAgIC50b1N0bXQoKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmlzaXRFbWJlZGRlZFRlbXBsYXRlKGFzdDogRW1iZWRkZWRUZW1wbGF0ZUFzdCwgcGFyZW50OiBDb21waWxlRWxlbWVudCk6IGFueSB7XG4gICAgdmFyIG5vZGVJbmRleCA9IHRoaXMudmlldy5ub2Rlcy5sZW5ndGg7XG4gICAgdmFyIGZpZWxkTmFtZSA9IGBfYW5jaG9yXyR7bm9kZUluZGV4fWA7XG4gICAgdGhpcy52aWV3LmZpZWxkcy5wdXNoKFxuICAgICAgICBuZXcgby5DbGFzc0ZpZWxkKGZpZWxkTmFtZSwgby5pbXBvcnRUeXBlKHRoaXMudmlldy5nZW5Db25maWcucmVuZGVyVHlwZXMucmVuZGVyQ29tbWVudCkpKTtcbiAgICB0aGlzLnZpZXcuY3JlYXRlTWV0aG9kLmFkZFN0bXQoXG4gICAgICAgIG8uVEhJU19FWFBSLnByb3AoZmllbGROYW1lKVxuICAgICAgICAgICAgLnNldChWaWV3UHJvcGVydGllcy5yZW5kZXJlci5jYWxsTWV0aG9kKFxuICAgICAgICAgICAgICAgICdjcmVhdGVUZW1wbGF0ZUFuY2hvcicsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgdGhpcy5fZ2V0UGFyZW50UmVuZGVyTm9kZShwYXJlbnQpLFxuICAgICAgICAgICAgICAgICAgdGhpcy52aWV3LmNyZWF0ZU1ldGhvZC5yZXNldERlYnVnSW5mb0V4cHIobm9kZUluZGV4LCBhc3QpXG4gICAgICAgICAgICAgICAgXSkpXG4gICAgICAgICAgICAudG9TdG10KCkpO1xuICAgIHZhciByZW5kZXJOb2RlID0gby5USElTX0VYUFIucHJvcChmaWVsZE5hbWUpO1xuXG4gICAgdmFyIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncyA9IGFzdC52YXJpYWJsZXMubWFwKFxuICAgICAgICB2YXJBc3QgPT4gW3ZhckFzdC52YWx1ZS5sZW5ndGggPiAwID8gdmFyQXN0LnZhbHVlIDogSU1QTElDSVRfVEVNUExBVEVfVkFSLCB2YXJBc3QubmFtZV0pO1xuXG4gICAgdmFyIGRpcmVjdGl2ZXMgPSBhc3QuZGlyZWN0aXZlcy5tYXAoZGlyZWN0aXZlQXN0ID0+IGRpcmVjdGl2ZUFzdC5kaXJlY3RpdmUpO1xuICAgIHZhciBjb21waWxlRWxlbWVudCA9XG4gICAgICAgIG5ldyBDb21waWxlRWxlbWVudChwYXJlbnQsIHRoaXMudmlldywgbm9kZUluZGV4LCByZW5kZXJOb2RlLCBhc3QsIG51bGwsIGRpcmVjdGl2ZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBhc3QucHJvdmlkZXJzLCBhc3QuaGFzVmlld0NvbnRhaW5lciwgdHJ1ZSwgYXN0LnJlZmVyZW5jZXMpO1xuICAgIHRoaXMudmlldy5ub2Rlcy5wdXNoKGNvbXBpbGVFbGVtZW50KTtcblxuICAgIHRoaXMubmVzdGVkVmlld0NvdW50Kys7XG4gICAgdmFyIGVtYmVkZGVkVmlldyA9IG5ldyBDb21waWxlVmlldyhcbiAgICAgICAgdGhpcy52aWV3LmNvbXBvbmVudCwgdGhpcy52aWV3LmdlbkNvbmZpZywgdGhpcy52aWV3LnBpcGVNZXRhcywgby5OVUxMX0VYUFIsXG4gICAgICAgIHRoaXMudmlldy52aWV3SW5kZXggKyB0aGlzLm5lc3RlZFZpZXdDb3VudCwgY29tcGlsZUVsZW1lbnQsIHRlbXBsYXRlVmFyaWFibGVCaW5kaW5ncyk7XG4gICAgdGhpcy5uZXN0ZWRWaWV3Q291bnQgKz0gYnVpbGRWaWV3KGVtYmVkZGVkVmlldywgYXN0LmNoaWxkcmVuLCB0aGlzLnRhcmdldERlcGVuZGVuY2llcyk7XG5cbiAgICBjb21waWxlRWxlbWVudC5iZWZvcmVDaGlsZHJlbigpO1xuICAgIHRoaXMuX2FkZFJvb3ROb2RlQW5kUHJvamVjdChjb21waWxlRWxlbWVudCwgYXN0Lm5nQ29udGVudEluZGV4LCBwYXJlbnQpO1xuICAgIGNvbXBpbGVFbGVtZW50LmFmdGVyQ2hpbGRyZW4oMCk7XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0QXR0cihhc3Q6IEF0dHJBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXREaXJlY3RpdmUoYXN0OiBEaXJlY3RpdmVBc3QsIGN0eDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFdmVudChhc3Q6IEJvdW5kRXZlbnRBc3QsIGV2ZW50VGFyZ2V0QW5kTmFtZXM6IE1hcDxzdHJpbmcsIEJvdW5kRXZlbnRBc3Q+KTogYW55IHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHZpc2l0UmVmZXJlbmNlKGFzdDogUmVmZXJlbmNlQXN0LCBjdHg6IGFueSk6IGFueSB7IHJldHVybiBudWxsOyB9XG4gIHZpc2l0VmFyaWFibGUoYXN0OiBWYXJpYWJsZUFzdCwgY3R4OiBhbnkpOiBhbnkgeyByZXR1cm4gbnVsbDsgfVxuICB2aXNpdERpcmVjdGl2ZVByb3BlcnR5KGFzdDogQm91bmREaXJlY3RpdmVQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbiAgdmlzaXRFbGVtZW50UHJvcGVydHkoYXN0OiBCb3VuZEVsZW1lbnRQcm9wZXJ0eUFzdCwgY29udGV4dDogYW55KTogYW55IHsgcmV0dXJuIG51bGw7IH1cbn1cblxuZnVuY3Rpb24gX21lcmdlSHRtbEFuZERpcmVjdGl2ZUF0dHJzKGRlY2xhcmVkSHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzOiBDb21waWxlRGlyZWN0aXZlTWV0YWRhdGFbXSk6IHN0cmluZ1tdW10ge1xuICB2YXIgcmVzdWx0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGVjbGFyZWRIdG1sQXR0cnMsICh2YWx1ZSwga2V5KSA9PiB7IHJlc3VsdFtrZXldID0gdmFsdWU7IH0pO1xuICBkaXJlY3RpdmVzLmZvckVhY2goZGlyZWN0aXZlTWV0YSA9PiB7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGRpcmVjdGl2ZU1ldGEuaG9zdEF0dHJpYnV0ZXMsICh2YWx1ZSwgbmFtZSkgPT4ge1xuICAgICAgdmFyIHByZXZWYWx1ZSA9IHJlc3VsdFtuYW1lXTtcbiAgICAgIHJlc3VsdFtuYW1lXSA9IGlzUHJlc2VudChwcmV2VmFsdWUpID8gbWVyZ2VBdHRyaWJ1dGVWYWx1ZShuYW1lLCBwcmV2VmFsdWUsIHZhbHVlKSA6IHZhbHVlO1xuICAgIH0pO1xuICB9KTtcbiAgcmV0dXJuIG1hcFRvS2V5VmFsdWVBcnJheShyZXN1bHQpO1xufVxuXG5mdW5jdGlvbiBfcmVhZEh0bWxBdHRycyhhdHRyczogQXR0ckFzdFtdKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICB2YXIgaHRtbEF0dHJzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBhdHRycy5mb3JFYWNoKChhc3QpID0+IHsgaHRtbEF0dHJzW2FzdC5uYW1lXSA9IGFzdC52YWx1ZTsgfSk7XG4gIHJldHVybiBodG1sQXR0cnM7XG59XG5cbmZ1bmN0aW9uIG1lcmdlQXR0cmlidXRlVmFsdWUoYXR0ck5hbWU6IHN0cmluZywgYXR0clZhbHVlMTogc3RyaW5nLCBhdHRyVmFsdWUyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYXR0ck5hbWUgPT0gQ0xBU1NfQVRUUiB8fCBhdHRyTmFtZSA9PSBTVFlMRV9BVFRSKSB7XG4gICAgcmV0dXJuIGAke2F0dHJWYWx1ZTF9ICR7YXR0clZhbHVlMn1gO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBhdHRyVmFsdWUyO1xuICB9XG59XG5cbmZ1bmN0aW9uIG1hcFRvS2V5VmFsdWVBcnJheShkYXRhOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHN0cmluZ1tdW10ge1xuICB2YXIgZW50cnlBcnJheSA9IFtdO1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goZGF0YSwgKHZhbHVlLCBuYW1lKSA9PiB7IGVudHJ5QXJyYXkucHVzaChbbmFtZSwgdmFsdWVdKTsgfSk7XG4gIC8vIFdlIG5lZWQgdG8gc29ydCB0byBnZXQgYSBkZWZpbmVkIG91dHB1dCBvcmRlclxuICAvLyBmb3IgdGVzdHMgYW5kIGZvciBjYWNoaW5nIGdlbmVyYXRlZCBhcnRpZmFjdHMuLi5cbiAgTGlzdFdyYXBwZXIuc29ydChlbnRyeUFycmF5LCAoZW50cnkxLCBlbnRyeTIpID0+IFN0cmluZ1dyYXBwZXIuY29tcGFyZShlbnRyeTFbMF0sIGVudHJ5MlswXSkpO1xuICB2YXIga2V5VmFsdWVBcnJheSA9IFtdO1xuICBlbnRyeUFycmF5LmZvckVhY2goKGVudHJ5KSA9PiB7IGtleVZhbHVlQXJyYXkucHVzaChbZW50cnlbMF0sIGVudHJ5WzFdXSk7IH0pO1xuICByZXR1cm4ga2V5VmFsdWVBcnJheTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld1RvcExldmVsU3RtdHModmlldzogQ29tcGlsZVZpZXcsIHRhcmdldFN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10pIHtcbiAgdmFyIG5vZGVEZWJ1Z0luZm9zVmFyOiBvLkV4cHJlc3Npb24gPSBvLk5VTExfRVhQUjtcbiAgaWYgKHZpZXcuZ2VuQ29uZmlnLmdlbkRlYnVnSW5mbykge1xuICAgIG5vZGVEZWJ1Z0luZm9zVmFyID0gby52YXJpYWJsZShgbm9kZURlYnVnSW5mb3NfJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9JHt2aWV3LnZpZXdJbmRleH1gKTtcbiAgICB0YXJnZXRTdGF0ZW1lbnRzLnB1c2goXG4gICAgICAgICg8by5SZWFkVmFyRXhwcj5ub2RlRGVidWdJbmZvc1ZhcilcbiAgICAgICAgICAgIC5zZXQoby5saXRlcmFsQXJyKHZpZXcubm9kZXMubWFwKGNyZWF0ZVN0YXRpY05vZGVEZWJ1Z0luZm8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IG8uQXJyYXlUeXBlKG5ldyBvLkV4dGVybmFsVHlwZShJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH1cblxuXG4gIHZhciByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwciA9IG8udmFyaWFibGUoYHJlbmRlclR5cGVfJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9YCk7XG4gIGlmICh2aWV3LnZpZXdJbmRleCA9PT0gMCkge1xuICAgIHRhcmdldFN0YXRlbWVudHMucHVzaChyZW5kZXJDb21wVHlwZVZhci5zZXQoby5OVUxMX0VYUFIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudG9EZWNsU3RtdChvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuUmVuZGVyQ29tcG9uZW50VHlwZSkpKTtcbiAgfVxuXG4gIHZhciB2aWV3Q2xhc3MgPSBjcmVhdGVWaWV3Q2xhc3ModmlldywgcmVuZGVyQ29tcFR5cGVWYXIsIG5vZGVEZWJ1Z0luZm9zVmFyKTtcbiAgdGFyZ2V0U3RhdGVtZW50cy5wdXNoKHZpZXdDbGFzcyk7XG4gIHRhcmdldFN0YXRlbWVudHMucHVzaChjcmVhdGVWaWV3RmFjdG9yeSh2aWV3LCB2aWV3Q2xhc3MsIHJlbmRlckNvbXBUeXBlVmFyKSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0YXRpY05vZGVEZWJ1Z0luZm8obm9kZTogQ29tcGlsZU5vZGUpOiBvLkV4cHJlc3Npb24ge1xuICB2YXIgY29tcGlsZUVsZW1lbnQgPSBub2RlIGluc3RhbmNlb2YgQ29tcGlsZUVsZW1lbnQgPyBub2RlIDogbnVsbDtcbiAgdmFyIHByb3ZpZGVyVG9rZW5zOiBvLkV4cHJlc3Npb25bXSA9IFtdO1xuICB2YXIgY29tcG9uZW50VG9rZW46IG8uRXhwcmVzc2lvbiA9IG8uTlVMTF9FWFBSO1xuICB2YXIgdmFyVG9rZW5FbnRyaWVzID0gW107XG4gIGlmIChpc1ByZXNlbnQoY29tcGlsZUVsZW1lbnQpKSB7XG4gICAgcHJvdmlkZXJUb2tlbnMgPSBjb21waWxlRWxlbWVudC5nZXRQcm92aWRlclRva2VucygpO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcGlsZUVsZW1lbnQuY29tcG9uZW50KSkge1xuICAgICAgY29tcG9uZW50VG9rZW4gPSBjcmVhdGVEaVRva2VuRXhwcmVzc2lvbihpZGVudGlmaWVyVG9rZW4oY29tcGlsZUVsZW1lbnQuY29tcG9uZW50LnR5cGUpKTtcbiAgICB9XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKGNvbXBpbGVFbGVtZW50LnJlZmVyZW5jZVRva2VucywgKHRva2VuLCB2YXJOYW1lKSA9PiB7XG4gICAgICB2YXJUb2tlbkVudHJpZXMucHVzaChcbiAgICAgICAgICBbdmFyTmFtZSwgaXNQcmVzZW50KHRva2VuKSA/IGNyZWF0ZURpVG9rZW5FeHByZXNzaW9uKHRva2VuKSA6IG8uTlVMTF9FWFBSXSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG8uaW1wb3J0RXhwcihJZGVudGlmaWVycy5TdGF0aWNOb2RlRGVidWdJbmZvKVxuICAgICAgLmluc3RhbnRpYXRlKFxuICAgICAgICAgIFtcbiAgICAgICAgICAgIG8ubGl0ZXJhbEFycihwcm92aWRlclRva2VucywgbmV3IG8uQXJyYXlUeXBlKG8uRFlOQU1JQ19UWVBFLCBbby5UeXBlTW9kaWZpZXIuQ29uc3RdKSksXG4gICAgICAgICAgICBjb21wb25lbnRUb2tlbixcbiAgICAgICAgICAgIG8ubGl0ZXJhbE1hcCh2YXJUb2tlbkVudHJpZXMsIG5ldyBvLk1hcFR5cGUoby5EWU5BTUlDX1RZUEUsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlN0YXRpY05vZGVEZWJ1Z0luZm8sIG51bGwsIFtvLlR5cGVNb2RpZmllci5Db25zdF0pKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVmlld0NsYXNzKHZpZXc6IENvbXBpbGVWaWV3LCByZW5kZXJDb21wVHlwZVZhcjogby5SZWFkVmFyRXhwcixcbiAgICAgICAgICAgICAgICAgICAgICAgICBub2RlRGVidWdJbmZvc1Zhcjogby5FeHByZXNzaW9uKTogby5DbGFzc1N0bXQge1xuICB2YXIgdmlld0NvbnN0cnVjdG9yQXJncyA9IFtcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMudmlld1V0aWxzLm5hbWUsIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5WaWV3VXRpbHMpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMucGFyZW50SW5qZWN0b3IubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkluamVjdG9yKSksXG4gICAgbmV3IG8uRm5QYXJhbShWaWV3Q29uc3RydWN0b3JWYXJzLmRlY2xhcmF0aW9uRWwubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLkFwcEVsZW1lbnQpKVxuICBdO1xuICB2YXIgc3VwZXJDb25zdHJ1Y3RvckFyZ3MgPSBbXG4gICAgby52YXJpYWJsZSh2aWV3LmNsYXNzTmFtZSksXG4gICAgcmVuZGVyQ29tcFR5cGVWYXIsXG4gICAgVmlld1R5cGVFbnVtLmZyb21WYWx1ZSh2aWV3LnZpZXdUeXBlKSxcbiAgICBWaWV3Q29uc3RydWN0b3JWYXJzLnZpZXdVdGlscyxcbiAgICBWaWV3Q29uc3RydWN0b3JWYXJzLnBhcmVudEluamVjdG9yLFxuICAgIFZpZXdDb25zdHJ1Y3RvclZhcnMuZGVjbGFyYXRpb25FbCxcbiAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneUVudW0uZnJvbVZhbHVlKGdldENoYW5nZURldGVjdGlvbk1vZGUodmlldykpXG4gIF07XG4gIGlmICh2aWV3LmdlbkNvbmZpZy5nZW5EZWJ1Z0luZm8pIHtcbiAgICBzdXBlckNvbnN0cnVjdG9yQXJncy5wdXNoKG5vZGVEZWJ1Z0luZm9zVmFyKTtcbiAgfVxuICB2YXIgdmlld0NvbnN0cnVjdG9yID0gbmV3IG8uQ2xhc3NNZXRob2QobnVsbCwgdmlld0NvbnN0cnVjdG9yQXJncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtvLlNVUEVSX0VYUFIuY2FsbEZuKHN1cGVyQ29uc3RydWN0b3JBcmdzKS50b1N0bXQoKV0pO1xuXG4gIHZhciB2aWV3TWV0aG9kcyA9IFtcbiAgICBuZXcgby5DbGFzc01ldGhvZCgnY3JlYXRlSW50ZXJuYWwnLCBbbmV3IG8uRm5QYXJhbShyb290U2VsZWN0b3JWYXIubmFtZSwgby5TVFJJTkdfVFlQRSldLFxuICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlQ3JlYXRlTWV0aG9kKHZpZXcpLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwRWxlbWVudCkpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKFxuICAgICAgICAnaW5qZWN0b3JHZXRJbnRlcm5hbCcsXG4gICAgICAgIFtcbiAgICAgICAgICBuZXcgby5GblBhcmFtKEluamVjdE1ldGhvZFZhcnMudG9rZW4ubmFtZSwgby5EWU5BTUlDX1RZUEUpLFxuICAgICAgICAgIC8vIE5vdGU6IENhbid0IHVzZSBvLklOVF9UWVBFIGhlcmUgYXMgdGhlIG1ldGhvZCBpbiBBcHBWaWV3IHVzZXMgbnVtYmVyXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShJbmplY3RNZXRob2RWYXJzLnJlcXVlc3ROb2RlSW5kZXgubmFtZSwgby5OVU1CRVJfVFlQRSksXG4gICAgICAgICAgbmV3IG8uRm5QYXJhbShJbmplY3RNZXRob2RWYXJzLm5vdEZvdW5kUmVzdWx0Lm5hbWUsIG8uRFlOQU1JQ19UWVBFKVxuICAgICAgICBdLFxuICAgICAgICBhZGRSZXR1cm5WYWx1ZWZOb3RFbXB0eSh2aWV3LmluamVjdG9yR2V0TWV0aG9kLmZpbmlzaCgpLCBJbmplY3RNZXRob2RWYXJzLm5vdEZvdW5kUmVzdWx0KSxcbiAgICAgICAgby5EWU5BTUlDX1RZUEUpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdkZXRlY3RDaGFuZ2VzSW50ZXJuYWwnLFxuICAgICAgICAgICAgICAgICAgICAgIFtuZXcgby5GblBhcmFtKERldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UubmFtZSwgby5CT09MX1RZUEUpXSxcbiAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZURldGVjdENoYW5nZXNNZXRob2QodmlldykpLFxuICAgIG5ldyBvLkNsYXNzTWV0aG9kKCdkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCcsIFtdLCB2aWV3LmRpcnR5UGFyZW50UXVlcmllc01ldGhvZC5maW5pc2goKSksXG4gICAgbmV3IG8uQ2xhc3NNZXRob2QoJ2Rlc3Ryb3lJbnRlcm5hbCcsIFtdLCB2aWV3LmRlc3Ryb3lNZXRob2QuZmluaXNoKCkpXG4gIF0uY29uY2F0KHZpZXcuZXZlbnRIYW5kbGVyTWV0aG9kcyk7XG4gIHZhciBzdXBlckNsYXNzID0gdmlldy5nZW5Db25maWcuZ2VuRGVidWdJbmZvID8gSWRlbnRpZmllcnMuRGVidWdBcHBWaWV3IDogSWRlbnRpZmllcnMuQXBwVmlldztcbiAgdmFyIHZpZXdDbGFzcyA9IG5ldyBvLkNsYXNzU3RtdCh2aWV3LmNsYXNzTmFtZSwgby5pbXBvcnRFeHByKHN1cGVyQ2xhc3MsIFtnZXRDb250ZXh0VHlwZSh2aWV3KV0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZmllbGRzLCB2aWV3LmdldHRlcnMsIHZpZXdDb25zdHJ1Y3RvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3TWV0aG9kcy5maWx0ZXIoKG1ldGhvZCkgPT4gbWV0aG9kLmJvZHkubGVuZ3RoID4gMCkpO1xuICByZXR1cm4gdmlld0NsYXNzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWaWV3RmFjdG9yeSh2aWV3OiBDb21waWxlVmlldywgdmlld0NsYXNzOiBvLkNsYXNzU3RtdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBUeXBlVmFyOiBvLlJlYWRWYXJFeHByKTogby5TdGF0ZW1lbnQge1xuICB2YXIgdmlld0ZhY3RvcnlBcmdzID0gW1xuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy52aWV3VXRpbHMubmFtZSwgby5pbXBvcnRUeXBlKElkZW50aWZpZXJzLlZpZXdVdGlscykpLFxuICAgIG5ldyBvLkZuUGFyYW0oVmlld0NvbnN0cnVjdG9yVmFycy5wYXJlbnRJbmplY3Rvci5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuSW5qZWN0b3IpKSxcbiAgICBuZXcgby5GblBhcmFtKFZpZXdDb25zdHJ1Y3RvclZhcnMuZGVjbGFyYXRpb25FbC5uYW1lLCBvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuQXBwRWxlbWVudCkpXG4gIF07XG4gIHZhciBpbml0UmVuZGVyQ29tcFR5cGVTdG10cyA9IFtdO1xuICB2YXIgdGVtcGxhdGVVcmxJbmZvO1xuICBpZiAodmlldy5jb21wb25lbnQudGVtcGxhdGUudGVtcGxhdGVVcmwgPT0gdmlldy5jb21wb25lbnQudHlwZS5tb2R1bGVVcmwpIHtcbiAgICB0ZW1wbGF0ZVVybEluZm8gPVxuICAgICAgICBgJHt2aWV3LmNvbXBvbmVudC50eXBlLm1vZHVsZVVybH0gY2xhc3MgJHt2aWV3LmNvbXBvbmVudC50eXBlLm5hbWV9IC0gaW5saW5lIHRlbXBsYXRlYDtcbiAgfSBlbHNlIHtcbiAgICB0ZW1wbGF0ZVVybEluZm8gPSB2aWV3LmNvbXBvbmVudC50ZW1wbGF0ZS50ZW1wbGF0ZVVybDtcbiAgfVxuICBpZiAodmlldy52aWV3SW5kZXggPT09IDApIHtcbiAgICBpbml0UmVuZGVyQ29tcFR5cGVTdG10cyA9IFtcbiAgICAgIG5ldyBvLklmU3RtdChyZW5kZXJDb21wVHlwZVZhci5pZGVudGljYWwoby5OVUxMX0VYUFIpLFxuICAgICAgICAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAgICAgIHJlbmRlckNvbXBUeXBlVmFyLnNldChWaWV3Q29uc3RydWN0b3JWYXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52aWV3VXRpbHMuY2FsbE1ldGhvZCgnY3JlYXRlUmVuZGVyQ29tcG9uZW50VHlwZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbCh0ZW1wbGF0ZVVybEluZm8pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWwodmlldy5jb21wb25lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGVtcGxhdGUubmdDb250ZW50U2VsZWN0b3JzLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFZpZXdFbmNhcHN1bGF0aW9uRW51bVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZyb21WYWx1ZSh2aWV3LmNvbXBvbmVudC50ZW1wbGF0ZS5lbmNhcHN1bGF0aW9uKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zdHlsZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC50b1N0bXQoKVxuICAgICAgICAgICAgICAgICAgIF0pXG4gICAgXTtcbiAgfVxuICByZXR1cm4gby5mbih2aWV3RmFjdG9yeUFyZ3MsIGluaXRSZW5kZXJDb21wVHlwZVN0bXRzLmNvbmNhdChbXG4gICAgICAgICAgICBuZXcgby5SZXR1cm5TdGF0ZW1lbnQoby52YXJpYWJsZSh2aWV3Q2xhc3MubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmluc3RhbnRpYXRlKHZpZXdDbGFzcy5jb25zdHJ1Y3Rvck1ldGhvZC5wYXJhbXMubWFwKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKHBhcmFtKSA9PiBvLnZhcmlhYmxlKHBhcmFtLm5hbWUpKSkpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG8uaW1wb3J0VHlwZShJZGVudGlmaWVycy5BcHBWaWV3LCBbZ2V0Q29udGV4dFR5cGUodmlldyldKSlcbiAgICAgIC50b0RlY2xTdG10KHZpZXcudmlld0ZhY3RvcnkubmFtZSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQ3JlYXRlTWV0aG9kKHZpZXc6IENvbXBpbGVWaWV3KTogby5TdGF0ZW1lbnRbXSB7XG4gIHZhciBwYXJlbnRSZW5kZXJOb2RlRXhwcjogby5FeHByZXNzaW9uID0gby5OVUxMX0VYUFI7XG4gIHZhciBwYXJlbnRSZW5kZXJOb2RlU3RtdHMgPSBbXTtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIHBhcmVudFJlbmRlck5vZGVFeHByID0gVmlld1Byb3BlcnRpZXMucmVuZGVyZXIuY2FsbE1ldGhvZChcbiAgICAgICAgJ2NyZWF0ZVZpZXdSb290JywgW28uVEhJU19FWFBSLnByb3AoJ2RlY2xhcmF0aW9uQXBwRWxlbWVudCcpLnByb3AoJ25hdGl2ZUVsZW1lbnQnKV0pO1xuICAgIHBhcmVudFJlbmRlck5vZGVTdG10cyA9IFtcbiAgICAgIHBhcmVudFJlbmRlck5vZGVWYXIuc2V0KHBhcmVudFJlbmRlck5vZGVFeHByKVxuICAgICAgICAgIC50b0RlY2xTdG10KG8uaW1wb3J0VHlwZSh2aWV3LmdlbkNvbmZpZy5yZW5kZXJUeXBlcy5yZW5kZXJOb2RlKSwgW28uU3RtdE1vZGlmaWVyLkZpbmFsXSlcbiAgICBdO1xuICB9XG4gIHZhciByZXN1bHRFeHByOiBvLkV4cHJlc3Npb247XG4gIGlmICh2aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5IT1NUKSB7XG4gICAgcmVzdWx0RXhwciA9ICg8Q29tcGlsZUVsZW1lbnQ+dmlldy5ub2Rlc1swXSkuYXBwRWxlbWVudDtcbiAgfSBlbHNlIHtcbiAgICByZXN1bHRFeHByID0gby5OVUxMX0VYUFI7XG4gIH1cbiAgcmV0dXJuIHBhcmVudFJlbmRlck5vZGVTdG10cy5jb25jYXQodmlldy5jcmVhdGVNZXRob2QuZmluaXNoKCkpXG4gICAgICAuY29uY2F0KFtcbiAgICAgICAgby5USElTX0VYUFIuY2FsbE1ldGhvZCgnaW5pdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlRmxhdEFycmF5KHZpZXcucm9vdE5vZGVzT3JBcHBFbGVtZW50cyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvLmxpdGVyYWxBcnIodmlldy5ub2Rlcy5tYXAobm9kZSA9PiBub2RlLnJlbmRlck5vZGUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycih2aWV3LmRpc3Bvc2FibGVzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8ubGl0ZXJhbEFycih2aWV3LnN1YnNjcmlwdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIC50b1N0bXQoKSxcbiAgICAgICAgbmV3IG8uUmV0dXJuU3RhdGVtZW50KHJlc3VsdEV4cHIpXG4gICAgICBdKTtcbn1cblxuZnVuY3Rpb24gZ2VuZXJhdGVEZXRlY3RDaGFuZ2VzTWV0aG9kKHZpZXc6IENvbXBpbGVWaWV3KTogby5TdGF0ZW1lbnRbXSB7XG4gIHZhciBzdG10cyA9IFtdO1xuICBpZiAodmlldy5kZXRlY3RDaGFuZ2VzSW5JbnB1dHNNZXRob2QuaXNFbXB0eSgpICYmIHZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LmFmdGVyQ29udGVudExpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5pc0VtcHR5KCkgJiZcbiAgICAgIHZpZXcuZGV0ZWN0Q2hhbmdlc1JlbmRlclByb3BlcnRpZXNNZXRob2QuaXNFbXB0eSgpICYmXG4gICAgICB2aWV3LnVwZGF0ZVZpZXdRdWVyaWVzTWV0aG9kLmlzRW1wdHkoKSAmJiB2aWV3LmFmdGVyVmlld0xpZmVjeWNsZUNhbGxiYWNrc01ldGhvZC5pc0VtcHR5KCkpIHtcbiAgICByZXR1cm4gc3RtdHM7XG4gIH1cbiAgTGlzdFdyYXBwZXIuYWRkQWxsKHN0bXRzLCB2aWV3LmRldGVjdENoYW5nZXNJbklucHV0c01ldGhvZC5maW5pc2goKSk7XG4gIHN0bXRzLnB1c2goXG4gICAgICBvLlRISVNfRVhQUi5jYWxsTWV0aG9kKCdkZXRlY3RDb250ZW50Q2hpbGRyZW5DaGFuZ2VzJywgW0RldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2VdKVxuICAgICAgICAgIC50b1N0bXQoKSk7XG4gIHZhciBhZnRlckNvbnRlbnRTdG10cyA9IHZpZXcudXBkYXRlQ29udGVudFF1ZXJpZXNNZXRob2QuZmluaXNoKCkuY29uY2F0KFxuICAgICAgdmlldy5hZnRlckNvbnRlbnRMaWZlY3ljbGVDYWxsYmFja3NNZXRob2QuZmluaXNoKCkpO1xuICBpZiAoYWZ0ZXJDb250ZW50U3RtdHMubGVuZ3RoID4gMCkge1xuICAgIHN0bXRzLnB1c2gobmV3IG8uSWZTdG10KG8ubm90KERldGVjdENoYW5nZXNWYXJzLnRocm93T25DaGFuZ2UpLCBhZnRlckNvbnRlbnRTdG10cykpO1xuICB9XG4gIExpc3RXcmFwcGVyLmFkZEFsbChzdG10cywgdmlldy5kZXRlY3RDaGFuZ2VzUmVuZGVyUHJvcGVydGllc01ldGhvZC5maW5pc2goKSk7XG4gIHN0bXRzLnB1c2goby5USElTX0VYUFIuY2FsbE1ldGhvZCgnZGV0ZWN0Vmlld0NoaWxkcmVuQ2hhbmdlcycsIFtEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlXSlcbiAgICAgICAgICAgICAgICAgLnRvU3RtdCgpKTtcbiAgdmFyIGFmdGVyVmlld1N0bXRzID1cbiAgICAgIHZpZXcudXBkYXRlVmlld1F1ZXJpZXNNZXRob2QuZmluaXNoKCkuY29uY2F0KHZpZXcuYWZ0ZXJWaWV3TGlmZWN5Y2xlQ2FsbGJhY2tzTWV0aG9kLmZpbmlzaCgpKTtcbiAgaWYgKGFmdGVyVmlld1N0bXRzLmxlbmd0aCA+IDApIHtcbiAgICBzdG10cy5wdXNoKG5ldyBvLklmU3RtdChvLm5vdChEZXRlY3RDaGFuZ2VzVmFycy50aHJvd09uQ2hhbmdlKSwgYWZ0ZXJWaWV3U3RtdHMpKTtcbiAgfVxuXG4gIHZhciB2YXJTdG10cyA9IFtdO1xuICB2YXIgcmVhZFZhcnMgPSBvLmZpbmRSZWFkVmFyTmFtZXMoc3RtdHMpO1xuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLmNoYW5nZWQubmFtZSkpIHtcbiAgICB2YXJTdG10cy5wdXNoKERldGVjdENoYW5nZXNWYXJzLmNoYW5nZWQuc2V0KG8ubGl0ZXJhbCh0cnVlKSkudG9EZWNsU3RtdChvLkJPT0xfVFlQRSkpO1xuICB9XG4gIGlmIChTZXRXcmFwcGVyLmhhcyhyZWFkVmFycywgRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5uYW1lKSkge1xuICAgIHZhclN0bXRzLnB1c2goRGV0ZWN0Q2hhbmdlc1ZhcnMuY2hhbmdlcy5zZXQoby5OVUxMX0VYUFIpXG4gICAgICAgICAgICAgICAgICAgICAgLnRvRGVjbFN0bXQobmV3IG8uTWFwVHlwZShvLmltcG9ydFR5cGUoSWRlbnRpZmllcnMuU2ltcGxlQ2hhbmdlKSkpKTtcbiAgfVxuICBpZiAoU2V0V3JhcHBlci5oYXMocmVhZFZhcnMsIERldGVjdENoYW5nZXNWYXJzLnZhbFVud3JhcHBlci5uYW1lKSkge1xuICAgIHZhclN0bXRzLnB1c2goXG4gICAgICAgIERldGVjdENoYW5nZXNWYXJzLnZhbFVud3JhcHBlci5zZXQoby5pbXBvcnRFeHByKElkZW50aWZpZXJzLlZhbHVlVW53cmFwcGVyKS5pbnN0YW50aWF0ZShbXSkpXG4gICAgICAgICAgICAudG9EZWNsU3RtdChudWxsLCBbby5TdG10TW9kaWZpZXIuRmluYWxdKSk7XG4gIH1cbiAgcmV0dXJuIHZhclN0bXRzLmNvbmNhdChzdG10cyk7XG59XG5cbmZ1bmN0aW9uIGFkZFJldHVyblZhbHVlZk5vdEVtcHR5KHN0YXRlbWVudHM6IG8uU3RhdGVtZW50W10sIHZhbHVlOiBvLkV4cHJlc3Npb24pOiBvLlN0YXRlbWVudFtdIHtcbiAgaWYgKHN0YXRlbWVudHMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBzdGF0ZW1lbnRzLmNvbmNhdChbbmV3IG8uUmV0dXJuU3RhdGVtZW50KHZhbHVlKV0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdGF0ZW1lbnRzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldENvbnRleHRUeXBlKHZpZXc6IENvbXBpbGVWaWV3KTogby5UeXBlIHtcbiAgaWYgKHZpZXcudmlld1R5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgIHJldHVybiBvLmltcG9ydFR5cGUodmlldy5jb21wb25lbnQudHlwZSk7XG4gIH1cbiAgcmV0dXJuIG8uRFlOQU1JQ19UWVBFO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFuZ2VEZXRlY3Rpb25Nb2RlKHZpZXc6IENvbXBpbGVWaWV3KTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kge1xuICB2YXIgbW9kZTogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG4gIGlmICh2aWV3LnZpZXdUeXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICBtb2RlID0gaXNEZWZhdWx0Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kodmlldy5jb21wb25lbnQuY2hhbmdlRGV0ZWN0aW9uKSA/XG4gICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja0Fsd2F5cyA6XG4gICAgICAgICAgICAgICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5DaGVja09uY2U7XG4gIH0gZWxzZSB7XG4gICAgbW9kZSA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkNoZWNrQWx3YXlzO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuIl19