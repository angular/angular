/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ViewEncapsulation} from '@angular/core';

import {CompileDirectiveMetadata, CompileDirectiveSummary, CompileIdentifierMetadata, CompileTokenMetadata} from '../compile_metadata';
import {createSharedBindingVariablesIfNeeded} from '../compiler_util/expression_converter';
import {createDiTokenExpression, createInlineArray} from '../compiler_util/identifier_util';
import {isPresent} from '../facade/lang';
import {Identifiers, identifierToken, resolveIdentifier} from '../identifiers';
import {createClassStmt} from '../output/class_builder';
import * as o from '../output/output_ast';
import {ParseSourceSpan} from '../parse_util';
import {ChangeDetectorStatus, ViewType, isDefaultChangeDetectionStrategy} from '../private_import_core';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';

import {CompileElement, CompileNode} from './compile_element';
import {CompileView, CompileViewRootNode, CompileViewRootNodeType} from './compile_view';
import {ChangeDetectorStatusEnum, DetectChangesVars, InjectMethodVars, ViewConstructorVars, ViewEncapsulationEnum, ViewProperties, ViewTypeEnum} from './constants';
import {ComponentFactoryDependency, DirectiveWrapperDependency, ViewClassDependency} from './deps';
import {getViewClassName} from './util';

const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
const NG_CONTAINER_TAG = 'ng-container';

var parentRenderNodeVar = o.variable('parentRenderNode');
var rootSelectorVar = o.variable('rootSelector');

export function buildView(
    view: CompileView, template: TemplateAst[],
    targetDependencies:
        Array<ViewClassDependency|ComponentFactoryDependency|DirectiveWrapperDependency>): number {
  var builderVisitor = new ViewBuilderVisitor(view, targetDependencies);
  const parentEl =
      view.declarationElement.isNull() ? view.declarationElement : view.declarationElement.parent;
  templateVisitAll(builderVisitor, template, parentEl);
  if (view.viewType === ViewType.EMBEDDED || view.viewType === ViewType.HOST) {
    view.lastRenderNode = builderVisitor.getOrCreateLastRenderNode();
  }
  return builderVisitor.nestedViewCount;
}

export function finishView(view: CompileView, targetStatements: o.Statement[]) {
  view.afterNodes();
  createViewTopLevelStmts(view, targetStatements);
  view.nodes.forEach((node) => {
    if (node instanceof CompileElement && node.hasEmbeddedView) {
      finishView(node.embeddedView, targetStatements);
    }
  });
}

class ViewBuilderVisitor implements TemplateAstVisitor {
  nestedViewCount: number = 0;

  constructor(
      public view: CompileView,
      public targetDependencies:
          Array<ViewClassDependency|ComponentFactoryDependency|DirectiveWrapperDependency>) {}

  private _isRootNode(parent: CompileElement): boolean { return parent.view !== this.view; }

  private _addRootNodeAndProject(node: CompileNode) {
    var projectedNode = _getOuterContainerOrSelf(node);
    var parent = projectedNode.parent;
    var ngContentIndex = (<any>projectedNode.sourceAst).ngContentIndex;
    var viewContainer =
        (node instanceof CompileElement && node.hasViewContainer) ? node.viewContainer : null;
    if (this._isRootNode(parent)) {
      if (this.view.viewType !== ViewType.COMPONENT) {
        this.view.rootNodes.push(new CompileViewRootNode(
            viewContainer ? CompileViewRootNodeType.ViewContainer : CompileViewRootNodeType.Node,
            viewContainer || node.renderNode));
      }
    } else if (isPresent(parent.component) && isPresent(ngContentIndex)) {
      parent.addContentNode(
          ngContentIndex,
          new CompileViewRootNode(
              viewContainer ? CompileViewRootNodeType.ViewContainer : CompileViewRootNodeType.Node,
              viewContainer || node.renderNode));
    }
  }

