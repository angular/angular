/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';

/** Stores the data needed to make a template update. */
export interface Update {
  /** The location of the update. */
  location: compiler.ParseLocation;

  /** A function to be used to update the template. */
  updateFn: (html: string) => string;
}

export abstract class TemplateMigrator {
  /** Returns the data needed to update the given node. */
  abstract getUpdates(ast: compiler.ParsedTemplate): Update[];
}
