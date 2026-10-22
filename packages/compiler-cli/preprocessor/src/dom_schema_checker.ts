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
  DomSchemaChecker,
  OutOfBandDiagnosticCategory,
  TypeCheckId,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/compiler';

import {Diagnostic} from './diagnostic.js';

const REGISTRY = new DomElementSchemaRegistry();
const REMOVE_XHTML_REGEX = /^:xhtml:/;
const UNCLAIMED_EVENT_CANDIDATE_REGEX = /^[a-zA-Z][a-zA-Z0-9$_]*$/;

/**
 * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
 * maintained by the Angular team via extraction from a browser IDL.
 */
export class RegistryDomSchemaChecker implements DomSchemaChecker<Diagnostic> {
  private _diagnostics: Diagnostic[] = [];

  get diagnostics(): ReadonlyArray<Diagnostic> {
    return this._diagnostics;
  }

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
      const schemasStr = `'${hostIsStandalone ? '@Component' : '@NgModule'}.schemas'`;
      let errorMsg = `'${name}' is not a known element:\n`;
      errorMsg += `1. If '${name}' is an Angular component, then verify that it is ${
        hostIsStandalone
          ? "included in the '@Component.imports' of this component"
          : 'part of this module'
      }.\n`;
      if (name.indexOf('-') > -1) {
        errorMsg += `2. If '${name}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemasStr} of this component to suppress this message.`;
      } else {
        errorMsg += `2. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemasStr} of this component.`;
      }

      this._diagnostics.push({
        typeCheckId: id,
        category: OutOfBandDiagnosticCategory.Error,
        code: 8001,
        message: errorMsg,
        start: sourceSpanForDiagnostics.start.offset,
        end: sourceSpanForDiagnostics.end.offset,
      });
    }
  }

  checkTemplateElementProperty(
    id: string,
    tagName: string,
    name: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hostIsStandalone: boolean,
  ): void {
    if (!REGISTRY.hasProperty(tagName, name, schemas)) {
      const decorator = hostIsStandalone ? '@Component' : '@NgModule';
      const schemasStr = `'${decorator}.schemas'`;
      let errorMsg = `Can't bind to '${name}' since it isn't a known property of '${tagName}'.`;
      if (tagName.startsWith('ng-')) {
        errorMsg +=
          `\n1. If '${name}' is an Angular directive, then add 'CommonModule' to the '${decorator}.imports' of this component.` +
          `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemasStr} of this component.`;
      } else if (tagName.indexOf('-') > -1) {
        errorMsg +=
          `\n1. If '${
            tagName
          }' is an Angular component and it has '${name}' input, then verify that it is ${
            hostIsStandalone
              ? "included in the '@Component.imports' of this component"
              : 'part of this module'
          }.` +
          `\n2. If '${tagName}' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemasStr} of this component to suppress this message.` +
          `\n3. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemasStr} of this component.`;
      }

      this._diagnostics.push({
        typeCheckId: id as TypeCheckId,
        category: OutOfBandDiagnosticCategory.Error,
        code: 8002,
        message: errorMsg,
        start: span.start.offset,
        end: span.end.offset,
      });
    }
  }

  checkHostElementProperty(
    id: string,
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
      this._diagnostics.push({
        typeCheckId: id as TypeCheckId,
        category: OutOfBandDiagnosticCategory.Error,
        code: 8002,
        message: errorMessage,
        start: span.start.offset,
        end: span.end.offset,
      });
      break;
    }
  }

  checkTemplateElementEvent(
    id: TypeCheckId,
    tagName: string,
    eventName: string,
    span: ParseSourceSpan,
    schemas: SchemaMetadata[],
    hasComponent: boolean,
  ): void {
    // Native DOM events are almost all lowercase and custom events conventionally use
    // dash-separated names, so only names that look like misspelled directive outputs (single
    // camelCase identifiers) are candidates for this check.
    if (!UNCLAIMED_EVENT_CANDIDATE_REGEX.test(eventName) || !/[A-Z]/.test(eventName)) {
      return;
    }

    // Events bubble, so a native event of any element may legitimately be observed on this
    // element, regardless of its tag. Some native events do have camelCase names (e.g. the
    // vendor-prefixed `webkitAnimationEnd`, which the schema stores in lowercase), so they have
    // to be exempted explicitly.
    if (REGISTRY.isKnownEventOfAnyElement(eventName)) {
      return;
    }

    // `CUSTOM_ELEMENTS_SCHEMA` signals that custom elements are in use, whose custom events may
    // bubble up to any element in the template. It doesn't exempt elements with a matched
    // component though: those are Angular components rather than custom elements, no matter
    // their tag name.
    if (
      schemas.some(
        (schema) =>
          schema.name === NO_ERRORS_SCHEMA.name ||
          (schema.name === CUSTOM_ELEMENTS_SCHEMA.name && !hasComponent),
      )
    ) {
      return;
    }

    const errorMsg =
      `Event '${eventName}' is not emitted by any directive applied to '${tagName}' and it isn't a known native DOM event.` +
      `\n1. If '${eventName}' is an output of a directive, make sure the directive is applied to the element and check the output's name for typos.` +
      `\n2. If you're listening to a custom event dispatched by a descendant element, dash-separated event names (e.g. 'my-event') are exempt from this check.` +
      `\n3. To disable this check entirely, set 'strictUnclaimedEventNames' to false or remove it from the compiler options.`;

    this._diagnostics.push({
      typeCheckId: id as TypeCheckId,
      category: OutOfBandDiagnosticCategory.Error,
      code: 8030,
      message: errorMsg,
      start: span.start.offset,
      end: span.end.offset,
    });
  }
}
