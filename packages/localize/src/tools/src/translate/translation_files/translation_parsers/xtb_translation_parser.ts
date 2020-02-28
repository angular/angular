/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Node, XmlParser, visitAll} from '@angular/compiler';
import {ɵParsedTranslation} from '@angular/localize';
import {extname} from 'path';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';
import {MessageSerializer} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {TranslationParseError} from './translation_parse_error';
import {ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {getAttrOrThrow, parseInnerRange} from './translation_utils';



/**
 * A translation parser that can load XB files.
 */
export class XtbTranslationParser implements TranslationParser {
  constructor(private diagnostics: Diagnostics = new Diagnostics()) {}

  canParse(filePath: string, contents: string): boolean {
    const extension = extname(filePath);
    return (extension === '.xtb' || extension === '.xmb') &&
        contents.includes('<translationbundle');
  }

  parse(filePath: string, contents: string): ParsedTranslationBundle {
    const xmlParser = new XmlParser();
    const xml = xmlParser.parse(contents, filePath);
    const bundle = XtbVisitor.extractBundle(this.diagnostics, xml.rootNodes);
    if (bundle === undefined) {
      throw new Error(`Unable to parse "${filePath}" as XTB/XMB format.`);
    }
    return bundle;
  }
}

class XtbVisitor extends BaseVisitor {
  static extractBundle(diagnostics: Diagnostics, messageBundles: Node[]): ParsedTranslationBundle
      |undefined {
    const visitor = new this(diagnostics);
    const bundles: ParsedTranslationBundle[] = visitAll(visitor, messageBundles, undefined);
    return bundles[0];
  }

  constructor(private diagnostics: Diagnostics) { super(); }

  visitElement(element: Element, bundle: ParsedTranslationBundle|undefined): any {
    switch (element.name) {
      case 'translationbundle':
        if (bundle) {
          throw new TranslationParseError(
              element.sourceSpan, '<translationbundle> elements can not be nested');
        }
        const langAttr = element.attrs.find((attr) => attr.name === 'lang');
        bundle = {
          locale: langAttr && langAttr.value,
          translations: {},
          diagnostics: this.diagnostics
        };
        visitAll(this, element.children, bundle);
        return bundle;

      case 'translation':
        if (!bundle) {
          throw new TranslationParseError(
              element.sourceSpan, '<translation> must be inside a <translationbundle>');
        }
        const id = getAttrOrThrow(element, 'id');
        if (bundle.translations.hasOwnProperty(id)) {
          throw new TranslationParseError(
              element.sourceSpan, `Duplicated translations for message "${id}"`);
        } else {
          try {
            bundle.translations[id] = serializeTargetMessage(element);
          } catch (error) {
            if (typeof error === 'string') {
              this.diagnostics.warn(
                  `Could not parse message with id "${id}" - perhaps it has an unrecognised ICU format?\n` +
                  error);
            } else {
              throw error;
            }
          }
        }
        break;

      default:
        throw new TranslationParseError(element.sourceSpan, 'Unexpected tag');
    }
  }
}

function serializeTargetMessage(source: Element): ɵParsedTranslation {
  const serializer = new MessageSerializer(
      new TargetMessageRenderer(),
      {inlineElements: [], placeholder: {elementName: 'ph', nameAttribute: 'name'}});
  return serializer.serialize(parseInnerRange(source));
}
