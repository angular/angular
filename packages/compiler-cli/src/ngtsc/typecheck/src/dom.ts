/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CUSTOM_ELEMENTS_SCHEMA,
  DomElementSchemaRegistry,
  DomSchemaChecker,
  NO_ERRORS_SCHEMA,
  ParseSourceSpan,
  SchemaMetadata,
  TmplAstHostElement,
  TypeCheckId,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {TemplateDiagnostic} from '../api';
import {makeTemplateDiagnostic} from '../diagnostics';

import {TypeCheckSourceResolver} from './tcb_util';

export const REGISTRY = new DomElementSchemaRegistry();
const REMOVE_XHTML_REGEX = /^:xhtml:/;

/**
 * Shape of event names that are candidates for the unclaimed event name check: a single
 * identifier. Names with `.`, `-` or other separators (key pseudo-events like `keydown.enter`,
 * custom events like `my-event`) never match.
 */
const UNCLAIMED_EVENT_CANDIDATE_REGEX = /^[a-zA-Z][a-zA-Z0-9$_]*$/;

/**
 * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
 * maintained by the Angular team via extraction from a browser IDL.
 */
export class RegistryDomSchemaChecker implements DomSchemaChecker<TemplateDiagnostic> {
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
    const report = REGISTRY.validateProperty(name);
    if (report.error) {
      const mapping = this.resolver.getTemplateSourceMapping(id);
      const diag = makeTemplateDiagnostic(
        id,
        mapping,
        span,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE),
        report.msg!,
      );
      this._diagnostics.push(diag);
      return;
    }

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

  checkTemplateElementEvent(
    id: TypeCheckId,
    tagName: string,
    eventName: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
  ): void {
    // Native DOM events are all-lowercase and custom events conventionally use dash-separated
    // names, so only names that look like misspelled directive outputs (single camelCase
    // identifiers) are candidates for this check.
    if (!UNCLAIMED_EVENT_CANDIDATE_REGEX.test(eventName) || !/[A-Z]/.test(eventName)) {
      return;
    }

    // Events bubble, so a native event of any element may legitimately be observed on this
    // element, regardless of its tag.
    if (REGISTRY.isKnownEventOfAnyElement(eventName)) {
      return;
    }

    if (
      schemas.some(
        (schema) =>
          schema.name === NO_ERRORS_SCHEMA.name ||
          (schema.name === CUSTOM_ELEMENTS_SCHEMA.name && tagName.indexOf('-') > -1),
      )
    ) {
      return;
    }

    const errorMsg =
      `Event '${eventName}' is not emitted by any directive applied to '${tagName}' and it isn't a known native DOM event.` +
      `\n1. If '${eventName}' is an output of a directive, make sure the directive is applied to the element and check the output's name for typos.` +
      `\n2. If you're listening to a custom event dispatched by a descendant element, dash-separated event names (e.g. 'my-event') are exempt from this check.` +
      `\n3. To disable this check entirely, remove 'strictUnclaimedEventNames' from the compiler options.`;

    const mapping = this.resolver.getTemplateSourceMapping(id);
    const diag = makeTemplateDiagnostic(
      id,
      mapping,
      span,
      ts.DiagnosticCategory.Error,
      ngErrorCode(ErrorCode.UNCLAIMED_EVENT_BINDING),
      errorMsg,
    );
    this._diagnostics.push(diag);
  }

  checkHostElementProperty(
    id: TypeCheckId,
    element: TmplAstHostElement,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
  ): void {
    const report = REGISTRY.validateProperty(name);
    if (report.error) {
      const mapping = this.resolver.getHostBindingsMapping(id);
      const diag = makeTemplateDiagnostic(
        id,
        mapping,
        span,
        ts.DiagnosticCategory.Error,
        ngErrorCode(ErrorCode.SCHEMA_INVALID_ATTRIBUTE),
        report.msg!,
      );
      this._diagnostics.push(diag);
      return;
    }

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
