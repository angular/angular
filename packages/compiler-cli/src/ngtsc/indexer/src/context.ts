/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveMeta, ParseSourceFile} from '@angular/compiler';
import {DeclarationNode} from '../../reflection';

import {AbstractBoundTemplate} from './api.js';

/**
 * Metadata about a component, extending DirectiveMeta to include a reference to the node.
 */
export interface ComponentMeta<T = DeclarationNode> extends DirectiveMeta {
  ref: {key: string; node: T};
  /**
   * Unparsed selector of the directive, or null if the directive does not have a selector.
   */
  selector: string | null;
}

/**
 * An intermediate representation of a component.
 */
export interface ComponentInfo<T = DeclarationNode> {
  /** Component TypeScript class declaration */
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
export class IndexingContext<T = DeclarationNode> {
  readonly components = new Set<ComponentInfo<T>>();

  /**
   * Adds a component to the context.
   */
  addComponent(info: ComponentInfo<T>) {
    this.components.add(info);
  }
}
