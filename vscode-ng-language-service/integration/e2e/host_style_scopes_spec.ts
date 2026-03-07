import * as vscode from 'vscode';
import TextmateLanguageService from 'vscode-textmate-languageservice';

import {activate, HOST_STYLE_SCOPES_URI, positionOf, positionOfAfter} from './helper';

describe('Angular LS host style token scopes', () => {
  beforeEach(async () => {
    await activate(HOST_STYLE_SCOPES_URI);
  });

  it('gives unquoted static host style values CSS declaration scopes', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOf(document, 'var(--help)');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('hostbinding.static.ng');
    expect(token.scopes).toContain('source.css');
  });

  it('gives [style.padding] host binding value CSS property-value scopes', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOfAfter(document, "'[style.padding]'", '8px');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('hostbinding.dynamic.ng');
    expect(token.scopes).toContain('source.css');
    expect(token.scopes).toContain('meta.property-value.css');
  });

  it('gives [style.--help] host binding value CSS property-value scopes', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOfAfter(document, "'[style.--help]'", '#fff');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('hostbinding.dynamic.ng');
    expect(token.scopes).toContain('source.css');
    expect(token.scopes).toContain('meta.property-value.css');
  });

  it('gives [style] host binding value CSS declaration scopes', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOfAfter(document, "'[style]'", 'width');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('hostbinding.dynamic.ng');
    expect(token.scopes).toContain('source.css');
    expect(token.scopes).toContain('meta.property-name.css');
  });

  it('gives quoted static style key CSS declaration scopes for property name and value', async () => {
    const document = vscode.window.activeTextEditor!.document;

    // Property name: 'display' should have CSS property-name scope
    const namePos = positionOfAfter(document, "'style': 'display", 'display');
    const nameToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      namePos,
    );
    expect(nameToken.scopes).toContain('hostbinding.static.ng');
    expect(nameToken.scopes).toContain('source.css');
    expect(nameToken.scopes).toContain('meta.property-name.css');

    // Property value: 'block' should have source.css scope
    const valuePos = positionOfAfter(document, "'style': 'display", 'block');
    const valueToken = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      valuePos,
    );
    expect(valueToken.scopes).toContain('hostbinding.static.ng');
    expect(valueToken.scopes).toContain('source.css');
  });

  it('gives [style.padding.px] host binding key px token CSS unit scope', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOfAfter(document, "'[style.padding.px]'", 'px');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('keyword.other.unit.css');
    expect(token.scopes).toContain('entity.other.attribute-name.html');
  });

  it('keeps non-style dynamic host bindings without CSS scopes', async () => {
    const document = vscode.window.activeTextEditor!.document;
    const position = positionOfAfter(document, "'[attr.aria-label]'", 'host aria');
    const token = await TextmateLanguageService.api.getScopeInformationAtPosition(
      document,
      position,
    );

    expect(token.scopes).toContain('hostbinding.dynamic.ng');
    expect(token.scopes).not.toContain('source.css');
  });
});
