/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ParsedTemplate,
  TcbDirectiveMetadata,
  TmplAstHostElement,
  BoundTarget,
} from '@angular/compiler';

import {PreparedTcbData} from './tcb.js';
import {AnalysisResult, DeclarationMetadata} from './types.js';

export interface FileAnalysis {
  filePath: string;
  tcb?: string | null;
  // maps keyed by className
  parsedTemplates?: Map<string, ParsedTemplate>;
  // Cross-file map: resolved file path → set of type-only export names.
  // Used to approximate ngtsc's ts.TypeChecker cross-file type resolution for DI tokens.
  // See type_to_value.ts in ngtsc for the canonical TypeChecker-based approach:
  // https://github.com/angular/angular/blob/50e599e/packages/compiler-cli/src/ngtsc/reflection/src/type_to_value.ts
  typeOnlyExports?: Set<string>;
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
