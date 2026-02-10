/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

import {GetTemplateExpressionsForDebugResponse} from '../../../common/requests';
import {AngularDebugTrackerFactory, TemplatePauseContext} from './debug_tracker';
import {DecorationManager} from './decoration_manager';
import {ExpressionEvaluator} from './expression_evaluator';

/**
 * Interface for the language client dependency.
 * Avoids circular dependency with the client module.
 */
export interface LanguageClientForDebug {
  getTemplateExpressionsForDebug(
    templateUri: vscode.Uri,
  ): Promise<GetTemplateExpressionsForDebugResponse | null>;
}

/**
 * TemplateDebugOverlay coordinates the debug overlay feature that shows live
 * template values from the running Angular application as decorations in
 * the original template file (`.html` or inline in `.ts`) during debugging.
 *
 * Architecture:
 * 1. A DebugAdapterTracker monitors debug events for "stopped" state
 * 2. When paused in a compiled Angular template function (*_Template):
 *    a. The Angular Language Service extracts template expressions via AST
 *    b. The ExpressionEvaluator evaluates `ctx.*` expressions via DAP
 *    c. The DecorationManager displays values as inline decorations
 */
export class TemplateDebugOverlay implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly decorationManager = new DecorationManager();
  private readonly expressionEvaluator = new ExpressionEvaluator();
  private enabled = true;
  private outputChannel: vscode.OutputChannel;

  constructor(private readonly client: LanguageClientForDebug) {
    this.outputChannel = vscode.window.createOutputChannel('Angular Template Debug');

    // Register the debug adapter tracker factory for all debug types
    const trackerFactory = new AngularDebugTrackerFactory(
      (
        session: vscode.DebugSession,
        frameId: number,
        source: {path?: string; name?: string},
        context: TemplatePauseContext,
      ) => this.onPausedInTemplate(session, frameId, source, context),
      () => this.onResumed(),
    );
    this.disposables.push(vscode.debug.registerDebugAdapterTrackerFactory('*', trackerFactory));

    // Clear decorations when debug session ends
    this.disposables.push(
      vscode.debug.onDidTerminateDebugSession(() => {
        this.decorationManager.clearAll();
      }),
    );

    // Read initial configuration
    this.enabled = this.getConfig().get<boolean>('debug.templateOverlay.enabled', true);

    // Watch for config changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('angular.debug.templateOverlay')) {
          this.enabled = this.getConfig().get<boolean>('debug.templateOverlay.enabled', true);
          if (!this.enabled) {
            this.decorationManager.clearAll();
          }
        }
      }),
    );
  }

  private getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration('angular');
  }

  /**
   * Toggle the overlay on/off.
   */
  toggle(): void {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.decorationManager.clearAll();
    }
    vscode.window.showInformationMessage(
      `Angular Template Debug Overlay: ${this.enabled ? 'Enabled' : 'Disabled'}`,
    );
  }

  /**
   * Called when the debugger pauses inside a compiled Angular template function.
   * Handles both creation phase (rf=1) and update phase (rf=2).
   *
   * During creation phase (rf=1):
   * - DOM elements are being created
   * - Signal values ARE available (component constructor has run)
   * - Shows values with a note about creation phase
   *
   * During update phase (rf=2):
   * - Bindings are being refreshed
   * - All signal values are current
   * - Full value display
   */
  private async onPausedInTemplate(
    session: vscode.DebugSession,
    frameId: number,
    source: {path?: string; name?: string},
    context: TemplatePauseContext,
  ): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const phaseLabel =
      context.renderFlags === 1 ? 'creation' : context.renderFlags === 2 ? 'update' : 'unknown';

    try {
      this.outputChannel.appendLine(
        `[Debug Overlay] Paused in template (${phaseLabel} phase, rf=${context.renderFlags}). ` +
          `Frame: ${frameId}, Source: ${source.path ?? source.name ?? 'unknown'}`,
      );

      // Step 1: Get template expressions from the Angular Language Service.
      // The LS uses the compiler AST to find all evaluatable expressions and
      // also tells us where the template lives (inline .ts or external .html).
      if (!source.path) {
        this.outputChannel.appendLine('[Debug Overlay] No source path available');
        return;
      }

      const sourceUri = vscode.Uri.file(source.path);
      const astResponse = await this.tryGetAstExpressions(sourceUri);

      if (!astResponse || astResponse.expressions.length === 0) {
        this.outputChannel.appendLine(
          `[Debug Overlay] No expressions found from Angular compiler (response=${JSON.stringify(astResponse)})`,
        );
        return;
      }

      const templateUri = vscode.Uri.parse(astResponse.templateUri);
      this.outputChannel.appendLine(
        `[Debug Overlay] Template: ${templateUri.fsPath} (${astResponse.isInline ? 'inline' : 'external'}), ` +
          `${astResponse.expressions.length} expressions`,
      );

      // Step 2: Open the template editor
      let templateEditor: vscode.TextEditor;

      if (astResponse.isInline) {
        // For inline templates, decorations go in the same .ts file
        const existingEditor = vscode.window.visibleTextEditors.find(
          (e) => e.document.uri.fsPath === templateUri.fsPath,
        );
        if (existingEditor) {
          templateEditor = existingEditor;
        } else {
          const templateDoc = await vscode.workspace.openTextDocument(templateUri);
          templateEditor = await vscode.window.showTextDocument(templateDoc, {
            preserveFocus: true,
            preview: true,
          });
        }
      } else {
        // For external templates, open the .html file in a side panel
        const templateDoc = await vscode.workspace.openTextDocument(templateUri);
        templateEditor = await vscode.window.showTextDocument(templateDoc, {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: true,
          preview: true,
        });
      }

      // Step 3: Evaluate expressions via DAP
      const maxValueLength = this.getConfig().get<number>(
        'debug.templateOverlay.maxValueLength',
        50,
      );

      // Log each AST expression for debugging
      for (const expr of astResponse.expressions) {
        this.outputChannel.appendLine(
          `[Debug Overlay]   AST expr: line=${expr.line}, col=${expr.column}, ` +
            `kind=${expr.kind}, expression="${expr.expression}", ` +
            `dapExpression="${expr.dapExpression}"`,
        );
      }

      const evaluatedValues = await this.expressionEvaluator.evaluateAstExpressions(
        session,
        frameId,
        astResponse.expressions,
        maxValueLength,
      );

      // Log each evaluated result
      for (const val of evaluatedValues) {
        this.outputChannel.appendLine(
          `[Debug Overlay]   Result: line=${val.line}, label="${val.label}", ` +
            `value="${val.value}", success=${val.success}`,
        );
      }
      this.outputChannel.appendLine(
        `[Debug Overlay] Evaluated ${evaluatedValues.length} expressions (${phaseLabel} phase). ` +
          `Editor lineCount=${templateEditor.document.lineCount}`,
      );

      // Step 4: Apply decorations with phase context
      this.decorationManager.applyDecorations(templateEditor, evaluatedValues, phaseLabel);
    } catch (e) {
      this.outputChannel.appendLine(
        `[Debug Overlay] Error: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  /**
   * Called when the debugger resumes execution.
   */
  private onResumed(): void {
    this.decorationManager.clearAll();
  }

  /**
   * Try to get AST-based expressions from the Angular Language Service.
   * Returns null if the LS is not running or the request fails.
   */
  private async tryGetAstExpressions(templateUri: vscode.Uri) {
    try {
      const response = await this.client.getTemplateExpressionsForDebug(templateUri);
      return response;
    } catch (e) {
      this.outputChannel.appendLine(
        `[Debug Overlay] AST request failed: ${e instanceof Error ? e.message : String(e)}`,
      );
      return null;
    }
  }

  dispose(): void {
    this.decorationManager.clearAll();
    this.outputChannel.dispose();
    for (const d of this.disposables) {
      d.dispose();
    }
  }
}
