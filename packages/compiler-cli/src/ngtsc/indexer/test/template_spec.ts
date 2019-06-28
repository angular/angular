/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteSourceSpan, IdentifierKind} from '..';
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
    it('should generate nothing in HTML-only template', () => {
      const refs = getTemplateIdentifiers(bind('<div></div>'));

      expect(refs.size).toBe(0);
    });

    it('should ignore comments', () => {
      const refs = getTemplateIdentifiers(bind('<!-- {{comment}} -->'));

      expect(refs.size).toBe(0);
    });

    it('should handle arbitrary whitespace', () => {
      const template = '<div>\n\n   {{foo}}</div>';
      const refs = getTemplateIdentifiers(bind(template));

      const [ref] = Array.from(refs);
      expect(ref).toEqual({
        name: 'foo',
        kind: IdentifierKind.Property,
        span: new AbsoluteSourceSpan(12, 15),
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
        expect(refArr).toEqual(jasmine.arrayContaining([{
          name: 'foo',
          kind: IdentifierKind.Property,
          span: new AbsoluteSourceSpan(13, 16),
        }]));
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
        expect(refArr).toEqual(jasmine.arrayContaining([{
          name: 'foo',
          kind: IdentifierKind.Method,
          span: new AbsoluteSourceSpan(13, 16),
        }]));
      });

      it('should ignore identifiers that are not implicitly received by the template', () => {
        const template = '{{foo().bar().baz()}}';
        const refs = getTemplateIdentifiers(bind(template));
        expect(refs.size).toBe(1);

        const [ref] = Array.from(refs);
        expect(ref.name).toBe('foo');
      });
    });
  });
});
