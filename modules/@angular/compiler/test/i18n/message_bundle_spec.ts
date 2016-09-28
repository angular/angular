/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '@angular/compiler/src/i18n/i18n_ast';
import {Serializer} from '@angular/compiler/src/i18n/serializers/serializer';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';

import {serializeNodes} from '../../src/i18n/digest';
import {MessageBundle} from '../../src/i18n/message_bundle';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/interpolation_config';

export function main(): void {
  describe('MessageBundle', () => {
    describe('Messages', () => {
      let messages: MessageBundle;

      beforeEach(() => { messages = new MessageBundle(new HtmlParser, [], {}); });

      it('should extract the message to the catalog', () => {
        messages.updateFromTemplate(
            '<p i18n="m|d">Translate Me</p>', 'url', DEFAULT_INTERPOLATION_CONFIG);
        expect(humanizeMessages(messages)).toEqual([
          '2e791a68a3324ecdd29e252198638dafacec46e9=Translate Me',
        ]);
      });

      it('should extract the same message with different meaning in different entries', () => {
        messages.updateFromTemplate(
            '<p i18n="m|d">Translate Me</p><p i18n>Translate Me</p>', 'url',
            DEFAULT_INTERPOLATION_CONFIG);
        expect(humanizeMessages(messages)).toEqual([
          '2e791a68a3324ecdd29e252198638dafacec46e9=Translate Me',
          '8ca133f957845af1b1868da1b339180d1f519644=Translate Me',
        ]);
      });
    });
  });
}

class _TestSerializer implements Serializer {
  write(messageMap: {[id: string]: i18n.Message}): string {
    return Object.keys(messageMap)
        .map(id => `${id}=${serializeNodes(messageMap[id].nodes)}`)
        .join('//');
  }

  load(content: string, url: string, placeholders: {}): {} { return null; }
}

function humanizeMessages(catalog: MessageBundle): string[] {
  return catalog.write(new _TestSerializer()).split('//');
}