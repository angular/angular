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

import {Xliff2MessageSerializer} from './xliff2_message_serializer';

const XLIFF_2_0_NS_REGEX = /xmlns="urn:oasis:names:tc:xliff:document:2.0"/;

/**
 * A translation parser that can load translations from XLIFF 2 files.
 *
 * http://docs.oasis-open.org/xliff/xliff-core/v2.0/os/xliff-core-v2.0-os.html
 *
 */
export class Xliff2TranslationParser implements TranslationParser {
  canParse(filePath: string, contents: string): boolean {
    return (extname(filePath) === '.xlf') && XLIFF_2_0_NS_REGEX.test(contents);
  }

  parse(filePath: string, contents: string): TranslationBundle {
    const xmlParser = new XmlParser();
    const xml = xmlParser.parse(contents, filePath);
    const bundle = Xliff2TranslationBundleVisitor.extractBundle(xml.rootNodes);
    if (bundle === undefined) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 2.0 format.`);
    }
    return bundle;
  }
}

class Xliff2TranslationBundleVisitor extends BaseVisitor {
  private locale: string|undefined;
  private bundle: TranslationBundle|undefined;

  static extractBundle(xliff: Node[]): TranslationBundle|undefined {
    const visitor = new this();
    visitAll(visitor, xliff);
    return visitor.bundle;
  }

  visitElement(element: Element): any {
    if (element.name === 'xliff') {
      this.locale = getAttrOrThrow(element, 'trgLang');
      return visitAll(this, element.children);
    } else if (element.name === 'file') {
      this.bundle = {
        locale: this.locale !,
        translations: Xliff2TranslationVisitor.extractTranslations(element)
      };
    } else {
      return visitAll(this, element.children);
    }
  }
}

class Xliff2TranslationVisitor extends BaseVisitor {
  private translations: Record<MessageId, ParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element, context: any): any {
    if (element.name === 'unit') {
      const externalId = getAttrOrThrow(element, 'id');
      if (this.translations[externalId] !== undefined) {
        throw new I18nError(
            element.sourceSpan, `Duplicated translations for message "${externalId}"`);
      }
      visitAll(this, element.children, {unit: externalId});
    } else if (element.name === 'segment') {
      assertTranslationUnit(element, context);
      const targetMessage = element.children.find(isTargetElement);
      if (targetMessage === undefined) {
        throw new I18nError(element.sourceSpan, 'Missing required <target> element');
      }
      this.translations[context.unit] = serializeTargetMessage(targetMessage);
    } else {
      return visitAll(this, element.children);
    }
  }
}

function assertTranslationUnit(segment: Element, context: any) {
  if (context === undefined || context.unit === undefined) {
    throw new I18nError(
        segment.sourceSpan, 'Invalid <segment> element: should be a child of a <unit> element.');
  }
}

function serializeTargetMessage(source: Element): ParsedTranslation {
  const serializer = new Xliff2MessageSerializer(new TargetMessageRenderer());
  return serializer.serialize(parseInnerRange(source));
}

function isTargetElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'target';
}
