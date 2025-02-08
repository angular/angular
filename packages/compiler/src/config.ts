/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MissingTranslationStrategy, ViewEncapsulation} from './core';
import {noUndefined} from './util';

export class CompilerConfig {
  public defaultEncapsulation: ViewEncapsulation | null;
  public preserveWhitespaces: boolean;
  public strictInjectionParameters: boolean;

  constructor({
    defaultEncapsulation = ViewEncapsulation.Emulated,
    preserveWhitespaces,
    strictInjectionParameters,
  }: {
    defaultEncapsulation?: ViewEncapsulation;
    preserveWhitespaces?: boolean;
    strictInjectionParameters?: boolean;
  } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
    this.preserveWhitespaces = preserveWhitespacesDefault(noUndefined(preserveWhitespaces));
    this.strictInjectionParameters = strictInjectionParameters === true;
  }
}

export function preserveWhitespacesDefault(
  preserveWhitespacesOption: boolean | null,
  defaultSetting = false,
): boolean {
  return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
}
