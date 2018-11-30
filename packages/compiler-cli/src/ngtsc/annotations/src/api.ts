/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export interface ResourceLoader {
  preload?(url: string, containingFile: string): Promise<void>|undefined;
  load(url: string, containingFile: string): string;
}
