import type * as vscode from 'vscode';

export class InlineStylesDocCache {
  private readonly entries = new Map<string, {version: number; document: vscode.TextDocument}>();

  get(sourceUri: string, sourceVersion: number): vscode.TextDocument | null {
    const entry = this.entries.get(sourceUri);
    if (!entry) {
      return null;
    }
    return entry.version === sourceVersion ? entry.document : null;
  }

  set(sourceUri: string, sourceVersion: number, document: vscode.TextDocument): void {
    this.entries.set(sourceUri, {version: sourceVersion, document});
  }

  invalidate(sourceUri: string): void {
    this.entries.delete(sourceUri);
  }
}

export function normalizeColorPresentations(
  presentations: vscode.ColorPresentation[],
  range: vscode.Range,
): vscode.ColorPresentation[] {
  return presentations.map((presentation) => {
    const replacement = presentation.textEdit?.newText ?? presentation.label;
    return {
      ...presentation,
      textEdit: {range, newText: replacement} as vscode.TextEdit,
    };
  });
}

export function createFallbackColorPresentations(
  color: vscode.Color,
  range: vscode.Range,
): vscode.ColorPresentation[] {
  const red = Math.round(color.red * 255);
  const green = Math.round(color.green * 255);
  const blue = Math.round(color.blue * 255);
  const alpha = Number(color.alpha.toFixed(3));
  const cssText =
    alpha < 1 ? `rgb(${red} ${green} ${blue} / ${alpha})` : `rgb(${red} ${green} ${blue})`;

  return [
    {
      label: cssText,
      textEdit: {range, newText: cssText} as vscode.TextEdit,
    },
  ];
}

export function selectColorPresentations(
  providerPresentations: vscode.ColorPresentation[],
  color: vscode.Color,
  range: vscode.Range,
): vscode.ColorPresentation[] {
  return providerPresentations.length > 0
    ? normalizeColorPresentations(providerPresentations, range)
    : createFallbackColorPresentations(color, range);
}
