/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A `PropertyBinding` represents a mapping between a property name
 * and an attribute name. It is parsed from a string of the form
 * `"prop: attr"`; or simply `"propAndAttr" where the property
 * and attribute have the same identifier.
 */
export class PropertyBinding {
  // TODO(issue/24571): remove '!'.
  bracketAttr!: string;
  // TODO(issue/24571): remove '!'.
  bracketParenAttr!: string;
  // TODO(issue/24571): remove '!'.
  parenAttr!: string;
  // TODO(issue/24571): remove '!'.
  onAttr!: string;
  // TODO(issue/24571): remove '!'.
  bindAttr!: string;
  // TODO(issue/24571): remove '!'.
  bindonAttr!: string;

  constructor(public prop: string, public attr: string) {
    this.parseBinding();
  }

  private parseBinding() {
    this.bracketAttr = `[${this.attr}]`;
    this.parenAttr = `(${this.attr})`;
    this.bracketParenAttr = `[(${this.attr})]`;
    const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
    this.onAttr = `on${capitalAttr}`;
    this.bindAttr = `bind${capitalAttr}`;
    this.bindonAttr = `bindon${capitalAttr}`;
  }
}
