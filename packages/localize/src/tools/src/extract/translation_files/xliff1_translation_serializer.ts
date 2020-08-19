/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, relative} from '@angular/compiler-cli/src/ngtsc/file_system';
import {ɵParsedMessage, ɵSourceLocation} from '@angular/localize';

import {extractIcuPlaceholders} from './icu_parsing';
import {TranslationSerializer} from './translation_serializer';
import {XmlFile} from './xml_file';

/** This is the number of characters that a legacy Xliff 1.2 message id has. */
const LEGACY_XLIFF_MESSAGE_LENGTH = 40;

/**
 * A translation serializer that can write XLIFF 1.2 formatted files.
 *
 * http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
 * http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
 *
 * @see Xliff1TranslationParser
 */
export class Xliff1TranslationSerializer implements TranslationSerializer {
  constructor(
      private sourceLocale: string, private basePath: AbsoluteFsPath,
      private useLegacyIds: boolean) {}

  serialize(messages: ɵParsedMessage[]): string {
    const ids = new Set<string>();
    const xml = new XmlFile();
    xml.startTag('xliff', {'version': '1.2', 'xmlns': 'urn:oasis:names:tc:xliff:document:1.2'});
    xml.startTag('file', {'source-language': this.sourceLocale, 'datatype': 'plaintext'});
    xml.startTag('body');
    for (const message of messages) {
      const id = this.getMessageId(message);
      if (ids.has(id)) {
        // Do not render the same message more than once
        continue;
      }
      ids.add(id);

      xml.startTag('trans-unit', {id, datatype: 'html'});
      xml.startTag('source', {}, {preserveWhitespace: true});
      this.serializeMessage(xml, message);
      xml.endTag('source', {preserveWhitespace: false});
      if (message.location) {
        this.serializeLocation(xml, message.location);
      }
      if (message.description) {
        this.serializeNote(xml, 'description', message.description);
      }
      if (message.meaning) {
        this.serializeNote(xml, 'meaning', message.meaning);
      }
      xml.endTag('trans-unit');
    }
    xml.endTag('body');
    xml.endTag('file');
    xml.endTag('xliff');
    return xml.toString();
  }

  private serializeMessage(xml: XmlFile, message: ɵParsedMessage): void {
    const length = message.messageParts.length - 1;
    for (let i = 0; i < length; i++) {
      this.serializeTextPart(xml, message.messageParts[i]);
      const location = message.substitutionLocations?.[message.placeholderNames[i]];
      this.serializePlaceholder(xml, message.placeholderNames[i], location?.text);
    }
    this.serializeTextPart(xml, message.messageParts[length]);
  }

  private serializeTextPart(xml: XmlFile, text: string): void {
    const pieces = extractIcuPlaceholders(text);
    const length = pieces.length - 1;
    for (let i = 0; i < length; i += 2) {
      xml.text(pieces[i]);
      this.serializePlaceholder(xml, pieces[i + 1], undefined);
    }
    xml.text(pieces[length]);
  }

  private serializePlaceholder(xml: XmlFile, id: string, text: string|undefined): void {
    const attrs: Record<string, string> = {id};
    if (text !== undefined) {
      attrs['equiv-text'] = text;
    }
    xml.startTag('x', attrs, {selfClosing: true});
  }

  private serializeNote(xml: XmlFile, name: string, value: string): void {
    xml.startTag('note', {priority: '1', from: name}, {preserveWhitespace: true});
    xml.text(value);
    xml.endTag('note', {preserveWhitespace: false});
  }

  private serializeLocation(xml: XmlFile, location: ɵSourceLocation): void {
    xml.startTag('context-group', {purpose: 'location'});
    this.renderContext(xml, 'sourcefile', relative(this.basePath, location.file));
    const endLineString = location.end !== undefined && location.end.line !== location.start.line ?
        `,${location.end.line + 1}` :
        '';
    this.renderContext(xml, 'linenumber', `${location.start.line + 1}${endLineString}`);
    xml.endTag('context-group');
  }

  private renderContext(xml: XmlFile, type: string, value: string): void {
    xml.startTag('context', {'context-type': type}, {preserveWhitespace: true});
    xml.text(value);
    xml.endTag('context', {preserveWhitespace: false});
  }

  /**
   * Get the id for the given `message`.
   *
   * If there was a custom id provided, use that.
   *
   * If we have requested legacy message ids, then try to return the appropriate id
   * from the list of legacy ids that were extracted.
   *
   * Otherwise return the canonical message id.
   *
   * An Xliff 1.2 legacy message id is a hex encoded SHA-1 string, which is 40 characters long. See
   * https://csrc.nist.gov/csrc/media/publications/fips/180/4/final/documents/fips180-4-draft-aug2014.pdf
   */
  private getMessageId(message: ɵParsedMessage): string {
    return message.customId ||
        this.useLegacyIds && message.legacyIds !== undefined &&
        message.legacyIds.find(id => id.length === LEGACY_XLIFF_MESSAGE_LENGTH) ||
        message.id;
  }
}
