/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileDirectiveMetadata, CompilePipeSummary, CompileQueryMetadata, rendererTypeName, tokenReference, viewClassName} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {BindingForm, BuiltinConverter, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins, EventHandlerVars, LocalResolver} from '../compiler_util/expression_converter';
import {ArgumentType, BindingFlags, ChangeDetectionStrategy, NodeFlags, QueryBindingType, QueryValueType, ViewFlags} from '../core';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import {Identifiers} from '../identifiers';
import {LifecycleHooks} from '../lifecycle_reflector';
import {isNgContainer} from '../ml_parser/tags';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ParseSourceSpan} from '../parse_util';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, templateVisitAll, TextAst, VariableAst} from '../template_parser/template_ast';
import {OutputContext} from '../util';

import {componentFactoryResolverProviderDef, depDef, lifecycleHookToNodeFlag, providerDef} from './provider_compiler';

const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
const IMPLICIT_TEMPLATE_VAR = '$implicit';

export class ViewCompileResult {
  constructor(public viewClassVar: string, public rendererTypeVar: string) {}
}

export class ViewCompiler {
  constructor(private _reflector: CompileReflector) {}

  compileComponent(
      outputCtx: OutputContext, component: CompileDirectiveMetadata, template: TemplateAst[],
      styles: o.Expression, usedPipes: CompilePipeSummary[]): ViewCompileResult {
    let embeddedViewCount = 0;

    let renderComponentVarName: string = undefined!;
    if (!component.isHost) {
      const template = component.template !;
      const customRenderData: o.LiteralMapEntry[] = [];
      if (template.animations && template.animations.length) {
        customRenderData.push(new o.LiteralMapEntry(
            'animation', convertValueToOutputAst(outputCtx, template.animations), true));
      }

      const renderComponentVar = o.variable(rendererTypeName(component.type.reference));
      renderComponentVarName = renderComponentVar.name!;
      outputCtx.statements.push(
          renderComponentVar
              .set(o.importExpr(Identifiers.createRendererType2).callFn([new o.LiteralMapExpr([
                new o.LiteralMapEntry('encapsulation', o.literal(template.encapsulation), false),
                new o.LiteralMapEntry('styles', styles, false),
                new o.LiteralMapEntry('data', new o.LiteralMapExpr(customRenderData), false)
              ])]))
              .toDeclStmt(
                  o.importType(Identifiers.RendererType2),
                  [o.StmtModifier.Final, o.StmtModifier.Exported]));
    }

    const viewBuilderFactory = (parent: ViewBuilder|null): ViewBuilder => {
      const embeddedViewIndex = embeddedViewCount++;
      return new ViewBuilder(
          this._reflector, outputCtx, parent, component, embeddedViewIndex, usedPipes,
          viewBuilderFactory);
    };

    const visitor = viewBuilderFactory(null);
    visitor.visitAll([], template);

    outputCtx.statements.push(...visitor.build());

    return new ViewCompileResult(visitor.viewName, renderComponentVarName);
  }
}

interface ViewBuilderFactory {
  (parent: ViewBuilder): ViewBuilder;
}

interface UpdateExpression {
  context: o.Expression;
  nodeIndex: number;
  bindingIndex: number;
  sourceSpan: ParseSourceSpan;
  value: AST;
}

const LOG_VAR = o.variable('_l');
const VIEW_VAR = o.variable('_v');
const CHECK_VAR = o.variable('_ck');
const COMP_VAR = o.variable('_co');
const EVENT_NAME_VAR = o.variable('en');
const ALLOW_DEFAULT_VAR = o.variable(`ad`);

