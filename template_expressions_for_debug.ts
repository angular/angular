/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AST,
  ASTWithSource,
  Binary,
  BindingPipe,
  Call,
  Conditional,
  ImplicitReceiver,
  Interpolation,
  KeyedRead,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  NonNullAssert,
  PrefixNot,
  PropertyRead,
  SafeCall,
  SafeKeyedRead,
  SafePropertyRead,
  ThisReceiver,
  TmplAstBoundAttribute,
  TmplAstBoundText,
  TmplAstForLoopBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstRecursiveVisitor,
  TmplAstSwitchBlock,
  tmplAstVisitAll,
  Unary,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {isExternalResource} from '@angular/compiler-cli/src/ngtsc/metadata';
import ts from 'typescript';

import {GetTemplateExpressionsForDebugResponse, TemplateExpressionForDebug} from '../api';

import {getFirstComponentForTemplateFile} from './utils';

/**
 * Gets all evaluatable template expressions for a given file, using the
 * Angular template AST. This is the AST-based replacement for the client-side
 * regex-based expression extractor.
 *
 * For template (.html) files: returns expressions with positions relative to
 * the template file.
 *
 * For component (.ts) files with inline templates: returns expressions with
 * positions adjusted to be absolute line numbers in the .ts file.
 */
export function getTemplateExpressionsForDebug(
  fileName: string,
  compiler: NgCompiler,
): GetTemplateExpressionsForDebugResponse | undefined {
  const isTypeScript = fileName.endsWith('.ts');

  if (isTypeScript) {
    return getExpressionsForComponentFile(fileName, compiler);
  }

  // External template file (.html)
  const info = getFirstComponentForTemplateFile(fileName, compiler);
  if (info === undefined) {
    return undefined;
  }

  const componentName = info.declaration.name?.text ?? '<anonymous>';
  const expressions: TemplateExpressionForDebug[] = [];
  const walker = new TemplateExpressionWalker(expressions);
  tmplAstVisitAll(walker, info.nodes);

  return {expressions, isInline: false, componentName, templateFilePath: fileName};
}

/**
 * Get template expressions for a .ts component file.
 * Handles both inline templates (template: `...`) and external templates (templateUrl: '...').
 */
function getExpressionsForComponentFile(
  fileName: string,
  compiler: NgCompiler,
): GetTemplateExpressionsForDebugResponse | undefined {
  const sf = compiler.getCurrentProgram().getSourceFile(fileName);
  if (sf === undefined) {
    return undefined;
  }

  const templateTypeChecker = compiler.getTemplateTypeChecker();
  let result: GetTemplateExpressionsForDebugResponse | undefined;

  ts.forEachChild(sf, function visit(node: ts.Node) {
    if (result !== undefined) return; // Only process the first component found

    if (ts.isClassDeclaration(node) && node.name) {
      const template = templateTypeChecker.getTemplate(node);
      if (template !== null) {
        const resources = compiler.getDirectiveResources(node);
        if (!resources?.template) return;

        const componentName = node.name.text;
        const expressions: TemplateExpressionForDebug[] = [];
        const walker = new TemplateExpressionWalker(expressions);
        tmplAstVisitAll(walker, template);

        if (isExternalResource(resources.template)) {
          // External template — expressions have line numbers relative to the .html file
          result = {
            expressions,
            isInline: false,
            componentName,
            templateFilePath: resources.template.path,
          };
        } else {
          // Inline template — expressions already have absolute line numbers in the .ts file
          result = {
            expressions,
            isInline: true,
            componentName,
            templateFilePath: fileName,
          };
        }
      }
    }
    ts.forEachChild(node, visit);
  });

  return result;
}

/**
 * Walks the template AST to collect evaluatable expressions.
 *
 * Extends Angular's `TmplAstRecursiveVisitor` to inherit correct recursive
 * traversal of all template node types (elements, components, directives,
 * control flow blocks, deferred blocks, etc.). Only the expression-bearing
 * nodes are overridden to extract DAP-evaluatable expressions.
 */
class TemplateExpressionWalker extends TmplAstRecursiveVisitor {
  constructor(private expressions: TemplateExpressionForDebug[]) {
    super();
  }

