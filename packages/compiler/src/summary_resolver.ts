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
  abstract getLibraryFileName(fileName: string): string|null;
  abstract resolveSummary(reference: T): Summary<T>|null;
  abstract getSymbolsOf(filePath: string): T[];
  abstract getImportAs(reference: T): T;
  abstract addSummary(summary: Summary<T>): void;
}

@CompilerInjectable()
export class JitSummaryResolver implements SummaryResolver<Type<any>> {
  private _summaries = new Map<Type<any>, Summary<Type<any>>>();

  isLibraryFile(fileName: string): boolean { return false; };
  getLibraryFileName(fileName: string): string|null { return null; }
  resolveSummary(reference: Type<any>): Summary<Type<any>>|null {
    return this._summaries.get(reference) || null;
  };
  getSymbolsOf(filePath: string): Type<any>[] { return []; }
  getImportAs(reference: Type<any>): Type<any> { return reference; }
  addSummary(summary: Summary<Type<any>>) { this._summaries.set(summary.symbol, summary); };
}
