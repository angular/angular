/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParsedTemplate} from '@angular/compiler';

import {PreparedTcbData} from './tcb.js';
import {AnalysisResult, DeclarationMetadata} from './types.js';

export interface FileAnalysis {
  filePath: string;
  tcb?: string | null;
  // maps keyed by className
  parsedTemplates?: Map<string, ParsedTemplate>;
  preparedTcbData?: PreparedTcbData | null;
}

export interface ChunkContext {
  remoteScopedClasses: Set<string>;
  metadataMap: Map<string, AnalysisResult>;
  /**
   * For each component in the chunk (keyed `filePath#ClassName`), the declarations its template
   * uses eagerly. Remote scoping emits exactly this set from the declaring NgModule's file, and
   * the NgModule is compiled in the same chunk — that is what remote scoping *means* — so the
   * set is computed once while detecting cycles rather than re-derived per module.
   */
  eagerlyUsedDeclarations: Map<string, DeclarationMetadata[]>;
}

export function getOrCreateFileAnalysis(
  cache: Map<string, FileAnalysis>,
  filePath: string,
): FileAnalysis {
  let analysis = cache.get(filePath);
  if (!analysis) {
    analysis = {filePath, parsedTemplates: new Map()};
    cache.set(filePath, analysis);
  }
  return analysis;
}
