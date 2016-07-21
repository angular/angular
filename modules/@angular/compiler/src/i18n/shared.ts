/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StringWrapper, isBlank, isPresent, normalizeBlank} from '../facade/lang';
import * as html from '../html_parser/ast';
import {ParseError, ParseSourceSpan} from '../parse_util';


export const I18N_ATTR = 'i18n';
export const I18N_ATTR_PREFIX = 'i18n-';
const _CUSTOM_PH_EXP = /\/\/[\s\S]*i18n[\s\S]*\([\s\S]*ph[\s\S]*=[\s\S]*"([\s\S]*?)"[\s\S]*\)/g;

/**
 * An i18n error.
 */
export class I18nError extends ParseError {
  constructor(span: ParseSourceSpan, msg: string) { super(span, msg); }
}

export function isOpeningComment(n: html.Node): boolean {
  return n instanceof html.Comment && isPresent(n.value) && n.value.startsWith('i18n');
}

export function isClosingComment(n: html.Node): boolean {
  return n instanceof html.Comment && isPresent(n.value) && n.value === '/i18n';
}

export function getI18nAttr(p: html.Element): html.Attribute {
  return normalizeBlank(p.attrs.find(attr => attr.name === I18N_ATTR));
}

export function meaning(i18n: string): string {
  if (isBlank(i18n) || i18n == '') return '';
  return i18n.split('|')[0];
}

export function description(i18n: string): string {
  if (isBlank(i18n) || i18n == '') return '';
  let parts = i18n.split('|', 2);
  return parts.length > 1 ? parts[1] : '';
}

export function extractPlaceholderName(input: string): string {
  return StringWrapper.split(input, _CUSTOM_PH_EXP)[1];
}