  private _getParentRenderNode(parent: CompileElement): o.Expression {
    parent = _getOuterContainerParentOrSelf(parent);
    if (this._isRootNode(parent)) {
      if (this.view.viewType === ViewType.COMPONENT) {
        return parentRenderNodeVar;
      } else {
        // root node of an embedded/host view
        return o.NULL_EXPR;
      }
    } else {
      return isPresent(parent.component) &&
              parent.component.template.encapsulation !== ViewEncapsulation.Native ?
          o.NULL_EXPR :
          parent.renderNode;
    }
  }

  getOrCreateLastRenderNode(): o.Expression {
    const view = this.view;
    if (view.rootNodes.length === 0 ||
        view.rootNodes[view.rootNodes.length - 1].type !== CompileViewRootNodeType.Node) {
      var fieldName = `_el_${view.nodes.length}`;
      view.fields.push(
          new o.ClassField(fieldName, o.importType(view.genConfig.renderTypes.renderElement)));
      view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName)
                                    .set(ViewProperties.renderer.callMethod(
                                        'createTemplateAnchor', [o.NULL_EXPR, o.NULL_EXPR]))
                                    .toStmt());
      view.rootNodes.push(
          new CompileViewRootNode(CompileViewRootNodeType.Node, o.THIS_EXPR.prop(fieldName)));
    }
    return view.rootNodes[view.rootNodes.length - 1].expr;
  }

  visitBoundText(ast: BoundTextAst, parent: CompileElement): any {
    return this._visitText(ast, '', parent);
  }
  visitText(ast: TextAst, parent: CompileElement): any {
    return this._visitText(ast, ast.value, parent);
  }
  private _visitText(ast: TemplateAst, value: string, parent: CompileElement): o.Expression {
    var fieldName = `_text_${this.view.nodes.length}`;
    this.view.fields.push(
        new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderText)));
    var renderNode = o.THIS_EXPR.prop(fieldName);
    var compileNode = new CompileNode(parent, this.view, this.view.nodes.length, renderNode, ast);
    var createRenderNode =
        o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod(
                'createText',
                [
                  this._getParentRenderNode(parent), o.literal(value),
                  this.view.createMethod.resetDebugInfoExpr(this.view.nodes.length, ast)
                ]))
            .toStmt();
    this.view.nodes.push(compileNode);
    this.view.createMethod.addStmt(createRenderNode);
    this._addRootNodeAndProject(compileNode);
    return renderNode;
  }

  visitNgContent(ast: NgContentAst, parent: CompileElement): any {
    // the projected nodes originate from a different view, so we don't
    // have debug information for them...
    this.view.createMethod.resetDebugInfo(null, ast);
    var parentRenderNode = this._getParentRenderNode(parent);
    if (parentRenderNode !== o.NULL_EXPR) {
      this.view.createMethod.addStmt(
          o.THIS_EXPR.callMethod('projectNodes', [parentRenderNode, o.literal(ast.index)])
              .toStmt());
    } else if (this._isRootNode(parent)) {
      if (this.view.viewType !== ViewType.COMPONENT) {
        // store root nodes only for embedded/host views
        this.view.rootNodes.push(
            new CompileViewRootNode(CompileViewRootNodeType.NgContent, null, ast.index));
      }
    } else {
      if (isPresent(parent.component) && isPresent(ast.ngContentIndex)) {
        parent.addContentNode(
            ast.ngContentIndex,
            new CompileViewRootNode(CompileViewRootNodeType.NgContent, null, ast.index));
      }
    }
    return null;
  }

  visitElement(ast: ElementAst, parent: CompileElement): any {
    var nodeIndex = this.view.nodes.length;
    var createRenderNodeExpr: o.Expression;
    var debugContextExpr = this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast);
    var directives = ast.directives.map(directiveAst => directiveAst.directive);
    var component = directives.find(directive => directive.isComponent);
    if (ast.name === NG_CONTAINER_TAG) {
      createRenderNodeExpr = ViewProperties.renderer.callMethod(
          'createTemplateAnchor', [this._getParentRenderNode(parent), debugContextExpr]);
    } else {
      const htmlAttrs = _readHtmlAttrs(ast.attrs);
      const attrNameAndValues = createInlineArray(
          _mergeHtmlAndDirectiveAttrs(htmlAttrs, directives).map(v => o.literal(v)));
      if (nodeIndex === 0 && this.view.viewType === ViewType.HOST) {
        createRenderNodeExpr =
            o.importExpr(resolveIdentifier(Identifiers.selectOrCreateRenderHostElement)).callFn([
              ViewProperties.renderer, o.literal(ast.name), attrNameAndValues, rootSelectorVar,
              debugContextExpr
            ]);
      } else {
        createRenderNodeExpr =
            o.importExpr(resolveIdentifier(Identifiers.createRenderElement)).callFn([
              ViewProperties.renderer, this._getParentRenderNode(parent), o.literal(ast.name),
              attrNameAndValues, debugContextExpr
            ]);
      }
    }
    var fieldName = `_el_${nodeIndex}`;
    this.view.fields.push(
        new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderElement)));
    this.view.createMethod.addStmt(o.THIS_EXPR.prop(fieldName).set(createRenderNodeExpr).toStmt());

    var renderNode = o.THIS_EXPR.prop(fieldName);

    var compileElement = new CompileElement(
        parent, this.view, nodeIndex, renderNode, ast, component, directives, ast.providers,
        ast.hasViewContainer, false, ast.references, this.targetDependencies);
    this.view.nodes.push(compileElement);
    var compViewExpr: o.ReadPropExpr = null;
    if (isPresent(component)) {
      let nestedComponentIdentifier =
          new CompileIdentifierMetadata({name: getViewClassName(component, 0)});
      this.targetDependencies.push(
          new ViewClassDependency(component.type, nestedComponentIdentifier));

      compViewExpr = o.THIS_EXPR.prop(`compView_${nodeIndex}`);  // fix highlighting: `
      this.view.fields.push(new o.ClassField(
          compViewExpr.name,
          o.importType(resolveIdentifier(Identifiers.AppView), [o.importType(component.type)])));
      this.view.viewChildren.push(compViewExpr);
      compileElement.setComponentView(compViewExpr);
      this.view.createMethod.addStmt(
          compViewExpr
              .set(o.importExpr(nestedComponentIdentifier).instantiate([
                ViewProperties.viewUtils, o.THIS_EXPR, o.literal(nodeIndex), renderNode
              ]))
              .toStmt());
    }
    compileElement.beforeChildren();
    this._addRootNodeAndProject(compileElement);
    templateVisitAll(this, ast.children, compileElement);
    compileElement.afterChildren(this.view.nodes.length - nodeIndex - 1);

    if (isPresent(compViewExpr)) {
      this.view.createMethod.addStmt(
          compViewExpr.callMethod('create', [compileElement.getComponent()]).toStmt());
    }
    return null;
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, parent: CompileElement): any {
    var nodeIndex = this.view.nodes.length;
    var fieldName = `_anchor_${nodeIndex}`;
    this.view.fields.push(
        new o.ClassField(fieldName, o.importType(this.view.genConfig.renderTypes.renderComment)));
    this.view.createMethod.addStmt(
        o.THIS_EXPR.prop(fieldName)
            .set(ViewProperties.renderer.callMethod(
                'createTemplateAnchor',
                [
                  this._getParentRenderNode(parent),
                  this.view.createMethod.resetDebugInfoExpr(nodeIndex, ast)
                ]))
            .toStmt());
    var renderNode = o.THIS_EXPR.prop(fieldName);

    var templateVariableBindings = ast.variables.map(
        varAst => [varAst.value.length > 0 ? varAst.value : IMPLICIT_TEMPLATE_VAR, varAst.name]);

    var directives = ast.directives.map(directiveAst => directiveAst.directive);
    var compileElement = new CompileElement(
        parent, this.view, nodeIndex, renderNode, ast, null, directives, ast.providers,
        ast.hasViewContainer, true, ast.references, this.targetDependencies);
    this.view.nodes.push(compileElement);

    this.nestedViewCount++;
    var embeddedView = new CompileView(
        this.view.component, this.view.genConfig, this.view.pipeMetas, o.NULL_EXPR,
        this.view.animations, this.view.viewIndex + this.nestedViewCount, compileElement,
        templateVariableBindings);
    this.nestedViewCount += buildView(embeddedView, ast.children, this.targetDependencies);

    compileElement.beforeChildren();
    this._addRootNodeAndProject(compileElement);
    compileElement.afterChildren(0);

    return null;
  }

  visitAttr(ast: AttrAst, ctx: any): any { return null; }
  visitDirective(ast: DirectiveAst, ctx: any): any { return null; }
  visitEvent(ast: BoundEventAst, eventTargetAndNames: Map<string, BoundEventAst>): any {
    return null;
  }

  visitReference(ast: ReferenceAst, ctx: any): any { return null; }
  visitVariable(ast: VariableAst, ctx: any): any { return null; }
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any { return null; }
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any { return null; }
}

