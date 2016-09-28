/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementSchemaRegistry} from '@angular/compiler';
import {SchemaMetadata, SecurityContext} from '@angular/core';

export class MockSchemaRegistry implements ElementSchemaRegistry {
  constructor(
      public existingProperties: {[key: string]: boolean},
      public attrPropMapping: {[key: string]: string},
      public existingElements: {[key: string]: boolean}, public invalidProperties: Array<string>,
      public invalidAttributes: Array<string>) {}

  hasProperty(tagName: string, property: string, schemas: SchemaMetadata[]): boolean {
    const value = this.existingProperties[property];
    return value === void 0 ? true : value;
  }

  hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean {
    const value = this.existingElements[tagName.toLowerCase()];
    return value === void 0 ? true : value;
  }

  securityContext(tagName: string, property: string): SecurityContext {
    return SecurityContext.NONE;
  }

  getMappedPropName(attrName: string): string { return this.attrPropMapping[attrName] || attrName; }

  getDefaultComponentElementName(): string { return 'ng-component'; }

  validateProperty(name: string): {error: boolean, msg?: string} {
    if (this.invalidProperties.indexOf(name) > -1) {
      return {error: true, msg: `Binding to property '${name}' is disallowed for security reasons`};
    } else {
      return {error: false};
    }
  }

  validateAttribute(name: string): {error: boolean, msg?: string} {
    if (this.invalidAttributes.indexOf(name) > -1) {
      return {
        error: true,
        msg: `Binding to attribute '${name}' is disallowed for security reasons`
      };
    } else {
      return {error: false};
    }
  }
}
