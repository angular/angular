/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A context for storing indexing information about components of a program.
 *
 * An `IndexingContext` collects component and template analysis information from
 * `DecoratorHandler`s and exposes them to be indexed.
 */
export class IndexingContext {
  components = new Set();
  /**
   * Adds a component to the context.
   */
  addComponent(info) {
    this.components.add(info);
  }
}
//# sourceMappingURL=context.js.map
