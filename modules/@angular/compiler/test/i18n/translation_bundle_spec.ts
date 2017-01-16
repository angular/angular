/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../src/i18n/i18n_ast';
import {TranslationBundle} from '../../src/i18n/translation_bundle';
import {ParseLocation, ParseSourceFile, ParseSourceSpan} from '../../src/parse_util';
import {serializeNodes} from '../ml_parser/ast_serializer_spec';

export function main(): void {
  describe('TranslationBundle', () => {
    const file = new ParseSourceFile('content', 'url');
    const location = new ParseLocation(file, 0, 0, 0);
    const span = new ParseSourceSpan(location, null);
    const srcNode = new i18n.Text('src', span);

    it('should translate a plain message', () => {
      const msgMap = {foo: [new i18n.Text('bar', null)]};
      const tb = new TranslationBundle(msgMap, (_) => 'foo');
      const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
      expect(serializeNodes(tb.get(msg))).toEqual(['bar']);
    });

    it('should translate a message with placeholder', () => {
      const msgMap = {
        foo: [
          new i18n.Text('bar', null),
          new i18n.Placeholder('', 'ph1', null),
        ]
      };
      const phMap = {
        ph1: '*phContent*',
      };
      const tb = new TranslationBundle(msgMap, (_) => 'foo');
      const msg = new i18n.Message([srcNode], phMap, {}, 'm', 'd', 'i');
      expect(serializeNodes(tb.get(msg))).toEqual(['bar*phContent*']);
    });

    it('should translate a message with placeholder referencing messages', () => {
      const msgMap = {
        foo: [
          new i18n.Text('--', null),
          new i18n.Placeholder('', 'ph1', null),
          new i18n.Text('++', null),
        ],
        ref: [
          new i18n.Text('*refMsg*', null),
        ],
      };
      const refMsg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
      const msg = new i18n.Message([srcNode], {}, {ph1: refMsg}, 'm', 'd', 'i');
      let count = 0;
      const digest = (_: any) => count++ ? 'ref' : 'foo';
      const tb = new TranslationBundle(msgMap, digest);

      expect(serializeNodes(tb.get(msg))).toEqual(['--*refMsg*++']);
    });

    describe('errors', () => {
      it('should report unknown placeholders', () => {
        const msgMap = {
          foo: [
            new i18n.Text('bar', null),
            new i18n.Placeholder('', 'ph1', span),
          ]
        };
        const tb = new TranslationBundle(msgMap, (_) => 'foo');
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Unknown placeholder/);
      });

      it('should report missing translation', () => {
        const tb = new TranslationBundle({}, (_) => 'foo');
        const msg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Missing translation for message foo/);
      });

      it('should report missing referenced message', () => {
        const msgMap = {
          foo: [new i18n.Placeholder('', 'ph1', span)],
        };
        const refMsg = new i18n.Message([srcNode], {}, {}, 'm', 'd', 'i');
        const msg = new i18n.Message([srcNode], {}, {ph1: refMsg}, 'm', 'd', 'i');
        let count = 0;
        const digest = (_: any) => count++ ? 'ref' : 'foo';
        const tb = new TranslationBundle(msgMap, digest);
        expect(() => tb.get(msg)).toThrowError(/Missing translation for message ref/);
      });

      it('should report invalid translated html', () => {
        const msgMap = {
          foo: [
            new i18n.Text('text', null),
            new i18n.Placeholder('', 'ph1', null),
          ]
        };
        const phMap = {
          ph1: '</b>',
        };
        const tb = new TranslationBundle(msgMap, (_) => 'foo');
        const msg = new i18n.Message([srcNode], phMap, {}, 'm', 'd', 'i');
        expect(() => tb.get(msg)).toThrowError(/Unexpected closing tag "b"/);
      });
    });
  });
}
