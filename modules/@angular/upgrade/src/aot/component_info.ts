/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '@angular/core';

export interface ComponentInfo {
  component: Type<any>;
  inputs?: string[];
  outputs?: string[];
}

export class PropertyBinding {
  prop: string;
  attr: string;
  bracketAttr: string;
  bracketParenAttr: string;
  parenAttr: string;
  onAttr: string;
  bindAttr: string;
  bindonAttr: string;

  constructor(public binding: string) { this.parseBinding(); }

  private parseBinding() {
    const parts = this.binding.split(':');
    this.prop = parts[0].trim();
    this.attr = (parts[1] || this.prop).trim();
    this.bracketAttr = `[${this.attr}]`;
    this.parenAttr = `(${this.attr})`;
    this.bracketParenAttr = `[(${this.attr})]`;
    const capitalAttr = this.attr.charAt(0).toUpperCase() + this.attr.substr(1);
    this.onAttr = `on${capitalAttr}`;
    this.bindAttr = `bind${capitalAttr}`;
    this.bindonAttr = `bindon${capitalAttr}`;
  }
}