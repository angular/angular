/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, DirectiveMeta, ParseSourceFile} from '@angular/compiler';
import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {AnnotationKind} from './api';

export interface ComponentMeta extends DirectiveMeta {
  ref: Reference<ClassDeclaration>;
  /**
   * Unparsed selector of the directive.
   */
  selector: string;
}

/**
 * An intermediate representation of a component.
 */
export interface ComponentInfo {
  kind: AnnotationKind.Component;

  /** Component TypeScript class declaration */
  declaration: ClassDeclaration;

  /** Component template selector if it exists, otherwise null. */
  selector: string|null;

  /**
   * BoundTarget containing the parsed template. Can also be used to query for directives used in
   * the template.
   */
  boundTemplate: BoundTarget<ComponentMeta>;

  /** Metadata about the template */
  templateMeta: {
    /** Whether the component template is inline */
    isInline: boolean;

    /** Template file recorded by template parser */
    file: ParseSourceFile;
  };
}

/**
 * Annotation intermediate representations that can be stored in an indexing context.
 */
export type AnnotationInfo = ComponentInfo;

// Allow populating the context without having to specify the annotation kind.
type OmitKind<T> = Pick<T, Exclude<keyof T, 'kind'>>;

/**
 * A context for storing indexing infromation about components of a program.
 *
 * An `IndexingContext` collects component and template analysis information from
 * `DecoratorHandler`s and exposes them to be indexed.
 */
export class IndexingContext {
  readonly registry = new Set<AnnotationInfo>();

  /**
   * Adds a component to the context.
   */
  addComponent(info: OmitKind<ComponentInfo>) {
    this.registry.add({...info, kind: AnnotationKind.Component});
  }
}