/**
 * Walks up the nodes while the direct parent is a container.
 *
 * Returns the outer container or the node itself when it is not a direct child of a container.
 *
 * @internal
 */
function _getOuterContainerOrSelf(node: CompileNode): CompileNode {
  const view = node.view;

  while (_isNgContainer(node.parent, view)) {
    node = node.parent;
  }

  return node;
}

/**
 * Walks up the nodes while they are container and returns the first parent which is not.
 *
 * Returns the parent of the outer container or the node itself when it is not a container.
 *
 * @internal
 */
function _getOuterContainerParentOrSelf(el: CompileElement): CompileElement {
  const view = el.view;

  while (_isNgContainer(el, view)) {
    el = el.parent;
  }

  return el;
}

function _isNgContainer(node: CompileNode, view: CompileView): boolean {
  return !node.isNull() && (<ElementAst>node.sourceAst).name === NG_CONTAINER_TAG &&
      node.view === view;
}


function _mergeHtmlAndDirectiveAttrs(
    declaredHtmlAttrs: {[key: string]: string}, directives: CompileDirectiveSummary[]): string[] {
  const mapResult: {[key: string]: string} = {};
  Object.keys(declaredHtmlAttrs).forEach(key => { mapResult[key] = declaredHtmlAttrs[key]; });
  directives.forEach(directiveMeta => {
    Object.keys(directiveMeta.hostAttributes).forEach(name => {
      const value = directiveMeta.hostAttributes[name];
      const prevValue = mapResult[name];
      mapResult[name] = isPresent(prevValue) ? mergeAttributeValue(name, prevValue, value) : value;
    });
  });
  const arrResult: string[] = [];
  // Note: We need to sort to get a defined output order
  // for tests and for caching generated artifacts...
  Object.keys(mapResult).sort().forEach(
      (attrName) => { arrResult.push(attrName, mapResult[attrName]); });
  return arrResult;
}

