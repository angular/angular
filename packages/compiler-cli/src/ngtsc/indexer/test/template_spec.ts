/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, AttributeIdentifier, ElementIdentifier, IdentifierKind} from '..';
import {runInEachFileSystem} from '../../file_system/testing';
import {getTemplateIdentifiers} from '../src/template';
import * as util from './util';

function bind(template: string) {
  return util.getBoundTemplate(template, {
    preserveWhitespaces: true,
    leadingTriviaChars: [],
  });
}

runInEachFileSystem(() => {
  describe('getTemplateIdentifiers', () => {
    it('should generate nothing in empty template', () => {
      const refs = getTemplateIdentifiers(bind(''));

      expect(refs.size).toBe(0);
    });

    it('should ignore comments', () => {
      const refs = getTemplateIdentifiers(bind('<!-- {{comment}} -->'));

      expect(refs.size).toBe(0);
    });

    it('should handle arbitrary whitespace', () => {
      const template = '\n\n   {{foo}}';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        name: 'foo',
        kind: IdentifierKind.Property,
        span: new AbsoluteSourceSpan(7, 10),
      });
    });

    it('should ignore identifiers defined in the template', () => {
      const template = `
      <input #model />
      {{model.valid}}
    `;
      const refs = getTemplateIdentifiers(bind(template));

      const refArr = Array.from(refs);
      const modelId = refArr.find(ref => ref.name === 'model');
      expect(modelId).toBeUndefined();
    });

    describe('generates identifiers for PropertyReads', () => {
      it('should discover component properties', () => {
        const template = '{{foo}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(2, 5),
        });
      });

      it('should discover nested properties', () => {
        const template = '<div><span>{{foo}}</span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(13, 16),
        });
      });

      it('should ignore identifiers that are not implicitly received by the template', () => {
        const template = '{{foo.bar.baz}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.name).toBe('foo');
      });
    });

    describe('generates identifiers for MethodCalls', () => {
      it('should discover component method calls', () => {
        const template = '{{foo()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref).toEqual({
          name: 'foo',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(2, 5),
        });
      });

      it('should discover nested properties', () => {
        const template = '<div><span>{{foo()}}</span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'foo',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(13, 16),
        });
      });

      it('should ignore identifiers that are not implicitly received by the template', () => {
        const template = '{{foo().bar().baz()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.name).toBe('foo');
      });
    });

    describe('generates identifiers for elements', () => {
      it('should record elements as ElementIdentifiers', () => {
        const template = '<test-selector>';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.kind).toBe(IdentifierKind.Element);
      });

      it('should record element names as their selector', () => {
        const template = '<test-selector>';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref as ElementIdentifier).toEqual({
          name: 'test-selector',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(1, 14),
          attributes: new Set(),
          usedDirectives: new Set(),
        });
      });

      it('should discover selectors in self-closing elements', () => {
        const template = '<img />';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref as ElementIdentifier).toEqual({
          name: 'img',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(1, 4),
          attributes: new Set(),
          usedDirectives: new Set(),
        });
      });

      it('should discover selectors in elements with adjacent open and close tags', () => {
        const template = '<test-selector></test-selector>';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref as ElementIdentifier).toEqual({
          name: 'test-selector',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(1, 14),
          attributes: new Set(),
          usedDirectives: new Set(),
        });
      });

      it('should discover selectors in elements with non-adjacent open and close tags', () => {
        const template = '<test-selector> text </test-selector>';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref as ElementIdentifier).toEqual({
          name: 'test-selector',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(1, 14),
          attributes: new Set(),
          usedDirectives: new Set(),
        });
      });

      it('should discover nested selectors', () => {
        const template = '<div><span></span></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const refArr = Array.from(refs);
        expect(refArr).toContain({
          name: 'span',
          kind: IdentifierKind.Element,
          span: new AbsoluteSourceSpan(6, 10),
          attributes: new Set(),
          usedDirectives: new Set(),
        });
      });

      it('should generate information about attributes', () => {
        const template = '<div attrA attrB="val"></div>';
        const refs = getTemplateIdentifiers(bind(template));

        const [ref] = Array.from(refs);
        const attrs = (ref as ElementIdentifier).attributes;
        expect(attrs).toEqual(new Set<AttributeIdentifier>([
          {
            name: 'attrA',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(5, 10),
          },
          {
            name: 'attrB',
            kind: IdentifierKind.Attribute,
            span: new AbsoluteSourceSpan(11, 22),
          }
        ]));
      });

      it('should generate information about used directives', () => {
        const declA = util.getComponentDeclaration('class A {}', 'A');
        const declB = util.getComponentDeclaration('class B {}', 'B');
        const declC = util.getComponentDeclaration('class C {}', 'C');
        const template = '<a-selector b-selector></a-selector>';
        const boundTemplate = util.getBoundTemplate(template, {}, [
          {selector: 'a-selector', declaration: declA},
          {selector: '[b-selector]', declaration: declB},
          {selector: ':not(never-selector)', declaration: declC},
        ]);

        const refs = getTemplateIdentifiers(boundTemplate);
        const [ref] = Array.from(refs);
        const usedDirectives = (ref as ElementIdentifier).usedDirectives;
        expect(usedDirectives).toEqual(new Set([
          {
            node: declA,
            selector: 'a-selector',
          },
          {
            node: declB,
            selector: '[b-selector]',
          },
          {
            node: declC,
            selector: ':not(never-selector)',
          }
        ]));
      });
    });
  });
});
