/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';
import {LanguageService} from './language_service';

export function create(info: ts.server.PluginCreateInfo): ts.LanguageService {
  const {project, languageService: tsLS, config} = info;
  const angularOnly = config?.angularOnly === true;

  const ngLS = new LanguageService(project, tsLS);

  function getSemanticDiagnostics(fileName: string): ts.Diagnostic[] {
    const diagnostics: ts.Diagnostic[] = [];
    if (!angularOnly) {
      diagnostics.push(...tsLS.getSemanticDiagnostics(fileName));
    }
    diagnostics.push(...ngLS.getSemanticDiagnostics(fileName));
    return diagnostics;
  }

  function getTypeDefinitionAtPosition(fileName: string, position: number) {
    return undefined;
  }

  function getQuickInfoAtPosition(fileName: string, position: number): ts.QuickInfo|undefined {
    if (angularOnly) {
      return ngLS.getQuickInfoAtPosition(fileName, position);
    } else {
      // If TS could answer the query, then return that result. Otherwise, return from Angular LS.
      return tsLS.getQuickInfoAtPosition(fileName, position) ??
          ngLS.getQuickInfoAtPosition(fileName, position);
    }
  }

  return {
    ...tsLS,
    getSemanticDiagnostics,
    getTypeDefinitionAtPosition,
    getQuickInfoAtPosition,
  };
}
