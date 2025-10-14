/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {formatI18nPlaceholderName} from './util';
class IcuSerializerVisitor {
  visitText(text) {
    return text.value;
  }
  visitContainer(container) {
    return container.children.map((child) => child.visit(this)).join('');
  }
  visitIcu(icu) {
    const strCases = Object.keys(icu.cases).map((k) => `${k} {${icu.cases[k].visit(this)}}`);
    const result = `{${icu.expressionPlaceholder}, ${icu.type}, ${strCases.join(' ')}}`;
    return result;
  }
  visitTagPlaceholder(ph) {
    return ph.isVoid
      ? this.formatPh(ph.startName)
      : `${this.formatPh(ph.startName)}${ph.children
          .map((child) => child.visit(this))
          .join('')}${this.formatPh(ph.closeName)}`;
  }
  visitPlaceholder(ph) {
    return this.formatPh(ph.name);
  }
  visitBlockPlaceholder(ph) {
    return `${this.formatPh(ph.startName)}${ph.children
      .map((child) => child.visit(this))
      .join('')}${this.formatPh(ph.closeName)}`;
  }
  visitIcuPlaceholder(ph, context) {
    return this.formatPh(ph.name);
  }
  formatPh(value) {
    return `{${formatI18nPlaceholderName(value, /* useCamelCase */ false)}}`;
  }
}
const serializer = new IcuSerializerVisitor();
export function serializeIcuNode(icu) {
  return icu.visit(serializer);
}
//# sourceMappingURL=icu_serializer.js.map
