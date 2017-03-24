/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileTypeSummary} from './compile_metadata';
import {CompilerInjectable} from './injectable';

export interface Summary<T> {
  symbol: T;
  metadata: any;
  type?: CompileTypeSummary;
}

@CompilerInjectable()
export class SummaryResolver<T> {
  isLibraryFile(fileName: string): boolean { return false; };
  getLibraryFileName(fileName: string): string|null { return null; }
  resolveSummary(reference: T): Summary<T>|null { return null; };
  getSymbolsOf(filePath: string): T[] { return []; }
  getImportAs(reference: T): T { return reference; }
}
