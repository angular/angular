/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerOptions} from '../aot/compiler_options';
import {StaticReflector} from '../aot/static_reflector';
import {StaticSymbol} from '../aot/static_symbol';
import {CompileDirectiveMetadata, CompilePipeSummary} from '../compile_metadata';
import {BindingForm, convertActionBinding, convertPropertyBinding, convertPropertyBindingBuiltins, EventHandlerVars, LocalResolver} from '../compiler_util/expression_converter';
import {AST, ASTWithSource, Interpolation} from '../expression_parser/ast';
import * as o from '../output/output_ast';
import {ParseSourceSpan} from '../parse_util';
import {AttrAst, BoundDirectivePropertyAst, BoundElementPropertyAst, BoundEventAst, BoundTextAst, DirectiveAst, ElementAst, EmbeddedTemplateAst, NgContentAst, ReferenceAst, TemplateAst, TemplateAstVisitor, templateVisitAll, TextAst, VariableAst} from '../template_parser/template_ast';
import {OutputContext} from '../util';


/**
 * Generates code that is used to type check templates.
 */
export class TypeCheckCompiler {
  constructor(private options: AotCompilerOptions, private reflector: StaticReflector) {}

  /**
   * Important notes:
   * - This must not produce new `import` statements, but only refer to types outside
   *   of the file via the variables provided via externalReferenceVars.
   *   This allows Typescript to reuse the old program's structure as no imports have changed.
   * - This must not produce any exports, as this would pollute the .d.ts file
   *   and also violate the point above.
   */
  compileComponent(
      componentId: string, component: CompileDirectiveMetadata, template: TemplateAst[],
      usedPipes: CompilePipeSummary[], externalReferenceVars: Map<StaticSymbol, string>,
      ctx: OutputContext): o.Statement[] {
    const pipes = new Map<string, StaticSymbol>();
    usedPipes.forEach(p => pipes.set(p.name, p.type.reference));
    let embeddedViewCount = 0;
    const viewBuilderFactory =
        (parent: ViewBuilder|null, guards: GuardExpression[]): ViewBuilder => {
          const embeddedViewIndex = embeddedViewCount++;
          return new ViewBuilder(
              this.options, this.reflector, externalReferenceVars, parent, component.type.reference,
              component.isHost, embeddedViewIndex, pipes, guards, ctx, viewBuilderFactory);
        };

    const visitor = viewBuilderFactory(null, []);
    visitor.visitAll([], template);

    return visitor.build(componentId);
  }
}

interface GuardExpression {
  guard: StaticSymbol;
  useIf: boolean;
  expression: Expression;
}

interface ViewBuilderFactory {
  (parent: ViewBuilder, guards: GuardExpression[]): ViewBuilder;
}

// Note: This is used as key in Map and should therefore be
// unique per value.
type OutputVarType = o.BuiltinTypeName|StaticSymbol;

interface Expression {
  context: OutputVarType;
  sourceSpan: ParseSourceSpan;
  value: AST;
}

const DYNAMIC_VAR_NAME = '_any';

class TypeCheckLocalResolver implements LocalResolver {
  notifyImplicitReceiverUse(): void {}
  getLocal(name: string): o.Expression|null {
    if (name === EventHandlerVars.event.name) {
      // References to the event should not be type-checked.
      // TODO(chuckj): determine a better type for the event.
      return o.variable(DYNAMIC_VAR_NAME);
    }
    return null;
  }
}

const defaultResolver = new TypeCheckLocalResolver();

class ViewBuilder implements TemplateAstVisitor, LocalResolver {
  private refOutputVars = new Map<string, OutputVarType>();
  private variables: VariableAst[] = [];
  private children: ViewBuilder[] = [];
  private updates: Expression[] = [];
  private actions: Expression[] = [];

  constructor(
      private options: AotCompilerOptions, private reflector: StaticReflector,
      private externalReferenceVars: Map<StaticSymbol, string>, private parent: ViewBuilder|null,
      private component: StaticSymbol, private isHostComponent: boolean,
      private embeddedViewIndex: number, private pipes: Map<string, StaticSymbol>,
      private guards: GuardExpression[], private ctx: OutputContext,
      private viewBuilderFactory: ViewBuilderFactory) {}

  private getOutputVar(type: o.BuiltinTypeName|StaticSymbol): string {
    let varName: string|undefined;
    if (type === this.component && this.isHostComponent) {
      varName = DYNAMIC_VAR_NAME;
    } else if (type instanceof StaticSymbol) {
      varName = this.externalReferenceVars.get(type);
    } else {
      varName = DYNAMIC_VAR_NAME;
    }
    if (!varName) {
      throw new Error(
          `Illegal State: referring to a type without a variable ${JSON.stringify(type)}`);
    }
    return varName;
  }

  private getTypeGuardExpressions(ast: EmbeddedTemplateAst): GuardExpression[] {
    const result = [...this.guards];
    for (let directive of ast.directives) {
      for (let input of directive.inputs) {
        const guard = directive.directive.guards[input.directiveName];
        if (guard) {
          const useIf = guard === 'UseIf';
          result.push({
            guard,
            useIf,
            expression: {
              context: this.component,
              value: input.value,
              sourceSpan: input.sourceSpan,
            },
          });
        }
      }
    }
    return result;
  }

