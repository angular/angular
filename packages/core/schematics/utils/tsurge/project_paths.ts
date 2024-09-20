/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteFsPath,
  FileSystem,
  getFileSystem,
  isLocalRelativePath,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import ts from 'typescript';
import {ProgramInfo} from './program_info';

/**
 * Branded type representing a file ID. Practically, this
 * is a relative path based on the most appropriate root dir.
 *
 * A project-relative path is relative to the longest root
 * directory of the project. A project-relative path is always
 * unique in the context of the project (like google3).
 *
 * This is a requirement and the fundamental concept of root directories.
 * See: https://www.typescriptlang.org/tsconfig/#rootDirs.
 *
 * Note that compilation units are only sub-parts of the project
 * and are assumed, and expected to always have the same root directories.
 *
 * File IDs are important for Tsurge, as replacements and paths
 * should never refer to absolute paths. That is because the project
 * may be put into different temporary directories in workers.
 *
 * E.g. Tsunami may have different project roots in different
 * stages, or we can't reliably relativize paths after Tsunami completed.
 * Or, paths may exist inside `blaze-out/XX/google3` but instead should be
 * matching associable with the same path in its `.ts` compilation unit
 *
 * See {@link ProjectFile#id}
 */
export type ProjectFileID = string & {__projectFileID: true};

/**
 * Branded type representing an unsafe file path, relative to the
 * primary project root.
 *
 * The path is unsafe for unique ID generation as it does not respect
 * virtual roots as configured via `tsconfig#rootDirs`. Though, the
 * path is useful for replacements, writing to disk.
 *
 * See {@link ProjectFile#rootRelativePath}
 */
export type ProjectRootRelativePath = string & {__unsafeProjectRootRelative: true};

/**
 * Type representing a file in the project.
 *
 * This construct is fully serializable between stages and
 * workers.
 */
export interface ProjectFile {
  /**
   * Unique ID for the file.
   *
   * In practice, this is a file path relative to the most appropriate
   * root directory. This allows identifying files, respecting the virtual
   * root configuration. See: https://www.typescriptlang.org/tsconfig/#rootDirs.
   *
   * Use this for matching files, contributing to global metadata. IDs consider
   * the following files as the same: `/blaze-out/fast-build/file.ts` and `/file.ts`.
   */
  id: ProjectFileID;

  /**
   * Unsafe path for the file, relative to the primary
   * project root ({@link ProgramInfo.projectRoot})
   *
   * Use this with caution, and preferably not for unique ID
   * generation across workers and stages because {@link id}
   * is more suitable and respects virtual TS roots (`rootDirs`).
   */
  rootRelativePath: ProjectRootRelativePath;
}

/**
 * Gets a project file instance for the given file.
 *
 * Use this helper for dealing with project paths throughout your
 * migration. The return type is serializable.
 *
 * See {@link ProjectFile}.
 */
export function projectFile(
  file: ts.SourceFile | AbsoluteFsPath,
  {sortedRootDirs, projectRoot}: Pick<ProgramInfo, 'sortedRootDirs' | 'projectRoot'>,
): ProjectFile {
  const fs = getFileSystem();
  const filePath = fs.resolve(typeof file === 'string' ? file : file.fileName);

  // Sorted root directories are sorted longest to shortest. First match
  // is the appropriate root directory for ID computation.
  for (const rootDir of sortedRootDirs) {
    if (!isWithinBasePath(fs, rootDir, filePath)) {
      continue;
    }
    return {
      id: fs.relative(rootDir, filePath) as string as ProjectFileID,
      rootRelativePath: fs.relative(projectRoot, filePath) as string as ProjectRootRelativePath,
    };
  }

  // E.g. project directory may be `src/`, but files may be looked up
  // from `node_modules/`. This is fine, but in those cases, no root
  // directory matches.
  const rootRelativePath = fs.relative(projectRoot, filePath);
  return {
    id: rootRelativePath as string as ProjectFileID,
    rootRelativePath: rootRelativePath as string as ProjectRootRelativePath,
  };
}

/**
 * Whether `path` is a descendant of the `base`?
 * E.g. `a/b/c` is within `a/b` but not within `a/x`.
 */
function isWithinBasePath(fs: FileSystem, base: AbsoluteFsPath, path: AbsoluteFsPath): boolean {
  return isLocalRelativePath(fs.relative(base, path));
}
