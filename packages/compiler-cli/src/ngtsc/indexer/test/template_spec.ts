/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InterpolationConfig, ParseSourceFile, TmplAstNode, parseTemplate} from '@angular/compiler';
import {AbsoluteSourceSpan, IdentifierKind, RestoreTemplateOptions} from '..';
import {getTemplateIdentifiers} from '../src/template';

const TEST_FILE = 'TEST';

function parse(template: string): TmplAstNode[] {
  return parseTemplate(template, TEST_FILE).nodes;
}

describe('getTemplateIdentifiers', () => {
  const DEFAULT_RESTORE_OPTIONS:
      RestoreTemplateOptions = {interpolationConfig: new InterpolationConfig('{{', '}}')};

  it('should generate nothing in HTML-only template', () => {
    const refs = getTemplateIdentifiers(parse('<div></div>'), DEFAULT_RESTORE_OPTIONS);

    expect(refs.size).toBe(0);
  });

  it('should ignore comments', () => {
    const refs = getTemplateIdentifiers(
        parse(`
    <!-- {{my_module}} -->
    <div><!-- {{goodbye}} --></div>
    `),
        DEFAULT_RESTORE_OPTIONS);

    expect(refs.size).toBe(0);
  });

  it('should use any interpolation config', () => {
    const template = '<div>((foo))</div>';
    const refs = getTemplateIdentifiers(
        parse(template), {interpolationConfig: new InterpolationConfig('((', '))')});

    const [ref] = Array.from(refs);
    expect(ref.name).toBe('foo');
    expect(ref.kind).toBe(IdentifierKind.Property);
    expect(ref.span).toEqual(new AbsoluteSourceSpan(7, 10));
    expect(ref.file).toEqual(new ParseSourceFile(template, TEST_FILE));
  });

  describe('generates identifiers for PropertyReads', () => {
    it('should discover component properties', () => {
      const template = '<div>{{foo}}</div>';
      const refs = getTemplateIdentifiers(parse(template), DEFAULT_RESTORE_OPTIONS);
      expect(refs.size).toBe(1);

      const [ref] = Array.from(refs);
      expect(ref.name).toBe('foo');
      expect(ref.kind).toBe(IdentifierKind.Property);
      expect(ref.span).toEqual(new AbsoluteSourceSpan(7, 10));
      expect(ref.file).toEqual(new ParseSourceFile(template, TEST_FILE));
    });

    it('should discover component method calls', () => {
      const template = '<div>{{foo()}}</div>';
      const refs = getTemplateIdentifiers(parse(template), DEFAULT_RESTORE_OPTIONS);

      const [ref] = Array.from(refs);
      expect(ref.name).toBe('foo');
      expect(ref.kind).toBe(IdentifierKind.Method);
      expect(ref.span).toEqual(new AbsoluteSourceSpan(7, 10));
      expect(ref.file).toEqual(new ParseSourceFile(template, TEST_FILE));
    });

    it('should handle arbitrary whitespace', () => {
      const template = '<div>\n\n   {{foo}}</div>';
      const refs = getTemplateIdentifiers(parse(template), DEFAULT_RESTORE_OPTIONS);

      const [ref] = Array.from(refs);
      expect(ref.name).toBe('foo');
      expect(ref.kind).toBe(IdentifierKind.Property);
      expect(ref.span).toEqual(new AbsoluteSourceSpan(12, 15));
      expect(ref.file).toEqual(new ParseSourceFile(template, TEST_FILE));
    });

    it('should handle nested scopes', () => {
      const template = '<div><span>{{foo}}</span></div>';
      const refs = getTemplateIdentifiers(parse(template), DEFAULT_RESTORE_OPTIONS);

      const [ref] = Array.from(refs);
      expect(ref.name).toBe('foo');
      expect(ref.kind).toBe(IdentifierKind.Property);
      expect(ref.span).toEqual(new AbsoluteSourceSpan(13, 16));
      expect(ref.file).toEqual(new ParseSourceFile(template, TEST_FILE));
    });
  });
});
