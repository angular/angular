/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, Expansion, ExpansionCase, Node, Text, XmlParser, visitAll} from '@angular/compiler';
import {extname} from 'path';

import {ParsedTranslation} from '../../utils/translations';

import {BaseVisitor} from './base_visitor';
import {I18nError} from './i18n_error';
import {TranslationBundle} from './translation_bundle';
import {TranslationParser} from './translation_parser';
import {getAttrOrThrow, makeParsedTranslation, parseInnerRange} from './utils';

const XLIFF_1_2_NS_REGEX = /xmlns="urn:oasis:names:tc:xliff:document:1.2"/;

/**
 * A translation parser that can load XLIFF 1.2 files.
 *
 * http://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html
 * http://docs.oasis-open.org/xliff/v1.2/xliff-profile-html/xliff-profile-html-1.2.html
 *
 */
export class XliffTranslationParser implements TranslationParser {
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
        translations: XliffTranslationUnitVisitor.extractTranslations(element)
      };
    } else {
      return visitAll(this, element.children);
    }
  }
}

class XliffTranslationUnitVisitor extends BaseVisitor {
  private translationsById: Record<string, ParsedTranslation> = {};
  private translations: Record<string, ParsedTranslation> = {};

  static extractTranslations(file: Element): Record<string, ParsedTranslation> {
    const visitor = new this();
    visitAll(visitor, file.children);
    return visitor.translations;
  }

  visitElement(element: Element): any {
    if (element.name === 'trans-unit') {
      const id = getAttrOrThrow(element, 'id');
      if (this.translationsById[id] !== undefined) {
        throw new I18nError(element.sourceSpan, `Duplicated translations for message "${id}"`);
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

      const sourceMessages: string[] = [];
      SourceMessageVisitor.extractMessages(sourceMessages, parseInnerRange(source));
      const targetMessages: ParsedTranslation[] = [];
      TargetMessageVisitor.extractTranslations(targetMessages, parseInnerRange(target));

      sourceMessages.forEach((sourceMessage, index) => {
        const targetMessage = targetMessages[index];
        this.translations[sourceMessage] = targetMessage;
      });
      this.translationsById[id] = targetMessages[targetMessages.length - 1];

    } else {
      return visitAll(this, element.children);
    }
  }
}

const INLINE_ELEMENTS = ['g', 'x', 'bx', 'ex', 'bpt', 'ept', 'ph', 'it', 'mrk'];

abstract class BaseMessageVisitor<T> extends BaseVisitor {
  protected constructor(protected messages: T[]) { super(); }

  protected currentText: string = '';
  visitElement(element: Element) {
    if (element.name === 'x') {
      this.visitPlaceholder(getAttrOrThrow(element, 'id'));
    } else if (INLINE_ELEMENTS.indexOf(element.name) !== -1) {
      visitAll(this, element.children);
    } else {
      throw new I18nError(element.sourceSpan, `Invalid element found in message.`);
    }
  }

  visitText(text: Text) { this.currentText += text.value; }

  abstract visitPlaceholder(id: string): void;
}

class SourceMessageVisitor extends BaseMessageVisitor<string> {
  static extractMessages(messages: string[], nodes: Node[]): void {
    const visitor = new this(messages);
    visitAll(visitor, nodes);
    messages.push(visitor.currentText);
  }

  visitPlaceholder(id: string) { this.currentText += `{$${id}}`; }

  visitExpansion(expansion: Expansion) {
    this.currentText += SourceMessageExpansionVisitor.visitExpansion(this.messages, expansion);
  }
}

class TargetMessageVisitor extends BaseMessageVisitor<ParsedTranslation> {
  private messageParts: string[] = [];
  private placeholderNames: string[] = [];

  static extractTranslations(messages: ParsedTranslation[], nodes: Node[]): void {
    const visitor = new this(messages);
    visitAll(visitor, nodes);
    visitor.messageParts.push(visitor.currentText);
    visitor.messages.push(makeParsedTranslation(visitor.messageParts, visitor.placeholderNames));
  }

  visitPlaceholder(id: string) {
    this.messageParts.push(this.currentText);
    this.currentText = '';
    this.placeholderNames.push(id);
  }

  visitExpansion(expansion: Expansion) {
    this.currentText += TargetMessageExpansionVisitor.visitExpansion(this.messages, expansion);
  }
}

abstract class BaseMessageExpansionVisitor<T> extends BaseMessageVisitor<T> {
  visitExpansionCase(expansionCase: ExpansionCase) {
    this.currentText += ` ${expansionCase.value} {`;
    visitAll(this, expansionCase.expression);
    this.currentText += '}';
  }

  visitPlaceholder(id: string) { this.currentText += `{${id}}`; }
}

class SourceMessageExpansionVisitor extends BaseMessageExpansionVisitor<string> {
  static visitExpansion(messages: string[], expansion: Expansion): string {
    const visitor = new this(messages);
    visitor.currentText += `${expansion.switchValue}, ${expansion.type},`;
    visitAll(visitor, expansion.cases);
    return `{${visitor.currentText}}`;
  }

  visitExpansion(expansion: Expansion) {
    this.currentText += 'ICU';
    this.messages.push(SourceMessageExpansionVisitor.visitExpansion(this.messages, expansion));
  }
}

class TargetMessageExpansionVisitor extends BaseMessageExpansionVisitor<ParsedTranslation> {
  static visitExpansion(messages: ParsedTranslation[], expansion: Expansion): string {
    const visitor = new this(messages);
    visitor.currentText += `${expansion.switchValue}, ${expansion.type},`;
    visitAll(visitor, expansion.cases);
    return `{${visitor.currentText}}`;
  }

  visitExpansion(expansion: Expansion) {
    this.currentText += 'ICU';
    this.messages.push(makeParsedTranslation(
        [TargetMessageExpansionVisitor.visitExpansion(this.messages, expansion)]));
  }
}
