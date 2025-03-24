/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

import {BazelFileInfo, EntryPointInfo, PackageMetadata} from './api';

/** Interface describing an entry-point Bazel package. */
interface EntryPointPackage {
  /** Module name of the entry-point. */
  name: string;
  /** Execroot-relative path to the entry-point package. */
  path: string;
  /** Extracted info for the entry-point. */
  info: EntryPointInfo;
}

/** Comment that can be used to skip a single import from being flagged. */
const skipComment = '// @ng_package: ignore-cross-repo-import';

/**
 * Analyzes the given JavaScript source file and checks whether there are
 * any relative imports that point to different entry-points or packages.
 *
 * Such imports are flagged and will be returned in the failure list. Cross
 * entry-point or package imports result in duplicate code and therefore are
 * forbidden (unless explicitly opted out via comment - {@link skipComment}).
 */
export function analyzeFileAndEnsureNoCrossImports(
  file: BazelFileInfo,
  pkg: PackageMetadata,
): string[] {
  const content = fs.readFileSync(file.path, 'utf8');
  const sf = ts.createSourceFile(file.path, content, ts.ScriptTarget.Latest, true);
  const fileDirPath = path.posix.dirname(file.path);
  const fileDebugName = file.shortPath.replace(/\.[cm]js$/, '.ts');
  const failures: string[] = [];

  const owningPkg = determineOwningEntryPoint(file, pkg);
  if (owningPkg === null) {
    throw new Error(`Could not determine owning entry-point package of: ${file.shortPath}`);
  }

  // TODO: Consider handling deep dynamic import expressions.
  for (const st of sf.statements) {
    if (
      (!ts.isImportDeclaration(st) && !ts.isExportDeclaration(st)) ||
      st.moduleSpecifier === undefined ||
      !ts.isStringLiteralLike(st.moduleSpecifier)
    ) {
      continue;
    }
    // Skip module imports.
    if (!st.moduleSpecifier.text.startsWith('.')) {
      continue;
    }
    // Skip this import if there is an explicit skip comment.
    const leadingComments = ts.getLeadingCommentRanges(sf.text, st.getFullStart());
    if (
      leadingComments !== undefined &&
      leadingComments.some((c) => sf.text.substring(c.pos, c.end) === skipComment)
    ) {
      continue;
    }

    const destinationPath = path.posix.join(fileDirPath, st.moduleSpecifier.text);
    const targetPackage = determineOwningEntryPoint({path: destinationPath}, pkg);
    if (targetPackage === null) {
      failures.push(
        `Could not determine owning entry-point package of: ${destinationPath}. Imported from: ${fileDebugName}. Is this a relative import to another full package?.\n` +
          `You can skip this import by adding a comment: ${skipComment}`,
      );
      continue;
    }
  }

  return failures;
}

/** Determines the owning entry-point for the given JavaScript file. */
function determineOwningEntryPoint(
  file: Pick<BazelFileInfo, 'path'>,
  pkg: PackageMetadata,
): EntryPointPackage | null {
  let owningEntryPoint: EntryPointPackage | null = null;

  for (const [name, info] of Object.entries(pkg.entryPoints)) {
    // Entry point directory is assumed because technically the entry-point
    // could be deeper inside the entry-point source file package. This is
    // unlikely though and we still catch most cases, especially in the standard
    // folder layout where the APF entry-point index file resides at the top of
    // the entry-point.
    const assumedEntryPointDir = path.posix.dirname(info.index.path);

    if (
      file.path.startsWith(assumedEntryPointDir) &&
      (owningEntryPoint === null || owningEntryPoint.path.length < assumedEntryPointDir.length)
    ) {
      owningEntryPoint = {name, info, path: assumedEntryPointDir};
    }
  }

  return owningEntryPoint;
}
