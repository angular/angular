/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';
import TextmateLanguageService from 'vscode-textmate-languageservice';

import {activate, MARKDOWN_FENCES_URI} from './helper';

function positionOf(document: vscode.TextDocument, needle: string): vscode.Position {
  const index = document.getText().indexOf(needle);
  expect(index).toBeGreaterThanOrEqual(0);
  return document.positionAt(index);
}

function positionOfMarkerWithOffset(
  document: vscode.TextDocument,
  needle: string,
  n: number,
  offset: number,
): vscode.Position {
  let from = 0;
  let index = -1;
  for (let i = 0; i < n; i++) {
    index = document.getText().indexOf(needle, from);
    expect(index).toBeGreaterThanOrEqual(0);
    from = index + needle.length;
  }
  return document.positionAt(index + offset);
}

function expectInnermostScope(scopes: string[], expected: string): void {
  expect(scopes[scopes.length - 1]).toBe(expected);
}

function expectOrderedScopeChain(scopes: string[], expected: string[]): void {
  let previousIndex = -1;
  for (const scope of expected) {
    const currentIndex = scopes.indexOf(scope, previousIndex + 1);
    expect(currentIndex)
      .withContext(`Missing ordered scope: ${scope} in ${scopes.join(' -> ')}`)
      .toBeGreaterThan(previousIndex);
    previousIndex = currentIndex;
  }
}

function expectTopmostScopeChain(scopes: string[], expected: string[]): void {
  expectOrderedScopeChain(scopes, expected);
}

