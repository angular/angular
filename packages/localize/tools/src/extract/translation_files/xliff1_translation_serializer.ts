/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AbsoluteFsPath,
  getFileSystem,
  PathManipulation,
} from '@angular/compiler-cli/private/localize';
import {ɵParsedMessage, ɵSourceLocation} from '../../../../index';

import {FormatOptions, validateOptions} from './format_options';
import {extractIcuPlaceholders} from './icu_parsing';
import {TranslationSerializer} from './translation_serializer';
import {consolidateMessages, hasLocation} from './utils';
import {XmlFile} from './xml_file';

/** This is the number of characters that a legacy Xliff 1.2 message id has. */
const LEGACY_XLIFF_MESSAGE_LENGTH = 40;

/**
 * A translation serializer that can write XLIFF 1.2 formatted files.
 *
 * https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
 * https://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
 *
 * @see Xliff1TranslationParser
 * @publicApi used by CLI
 */
export class Xliff1TranslationSerializer implements TranslationSerializer {
  constructor(
    private sourceLocale: string,
    private basePath: AbsoluteFsPath,
    private useLegacyIds: boolean,
    private formatOptions: FormatOptions = {},
    private fs: PathManipulation = getFileSystem(),
  ) {
    validateOptions('Xliff1TranslationSerializer', [['xml:space', ['preserve']]], formatOptions);
  }

  serialize(messages: ɵParsedMessage[]): string {
    const messageGroups = consolidateMessages(messages, (message) => this.getMessageId(message));
    const xml = new XmlFile();
    xml.startTag('xliff', {'version': '1.2', 'xmlns': 'urn:oasis:names:tc:xliff:document:1.2'});
    // NOTE: the `original` property is set to the legacy `ng2.template` value for backward
    // compatibility.
    // We could compute the file from the `message.location` property, but there could
    // be multiple values for this in the collection of `messages`. In that case we would probably
    // need to change the serializer to output a new `<file>` element for each collection of
    // messages that come from a particular original file, and the translation file parsers may not
    // be able to cope with this.
    xml.startTag('file', {
      'source-language': this.sourceLocale,
      'datatype': 'plaintext',
      'original': 'ng2.template',
      ...this.formatOptions,
    });
    xml.startTag('body');
    for (const duplicateMessages of messageGroups) {
      const message = duplicateMessages[0];
      const id = this.getMessageId(message);

      xml.startTag('trans-unit', {id, datatype: 'html'});
      xml.startTag('source', {}, {preserveWhitespace: true});
      this.serializeMessage(xml, message);
      xml.endTag('source', {preserveWhitespace: false});

      // Write all the locations
      for (const {location} of duplicateMessages.filter(hasLocation)) {
        this.serializeLocation(xml, location);
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
      const name = message.placeholderNames[i];
      const location = message.substitutionLocations?.[name];
      const associatedMessageId =
        message.associatedMessageIds && message.associatedMessageIds[name];
      this.serializePlaceholder(xml, name, location?.text, associatedMessageId);
    }
    this.serializeTextPart(xml, message.messageParts[length]);
  }

  private serializeTextPart(xml: XmlFile, text: string): void {
    const pieces = extractIcuPlaceholders(text);
    const length = pieces.length - 1;
    for (let i = 0; i < length; i += 2) {
      xml.text(pieces[i]);
      this.serializePlaceholder(xml, pieces[i + 1], undefined, undefined);
    }
    xml.text(pieces[length]);
  }

  private serializePlaceholder(
    xml: XmlFile,
    id: string,
    text: string | undefined,
    associatedId: string | undefined,
  ): void {
    const attrs: Record<string, string> = {id};
    const ctype = getCtypeForPlaceholder(id);
    if (ctype !== null) {
      attrs['ctype'] = ctype;
    }
    if (text !== undefined) {
      attrs['equiv-text'] = text;
    }
    if (associatedId !== undefined) {
      attrs['xid'] = associatedId;
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
    this.renderContext(xml, 'sourcefile', this.fs.relative(this.basePath, location.file));
    const endLineString =
      location.end !== undefined && location.end.line !== location.start.line
        ? `,${location.end.line + 1}`
        : '';
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
    return (
      message.customId ||
      (this.useLegacyIds &&
        message.legacyIds !== undefined &&
        message.legacyIds.find((id) => id.length === LEGACY_XLIFF_MESSAGE_LENGTH)) ||
      message.id
    );
  }
}

/**
 * Compute the value of the `ctype` attribute from the `placeholder` name.
 *
 * The placeholder can take the following forms:
 *
 * - `START_BOLD_TEXT`/`END_BOLD_TEXT`
 * - `TAG_<ELEMENT_NAME>`
 * - `START_TAG_<ELEMENT_NAME>`
 * - `CLOSE_TAG_<ELEMENT_NAME>`
 *
 * In these cases the element name of the tag is extracted from the placeholder name and returned as
 * `x-<element_name>`.
 *
 * Line breaks and images are special cases.
 */
function getCtypeForPlaceholder(placeholder: string): string | null {
  const tag = placeholder.replace(/^(START_|CLOSE_)/, '');
  switch (tag) {
    case 'LINE_BREAK':
      return 'lb';
    case 'TAG_IMG':
      return 'image';
    default:
      const element = tag.startsWith('TAG_')
        ? tag.replace(/^TAG_(.+)/, (_, tagName: string) => tagName.toLowerCase())
        : TAG_MAP[tag];
      if (element === undefined) {
        return null;
      }
      return `x-${element}`;
  }
}

const TAG_MAP: Record<string, string> = {
  'LINK': 'a',
  'BOLD_TEXT': 'b',
  'EMPHASISED_TEXT': 'em',
  'HEADING_LEVEL1': 'h1',
  'HEADING_LEVEL2': 'h2',
  'HEADING_LEVEL3': 'h3',
  'HEADING_LEVEL4': 'h4',
  'HEADING_LEVEL5': 'h5',
  'HEADING_LEVEL6': 'h6',
  'HORIZONTAL_RULE': 'hr',
  'ITALIC_TEXT': 'i',
  'LIST_ITEM': 'li',
  'MEDIA_LINK': 'link',
  'ORDERED_LIST': 'ol',
  'PARAGRAPH': 'p',
  'QUOTATION': 'q',
  'STRIKETHROUGH_TEXT': 's',
  'SMALL_TEXT': 'small',
  'SUBSTRIPT': 'sub',
  'SUPERSCRIPT': 'sup',
  'TABLE_BODY': 'tbody',
  'TABLE_CELL': 'td',
  'TABLE_FOOTER': 'tfoot',
  'TABLE_HEADER_CELL': 'th',
  'TABLE_HEADER': 'thead',
  'TABLE_ROW': 'tr',
  'MONOSPACED_TEXT': 'tt',
  'UNDERLINED_TEXT': 'u',
  'UNORDERED_LIST': 'ul',
};
