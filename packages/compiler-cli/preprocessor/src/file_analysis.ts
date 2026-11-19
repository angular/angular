/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParsedTemplate, TmplAstNode} from '@angular/compiler';

import {type NgpTypeCheckingConfig, PreparedTcbData} from './tcb.js';
import {AnalysisResult, DeclarationMetadata} from './types.js';

export interface ParsedComponentTemplate extends ParsedTemplate {
  /**
   * Nodes of the template parsed with whitespace, line endings, and leading trivia preserved,
   * for accurate source spans in type-checking, diagnostics, and indexing.
   */
  diagNodes: TmplAstNode[];
  /**
   * Start of the component class's name span, recorded when the template is cached in
   * `FileAnalysis.parsedTemplates`. Lets a template be found from a `DeclarationMetadata`, which
   * carries the class's name span but not the class span the cache is keyed by.
   */
  classNameStart?: number;
}

/**
 * Per-file invalidation level since the file was last bound and processed, ordered from least to
 * most work required so multiple invalidation signals combine via `Math.max`.
 */
export enum ChangeKind {
  /** File, resources, and dependency inputs are unchanged; reuse bound state and `ProcessedFile`. */
  Unchanged = 0,
  /** Dependency metadata, `<ng-content>` selectors, or chunk scope changed; keep parsed templates. */
  Dependency = 1,
  /** External template or stylesheet changed while `.ts` source text did not; keep `sourceContent`. */
  ResourceOnly = 2,
  /** The `.ts` source file changed (or has no prior baseline). */
  Source = 3,
}

export interface FileAnalysis {
  filePath: string;
  sourceContent?: string;
  analysisResult?: AnalysisResult;
  tcbConfig?: NgpTypeCheckingConfig;
  changeKind?: ChangeKind;
  tcb?: string | null;
  parsedTemplates: Map<string, ParsedComponentTemplate>;
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
