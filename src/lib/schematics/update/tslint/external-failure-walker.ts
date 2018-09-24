/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Fix, Replacement, RuleFailure, RuleWalker} from 'tslint';
import {ExternalResource} from './component-file';

/**
 * Enhanced TSLint rule walker that makes it easier to create rule failures that don't belong to
 * the source file that has been passed to the rule walker.
 */
export class ExternalFailureWalker extends RuleWalker {

  /** Adds a failure for the external resource at the specified position with the given width. */
  addExternalFailureAt(node: ExternalResource, start: number, width: number, message: string,
                       fix?: Fix) {
    this.addFailure(new RuleFailure(node, start, start + width, message, this.getRuleName(), fix));
  }

  /** Adds a failure at the specified range for the external resource. */
  addExternalFailureFromStartToEnd(node: ExternalResource, start: number, end: number,
                                   message: string, fix?: Fix) {
    this.addFailure(new RuleFailure(node, start, end, message, this.getRuleName(), fix));
  }

  /** Adds a failure for the whole external resource node. */
  addExternalFailure(node: ExternalResource, message: string, fix?: Fix) {
    this.addExternalFailureAt(node, node.getStart(), node.getFullWidth(), message, fix);
  }

  /** Adds a failure to the external resource at the location of the specified replacement. */
  addExternalFailureAtReplacement(node: ExternalResource, message: string,
                                  replacement: Replacement) {
    this.addExternalFailureAt(node, replacement.start, replacement.end, message, replacement);
  }

  /** Adds a failure at the location of the specified replacement. */
  addFailureAtReplacement(message: string, replacement: Replacement) {
    this.addFailureAt(replacement.start, replacement.end, message, replacement);
  }
}
