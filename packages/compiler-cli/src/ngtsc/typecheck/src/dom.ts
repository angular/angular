/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DomElementSchemaRegistry,
  ParseSourceSpan,
  SchemaMetadata,
  TmplAstHostElement,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {TemplateDiagnostic, TypeCheckId} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {TypeCheckSourceResolver} from './tcb_util';

export const REGISTRY = new DomElementSchemaRegistry();
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
   * @param id Template ID, suitable for resolution with a `TcbSourceResolver`.
   * @param tagName Tag name of the element in question
   * @param sourceSpanForDiagnostics Span that should be used when reporting diagnostics.
   * @param schemas Any active schemas for the template, which might affect the validity of the
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
    element: TmplAstHostElement,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
  ): void;
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

  constructor(private resolver: TypeCheckSourceResolver) {}

  checkElement(
    id: TypeCheckId,
    tagName: string,
    sourceSpanForDiagnostics: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hostIsStandalone: boolean,
  ): void {
    // HTML elements inside an SVG `foreignObject` are declared in the `xhtml` namespace.
    // We need to strip it before handing it over to the registry because all HTML tag names
    // in the registry are without a namespace.
    const name = tagName.replace(REMOVE_XHTML_REGEX, '');

    if (!REGISTRY.hasElement(name, schemas)) {
      const mapping = this.resolver.getTemplateSourceMapping(id);

      const schemas = `'${hostIsStandalone ? '@Component' : '@NgModule'}.schemas'`;
      let errorMsg = `'${name}' is not a known element:\n`;
      errorMsg += `1. If '${name}' is an Angular component, then verify that it is ${
        hostIsStandalone
          ? "included in the '@Component.imports' of this component"
          : 'part of this module'
      }.\n`;
      if (name.indexOf('-') > -1) {
        errorMsg += `2. If '${name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.`;
      } else {
        errorMsg += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
      }

      const diag = makeTemplateDiagnostic(
        id,
        mapping,
        sourceSpanForDiagnostics,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SCHEMA_INVALID_ELEMENT),
        errorMsg,
      );
      this._diagnostics.push(diag);
    }
  }

  checkTemplateElementProperty(
    id: TypeCheckId,
    tagName: string,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hostIsStandalone: boolean,
  ): void {
    if (!REGISTRY.hasProperty(tagName, name, schemas)) {
      const mapping = this.resolver.getTemplateSourceMapping(id);

      const decorator = hostIsStandalone ? '@Component' : '@NgModule';
      const schemas = `'${decorator}.schemas'`;
      let errorMsg = `Can't bind to '${name}' since it isn't a known property of '${tagName}'.`;
      if (tagName.startsWith('ng-')) {
        errorMsg +=
          `\n1. If '${name}' is an Angular directive, then add 'CommonModule' to the '${decorator}.imports' of this component.` +
          `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
      } else if (tagName.indexOf('-') > -1) {
        errorMsg +=
          `\n1. If '${
            tagName
          }' is an Angular component and it has '${name}' input, then verify that it is ${
            hostIsStandalone
              ? "included in the '@Component.imports' of this component"
              : 'part of this module'
          }.` +
          `\n2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component to suppress this message.` +
          `\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
      }

      const diag = makeTemplateDiagnostic(
        id,
        mapping,
        span,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE),
        errorMsg,
      );
      this._diagnostics.push(diag);
    }
  }

  checkHostElementProperty(
    id: TypeCheckId,
    element: TmplAstHostElement,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
  ): void {
    for (const tagName of element.tagNames) {
      if (REGISTRY.hasProperty(tagName, name, schemas)) {
        continue;
      }

      const errorMessage = `Can't bind to '${name}' since it isn't a known property of '${tagName}'.`;
      const mapping = this.resolver.getHostBindingsMapping(id);
      const diag = makeTemplateDiagnostic(
        id,
        mapping,
        span,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE),
        errorMessage,
      );
      this._diagnostics.push(diag);
      break;
    }
  }
}
