/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import MagicString from 'magic-string';
import {ProjectFile} from './project_paths';

/** A text replacement for the given file. */
export class Replacement {
  constructor(
    public projectFile: ProjectFile,
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

/** Helper that applies updates to the given text. */
export function applyTextUpdates(input: string, updates: TextUpdate[]): string {
  const res = new MagicString(input);
  for (const update of updates) {
    res.remove(update.data.position, update.data.end);
    res.appendLeft(update.data.position, update.data.toInsert);
  }
  return res.toString();
}
