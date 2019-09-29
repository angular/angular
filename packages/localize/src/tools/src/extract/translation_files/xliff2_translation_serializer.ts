/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ParsedMessage} from '../../utils';
import {TranslationSerializer} from './translation_serializer';
import {XmlFile} from './xml_file';

export class Xliff2TranslationSerializer implements TranslationSerializer {
  renderFile(messages: ParsedMessage[]): string {
    const xml = new XmlFile();
    xml.startTag(
        'xliff',
        {'version': '2.0', 'xmlns': 'urn:oasis:names:tc:xliff:document:2.0', 'srcLang': 'en'});
    xml.startTag('file');
    messages.forEach(message => {
      xml.startTag('unit', {'id': message.messageId});
      if (message.meaning || message.description) {
        xml.startTag('notes');
        if (message.description) {
          this.renderNote(xml, 'description', message.description);
        }
        if (message.meaning) {
          this.renderNote(xml, 'meaning', message.meaning);
        }
        xml.endTag('notes');
      }
      xml.startTag('segment');
      xml.startTag('source', {}, {preserveWhitespace: true});
      this.renderMessage(xml, message);
      xml.endTag('source', {preserveWhitespace: false});
      xml.endTag('segment');
      xml.endTag('unit');
    });
    xml.endTag('file');
    xml.endTag('xliff');
    return xml.toString();
  }

  private renderMessage(xml: XmlFile, message: ParsedMessage): void {
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

  private renderNote(xml: XmlFile, name: string, value: string) {
    xml.startTag('note', {category: name}, {preserveWhitespace: true});
    xml.text(value);
    xml.endTag('note', {preserveWhitespace: false});
  }
}
