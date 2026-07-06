import * as vscode from 'vscode';
import {activate, INLAY_HINTS_COMPONENT_URI, INLAY_HINTS_EXTERNAL_TEMPLATE_URI} from './helper';

const INLAY_HINT_COMMAND = 'vscode.executeInlayHintProvider';

describe('Angular LS inlay hints', () => {
  let previousForLoopVariableTypes: boolean | undefined;
  let previousEditorInlayHintsEnabled: string | boolean | undefined;

  beforeAll(async () => {
    const angularConfig = vscode.workspace.getConfiguration('angular');
    previousForLoopVariableTypes = angularConfig.get<boolean>(
      'inlayHints.variableTypes.forLoopVariableTypes',
    );
    await angularConfig.update(
      'inlayHints.variableTypes.forLoopVariableTypes',
      true,
      vscode.ConfigurationTarget.Workspace,
    );

    const editorConfig = vscode.workspace.getConfiguration('editor');
    previousEditorInlayHintsEnabled = editorConfig.get<string | boolean>('inlayHints.enabled');
    await editorConfig.update('inlayHints.enabled', 'on', vscode.ConfigurationTarget.Workspace);
  });

  afterAll(async () => {
    const angularConfig = vscode.workspace.getConfiguration('angular');
    await angularConfig.update(
      'inlayHints.variableTypes.forLoopVariableTypes',
      previousForLoopVariableTypes,
      vscode.ConfigurationTarget.Workspace,
    );

    const editorConfig = vscode.workspace.getConfiguration('editor');
    await editorConfig.update(
      'inlayHints.enabled',
      previousEditorInlayHintsEnabled,
      vscode.ConfigurationTarget.Workspace,
    );
  });

  it('should return an Angular-specific inlay hint for inline template', async () => {
    await activate(INLAY_HINTS_COMPONENT_URI);

    const inlineDocument = await vscode.workspace.openTextDocument(INLAY_HINTS_COMPONENT_URI);
    const inlineRange = new vscode.Range(
      new vscode.Position(0, 0),
      inlineDocument.lineAt(inlineDocument.lineCount - 1).range.end,
    );
    const hints = await vscode.commands.executeCommand<vscode.InlayHint[]>(
      INLAY_HINT_COMMAND,
      INLAY_HINTS_COMPONENT_URI,
      inlineRange,
    );

    expect(hints).toBeDefined();
    expect(hints!.length).toBeGreaterThan(0);

    const hasNumberHint = hints!.some((hint) => {
      const label =
        typeof hint.label === 'string' ? hint.label : hint.label.map((l) => l.value).join('');
      return label.includes(': number');
    });
    expect(hasNumberHint).toBeTrue();
  });

  it('should return an Angular-specific inlay hint for external template', async () => {
    await activate(INLAY_HINTS_EXTERNAL_TEMPLATE_URI);

    const externalDocument = await vscode.workspace.openTextDocument(
      INLAY_HINTS_EXTERNAL_TEMPLATE_URI,
    );
    const externalRange = new vscode.Range(
      new vscode.Position(0, 0),
      externalDocument.lineAt(externalDocument.lineCount - 1).range.end,
    );
    const hints = await vscode.commands.executeCommand<vscode.InlayHint[]>(
      INLAY_HINT_COMMAND,
      INLAY_HINTS_EXTERNAL_TEMPLATE_URI,
      externalRange,
    );

    expect(hints).toBeDefined();
    expect(hints!.length).toBeGreaterThan(0);

    const hasNumberHint = hints!.some((hint) => {
      const label =
        typeof hint.label === 'string' ? hint.label : hint.label.map((l) => l.value).join('');
      return label.includes(': number');
    });
    expect(hasNumberHint).toBeTrue();
  });
});
