import * as vscode from 'vscode';
import {setTimeout} from 'node:timers/promises';

import {
  activate,
  APP_COMPONENT_URI,
  COMPLETION_COMMAND,
  DEFINITION_COMMAND,
  DOCUMENT_SYMBOL_COMMAND,
  SELECTION_RANGE_COMMAND,
} from './helper';

describe('Angular LS inline styles command bridges', () => {
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20_000;

  beforeAll(async () => {
    await activate(APP_COMPONENT_URI);
  });

  it('includes style symbol containers for each inline styles block and maps ranges to source TS', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();
    const firstBlockOffset = content.indexOf('$color: #ff0000;');
    const secondBlockOffset = content.indexOf('.blue {');

    expect(firstBlockOffset).toBeGreaterThan(-1);
    expect(secondBlockOffset).toBeGreaterThan(-1);

    const firstBlockPosition = document.positionAt(firstBlockOffset);
    const secondBlockPosition = document.positionAt(secondBlockOffset);

    const symbols = await waitForDocumentSymbols(APP_COMPONENT_URI);
    const styleContainers = collectDocumentSymbolsByPrefix(symbols, '(styles)');

    expect(styleContainers.length).toBe(2);
    expect(styleContainers.every((symbol) => symbol.children.length > 0)).toBeTrue();

    const firstCovered = styleContainers.some((symbol) =>
      symbol.range.contains(firstBlockPosition),
    );
    const secondCovered = styleContainers.some((symbol) =>
      symbol.range.contains(secondBlockPosition),
    );
    expect(firstCovered).toBeTrue();
    expect(secondCovered).toBeTrue();

    const childNames = styleContainers
      .flatMap((symbol) => symbol.children)
      .map((child) => child.name)
      .join('\n');
    expect(childNames).toContain('.red');
    expect(childNames).toContain('.blue');
  });

  it('returns one selection range chain per inline-style position across separate blocks', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();
    const firstUsageOffset = content.indexOf('$color;');
    const secondUsageOffset = content.indexOf('$color;', firstUsageOffset + 1);

    expect(firstUsageOffset).toBeGreaterThan(-1);
    expect(secondUsageOffset).toBeGreaterThan(-1);

    const firstPosition = document.positionAt(firstUsageOffset + 2);
    const secondPosition = document.positionAt(secondUsageOffset + 2);

    const ranges =
      (await vscode.commands.executeCommand<vscode.SelectionRange[]>(
        SELECTION_RANGE_COMMAND,
        APP_COMPONENT_URI,
        [firstPosition, secondPosition],
      )) ?? [];

    expect(ranges.length).toBe(2);
    expect(ranges[0].range.contains(firstPosition)).toBeTrue();
    expect(ranges[1].range.contains(secondPosition)).toBeTrue();
    expect(ranges[0].range.start.line).not.toBe(ranges[1].range.start.line);
    expect(document.getText(ranges[0].range)).toContain('$color');
    expect(document.getText(ranges[1].range)).toContain('$color');
    expect(ranges[0].parent).toBeDefined();
    expect(ranges[1].parent).toBeDefined();
  });

  it('maps inline style definition results back to source TypeScript URI and declaration text', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();
    const declarationIndex = content.indexOf('$color:');
    const usageIndex = content.indexOf('$color;', declarationIndex + 1);

    expect(declarationIndex).toBeGreaterThan(-1);
    expect(usageIndex).toBeGreaterThan(-1);

    const usagePosition = document.positionAt(usageIndex + 1);
    const definitions = await waitForDefinitions(APP_COMPONENT_URI, usagePosition);

    expect(definitions.length).toBe(1);

    const first = definitions[0];
    const targetUri = 'targetUri' in first ? first.targetUri : first.uri;
    const targetRange = 'targetRange' in first ? first.targetRange : first.range;
    expect(targetUri.toString()).toBe(APP_COMPONENT_URI.toString());

    const declarationText = document.getText(targetRange);
    expect(declarationText).toContain('$color');
    expect(declarationText).toContain(': #ff0000');

    const declarationLineText = document.lineAt(targetRange.start.line).text;
    expect(declarationLineText).toContain('$color: #ff0000;');

    const expectedDeclarationLine = document.positionAt(declarationIndex).line;
    expect(targetRange.start.line).toBe(expectedDeclarationLine);
  });

  it('does not resolve definitions across inline style blocks', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();
    const declarationIndex = content.indexOf('$color:');
    const firstUsageIndex = content.indexOf('$color;', declarationIndex + 1);
    const secondUsageIndex = content.indexOf('$color;', firstUsageIndex + 1);

    expect(secondUsageIndex).toBeGreaterThan(-1);

    const secondUsagePosition = document.positionAt(secondUsageIndex + 1);
    const definitions =
      (await vscode.commands.executeCommand<(vscode.Location | vscode.DefinitionLink)[]>(
        DEFINITION_COMMAND,
        APP_COMPONENT_URI,
        secondUsagePosition,
      )) ?? [];

    expect(definitions.length).toBe(0);
  });

  it('returns inline template style-attribute completions with valid documentation markup', async () => {
    const document = await vscode.workspace.openTextDocument(APP_COMPONENT_URI);
    const content = document.getText();
    const styleAttrIndex = content.indexOf('style="co"');

    expect(styleAttrIndex).toBeGreaterThan(-1);

    const position = document.positionAt(styleAttrIndex + 'style="co'.length);
    const completionList =
      (await vscode.commands.executeCommand<vscode.CompletionList>(
        COMPLETION_COMMAND,
        APP_COMPONENT_URI,
        position,
        undefined,
        25,
      )) ?? new vscode.CompletionList([]);

    expect(completionList.items.length).toBeGreaterThan(0);

    const sampledItems = completionList.items.slice(0, 25);

    expect(sampledItems.length).toBeGreaterThan(0);
    expect(sampledItems.every((item) => hasValidCompletionDocumentation(item))).toBeTrue();
  });
});

