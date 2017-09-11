/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerOptions} from '../aot/compiler_options';
import {StaticReflector} from '../aot/static_reflector';
import {StaticSymbol} from '../aot/static_symbol';
import {CompileDiDependencyMetadata, CompileDirectiveMetadata, CompilePipeSummary, viewClassName} from '../compile_metadata';
import {BuiltinConverter, EventHandlerVars, LocalResolver, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins} from '../compiler_util/expression_converter';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import {Identifiers} from '../identifiers';
import * as o from '../output/output_ast';
import {convertValueToOutputAst} from '../output/value_util';
import {ParseSourceSpan} from '../parse_util';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, PropertyBindingType, ProviderAst, ProviderAstType, QueryMatch, ReferenceAst, TemplateAst, TemplateAstVisitor, TextAst, VariableAst, templateVisitAll} from '../template_parser/template_ast';
import {OutputContext} from '../util';


/**
 * Generates code that is used to type check templates.
 */
export class TypeCheckCompiler {
  constructor(private options: AotCompilerOptions, private reflector: StaticReflector) {}

  compileComponent(
      outputCtx: OutputContext, component: CompileDirectiveMetadata, template: TemplateAst[],
      usedPipes: CompilePipeSummary[]): void {
    const pipes = new Map<string, StaticSymbol>();
    usedPipes.forEach(p => pipes.set(p.name, p.type.reference));
    let embeddedViewCount = 0;
    const viewBuilderFactory = (parent: ViewBuilder | null): ViewBuilder => {
      const embeddedViewIndex = embeddedViewCount++;
      return new ViewBuilder(
          this.options, this.reflector, outputCtx, parent, component.type.reference,
          embeddedViewIndex, pipes, viewBuilderFactory);
    };

    const visitor = viewBuilderFactory(null);
    visitor.visitAll([], template);

    outputCtx.statements.push(...visitor.build());
  }
}

interface ViewBuilderFactory {
  (parent: ViewBuilder): ViewBuilder;
}

// Note: This is used as key in Map and should therefore be
// unique per value.
type OutputVarType = o.BuiltinTypeName | StaticSymbol;

interface Expression {
  context: OutputVarType;
  sourceSpan: ParseSourceSpan;
  value: AST;
}

