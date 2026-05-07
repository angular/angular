/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AST,
  ASTWithSource,
  Binary,
  BindingPipe,
  BindingType,
  Call,
  Chain,
  Conditional,
  KeyedRead,
  LiteralPrimitive,
  NonNullAssert,
  parseTemplate,
  PrefixNot,
  PropertyRead,
  RecursiveAstVisitor,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundDeferredTrigger,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstDeferredTrigger,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  TmplAstSwitchBlockCase,
  TmplAstSwitchBlockCaseGroup,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {AbsoluteFsPath} from '@angular/compiler-cli';
import ts from 'typescript';
import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  ProjectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {getPropertyNameText} from '../../utils/typescript/property_name';

export interface CompilationUnitData {
  replacements: Replacement[];
}

export interface MigrationConfig {
  /**
   * Whether to migrate this component template.
   */
  shouldMigrate?: (containingFile: ProjectFile) => boolean;
}

/**
 * This migration wraps optional chaining expressions in Angular templates with a call to the
 * `$safeNavigationMigration()` magic function. This function doesn't exist at runtime, but is
 * used as a marker for the Angular compiler to transform the expression to keep the legacy
 * behavior of returning `null`.
 *
 * The migration uses a top-down "sink" approach: each expression is visited with a boolean
 * `nullSensitive` context that indicates whether the consumer of the expression's value
 * distinguishes between `null` and `undefined`. Safe navigation operators (`?.`) wrap themselves
 * when their sink is null-sensitive.
 */
export class SafeOptionalChainingMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];

    // Template Iteration
    const templateVisitor = new NgComponentTemplateVisitor(info.program.getTypeChecker());
    for (const sourceFile of info.sourceFiles) {
      templateVisitor.visitNode(sourceFile);
    }

    for (const template of templateVisitor.resolvedTemplates) {
      const nodes = parseTemplate(template.content, template.filePath.toString(), {
        preserveWhitespaces: true,
        preserveLineEndings: true,
        preserveSignificantWhitespace: true,
        leadingTriviaChars: [],
      }).nodes;
      const file = template.inline
        ? projectFile(template.container.getSourceFile(), info)
        : projectFile(template.filePath as AbsoluteFsPath, info);

      const exprMigrator = new ExpressionMigrator(file, template.start);
      const visitor = new TmplVisitor(exprMigrator);

      for (const node of nodes) {
        if (node.visit) {
          node.visit(visitor);
        }
      }

      replacements.push(...exprMigrator.replacements);
    }

    for (const sourceFile of info.sourceFiles) {
      replacements.push(...migrateHostBindingsInSourceFile(sourceFile, info));
    }

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const seen = new Set<string>();
    const deduped: Replacement[] = [];

    for (const r of [...unitA.replacements, ...unitB.replacements]) {
      const key = `${r.projectFile.rootRelativePath}:${r.update.data.position}:${r.update.data.end}:${r.update.data.toInsert}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(r);
      }
    }

    return confirmAsSerializable({replacements: deduped});
  }

  override async globalMeta(data: CompilationUnitData): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(data);
  }

  override async stats(data: CompilationUnitData) {
    return confirmAsSerializable({});
  }

  override async migrate(data: CompilationUnitData) {
    return {replacements: data.replacements};
  }
}

function migrateHostBindingsInSourceFile(
  sourceFile: ts.SourceFile,
  info: ProgramInfo,
): Replacement[] {
  const replacements: Replacement[] = [];
  const file = projectFile(sourceFile, info);
  const typeChecker = info.program.getTypeChecker();

  const visitNode = (node: ts.Node) => {
    if (ts.isClassDeclaration(node)) {
      const decorators = ts.getDecorators(node) ?? [];
      const ngDecorators = getAngularDecorators(typeChecker, decorators);

      for (const decorator of ngDecorators) {
        if (decorator.name !== 'Component' && decorator.name !== 'Directive') {
          continue;
        }

        const metadata = decorator.node.expression.arguments[0];
        if (!metadata || !ts.isObjectLiteralExpression(metadata)) {
          continue;
        }

        for (const prop of metadata.properties) {
          if (!ts.isPropertyAssignment(prop)) {
            continue;
          }

          const propName = getPropertyNameText(prop.name);
          if (propName !== 'host' || !ts.isObjectLiteralExpression(prop.initializer)) {
            continue;
          }

          for (const hostProp of prop.initializer.properties) {
            if (
              !ts.isPropertyAssignment(hostProp) ||
              !ts.isStringLiteralLike(hostProp.initializer)
            ) {
              continue;
            }

            const hostKey = getPropertyNameText(hostProp.name);
            if (hostKey === null || (!hostKey.startsWith('[') && !hostKey.startsWith('('))) {
              continue;
            }

            // Preserve raw text between quotes/backticks so source offsets stay aligned.
            const hostExpression = hostProp.initializer.getText().slice(1, -1);
            const fakeTemplatePrefix = `<div ${hostKey}="`;
            const fakeTemplate = `${fakeTemplatePrefix}${hostExpression}"></div>`;
            const parsedNodes = parseTemplate(fakeTemplate, sourceFile.fileName, {
              preserveWhitespaces: true,
            }).nodes;

            const hostExpressionStart = hostProp.initializer.getStart() + 1;
            const exprMigrator = new ExpressionMigrator(
              file,
              hostExpressionStart - fakeTemplatePrefix.length,
            );
            const visitor = new HostBindingVisitor(exprMigrator);

            for (const parsedNode of parsedNodes) {
              if (parsedNode.visit) {
                parsedNode.visit(visitor);
              }
            }

            replacements.push(...exprMigrator.replacements);
          }
        }
      }
    }

    ts.forEachChild(node, visitNode);
  };

  visitNode(sourceFile);
  return replacements;
}

