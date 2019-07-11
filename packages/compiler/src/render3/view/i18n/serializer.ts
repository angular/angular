/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../i18n/i18n_ast';

import {formatI18nPlaceholderName} from './util';

/**
 * This visitor walks over i18n tree and generates its string representation, including ICUs and
 * placeholders in `{$placeholder}` (for plain messages) or `{PLACEHOLDER}` (inside ICUs) format.
 */
class SerializerVisitor implements i18n.Visitor {
  /**
   * Keeps track of ICU nesting level, allowing to detect that we are processing elements of an ICU.
   *
   * This is needed due to the fact that placeholders in ICUs and in other messages are represented
   * differently in Closure:
   * - {$placeholder} in non-ICU case
   * - {PLACEHOLDER} inside ICU
   */
  private icuNestingLevel = 0;

  private formatPh(value: string): string {
    const isInsideIcu = this.icuNestingLevel > 0;
    const formatted = formatI18nPlaceholderName(value, /* useCamelCase */ !isInsideIcu);
    return isInsideIcu ? `{${formatted}}` : `{$${formatted}}`;
  }

  visitText(text: i18n.Text, context: any): any { return text.value; }

  visitContainer(container: i18n.Container, context: any): any {
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu, context: any): any {
    this.icuNestingLevel++;
    const strCases =
        Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    const result = `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
    this.icuNestingLevel--;
    return result;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context: any): any {
    return ph.isVoid ?
        this.formatPh(ph.startName) :
        `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${this.formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context: any): any { return this.formatPh(ph.name); }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return this.formatPh(ph.name);
  }
}

const serializerVisitor = new SerializerVisitor();

export function getSerializedI18nContent(message: i18n.Message): string {
  return message.nodes.map(node => node.visit(serializerVisitor, null)).join('');
}