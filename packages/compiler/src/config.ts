/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy, ViewEncapsulation} from '@angular/core';
import {noUndefined} from './util';

export class CompilerConfig {
  public defaultEncapsulation: ViewEncapsulation|null;
  // Whether to support the `<template>` tag and the `template` attribute to define angular
  // templates. They have been deprecated in 4.x, `<ng-template>` should be used instead.
  public enableLegacyTemplate: boolean;
  public useJit: boolean;
  public missingTranslation: MissingTranslationStrategy|null;
  public preserveWhitespaces: boolean;

  constructor(
      {defaultEncapsulation = ViewEncapsulation.Emulated, useJit = true, missingTranslation,
       enableLegacyTemplate, preserveWhitespaces}: {
        defaultEncapsulation?: ViewEncapsulation,
        useJit?: boolean,
        missingTranslation?: MissingTranslationStrategy,
        enableLegacyTemplate?: boolean,
        preserveWhitespaces?: boolean
      } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
    this.useJit = !!useJit;
    this.missingTranslation = missingTranslation || null;
    this.enableLegacyTemplate = enableLegacyTemplate !== false;
    this.preserveWhitespaces = preserveWhitespacesDefault(noUndefined(preserveWhitespaces));
  }
}

export function preserveWhitespacesDefault(
    preserveWhitespacesOption: boolean | null, defaultSetting = true): boolean {
  return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
}
