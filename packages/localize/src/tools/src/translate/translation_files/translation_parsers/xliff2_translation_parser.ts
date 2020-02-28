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

  parse(filePath: string, contents: string): ParsedTranslationBundle {
    const xmlParser = new XmlParser();
    const xml = xmlParser.parse(contents, filePath);
    const bundle = Xliff2TranslationBundleVisitor.extractBundle(xml.rootNodes);
    if (bundle === undefined) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 2.0 format.`);
    }
    return bundle;
  }
}

interface BundleVisitorContext {
  parsedLocale?: string;
}

class Xliff2TranslationBundleVisitor extends BaseVisitor {
  private bundle: ParsedTranslationBundle|undefined;

  static extractBundle(xliff: Node[]): ParsedTranslationBundle|undefined {
    const visitor = new this();
    visitAll(visitor, xliff, {});
    return visitor.bundle;
  }

  visitElement(element: Element, {parsedLocale}: BundleVisitorContext): any {
    if (element.name === 'xliff') {
      parsedLocale = getAttribute(element, 'trgLang');
      return visitAll(this, element.children, {parsedLocale});
    } else if (element.name === 'file') {
      this.bundle = {
        locale: parsedLocale,
        translations: Xliff2TranslationVisitor.extractTranslations(element),
        diagnostics: new Diagnostics(),
      };
    } else {
      return visitAll(this, element.children, {parsedLocale});
    }
  }
}

class Xliff2TranslationVisitor extends BaseVisitor {
  private translations: Record<ɵMessageId, ɵParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ɵParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element, context: any): any {
    if (element.name === 'unit') {
      const externalId = getAttrOrThrow(element, 'id');
      if (this.translations[externalId] !== undefined) {
        throw new TranslationParseError(
            element.sourceSpan, `Duplicated translations for message "${externalId}"`);
      }
      visitAll(this, element.children, {unit: externalId});
    } else if (element.name === 'segment') {
      assertTranslationUnit(element, context);
      const targetMessage = element.children.find(isTargetElement);
      if (targetMessage === undefined) {
        throw new TranslationParseError(element.sourceSpan, 'Missing required <target> element');
      }
      this.translations[context.unit] = serializeTargetMessage(targetMessage);
    } else {
      return visitAll(this, element.children);
    }
  }
}

function assertTranslationUnit(segment: Element, context: any) {
  if (context === undefined || context.unit === undefined) {
    throw new TranslationParseError(
        segment.sourceSpan, 'Invalid <segment> element: should be a child of a <unit> element.');
  }
}

function serializeTargetMessage(source: Element): ɵParsedTranslation {
  const serializer = new MessageSerializer(new TargetMessageRenderer(), {
    inlineElements: ['cp', 'sc', 'ec', 'mrk', 'sm', 'em'],
    placeholder: {elementName: 'ph', nameAttribute: 'equiv', bodyAttribute: 'disp'},
    placeholderContainer:
        {elementName: 'pc', startAttribute: 'equivStart', endAttribute: 'equivEnd'}
  });
  return serializer.serialize(parseInnerRange(source));
}

function isTargetElement(node: Node): node is Element {
  return node instanceof Element && node.name === 'target';
}
