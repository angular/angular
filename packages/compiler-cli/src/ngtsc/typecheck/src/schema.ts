/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DomElementSchemaRegistry, ParseSourceSpan, SchemaMetadata, TmplAstElement} from '@angular/compiler';

import {ErrorCode} from '../../diagnostics';

import {SchemaDiagnostic} from './api';

const REGISTRY = new DomElementSchemaRegistry();

/**
 * A schema checker which uses the `DomElementSchemaRegistry` (a legacy class from the VE compiler)
 * to check templates.
 */
export class LegacyTemplateSchemaChecker {
  readonly errors: SchemaDiagnostic[] = [];

  checkElement(element: TmplAstElement, schemas: SchemaMetadata[]): void {
    if (!REGISTRY.hasElement(element.name, schemas)) {
      this.errors.push({
        messageText: `'${element.name}' is not a valid HTML Element`,
        code: ErrorCode.SCHEMA_INVALID_ELEMENT,
        span: element.sourceSpan,
      });
    }
  }

  checkProperty(
      element: TmplAstElement, name: string, span: ParseSourceSpan,
      schemas: SchemaMetadata[]): void {
    if (!REGISTRY.hasProperty(element.name, name, schemas)) {
      this.errors.push({
        messageText: `'${name}' is not a valid property of <${element.name}>`,
        code: ErrorCode.SCHEMA_INVALID_ATTRIBUTE,
        span: element.sourceSpan,
      });
    }
  }
}