/** Returns whether the given attribute is a class, style, or attribute binding. */
function isClassStyleOrAttrBinding(attribute: TmplAstBoundAttribute): boolean {
  return (
    attribute.type === BindingType.Class ||
    attribute.type === BindingType.Style ||
    attribute.type === BindingType.Attribute ||
    (attribute.type === BindingType.Property &&
      (attribute.name === 'class' || attribute.name === 'className' || attribute.name === 'style'))
  );
}

class HostBindingVisitor extends TmplAstRecursiveVisitor {
  constructor(private hostExprMigrator: ExpressionMigrator) {
    super();
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute) {
    if (isClassStyleOrAttrBinding(attribute)) {
      // Class/style/attr bindings use truthiness — not null-sensitive by default.
      // Safe navs inside function calls or pipes will still be wrapped by the migrator.
      attribute.value.visit(this.hostExprMigrator, false);
    } else {
      // Regular property bindings are null-sensitive.
      attribute.value.visit(this.hostExprMigrator, true);
    }
    super.visitBoundAttribute(attribute);
  }

  override visitBoundEvent(event: TmplAstBoundEvent) {
    if (event.handler && event.handler.visit) {
      // Event handlers are not null-sensitive; safe navs inside function calls will
      // still be wrapped because function arguments are always null-sensitive.
      event.handler.visit(this.hostExprMigrator, false);
    }
    super.visitBoundEvent(event);
  }
}

/**
 * Visits template expressions and inserts `$safeNavigationMigration(…)` wrappers around safe
 * navigation chains whose result is consumed by a null-sensitive sink.
 *
 * The `context` parameter at every visit call is a boolean `nullSensitive` flag that answers:
 * "does the parent care whether this expression's value is `null` vs. `undefined`?"
 *
 * Propagation rules:
 * - `||`, `&&`, `??`: children are **not** null-sensitive (both normalise null/undefined).
 * - `===` / `!==` with a nullish literal on one side: the other operand **is** null-sensitive.
 * - All other binary operators: propagate the parent's null-sensitivity.
 * - `!` (prefix not): operand is **not** null-sensitive (uses truthiness).
 * - Ternary condition: **not** null-sensitive; branches inherit the parent's null-sensitivity.
 * - Function call arguments and pipe inputs: **always** null-sensitive.
 * - Receivers of property/keyed/call reads: **not** null-sensitive by default.
 *   For property/keyed/call continuations, when the receiver is a safe node and the parent sink
 *   is null-sensitive, wrap the full continuation node (e.g. `foo?.bar.baz`, `foo?.save()`) rather
 *   than the inner safe receiver (`foo?.bar`, `foo?.save`) so runtime behavior is preserved.
 * - `NonNullAssert` (`!`): propagates the parent's null-sensitivity (type-only assertion).
 */
