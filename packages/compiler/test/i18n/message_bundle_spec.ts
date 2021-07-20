/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {serializeNodes} from '../../src/i18n/digest';
import * as i18n from '../../src/i18n/i18n_ast';
import {MessageBundle} from '../../src/i18n/message_bundle';
import {Serializer} from '../../src/i18n/serializers/serializer';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/interpolation_config';

{
  describe('MessageBundle', () => {
    describe('Messages', () => {
      let messages: MessageBundle;

      beforeEach(() => {
        messages = new MessageBundle(new HtmlParser, [], {});
      });

      it('should extract the message to the catalog', () => {
        messages.updateFromTemplate(
            '<p i18n="m|d">Translate Me</p>', 'url', DEFAULT_INTERPOLATION_CONFIG);
        expect(humanizeMessages(messages)).toEqual([
          'Translate Me (m|d)',
        ]);
      });

      it('should extract and dedup messages', () => {
        messages.updateFromTemplate(
            '<p i18n="m|d@@1">Translate Me</p><p i18n="@@2">Translate Me</p><p i18n="@@2">Translate Me</p>',
            'url', DEFAULT_INTERPOLATION_CONFIG);
        expect(humanizeMessages(messages)).toEqual([
          'Translate Me (m|d)',
          'Translate Me (|)',
        ]);
      });
    });
  });
}

class _TestSerializer extends Serializer {
  override write(messages: i18n.Message[]): string {
    return messages.map(msg => `${serializeNodes(msg.nodes)} (${msg.meaning}|${msg.description})`)
        .join('//');
  }

  override load(content: string, url: string):
      {locale: string|null, i18nNodesByMsgId: {[id: string]: i18n.Node[]}} {
    return {locale: null, i18nNodesByMsgId: {}};
  }

  override digest(msg: i18n.Message): string {
    return msg.id || `default`;
  }
}

function humanizeMessages(catalog: MessageBundle): string[] {
  return catalog.write(new _TestSerializer()).split('//');
}