class ViewBuilder implements TemplateAstVisitor, LocalResolver {
  private compType: o.Type;
  private nodes: (() => {
    sourceSpan: ParseSourceSpan | null,
    nodeDef: o.Expression,
    nodeFlags: NodeFlags,
    updateDirectives?: UpdateExpression[],
    updateRenderer?: UpdateExpression[]
  })[] = [];
  private purePipeNodeIndices: {[pipeName: string]: number} = Object.create(null);
  // Need Object.create so that we don't have builtin values...
  private refNodeIndices: {[refName: string]: number} = Object.create(null);
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];

  public readonly viewName: string;

  constructor(
      private reflector: CompileReflector, private outputCtx: OutputContext,
      private parent: ViewBuilder|null, private component: CompileDirectiveMetadata,
      private embeddedViewIndex: number, private usedPipes: CompilePipeSummary[],
      private viewBuilderFactory: ViewBuilderFactory) {
    // TODO(tbosch): The old view compiler used to use an `any` type
    // for the context in any embedded view. We keep this behaivor for now
    // to be able to introduce the new view compiler without too many errors.
    this.compType = this.embeddedViewIndex > 0 ?
        o.DYNAMIC_TYPE :
        o.expressionType(outputCtx.importExpr(this.component.type.reference))!;
    this.viewName = viewClassName(this.component.type.reference, this.embeddedViewIndex);
  }

  visitAll(variables: VariableAst[], astNodes: TemplateAst[]) {
    this.variables = variables;
    // create the pipes for the pure pipes immediately, so that we know their indices.
    if (!this.parent) {
      this.usedPipes.forEach((pipe) => {
        if (pipe.pure) {
          this.purePipeNodeIndices[pipe.name] = this._createPipe(null, pipe);
        }
      });
    }

    if (!this.parent) {
      this.component.viewQueries.forEach((query, queryIndex) => {
        // Note: queries start with id 1 so we can use the number in a Bloom filter!
        const queryId = queryIndex + 1;
        const bindingType = query.first ? QueryBindingType.First : QueryBindingType.All;
        const flags = NodeFlags.TypeViewQuery | calcQueryFlags(query);
        this.nodes.push(() => ({
                          sourceSpan: null,
                          nodeFlags: flags,
                          nodeDef: o.importExpr(Identifiers.queryDef).callFn([
                            o.literal(flags), o.literal(queryId),
                            new o.LiteralMapExpr([new o.LiteralMapEntry(
                                query.propertyName, o.literal(bindingType), false)])
                          ])
                        }));
      });
    }
    templateVisitAll(this, astNodes);
    if (this.parent && (astNodes.length === 0 || needsAdditionalRootNode(astNodes))) {
      // if the view is an embedded view, then we need to add an additional root node in some cases
      this.nodes.push(() => ({
                        sourceSpan: null,
                        nodeFlags: NodeFlags.TypeElement,
                        nodeDef: o.importExpr(Identifiers.anchorDef).callFn([
                          o.literal(NodeFlags.None), o.NULL_EXPR, o.NULL_EXPR, o.literal(0)
                        ])
                      }));
    }
  }

  build(targetStatements: o.Statement[] = []): o.Statement[] {
    this.children.forEach((child) => child.build(targetStatements));

    const {updateRendererStmts, updateDirectivesStmts, nodeDefExprs} =
        this._createNodeExpressions();

    const updateRendererFn = this._createUpdateFn(updateRendererStmts);
    const updateDirectivesFn = this._createUpdateFn(updateDirectivesStmts);


    let viewFlags = ViewFlags.None;
    if (!this.parent && this.component.changeDetection === ChangeDetectionStrategy.OnPush) {
      viewFlags |= ViewFlags.OnPush;
    }
    const viewFactory = new o.DeclareFunctionStmt(
        this.viewName, [new o.FnParam(LOG_VAR.name!)],
        [new o.ReturnStatement(o.importExpr(Identifiers.viewDef).callFn([
          o.literal(viewFlags),
          o.literalArr(nodeDefExprs),
          updateDirectivesFn,
          updateRendererFn,
        ]))],
        o.importType(Identifiers.ViewDefinition),
        this.embeddedViewIndex === 0 ? [o.StmtModifier.Exported] : []);

    targetStatements.push(viewFactory);
    return targetStatements;
  }

  private _createUpdateFn(updateStmts: o.Statement[]): o.Expression {
    let updateFn: o.Expression;
    if (updateStmts.length > 0) {
      const preStmts: o.Statement[] = [];
      if (!this.component.isHost && o.findReadVarNames(updateStmts).has(COMP_VAR.name!)) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      updateFn = o.fn(
          [
            new o.FnParam(CHECK_VAR.name!, o.INFERRED_TYPE),
            new o.FnParam(VIEW_VAR.name!, o.INFERRED_TYPE)
          ],
          [...preStmts, ...updateStmts], o.INFERRED_TYPE);
    } else {
      updateFn = o.NULL_EXPR;
    }
    return updateFn;
  }

  visitNgContent(ast: NgContentAst, context: any): any {
    // ngContentDef(ngContentIndex: number, index: number): NodeDef;
    this.nodes.push(() => ({
                      sourceSpan: ast.sourceSpan,
                      nodeFlags: NodeFlags.TypeNgContent,
                      nodeDef: o.importExpr(Identifiers.ngContentDef)
                                   .callFn([o.literal(ast.ngContentIndex), o.literal(ast.index)])
                    }));
  }

  visitText(ast: TextAst, context: any): any {
    // Static text nodes have no check function
    const checkIndex = -1;
    this.nodes.push(() => ({
                      sourceSpan: ast.sourceSpan,
                      nodeFlags: NodeFlags.TypeText,
                      nodeDef: o.importExpr(Identifiers.textDef).callFn([
                        o.literal(checkIndex),
                        o.literal(ast.ngContentIndex),
                        o.literalArr([o.literal(ast.value)]),
                      ])
                    }));
  }

  visitBoundText(ast: BoundTextAst, context: any): any {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array
    this.nodes.push(null!);

    const astWithSource = <ASTWithSource>ast.value;
    const inter = <Interpolation>astWithSource.ast;

    const updateRendererExpressions = inter.expressions.map(
        (expr, bindingIndex) => this._preprocessUpdateExpression(
            {nodeIndex, bindingIndex, sourceSpan: ast.sourceSpan, context: COMP_VAR, value: expr}));

    // Check index is the same as the node index during compilation
    // They might only differ at runtime
    const checkIndex = nodeIndex;

    this.nodes[nodeIndex] = () => ({
      sourceSpan: ast.sourceSpan,
      nodeFlags: NodeFlags.TypeText,
      nodeDef: o.importExpr(Identifiers.textDef).callFn([
        o.literal(checkIndex),
        o.literal(ast.ngContentIndex),
        o.literalArr(inter.strings.map(s => o.literal(s))),
      ]),
      updateRenderer: updateRendererExpressions
    });
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array
    this.nodes.push(null!);

    const {flags, queryMatchesExpr, hostEvents} = this._visitElementOrTemplate(nodeIndex, ast);

    const childVisitor = this.viewBuilderFactory(this);
    this.children.push(childVisitor);
    childVisitor.visitAll(ast.variables, ast.children);

    const childCount = this.nodes.length - nodeIndex - 1;

    // anchorDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], ngContentIndex: number,
    //   childCount: number, handleEventFn?: ElementHandleEventFn, templateFactory?:
    //   ViewDefinitionFactory): NodeDef;
    this.nodes[nodeIndex] = () => ({
      sourceSpan: ast.sourceSpan,
      nodeFlags: NodeFlags.TypeElement | flags,
      nodeDef: o.importExpr(Identifiers.anchorDef).callFn([
        o.literal(flags),
        queryMatchesExpr,
        o.literal(ast.ngContentIndex),
        o.literal(childCount),
        this._createElementHandleEventFn(nodeIndex, hostEvents),
        o.variable(childVisitor.viewName),
      ])
    });
  }

  visitElement(ast: ElementAst, context: any): any {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodes.push(null!);

    // Using a null element name creates an anchor.
    const elName: string|null = isNgContainer(ast.name) ? null : ast.name;

    const {flags, usedEvents, queryMatchesExpr, hostBindings: dirHostBindings, hostEvents} =
        this._visitElementOrTemplate(nodeIndex, ast);

    let inputDefs: o.Expression[] = [];
    let updateRendererExpressions: UpdateExpression[] = [];
    let outputDefs: o.Expression[] = [];
    if (elName) {
      const hostBindings: any[] = ast.inputs
                                      .map((inputAst) => ({
                                             context: COMP_VAR as o.Expression,
                                             inputAst,
                                             dirAst: null as any,
                                           }))
                                      .concat(dirHostBindings);
      if (hostBindings.length) {
        updateRendererExpressions =
            hostBindings.map((hostBinding, bindingIndex) => this._preprocessUpdateExpression({
              context: hostBinding.context,
              nodeIndex,
              bindingIndex,
              sourceSpan: hostBinding.inputAst.sourceSpan,
              value: hostBinding.inputAst.value
            }));
        inputDefs = hostBindings.map(
            hostBinding => elementBindingDef(hostBinding.inputAst, hostBinding.dirAst));
      }
      outputDefs = usedEvents.map(
          ([target, eventName]) => o.literalArr([o.literal(target), o.literal(eventName)]));
    }

    templateVisitAll(this, ast.children);

    const childCount = this.nodes.length - nodeIndex - 1;

    const compAst = ast.directives.find(dirAst => dirAst.directive.isComponent);
    let compRendererType = o.NULL_EXPR as o.Expression;
    let compView = o.NULL_EXPR as o.Expression;
    if (compAst) {
      compView = this.outputCtx.importExpr(compAst.directive.componentViewType);
      compRendererType = this.outputCtx.importExpr(compAst.directive.rendererType);
    }

    // Check index is the same as the node index during compilation
    // They might only differ at runtime
    const checkIndex = nodeIndex;

    this.nodes[nodeIndex] = () => ({
      sourceSpan: ast.sourceSpan,
      nodeFlags: NodeFlags.TypeElement | flags,
      nodeDef: o.importExpr(Identifiers.elementDef).callFn([
        o.literal(checkIndex),
        o.literal(flags),
        queryMatchesExpr,
        o.literal(ast.ngContentIndex),
        o.literal(childCount),
        o.literal(elName),
        elName ? fixedAttrsDef(ast) : o.NULL_EXPR,
        inputDefs.length ? o.literalArr(inputDefs) : o.NULL_EXPR,
        outputDefs.length ? o.literalArr(outputDefs) : o.NULL_EXPR,
        this._createElementHandleEventFn(nodeIndex, hostEvents),
        compView,
        compRendererType,
      ]),
      updateRenderer: updateRendererExpressions
    });
  }

  private _visitElementOrTemplate(nodeIndex: number, ast: {
    hasViewContainer: boolean,
    outputs: BoundEventAst[],
    directives: DirectiveAst[],
    providers: ProviderAst[],
    references: ReferenceAst[],
    queryMatches: QueryMatch[]
  }): {
    flags: NodeFlags,
    usedEvents: [string|null, string][],
    queryMatchesExpr: o.Expression,
    hostBindings:
        {context: o.Expression, inputAst: BoundElementPropertyAst, dirAst: DirectiveAst}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst, dirAst: DirectiveAst}[],
  } {
    let flags = NodeFlags.None;
    if (ast.hasViewContainer) {
      flags |= NodeFlags.EmbeddedViews;
    }
    const usedEvents = new Map<string, [string | null, string]>();
    ast.outputs.forEach((event) => {
      const {name, target} = elementEventNameAndTarget(event, null);
      usedEvents.set(elementEventFullName(target, name), [target, name]);
    });
    ast.directives.forEach((dirAst) => {
      dirAst.hostEvents.forEach((event) => {
        const {name, target} = elementEventNameAndTarget(event, dirAst);
        usedEvents.set(elementEventFullName(target, name), [target, name]);
      });
    });
    const hostBindings:
        {context: o.Expression, inputAst: BoundElementPropertyAst, dirAst: DirectiveAst}[] = [];
    const hostEvents: {context: o.Expression, eventAst: BoundEventAst, dirAst: DirectiveAst}[] = [];
    this._visitComponentFactoryResolverProvider(ast.directives);

    ast.providers.forEach(providerAst => {
      let dirAst: DirectiveAst = undefined!;
      ast.directives.forEach(localDirAst => {
        if (localDirAst.directive.type.reference === tokenReference(providerAst.token)) {
          dirAst = localDirAst;
        }
      });
      if (dirAst) {
        const {hostBindings: dirHostBindings, hostEvents: dirHostEvents} =
            this._visitDirective(providerAst, dirAst, ast.references, ast.queryMatches, usedEvents);
        hostBindings.push(...dirHostBindings);
        hostEvents.push(...dirHostEvents);
      } else {
        this._visitProvider(providerAst, ast.queryMatches);
      }
    });

    let queryMatchExprs: o.Expression[] = [];
    ast.queryMatches.forEach((match) => {
      let valueType: QueryValueType = undefined!;
      if (tokenReference(match.value) ===
          this.reflector.resolveExternalReference(Identifiers.ElementRef)) {
        valueType = QueryValueType.ElementRef;
      } else if (
          tokenReference(match.value) ===
          this.reflector.resolveExternalReference(Identifiers.ViewContainerRef)) {
        valueType = QueryValueType.ViewContainerRef;
      } else if (
          tokenReference(match.value) ===
          this.reflector.resolveExternalReference(Identifiers.TemplateRef)) {
        valueType = QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(valueType)]));
      }
    });
    ast.references.forEach((ref) => {
      let valueType: QueryValueType = undefined!;
      if (!ref.value) {
        valueType = QueryValueType.RenderElement;
      } else if (
          tokenReference(ref.value) ===
          this.reflector.resolveExternalReference(Identifiers.TemplateRef)) {
        valueType = QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        this.refNodeIndices[ref.name] = nodeIndex;
        queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(valueType)]));
      }
    });
    ast.outputs.forEach((outputAst) => {
      hostEvents.push({context: COMP_VAR, eventAst: outputAst, dirAst: null!});
    });

    return {
      flags,
      usedEvents: Array.from(usedEvents.values()),
      queryMatchesExpr: queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
      hostBindings,
      hostEvents: hostEvents
    };
  }

  private _visitDirective(
      providerAst: ProviderAst, dirAst: DirectiveAst, refs: ReferenceAst[],
      queryMatches: QueryMatch[], usedEvents: Map<string, any>): {
    hostBindings:
        {context: o.Expression, inputAst: BoundElementPropertyAst, dirAst: DirectiveAst}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst, dirAst: DirectiveAst}[]
  } {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodes.push(null!);

    dirAst.directive.queries.forEach((query, queryIndex) => {
      const queryId = dirAst.contentQueryStartId + queryIndex;
      const flags = NodeFlags.TypeContentQuery | calcQueryFlags(query);
      const bindingType = query.first ? QueryBindingType.First : QueryBindingType.All;
      this.nodes.push(() => ({
                        sourceSpan: dirAst.sourceSpan,
                        nodeFlags: flags,
                        nodeDef: o.importExpr(Identifiers.queryDef).callFn([
                          o.literal(flags), o.literal(queryId),
                          new o.LiteralMapExpr([new o.LiteralMapEntry(
                              query.propertyName, o.literal(bindingType), false)])
                        ]),
                      }));
    });

    // Note: the operation below might also create new nodeDefs,
    // but we don't want them to be a child of a directive,
    // as they might be a provider/pipe on their own.
    // I.e. we only allow queries as children of directives nodes.
    const childCount = this.nodes.length - nodeIndex - 1;

    let {flags, queryMatchExprs, providerExpr, depsExpr} =
        this._visitProviderOrDirective(providerAst, queryMatches);

    refs.forEach((ref) => {
      if (ref.value && tokenReference(ref.value) === tokenReference(providerAst.token)) {
        this.refNodeIndices[ref.name] = nodeIndex;
        queryMatchExprs.push(
            o.literalArr([o.literal(ref.name), o.literal(QueryValueType.Provider)]));
      }
    });

    if (dirAst.directive.isComponent) {
      flags |= NodeFlags.Component;
    }

    const inputDefs = dirAst.inputs.map((inputAst, inputIndex) => {
      const mapValue = o.literalArr([o.literal(inputIndex), o.literal(inputAst.directiveName)]);
      // Note: it's important to not quote the key so that we can capture renames by minifiers!
      return new o.LiteralMapEntry(inputAst.directiveName, mapValue, false);
    });

    const outputDefs: o.LiteralMapEntry[] = [];
    const dirMeta = dirAst.directive;
    Object.keys(dirMeta.outputs).forEach((propName) => {
      const eventName = dirMeta.outputs[propName];
      if (usedEvents.has(eventName)) {
        // Note: it's important to not quote the key so that we can capture renames by minifiers!
        outputDefs.push(new o.LiteralMapEntry(propName, o.literal(eventName), false));
      }
    });
    let updateDirectiveExpressions: UpdateExpression[] = [];
    if (dirAst.inputs.length || (flags & (NodeFlags.DoCheck | NodeFlags.OnInit)) > 0) {
      updateDirectiveExpressions =
          dirAst.inputs.map((input, bindingIndex) => this._preprocessUpdateExpression({
            nodeIndex,
            bindingIndex,
            sourceSpan: input.sourceSpan,
            context: COMP_VAR,
            value: input.value
          }));
    }

    const dirContextExpr =
        o.importExpr(Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);
    const hostBindings = dirAst.hostProperties.map((inputAst) => ({
                                                     context: dirContextExpr,
                                                     dirAst,
                                                     inputAst,
                                                   }));
    const hostEvents = dirAst.hostEvents.map((hostEventAst) => ({
                                               context: dirContextExpr,
                                               eventAst: hostEventAst,
                                               dirAst,
                                             }));

    // Check index is the same as the node index during compilation
    // They might only differ at runtime
    const checkIndex = nodeIndex;

    this.nodes[nodeIndex] = () => ({
      sourceSpan: dirAst.sourceSpan,
      nodeFlags: NodeFlags.TypeDirective | flags,
      nodeDef: o.importExpr(Identifiers.directiveDef).callFn([
        o.literal(checkIndex),
        o.literal(flags),
        queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
        o.literal(childCount),
        providerExpr,
        depsExpr,
        inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
        outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR,
      ]),
      updateDirectives: updateDirectiveExpressions,
      directive: dirAst.directive.type,
    });

    return {hostBindings, hostEvents};
  }

  private _visitProvider(providerAst: ProviderAst, queryMatches: QueryMatch[]): void {
    this._addProviderNode(this._visitProviderOrDirective(providerAst, queryMatches));
  }

  private _visitComponentFactoryResolverProvider(directives: DirectiveAst[]) {
    const componentDirMeta = directives.find(dirAst => dirAst.directive.isComponent);
    if (componentDirMeta && componentDirMeta.directive.entryComponents.length) {
      const {providerExpr, depsExpr, flags, tokenExpr} = componentFactoryResolverProviderDef(
          this.reflector, this.outputCtx, NodeFlags.PrivateProvider,
          componentDirMeta.directive.entryComponents);
      this._addProviderNode({
        providerExpr,
        depsExpr,
        flags,
        tokenExpr,
        queryMatchExprs: [],
        sourceSpan: componentDirMeta.sourceSpan
      });
    }
  }

  private _addProviderNode(data: {
    flags: NodeFlags,
    queryMatchExprs: o.Expression[],
    providerExpr: o.Expression,
    depsExpr: o.Expression,
    tokenExpr: o.Expression,
    sourceSpan: ParseSourceSpan
  }) {
    // providerDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], token:any,
    //   value: any, deps: ([DepFlags, any] | any)[]): NodeDef;
    this.nodes.push(
        () => ({
          sourceSpan: data.sourceSpan,
          nodeFlags: data.flags,
          nodeDef: o.importExpr(Identifiers.providerDef).callFn([
            o.literal(data.flags),
            data.queryMatchExprs.length ? o.literalArr(data.queryMatchExprs) : o.NULL_EXPR,
            data.tokenExpr, data.providerExpr, data.depsExpr
          ])
        }));
  }

  private _visitProviderOrDirective(providerAst: ProviderAst, queryMatches: QueryMatch[]): {
    flags: NodeFlags,
    tokenExpr: o.Expression,
    sourceSpan: ParseSourceSpan,
    queryMatchExprs: o.Expression[],
    providerExpr: o.Expression,
    depsExpr: o.Expression
  } {
    let flags = NodeFlags.None;
    let queryMatchExprs: o.Expression[] = [];

    queryMatches.forEach((match) => {
      if (tokenReference(match.value) === tokenReference(providerAst.token)) {
        queryMatchExprs.push(
            o.literalArr([o.literal(match.queryId), o.literal(QueryValueType.Provider)]));
      }
    });
    const {providerExpr, depsExpr, flags: providerFlags, tokenExpr} =
        providerDef(this.outputCtx, providerAst);
    return {
      flags: flags | providerFlags,
      queryMatchExprs,
      providerExpr,
      depsExpr,
      tokenExpr,
      sourceSpan: providerAst.sourceSpan
    };
  }

  getLocal(name: string): o.Expression|null {
    if (name == EventHandlerVars.event.name) {
      return EventHandlerVars.event;
    }
    let currViewExpr: o.Expression = VIEW_VAR;
    for (let currBuilder: ViewBuilder|null = this; currBuilder; currBuilder = currBuilder.parent,
                          currViewExpr = currViewExpr.prop('parent').cast(o.DYNAMIC_TYPE)) {
      // check references
      const refNodeIndex = currBuilder.refNodeIndices[name];
      if (refNodeIndex != null) {
        return o.importExpr(Identifiers.nodeValue).callFn([currViewExpr, o.literal(refNodeIndex)]);
      }

      // check variables
      const varAst = currBuilder.variables.find((varAst) => varAst.name === name);
      if (varAst) {
        const varValue = varAst.value || IMPLICIT_TEMPLATE_VAR;
        return currViewExpr.prop('context').prop(varValue);
      }
    }
    return null;
  }

  notifyImplicitReceiverUse(): void {
    // Not needed in ViewEngine as ViewEngine walks through the generated
    // expressions to figure out if the implicit receiver is used and needs
    // to be generated as part of the pre-update statements.
  }

  maybeRestoreView(): void {
    // Not necessary in ViewEngine, because view restoration is an Ivy concept.
  }

  private _createLiteralArrayConverter(sourceSpan: ParseSourceSpan, argCount: number):
      BuiltinConverter {
    if (argCount === 0) {
      const valueExpr = o.importExpr(Identifiers.EMPTY_ARRAY);
      return () => valueExpr;
    }

    const checkIndex = this.nodes.length;

    this.nodes.push(() => ({
                      sourceSpan,
                      nodeFlags: NodeFlags.TypePureArray,
                      nodeDef: o.importExpr(Identifiers.pureArrayDef).callFn([
                        o.literal(checkIndex),
                        o.literal(argCount),
                      ])
                    }));

    return (args: o.Expression[]) => callCheckStmt(checkIndex, args);
  }

  private _createLiteralMapConverter(
      sourceSpan: ParseSourceSpan, keys: {key: string, quoted: boolean}[]): BuiltinConverter {
    if (keys.length === 0) {
      const valueExpr = o.importExpr(Identifiers.EMPTY_MAP);
      return () => valueExpr;
    }

    const map = o.literalMap(keys.map((e, i) => ({...e, value: o.literal(i)})));
    const checkIndex = this.nodes.length;
    this.nodes.push(() => ({
                      sourceSpan,
                      nodeFlags: NodeFlags.TypePureObject,
                      nodeDef: o.importExpr(Identifiers.pureObjectDef).callFn([
                        o.literal(checkIndex),
                        map,
                      ])
                    }));

    return (args: o.Expression[]) => callCheckStmt(checkIndex, args);
  }

  private _createPipeConverter(expression: UpdateExpression, name: string, argCount: number):
      BuiltinConverter {
    const pipe = this.usedPipes.find((pipeSummary) => pipeSummary.name === name)!;
    if (pipe.pure) {
      const checkIndex = this.nodes.length;
      this.nodes.push(() => ({
                        sourceSpan: expression.sourceSpan,
                        nodeFlags: NodeFlags.TypePurePipe,
                        nodeDef: o.importExpr(Identifiers.purePipeDef).callFn([
                          o.literal(checkIndex),
                          o.literal(argCount),
                        ])
                      }));

      // find underlying pipe in the component view
      let compViewExpr: o.Expression = VIEW_VAR;
      let compBuilder: ViewBuilder = this;
      while (compBuilder.parent) {
        compBuilder = compBuilder.parent;
        compViewExpr = compViewExpr.prop('parent').cast(o.DYNAMIC_TYPE);
      }
      const pipeNodeIndex = compBuilder.purePipeNodeIndices[name];
      const pipeValueExpr: o.Expression =
          o.importExpr(Identifiers.nodeValue).callFn([compViewExpr, o.literal(pipeNodeIndex)]);

      return (args: o.Expression[]) => callUnwrapValue(
                 expression.nodeIndex, expression.bindingIndex,
                 callCheckStmt(checkIndex, [pipeValueExpr].concat(args)));
    } else {
      const nodeIndex = this._createPipe(expression.sourceSpan, pipe);
      const nodeValueExpr =
          o.importExpr(Identifiers.nodeValue).callFn([VIEW_VAR, o.literal(nodeIndex)]);

      return (args: o.Expression[]) => callUnwrapValue(
                 expression.nodeIndex, expression.bindingIndex,
                 nodeValueExpr.callMethod('transform', args));
    }
  }

  private _createPipe(sourceSpan: ParseSourceSpan|null, pipe: CompilePipeSummary): number {
    const nodeIndex = this.nodes.length;
    let flags = NodeFlags.None;
    pipe.type.lifecycleHooks.forEach((lifecycleHook) => {
      // for pipes, we only support ngOnDestroy
      if (lifecycleHook === LifecycleHooks.OnDestroy) {
        flags |= lifecycleHookToNodeFlag(lifecycleHook);
      }
    });

    const depExprs = pipe.type.diDeps.map((diDep) => depDef(this.outputCtx, diDep));
    // function pipeDef(
    //   flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef
    this.nodes.push(
        () => ({
          sourceSpan,
          nodeFlags: NodeFlags.TypePipe,
          nodeDef: o.importExpr(Identifiers.pipeDef).callFn([
            o.literal(flags), this.outputCtx.importExpr(pipe.type.reference), o.literalArr(depExprs)
          ])
        }));
    return nodeIndex;
  }

  /**
   * For the AST in `UpdateExpression.value`:
   * - create nodes for pipes, literal arrays and, literal maps,
   * - update the AST to replace pipes, literal arrays and, literal maps with calls to check fn.
   *
   * WARNING: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
   */
  private _preprocessUpdateExpression(expression: UpdateExpression): UpdateExpression {
    return {
      nodeIndex: expression.nodeIndex,
      bindingIndex: expression.bindingIndex,
      sourceSpan: expression.sourceSpan,
      context: expression.context,
      value: convertPropertyBindingBuiltins(
          {
            createLiteralArrayConverter: (argCount: number) =>
                this._createLiteralArrayConverter(expression.sourceSpan, argCount),
            createLiteralMapConverter: (keys: {key: string, quoted: boolean}[]) =>
                this._createLiteralMapConverter(expression.sourceSpan, keys),
            createPipeConverter: (name: string, argCount: number) =>
                this._createPipeConverter(expression, name, argCount)
          },
          expression.value)
    };
  }

  private _createNodeExpressions(): {
    updateRendererStmts: o.Statement[],
    updateDirectivesStmts: o.Statement[],
    nodeDefExprs: o.Expression[]
  } {
    const self = this;
    let updateBindingCount = 0;
    const updateRendererStmts: o.Statement[] = [];
    const updateDirectivesStmts: o.Statement[] = [];
    const nodeDefExprs = this.nodes.map((factory, nodeIndex) => {
      const {nodeDef, nodeFlags, updateDirectives, updateRenderer, sourceSpan} = factory();
      if (updateRenderer) {
        updateRendererStmts.push(
            ...createUpdateStatements(nodeIndex, sourceSpan, updateRenderer, false));
      }
      if (updateDirectives) {
        updateDirectivesStmts.push(...createUpdateStatements(
            nodeIndex, sourceSpan, updateDirectives,
            (nodeFlags & (NodeFlags.DoCheck | NodeFlags.OnInit)) > 0));
      }
      // We use a comma expression to call the log function before
      // the nodeDef function, but still use the result of the nodeDef function
      // as the value.
      // Note: We only add the logger to elements / text nodes,
      // so we don't generate too much code.
      const logWithNodeDef = nodeFlags & NodeFlags.CatRenderNode ?
          new o.CommaExpr([LOG_VAR.callFn([]).callFn([]), nodeDef]) :
          nodeDef;
      return o.applySourceSpanToExpressionIfNeeded(logWithNodeDef, sourceSpan);
    });
    return {updateRendererStmts, updateDirectivesStmts, nodeDefExprs};

    function createUpdateStatements(
        nodeIndex: number, sourceSpan: ParseSourceSpan|null, expressions: UpdateExpression[],
        allowEmptyExprs: boolean): o.Statement[] {
      const updateStmts: o.Statement[] = [];
      const exprs = expressions.map(({sourceSpan, context, value}) => {
        const bindingId = `${updateBindingCount++}`;
        const nameResolver = context === COMP_VAR ? self : null;
        const {stmts, currValExpr} =
            convertPropertyBinding(nameResolver, context, value, bindingId, BindingForm.General);
        updateStmts.push(...stmts.map(
            (stmt: o.Statement) => o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan)));
        return o.applySourceSpanToExpressionIfNeeded(currValExpr, sourceSpan);
      });
      if (expressions.length || allowEmptyExprs) {
        updateStmts.push(o.applySourceSpanToStatementIfNeeded(
            callCheckStmt(nodeIndex, exprs).toStmt(), sourceSpan));
      }
      return updateStmts;
    }
  }

  private _createElementHandleEventFn(
      nodeIndex: number,
      handlers: {context: o.Expression, eventAst: BoundEventAst, dirAst: DirectiveAst}[]) {
    const handleEventStmts: o.Statement[] = [];
    let handleEventBindingCount = 0;
    handlers.forEach(({context, eventAst, dirAst}) => {
      const bindingId = `${handleEventBindingCount++}`;
      const nameResolver = context === COMP_VAR ? this : null;
      const {stmts, allowDefault} =
          convertActionBinding(nameResolver, context, eventAst.handler, bindingId);
      const trueStmts = stmts;
      if (allowDefault) {
        trueStmts.push(ALLOW_DEFAULT_VAR.set(allowDefault.and(ALLOW_DEFAULT_VAR)).toStmt());
      }
      const {target: eventTarget, name: eventName} = elementEventNameAndTarget(eventAst, dirAst);
      const fullEventName = elementEventFullName(eventTarget, eventName);
      handleEventStmts.push(o.applySourceSpanToStatementIfNeeded(
          new o.IfStmt(o.literal(fullEventName).identical(EVENT_NAME_VAR), trueStmts),
          eventAst.sourceSpan));
    });
    let handleEventFn: o.Expression;
    if (handleEventStmts.length > 0) {
      const preStmts: o.Statement[] =
          [ALLOW_DEFAULT_VAR.set(o.literal(true)).toDeclStmt(o.BOOL_TYPE)];
      if (!this.component.isHost && o.findReadVarNames(handleEventStmts).has(COMP_VAR.name!)) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      handleEventFn = o.fn(
          [
            new o.FnParam(VIEW_VAR.name!, o.INFERRED_TYPE),
            new o.FnParam(EVENT_NAME_VAR.name!, o.INFERRED_TYPE),
            new o.FnParam(EventHandlerVars.event.name!, o.INFERRED_TYPE)
          ],
          [...preStmts, ...handleEventStmts, new o.ReturnStatement(ALLOW_DEFAULT_VAR)],
          o.INFERRED_TYPE);
    } else {
      handleEventFn = o.NULL_EXPR;
    }
    return handleEventFn;
  }

  visitDirective(ast: DirectiveAst, context: {usedEvents: Set<string>}): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}
  visitReference(ast: ReferenceAst, context: any): any {}
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
}

