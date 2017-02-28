/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken, MissingTranslationStrategy, ViewEncapsulation, isDevMode} from '@angular/core';

import {CompileIdentifierMetadata} from './compile_metadata';
import {Identifiers, createIdentifier} from './identifiers';


export class CompilerConfig {
  public defaultEncapsulation: ViewEncapsulation;
  // Whether to support the `<template>` tag and the `template` attribute to define angular
  // templates. They have been deprecated in 4.x, `<ng-template>` should be used instead.
  public enableLegacyTemplate: boolean;
  public useJit: boolean;
  public missingTranslation: MissingTranslationStrategy;

  private _genDebugInfo: boolean;
  private _logBindingUpdate: boolean;

  constructor(
      {defaultEncapsulation = ViewEncapsulation.Emulated, genDebugInfo, logBindingUpdate,
       useJit = true, missingTranslation, enableLegacyTemplate}: {
        defaultEncapsulation?: ViewEncapsulation,
        genDebugInfo?: boolean,
        logBindingUpdate?: boolean,
        useJit?: boolean,
        missingTranslation?: MissingTranslationStrategy,
        enableLegacyTemplate?: boolean,
      } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
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
