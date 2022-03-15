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
  /** The name of the component that this migration handles. */
  abstract component: string;

  /** The tag name to be updated in the template. */
  abstract tagName: string;

  /**
   * Returns the data needed to update the given node.
   *
   * @param node A template ast element.
   * @returns The data needed to update this node.
   */
  abstract getUpdates(node: compiler.TmplAstElement): Update[];
}