  override visitBoundText(text: TmplAstBoundText): void {
    const value = text.value;
    if (value instanceof ASTWithSource && value.ast instanceof Interpolation) {
      for (const expr of value.ast.expressions) {
        this.addExpression(expr, text.sourceSpan, 'interpolation');
      }
    } else {
      this.addExpression(text.value, text.sourceSpan, 'interpolation');
    }
    // No super call needed — BoundText has no children in RecursiveVisitor
  }

  override visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    // Use valueSpan for precise positioning when available
    const span = attribute.valueSpan ?? attribute.sourceSpan;
    this.addExpression(attribute.value, span, 'binding');
    // No super call needed — BoundAttribute is a leaf in RecursiveVisitor
  }

  override visitIfBlockBranch(branch: TmplAstIfBlockBranch): void {
    if (branch.expression !== null) {
      this.addExpression(branch.expression, branch.sourceSpan, 'controlFlow');
    }
    super.visitIfBlockBranch(branch); // Recurse into branch children
  }

  override visitForLoopBlock(block: TmplAstForLoopBlock): void {
    this.addExpression(block.expression, block.sourceSpan, 'forLoop');
    super.visitForLoopBlock(block); // Recurse into block children + empty
  }

  override visitSwitchBlock(block: TmplAstSwitchBlock): void {
    this.addExpression(block.expression, block.sourceSpan, 'controlFlow');
    super.visitSwitchBlock(block); // Recurse into switch groups
  }

  override visitLetDeclaration(decl: TmplAstLetDeclaration): void {
    this.addExpression(decl.value, decl.valueSpan, 'binding');
    // No super call needed — LetDeclaration is a leaf in RecursiveVisitor
  }

  // -------------------------------------------------------------------
  // Core: add an expression to the result set
  // -------------------------------------------------------------------

  private addExpression(
    ast: AST,
    span: import('@angular/compiler').ParseSourceSpan,
    kind: TemplateExpressionForDebug['kind'],
  ): void {
    const rawExpr = ast instanceof ASTWithSource ? ast.ast : ast;
    const source = ast instanceof ASTWithSource ? ast.source : null;

    if (!rawExpr || rawExpr instanceof ImplicitReceiver) {
      return;
    }

    const rawSource = source ?? astToString(rawExpr);
    const dapExpr = toDapExpression(rawExpr);
    if (!dapExpr) return;

    this.expressions.push({
      expression: rawSource,
      dapExpression: dapExpr,
      displayLabel: truncate(rawSource, 40),
      kind,
      line: span.start.line,
      column: span.start.col,
    });
  }
}

// -------------------------------------------------------------------
// AST → DAP expression conversion
// -------------------------------------------------------------------

/**
 * Convert an Angular expression AST node to a DAP-evaluatable JavaScript
 * expression. Component member references are prefixed with `ctx.`.
 * Pipes are stripped (evaluate the base expression only).
 */
