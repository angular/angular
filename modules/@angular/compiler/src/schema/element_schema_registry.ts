/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchemaMetadata} from '@angular/core';

export abstract class ElementSchemaRegistry {
  abstract hasProperty(tagName: string, propName: string, schemaMetas: SchemaMetadata[]): boolean;
  abstract hasElement(tagName: string, schemaMetas: SchemaMetadata[]): boolean;
  abstract securityContext(tagName: string, propName: string): any;
  abstract getMappedPropName(propName: string): string;
  abstract getDefaultComponentElementName(): string;
  abstract validateProperty(name: string): {error: boolean, msg?: string};
  abstract validateAttribute(name: string): {error: boolean, msg?: string};
}
