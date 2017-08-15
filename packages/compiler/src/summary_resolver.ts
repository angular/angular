/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Type} from '@angular/core';
import {CompileTypeSummary} from './compile_metadata';
import {CompilerInjectable} from './injectable';

export interface Summary<T> {
  symbol: T;
  metadata: any;
  type?: CompileTypeSummary;
}

export abstract class SummaryResolver<T> {
  abstract isLibraryFile(fileName: string): boolean;
  abstract toSummaryFileName(fileName: string, referringSrcFileName: string): string;
  abstract fromSummaryFileName(fileName: string, referringLibFileName: string): string;
  abstract resolveSummary(reference: T): Summary<T>|null;
  abstract getSymbolsOf(filePath: string): T[];
  abstract getImportAs(reference: T): T;
  abstract addSummary(summary: Summary<T>): void;
}

@CompilerInjectable()
export class JitSummaryResolver implements SummaryResolver<Type<any>> {
  private _summaries = new Map<Type<any>, Summary<Type<any>>>();

  isLibraryFile(): boolean { return false; };
  toSummaryFileName(fileName: string): string { return fileName; }
  fromSummaryFileName(fileName: string): string { return fileName; }
  resolveSummary(reference: Type<any>): Summary<Type<any>>|null {
    return this._summaries.get(reference) || null;
  };
  getSymbolsOf(): Type<any>[] { return []; }
  getImportAs(reference: Type<any>): Type<any> { return reference; }
  addSummary(summary: Summary<Type<any>>) { this._summaries.set(summary.symbol, summary); };
}
