/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../i18n/i18n_ast';

import {formatI18nPlaceholderName} from './util';

const formatPh = (value: string): string => `{$${formatI18nPlaceholderName(value)}}`;

/**
 * This visitor walks over i18n tree and generates its string representation,
 * including ICUs and placeholders in {$PLACEHOLDER} format.
 */
class SerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text, context: any): any { return text.value; }

  visitContainer(container: i18n.Container, context: any): any {
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    const strCases =
        Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    return `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        formatPh(ph.startName) :
        `${formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any { return formatPh(ph.name); }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any { return formatPh(ph.name); }
}

const serializerVisitor = new SerializerVisitor();

export function getSerializedI18nContent(message: i18n.Message): string {
  return message.nodes.map(node => node.visit(serializerVisitor, null)).join('');
}