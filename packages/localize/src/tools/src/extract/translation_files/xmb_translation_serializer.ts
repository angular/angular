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

export class XmbTranslationSerializer implements TranslationSerializer {
  renderFile(messages: ParsedMessage[]): string {
    const xml = new XmlFile();
    xml.startTag('messagebundle');
    messages.forEach(message => {
      xml.startTag(
          'msg', {'id': message.messageId, desc: message.description, meaning: message.meaning},
          {preserveWhitespace: true});
      this.renderMessage(xml, message);
      xml.endTag('msg', {preserveWhitespace: false});
    });
    xml.endTag('messagebundle');
    return xml.toString();
  }

  private renderMessage(xml: XmlFile, message: ParsedMessage): void {
    xml.text(message.messageParts[0]);
    for (let i = 1; i < message.messageParts.length; i++) {
      xml.startTag('ph', {name: message.placeholderNames[i - 1]}, {selfClosing: true});
      xml.text(message.messageParts[i]);
    }
  }
}
