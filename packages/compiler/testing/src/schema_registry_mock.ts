/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {core, ElementSchemaRegistry} from '@angular/compiler';

export class MockSchemaRegistry implements ElementSchemaRegistry {
  constructor(
      public existingProperties: {[key: string]: boolean},
      public attrPropMapping: {[key: string]: string},
      public existingElements: {[key: string]: boolean}, public invalidProperties: Array<string>,
      public invalidAttributes: Array<string>) {}

  hasProperty(tagName: string, property: string, schemas: core.SchemaMetadata[]): boolean {
    const value = this.existingProperties[property];
    return value === void 0 ? true : value;
  }

  hasElement(tagName: string, schemaMetas: core.SchemaMetadata[]): boolean {
    const value = this.existingElements[tagName.toLowerCase()];
    return value === void 0 ? true : value;
  }

  allKnownElementNames(): string[] {
    return Object.keys(this.existingElements);
  }

  securityContext(selector: string, property: string, isAttribute: boolean): core.SecurityContext {
    return core.SecurityContext.NONE;
  }

  getMappedPropName(attrName: string): string {
    return this.attrPropMapping[attrName] || attrName;
  }

  getDefaultComponentElementName(): string {
    return 'ng-component';
  }

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

  normalizeAnimationStyleProperty(propName: string): string {
    return propName;
  }
  normalizeAnimationStyleValue(camelCaseProp: string, userProvidedProp: string, val: string|number):
      {error: string, value: string} {
    return {error: null!, value: val.toString()};
  }
}