function hasDocumentSymbolName(
  symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[],
  name: string,
): boolean {
  if (symbols.length === 0) {
    return false;
  }

  if (isSymbolInformationArray(symbols)) {
    return symbols.some((symbol) => symbol.name === name);
  }

  const stack = [...symbols];
  while (stack.length > 0) {
    const symbol = stack.pop()!;
    if (symbol.name === name) {
      return true;
    }
    stack.push(...symbol.children);
  }

  return false;
}

function collectDocumentSymbolsByPrefix(
  symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[],
  namePrefix: string,
): vscode.DocumentSymbol[] {
  if (symbols.length === 0 || isSymbolInformationArray(symbols)) {
    return [];
  }

  const matches: vscode.DocumentSymbol[] = [];
  const stack = [...symbols];
  while (stack.length > 0) {
    const symbol = stack.pop()!;
    if (symbol.name.startsWith(namePrefix)) {
      matches.push(symbol);
    }
    stack.push(...symbol.children);
  }

  return matches;
}

function isSymbolInformationArray(
  symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[],
): symbols is vscode.SymbolInformation[] {
  return symbols.length > 0 && !('children' in symbols[0]);
}

function hasValidCompletionDocumentation(item: vscode.CompletionItem): boolean {
  const documentation = item.documentation;
  return (
    documentation === undefined ||
    typeof documentation === 'string' ||
    documentation instanceof vscode.MarkdownString
  );
}

async function waitForDocumentSymbols(
  uri: vscode.Uri,
): Promise<vscode.DocumentSymbol[] | vscode.SymbolInformation[]> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const symbols =
      (await vscode.commands.executeCommand<vscode.DocumentSymbol[] | vscode.SymbolInformation[]>(
        DOCUMENT_SYMBOL_COMMAND,
        uri,
      )) ?? [];

    if (hasDocumentSymbolName(symbols, '(styles)')) {
      return symbols;
    }

    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for inline styles symbols in ${uri.toString()}`);
}

async function waitForDefinitions(
  uri: vscode.Uri,
  position: vscode.Position,
): Promise<(vscode.Location | vscode.DefinitionLink)[]> {
  const timeoutMs = 15_000;
  const pollMs = 250;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const definitions =
      (await vscode.commands.executeCommand<(vscode.Location | vscode.DefinitionLink)[]>(
        DEFINITION_COMMAND,
        uri,
        position,
      )) ?? [];

    if (definitions.length > 0) {
      return definitions;
    }

    await setTimeout(pollMs);
  }

  throw new Error(`Timed out waiting for definitions in ${uri.toString()}`);
}