function needsAdditionalRootNode(astNodes: TemplateAst[]): boolean {
  const lastAstNode = astNodes[astNodes.length - 1];
  if (lastAstNode instanceof EmbeddedTemplateAst) {
    return lastAstNode.hasViewContainer;
  }

  if (lastAstNode instanceof ElementAst) {
    if (isNgContainer(lastAstNode.name) && lastAstNode.children.length) {
      return needsAdditionalRootNode(lastAstNode.children);
    }
    return lastAstNode.hasViewContainer;
  }

  return lastAstNode instanceof NgContentAst;
}


function elementBindingDef(inputAst: BoundElementPropertyAst, dirAst: DirectiveAst): o.Expression {
  const inputType = inputAst.type;
  switch (inputType) {
    case PropertyBindingType.Attribute:
      return o.literalArr([
        o.literal(BindingFlags.TypeElementAttribute), o.literal(inputAst.name),
        o.literal(inputAst.securityContext)
      ]);
    case PropertyBindingType.Property:
      return o.literalArr([
        o.literal(BindingFlags.TypeProperty), o.literal(inputAst.name),
        o.literal(inputAst.securityContext)
      ]);
    case PropertyBindingType.Animation:
      const bindingType = BindingFlags.TypeProperty |
          (dirAst && dirAst.directive.isComponent ? BindingFlags.SyntheticHostProperty :
                                                    BindingFlags.SyntheticProperty);
      return o.literalArr([
        o.literal(bindingType), o.literal('@' + inputAst.name), o.literal(inputAst.securityContext)
      ]);
    case PropertyBindingType.Class:
      return o.literalArr(
          [o.literal(BindingFlags.TypeElementClass), o.literal(inputAst.name), o.NULL_EXPR]);
    case PropertyBindingType.Style:
      return o.literalArr([
        o.literal(BindingFlags.TypeElementStyle), o.literal(inputAst.name), o.literal(inputAst.unit)
      ]);
    default:
      // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
      // However Closure Compiler does not understand that and reports an error in typed mode.
      // The `throw new Error` below works around the problem, and the unexpected: never variable
      // makes sure tsc still checks this code is unreachable.
      const unexpected: never = inputType;
      throw new Error(`unexpected ${unexpected}`);
  }
}


