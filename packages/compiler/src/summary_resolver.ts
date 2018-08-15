/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {CompileTypeSummary} from './compile_metadata';
import {Type} from './core';

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
  abstract getSymbolsOf(filePath: string): T[]|null;
  abstract getImportAs(reference: T): T;
  abstract getKnownModuleName(fileName: string): string|null;
  abstract addSummary(summary: Summary<T>): void;
}

export class JitSummaryResolver implements SummaryResolver<Type> {
  private _summaries = new Map<Type, Summary<Type>>();

  isLibraryFile(): boolean {
    return false;
  }
  toSummaryFileName(fileName: string): string {
    return fileName;
  }
  fromSummaryFileName(fileName: string): string {
    return fileName;
  }
  resolveSummary(reference: Type): Summary<Type>|null {
    return this._summaries.get(reference) || null;
  }
  getSymbolsOf(): Type[] {
    return [];
  }
  getImportAs(reference: Type): Type {
    return reference;
  }
  getKnownModuleName(fileName: string) {
    return null;
  }
  addSummary(summary: Summary<Type>) {
    this._summaries.set(summary.symbol, summary);
  }
}