function _readHtmlAttrs(attrs: AttrAst[]): {[key: string]: string} {
  var htmlAttrs: {[key: string]: string} = {};
  attrs.forEach((ast) => { htmlAttrs[ast.name] = ast.value; });
  return htmlAttrs;
}

function mergeAttributeValue(attrName: string, attrValue1: string, attrValue2: string): string {
  if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
    return `${attrValue1} ${attrValue2}`;
  } else {
    return attrValue2;
  }
}

function createViewTopLevelStmts(view: CompileView, targetStatements: o.Statement[]) {
  var nodeDebugInfosVar: o.Expression = o.NULL_EXPR;
  if (view.genConfig.genDebugInfo) {
    nodeDebugInfosVar = o.variable(
        `nodeDebugInfos_${view.component.type.name}${view.viewIndex}`);  // fix highlighting: `
    targetStatements.push(
        (<o.ReadVarExpr>nodeDebugInfosVar)
            .set(o.literalArr(
                view.nodes.map(createStaticNodeDebugInfo),
                new o.ArrayType(
                    new o.ExternalType(resolveIdentifier(Identifiers.StaticNodeDebugInfo)),
                    [o.TypeModifier.Const])))
            .toDeclStmt(null, [o.StmtModifier.Final]));
  }


  var renderCompTypeVar: o.ReadVarExpr =
      o.variable(`renderType_${view.component.type.name}`);  // fix highlighting: `
  if (view.viewIndex === 0) {
    let templateUrlInfo: string;
    if (view.component.template.templateUrl == view.component.type.moduleUrl) {
      templateUrlInfo =
          `${view.component.type.moduleUrl} class ${view.component.type.name} - inline template`;
    } else {
      templateUrlInfo = view.component.template.templateUrl;
    }
    targetStatements.push(
        renderCompTypeVar
            .set(o.importExpr(resolveIdentifier(Identifiers.createRenderComponentType)).callFn([
              view.genConfig.genDebugInfo ? o.literal(templateUrlInfo) : o.literal(''),
              o.literal(view.component.template.ngContentSelectors.length),
              ViewEncapsulationEnum.fromValue(view.component.template.encapsulation),
              view.styles,
              o.literalMap(view.animations.map(
                  (entry): [string, o.Expression] => [entry.name, entry.fnExp])),
            ]))
            .toDeclStmt(o.importType(resolveIdentifier(Identifiers.RenderComponentType))));
  }

  var viewClass = createViewClass(view, renderCompTypeVar, nodeDebugInfosVar);
  targetStatements.push(viewClass);
}

