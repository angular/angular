/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  absoluteFrom,
  AbsoluteFsPath,
  getFileSystem,
} from '@angular/compiler-cli/src/ngtsc/file_system';
import MagicString from 'magic-string';
import ts from 'typescript';

/**
 * Branded type representing a project-relative path.
 *
 * This is important to enforce as replacements should be relative
 * to the project root, so that they can be serialized between phases.
 *
 * E.g. Tsunami may have different project roots in different stages, or
 * we can't reliably relativize paths after Tsunami completed.
 */
export type ProjectRelativePath = string & {__projectRelativePath: true};

/** A text replacement for the given file. */
export class Replacement {
  constructor(
    public projectRelativePath: ProjectRelativePath,
    public update: TextUpdate,
  ) {}
}

/** An isolated text update that may be applied to a file. */
export class TextUpdate {
  constructor(
    public data: {
      position: number;
      end: number;
      toInsert: string;
    },
  ) {}
}

/** Gets a project-relative relative for the given source file. */
export function projectRelativePath(
  file: ts.SourceFile | string,
  projectAbsPath: AbsoluteFsPath,
): ProjectRelativePath {
  return getFileSystem().relative(
    projectAbsPath,
    typeof file === 'string' ? file : file.fileName,
  ) as string as ProjectRelativePath;
}

/** Helper that applies updates to the given text. */
export function applyTextUpdates(input: string, updates: TextUpdate[]): string {
  const res = new MagicString(input);
  for (const update of updates) {
    res.remove(update.data.position, update.data.end);
    res.appendLeft(update.data.position, update.data.toInsert);
  }
  return res.toString();
}