class ExpressionMigrator extends RecursiveAstVisitor {
  replacements: Replacement[] = [];

  constructor(
    private file: ProjectFile,
    private templateStart: number,
  ) {
    super();
  }

  // ---------------------------------------------------------------------------
  // Safe navigation nodes — wrap when the sink is null-sensitive
  // ---------------------------------------------------------------------------

  override visitSafePropertyRead(ast: SafePropertyRead, nullSensitive: boolean): any {
    if (nullSensitive) {
      this.addReplacement(ast);
    }
    // Receiver: not null-sensitive (further access on null/undefined throws either way).
    this.visit(ast.receiver, false);
  }

  override visitSafeKeyedRead(ast: SafeKeyedRead, nullSensitive: boolean): any {
    if (nullSensitive) {
      this.addReplacement(ast);
    }
    this.visit(ast.receiver, false);
    this.visit(ast.key, false);
  }

  override visitSafeCall(ast: SafeCall, nullSensitive: boolean): any {
    if (nullSensitive) {
      this.addReplacement(ast);
    }
    this.visit(ast.receiver, false);
    this.visitAll(ast.args, true);
  }

  private hasSafeReceiver(receiver: AST): boolean {
    if (
      receiver instanceof SafePropertyRead ||
      receiver instanceof SafeKeyedRead ||
      receiver instanceof SafeCall
    ) {
      return true;
    }
    if (receiver instanceof NonNullAssert) {
      return this.hasSafeReceiver(receiver.expression);
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Non-safe access — receiver is never null-sensitive
  // ---------------------------------------------------------------------------

  override visitPropertyRead(ast: PropertyRead, nullSensitive: boolean): any {
    if (nullSensitive && this.hasSafeReceiver(ast.receiver)) {
      this.addReplacement(ast);
    }
    this.visit(ast.receiver, false);
  }

  override visitKeyedRead(ast: KeyedRead, nullSensitive: boolean): any {
    if (nullSensitive && this.hasSafeReceiver(ast.receiver)) {
      this.addReplacement(ast);
    }
    this.visit(ast.receiver, false);
    this.visit(ast.key, false);
  }

  // ---------------------------------------------------------------------------
  // Function calls — arguments are always null-sensitive
  // ---------------------------------------------------------------------------

  override visitCall(ast: Call, nullSensitive: boolean): any {
    if (nullSensitive && this.hasSafeReceiver(ast.receiver)) {
      this.addReplacement(ast);
    }
    this.visit(ast.receiver, false);
    this.visitAll(ast.args, true);
  }

  // ---------------------------------------------------------------------------
  // Pipes — input and arguments are always null-sensitive
  // ---------------------------------------------------------------------------

  override visitPipe(ast: BindingPipe, _nullSensitive: boolean): any {
    this.visit(ast.exp, true);
    this.visitAll(ast.args, true);
  }

  // ---------------------------------------------------------------------------
  // Binary operators
  // ---------------------------------------------------------------------------

  override visitBinary(ast: Binary, nullSensitive: boolean): any {
    if (ast.operation === '||' || ast.operation === '&&' || ast.operation === '??') {
      // These operators normalise null and undefined (both produce the same result),
      // so the operands are not null-sensitive.
      this.visit(ast.left, false);
      this.visit(ast.right, false);
    } else if (ast.operation === '===' || ast.operation === '!==') {
      // A strict comparison with a nullish literal makes the other side null-sensitive
      // (null === null is true but undefined === null is false).
      const leftIsNullish = isNullishLiteralAST(ast.left);
      const rightIsNullish = isNullishLiteralAST(ast.right);
      this.visit(ast.left, rightIsNullish);
      this.visit(ast.right, leftIsNullish);
    } else {
      // All other binary operators (<, >, +, -, …): propagate the parent's null-sensitivity
      // because null and undefined can produce different numeric results (null → 0,
      // undefined → NaN for arithmetic/comparison).
      this.visit(ast.left, nullSensitive);
      this.visit(ast.right, nullSensitive);
    }
  }

  // ---------------------------------------------------------------------------
  // Unary / logical operators
  // ---------------------------------------------------------------------------

  override visitPrefixNot(ast: PrefixNot, _nullSensitive: boolean): any {
    // Logical negation uses truthiness — null and undefined are both falsy.
    this.visit(ast.expression, false);
  }

  // ---------------------------------------------------------------------------
  // Ternary
  // ---------------------------------------------------------------------------

  override visitConditional(ast: Conditional, nullSensitive: boolean): any {
    // The condition is evaluated as a boolean — not null-sensitive.
    this.visit(ast.condition, false);
    // The result of a branch is consumed by the parent, so it inherits null-sensitivity.
    this.visit(ast.trueExp, nullSensitive);
    this.visit(ast.falseExp, nullSensitive);
  }

  // ---------------------------------------------------------------------------
  // NonNullAssert — a compile-time type annotation, no runtime effect
  // ---------------------------------------------------------------------------

  override visitNonNullAssert(ast: NonNullAssert, nullSensitive: boolean): any {
    this.visit(ast.expression, nullSensitive);
  }

  // ---------------------------------------------------------------------------
  // Chain (event handler statements) — never null-sensitive
  // ---------------------------------------------------------------------------

  override visitChain(ast: Chain, _nullSensitive: boolean): any {
    this.visitAll(ast.expressions, false);
  }

  // ---------------------------------------------------------------------------
  // Interpolation — coerces to string, so null and undefined produce identical
  // output; sub-expressions are therefore never null-sensitive.
  // ---------------------------------------------------------------------------

  override visitInterpolation(ast: {expressions: AST[]}, _nullSensitive: boolean): any {
    this.visitAll(ast.expressions, false);
  }

  // ---------------------------------------------------------------------------
  // All other nodes (LiteralArray, LiteralMap, Unary, …) use the default
  // RecursiveAstVisitor which propagates the current context to every child —
  // the correct "inherit parent null-sensitivity" fallback.
  // ---------------------------------------------------------------------------

  private addReplacement(ast: AST): void {
    const startArg = ast.sourceSpan.start;
    const endArg = ast.sourceSpan.end;

    this.replacements.push(
      new Replacement(
        this.file,
        new TextUpdate({
          position: this.templateStart + endArg,
          end: this.templateStart + endArg,
          toInsert: ')',
        }),
      ),
      new Replacement(
        this.file,
        new TextUpdate({
          position: this.templateStart + startArg,
          end: this.templateStart + startArg,
          toInsert: '$safeNavigationMigration(',
        }),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

/** Returns true if the AST node is a literal `null` or `undefined`. */
function isNullishLiteralAST(ast: AST): boolean {
  const innerAst = ast instanceof ASTWithSource ? ast.ast : ast;
  return (
    innerAst instanceof LiteralPrimitive &&
    (innerAst.value === null || innerAst.value === undefined)
  );
}

/** Returns true if the AST node is a non-null, non-undefined primitive literal. */
function isNonNullishLiteralAST(ast: AST): boolean {
  const innerAst = ast instanceof ASTWithSource ? ast.ast : ast;
  return (
    innerAst instanceof LiteralPrimitive && innerAst.value !== null && innerAst.value !== undefined
  );
}

/** Returns true if any expression in `ast` contains a strict null/undefined check. */
function hasNullCheckInAST(ast: AST): boolean {
  const innerAst = ast instanceof ASTWithSource ? ast.ast : ast;

  const visitor = new NullCheckVisitor();
  innerAst.visit(visitor);
  return visitor.hasNullCheck;
}

class NullCheckVisitor extends RecursiveAstVisitor {
  public hasNullCheck: boolean = false;
  override visitBinary(node: Binary, context: unknown) {
    if (node.operation === '===' || node.operation === '!==') {
      const isLeftNullish = isNullishLiteralAST(node.left);
      const isRightNullish = isNullishLiteralAST(node.right);
      if (isLeftNullish || isRightNullish) {
        this.hasNullCheck = true;
      }
    }
    super.visitBinary(node, context);
  }
}

// ---------------------------------------------------------------------------
// Template visitor
// ---------------------------------------------------------------------------

/**
 * Returns true if all *ngSwitchCase bindings in the given nodes (and their children)
 * are non-null/non-undefined literal expressions — meaning the switch expression
 * doesn't need null-sensitivity migration.
 */
function allNgSwitchCasesAreLiterals(nodes: Array<TmplAstElement | TmplAstTemplate>): boolean {
  for (const node of nodes) {
    for (const input of node.inputs) {
      if (input.name === 'ngSwitchCase' && input.value) {
        if (!isNonNullishLiteralAST(input.value)) {
          return false;
        }
      }
    }

    if (node instanceof TmplAstTemplate) {
      for (const attr of node.templateAttrs) {
        if (attr instanceof TmplAstBoundAttribute && attr.name === 'ngSwitchCase' && attr.value) {
          if (!isNonNullishLiteralAST(attr.value)) {
            return false;
          }
        }
      }
    }

    const childHosts = node.children.filter(
      (child): child is TmplAstElement | TmplAstTemplate =>
        child instanceof TmplAstElement || child instanceof TmplAstTemplate,
    );

    if (!allNgSwitchCasesAreLiterals(childHosts)) {
      return false;
    }
  }

  return true;
}

class TmplVisitor extends TmplAstRecursiveVisitor {
  private migratableSwitchCases = new WeakSet<TmplAstSwitchBlockCase>();
  /**
   * Stack tracking whether the current ngSwitch context should be migrated.
   * False when all *ngSwitchCase expressions are non-null literals.
   */
  private ngSwitchShouldMigrateStack: boolean[] = [];

  constructor(private exprMigrator: ExpressionMigrator) {
    super();
  }

  private shouldMigrateCurrentNgSwitchContext(): boolean {
    return this.ngSwitchShouldMigrateStack[this.ngSwitchShouldMigrateStack.length - 1] ?? true;
  }

  private hasNgSwitchBinding(node: TmplAstElement | TmplAstTemplate): boolean {
    return (
      node.inputs.some((attr) => attr.name === 'ngSwitch') ||
      (node instanceof TmplAstTemplate &&
        node.templateAttrs.some(
          (attr: TmplAstBoundAttribute | TmplAstTextAttribute) => attr.name === 'ngSwitch',
        ))
    );
  }

  override visitElement(element: TmplAstElement) {
    const hasNgSwitch = this.hasNgSwitchBinding(element);
    if (hasNgSwitch) {
      const childHosts = element.children.filter(
        (child): child is TmplAstElement | TmplAstTemplate =>
          child instanceof TmplAstElement || child instanceof TmplAstTemplate,
      );
      this.ngSwitchShouldMigrateStack.push(!allNgSwitchCasesAreLiterals(childHosts));
    }

    super.visitElement(element);

    if (hasNgSwitch) {
      this.ngSwitchShouldMigrateStack.pop();
    }
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute) {
    if (attribute.name === 'ngForOf') {
      // ngFor/@for item expressions are not null-sensitive by default.
      // Still visit so inner null-sensitive sinks (e.g. pipes/functions) are migrated.
      attribute.value.visit(this.exprMigrator, false);
    } else if (attribute.name === 'ngIf') {
      // ngIf evaluates as a boolean; null-sensitivity only arises when the expression
      // itself contains a strict null comparison (handled inside ExpressionMigrator).
      attribute.value.visit(this.exprMigrator, false);
    } else if (attribute.name === 'ngSwitch' || attribute.name === 'ngSwitchCase') {
      attribute.value.visit(this.exprMigrator, this.shouldMigrateCurrentNgSwitchContext());
    } else if (isClassStyleOrAttrBinding(attribute)) {
      // Class/style/attr bindings use truthiness — not null-sensitive by default.
      attribute.value.visit(this.exprMigrator, false);
    } else {
      // Regular property bindings are null-sensitive.
      attribute.value.visit(this.exprMigrator, true);
    }
    super.visitBoundAttribute(attribute);
  }

  override visitBoundEvent(event: TmplAstBoundEvent) {
    if (event.handler && event.handler.visit) {
      // Event handlers are not null-sensitive.  Safe navs inside function calls
      // (e.g. `compute(user?.save())`) are still migrated because function arguments
      // are always null-sensitive in ExpressionMigrator.
      event.handler.visit(this.exprMigrator, false);
    }
    super.visitBoundEvent(event);
  }

  override visitBoundText(text: TmplAstBoundText) {
    // Interpolation text is not null-sensitive by default; null-sensitivity is
    // introduced by pipes, function calls, or strict null comparisons inside
    // the expression, all handled by ExpressionMigrator.
    text.value.visit(this.exprMigrator, false);
    super.visitBoundText(text);
  }

  override visitTemplate(template: TmplAstTemplate) {
    const hasNgSwitch = this.hasNgSwitchBinding(template);
    if (hasNgSwitch) {
      const childHosts = template.children.filter(
        (child): child is TmplAstElement | TmplAstTemplate =>
          child instanceof TmplAstElement || child instanceof TmplAstTemplate,
      );
      this.ngSwitchShouldMigrateStack.push(!allNgSwitchCasesAreLiterals(childHosts));
    }

    for (const attr of template.templateAttrs) {
      if (!(attr instanceof TmplAstBoundAttribute)) {
        continue;
      }

      if (attr.name === 'ngIf') {
        attr.value.visit(this.exprMigrator, false);
      } else if (attr.name === 'ngSwitch' || attr.name === 'ngSwitchCase') {
        attr.value.visit(this.exprMigrator, this.shouldMigrateCurrentNgSwitchContext());
      } else if (attr.name === 'ngForOf') {
        // ngFor microsyntax expressions are not null-sensitive by default.
        // Still visit so nested null-sensitive sinks are handled.
        attr.value.visit(this.exprMigrator, false);
      } else {
        attr.value.visit(this.exprMigrator, true);
      }
    }

    super.visitTemplate(template);

    if (hasNgSwitch) {
      this.ngSwitchShouldMigrateStack.pop();
    }
  }

  override visitIfBlockBranch(block: TmplAstIfBlockBranch) {
    if (block.expression) {
      // @if condition: not null-sensitive by default (same logic as ngIf).
      block.expression.visit(this.exprMigrator, false);
    }
    super.visitIfBlockBranch(block);
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock) {
    block.expression.visit(this.exprMigrator, false);
    block.trackBy.visit(this.exprMigrator, false);
    super.visitForLoopBlock(block);
  }

  override visitLetDeclaration(decl: TmplAstLetDeclaration) {
    // @let value is assigned directly — null-sensitive.
    decl.value.visit(this.exprMigrator, true);
    super.visitLetDeclaration(decl);
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock) {
    const switchCases = block.groups.flatMap((group: TmplAstSwitchBlockCaseGroup) => group.cases);

    // Don't migrate if every case expression is a non-null/non-undefined literal
    // (e.g. strings, numbers, booleans). In that case null-vs-undefined can never
    // match a case, so wrapping the switch expression would be pointless.
    const shouldMigrate = !switchCases
      .filter((switchCase) => switchCase.expression)
      .every((switchCase) => isNonNullishLiteralAST(switchCase.expression!));

    if (shouldMigrate) {
      block.expression.visit(this.exprMigrator, true);
      for (const switchCase of switchCases) {
        this.migratableSwitchCases.add(switchCase);
      }
    }

    super.visitSwitchBlock(block);
  }

  override visitSwitchBlockCase(block: TmplAstSwitchBlockCase) {
    if (this.migratableSwitchCases.has(block) && block.expression) {
      block.expression.visit(this.exprMigrator, true);
    }
    super.visitSwitchBlockCase(block);
  }

  override visitDeferredTrigger(trigger: TmplAstDeferredTrigger) {
    if (trigger instanceof TmplAstBoundDeferredTrigger) {
      // @defer (when …): same logic as @if — not null-sensitive by default.
      trigger.value.visit(this.exprMigrator, false);
    }
    super.visitDeferredTrigger(trigger);
  }
}