function createStaticNodeDebugInfo(node: CompileNode): o.Expression {
  var compileElement = node instanceof CompileElement ? node : null;
  var providerTokens: o.Expression[] = [];
  var componentToken: o.Expression = o.NULL_EXPR;
  var varTokenEntries: any[] = [];
  if (isPresent(compileElement)) {
    providerTokens = compileElement.getProviderTokens();
    if (isPresent(compileElement.component)) {
      componentToken = createDiTokenExpression(identifierToken(compileElement.component.type));
    }
    Object.keys(compileElement.referenceTokens).forEach(varName => {
      const token = compileElement.referenceTokens[varName];
      varTokenEntries.push(
          [varName, isPresent(token) ? createDiTokenExpression(token) : o.NULL_EXPR]);
    });
  }
  return o.importExpr(resolveIdentifier(Identifiers.StaticNodeDebugInfo))
      .instantiate(
          [
            o.literalArr(providerTokens, new o.ArrayType(o.DYNAMIC_TYPE, [o.TypeModifier.Const])),
            componentToken,
            o.literalMap(varTokenEntries, new o.MapType(o.DYNAMIC_TYPE, [o.TypeModifier.Const]))
          ],
          o.importType(
              resolveIdentifier(Identifiers.StaticNodeDebugInfo), null, [o.TypeModifier.Const]));
}

