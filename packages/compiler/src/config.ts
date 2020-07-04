/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy, ViewEncapsulation} from './core';
import {noUndefined} from './util';

export class CompilerConfig {
  public defaultEncapsulation: ViewEncapsulation|null;
  public useJit: boolean;
  public jitDevMode: boolean;
  public missingTranslation: MissingTranslationStrategy|null;
  public preserveWhitespaces: boolean;
  public strictInjectionParameters: boolean;

  constructor({
    defaultEncapsulation = ViewEncapsulation.Emulated,
    useJit = true,
    jitDevMode = false,
    missingTranslation = null,
    preserveWhitespaces,
    strictInjectionParameters
  }: {
    defaultEncapsulation?: ViewEncapsulation,
    useJit?: boolean,
    jitDevMode?: boolean,
    missingTranslation?: MissingTranslationStrategy|null,
    preserveWhitespaces?: boolean,
    strictInjectionParameters?: boolean,
  } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
    this.useJit = !!useJit;
    this.jitDevMode = !!jitDevMode;
    this.missingTranslation = missingTranslation;
    this.preserveWhitespaces = preserveWhitespacesDefault(noUndefined(preserveWhitespaces));
    this.strictInjectionParameters = strictInjectionParameters === true;
  }
}

export function preserveWhitespacesDefault(
    preserveWhitespacesOption: boolean|null, defaultSetting = false): boolean {
  return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
}
