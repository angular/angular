/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileIdentifierMetadata} from './compile_metadata';
import {MissingTranslationStrategy, ViewEncapsulation} from './core';
import {Identifiers} from './identifiers';
import * as o from './output/output_ast';
import {noUndefined} from './util';

export class CompilerConfig {
  public defaultEncapsulation: ViewEncapsulation|null;
  // Whether to support the `<template>` tag and the `template` attribute to define angular
  // templates. They have been deprecated in 4.x, `<ng-template>` should be used instead.
  public enableLegacyTemplate: boolean;
  public useJit: boolean;
  public jitDevMode: boolean;
  public missingTranslation: MissingTranslationStrategy|null;
  public preserveWhitespaces: boolean;
  public strictInjectionParameters: boolean;

  constructor(
      {defaultEncapsulation = ViewEncapsulation.Emulated, useJit = true, jitDevMode = false,
       missingTranslation, enableLegacyTemplate, preserveWhitespaces, strictInjectionParameters}: {
        defaultEncapsulation?: ViewEncapsulation,
        useJit?: boolean,
        jitDevMode?: boolean,
        missingTranslation?: MissingTranslationStrategy,
        enableLegacyTemplate?: boolean,
        preserveWhitespaces?: boolean,
        strictInjectionParameters?: boolean,
      } = {}) {
    this.defaultEncapsulation = defaultEncapsulation;
    this.useJit = !!useJit;
    this.jitDevMode = !!jitDevMode;
    this.missingTranslation = missingTranslation || null;
    this.enableLegacyTemplate = enableLegacyTemplate === true;
    this.preserveWhitespaces = preserveWhitespacesDefault(noUndefined(preserveWhitespaces));
    this.strictInjectionParameters = strictInjectionParameters === true;
  }
}

export function preserveWhitespacesDefault(
    preserveWhitespacesOption: boolean | null, defaultSetting = true): boolean {
  return preserveWhitespacesOption === null ? defaultSetting : preserveWhitespacesOption;
}
