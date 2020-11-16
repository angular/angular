/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '@angular/core';

import * as i18n from '../../src/i18n/i18n_ast';
import {TranslationBundle} from '../../src/i18n/translation_bundle';
import * as html from '../../src/ml_parser/ast';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../src/parse_util';
import {serializeNodes} from '../ml_parser/util/util';

import {_extractMessages} from './i18n_parser_spec';

{
  describe('TranslationBundle', () => {
    const file = new ParseSourceFile('content', 'url');
    const startLocation = new ParseLocation(file, 0, 0, 0);
    const endLocation = new ParseLocation(file, 0, 0, 7);
    const span = new ParseSourceSpan(startLocation, endLocation);
    const srcNode = new i18n.Text('src', span);

    it('should translate a plain text', () => {
      const msgMap = {foo: [new i18n.Text('bar', null!)]};
      const tb = new TranslationBundle(msgMap, null, (_) => 'foo');
      const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
      expect(serializeNodes(tb.get(msg))).toEqual(['bar']);
    });

    it('should translate html-like plain text', () => {
      const msgMap = {foo: [new i18n.Text('<p>bar</p>', null!)]};
      const tb = new TranslationBundle(msgMap, null, (_) => 'foo');
      const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
      const nodes = tb.get(msg);
      expect(nodes.length).toEqual(1);
      const textNode: html.Text = nodes[0] as any;
      expect(textNode instanceof html.Text).toEqual(true);
      expect(textNode.value).toBe('<p>bar</p>');
    });

    it('should translate a message with placeholder', () => {
      const msgMap = {
        foo: [
          new i18n.Text('bar', null!),
          new i18n.Placeholder('', 'ph1', null!),
        ]
      };
      const phMap = {
        ph1: createPlaceholder('*phContent*'),
      };
      const tb = new TranslationBundle(msgMap, null, (_) => 'foo');
      const msg = new i18n.Message([srcNode], phMap, {}, 'm', 'd', 'i');
      expect(serializeNodes(tb.get(msg))).toEqual(['bar*phContent*']);
    });

    it('should translate a message with placeholder referencing messages', () => {
      const msgMap = {
        foo: [
          new i18n.Text('--', null!),
          new i18n.Placeholder('', 'ph1', null!),
          new i18n.Text('++', null!),
        ],
        ref: [
          new i18n.Text('*refMsg*', null!),
        ],
      };
      const refMsg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
      const msg = new i18n.Message([srcNode], {}, {ph1: refMsg}, 'm', 'd', 'i');
      let count = 0;
      const digest = (_: any) => count++ ? 'ref' : 'foo';
      const tb = new TranslationBundle(msgMap, null, digest);

      expect(serializeNodes(tb.get(msg))).toEqual(['--*refMsg*++']);
    });

    it('should use the original message or throw when a translation is not found', () => {
      const src =
          `<some-tag>some text{{ some_expression }}</some-tag>{count, plural, =0 {no} few {a <b>few</b>}}`;
      const messages = _extractMessages(`<div i18n>${src}</div>`);

      const digest = (_: any) => `no matching id`;
      // Empty message map -> use source messages in Ignore mode
      let tb = new TranslationBundle({}, null, digest, null!, MissingTranslationStrategy.Ignore);
      expect(serializeNodes(tb.get(messages[0])).join('')).toEqual(src);
      // Empty message map -> use source messages in Warning mode
      tb = new TranslationBundle({}, null, digest, null!, MissingTranslationStrategy.Warning);
      expect(serializeNodes(tb.get(messages[0])).join('')).toEqual(src);
      // Empty message map -> throw in Error mode
      tb = new TranslationBundle({}, null, digest, null!, MissingTranslationStrategy.Error);
      expect(() => serializeNodes(tb.get(messages[0])).join('')).toThrow();
    });

    describe('errors reporting', () => {
      it('should report unknown placeholders', () => {
        const msgMap = {
          foo: [
            new i18n.Text('bar', null!),
            new i18n.Placeholder('', 'ph1', span),
          ]
        };
        const tb = new TranslationBundle(msgMap, null, (_) => 'foo');
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Unknown placeholder/);
      });

      it('should report missing translation', () => {
        const tb =
            new TranslationBundle({}, null, (_) => 'foo', null!, MissingTranslationStrategy.Error);
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Missing translation for message "foo"/);
      });

      it('should report missing translation with MissingTranslationStrategy.Warning', () => {
        const log: string[] = [];
        const console = {
          log: (msg: string) => {
            throw `unexpected`;
          },
          warn: (msg: string) => log.push(msg),
        };

        const tb = new TranslationBundle(
            {}, 'en', (_) => 'foo', null!, MissingTranslationStrategy.Warning, console);
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');

        expect(() => tb.get(msg)).not.toThrowError();
        expect(log.length).toEqual(1);
        expect(log[0]).toMatch(/Missing translation for message "foo" for locale "en"/);
      });

      it('should not report missing translation with MissingTranslationStrategy.Ignore', () => {
        const tb =
            new TranslationBundle({}, null, (_) => 'foo', null!, MissingTranslationStrategy.Ignore);
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).not.toThrowError();
      });

      it('should report missing referenced message', () => {
        const msgMap = {
          foo: [new i18n.Placeholder('', 'ph1', span)],
        };
        const refMsg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        const msg = new i18n.Message([srcNode], {}, {ph1: refMsg}, 'm', 'd', 'i');
        let count = 0;
        const digest = (_: any) => count++ ? 'ref' : 'foo';
        const tb =
            new TranslationBundle(msgMap, null, digest, null!, MissingTranslationStrategy.Error);
        expect(() => tb.get(msg)).toThrowError(/Missing translation for message "ref"/);
      });

      it('should report invalid translated html', () => {
        const msgMap = {
          foo: [
            new i18n.Text('text', null!),
            new i18n.Placeholder('', 'ph1', null!),
          ]
        };
        const phMap = {
          ph1: createPlaceholder('</b>'),
        };
        const tb = new TranslationBundle(msgMap, null, (_) => 'foo');
        const msg = new i18n.Message([srcNode], phMap, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Unexpected closing tag "b"/);
      });
    });
  });
}

function createPlaceholder(text: string): i18n.MessagePlaceholder {
  const file = new ParseSourceFile(text, 'file://test');
  const start = new ParseLocation(file, 0, 0, 0);
  const end = new ParseLocation(file, text.length, 0, text.length);
  return {
    text,
    sourceSpan: new ParseSourceSpan(start, end),
  };
}
