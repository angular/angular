/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Node, XmlParser, visitAll} from '@angular/compiler';
import {extname} from 'path';

import {TargetMessageRenderer} from '../../../../message_renderers/target_message_renderer';
import {MessageId, ParsedTranslation} from '../../../../utils';
import {TranslationBundle} from '../../../translator';
import {BaseVisitor} from '../../base_visitor';
import {I18nError} from '../../i18n_error';
import {getAttrOrThrow, parseInnerRange} from '../../translation_utils';
import {TranslationParser} from '../translation_parser';

import {Xliff1MessageSerializer} from './xliff1_message_serializer';

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

  parse(filePath: string, contents: string): TranslationBundle {
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
  private bundle: TranslationBundle|undefined;

  static extractBundle(xliff: Node[]): TranslationBundle|undefined {
    const visitor = new this();
    visitAll(visitor, xliff);
    return visitor.bundle;
  }

  visitElement(element: Element): any {
    if (element.name === 'file') {
      this.bundle = {
        locale: getAttrOrThrow(element, 'target-language'),
        translations: XliffTranslationVisitor.extractTranslations(element)
      };
    } else {
      return visitAll(this, element.children);
    }
  }
}

class XliffTranslationVisitor extends BaseVisitor {
  private translations: Record<MessageId, ParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element): any {
    if (element.name === 'trans-unit') {
      const id = getAttrOrThrow(element, 'id');
      if (this.translations[id] !== undefined) {
        throw new I18nError(element.sourceSpan, `Duplicated translations for message "${id}"`);
      }

      const targetMessage = element.children.find(isTargetElement);
      if (targetMessage === undefined) {
        throw new I18nError(element.sourceSpan, 'Missing required <target> element');
      }
      this.translations[id] = serializeTargetMessage(targetMessage);
    } else {
      return visitAll(this, element.children);
    }
  }
}

function serializeTargetMessage(source: Element): ParsedTranslation {
  const serializer = new Xliff1MessageSerializer(new TargetMessageRenderer());
  return serializer.serialize(parseInnerRange(source));
}

function isTargetElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'target';
}
