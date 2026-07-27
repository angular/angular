/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  DomElementSchemaRegistry,
  DomSchemaChecker,
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
 * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
 * maintained by the Angular team via extraction from a browser IDL.
 */
export class RegistryDomSchemaChecker implements DomSchemaChecker<TemplateDiagnostic> {
  private _diagnostics: TemplateDiagnostic[] = [];

  get diagnostics(): ReadonlyArray<TemplateDiagnostic> {
    return this._diagnostics;
  }

  constructor(
    private resolver: TypeCheckSourceResolver,
    private registry: DomElementSchemaRegistry = REGISTRY,
  ) {}

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

    if (!this.registry.hasElement(name, schemas)) {
      const mapping = this.resolver.getTemplateSourceMapping(id);

      const schemas = `'${hostIsStandalone ? '@Component' : '@NgModule'}.schemas'`;
      let errorMsg = `'${name}' is not a known element:\n`;
      errorMsg += `1. If '${name}' is an Angular component, then verify that it is ${
        hostIsStandalone
          ? "included in the '@Component.imports' of this component"
          : 'part of this module'
      }.\n`;
      if (name.indexOf('-') > -1) {
        errorMsg += this.registry.hasCustomElementsManifestSchemas()
          ? `2. If '${name}' is a Web Component, verify that it is declared by one of the Custom Elements Manifests configured in 'angularCompilerOptions.customElementsManifests'.`
          : `2. If '${name}' is a Web Component, configure its Custom Elements Manifest in 'angularCompilerOptions.customElementsManifests'.`;
        errorMsg +=
          `\n3. If no Custom Elements Manifest is available for '${name}', add 'CUSTOM_ELEMENTS_SCHEMA' to the ${schemas} of this component.` +
          `\n4. To allow any element add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
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
    const report = this.registry.validateProperty(name);
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

    if (!this.registry.hasProperty(tagName, name, schemas)) {
      const mapping = this.resolver.getTemplateSourceMapping(id);

      const decorator = hostIsStandalone ? '@Component' : '@NgModule';
      const schemas = `'${decorator}.schemas'`;
      let errorMsg = `Can't bind to '${name}' since it isn't a known property of '${tagName}'.`;
      if (tagName.startsWith('ng-')) {
        errorMsg +=
          `\n1. If '${name}' is an Angular directive, then add 'CommonModule' to the '${decorator}.imports' of this component.` +
          `\n2. To allow any property add 'NO_ERRORS_SCHEMA' to the ${schemas} of this component.`;
      } else if (this.registry.isCustomElementFromManifest(tagName)) {
        errorMsg +=
          `\nThe configured Custom Elements Manifest for '${tagName}' does not declare a bindable property named '${name}'. ` +
          `Verify the binding name or regenerate the manifest from the web component library.`;
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
    const report = this.registry.validateProperty(name);
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
      if (this.registry.hasProperty(tagName, name, schemas)) {
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
