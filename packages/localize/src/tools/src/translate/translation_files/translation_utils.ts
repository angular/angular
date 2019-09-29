/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Element, LexerRange, Node, XmlParser} from '@angular/compiler';
import {ParsedTranslation, computeMsgId} from '../../utils';
import {I18nError} from './i18n_error';

export function computeTranslationMessageId(
    translation: ParsedTranslation, meaning?: string): string {
  let messageString = translation.messageParts[0];
  for (let i = 1; i < translation.messageParts.length; i++) {
    const placeholderName = translation.placeholderNames[i - 1];
    const messagePart = translation.messageParts[i];
    messageString += `{$${placeholderName}}${messagePart}`;
  }
  return computeMsgId(messageString, meaning);
}

export function getAttrOrThrow(element: Element, attrName: string): string {
  const attrValue = getAttribute(element, attrName);
  if (attrValue === undefined) {
    throw new I18nError(element.sourceSpan, `Missing required "${attrName}" attribute:`);
  }
  return attrValue;
}

export function getAttribute(element: Element, attrName: string): string|undefined {
  const attr = element.attrs.find(a => a.name === attrName);
  return attr !== undefined ? attr.value : undefined;
}

export function parseInnerRange(element: Element): Node[] {
  const xmlParser = new XmlParser();
  const xml = xmlParser.parse(
      element.sourceSpan.start.file.content, element.sourceSpan.start.file.url,
      {tokenizeExpansionForms: true, range: getInnerRange(element)});
  return xml.rootNodes;
}

function getInnerRange(element: Element): LexerRange {
  const start = element.startSourceSpan !.end;
  const end = element.endSourceSpan !.start;
  return {
    startPos: start.offset,
    startLine: start.line,
    startCol: start.col,
    endPos: end.offset,
  };
}