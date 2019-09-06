/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as tss from 'typescript/lib/tsserverlibrary';

import {createLanguageService} from './language_service';
import {TypeScriptServiceHost} from './typescript_host';

/**
 * A note about importing TypeScript module.
 * The TypeScript module is supplied by tsserver at runtime to ensure version
 * compatibility. In Angular language service, the rollup output is augmented
 * with a "banner" shim that overwrites 'typescript' and
 * 'typescript/lib/tsserverlibrary' imports with the value supplied by tsserver.
 * This means import of either modules will not be "required", but they'll work
 * just like regular imports.
 */

const projectHostMap = new WeakMap<tss.server.Project, TypeScriptServiceHost>();

/**
 * Return the external templates discovered through processing all NgModules in
 * the specified `project`.
 * This function is called in a few situations:
 * 1. When a ConfiguredProject is created
 *    https://github.com/microsoft/TypeScript/blob/c26c44d5fceb04ea14da20b6ed23449df777ff34/src/server/editorServices.ts#L1755
 * 2. When updateGraph() is called on a Project
 *    https://github.com/microsoft/TypeScript/blob/c26c44d5fceb04ea14da20b6ed23449df777ff34/src/server/project.ts#L915
 * @param project Most likely a ConfiguredProject
 */
export function getExternalFiles(project: tss.server.Project): string[] {
  if (!project.hasRoots()) {
    // During project initialization where there is no root files yet we should
    // not do any work.
    return [];
  }
  const ngLSHost = projectHostMap.get(project);
  if (!ngLSHost) {
    // Without an Angular host there is no way to get template references.
    return [];
  }
  ngLSHost.getAnalyzedModules();
  const templates = ngLSHost.getTemplateReferences();
  const logger = project.projectService.logger;
  if (logger.hasLevel(tss.server.LogLevel.verbose)) {
    // Log external files to help debugging.
    logger.info(`External files in ${project.projectName}: ${JSON.stringify(templates)}`);
  }
  return templates;
}

export function create(info: tss.server.PluginCreateInfo): tss.LanguageService {
  const {project, languageService: tsLS, languageServiceHost: tsLSHost, config} = info;
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
  projectHostMap.set(project, ngLSHost);

  function getCompletionsAtPosition(
      fileName: string, position: number,
      options: tss.GetCompletionsAtPositionOptions | undefined) {
    if (!angularOnly) {
      const results = tsLS.getCompletionsAtPosition(fileName, position, options);
      if (results && results.entries.length) {
        // If TS could answer the query, then return results immediately.
        return results;
      }
    }
    return ngLS.getCompletionsAt(fileName, position);
  }

  function getQuickInfoAtPosition(fileName: string, position: number): tss.QuickInfo|undefined {
    if (!angularOnly) {
      const result = tsLS.getQuickInfoAtPosition(fileName, position);
      if (result) {
        // If TS could answer the query, then return results immediately.
        return result;
      }
    }
    return ngLS.getHoverAt(fileName, position);
  }

  function getSemanticDiagnostics(fileName: string): tss.Diagnostic[] {
    const results: tss.Diagnostic[] = [];
    if (!angularOnly) {
      results.push(...tsLS.getSemanticDiagnostics(fileName));
    }
    // For semantic diagnostics we need to combine both TS + Angular results
    results.push(...ngLS.getDiagnostics(fileName));
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
    const result = ngLS.getDefinitionAt(fileName, position);
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
    return ngLS.getDefinitionAt(fileName, position);
  }

  const proxy: tss.LanguageService = Object.assign(
      // First clone the original TS language service
      {}, tsLS,
      // Then override the methods supported by Angular language service
      {
          getCompletionsAtPosition, getQuickInfoAtPosition, getSemanticDiagnostics,
          getDefinitionAtPosition, getDefinitionAndBoundSpan,
      });
  return proxy;
}