function toDapExpression(ast: AST): string | null {
  if (ast instanceof ASTWithSource) {
    return toDapExpression(ast.ast);
  }

  if (ast instanceof PropertyRead) {
    if (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver) {
      return `ctx.${ast.name}`;
    }
    const receiver = toDapExpression(ast.receiver);
    return receiver ? `${receiver}.${ast.name}` : null;
  }

  if (ast instanceof SafePropertyRead) {
    if (ast.receiver instanceof ImplicitReceiver || ast.receiver instanceof ThisReceiver) {
      return `ctx.${ast.name}`;
    }
    const receiver = toDapExpression(ast.receiver);
    return receiver ? `${receiver}?.${ast.name}` : null;
  }

  if (ast instanceof Call) {
    const receiver = toDapExpression(ast.receiver);
    if (!receiver) return null;
    const args = ast.args.map(toDapExpression).filter((a): a is string => a !== null);
    return `${receiver}(${args.join(', ')})`;
  }

  if (ast instanceof SafeCall) {
    const receiver = toDapExpression(ast.receiver);
    if (!receiver) return null;
    const args = ast.args.map(toDapExpression).filter((a): a is string => a !== null);
    return `${receiver}?.(${args.join(', ')})`;
  }

  if (ast instanceof KeyedRead) {
    const obj = toDapExpression(ast.receiver);
    const key = toDapExpression(ast.key);
    return obj && key ? `${obj}[${key}]` : null;
  }

  if (ast instanceof SafeKeyedRead) {
    const obj = toDapExpression(ast.receiver);
    const key = toDapExpression(ast.key);
    return obj && key ? `${obj}?.[${key}]` : null;
  }

  if (ast instanceof LiteralPrimitive) {
    return JSON.stringify(ast.value);
  }

  if (ast instanceof LiteralArray) {
    const elements = ast.expressions.map(toDapExpression).filter((a): a is string => a !== null);
    return `[${elements.join(', ')}]`;
  }

  if (ast instanceof LiteralMap) {
    const entries: string[] = [];
    for (let i = 0; i < ast.keys.length; i++) {
      const key = ast.keys[i];
      const value = toDapExpression(ast.values[i]);
      if (key.kind === 'property' && value) {
        const keyStr = key.quoted ? `"${key.key}"` : key.key;
        entries.push(`${keyStr}: ${value}`);
      }
    }
    return `{${entries.join(', ')}}`;
  }

  if (ast instanceof Conditional) {
    const cond = toDapExpression(ast.condition);
    const trueExp = toDapExpression(ast.trueExp);
    const falseExp = toDapExpression(ast.falseExp);
    return cond && trueExp && falseExp ? `(${cond} ? ${trueExp} : ${falseExp})` : null;
  }

  if (ast instanceof Binary) {
    const left = toDapExpression(ast.left);
    const right = toDapExpression(ast.right);
    return left && right ? `(${left} ${ast.operation} ${right})` : null;
  }

  if (ast instanceof Unary) {
    const operand = toDapExpression(ast.expr);
    return operand ? `${ast.operator}${operand}` : null;
  }

  if (ast instanceof PrefixNot) {
    const expr = toDapExpression(ast.expression);
    return expr ? `!${expr}` : null;
  }

  if (ast instanceof NonNullAssert) {
    // DAP doesn't have non-null assertion — just evaluate the expression
    return toDapExpression(ast.expression);
  }

  if (ast instanceof BindingPipe) {
    // Pipes don't exist at runtime — evaluate only the base expression
    return toDapExpression(ast.exp);
  }

  if (ast instanceof Interpolation) {
    // Shouldn't happen at this level, but handle gracefully
    if (ast.expressions.length === 1) {
      return toDapExpression(ast.expressions[0]);
    }
    return null;
  }

  if (ast instanceof ImplicitReceiver || ast instanceof ThisReceiver) {
    return 'ctx';
  }

  // Fallback: if we have source text, use with(ctx) approach
  if (ast instanceof ASTWithSource && ast.source) {
    return `(function(){with(ctx){return (${ast.source});}})()`;
  }

  return null;
}

/**
 * Convert an AST back to a human-readable string for display labels.
 */
function astToString(ast: AST): string {
  if (ast instanceof ASTWithSource) {
    return ast.source ?? astToString(ast.ast);
  }
  if (ast instanceof PropertyRead) {
    if (ast.receiver instanceof ImplicitReceiver) return ast.name;
    return `${astToString(ast.receiver)}.${ast.name}`;
  }
  if (ast instanceof SafePropertyRead) {
    if (ast.receiver instanceof ImplicitReceiver) return ast.name;
    return `${astToString(ast.receiver)}?.${ast.name}`;
  }
  if (ast instanceof Call) {
    const args = ast.args.map(astToString).join(', ');
    return `${astToString(ast.receiver)}(${args})`;
  }
  if (ast instanceof BindingPipe) {
    return `${astToString(ast.exp)} | ${ast.name}`;
  }
  if (ast instanceof LiteralPrimitive) {
    return JSON.stringify(ast.value);
  }
  if (ast instanceof Conditional) {
    return `${astToString(ast.condition)} ? ${astToString(ast.trueExp)} : ${astToString(ast.falseExp)}`;
  }
  return '<expr>';
}

function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.substring(0, maxLength - 1) + '…' : str;
}
