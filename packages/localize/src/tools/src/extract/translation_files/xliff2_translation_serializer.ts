/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, relative} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ɵParsedMessage} from '@angular/localize';

import {TranslationSerializer} from './translation_serializer';
import {XmlFile} from './xml_file';

/** This is the maximum number of characters that can appear in a legacy XLIFF 2.0 message id. */
const MAX_LEGACY_XLIFF_2_MESSAGE_LENGTH = 20;

/**
 * A translation serializer that can write translations in XLIFF 2 format.
 *
 * http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 * @see Xliff2TranslationParser
 */
export class Xliff2TranslationSerializer implements TranslationSerializer {
  constructor(
      private sourceLocale: string, private basePath: AbsoluteFsPath,
      private useLegacyIds: boolean) {}

  serialize(messages: ɵParsedMessage[]): string {
    const ids = new Set<string>();
    const xml = new XmlFile();
    xml.startTag('xliff', {
      'version': '2.0',
      'xmlns': 'urn:oasis:names:tc:xliff:document:2.0',
      'srcLang': this.sourceLocale
    });
    xml.startTag('file');
    for (const message of messages) {
      const id = this.getMessageId(message);
      if (ids.has(id)) {
        // Do not render the same message more than once
        continue;
      }
      ids.add(id);
      xml.startTag('unit', {id});
      if (message.meaning || message.description) {
        xml.startTag('notes');
        if (message.location) {
          const {file, start, end} = message.location;
          const endLineString =
              end !== undefined && end.line !== start.line ? `,${end.line + 1}` : '';
          this.serializeNote(
              xml, 'location',
              `${relative(this.basePath, file)}:${start.line + 1}${endLineString}`);
        }
        if (message.description) {
          this.serializeNote(xml, 'description', message.description);
        }
        if (message.meaning) {
          this.serializeNote(xml, 'meaning', message.meaning);
        }
        xml.endTag('notes');
      }
      xml.startTag('segment');
      xml.startTag('source', {}, {preserveWhitespace: true});
      this.serializeMessage(xml, message);
      xml.endTag('source', {preserveWhitespace: false});
      xml.endTag('segment');
      xml.endTag('unit');
    }
    xml.endTag('file');
    xml.endTag('xliff');
    return xml.toString();
  }

  private serializeMessage(xml: XmlFile, message: ɵParsedMessage): void {
    xml.text(message.messageParts[0]);
    for (let i = 1; i < message.messageParts.length; i++) {
      const placeholderName = message.placeholderNames[i - 1];
      if (placeholderName.startsWith('START_')) {
        xml.startTag('pc', {
          id: `${i}`,
          equivStart: placeholderName,
          equivEnd: placeholderName.replace(/^START/, 'CLOSE')
        });
      } else if (placeholderName.startsWith('CLOSE_')) {
        xml.endTag('pc');
      } else {
        xml.startTag('ph', {id: `${i}`, equiv: placeholderName}, {selfClosing: true});
      }
      xml.text(message.messageParts[i]);
    }
  }

  private serializeNote(xml: XmlFile, name: string, value: string) {
    xml.startTag('note', {category: name}, {preserveWhitespace: true});
    xml.text(value);
    xml.endTag('note', {preserveWhitespace: false});
  }

  /**
   * Get the id for the given `message`.
   *
   * If we have requested legacy message ids, then try to return the appropriate id
   * from the list of legacy ids that were extracted.
   *
   * Otherwise return the canonical message id.
   *
   * An Xliff 2.0 legacy message id is a 64 bit number encoded as a decimal string, which will have
   * at most 20 digits, since 2^65-1 = 36,893,488,147,419,103,231. This digest is based on:
   * https://github.com/google/closure-compiler/blob/master/src/com/google/javascript/jscomp/GoogleJsMessageIdGenerator.java
   */
  private getMessageId(message: ɵParsedMessage): string {
    return this.useLegacyIds && message.legacyIds !== undefined &&
        message.legacyIds.find(
            id => id.length <= MAX_LEGACY_XLIFF_2_MESSAGE_LENGTH && !/[^0-9]/.test(id)) ||
        message.id;
  }
}
