/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../../i18n/i18n_ast';

import {formatI18nPlaceholderName} from './util';

class IcuSerializerVisitor implements i18n.Visitor {
  visitText(text: i18n.Text): any {
    return text.value;
  }

  visitContainer(container: i18n.Container): any {
    return container.children.map(child => child.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu): any {
    const strCases =
        Object.keys(icu.cases).map((k: string) => `${k} {${icu.cases[k].visit(this)}}`);
    const result = `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
    return result;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder): any {
    return ph.isVoid ?
        this.formatPh(ph.startName) :
        `${this.formatPh(ph.startName)}${ph.children.map(child => child.visit(this)).join('')}${
            this.formatPh(ph.closeName)}`;
  }

  visitPlaceholder(ph: i18n.Placeholder): any {
    return this.formatPh(ph.name);
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any {
    return this.formatPh(ph.name);
  }

  private formatPh(value: string): string {
    return `{${formatI18nPlaceholderName(value, /* useCamelCase */ false)}}`;
  }
}

const serializer = new IcuSerializerVisitor();
export function serializeIcuNode(icu: i18n.Icu): string {
  return icu.visit(serializer);
}
