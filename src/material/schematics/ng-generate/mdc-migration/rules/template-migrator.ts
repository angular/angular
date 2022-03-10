/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';

export abstract class TemplateMigrator {
  /** The name of the component that this migration handles. */
  abstract component: string;

  /** The tag name to be updated in the template. */
  abstract tagName: string;

  /**
   * Updates the start tag of the given node in the html template.
   *
   * @param template The html content to be updated.
   * @param node The Element node to be updated.
   * @returns The updated template.
   */
  updateEndTag(template: string, node: compiler.TmplAstElement): string {
    return template;
  }

  /**
   * Updates the end tag of the given node in the html template.
   *
   * @param template The html content to be updated.
   * @param node The Element node to be updated.
   * @returns The updated template.
   */
  updateStartTag(template: string, node: compiler.TmplAstElement): string {
    return template;
  }
}
