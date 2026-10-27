/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceFile} from '../parse_util';
import {AbstractBoundTemplate} from './api';

/**
 * An intermediate representation of a component.
 */
export interface IndexerComponentInfo<T = unknown> {
  /** Component class declaration */
  declaration: T;

  /** Component template selector if it exists, otherwise null. */
  selector: string | null;

  /**
   * BoundTarget containing the parsed template. Can also be used to query for directives used in
   * the template.
   */
  boundTemplate: AbstractBoundTemplate<T>;

  /** Metadata about the template */
  templateMeta: {
    /** Whether the component template is inline */
    isInline: boolean;

    /** Template file recorded by template parser */
    file: ParseSourceFile;
  };
}

/**
 * A context for storing indexing information about components of a program.
 *
 * An `IndexingContext` collects component and template analysis information from
 * `DecoratorHandler`s and exposes them to be indexed.
 */
export class IndexingContext<T = unknown> {
  readonly components = new Set<IndexerComponentInfo<T>>();

  /**
   * Adds a component to the context.
   */
  addComponent(info: IndexerComponentInfo<T>) {
    this.components.add(info);
  }
}
