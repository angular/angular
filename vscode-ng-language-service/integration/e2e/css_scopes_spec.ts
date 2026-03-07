import * as vscode from 'vscode';
import TextmateLanguageService from 'vscode-textmate-languageservice';

import {
  activate,
  CSS_SCOPES_COMPONENT_URI,
  CSS_SCOPES_REFERENCE_CSS_URI,
  CSS_SCOPES_TEMPLATE_URI,
  positionOf,
  positionOfAfter,
} from './helper';

async function scopesAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Promise<string[]> {
  const token = await TextmateLanguageService.api.getScopeInformationAtPosition(document, position);
  return token.scopes;
}

async function tokenTextAt(
  document: vscode.TextDocument,
  position: vscode.Position,
): Promise<string> {
  const tokenInfo = await TextmateLanguageService.api.getTokenInformationAtPosition(
    document,
    position,
  );
  return document.getText(tokenInfo.range);
}

async function tokenAt(
  document: vscode.TextDocument,
  needle: string,
  offset = 0,
): Promise<{scopes: string[]; text: string}> {
  const position = positionOf(document, needle, offset);
  return {
    scopes: await scopesAt(document, position),
    text: await tokenTextAt(document, position),
  };
}

async function tokenAtAfter(
  document: vscode.TextDocument,
  anchor: string,
  needle: string,
  offset = 0,
): Promise<{scopes: string[]; text: string}> {
  const position = positionOfAfter(document, anchor, needle, offset);
  return {
    scopes: await scopesAt(document, position),
    text: await tokenTextAt(document, position),
  };
}

function mostSpecificScope(scopes: string[]): string {
  expect(scopes.length).toBeGreaterThan(0);
  return scopes[scopes.length - 1];
}

function expectScopeFamilyIntersection(
  scopes: string[],
  allowedFamilies: readonly string[],
  context: string,
): void {
  const matches = scopes.filter((scope) =>
    allowedFamilies.some(
      (family) =>
        scope === family ||
        scope.startsWith(`${family}.`) ||
        scope.endsWith(`.${family}`) ||
        scope.includes(`.${family}.`),
    ),
  );

  expect(scopes.length).withContext(`${context}: scopes should not be empty`).toBeGreaterThan(0);
  expect(matches.length)
    .withContext(`${context}: expected intersection with ${allowedFamilies.join(', ')}`)
    .toBeGreaterThan(0);
}

function expectNoScopeFamily(scopes: string[], family: string, context: string): void {
  expect(
    scopes.some(
      (scope) =>
        scope === family ||
        scope.startsWith(`${family}.`) ||
        scope.endsWith(`.${family}`) ||
        scope.includes(`.${family}.`),
    ),
  )
    .withContext(`${context}: should not contain scope family ${family}`)
    .toBeFalse();
}

