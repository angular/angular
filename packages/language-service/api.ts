/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @module
 * @description
 * Entry point for all public APIs of the language service package.
 */

import ts from 'typescript';

export interface PluginConfig {
  /**
   * If true, return only Angular results. Otherwise, return Angular + TypeScript
   * results.
   */
  angularOnly: boolean;
  /**
   * If true, enable `strictTemplates` in Angular compiler options regardless
   * of its value in tsconfig.json.
   */
  forceStrictTemplates?: true;
}

export type GetTcbResponse = {
  /**
   * The filename of the SourceFile this typecheck block belongs to.
   * The filename is entirely opaque and unstable, useful only for debugging
   * purposes.
   */
  fileName: string,
  /** The content of the SourceFile this typecheck block belongs to. */
  content: string,
  /**
   * Spans over node(s) in the typecheck block corresponding to the
   * TS code generated for template node under the current cursor position.
   *
   * When the cursor position is over a source for which there is no generated
   * code, `selections` is empty.
   */
  selections: ts.TextSpan[],
};

export type GetComponentLocationsForTemplateResponse = ts.DocumentSpan[];
export type GetTemplateLocationForComponentResponse = ts.DocumentSpan|undefined;

/**
 * `NgLanguageService` describes an instance of an Angular language service,
 * whose API surface is a strict superset of TypeScript's language service.
 */
export interface NgLanguageService extends ts.LanguageService {
  getTcb(fileName: string, position: number): GetTcbResponse|undefined;
  getComponentLocationsForTemplate(fileName: string): GetComponentLocationsForTemplateResponse;
  getTemplateLocationForComponent(fileName: string, position: number):
      GetTemplateLocationForComponentResponse;
}

export function isNgLanguageService(ls: ts.LanguageService|
                                    NgLanguageService): ls is NgLanguageService {
  return 'getTcb' in ls;
}
