/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbsoluteSourceSpan, ParseSourceSpan} from '@angular/compiler';
import ts from 'typescript';
import {CommentTriviaType, ExpressionIdentifier} from '../comments';

/** Represents an expression generated within a type check block. */
export class TcbExpr {
  /** Text for the content containing the expression's location information. */
  private spanComment: string | null = null;

  /** Text for the content containing the expression's identifier. */
  private identifierComment: string | null = null;

  /**
   * Text of the comment instructing the type checker to
   * ignore diagnostics coming from this expression.
   */
  private ignoreComment: string | null = null;

  constructor(private source: string) {}

  /**
   * Converts the node's current state to a string.
   * @param ignoreComments Whether the comments associated with the expression should be skipped.
   */
  print(ignoreComments = false): string {
    if (ignoreComments) {
      return this.source;
    }

    return (
      this.source +
      this.formatComment(this.identifierComment) +
      this.formatComment(this.ignoreComment) +
      this.formatComment(this.spanComment)
    );
  }

  /**
   * Adds a synthetic comment to the expression that represents the parse span of the provided node.
   * This comment can later be retrieved as trivia of a node to recover original source locations.
   * @param span Span from the parser containing the location information.
   */
  addParseSpanInfo(span: AbsoluteSourceSpan | ParseSourceSpan): this {
    let start: number;
    let end: number;

    if (span instanceof AbsoluteSourceSpan) {
      start = span.start;
      end = span.end;
    } else {
      start = span.start.offset;
      end = span.end.offset;
    }

    this.spanComment = `${start},${end}`;
    return this;
  }

  /** Marks the expression to be ignored for diagnostics. */
  markIgnoreDiagnostics(): this {
    this.ignoreComment = `${CommentTriviaType.DIAGNOSTIC}:ignore`;
    return this;
  }

  /**
   * Wraps the expression in parenthesis such that inserted
   * span comments become attached to the proper node.
   */
  wrapForTypeChecker(): this {
    this.source = `(${this.print()})`;
    this.spanComment = this.identifierComment = this.ignoreComment = null;
    return this;
  }

  /**
   * Tags the expression with an identifier.
   * @param identifier Identifier to apply to the expression.
   */
  addExpressionIdentifier(identifier: ExpressionIdentifier, id?: number): this {
    this.identifierComment = `${CommentTriviaType.EXPRESSION_TYPE_IDENTIFIER}:${identifier}${id !== undefined ? `:${id}` : ''}`;
    return this;
  }

  /**
   * `toString` implementation meant to catch errors like accidentally
   * writing `foo ${expr} bar` instead of `foo ${expr.print()} bar`.
   */
  toString(): never {
    throw new Error(
      'Assertion error: TcbExpr should not be converted to a string through concatenation. ' +
        'Use the `print` method instead.',
    );
  }

  /** Format a comment string as a TypeScript comment. */
  private formatComment(content: string | null): string {
    return content === null || content.length === 0 ? '' : ` /*${content}*/`;
  }
}

/**
 * Declares a variable with a specific type.
 * @param identifier Identifier used to refer to the variable.
 * @param type Type that the variable should be initialized to.
 */
export function declareVariable(identifier: TcbExpr, type: TcbExpr): TcbExpr {
  type.addExpressionIdentifier(ExpressionIdentifier.VARIABLE_AS_EXPRESSION);
  return new TcbExpr(`var ${identifier.print()} = null! as ${type.print()}`);
}

/**
 * Formats an array of `TcbExpr` as a block of single statements.
 * @param expressions Expressions to format.
 * @param singleLine Whether to print them on a single line or across multiple. Defaults to multiple.
 */
export function getStatementsBlock(expressions: TcbExpr[], singleLine = false): string {
  let result = '';
  for (const expr of expressions) {
    result += `${expr.print()};${singleLine ? ' ' : '\n'}`;
  }
  return result;
}

/** Wraps a string value in quotes and escapes relevant characters. */
export function quoteAndEscape(value: string): string {
  // Passing the value through `JSON.stringify` automatically
  // escapes quotes and allows us to handle line breaks.
  return JSON.stringify(value);
}

let tempPrinter: ts.Printer | null = null;

/**
 * Prints a TypeScript node as a string.
 *
 * @deprecated This is a temporary method until all code generation code has been migrated.
 */
export function tempPrint(node: ts.Node, sourceFile: ts.SourceFile): string {
  tempPrinter ??= ts.createPrinter();
  return tempPrinter.printNode(ts.EmitHint.Unspecified, node, sourceFile);
}
