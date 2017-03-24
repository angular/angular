/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy, ɵArgumentType as ArgumentType, ɵBindingFlags as BindingFlags, ɵDepFlags as DepFlags, ɵLifecycleHooks as LifecycleHooks, ɵNodeFlags as NodeFlags, ɵQueryBindingType as QueryBindingType, ɵQueryValueType as QueryValueType, ɵViewFlags as ViewFlags, ɵelementEventFullName as elementEventFullName} from '@angular/core';

import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompilePipeSummary, CompileProviderMetadata, CompileTokenMetadata, CompileTypeMetadata, rendererTypeName, tokenReference, viewClassName} from '../compile_metadata';
import {BuiltinConverter, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {CompilerConfig} from '../config';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import {Identifiers, createIdentifier, createIdentifierToken, resolveIdentifier} from '../identifiers';
import {CompilerInjectable} from '../injectable';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ParseSourceSpan} from '../parse_util';
import {ElementSchemaRegistry} from '../schema/element_schema_registry';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, ProviderAstType, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';

const CLASS_ATTR = 'class';
const STYLE_ATTR = 'style';
const IMPLICIT_TEMPLATE_VAR = '\$implicit';
const NG_CONTAINER_TAG = 'ng-container';

export class ViewCompileResult {
  constructor(
      public statements: o.Statement[], public viewClassVar: string,
      public rendererTypeVar: string) {}
}

@CompilerInjectable()
export class ViewCompiler {
  constructor(
      private _genConfigNext: CompilerConfig, private _schemaRegistry: ElementSchemaRegistry) {}

