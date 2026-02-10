/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

/**
 * Result of evaluating a single template expression via DAP.
 */
export interface EvaluatedValue {
  /** Line number in the template (0-indexed). */
  line: number;
  /** The display label for this expression. */
  label: string;
  /** The evaluated value as a formatted string. */
  value: string;
  /** Character column in the template line. */
  column: number;
  /** Whether the evaluation succeeded. */
  success: boolean;
}

/**
 * ExpressionEvaluator uses the Debug Adapter Protocol's "evaluate" request
 * to evaluate Angular template expressions in the context of a paused
 * debug frame.
 */
export class ExpressionEvaluator {
  /**
   * Evaluate expressions from the Angular Language Service AST via DAP.
   * Each expression includes a pre-computed `dapExpression` string that
   * can be evaluated directly in the debug frame context.
   */
  async evaluateAstExpressions(
    session: vscode.DebugSession,
    frameId: number,
    expressions: ReadonlyArray<{
      line: number;
      column: number;
      expression: string;
      dapExpression: string;
      kind: string;
    }>,
    maxValueLength: number = 50,
  ): Promise<EvaluatedValue[]> {
    const results: EvaluatedValue[] = [];
    const evaluationPromises: Promise<void>[] = [];

    for (const expr of expressions) {
      const promise = this.evaluateAstSingle(session, frameId, expr, maxValueLength).then(
        (result) => {
          if (result) {
            results.push(result);
          }
        },
      );
      evaluationPromises.push(promise);
    }

    await Promise.all(evaluationPromises.map((p) => p.catch(() => {})));
    return results;
  }

  /**
   * Evaluate a single AST-based expression via DAP.
   */
  private async evaluateAstSingle(
    session: vscode.DebugSession,
    frameId: number,
    expr: {
      line: number;
      column: number;
      expression: string;
      dapExpression: string;
      kind: string;
    },
    maxValueLength: number,
  ): Promise<EvaluatedValue | null> {
    try {
      const response = await session.customRequest('evaluate', {
        expression: expr.dapExpression,
        frameId,
        context: 'watch',
      });

      if (!response) {
        return null;
      }

      const formattedValue = this.formatValue(
        response.result,
        response.type,
        response.indexedVariables,
        maxValueLength,
      );

      return {
        line: expr.line,
        label: expr.expression,
        value: formattedValue,
        column: expr.column,
        success: true,
      };
    } catch {
      return {
        line: expr.line,
        label: expr.expression,
        value: '<unavailable>',
        column: expr.column,
        success: false,
      };
    }
  }

  /**
   * Format a DAP evaluate result for display.
   *
   * Handles different value types:
   * - Primitives (boolean, number, string)
   * - Objects (truncated JSON-like representation)
   * - Arrays (show count + few elements)
   * - null/undefined
   * - Signals (unwrap Signal wrapper)
   * - Resources (show status + value)
   */
  private formatValue(
    result: string,
    type?: string,
    indexedVariables?: number,
    maxLength: number = 50,
  ): string {
    if (result === undefined || result === null) {
      return 'undefined';
    }

    // If it looks like a Signal wrapper, extract the value
    if (result.startsWith('Signal{') || result.startsWith('WritableSignal{')) {
      return result;
    }

    // If it's an array with count
    if (indexedVariables !== undefined && indexedVariables > 0) {
      const truncated = result.length > maxLength ? result.substring(0, maxLength) + '...' : result;
      return `[${indexedVariables} items] ${truncated}`;
    }

    // Truncate long values
    if (result.length > maxLength) {
      return result.substring(0, maxLength) + '...';
    }

    return result;
  }
}