class ViewBuilder implements TemplateAstVisitor, LocalResolver {
  private outputVarTypes = new Map<string, OutputVarType>();
  private outputVarNames = new Map<OutputVarType, string>();
  private refOutputVars = new Map<string, OutputVarType>();
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];
  private updates: Expression[] = [];
  private actions: Expression[] = [];

  constructor(
      private options: AotCompilerOptions, private reflector: StaticReflector,
      private outputCtx: OutputContext, private parent: ViewBuilder|null,
      private component: StaticSymbol, private embeddedViewIndex: number,
      private pipes: Map<string, StaticSymbol>, private viewBuilderFactory: ViewBuilderFactory) {}

  private getOrAddOutputVar(type: o.BuiltinTypeName|StaticSymbol): string {
    let varName = this.outputVarNames.get(type);
    if (!varName) {
      varName = `_v${this.outputVarNames.size}`;
      this.outputVarNames.set(type, varName);
      this.outputVarTypes.set(varName, type);
    }
    return varName;
  }

  visitAll(variables: VariableAst[], astNodes: TemplateAst[]) {
    this.variables = variables;
    templateVisitAll(this, astNodes);
  }

  build(targetStatements: o.Statement[] = []): o.Statement[] {
    this.children.forEach((child) => child.build(targetStatements));

    const viewStmts: o.Statement[] = [];
    let bindingCount = 0;
    this.updates.forEach((expression) => {
      const {sourceSpan, context, value} = this.preprocessUpdateExpression(expression);
      const bindingId = `${bindingCount++}`;
      const nameResolver = context === this.component ? this : null;
      const {stmts, currValExpr} = convertPropertyBinding(
          nameResolver, o.variable(this.getOrAddOutputVar(context)), value, bindingId);
      stmts.push(new o.ExpressionStatement(currValExpr));
      viewStmts.push(...stmts.map(
          (stmt: o.Statement) => o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan)));
    });

    this.actions.forEach(({sourceSpan, context, value}) => {
      const bindingId = `${bindingCount++}`;
      const nameResolver = context === this.component ? this : null;
      const {stmts} = convertActionBinding(
          nameResolver, o.variable(this.getOrAddOutputVar(context)), value, bindingId);
      viewStmts.push(...stmts.map(
          (stmt: o.Statement) => o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan)));
    });

    const viewName = `_View_${this.component.name}_${this.embeddedViewIndex}`;
    const params: o.FnParam[] = [];
    this.outputVarNames.forEach((varName, varType) => {
      const outputType = varType instanceof StaticSymbol ?
          o.expressionType(this.outputCtx.importExpr(varType)) :
          new o.BuiltinType(varType);
      params.push(new o.FnParam(varName, outputType));
    });

    const viewFactory = new o.DeclareFunctionStmt(viewName, params, viewStmts);
    targetStatements.push(viewFactory);
    return targetStatements;
  }

  visitBoundText(ast: BoundTextAst, context: any): any {
    const astWithSource = <ASTWithSource>ast.value;
    const inter = <Interpolation>astWithSource.ast;

    inter.expressions.forEach(
        (expr) =>
            this.updates.push({context: this.component, value: expr, sourceSpan: ast.sourceSpan}));
  }

  visitEmbeddedTemplate(ast: EmbeddedTemplateAst, context: any): any {
    this.visitElementOrTemplate(ast);
    // Note: The old view compiler used to use an `any` type
    // for the context in any embedded view.
    // We keep this behaivor behind a flag for now.
    if (this.options.fullTemplateTypeCheck) {
      const childVisitor = this.viewBuilderFactory(this);
      this.children.push(childVisitor);
      childVisitor.visitAll(ast.variables, ast.children);
    }
  }

  visitElement(ast: ElementAst, context: any): any {
    this.visitElementOrTemplate(ast);

    let inputDefs: o.Expression[] = [];
    let updateRendererExpressions: Expression[] = [];
    let outputDefs: o.Expression[] = [];
    ast.inputs.forEach((inputAst) => {
      this.updates.push(
          {context: this.component, value: inputAst.value, sourceSpan: inputAst.sourceSpan});
    });

    templateVisitAll(this, ast.children);
  }

  private visitElementOrTemplate(ast: {
    outputs: BoundEventAst[],
    directives: DirectiveAst[],
    references: ReferenceAst[],
  }) {
    ast.directives.forEach((dirAst) => { this.visitDirective(dirAst); });

    ast.references.forEach((ref) => {
      let outputVarType: OutputVarType = null !;
      // Note: The old view compiler used to use an `any` type
      // for directives exposed via `exportAs`.
      // We keep this behaivor behind a flag for now.
      if (ref.value && ref.value.identifier && this.options.fullTemplateTypeCheck) {
        outputVarType = ref.value.identifier.reference;
      } else {
        outputVarType = o.BuiltinTypeName.Dynamic;
      }
      this.refOutputVars.set(ref.name, outputVarType);
    });
    ast.outputs.forEach((outputAst) => {
      this.actions.push(
          {context: this.component, value: outputAst.handler, sourceSpan: outputAst.sourceSpan});
    });
  }

  visitDirective(dirAst: DirectiveAst) {
    const dirType = dirAst.directive.type.reference;
    dirAst.inputs.forEach(
        (input) => this.updates.push(
            {context: this.component, value: input.value, sourceSpan: input.sourceSpan}));
    // Note: The old view compiler used to use an `any` type
    // for expressions in host properties / events.
    // We keep this behaivor behind a flag for now.
    if (this.options.fullTemplateTypeCheck) {
      dirAst.hostProperties.forEach(
          (inputAst) => this.updates.push(
              {context: dirType, value: inputAst.value, sourceSpan: inputAst.sourceSpan}));
      dirAst.hostEvents.forEach((hostEventAst) => this.actions.push({
        context: dirType,
        value: hostEventAst.handler,
        sourceSpan: hostEventAst.sourceSpan
      }));
    }
  }

  getLocal(name: string): o.Expression|null {
    if (name == EventHandlerVars.event.name) {
      return o.variable(this.getOrAddOutputVar(o.BuiltinTypeName.Dynamic));
    }
    for (let currBuilder: ViewBuilder|null = this; currBuilder; currBuilder = currBuilder.parent) {
      let outputVarType: OutputVarType|undefined;
      // check references
      outputVarType = currBuilder.refOutputVars.get(name);
      if (outputVarType == null) {
        // check variables
        const varAst = currBuilder.variables.find((varAst) => varAst.name === name);
        if (varAst) {
          outputVarType = o.BuiltinTypeName.Dynamic;
        }
      }
      if (outputVarType != null) {
        return o.variable(this.getOrAddOutputVar(outputVarType));
      }
    }
    return null;
  }

  private pipeOutputVar(name: string): string {
    const pipe = this.pipes.get(name);
    if (!pipe) {
      throw new Error(
          `Illegal State: Could not find pipe ${name} in template of ${this.component}`);
    }
    return this.getOrAddOutputVar(pipe);
  }

  private preprocessUpdateExpression(expression: Expression): Expression {
    return {
      sourceSpan: expression.sourceSpan,
      context: expression.context,
      value: convertPropertyBindingBuiltins(
          {
            createLiteralArrayConverter: (argCount: number) => (args: o.Expression[]) =>
                                             o.literalArr(args),
            createLiteralMapConverter: (keys: {key: string, quoted: boolean}[]) =>
                                           (values: o.Expression[]) => {
                                             const entries = keys.map((k, i) => ({
                                                                        key: k.key,
                                                                        value: values[i],
                                                                        quoted: k.quoted,
                                                                      }));
                                             return o.literalMap(entries);
                                           },
            createPipeConverter: (name: string, argCount: number) => (args: o.Expression[]) => {
              // Note: The old view compiler used to use an `any` type
              // for pipe calls.
              // We keep this behaivor behind a flag for now.
              if (this.options.fullTemplateTypeCheck) {
                return o.variable(this.pipeOutputVar(name)).callMethod('transform', args);
              } else {
                return o.variable(this.getOrAddOutputVar(o.BuiltinTypeName.Dynamic));
              }
            },
          },
          expression.value)
    };
  }

  visitNgContent(ast: NgContentAst, context: any): any {}
  visitText(ast: TextAst, context: any): any {}
  visitDirectiveProperty(ast: BoundDirectivePropertyAst, context: any): any {}
  visitReference(ast: ReferenceAst, context: any): any {}
  visitVariable(ast: VariableAst, context: any): any {}
  visitEvent(ast: BoundEventAst, context: any): any {}
  visitElementProperty(ast: BoundElementPropertyAst, context: any): any {}
  visitAttr(ast: AttrAst, context: any): any {}
}
