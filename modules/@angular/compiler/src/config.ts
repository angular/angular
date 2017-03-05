/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy, isDevMode} from '@angular/core';

export class CompilerConfig {
  // Whether to support the `<template>` tag and the `template` attribute to define angular
  // templates. They have been deprecated in 4.x, `<ng-template>` should be used instead.
  enableLegacyTemplate: boolean;
  useJit: boolean;
  missingTranslation: MissingTranslationStrategy;

  private _genDebugInfo: boolean;
  private _logBindingUpdate: boolean;

  constructor(
      {genDebugInfo, logBindingUpdate, useJit = true, missingTranslation, enableLegacyTemplate}: {
        genDebugInfo?: boolean,
        logBindingUpdate?: boolean,
        useJit?: boolean,
        missingTranslation?: MissingTranslationStrategy,
        enableLegacyTemplate?: boolean,
      } = {}) {
    this._genDebugInfo = genDebugInfo;
    this._logBindingUpdate = logBindingUpdate;
    this.useJit = useJit;
    this.missingTranslation = missingTranslation;
    this.enableLegacyTemplate = enableLegacyTemplate !== false;
  }

  get genDebugInfo(): boolean {
    return this._genDebugInfo === void 0 ? isDevMode() : this._genDebugInfo;
  }
  get logBindingUpdate(): boolean {
    return this._logBindingUpdate === void 0 ? isDevMode() : this._logBindingUpdate;
  }
}