function fixedAttrsDef(elementAst: ElementAst): o.Expression {
  const mapResult: {[key: string]: string} = Object.create(null);
  elementAst.attrs.forEach(attrAst => {
    mapResult[attrAst.name] = attrAst.value;
  });
  elementAst.directives.forEach(dirAst => {
    Object.keys(dirAst.directive.hostAttributes).forEach(name => {
      const value = dirAst.directive.hostAttributes[name];
      const prevValue = mapResult[name];
      mapResult[name] = prevValue != null ? mergeAttributeValue(name, prevValue, value) : value;
    });
  });
  // Note: We need to sort to get a defined output order
  // for tests and for caching generated artifacts...
  return o.literalArr(Object.keys(mapResult).sort().map(
      (attrName) => o.literalArr([o.literal(attrName), o.literal(mapResult[attrName])])));
}

function mergeAttributeValue(attrName: string, attrValue1: string, attrValue2: string): string {
  if (attrName == CLASS_ATTR || attrName == STYLE_ATTR) {
    return `${attrValue1} ${attrValue2}`;
  } else {
    return attrValue2;
  }
}

function callCheckStmt(nodeIndex: number, exprs: o.Expression[]): o.Expression {
  if (exprs.length > 10) {
    return CHECK_VAR.callFn(
        [VIEW_VAR, o.literal(nodeIndex), o.literal(ArgumentType.Dynamic), o.literalArr(exprs)]);
  } else {
    return CHECK_VAR.callFn(
        [VIEW_VAR, o.literal(nodeIndex), o.literal(ArgumentType.Inline), ...exprs]);
  }
}

