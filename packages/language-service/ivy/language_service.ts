/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

export class LanguageService {
  constructor(private readonly tsLS: ts.LanguageService) {}

  getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    return [];
  }
}
