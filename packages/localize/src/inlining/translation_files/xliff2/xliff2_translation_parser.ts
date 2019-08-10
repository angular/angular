/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Expansion, ExpansionCase, Node, Text, XmlParser, visitAll} from '@angular/compiler';
import {extname} from 'path';

import {SourceMessage, computeMsgId} from '../../../utils/messages';
import {ParsedTranslation} from '../../../utils/translations';

import {BaseVisitor} from '../base_visitor';
import {I18nError} from '../i18n_error';
import {TranslationBundle} from '../translation_bundle';
import {TranslationParser} from '../translation_parser';
import {getAttrOrThrow, getAttribute, makeParsedTranslation, parseInnerRange} from '../utils';
import {Xliff2MessageSerializer} from './message_serializer';
import {ExternalXliff2MessageRenderer, InternalXliff2MessageRenderer, TargetMessageRenderer} from './renderer';

const XLIFF_2_0_NS_REGEX = /xmlns="urn:oasis:names:tc:xliff:document:2.0"/;

/**
 * A translation parser that can load XLIFF 2 files.
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
    const bundle = Xliff2TranslationBundleExtractor.extractBundle(xml.rootNodes);
    if (bundle === undefined) {
      throw new Error(`Unable to parse "${filePath}" as XLIFF 2.0 format.`);
    }
    return bundle;
  }
}

class Xliff2TranslationBundleExtractor extends BaseVisitor {
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
        translations: Xliff2TranslationExtractor.extractTranslations(element)
      };
    } else {
      return visitAll(this, element.children);
    }
  }
}

class Xliff2TranslationExtractor extends BaseVisitor {
  private translationsById: Record<string, ParsedTranslation> = {};
  private translations: Record<string, ParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element, context: any): any {
    if (element.name === 'unit') {
      const externalId = getAttrOrThrow(element, 'id');
      if (this.translationsById[externalId] !== undefined) {
        throw new I18nError(
            element.sourceSpan, `Duplicated translations for message "${externalId}"`);
      }
      visitAll(this, element.children, {unit: externalId});
    } else if (element.name === 'segment') {
      if (context === undefined || context.unit === undefined) {
        throw new I18nError(
            element.sourceSpan,
            'Invalid <segment> element: should be a child of a <unit> element.');
      }

      let source: Element|undefined;
      let target: Element|undefined;
      element.children.forEach(child => {
        if (child instanceof Element) {
          if (child.name === 'source') {
            source = child;
          } else if (child.name === 'target') {
            target = child;
          }
        }
      });
      if (source === undefined) {
        throw new I18nError(element.sourceSpan, 'Missing required <source> element');
      }
      if (target === undefined) {
        throw new I18nError(element.sourceSpan, 'Missing required <target> element');
      }

      const meaning = '';  // TODO: extract meaning
      const messageSerializer = new Xliff2MessageSerializer();

      const externalRenderer = new ExternalXliff2MessageRenderer();
      messageSerializer.serialize(externalRenderer, parseInnerRange(source));
      const computedExternalId = computeMsgId(externalRenderer.output, meaning);

      const internalRenderer = new InternalXliff2MessageRenderer();
      messageSerializer.serialize(internalRenderer, parseInnerRange(source));
      const internalMessageId = computeMsgId(internalRenderer.output, meaning);

      const targetRenderer = new TargetMessageRenderer();
      messageSerializer.serialize(targetRenderer, parseInnerRange(target));
      const targetMessage =
          makeParsedTranslation(targetRenderer.messageParts, targetRenderer.placeholderNames);

      const id = context.unit === computedExternalId ? internalMessageId : context.unit;
      this.translations[id] = targetMessage;

      console.log(context.unit);
      console.log(computedExternalId, externalRenderer.output);
      console.log(internalMessageId, internalRenderer.output);
      console.log(targetMessage);

    } else {
      return visitAll(this, element.children);
    }
  }
}

// pieces.map(p => p.type !== 'text' ? `{${p.value}}` : p.value).join('');