function callUnwrapValue(nodeIndex: number, bindingIdx: number, expr: o.Expression): o.Expression {
  return o.importExpr(Identifiers.unwrapValue).callFn([
    VIEW_VAR, o.literal(nodeIndex), o.literal(bindingIdx), expr
  ]);
}

function elementEventNameAndTarget(
    eventAst: BoundEventAst, dirAst: DirectiveAst|null): {name: string, target: string|null} {
  if (eventAst.isAnimation) {
    return {
      name: `@${eventAst.name}.${eventAst.phase}`,
      target: dirAst && dirAst.directive.isComponent ? 'component' : null
    };
  } else {
    return eventAst;
  }
}

function calcQueryFlags(query: CompileQueryMetadata) {
  let flags = NodeFlags.None;
  // Note: We only make queries static that query for a single item and the user specifically
  // set the to be static. This is because of backwards compatibility with the old view compiler...
  if (query.first && query.static) {
    flags |= NodeFlags.StaticQuery;
  } else {
    flags |= NodeFlags.DynamicQuery;
  }
  if (query.emitDistinctChangesOnly) {
    flags |= NodeFlags.EmitDistinctChangesOnly;
  }
  return flags;
}

export function elementEventFullName(target: string|null, name: string): string {
  return target ? `${target}:${name}` : name;
}