describe('css scope parity for style bindings', () => {
  const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60_000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('tokenizes plain style attribute declarations and values in CSS declaration/value scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;
    const styleAttrAnchor = 'style="border: 1px solid black; padding: 1em; cursor: pointer"';

    const borderValueToken = await tokenAtAfter(document, styleAttrAnchor, '1px solid black', 5);
    expectScopeFamilyIntersection(
      borderValueToken.scopes,
      ['source.css', 'meta.property-value.css', 'meta.property-list.css'],
      'plain style attr border value token',
    );

    const paddingPropertyToken = await tokenAtAfter(document, styleAttrAnchor, 'padding: 1em', 0);
    expectScopeFamilyIntersection(
      paddingPropertyToken.scopes,
      ['source.css', 'meta.property-name.css', 'support.type.property-name.css'],
      'plain style attr padding property token',
    );

    const paddingValueToken = await tokenAtAfter(document, styleAttrAnchor, 'padding: 1em', 9);
    expect(paddingValueToken.text).toContain('1');
    expectScopeFamilyIntersection(
      paddingValueToken.scopes,
      ['source.css', 'meta.property-value.css', 'constant.numeric.css'],
      'plain style attr padding value token',
    );

    const cursorValueToken = await tokenAtAfter(document, styleAttrAnchor, 'cursor: pointer', 8);
    expectScopeFamilyIntersection(
      cursorValueToken.scopes,
      ['source.css', 'meta.property-value.css', 'meta.property-list.css'],
      'plain style attr cursor value token',
    );
  });

  it('gives [style.width.px] key-side px token CSS unit scope and keeps width without CSS scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const widthToken = await tokenAt(document, '[style.width.px]', '[style.'.length);
    const pxToken = await tokenAt(document, '[style.width.px]', '[style.width.'.length);
    const borderPxToken = await tokenAt(document, '[style.border.px]', '[style.border.'.length);

    expect(widthToken.text).toBe('width');
    expect(widthToken.scopes.length)
      .withContext('[style.width.px] width token: scopes should not be empty')
      .toBeGreaterThan(0);
    expectNoScopeFamily(widthToken.scopes, 'source.css', '[style.width.px] width token');

    expect(pxToken.text).toBe('px');
    expect(pxToken.scopes).toContain('keyword.other.unit.css');

    expect(borderPxToken.text).toBe('px');
    expect(borderPxToken.scopes).toContain('keyword.other.unit.css');
    expectScopeFamilyIntersection(
      borderPxToken.scopes,
      ['entity.other.ng-binding-name'],
      '[style.border.px] key-side px token',
    );
    expectNoScopeFamily(
      borderPxToken.scopes,
      'meta.selector.css',
      '[style.border.px] key-side px token',
    );
  });

  it('keeps bare numeric [style.width.px]="320" in expression scope (no CSS)', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAtAfter(document, 'caseBareNumericBinding', '320', 0);
    expect(token.scopes).toContain('expression.ng');
    expectNoScopeFamily(token.scopes, 'source.css', 'bare numeric should not have CSS scopes');
  });

  it('does not leak CSS scopes into Angular @if expression after style bindings', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const atTransitionTokenPosition = positionOfAfter(
      document,
      '[style]="\'border: 1px solid black; --padding: 1em; cursor: pointer; --custom: 1px solid black;\'"',
      '@if (items.length > 0)',
      0,
    );
    const atTransitionToken = {
      scopes: await scopesAt(document, atTransitionTokenPosition),
      text: await tokenTextAt(document, atTransitionTokenPosition),
    };

    expect(atTransitionToken.text).toBe('@');
    expectScopeFamilyIntersection(
      atTransitionToken.scopes,
      ['control.block.ng', 'keyword.control.block.transition.ng'],
      '@if transition @ token',
    );
    expectNoScopeFamily(
      atTransitionToken.scopes,
      'source.css',
      '@if transition @ token should not be CSS-scoped',
    );
    expectNoScopeFamily(
      atTransitionToken.scopes,
      'meta.selector.css',
      '@if transition @ token should not be CSS selector-scoped',
    );

    const token = await tokenAtAfter(
      document,
      '[style]="\'border: 1px solid black; --padding: 1em; cursor: pointer; --custom: 1px solid black;\'"',
      '(items.length > 0)',
      1,
    );

    expect(token.text).toBe('items');
    expectScopeFamilyIntersection(token.scopes, ['expression.ng'], '@if expression token');
    expectNoScopeFamily(token.scopes, 'source.css', '@if expression should not be CSS-scoped');
    expectNoScopeFamily(
      token.scopes,
      'meta.selector.css',
      '@if expression should not be CSS selector-scoped',
    );

    // Verify CSS scopes don't leak into the element content text after the [style] binding
    const contentToken = await tokenAtAfter(
      document,
      'caseHtmlBindingStyleCustomVar',
      'html-binding-style-custom-var',
      0,
    );
    expectNoScopeFamily(
      contentToken.scopes,
      'source.css',
      'text content after style binding should not have CSS scopes',
    );
  });

  it('tokenizes [style.width.px]="\'320\'" RHS numeric string token in CSS scope family', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const rhsNumericToken = await tokenAt(document, "'320'", 1);

    expect(rhsNumericToken.text).toContain('320');
    expect(rhsNumericToken.scopes.length)
      .withContext('[style.width.px]="\'320\'" RHS token: scopes should not be empty')
      .toBeGreaterThan(0);
    expectScopeFamilyIntersection(
      rhsNumericToken.scopes,
      ['source.css', 'constant.numeric.css'],
      '[style.width.px]="\'320\'" RHS token',
    );
  });

  it('tokenizes [style.width.px]="\'2px\'" RHS string token in CSS scope family', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const rhsStringToken = await tokenAt(document, "'2px'", 2);

    expect(rhsStringToken.text).toMatch(/2px|px/);
    expect(rhsStringToken.scopes.length)
      .withContext('[style.width.px]="\'2px\'" RHS token: scopes should not be empty')
      .toBeGreaterThan(0);
    expectScopeFamilyIntersection(
      rhsStringToken.scopes,
      ['source.css', 'keyword.other.unit.px.css'],
      '[style.width.px]="\'2px\'" RHS token',
    );
  });

  it('tokenizes [style.border] literal values with deep CSS property-value scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, "'1px solid black'", 5);

    expect(token.text).toContain('solid');
    expect(token.scopes[token.scopes.length - 1]).toBe('support.constant.property-value.css');
    expectScopeFamilyIntersection(
      token.scopes,
      [
        'support.constant.property-value.css',
        'meta.property-value.css',
        'meta.property-list.css',
        'source.css',
      ],
      '[style.border] literal property-value token',
    );
    expect(token.scopes).toContain('meta.property-value.css');
    expect(token.scopes).toContain('meta.property-list.css');
    expect(token.scopes).toContain('source.css');
    expectScopeFamilyIntersection(
      token.scopes,
      ['expression.ng'],
      '[style.border] literal token should remain in Angular binding context',
    );
  });

  it('matches most-specific scope for border `solid` value across css/style/[style.border]/[style] literal', async () => {
    await activate(CSS_SCOPES_REFERENCE_CSS_URI);
    const cssDoc = vscode.window.activeTextEditor!.document;

    const cssSolid = mostSpecificScope(
      await scopesAt(cssDoc, positionOf(cssDoc, 'border: 1px solid black;', 12)),
    );

    await activate(CSS_SCOPES_TEMPLATE_URI);
    const htmlDoc = vscode.window.activeTextEditor!.document;

    const literalSolid = mostSpecificScope(
      await scopesAt(
        htmlDoc,
        positionOfAfter(htmlDoc, 'caseHtmlLiteralBorder', 'border: 1px solid black', 12),
      ),
    );
    const styleBindingSolid = mostSpecificScope(
      await scopesAt(
        htmlDoc,
        positionOfAfter(htmlDoc, 'caseHtmlBindingBorderLiteral', "'1px solid black'", 5),
      ),
    );
    const styleLiteralSolidScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(htmlDoc, 'caseHtmlBindingStyleLiteral', "'border: 1px solid black'", 13),
    );
    expectScopeFamilyIntersection(
      [literalSolid],
      ['source.css', 'support.constant.property-value.css'],
      'literal style border solid token scope family',
    );
    expect(styleBindingSolid).toBe(cssSolid);
    expectScopeFamilyIntersection(
      styleLiteralSolidScopes,
      ['source.css', 'support.constant.property-value.css'],
      '[style] literal border solid token scope family',
    );
  });

  it('tokens [style.border.px] literal calc/unit pieces with CSS value-level scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const pxToken = await tokenAtAfter(
      document,
      'class="caseHtmlBindingBorderPxLiteral"',
      'calc(1px + 2px)',
      12,
    );
    expect(pxToken.text).toBe('px');
    expectScopeFamilyIntersection(
      pxToken.scopes,
      ['keyword.other.unit.px.css', 'constant.numeric.css', 'meta.function.calc.css', 'source.css'],
      '[style.border.px] literal px token scope chain',
    );

    const calcToken = await tokenAt(document, "'1px solid calc(1px + 2px)'", 11);
    expect(calcToken.text).toContain('calc');
    expectScopeFamilyIntersection(
      calcToken.scopes,
      ['meta.function.calc.css', 'source.css', 'meta.property-value.css'],
      '[style.border.px] literal calc token scope chain',
    );
  });

  it('keeps [style.color]="exprColor" RHS token in Angular expression scope in external template', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, 'exprColor');

    expect(token.text).toBe('exprColor');
    expectScopeFamilyIntersection(token.scopes, ['expression.ng'], '[style.color] expr token');
    expectNoScopeFamily(
      token.scopes,
      'source.css',
      '[style.color] expr should not have CSS scopes',
    );
  });

  it('handles [style.color] literal oklch token with CSS-or-expression scope families', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, "'oklch(62% 0.19 275)'", 1);

    expect(token.text).toContain('oklch');
    expectScopeFamilyIntersection(
      token.scopes,
      ['source.css'],
      '[style.color] literal oklch token',
    );
  });

  it('keeps [style.background-color] expression token in Angular scope and supports literal function token', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const exprToken = await tokenAt(document, 'exprBackground');
    expect(exprToken.text).toBe('exprBackground');
    expectScopeFamilyIntersection(
      exprToken.scopes,
      ['expression.ng'],
      '[style.background-color] expr token',
    );
    expectNoScopeFamily(
      exprToken.scopes,
      'source.css',
      '[style.background-color] expr should not have CSS scopes',
    );

    const literalToken = await tokenAt(document, "'hsl(320 65% 45% / 0.9)'", 1);
    expect(literalToken.text).toContain('hsl');
    expectScopeFamilyIntersection(
      literalToken.scopes,
      ['source.css'],
      '[style.background-color] literal function token',
    );
  });

  it('keeps [style.--custom-prop] expression token in Angular scope and supports var/calc literal tokens', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const exprToken = await tokenAt(document, 'exprCustomProp');
    expect(exprToken.text).toBe('exprCustomProp');
    expectScopeFamilyIntersection(
      exprToken.scopes,
      ['expression.ng'],
      '[style.--custom-prop] expr token',
    );
    expectNoScopeFamily(
      exprToken.scopes,
      'source.css',
      '[style.--custom-prop] expr should not have CSS scopes',
    );

    const varToken = await tokenAt(document, "'var(--x, calc(1rem + 2px))'", 1);
    expect(varToken.text).toContain('var');
    expectScopeFamilyIntersection(
      varToken.scopes,
      ['source.css'],
      '[style.--custom-prop] literal var token',
    );

    const calcToken = await tokenAt(document, 'calc(1rem + 2px)', 0);
    expect(calcToken.text).toContain('calc');
    expectScopeFamilyIntersection(
      calcToken.scopes,
      ['source.css'],
      '[style.--custom-prop] literal calc token',
    );
  });

  it('gives [style] object literal CSS scopes for property keys and values', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    // Unquoted key 'color' should get CSS property-name scope
    const colorKeyToken = await tokenAtAfter(document, 'caseHtmlBindingObject', 'color:', 0);
    expect(colorKeyToken.text).toContain('color');
    expectScopeFamilyIntersection(
      colorKeyToken.scopes,
      ['support.type.property-name.css'],
      '[style] object literal unquoted key "color"',
    );

    // Quoted key 'background-color' should get CSS property-name scope
    const bgKeyToken = await tokenAtAfter(document, 'caseHtmlBindingObject', 'background-color', 0);
    expect(bgKeyToken.text).toContain('background-color');
    expectScopeFamilyIntersection(
      bgKeyToken.scopes,
      ['support.type.property-name.css'],
      '[style] object literal quoted key "background-color"',
    );

    // Quoted custom property key '--local-size' should get variable.css scope
    const customKeyToken = await tokenAtAfter(document, 'caseHtmlBindingObject', '--local-size', 0);
    expect(customKeyToken.text).toContain('--local-size');
    expectScopeFamilyIntersection(
      customKeyToken.scopes,
      ['variable.css'],
      '[style] object literal quoted custom property key "--local-size"',
    );

    // String value 'oklch(70% 0.12 210)' should get source.css scope
    const colorFnToken = await tokenAt(document, 'oklch(70% 0.12 210)', 0);
    expect(colorFnToken.text).toContain('oklch');
    expectScopeFamilyIntersection(
      colorFnToken.scopes,
      ['source.css'],
      '[style] object literal oklch value gets CSS scope',
    );

    // String value 'linear-gradient(...)' should get source.css scope
    const gradientFnToken = await tokenAt(document, 'linear-gradient(90deg, red, blue)', 0);
    expect(gradientFnToken.text).toContain('linear-gradient');
    expectScopeFamilyIntersection(
      gradientFnToken.scopes,
      ['source.css'],
      '[style] object literal gradient value gets CSS scope',
    );
  });

  it('supports [attr.style] literal multi-declaration function tokens with strict scope-family contracts', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const colorMixToken = await tokenAt(document, 'color-mix(in oklab, red 40%, blue)', 0);
    expect(colorMixToken.text).toContain('color-mix');
    expectScopeFamilyIntersection(
      colorMixToken.scopes,
      ['source.css', 'expression.ng'],
      '[attr.style] literal color-mix token',
    );

    const clampToken = await tokenAt(document, 'clamp(12rem, 50vw, 40rem)', 0);
    expect(clampToken.text).toContain('clamp');
    expectScopeFamilyIntersection(
      clampToken.scopes,
      ['source.css', 'expression.ng'],
      '[attr.style] literal clamp token',
    );
  });

  it('tokens literal style="font: ...; color: rgb(...)" values as CSS and blocks Angular expression leakage', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const fontToken = await tokenAt(document, '14px/1.4', 0);
    expect(fontToken.text).toMatch(/14(px)?/);
    expectScopeFamilyIntersection(fontToken.scopes, ['source.css'], 'literal style font property');

    const rgbToken = await tokenAt(document, 'rgb(20 30 40 / 0.8)', 0);
    expect(rgbToken.text).toContain('rgb');
    expectScopeFamilyIntersection(rgbToken.scopes, ['source.css'], 'literal style rgb function');
  });

  it('tokens kebab-case literal style property names as CSS property scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, 'background-color: oklch(70% 0.15 220)', 0);

    expect(token.text).toContain('background-color');
    expectScopeFamilyIntersection(
      token.scopes,
      ['source.css'],
      'literal style kebab-case property',
    );
    expectScopeFamilyIntersection(
      token.scopes,
      ['support.type.property-name.css', 'source.css'],
      'literal style kebab-case property name scope',
    );
  });

  it('tokens calc() in literal style attribute with deep embedded CSS scope chain', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, 'calc(2px + 3px)', 0);

    expect(token.text).toContain('calc');
    expectScopeFamilyIntersection(
      token.scopes,
      ['source.css', 'meta.function-call.css'],
      'literal style calc() token',
    );
    expectNoScopeFamily(token.scopes, 'expression.ng', 'literal style calc() leakage guard');
  });

  it('tokens width property in <style> block with deep CSS property scopes', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, 'width: 321px', 0);

    expect(token.text).toBe('width');
    expectScopeFamilyIntersection(
      token.scopes,
      ['source.css', 'meta.property-name.css', 'support.type.property-name.css'],
      '<style> block width property token',
    );
    expectScopeFamilyIntersection(
      token.scopes,
      ['meta.property-list.css'],
      '<style> block width property list scope',
    );
  });

  it('keeps TS inline template [style.color] expression token in Angular scope (control)', async () => {
    await activate(CSS_SCOPES_COMPONENT_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAt(document, 'inlineExprColor');

    expect(token.text).toBe('inlineExprColor');
    expectScopeFamilyIntersection(
      token.scopes,
      ['expression.ng'],
      'TS inline [style.color] expr token',
    );
    expectNoScopeFamily(
      token.scopes,
      'source.css',
      'TS inline [style.color] expr should not have CSS scopes',
    );
  });

  it('achieves scope parity for --padding custom property across <style>/style=/[style] contexts', async () => {
    await activate(CSS_SCOPES_REFERENCE_CSS_URI);
    const cssDoc = vscode.window.activeTextEditor!.document;

    // Context 0: .css file reference
    const cssPaddingScopes = await scopesAt(
      cssDoc,
      positionOfAfter(cssDoc, '.ref-parity', '--padding', 0),
    );
    const cssPaddingMostSpecific = mostSpecificScope(cssPaddingScopes);

    await activate(CSS_SCOPES_TEMPLATE_URI);
    const htmlDoc = vscode.window.activeTextEditor!.document;

    // Context 1: <style> block
    const styleBlockPaddingScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(htmlDoc, 'caseParityStyleBlock', '--padding', 0),
    );
    const styleBlockPaddingMostSpecific = mostSpecificScope(styleBlockPaddingScopes);

    // Context 2: style="..." plain attribute (now handled by Angular grammar injection)
    const styleAttrPaddingScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(htmlDoc, 'caseParitySection', '--padding: var(--some-padding);\n', 0),
    );
    const styleAttrPaddingMostSpecific = mostSpecificScope(styleAttrPaddingScopes);

    // Context 3: [style]="'...'" binding
    const styleBindingPaddingScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(
        htmlDoc,
        '[style]="\'border: 1px solid black; --padding: var(--some-padding); cursor: pointer; --custom: 1px solid rgb(2 2 3 / 10);\'"',
        '--padding: var(--some-padding); cursor',
        0,
      ),
    );
    const styleBindingPaddingMostSpecific = mostSpecificScope(styleBindingPaddingScopes);

    // .css, <style>, and [style] should produce variable.css for --padding
    expect(cssPaddingMostSpecific)
      .withContext('.css file --padding most-specific scope')
      .toBe('variable.css');
    expect(styleBlockPaddingMostSpecific)
      .withContext('<style> block --padding most-specific scope')
      .toBe(cssPaddingMostSpecific);
    expect(styleBindingPaddingMostSpecific)
      .withContext('[style] binding --padding most-specific scope')
      .toBe(cssPaddingMostSpecific);

    // style="..." should now also have full parity via Angular grammar injection
    expect(styleAttrPaddingMostSpecific)
      .withContext('style="..." attr --padding most-specific scope')
      .toBe(cssPaddingMostSpecific);
  });

  it('achieves scope parity for cursor property name across <style>/style=/[style] contexts', async () => {
    await activate(CSS_SCOPES_REFERENCE_CSS_URI);
    const cssDoc = vscode.window.activeTextEditor!.document;

    // Context 0: .css file reference
    const cssCursorScopes = await scopesAt(
      cssDoc,
      positionOfAfter(cssDoc, '.ref-parity', 'cursor', 0),
    );

    await activate(CSS_SCOPES_TEMPLATE_URI);
    const htmlDoc = vscode.window.activeTextEditor!.document;

    // Context 1: <style> block
    const styleBlockCursorScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(htmlDoc, 'caseParityStyleBlock', 'cursor', 0),
    );

    // Context 3: [style]="'...'" binding
    const styleBindingCursorScopes = await scopesAt(
      htmlDoc,
      positionOfAfter(
        htmlDoc,
        '[style]="\'border: 1px solid black; --padding: var(--some-padding); cursor: pointer; --custom: 1px solid rgb(2 2 3 / 10);\'"',
        'cursor: pointer',
        0,
      ),
    );

    // cursor in .css reference
    expectScopeFamilyIntersection(
      cssCursorScopes,
      ['support.type.property-name.css'],
      '.css file cursor property-name scope',
    );

    // <style> block should match
    expectScopeFamilyIntersection(
      styleBlockCursorScopes,
      ['support.type.property-name.css'],
      '<style> block cursor property-name scope',
    );

    // [style] binding should now also match
    expectScopeFamilyIntersection(
      styleBindingCursorScopes,
      ['support.type.property-name.css'],
      '[style] binding cursor property-name scope',
    );

    // Most-specific scope parity across all 3 declaration contexts
    expect(mostSpecificScope(styleBlockCursorScopes))
      .withContext('<style> vs .css cursor parity')
      .toBe(mostSpecificScope(cssCursorScopes));
    expect(mostSpecificScope(styleBindingCursorScopes))
      .withContext('[style] vs .css cursor parity')
      .toBe(mostSpecificScope(cssCursorScopes));
  });

  it('blocks CSS scopes on expression-valued [style] bindings', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    // Variable expression should not get CSS scopes
    const varToken = await tokenAtAfter(document, 'caseExpressionBinding', 'dynamicStyle', 0);
    expect(varToken.scopes).toContain('expression.ng');
    expectNoScopeFamily(
      varToken.scopes,
      'source.css',
      'variable expression should not have CSS scopes',
    );

    // Ternary expression should not get CSS scopes
    const ternaryToken = await tokenAtAfter(document, 'caseTernaryBinding', 'isActive', 0);
    expect(ternaryToken.scopes).toContain('expression.ng');
    expectNoScopeFamily(
      ternaryToken.scopes,
      'source.css',
      'ternary expression head should not have CSS scopes',
    );
  });

  it('tokenizes !important in CSS declaration binding', async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAtAfter(document, 'caseImportant', '!important', 0);
    expectScopeFamilyIntersection(
      token.scopes,
      ['source.css'],
      '!important should have CSS scopes',
    );
  });

  it("tokenizes CSS in single-quoted style='...' attribute", async () => {
    await activate(CSS_SCOPES_TEMPLATE_URI);
    const document = vscode.window.activeTextEditor!.document;

    const token = await tokenAtAfter(document, 'caseSingleQuotedStyle', 'color', 0);
    expectScopeFamilyIntersection(
      token.scopes,
      ['support.type.property-name.css', 'source.css'],
      'single-quoted style attribute CSS property name scope',
    );
  });
});