function createViewClass(
    view: CompileView, renderCompTypeVar: o.ReadVarExpr,
    nodeDebugInfosVar: o.Expression): o.ClassStmt {
  var viewConstructorArgs = [
    new o.FnParam(
        ViewConstructorVars.viewUtils.name, o.importType(resolveIdentifier(Identifiers.ViewUtils))),
    new o.FnParam(
        ViewConstructorVars.parentView.name,
        o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE])),
    new o.FnParam(ViewConstructorVars.parentIndex.name, o.NUMBER_TYPE),
    new o.FnParam(ViewConstructorVars.parentElement.name, o.DYNAMIC_TYPE)
  ];
  var superConstructorArgs = [
    o.variable(view.className), renderCompTypeVar, ViewTypeEnum.fromValue(view.viewType),
    ViewConstructorVars.viewUtils, ViewConstructorVars.parentView, ViewConstructorVars.parentIndex,
    ViewConstructorVars.parentElement,
    ChangeDetectorStatusEnum.fromValue(getChangeDetectionMode(view))
  ];
  if (view.genConfig.genDebugInfo) {
    superConstructorArgs.push(nodeDebugInfosVar);
  }
  if (view.viewType === ViewType.EMBEDDED) {
    viewConstructorArgs.push(new o.FnParam(
        'declaredViewContainer', o.importType(resolveIdentifier(Identifiers.ViewContainer))));
    superConstructorArgs.push(o.variable('declaredViewContainer'));
  }
  var viewMethods = [
    new o.ClassMethod(
        'createInternal', [new o.FnParam(rootSelectorVar.name, o.STRING_TYPE)],
        generateCreateMethod(view),
        o.importType(resolveIdentifier(Identifiers.ComponentRef), [o.DYNAMIC_TYPE])),
    new o.ClassMethod(
        'injectorGetInternal',
        [
          new o.FnParam(InjectMethodVars.token.name, o.DYNAMIC_TYPE),
          // Note: Can't use o.INT_TYPE here as the method in AppView uses number
          new o.FnParam(InjectMethodVars.requestNodeIndex.name, o.NUMBER_TYPE),
          new o.FnParam(InjectMethodVars.notFoundResult.name, o.DYNAMIC_TYPE)
        ],
        addReturnValuefNotEmpty(view.injectorGetMethod.finish(), InjectMethodVars.notFoundResult),
        o.DYNAMIC_TYPE),
    new o.ClassMethod(
        'detectChangesInternal', [new o.FnParam(DetectChangesVars.throwOnChange.name, o.BOOL_TYPE)],
        generateDetectChangesMethod(view)),
    new o.ClassMethod('dirtyParentQueriesInternal', [], view.dirtyParentQueriesMethod.finish()),
    new o.ClassMethod('destroyInternal', [], generateDestroyMethod(view)),
    new o.ClassMethod('detachInternal', [], view.detachMethod.finish()),
    generateVisitRootNodesMethod(view), generateVisitProjectableNodesMethod(view),
    generateCreateEmbeddedViewsMethod(view)
  ].filter((method) => method.body.length > 0);
  var superClass = view.genConfig.genDebugInfo ? Identifiers.DebugAppView : Identifiers.AppView;

  var viewClass = createClassStmt({
    name: view.className,
    parent: o.importExpr(resolveIdentifier(superClass), [getContextType(view)]),
    parentArgs: superConstructorArgs,
    ctorParams: viewConstructorArgs,
    builders: [{methods: viewMethods}, view]
  });
  return viewClass;
}

function generateDestroyMethod(view: CompileView): o.Statement[] {
  const stmts: o.Statement[] = [];
  view.viewContainers.forEach((viewContainer) => {
    stmts.push(viewContainer.callMethod('destroyNestedViews', []).toStmt());
  });
  view.viewChildren.forEach(
      (viewChild) => { stmts.push(viewChild.callMethod('destroy', []).toStmt()); });
  stmts.push(...view.destroyMethod.finish());
  return stmts;
}

function generateCreateMethod(view: CompileView): o.Statement[] {
  var parentRenderNodeExpr: o.Expression = o.NULL_EXPR;
  var parentRenderNodeStmts: any[] = [];
  if (view.viewType === ViewType.COMPONENT) {
    parentRenderNodeExpr =
        ViewProperties.renderer.callMethod('createViewRoot', [o.THIS_EXPR.prop('parentElement')]);
    parentRenderNodeStmts =
        [parentRenderNodeVar.set(parentRenderNodeExpr)
             .toDeclStmt(
                 o.importType(view.genConfig.renderTypes.renderNode), [o.StmtModifier.Final])];
  }
  var resultExpr: o.Expression;
  if (view.viewType === ViewType.HOST) {
    const hostEl = <CompileElement>view.nodes[0];
    resultExpr =
        o.importExpr(resolveIdentifier(Identifiers.ComponentRef_), [o.DYNAMIC_TYPE]).instantiate([
          o.literal(hostEl.nodeIndex), o.THIS_EXPR, hostEl.renderNode, hostEl.getComponent()
        ]);
  } else {
    resultExpr = o.NULL_EXPR;
  }
  let allNodesExpr: o.Expression =
      ViewProperties.renderer.cast(o.DYNAMIC_TYPE)
          .prop('directRenderer')
          .conditional(o.NULL_EXPR, o.literalArr(view.nodes.map(node => node.renderNode)));

  return parentRenderNodeStmts.concat(view.createMethod.finish(), [
    o.THIS_EXPR
        .callMethod(
            'init',
            [
              view.lastRenderNode,
              allNodesExpr,
              view.disposables.length ? o.literalArr(view.disposables) : o.NULL_EXPR,
            ])
        .toStmt(),
    new o.ReturnStatement(resultExpr)
  ]);
}

