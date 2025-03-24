/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportRequest} from '../api/import_generator';

import type {ModuleName} from './import_manager';

/** Branded string identifying a hashed {@link ImportRequest}. */
type ImportRequestHash = string & {__importHash: string};

/** Tracker capturing re-used generated imports. */
export interface ReuseGeneratedImportsTracker {
  /**
   * Map of previously resolved symbol imports. Cache can be re-used to return
   * the same identifier without checking the source-file again.
   */
  directReuseCache: Map<ImportRequestHash, ts.Identifier | [ts.Identifier, ts.Identifier]>;

  /**
   * Map of module names and their potential namespace import
   * identifiers. Allows efficient re-using of namespace imports.
   */
  namespaceImportReuseCache: Map<ModuleName, ts.Identifier>;
}

/** Attempts to efficiently re-use previous generated import requests. */
export function attemptToReuseGeneratedImports(
  tracker: ReuseGeneratedImportsTracker,
  request: ImportRequest<ts.SourceFile>,
): ts.Identifier | [ts.Identifier, ts.Identifier] | null {
  const requestHash = hashImportRequest(request);

  // In case the given import has been already generated previously, we just return
  // the previous generated identifier in order to avoid duplicate generated imports.
  const existingExactImport = tracker.directReuseCache.get(requestHash);
  if (existingExactImport !== undefined) {
    return existingExactImport;
  }

  const potentialNamespaceImport = tracker.namespaceImportReuseCache.get(
    request.exportModuleSpecifier as ModuleName,
  );
  if (potentialNamespaceImport === undefined) {
    return null;
  }

  if (request.exportSymbolName === null) {
    return potentialNamespaceImport;
  }

  return [potentialNamespaceImport, ts.factory.createIdentifier(request.exportSymbolName)];
}

/** Captures the given import request and its generated reference node/path for future re-use. */
export function captureGeneratedImport(
  request: ImportRequest<ts.SourceFile>,
  tracker: ReuseGeneratedImportsTracker,
  referenceNode: ts.Identifier | [ts.Identifier, ts.Identifier],
) {
  tracker.directReuseCache.set(hashImportRequest(request), referenceNode);

  if (request.exportSymbolName === null && !Array.isArray(referenceNode)) {
    tracker.namespaceImportReuseCache.set(
      request.exportModuleSpecifier as ModuleName,
      referenceNode,
    );
  }
}

/** Generates a unique hash for the given import request. */
function hashImportRequest(req: ImportRequest<ts.SourceFile>): ImportRequestHash {
  return `${req.requestedFile.fileName}:${req.exportModuleSpecifier}:${req.exportSymbolName}${
    req.unsafeAliasOverride ? ':' + req.unsafeAliasOverride : ''
  }` as ImportRequestHash;
}
