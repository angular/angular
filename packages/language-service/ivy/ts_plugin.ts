/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import {LanguageService} from './language_service';

export function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
  const {languageService: tsLS, config} = info;
  const angularOnly = config?.angularOnly === true;

  const ngLS = new LanguageService(tsLS);

  function getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    if (!angularOnly) {
      diagnostics.push(...tsLS.getSemanticDiagnostics(fileName));
    }
    diagnostics.push(...ngLS.getSemanticDiagnostics(fileName));
    return diagnostics;
  }

  return {
    ...tsLS,
    getSemanticDiagnostics,
  };
}
