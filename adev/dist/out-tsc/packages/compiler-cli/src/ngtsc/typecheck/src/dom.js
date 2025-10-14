/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {DomElementSchemaRegistry} from '@angular/compiler';
import ts from 'typescript';
import {ErrorCode, ngErrorCode} from '../../diagnostics';
import {makeTemplateDiagnostic} from '../diagnostics';
export const REGISTRY = new DomElementSchemaRegistry();
const REMOVE_XHTML_REGEX = /^:xhtml:/;
/**
 * Checks non-Angular elements and properties against the `DomElementSchemaRegistry`, a schema
 * maintained by the Angular team via extraction from a browser IDL.
 */
export class RegistryDomSchemaChecker {
  resolver;
  _diagnostics = [];
  get diagnostics() {
    return this._diagnostics;
  }
  constructor(resolver) {
    this.resolver = resolver;
  }
  checkElement(id, tagName, sourceSpanForDiagnostics, schemas, hostIsStandalone) {
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
  checkTemplateElementProperty(id, tagName, name, span, schemas, hostIsStandalone) {
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
          `\n1. If '${tagName}' is an Angular component and it has '${name}' input, then verify that it is ${
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
  checkHostElementProperty(id, element, name, span, schemas) {
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
//# sourceMappingURL=dom.js.map
