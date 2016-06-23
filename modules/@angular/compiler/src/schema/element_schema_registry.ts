/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export abstract class ElementSchemaRegistry {
  abstract hasProperty(tagName: string, propName: string): boolean;
  abstract securityContext(tagName: string, propName: string): any;
  abstract getMappedPropName(propName: string): string;
}