  visitAll(variables: VariableAst[], astNodes: TemplateAst[]) {
    this.variables = variables;
    templateVisitAll(this, astNodes);
  }

  build(componentId: string, targetStatements: o.Statement[] = []): o.Statement[] {
    this.children.forEach((child) => child.build(componentId, targetStatements));
    let viewStmts: o.Statement[] =
        [o.variable(DYNAMIC_VAR_NAME).set(o.NULL_EXPR).toDeclStmt(o.DYNAMIC_TYPE)];
    let bindingCount = 0;
    this.updates.forEach((expression) => {
      const {sourceSpan, context, value} = this.preprocessUpdateExpression(expression);
      const bindingId = `${bindingCount++}`;
      const nameResolver = context === this.component ? this : defaultResolver;
      const {stmts, currValExpr} = convertPropertyBinding(
          nameResolver, o.variable(this.getOutputVar(context)), value, bindingId,
          BindingForm.General);
      stmts.push(new o.ExpressionStatement(currValExpr));
      viewStmts.push(...stmts.map(
          (stmt: o.Statement) => o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan)));
    });

    this.actions.forEach(({sourceSpan, context, value}) => {
      const bindingId = `${bindingCount++}`;
      const nameResolver = context === this.component ? this : defaultResolver;
      const {stmts} = convertActionBinding(
          nameResolver, o.variable(this.getOutputVar(context)), value, bindingId);
      viewStmts.push(...stmts.map(
          (stmt: o.Statement) => o.applySourceSpanToStatementIfNeeded(stmt, sourceSpan)));
    });

    if (this.guards.length) {
      let guardExpression: o.Expression|undefined = undefined;
      for (const guard of this.guards) {
        const {context, value} = this.preprocessUpdateExpression(guard.expression);
        const bindingId = `${bindingCount++}`;
        const nameResolver = context === this.component ? this : defaultResolver;
        // We only support support simple expressions and ignore others as they
        // are unlikely to affect type narrowing.
        const {stmts, currValExpr} = convertPropertyBinding(
            nameResolver, o.variable(this.getOutputVar(context)), value, bindingId,
            BindingForm.TrySimple);
        if (stmts.length == 0) {
          const guardClause =
              guard.useIf ? currValExpr : this.ctx.importExpr(guard.guard).callFn([currValExpr]);
          guardExpression = guardExpression ? guardExpression.and(guardClause) : guardClause;
        }
      }
      if (guardExpression) {
        viewStmts = [new o.IfStmt(guardExpression, viewStmts)];
      }
    }

    const viewName = `_View_${componentId}_${this.embeddedViewIndex}`;
    const viewFactory = new o.DeclareFunctionStmt(viewName, [], viewStmts);
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
      // Find any applicable type guards. For example, NgIf has a type guard on ngIf
      // (see NgIf.ngIfTypeGuard) that can be used to indicate that a template is only
      // stamped out if ngIf is truthy so any bindings in the template can assume that,
      // if a nullable type is used for ngIf, that expression is not null or undefined.
      const guards = this.getTypeGuardExpressions(ast);
      const childVisitor = this.viewBuilderFactory(this, guards);
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
    ast.directives.forEach((dirAst) => {
      this.visitDirective(dirAst);
    });

    ast.references.forEach((ref) => {
      let outputVarType: OutputVarType = null!;
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

  notifyImplicitReceiverUse(): void {}
  getLocal(name: string): o.Expression|null {
    if (name == EventHandlerVars.event.name) {
      return o.variable(this.getOutputVar(o.BuiltinTypeName.Dynamic));
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
        return o.variable(this.getOutputVar(outputVarType));
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
    return this.getOutputVar(pipe);
  }

  private preprocessUpdateExpression(expression: Expression): Expression {
    return {
      sourceSpan: expression.sourceSpan,
      context: expression.context,
      value: convertPropertyBindingBuiltins(
          {
            createLiteralArrayConverter: (argCount: number) => (args: o.Expression[]) => {
              const arr = o.literalArr(args);
              // Note: The old view compiler used to use an `any` type
              // for arrays.
              return this.options.fullTemplateTypeCheck ? arr : arr.cast(o.DYNAMIC_TYPE);
            },
            createLiteralMapConverter: (keys: {key: string, quoted: boolean}[]) =>
                (values: o.Expression[]) => {
                  const entries = keys.map((k, i) => ({
                                             key: k.key,
                                             value: values[i],
                                             quoted: k.quoted,
                                           }));
                  const map = o.literalMap(entries);
                  // Note: The old view compiler used to use an `any` type
                  // for maps.
                  return this.options.fullTemplateTypeCheck ? map : map.cast(o.DYNAMIC_TYPE);
                },
            createPipeConverter: (name: string, argCount: number) => (args: o.Expression[]) => {
              // Note: The old view compiler used to use an `any` type
              // for pipes.
              const pipeExpr = this.options.fullTemplateTypeCheck ?
                  o.variable(this.pipeOutputVar(name)) :
                  o.variable(this.getOutputVar(o.BuiltinTypeName.Dynamic));
              return pipeExpr.callMethod('transform', args);
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
