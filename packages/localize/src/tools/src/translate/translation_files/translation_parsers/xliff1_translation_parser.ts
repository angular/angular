/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Node, XmlParser, visitAll} from '@angular/compiler';
import {ɵMessageId, ɵParsedTranslation} from '@angular/localize';
import {extname} from 'path';

import {Diagnostics} from '../../../diagnostics';
import {BaseVisitor} from '../base_visitor';
import {MessageSerializer} from '../message_serialization/message_serializer';
import {TargetMessageRenderer} from '../message_serialization/target_message_renderer';

import {TranslationParseError} from './translation_parse_error';
import {ParsedTranslationBundle, TranslationParser} from './translation_parser';
import {getAttrOrThrow, getAttribute, parseInnerRange} from './translation_utils';

const XLIFF_1_2_NS_REGEX = /xmlns="urn:oasis:names:tc:xliff:document:1.2"/;

/**
 * A translation parser that can load XLIFF 1.2 files.
 *
 * http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
 * http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
 *
 */
export class Xliff1TranslationParser implements TranslationParser {
  canParse(filePath: string, contents: string): boolean {
    return (extname(filePath) === '.xlf') && XLIFF_1_2_NS_REGEX.test(contents);
  }

  parse(filePath: string, contents: string): ParsedTranslationBundle {
    const xmlParser = new XmlParser();
    const xml = xmlParser.parse(contents, filePath);
    const bundle = XliffFileElementVisitor.extractBundle(xml.rootNodes);
    if (bundle === undefined) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 1.2 format.`);
    }
    return bundle;
  }
}

class XliffFileElementVisitor extends BaseVisitor {
  private bundle: ParsedTranslationBundle|undefined;

  static extractBundle(xliff: Node[]): ParsedTranslationBundle|undefined {
    const visitor = new this();
    visitAll(visitor, xliff);
    return visitor.bundle;
  }

  visitElement(element: Element): any {
    if (element.name === 'file') {
      this.bundle = {
        locale: getAttribute(element, 'target-language'),
        translations: XliffTranslationVisitor.extractTranslations(element),
        diagnostics: new Diagnostics(),
      };
    } else {
      return visitAll(this, element.children);
    }
  }
}

class XliffTranslationVisitor extends BaseVisitor {
  private translations: Record<ɵMessageId, ɵParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ɵParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element): any {
    if (element.name === 'trans-unit') {
      const id = getAttrOrThrow(element, 'id');
      if (this.translations[id] !== undefined) {
        throw new TranslationParseError(
            element.sourceSpan, `Duplicated translations for message "${id}"`);
      }

      const targetMessage = element.children.find(isTargetElement);
      if (targetMessage === undefined) {
        throw new TranslationParseError(element.sourceSpan, 'Missing required <target> element');
      }
      this.translations[id] = serializeTargetMessage(targetMessage);
    } else {
      return visitAll(this, element.children);
    }
  }
}

function serializeTargetMessage(source: Element): ɵParsedTranslation {
  const serializer = new MessageSerializer(new TargetMessageRenderer(), {
    inlineElements: ['g', 'bx', 'ex', 'bpt', 'ept', 'ph', 'it', 'mrk'],
    placeholder: {elementName: 'x', nameAttribute: 'id'}
  });
  return serializer.serialize(parseInnerRange(source));
}

function isTargetElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'target';
}