describe('Angular fenced markdown token scopes', () => {
  let document: vscode.TextDocument;

  beforeAll(async () => {
    await activate(MARKDOWN_FENCES_URI);
    document = vscode.window.activeTextEditor!.document;

    const textmateService = new TextmateLanguageService('angular-ts');
    await textmateService.initTokenService();
  });

  it('scopes angular-ts fenced template strings to source.angular-ts without html bleed', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (isReadyTsFence)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );
    const range = await TextmateLanguageService.api.getScopeRangeAtPosition(document, position);
    const tokenInfo = await TextmateLanguageService.api.getTokenInformationAtPosition(
      document,
      position,
    );

    expect(document.getText(tokenInfo.range)).toBe('if');
    expect(tokenInfo.type).toBe(vscode.StandardTokenType.Other);

    expectTopmostScopeChain(token.scopes, [
      'source.angular-ts',
      'meta.embedded.block.angular-ts',
      'text.html.derivative',
    ]);
  });

  it('inline template in angular-ts fence should expose Angular control-flow scopes', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (isReadyTsFence)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, ['control.block.ng', 'keyword.control.block.kind.ng']);
  });

  it('inline template in angular-ts fence should expose event binding scopes', async () => {
    const position = positionOfMarkerWithOffset(document, '(click)', 1, 2);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.ng-binding.event.html',
      'entity.other.ng-binding-name.click.html',
    ]);
  });

  it('includes Angular control-flow scopes in angular-html fenced blocks', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (isReadyHtmlFence)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );
    const range = await TextmateLanguageService.api.getScopeRangeAtPosition(document, position);
    const tokenInfo = await TextmateLanguageService.api.getTokenInformationAtPosition(
      document,
      position,
    );

    expect(document.getText(tokenInfo.range)).toBe('if');
    expect(tokenInfo.type).toBe(vscode.StandardTokenType.Other);

    expectOrderedScopeChain(token.scopes, [
      'meta.embedded.block.angular-html',
      'control.block.ng',
      'keyword.control.block.kind.ng',
    ]);
  });

  it('keeps angular-ts fenced styles scoped without cross-language bleed', async () => {
    const position = positionOf(document, 'border-radius');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );
    const range = await TextmateLanguageService.api.getScopeRangeAtPosition(document, position);
    const tokenInfo = await TextmateLanguageService.api.getTokenInformationAtPosition(
      document,
      position,
    );

    expect(document.getText(tokenInfo.range)).toBe('border-radius');
    expect(tokenInfo.type).toBe(vscode.StandardTokenType.Other);

    expectOrderedScopeChain(token.scopes, ['source.angular-ts', 'source.css.scss']);
    expect(token.scopes).not.toContain('text.angular-html');
  });

  it('does not apply Angular block scopes inside non-angular ts fences', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (shouldNotHighlight)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).not.toContain('keyword.control.block.kind.ng');
    expect(token.scopes).not.toContain('control.block.ng');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-ts');
  });

  it('does not apply fenced css scopes inside non-angular ts fences', async () => {
    const position = positionOf(document, 'border-radius: 2px');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).not.toContain('source.css.scss');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-ts');
  });

  it('does not apply Angular block scopes to plain markdown text', async () => {
    const position = positionOfMarkerWithOffset(
      document,
      'Outside fenced block: @if',
      1,
      'Outside fenced block: '.length + 1,
    );
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).not.toContain('keyword.control.block.kind.ng');
    expect(token.scopes).not.toContain('control.block.ng');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-html');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-ts');
  });

  it('supports angular-html backtick fences', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (isReadyBacktickFence)', 1, 1);
    const fenceHeader = document.lineAt(position.line - 2).text.trim();
    expect(fenceHeader).toBe('```angular-html');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.embedded.block.angular-html',
      'control.block.ng',
      'keyword.control.block.kind.ng',
    ]);
  });

  it('does not match malformed angular-ts language labels', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (malformedLanguageId)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).not.toContain('meta.embedded.block.angular-ts');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-html');
    expect(token.scopes).not.toContain('keyword.control.block.kind.ng');
  });

  it('does not match case-variant Angular-TS language labels', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (caseVariantLanguageId)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).not.toContain('meta.embedded.block.angular-ts');
    expect(token.scopes).not.toContain('meta.embedded.block.angular-html');
    expect(token.scopes).not.toContain('keyword.control.block.kind.ng');
  });

  it('supports angular-ts backtick fences', async () => {
    const position = positionOfMarkerWithOffset(document, '@if (backtickTsFence)', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectTopmostScopeChain(token.scopes, [
      'source.angular-ts',
      'meta.embedded.block.angular-ts',
      'text.html.derivative',
    ]);
  });

  it('recognizes property binding scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '[value]', 1, 2);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.ng-binding.property.html',
      'entity.other.ng-binding-name.value.html',
    ]);
  });

  it('recognizes event binding scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '(input)', 1, 2);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.ng-binding.event.html',
      'entity.other.ng-binding-name.input.html',
    ]);
  });

  it('recognizes two-way binding scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '[(ngModel)]', 1, 3);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.ng-binding.two-way.html',
      'entity.other.ng-binding-name.ngModel.html',
    ]);
  });

  it('recognizes template binding scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '*ngIf', 1, 2);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, [
      'meta.ng-binding.template.html',
      'entity.other.ng-binding-name.ngIf.html',
    ]);
  });

  it('recognizes @let declaration scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '@let computed =', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, ['meta.definition.variable.ng', 'storage.type.ng']);
  });

  it('recognizes pipe function scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '| currency', 1, 2);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectInnermostScope(token.scopes, 'entity.name.function.pipe.ng');
  });

  it('recognizes expression scope in interpolation', async () => {
    const position = positionOfMarkerWithOffset(document, '{{ computed }}', 1, 3);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, ['expression.ng', 'variable.other.readwrite.ts']);
  });

  it('recognizes interpolation punctuation scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '{{ user.profile.name', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectInnermostScope(token.scopes, 'punctuation.definition.block.ts');
  });

  it('recognizes expression property-access scopes in angular-html fences', async () => {
    const position = positionOfMarkerWithOffset(document, '.profile', 1, 0);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectInnermostScope(token.scopes, 'punctuation.accessor.ts');
  });

  it('recognizes ternary operator scopes in angular-html fences', async () => {
    const questionPosition = positionOfMarkerWithOffset(document, '? valueA :', 1, 0);
    const questionToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      questionPosition,
    );

    const colonPosition = positionOfMarkerWithOffset(document, ': valueB', 1, 0);
    const colonToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      colonPosition,
    );

    expectInnermostScope(questionToken.scopes, 'keyword.operator.ternary.ts');
    expectInnermostScope(colonToken.scopes, 'keyword.operator.ternary.ts');
  });

  it('recognizes @let assignment and terminator scopes in angular-html fences', async () => {
    const assignmentPosition = positionOfMarkerWithOffset(document, 'computed = total', 1, 9);
    const assignmentToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      assignmentPosition,
    );

    const terminatorPosition = positionOfMarkerWithOffset(document, 'currency;', 1, 8);
    const terminatorToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      terminatorPosition,
    );

    expectInnermostScope(assignmentToken.scopes, 'keyword.operator.assignment.ng');
    expectInnermostScope(terminatorToken.scopes, 'punctuation.terminator.statement.ng');
  });

  it('recognizes null and boolean literal scopes in angular-html fences', async () => {
    const nullPosition = positionOfMarkerWithOffset(document, '?? null', 1, 3);
    const nullToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      nullPosition,
    );

    const boolPosition = positionOfMarkerWithOffset(document, '&& true', 1, 3);
    const boolToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      boolPosition,
    );

    expectInnermostScope(nullToken.scopes, 'constant.language.null.ts');
    expectInnermostScope(boolToken.scopes, 'constant.language.boolean.true.ts');
  });

  it('recognizes numeric literal scopes in angular-html fences', async () => {
    const hexPosition = positionOfMarkerWithOffset(document, '0xFF', 1, 1);
    const hexToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      hexPosition,
    );

    expectInnermostScope(hexToken.scopes, 'constant.numeric.hex.ts');
  });

  it('recognizes ng-binding name decomposition scopes in angular-html fences', async () => {
    const bindingNamePosition = positionOfMarkerWithOffset(document, '[attr.aria-label]', 1, 1);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      bindingNamePosition,
    );

    expectInnermostScope(token.scopes, 'entity.other.ng-binding-name.attr.aria-label.html');
  });

  it('recognizes @for of/track scopes in angular-html fences', async () => {
    const ofPosition = positionOfMarkerWithOffset(document, 'of items', 1, 0);
    const ofToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      ofPosition,
    );

    const trackPosition = positionOfMarkerWithOffset(document, 'track item.id', 1, 0);
    const trackToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      trackPosition,
    );

    expectInnermostScope(ofToken.scopes, 'keyword.operator.expression.of.ng');
    expectInnermostScope(trackToken.scopes, 'keyword.control.track.ng');
  });

  it('recognizes @empty transition scope in angular-html fences', async () => {
    const atPosition = positionOfMarkerWithOffset(document, '@empty', 1, 0);
    const atToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      atPosition,
    );

    const kindPosition = positionOfMarkerWithOffset(document, '@empty', 1, 1);
    const kindToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      kindPosition,
    );

    expectInnermostScope(atToken.scopes, 'keyword.control.block.transition.ng');
    expectInnermostScope(kindToken.scopes, 'keyword.control.block.kind.ng');
  });

  it('recognizes @case and @default scopes in angular-html fences', async () => {
    const casePosition = positionOfMarkerWithOffset(document, '@case', 1, 1);
    const caseToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      casePosition,
    );

    const defaultPosition = positionOfMarkerWithOffset(document, '@default', 1, 1);
    const defaultToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      defaultPosition,
    );

    expectOrderedScopeChain(caseToken.scopes, [
      'control.block.case.header.ng',
      'keyword.control.block.kind.ng',
    ]);
    expectOrderedScopeChain(defaultToken.scopes, [
      'control.block.case.header.ng',
      'keyword.control.block.kind.ng',
    ]);
  });

  it('recognizes host object property binding scopes in angular-ts fences', async () => {
    const position = positionOfMarkerWithOffset(
      document,
      "'[attr.aria-label]': 'hostAriaLabel'",
      1,
      1,
    );
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectOrderedScopeChain(token.scopes, ['hostbindings.ng', 'entity.other.attribute-name.html']);
  });

  it('recognizes host object event binding scopes in angular-ts fences', async () => {
    const keyPosition = positionOfMarkerWithOffset(document, "'(click)': 'onHostClick()'", 1, 1);
    const keyToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      keyPosition,
    );

    const valuePosition = positionOfMarkerWithOffset(document, "'onHostClick()'", 1, 1);
    const valueToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      valuePosition,
    );

    expectOrderedScopeChain(keyToken.scopes, [
      'hostbindings.ng',
      'entity.other.attribute-name.html',
    ]);
    expectOrderedScopeChain(valueToken.scopes, [
      'hostbinding.dynamic.ng',
      'entity.name.function.ts',
    ]);
  });

  it('recognizes inline styles key scope in angular-ts decorator', async () => {
    const position = positionOfMarkerWithOffset(document, 'styles: `', 1, 0);
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expectInnermostScope(token.scopes, 'meta.object-literal.key.ts');
  });
});
