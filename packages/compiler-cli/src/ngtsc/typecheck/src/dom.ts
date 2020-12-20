/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomElementSchemaRegistry, ParseSourceSpan, SchemaMetadata, TmplAstElement} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {TemplateId} from '../api';
import {makeTemplateDiagnostic, TemplateDiagnostic} from '../diagnostics';

import {TemplateSourceResolver} from './tcb_util';

const REGISTRY = new DomElementSchemaRegistry();
const REMOVE_XHTML_REGEX = /^:xhtml:/;

/**
 * Checks every non-Angular element/property processed in a template and potentially produces
 * `ts.Diagnostic`s related to improper usage.
 *
 * A `DomSchemaChecker`'s job is to check DOM nodes and their attributes written used in templates
 * and produce `ts.Diagnostic`s if the nodes don't conform to the DOM specification. It acts as a
 * collector for these diagnostics, and can be queried later to retrieve the list of any that have
 * been generated.
 */
export interface DomSchemaChecker {
  /**
   * Get the `ts.Diagnostic`s that have been generated via `checkElement` and `checkProperty` calls
   * thus far.
   */
  readonly diagnostics: ReadonlyArray<TemplateDiagnostic>;

  /**
   * Check a non-Angular element and record any diagnostics about it.
   *
   * @param id the template ID, suitable for resolution with a `TcbSourceResolver`.
   * @param element the element node in question.
   * @param schemas any active schemas for the template, which might affect the validity of the
   * element.
   */
  checkElement(id: string, element: TmplAstElement, schemas: SchemaMetadata[]): void;

  /**
   * Check a property binding on an element and record any diagnostics about it.
   *
   * @param id the template ID, suitable for resolution with a `TcbSourceResolver`.
   * @param element the element node in question.
   * @param name the name of the property being checked.
   * @param span the source span of the binding. This is redundant with `element.attributes` but is
   * passed separately to avoid having to look up the particular property name.
   * @param schemas any active schemas for the template, which might affect the validity of the
   * property.
   */
  checkProperty(
      id: string, element: TmplAstElement, name: string, span: ParseSourceSpan,
      schemas: SchemaMetadata[]): void;
}

/**
 * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
 * maintained by the Angular team via extraction from a browser IDL.
 */
export class RegistryDomSchemaChecker implements DomSchemaChecker {
  private _diagnostics: TemplateDiagnostic[] = [];

  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return this._diagnostics;
  }

  constructor(private resolver: TemplateSourceResolver) {}

  checkElement(id: TemplateId, element: TmplAstElement, schemas: SchemaMetadata[]): void {
    // HTML elements inside an SVG `foreignObject` are declared in the `xhtml` namespace.
    // We need to strip it before handing it over to the registry because all HTML tag names
    // in the registry are without a namespace.
    const name = element.name.replace(REMOVE_XHTML_REGEX, '');

    if (!REGISTRY.hasElement(name, schemas)) {
      const mapping = this.resolver.getSourceMapping(id);

      let errorMsg = `'${name}' is not a known element:\n`;
      errorMsg +=
          `1. If '${name}' is an Angular component, then verify that it is part of this module.\n`;
      if (name.indexOf('-') > -1) {
        errorMsg += `2. If '${
            name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.`;
      } else {
        errorMsg +=
            `2. To allow any element add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      }

      const diag = makeTemplateDiagnostic(
          id, mapping, element.startSourceSpan, ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.SCHEMA_INVALID_ELEMENT), errorMsg);
      this._diagnostics.push(diag);
    }
  }

  checkProperty(
      id: TemplateId, element: TmplAstElement, name: string, span: ParseSourceSpan,
      schemas: SchemaMetadata[]): void {
    if (!REGISTRY.hasProperty(element.name, name, schemas)) {
      const mapping = this.resolver.getSourceMapping(id);

      let errorMsg =
          `Can't bind to '${name}' since it isn't a known property of '${element.name}'.`;
      if (element.name.startsWith('ng-')) {
        errorMsg +=
            `\n1. If '${
                name}' is an Angular directive, then add 'CommonModule' to the '@NgModule.imports' of this component.` +
            `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      } else if (element.name.indexOf('-') > -1) {
        errorMsg +=
            `\n1. If '${element.name}' is an Angular component and it has '${
                name}' input, then verify that it is part of this module.` +
            `\n2. If '${
                element
                    .name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@NgModule.schemas' of this component to suppress this message.` +
            `\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@NgModule.schemas' of this component.`;
      }

      const diag = makeTemplateDiagnostic(
          id, mapping, span, ts.DiagnosticCategory.Error,
          ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE), errorMsg);
      this._diagnostics.push(diag);
    }
  }
}