function generateDetectChangesMethod(view: CompileView): o.Statement[] {
  var stmts: any[] = [];
  if (view.animationBindingsMethod.isEmpty() && view.detectChangesInInputsMethod.isEmpty() &&
      view.updateContentQueriesMethod.isEmpty() &&
      view.afterContentLifecycleCallbacksMethod.isEmpty() &&
      view.detectChangesRenderPropertiesMethod.isEmpty() &&
      view.updateViewQueriesMethod.isEmpty() && view.afterViewLifecycleCallbacksMethod.isEmpty() &&
      view.viewContainers.length === 0 && view.viewChildren.length === 0) {
    return stmts;
  }
  stmts.push(...view.animationBindingsMethod.finish());
  stmts.push(...view.detectChangesInInputsMethod.finish());
  view.viewContainers.forEach((viewContainer) => {
    stmts.push(
        viewContainer.callMethod('detectChangesInNestedViews', [DetectChangesVars.throwOnChange])
            .toStmt());
  });
  var afterContentStmts = view.updateContentQueriesMethod.finish().concat(
      view.afterContentLifecycleCallbacksMethod.finish());
  if (afterContentStmts.length > 0) {
    stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterContentStmts));
  }
  stmts.push(...view.detectChangesRenderPropertiesMethod.finish());
  view.viewChildren.forEach((viewChild) => {
    stmts.push(viewChild.callMethod('detectChanges', [DetectChangesVars.throwOnChange]).toStmt());
  });
  var afterViewStmts =
      view.updateViewQueriesMethod.finish().concat(view.afterViewLifecycleCallbacksMethod.finish());
  if (afterViewStmts.length > 0) {
    stmts.push(new o.IfStmt(o.not(DetectChangesVars.throwOnChange), afterViewStmts));
  }

  var varStmts: any[] = [];
  var readVars = o.findReadVarNames(stmts);
  if (readVars.has(DetectChangesVars.changed.name)) {
    varStmts.push(DetectChangesVars.changed.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE));
  }
  if (readVars.has(DetectChangesVars.changes.name)) {
    varStmts.push(
        DetectChangesVars.changes.set(o.NULL_EXPR)
            .toDeclStmt(new o.MapType(o.importType(resolveIdentifier(Identifiers.SimpleChange)))));
  }
  varStmts.push(...createSharedBindingVariablesIfNeeded(stmts));
  return varStmts.concat(stmts);
}

function addReturnValuefNotEmpty(statements: o.Statement[], value: o.Expression): o.Statement[] {
  if (statements.length > 0) {
    return statements.concat([new o.ReturnStatement(value)]);
  } else {
    return statements;
  }
}

function getContextType(view: CompileView): o.Type {
  if (view.viewType === ViewType.COMPONENT) {
    return o.importType(view.component.type);
  }
  return o.DYNAMIC_TYPE;
}

function getChangeDetectionMode(view: CompileView): ChangeDetectorStatus {
  var mode: ChangeDetectorStatus;
  if (view.viewType === ViewType.COMPONENT) {
    mode = isDefaultChangeDetectionStrategy(view.component.changeDetection) ?
        ChangeDetectorStatus.CheckAlways :
        ChangeDetectorStatus.CheckOnce;
  } else {
    mode = ChangeDetectorStatus.CheckAlways;
  }
  return mode;
}

