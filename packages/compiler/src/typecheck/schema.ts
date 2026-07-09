/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '../parse_util';
import {SchemaMetadata} from '../core';
import {HostElement} from '../render3/r3_ast';
import {TypeCheckId} from './api';

/**
 * Checks every non-Angular element/property processed in a template and potentially produces
 * diagnostics related to improper usage.
 *
 * A `DomSchemaChecker`'s job is to check DOM nodes and their attributes written used in templates
 * and produce diagnostics if the nodes don't conform to the DOM specification. It acts as a
 * collector for these diagnostics, and can be queried later to retrieve the list of any that have
 * been generated.
 */
export interface DomSchemaChecker<T> {
  /**
   * Get the diagnostics that have been generated via `checkElement` and `checkProperty` calls
   * thus far.
   */
  readonly diagnostics: ReadonlyArray<T>;

  /**
   * Check a non-Angular element and record any diagnostics about it.
   *
   * @param id Template ID, suitable for resolution with a `TcbSourceResolver`.
   * @param tagName Tag name of the element in question
   * @param sourceSpanForDiagnostics Span that should be used when reporting diagnostics.
   * @param schemas any active schemas for the template, which might affect the validity of the
   * element.
   * @param hostIsStandalone Indicates whether the element's host is a standalone component.
   */
  checkElement(
    id: TypeCheckId,
    tagName: string,
    sourceSpanForDiagnostics: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hostIsStandalone: boolean,
  ): void;

  /**
   * Check a property binding on an element and record any diagnostics about it.
   *
   * @param id the type check ID, suitable for resolution with a `TcbSourceResolver`.
   * @param tagName tag name of the element.
   * @param name the name of the property being checked.
   * @param span the source span of the binding. This is redundant with `element.attributes` but is
   * passed separately to avoid having to look up the particular property name.
   * @param schemas any active schemas for the template, which might affect the validity of the
   * property.
   */
  checkTemplateElementProperty(
    id: string,
    tagName: string,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hostIsStandalone: boolean,
  ): void;

  /**
   * Check a property binding on a host element and record any diagnostics about it.
   * @param id the type check ID, suitable for resolution with a `TcbSourceResolver`.
   * @param element the element node in question.
   * @param name the name of the property being checked.
   * @param span the source span of the binding.
   * @param schemas any active schemas for the template, which might affect the validity of the
   * property.
   */
  checkHostElementProperty(
    id: string,
    element: HostElement,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
  ): void;
}
