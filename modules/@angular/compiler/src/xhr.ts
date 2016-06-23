/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// TODO: vsavkin rename it into TemplateLoader
/**
 * An interface for retrieving documents by URL that the compiler uses
 * to load templates.
 */
export class XHR {
  get(url: string): Promise<string> { return null; }
}