  compileComponent(
      component: CompileDirectiveMetadata, template: TemplateAst[], styles: o.Expression,
      usedPipes: CompilePipeSummary[]): ViewCompileResult {
    let embeddedViewCount = 0;
    const staticQueryIds = findStaticQueryIds(template);

    const statements: o.Statement[] = [];

    let renderComponentVarName: string = undefined !;
    if (!component.isHost) {
      const template = component.template !;
      const customRenderData: o.LiteralMapEntry[] = [];
      if (template.animations && template.animations.length) {
        customRenderData.push(
            new o.LiteralMapEntry('animation', convertValueToOutputAst(template.animations), true));
      }

      const renderComponentVar = o.variable(rendererTypeName(component.type.reference));
      renderComponentVarName = renderComponentVar.name !;
      statements.push(
          renderComponentVar
              .set(o.importExpr(createIdentifier(Identifiers.createRendererType2))
                       .callFn([new o.LiteralMapExpr([
                         new o.LiteralMapEntry('encapsulation', o.literal(template.encapsulation)),
                         new o.LiteralMapEntry('styles', styles),
                         new o.LiteralMapEntry('data', new o.LiteralMapExpr(customRenderData))
                       ])]))
              .toDeclStmt(
                  o.importType(createIdentifier(Identifiers.RendererType2)),
                  [o.StmtModifier.Final]));
    }

    const viewBuilderFactory = (parent: ViewBuilder | null): ViewBuilder => {
      const embeddedViewIndex = embeddedViewCount++;
      return new ViewBuilder(
          parent, component, embeddedViewIndex, usedPipes, staticQueryIds, viewBuilderFactory);
    };

    const visitor = viewBuilderFactory(null);
    visitor.visitAll([], template);

    statements.push(...visitor.build());

    return new ViewCompileResult(statements, visitor.viewName, renderComponentVarName);
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

const LOG_VAR = o.variable('l');
const VIEW_VAR = o.variable('v');
const CHECK_VAR = o.variable('ck');
const COMP_VAR = o.variable('co');
const EVENT_NAME_VAR = o.variable('en');
const ALLOW_DEFAULT_VAR = o.variable(`ad`);

class ViewBuilder implements TemplateAstVisitor, LocalResolver {
  private compType: o.Type;
  private nodes: (() => {
    sourceSpan: ParseSourceSpan | null,
    nodeDef: o.Expression,
    nodeFlags: NodeFlags, updateDirectives?: UpdateExpression[], updateRenderer?: UpdateExpression[]
  })[] = [];
  private purePipeNodeIndices: {[pipeName: string]: number} = Object.create(null);
  // Need Object.create so that we don't have builtin values...
  private refNodeIndices: {[refName: string]: number} = Object.create(null);
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];

  constructor(
      private parent: ViewBuilder|null, private component: CompileDirectiveMetadata,
      private embeddedViewIndex: number, private usedPipes: CompilePipeSummary[],
      private staticQueryIds: Map<TemplateAst, StaticAndDynamicQueryIds>,
      private viewBuilderFactory: ViewBuilderFactory) {
    // TODO(tbosch): The old view compiler used to use an `any` type
    // for the context in any embedded view. We keep this behaivor for now
    // to be able to introduce the new view compiler without too many errors.
    this.compType =
        this.embeddedViewIndex > 0 ? o.DYNAMIC_TYPE : o.importType(this.component.type) !;
  }

  get viewName(): string {
    return viewClassName(this.component.type.reference, this.embeddedViewIndex);
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
      const queryIds = staticViewQueryIds(this.staticQueryIds);
      this.component.viewQueries.forEach((query, queryIndex) => {
        // Note: queries start with id 1 so we can use the number in a Bloom filter!
        const queryId = queryIndex + 1;
        const bindingType = query.first ? QueryBindingType.First : QueryBindingType.All;
        const flags =
            NodeFlags.TypeViewQuery | calcStaticDynamicQueryFlags(queryIds, queryId, query.first);
        this.nodes.push(() => ({
                          sourceSpan: null,
                          nodeFlags: flags,
                          nodeDef: o.importExpr(createIdentifier(Identifiers.queryDef)).callFn([
                            o.literal(flags), o.literal(queryId),
                            new o.LiteralMapExpr(
                                [new o.LiteralMapEntry(query.propertyName, o.literal(bindingType))])
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
                        nodeDef: o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
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
        this.viewName, [new o.FnParam(LOG_VAR.name !)],
        [new o.ReturnStatement(o.importExpr(createIdentifier(Identifiers.viewDef)).callFn([
          o.literal(viewFlags),
          o.literalArr(nodeDefExprs),
          updateDirectivesFn,
          updateRendererFn,
        ]))],
        o.importType(createIdentifier(Identifiers.ViewDefinition)));

    targetStatements.push(viewFactory);
    return targetStatements;
  }

  private _createUpdateFn(updateStmts: o.Statement[]): o.Expression {
    let updateFn: o.Expression;
    if (updateStmts.length > 0) {
      const preStmts: o.Statement[] = [];
      if (!this.component.isHost && o.findReadVarNames(updateStmts).has(COMP_VAR.name !)) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      updateFn = o.fn(
          [
            new o.FnParam(CHECK_VAR.name !, o.INFERRED_TYPE),
            new o.FnParam(VIEW_VAR.name !, o.INFERRED_TYPE)
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
                      nodeDef: o.importExpr(createIdentifier(Identifiers.ngContentDef)).callFn([
                        o.literal(ast.ngContentIndex), o.literal(ast.index)
                      ])
                    }));
  }

  visitText(ast: TextAst, context: any): any {
    // textDef(ngContentIndex: number, constants: string[]): NodeDef;
    this.nodes.push(() => ({
                      sourceSpan: ast.sourceSpan,
                      nodeFlags: NodeFlags.TypeText,
                      nodeDef: o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
                        o.literal(ast.ngContentIndex), o.literalArr([o.literal(ast.value)])
                      ])
                    }));
  }

  visitBoundText(ast: BoundTextAst, context: any): any {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array
    this.nodes.push(null !);

    const astWithSource = <ASTWithSource>ast.value;
    const inter = <Interpolation>astWithSource.ast;

    const updateRendererExpressions = inter.expressions.map(
        (expr, bindingIndex) => this._preprocessUpdateExpression(
            {nodeIndex, bindingIndex, sourceSpan: ast.sourceSpan, context: COMP_VAR, value: expr}));

    // textDef(ngContentIndex: number, constants: string[]): NodeDef;
    this.nodes[nodeIndex] = () => ({
      sourceSpan: ast.sourceSpan,
      nodeFlags: NodeFlags.TypeText,
      nodeDef: o.importExpr(createIdentifier(Identifiers.textDef)).callFn([
        o.literal(ast.ngContentIndex), o.literalArr(inter.strings.map(s => o.literal(s)))
      ]),
      updateRenderer: updateRendererExpressions
    });
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array
    this.nodes.push(null !);

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
      nodeDef: o.importExpr(createIdentifier(Identifiers.anchorDef)).callFn([
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
    this.nodes.push(null !);

    let elName: string|null = ast.name;
    if (ast.name === NG_CONTAINER_TAG) {
      // Using a null element name creates an anchor.
      elName = null;
    }

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
    let compRendererType = o.NULL_EXPR;
    let compView = o.NULL_EXPR;
    if (compAst) {
      compView = o.importExpr({reference: compAst.directive.componentViewType});
      compRendererType = o.importExpr({reference: compAst.directive.rendererType});
    }

    // elementDef(
    //   flags: NodeFlags, matchedQueriesDsl: [string | number, QueryValueType][],
    //   ngContentIndex: number, childCount: number, namespaceAndName: string,
    //   fixedAttrs: [string, string][] = [],
    //   bindings?: [BindingFlags, string, string | SecurityContext][],
    //   outputs?: ([OutputType.ElementOutput | OutputType.DirectiveHostOutput, string, string])[],
    //   handleEvent?: ElementHandleEventFn,
    //   componentView?: () => ViewDefinition, componentRendererType?: RendererType2): NodeDef;
    this.nodes[nodeIndex] = () => ({
      sourceSpan: ast.sourceSpan,
      nodeFlags: NodeFlags.TypeElement | flags,
      nodeDef: o.importExpr(createIdentifier(Identifiers.elementDef)).callFn([
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
    usedEvents: [string | null, string][],
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
    const componentFactoryResolverProvider = createComponentFactoryResolver(ast.directives);
    if (componentFactoryResolverProvider) {
      this._visitProvider(componentFactoryResolverProvider, ast.queryMatches);
    }

    ast.providers.forEach((providerAst, providerIndex) => {
      let dirAst: DirectiveAst = undefined !;
      let dirIndex: number = undefined !;
      ast.directives.forEach((localDirAst, i) => {
        if (localDirAst.directive.type.reference === tokenReference(providerAst.token)) {
          dirAst = localDirAst;
          dirIndex = i;
        }
      });
      if (dirAst) {
        const {hostBindings: dirHostBindings, hostEvents: dirHostEvents} = this._visitDirective(
            providerAst, dirAst, dirIndex, nodeIndex, ast.references, ast.queryMatches, usedEvents,
            this.staticQueryIds.get(<any>ast) !);
        hostBindings.push(...dirHostBindings);
        hostEvents.push(...dirHostEvents);
      } else {
        this._visitProvider(providerAst, ast.queryMatches);
      }
    });

    let queryMatchExprs: o.Expression[] = [];
    ast.queryMatches.forEach((match) => {
      let valueType: QueryValueType = undefined !;
      if (tokenReference(match.value) === resolveIdentifier(Identifiers.ElementRef)) {
        valueType = QueryValueType.ElementRef;
      } else if (tokenReference(match.value) === resolveIdentifier(Identifiers.ViewContainerRef)) {
        valueType = QueryValueType.ViewContainerRef;
      } else if (tokenReference(match.value) === resolveIdentifier(Identifiers.TemplateRef)) {
        valueType = QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        queryMatchExprs.push(o.literalArr([o.literal(match.queryId), o.literal(valueType)]));
      }
    });
    ast.references.forEach((ref) => {
      let valueType: QueryValueType = undefined !;
      if (!ref.value) {
        valueType = QueryValueType.RenderElement;
      } else if (tokenReference(ref.value) === resolveIdentifier(Identifiers.TemplateRef)) {
        valueType = QueryValueType.TemplateRef;
      }
      if (valueType != null) {
        this.refNodeIndices[ref.name] = nodeIndex;
        queryMatchExprs.push(o.literalArr([o.literal(ref.name), o.literal(valueType)]));
      }
    });
    ast.outputs.forEach((outputAst) => {
      hostEvents.push({context: COMP_VAR, eventAst: outputAst, dirAst: null !});
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
      providerAst: ProviderAst, dirAst: DirectiveAst, directiveIndex: number,
      elementNodeIndex: number, refs: ReferenceAst[], queryMatches: QueryMatch[],
      usedEvents: Map<string, any>, queryIds: StaticAndDynamicQueryIds): {
    hostBindings:
        {context: o.Expression, inputAst: BoundElementPropertyAst, dirAst: DirectiveAst}[],
    hostEvents: {context: o.Expression, eventAst: BoundEventAst, dirAst: DirectiveAst}[]
  } {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodes.push(null !);

    dirAst.directive.queries.forEach((query, queryIndex) => {
      const queryId = dirAst.contentQueryStartId + queryIndex;
      const flags =
          NodeFlags.TypeContentQuery | calcStaticDynamicQueryFlags(queryIds, queryId, query.first);
      const bindingType = query.first ? QueryBindingType.First : QueryBindingType.All;
      this.nodes.push(() => ({
                        sourceSpan: dirAst.sourceSpan,
                        nodeFlags: flags,
                        nodeDef: o.importExpr(createIdentifier(Identifiers.queryDef)).callFn([
                          o.literal(flags), o.literal(queryId),
                          new o.LiteralMapExpr(
                              [new o.LiteralMapEntry(query.propertyName, o.literal(bindingType))])
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

    const dirContextExpr = o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
      VIEW_VAR, o.literal(nodeIndex)
    ]);
    const hostBindings = dirAst.hostProperties.map((inputAst) => ({
                                                     context: dirContextExpr,
                                                     dirAst,
                                                     inputAst,
                                                   }));
    const hostEvents = dirAst.hostEvents.map((hostEventAst) => ({
                                               context: dirContextExpr,
                                               eventAst: hostEventAst, dirAst,
                                             }));


    // directiveDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], childCount: number, ctor:
    //   any,
    //   deps: ([DepFlags, any] | any)[], props?: {[name: string]: [number, string]},
    //   outputs?: {[name: string]: string}, component?: () => ViewDefinition): NodeDef;
    this.nodes[nodeIndex] = () => ({
      sourceSpan: dirAst.sourceSpan,
      nodeFlags: NodeFlags.TypeDirective | flags,
      nodeDef: o.importExpr(createIdentifier(Identifiers.directiveDef)).callFn([
        o.literal(flags), queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
        o.literal(childCount), providerExpr, depsExpr,
        inputDefs.length ? new o.LiteralMapExpr(inputDefs) : o.NULL_EXPR,
        outputDefs.length ? new o.LiteralMapExpr(outputDefs) : o.NULL_EXPR
      ]),
      updateDirectives: updateDirectiveExpressions,
      directive: dirAst.directive.type,
    });

    return {hostBindings, hostEvents};
  }

  private _visitProvider(providerAst: ProviderAst, queryMatches: QueryMatch[]): void {
    const nodeIndex = this.nodes.length;
    // reserve the space in the nodeDefs array so we can add children
    this.nodes.push(null !);

    const {flags, queryMatchExprs, providerExpr, depsExpr} =
        this._visitProviderOrDirective(providerAst, queryMatches);

    // providerDef(
    //   flags: NodeFlags, matchedQueries: [string, QueryValueType][], token:any,
    //   value: any, deps: ([DepFlags, any] | any)[]): NodeDef;
    this.nodes[nodeIndex] = () => ({
      sourceSpan: providerAst.sourceSpan,
      nodeFlags: flags,
      nodeDef: o.importExpr(createIdentifier(Identifiers.providerDef)).callFn([
        o.literal(flags), queryMatchExprs.length ? o.literalArr(queryMatchExprs) : o.NULL_EXPR,
        tokenExpr(providerAst.token), providerExpr, depsExpr
      ])
    });
  }

  private _visitProviderOrDirective(providerAst: ProviderAst, queryMatches: QueryMatch[]): {
    flags: NodeFlags,
    queryMatchExprs: o.Expression[],
    providerExpr: o.Expression,
    depsExpr: o.Expression
  } {
    let flags = NodeFlags.None;
    if (!providerAst.eager) {
      flags |= NodeFlags.LazyProvider;
    }
    if (providerAst.providerType === ProviderAstType.PrivateService) {
      flags |= NodeFlags.PrivateProvider;
    }
    providerAst.lifecycleHooks.forEach((lifecycleHook) => {
      // for regular providers, we only support ngOnDestroy
      if (lifecycleHook === LifecycleHooks.OnDestroy ||
          providerAst.providerType === ProviderAstType.Directive ||
          providerAst.providerType === ProviderAstType.Component) {
        flags |= lifecycleHookToNodeFlag(lifecycleHook);
      }
    });
    let queryMatchExprs: o.Expression[] = [];

    queryMatches.forEach((match) => {
      if (tokenReference(match.value) === tokenReference(providerAst.token)) {
        queryMatchExprs.push(
            o.literalArr([o.literal(match.queryId), o.literal(QueryValueType.Provider)]));
      }
    });
    const {providerExpr, depsExpr, flags: providerType} = providerDef(providerAst);
    return {flags: flags | providerType, queryMatchExprs, providerExpr, depsExpr};
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
        return o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
          currViewExpr, o.literal(refNodeIndex)
        ]);
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

  createLiteralArrayConverter(sourceSpan: ParseSourceSpan, argCount: number): BuiltinConverter {
    if (argCount === 0) {
      const valueExpr = o.importExpr(createIdentifier(Identifiers.EMPTY_ARRAY));
      return () => valueExpr;
    }

    const nodeIndex = this.nodes.length;
    // pureArrayDef(argCount: number): NodeDef;
    this.nodes.push(
        () => ({
          sourceSpan,
          nodeFlags: NodeFlags.TypePureArray,
          nodeDef:
              o.importExpr(createIdentifier(Identifiers.pureArrayDef)).callFn([o.literal(argCount)])
        }));

    return (args: o.Expression[]) => callCheckStmt(nodeIndex, args);
  }
  createLiteralMapConverter(sourceSpan: ParseSourceSpan, keys: string[]): BuiltinConverter {
    if (keys.length === 0) {
      const valueExpr = o.importExpr(createIdentifier(Identifiers.EMPTY_MAP));
      return () => valueExpr;
    }

    const nodeIndex = this.nodes.length;
    // function pureObjectDef(propertyNames: string[]): NodeDef
    this.nodes.push(() => ({
                      sourceSpan,
                      nodeFlags: NodeFlags.TypePureObject,
                      nodeDef: o.importExpr(createIdentifier(Identifiers.pureObjectDef))
                                   .callFn([o.literalArr(keys.map(key => o.literal(key)))])
                    }));

    return (args: o.Expression[]) => callCheckStmt(nodeIndex, args);
  }
  createPipeConverter(expression: UpdateExpression, name: string, argCount: number):
      BuiltinConverter {
    const pipe = this.usedPipes.find((pipeSummary) => pipeSummary.name === name) !;
    if (pipe.pure) {
      const nodeIndex = this.nodes.length;
      // function purePipeDef(argCount: number): NodeDef;
      this.nodes.push(() => ({
                        sourceSpan: expression.sourceSpan,
                        nodeFlags: NodeFlags.TypePurePipe,
                        nodeDef: o.importExpr(createIdentifier(Identifiers.purePipeDef))
                                     .callFn([o.literal(argCount)])
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
          o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
            compViewExpr, o.literal(pipeNodeIndex)
          ]);

      return (args: o.Expression[]) => callUnwrapValue(
                 expression.nodeIndex, expression.bindingIndex,
                 callCheckStmt(nodeIndex, [pipeValueExpr].concat(args)));
    } else {
      const nodeIndex = this._createPipe(expression.sourceSpan, pipe);
      const nodeValueExpr = o.importExpr(createIdentifier(Identifiers.nodeValue)).callFn([
        VIEW_VAR, o.literal(nodeIndex)
      ]);

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

    const depExprs = pipe.type.diDeps.map(depDef);
    // function pipeDef(
    //   flags: NodeFlags, ctor: any, deps: ([DepFlags, any] | any)[]): NodeDef
    this.nodes.push(() => ({
                      sourceSpan,
                      nodeFlags: NodeFlags.TypePipe,
                      nodeDef: o.importExpr(createIdentifier(Identifiers.pipeDef)).callFn([
                        o.literal(flags), o.importExpr(pipe.type), o.literalArr(depExprs)
                      ])
                    }));
    return nodeIndex;
  }

  // Attention: This might create new nodeDefs (for pipes and literal arrays and literal maps)!
  private _preprocessUpdateExpression(expression: UpdateExpression): UpdateExpression {
    return {
      nodeIndex: expression.nodeIndex,
      bindingIndex: expression.bindingIndex,
      sourceSpan: expression.sourceSpan,
      context: expression.context,
      value: convertPropertyBindingBuiltins(
          {
            createLiteralArrayConverter: (argCount: number) => this.createLiteralArrayConverter(
                                             expression.sourceSpan, argCount),
            createLiteralMapConverter:
                (keys: string[]) => this.createLiteralMapConverter(expression.sourceSpan, keys),
            createPipeConverter: (name: string, argCount: number) =>
                                     this.createPipeConverter(expression, name, argCount)
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
        nodeIndex: number, sourceSpan: ParseSourceSpan | null, expressions: UpdateExpression[],
        allowEmptyExprs: boolean): o.Statement[] {
      const updateStmts: o.Statement[] = [];
      const exprs = expressions.map(({sourceSpan, context, value}) => {
        const bindingId = `${updateBindingCount++}`;
        const nameResolver = context === COMP_VAR ? self : null;
        const {stmts, currValExpr} =
            convertPropertyBinding(nameResolver, context, value, bindingId);
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
      if (!this.component.isHost && o.findReadVarNames(handleEventStmts).has(COMP_VAR.name !)) {
        preStmts.push(COMP_VAR.set(VIEW_VAR.prop('component')).toDeclStmt(this.compType));
      }
      handleEventFn = o.fn(
          [
            new o.FnParam(VIEW_VAR.name !, o.INFERRED_TYPE),
            new o.FnParam(EVENT_NAME_VAR.name !, o.INFERRED_TYPE),
            new o.FnParam(EventHandlerVars.event.name !, o.INFERRED_TYPE)
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

function providerDef(providerAst: ProviderAst):
    {providerExpr: o.Expression, flags: NodeFlags, depsExpr: o.Expression} {
  return providerAst.multiProvider ?
      multiProviderDef(providerAst.providers) :
      singleProviderDef(providerAst.providerType, providerAst.providers[0]);
}

function multiProviderDef(providers: CompileProviderMetadata[]):
    {providerExpr: o.Expression, flags: NodeFlags, depsExpr: o.Expression} {
  const allDepDefs: o.Expression[] = [];
  const allParams: o.FnParam[] = [];
  const exprs = providers.map((provider, providerIndex) => {
    let expr: o.Expression;
    if (provider.useClass) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useClass.diDeps);
      expr = o.importExpr(provider.useClass).instantiate(depExprs);
    } else if (provider.useFactory) {
      const depExprs = convertDeps(providerIndex, provider.deps || provider.useFactory.diDeps);
      expr = o.importExpr(provider.useFactory).callFn(depExprs);
    } else if (provider.useExisting) {
      const depExprs = convertDeps(providerIndex, [{token: provider.useExisting}]);
      expr = depExprs[0];
    } else {
      expr = convertValueToOutputAst(provider.useValue);
    }
    return expr;
  });
  const providerExpr =
      o.fn(allParams, [new o.ReturnStatement(o.literalArr(exprs))], o.INFERRED_TYPE);
  return {providerExpr, flags: NodeFlags.TypeFactoryProvider, depsExpr: o.literalArr(allDepDefs)};

  function convertDeps(providerIndex: number, deps: CompileDiDependencyMetadata[]) {
    return deps.map((dep, depIndex) => {
      const paramName = `p${providerIndex}_${depIndex}`;
      allParams.push(new o.FnParam(paramName, o.DYNAMIC_TYPE));
      allDepDefs.push(depDef(dep));
      return o.variable(paramName);
    });
  }
}

function singleProviderDef(providerType: ProviderAstType, providerMeta: CompileProviderMetadata):
    {providerExpr: o.Expression, flags: NodeFlags, depsExpr: o.Expression} {
  let providerExpr: o.Expression;
  let flags: NodeFlags;
  let deps: CompileDiDependencyMetadata[];
  if (providerType === ProviderAstType.Directive || providerType === ProviderAstType.Component) {
    providerExpr = o.importExpr(providerMeta.useClass !);
    flags = NodeFlags.TypeDirective;
    deps = providerMeta.deps || providerMeta.useClass !.diDeps;
  } else {
    if (providerMeta.useClass) {
      providerExpr = o.importExpr(providerMeta.useClass);
      flags = NodeFlags.TypeClassProvider;
      deps = providerMeta.deps || providerMeta.useClass.diDeps;
    } else if (providerMeta.useFactory) {
      providerExpr = o.importExpr(providerMeta.useFactory);
      flags = NodeFlags.TypeFactoryProvider;
      deps = providerMeta.deps || providerMeta.useFactory.diDeps;
    } else if (providerMeta.useExisting) {
      providerExpr = o.NULL_EXPR;
      flags = NodeFlags.TypeUseExistingProvider;
      deps = [{token: providerMeta.useExisting}];
    } else {
      providerExpr = convertValueToOutputAst(providerMeta.useValue);
      flags = NodeFlags.TypeValueProvider;
      deps = [];
    }
  }
  const depsExpr = o.literalArr(deps.map(dep => depDef(dep)));
  return {providerExpr, flags, depsExpr};
}

function tokenExpr(tokenMeta: CompileTokenMetadata): o.Expression {
  return tokenMeta.identifier ? o.importExpr(tokenMeta.identifier) : o.literal(tokenMeta.value);
}

function depDef(dep: CompileDiDependencyMetadata): o.Expression {
  // Note: the following fields have already been normalized out by provider_analyzer:
  // - isAttribute, isSelf, isHost
  const expr = dep.isValue ? convertValueToOutputAst(dep.value) : tokenExpr(dep.token !);
  let flags = DepFlags.None;
  if (dep.isSkipSelf) {
    flags |= DepFlags.SkipSelf;
  }
  if (dep.isOptional) {
    flags |= DepFlags.Optional;
  }
  if (dep.isValue) {
    flags |= DepFlags.Value;
  }
  return flags === DepFlags.None ? expr : o.literalArr([o.literal(flags), expr]);
}

function needsAdditionalRootNode(astNodes: TemplateAst[]): boolean {
  const lastAstNode = astNodes[astNodes.length - 1];
  if (lastAstNode instanceof EmbeddedTemplateAst) {
    return lastAstNode.hasViewContainer;
  }

  if (lastAstNode instanceof ElementAst) {
    if (lastAstNode.name === NG_CONTAINER_TAG && lastAstNode.children.length) {
      return needsAdditionalRootNode(lastAstNode.children);
    }
    return lastAstNode.hasViewContainer;
  }

  return lastAstNode instanceof NgContentAst;
}

function lifecycleHookToNodeFlag(lifecycleHook: LifecycleHooks): NodeFlags {
  let nodeFlag = NodeFlags.None;
  switch (lifecycleHook) {
    case LifecycleHooks.AfterContentChecked:
      nodeFlag = NodeFlags.AfterContentChecked;
      break;
    case LifecycleHooks.AfterContentInit:
      nodeFlag = NodeFlags.AfterContentInit;
      break;
    case LifecycleHooks.AfterViewChecked:
      nodeFlag = NodeFlags.AfterViewChecked;
      break;
    case LifecycleHooks.AfterViewInit:
      nodeFlag = NodeFlags.AfterViewInit;
      break;
    case LifecycleHooks.DoCheck:
      nodeFlag = NodeFlags.DoCheck;
      break;
    case LifecycleHooks.OnChanges:
      nodeFlag = NodeFlags.OnChanges;
      break;
    case LifecycleHooks.OnDestroy:
      nodeFlag = NodeFlags.OnDestroy;
      break;
    case LifecycleHooks.OnInit:
      nodeFlag = NodeFlags.OnInit;
      break;
  }
  return nodeFlag;
}

function elementBindingDef(inputAst: BoundElementPropertyAst, dirAst: DirectiveAst): o.Expression {
  switch (inputAst.type) {
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
  }
}


function fixedAttrsDef(elementAst: ElementAst): o.Expression {
  const mapResult: {[key: string]: string} = Object.create(null);
  elementAst.attrs.forEach(attrAst => { mapResult[attrAst.name] = attrAst.value; });
  elementAst.directives.forEach(dirAst => {
    Object.keys(dirAst.directive.hostAttributes).forEach(name => {
      const value = dirAst.directive.hostAttributes[name];
      const prevValue = mapResult[name];
      mapResult[name] = prevValue != null ? mergeAttributeValue(name, prevValue, value) : value;
    });
  });
  const mapEntries: o.LiteralMapEntry[] = [];
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
  return o.importExpr(createIdentifier(Identifiers.unwrapValue)).callFn([
    VIEW_VAR, o.literal(nodeIndex), o.literal(bindingIdx), expr
  ]);
}

interface StaticAndDynamicQueryIds {
  staticQueryIds: Set<number>;
  dynamicQueryIds: Set<number>;
}


function findStaticQueryIds(
    nodes: TemplateAst[], result = new Map<TemplateAst, StaticAndDynamicQueryIds>()):
    Map<TemplateAst, StaticAndDynamicQueryIds> {
  nodes.forEach((node) => {
    const staticQueryIds = new Set<number>();
    const dynamicQueryIds = new Set<number>();
    let queryMatches: QueryMatch[] = undefined !;
    if (node instanceof ElementAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child) !;
        childData.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    } else if (node instanceof EmbeddedTemplateAst) {
      findStaticQueryIds(node.children, result);
      node.children.forEach((child) => {
        const childData = result.get(child) !;
        childData.staticQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
        childData.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
      });
      queryMatches = node.queryMatches;
    }
    if (queryMatches) {
      queryMatches.forEach((match) => staticQueryIds.add(match.queryId));
    }
    dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
    result.set(node, {staticQueryIds, dynamicQueryIds});
  });
  return result;
}

function staticViewQueryIds(nodeStaticQueryIds: Map<TemplateAst, StaticAndDynamicQueryIds>):
    StaticAndDynamicQueryIds {
  const staticQueryIds = new Set<number>();
  const dynamicQueryIds = new Set<number>();
  Array.from(nodeStaticQueryIds.values()).forEach((entry) => {
    entry.staticQueryIds.forEach(queryId => staticQueryIds.add(queryId));
    entry.dynamicQueryIds.forEach(queryId => dynamicQueryIds.add(queryId));
  });
  dynamicQueryIds.forEach(queryId => staticQueryIds.delete(queryId));
  return {staticQueryIds, dynamicQueryIds};
}

function createComponentFactoryResolver(directives: DirectiveAst[]): ProviderAst|null {
  const componentDirMeta = directives.find(dirAst => dirAst.directive.isComponent);
  if (componentDirMeta && componentDirMeta.directive.entryComponents.length) {
    const entryComponentFactories = componentDirMeta.directive.entryComponents.map(
        (entryComponent) => o.importExpr({reference: entryComponent.componentFactory}));

    const token = createIdentifierToken(Identifiers.ComponentFactoryResolver);

    const classMeta: CompileTypeMetadata = {
      diDeps: [
        {isValue: true, value: o.literalArr(entryComponentFactories)},
        {token: token, isSkipSelf: true, isOptional: true},
        {token: createIdentifierToken(Identifiers.NgModuleRef)},
      ],
      lifecycleHooks: [],
      reference: resolveIdentifier(Identifiers.CodegenComponentFactoryResolver)
    };
    return new ProviderAst(
        token, false, true, [{token, multi: false, useClass: classMeta}],
        ProviderAstType.PrivateService, [], componentDirMeta.sourceSpan);
  }
  return null;
}

function elementEventNameAndTarget(
    eventAst: BoundEventAst, dirAst: DirectiveAst | null): {name: string, target: string | null} {
  if (eventAst.isAnimation) {
    return {
      name: `@${eventAst.name}.${eventAst.phase}`,
      target: dirAst && dirAst.directive.isComponent ? 'component' : null
    };
  } else {
    return eventAst;
  }
}

function calcStaticDynamicQueryFlags(
    queryIds: StaticAndDynamicQueryIds, queryId: number, isFirst: boolean) {
  let flags = NodeFlags.None;
  // Note: We only make queries static that query for a single item.
  // This is because of backwards compatibility with the old view compiler...
  if (isFirst && (queryIds.staticQueryIds.has(queryId) || !queryIds.dynamicQueryIds.has(queryId))) {
    flags |= NodeFlags.StaticQuery;
  } else {
    flags |= NodeFlags.DynamicQuery;
  }
  return flags;
}