function generateVisitRootNodesMethod(view: CompileView): o.ClassMethod {
  const cbVar = o.variable('cb');
  const ctxVar = o.variable('ctx');
  const stmts: o.Statement[] = generateVisitNodesStmts(view.rootNodes, cbVar, ctxVar);
  return new o.ClassMethod(
      'visitRootNodesInternal',
      [new o.FnParam(cbVar.name, o.DYNAMIC_TYPE), new o.FnParam(ctxVar.name, o.DYNAMIC_TYPE)],
      stmts);
}

function generateVisitProjectableNodesMethod(view: CompileView): o.ClassMethod {
  const nodeIndexVar = o.variable('nodeIndex');
  const ngContentIndexVar = o.variable('ngContentIndex');
  const cbVar = o.variable('cb');
  const ctxVar = o.variable('ctx');
  const stmts: o.Statement[] = [];
  view.nodes.forEach((node) => {
    if (node instanceof CompileElement && node.component) {
      node.contentNodesByNgContentIndex.forEach((projectedNodes, ngContentIndex) => {
        stmts.push(new o.IfStmt(
            nodeIndexVar.equals(o.literal(node.nodeIndex))
                .and(ngContentIndexVar.equals(o.literal(ngContentIndex))),
            generateVisitNodesStmts(projectedNodes, cbVar, ctxVar)));
      });
    }
  });
  return new o.ClassMethod(
      'visitProjectableNodesInternal',
      [
        new o.FnParam(nodeIndexVar.name, o.NUMBER_TYPE),
        new o.FnParam(ngContentIndexVar.name, o.NUMBER_TYPE),
        new o.FnParam(cbVar.name, o.DYNAMIC_TYPE), new o.FnParam(ctxVar.name, o.DYNAMIC_TYPE)
      ],
      stmts);
}

function generateVisitNodesStmts(
    nodes: CompileViewRootNode[], cb: o.Expression, ctx: o.Expression): o.Statement[] {
  const stmts: o.Statement[] = [];
  nodes.forEach((node) => {
    switch (node.type) {
      case CompileViewRootNodeType.Node:
        stmts.push(cb.callFn([node.expr, ctx]).toStmt());
        break;
      case CompileViewRootNodeType.ViewContainer:
        stmts.push(cb.callFn([node.expr.prop('nativeElement'), ctx]).toStmt());
        stmts.push(node.expr.callMethod('visitNestedViewRootNodes', [cb, ctx]).toStmt());
        break;
      case CompileViewRootNodeType.NgContent:
        stmts.push(
            o.THIS_EXPR.callMethod('visitProjectedNodes', [o.literal(node.ngContentIndex), cb, ctx])
                .toStmt());
        break;
    }
  });
  return stmts;
}

function generateCreateEmbeddedViewsMethod(view: CompileView): o.ClassMethod {
  const nodeIndexVar = o.variable('nodeIndex');
  const stmts: o.Statement[] = [];
  view.nodes.forEach((node) => {
    if (node instanceof CompileElement) {
      if (node.embeddedView) {
        const parentNodeIndex = node.isRootElement() ? null : node.parent.nodeIndex;
        stmts.push(new o.IfStmt(
            nodeIndexVar.equals(o.literal(node.nodeIndex)),
            [new o.ReturnStatement(node.embeddedView.classExpr.instantiate([
              ViewProperties.viewUtils, o.THIS_EXPR, o.literal(node.nodeIndex), node.renderNode,
              node.viewContainer
            ]))]));
      }
    }
  });
  if (stmts.length > 0) {
    stmts.push(new o.ReturnStatement(o.NULL_EXPR));
  }
  return new o.ClassMethod(
      'createEmbeddedViewInternal', [new o.FnParam(nodeIndexVar.name, o.NUMBER_TYPE)], stmts,
      o.importType(resolveIdentifier(Identifiers.AppView), [o.DYNAMIC_TYPE]));
}
