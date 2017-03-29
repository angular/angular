/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Provides read-only access to reflection data about symbols. Used internally by Angular
 * to power dependency injection and compilation.
 */
export abstract class ReflectorReader {
  abstract parameters(typeOrFunc: /*Type*/ any): any[][];
  abstract annotations(typeOrFunc: /*Type*/ any): any[];
  abstract propMetadata(typeOrFunc: /*Type*/ any): {[key: string]: any[]};
  abstract importUri(typeOrFunc: /*Type*/ any): string|null;
  abstract resourceUri(typeOrFunc: /*Type*/ any): string;
  abstract resolveIdentifier(name: string, moduleUrl: string, members: string[], runtime: any): any;
  abstract resolveEnum(identifier: any, name: string): any;
}
