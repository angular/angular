/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as tss from 'typescript/lib/tsserverlibrary';
import {NgLanguageService} from '../api';

import {createLanguageService} from './language_service';
import {TypeScriptServiceHost} from './typescript_host';

// Use a WeakMap to keep track of Project to Host mapping so that when Project
// is deleted Host could be garbage collected.
const PROJECT_MAP = new WeakMap<tss.server.Project, TypeScriptServiceHost>();

/**
 * This function is called by tsserver to retrieve the external (non-TS) files
 * that should belong to the specified `project`. For Angular, these files are
 * external templates. This is called once when the project is loaded, then
 * every time when the program is updated.
 * @param project Project for which external files should be retrieved.
 */
export function getExternalFiles(project: tss.server.Project): string[] {
  if (!project.hasRoots()) {
    // During project initialization where there is no root files yet we should
    // not do any work.
    return [];
  }
  const ngLsHost = PROJECT_MAP.get(project);
  if (ngLsHost === undefined) {
    return [];
  }
  ngLsHost.getAnalyzedModules();
  return ngLsHost.getExternalTemplates().filter(fileName => {
    // TODO(kyliau): Remove this when the following PR lands on the version of
    // TypeScript used in this repo.
    // https://github.com/microsoft/TypeScript/pull/41737
    return project.fileExists(fileName);
  });
}

export function create(info: tss.server.PluginCreateInfo): NgLanguageService {
  const {languageService: tsLS, languageServiceHost: tsLSHost, config, project} = info;
  // This plugin could operate under two different modes:
  // 1. TS + Angular
  //    Plugin augments TS language service to provide additional Angular
  //    information. This only works with inline templates and is meant to be
  //    used as a local plugin (configured via tsconfig.json)
  // 2. Angular only
  //    Plugin only provides information on Angular templates, no TS info at all.
  //    This effectively disables native TS features and is meant for internal
  //    use only.
  const angularOnly = config ? config.angularOnly === true : false;
  const ngLSHost = new TypeScriptServiceHost(tsLSHost, tsLS);
  const ngLS = createLanguageService(ngLSHost);
  PROJECT_MAP.set(project, ngLSHost);

  function getCompletionsAtPosition(
      fileName: string, position: number, options: tss.GetCompletionsAtPositionOptions|undefined) {
    if (!angularOnly) {
      const results = tsLS.getCompletionsAtPosition(fileName, position, options);
      if (results && results.entries.length) {
        // If TS could answer the query, then return results immediately.
        return results;
      }
    }
    return ngLS.getCompletionsAtPosition(fileName, position, options);
  }

  function getQuickInfoAtPosition(fileName: string, position: number): tss.QuickInfo|undefined {
    if (!angularOnly) {
      const result = tsLS.getQuickInfoAtPosition(fileName, position);
      if (result) {
        // If TS could answer the query, then return results immediately.
        return result;
      }
    }
    return ngLS.getQuickInfoAtPosition(fileName, position);
  }

  function getSemanticDiagnostics(fileName: string): tss.Diagnostic[] {
    const results: tss.Diagnostic[] = [];
    if (!angularOnly) {
      results.push(...tsLS.getSemanticDiagnostics(fileName));
    }
    // For semantic diagnostics we need to combine both TS + Angular results
    results.push(...ngLS.getSemanticDiagnostics(fileName));
    return results;
  }

  function getDefinitionAtPosition(
      fileName: string, position: number): ReadonlyArray<tss.DefinitionInfo>|undefined {
    if (!angularOnly) {
      const results = tsLS.getDefinitionAtPosition(fileName, position);
      if (results) {
        // If TS could answer the query, then return results immediately.
        return results;
      }
    }
    const result = ngLS.getDefinitionAndBoundSpan(fileName, position);
    if (!result || !result.definitions || !result.definitions.length) {
      return;
    }
    return result.definitions;
  }

  function getDefinitionAndBoundSpan(
      fileName: string, position: number): tss.DefinitionInfoAndBoundSpan|undefined {
    if (!angularOnly) {
      const result = tsLS.getDefinitionAndBoundSpan(fileName, position);
      if (result) {
        // If TS could answer the query, then return results immediately.
        return result;
      }
    }
    return ngLS.getDefinitionAndBoundSpan(fileName, position);
  }

  function getTcb(fileName: string, position: number) {
    // Not implemented in VE Language Service
    return undefined;
  }

  function getComponentLocationsForTemplate(fileName: string) {
    // Not implemented in VE Language Service
    return [];
  }

  return {
    // First clone the original TS language service
    ...tsLS,
    // Then override the methods supported by Angular language service
    getCompletionsAtPosition,
    getQuickInfoAtPosition,
    getSemanticDiagnostics,
    getDefinitionAtPosition,
    getDefinitionAndBoundSpan,
    getTcb,
    getComponentLocationsForTemplate,
  };
}
