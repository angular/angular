/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export class RecordFormatter {
  getLabel(element) {
    if (element.type === 'defer') {
      return '@defer';
    }
    const name = element.directives
      .filter((d) => d.isComponent)
      .map((c) => c.name)
      .join(', ');
    const attributes = [
      ...new Set(element.directives.filter((d) => !d.isComponent).map((d) => d.name)),
    ].join(', ');
    return attributes === '' ? name : `${name}[${attributes}]`;
  }
  getValue(element) {
    let result = 0;
    element.directives.forEach((dir) => {
      result += this.getDirectiveValue(dir);
    });
    return result;
  }
  getDirectiveValue(directive) {
    let result = 0;
    let current = directive.changeDetection;
    if (current === undefined) {
      current = 0;
    }
    result += current;
    Object.values(directive.lifecycle).forEach((lifecycleProfile) => {
      const value = parseFloat(lifecycleProfile);
      if (!isNaN(value)) {
        result += value;
      }
    });
    return result;
  }
}
//# sourceMappingURL=record-formatter.js.map
