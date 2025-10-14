/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ViewEncapsulation} from './core';
import {noUndefined} from './util';
export class CompilerConfig {
  constructor({
    defaultEncapsulation = ViewEncapsulation.Emulated,
    preserveWhitespaces,
    strictInjectionParameters,
  } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
    this.preserveWhitespaces = preserveWhitespacesDefault(noUndefined(preserveWhitespaces));
    this.strictInjectionParameters = strictInjectionParameters === true;
  }
}
export function preserveWhitespacesDefault(preserveWhitespacesOption, defaultSetting = false) {
  return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
}
//# sourceMappingURL=config.js.map
