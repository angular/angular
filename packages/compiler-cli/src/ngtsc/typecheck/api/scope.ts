/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {EmittedReference, Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';
import {SymbolWithValueDeclaration} from '../../util/src/typescript';

/**
 * A PotentialImport for some Angular trait has a TypeScript module specifier, which can be
 * relative, as well as an identifier name.
 */
export interface PotentialImport {
  kind: PotentialImportKind;
  // If no moduleSpecifier is present, the given symbol name is already in scope.
  moduleSpecifier?: string;
  symbolName: string;
  isForwardReference: boolean;
}

/**
 * Which kind of Angular Trait the import targets.
 */
export enum PotentialImportKind {
  NgModule,
  Standalone,
}

export interface TsCompletionEntryInfo {
  /**
   * Sometimes, the location of the tsCompletionEntry symbol does not match the location of the Angular symbol.
   *
   * For example, the BarComponent is declared in `bar.ts` and exported from there. The `public_api.ts` also
   * reexports the BarComponent from `bar.ts`, so the `tsCompletionEntrySymbolFileName` will be `public_api.ts`.
   */
  tsCompletionEntrySymbolFileName: string;
  /**
   * Sometime the component can be exported with a different name than the class name.
   * For example, `export {BarComponent as NewBarComponent} from './bar.component';`
   *
   * Sometimes, the component is exported by the `NgModule`.
   */
  tsCompletionEntrySymbolName: string;

  /**
   * This data is from the tsLs completion entry, and
   * will be used in the `ls.getCompletionEntryDetails`.
   */
  tsCompletionEntryData?: ts.CompletionEntryData;
}

/**
 * Metadata on a directive which is available in a template.
 */
export interface PotentialDirective {
  ref: Reference<ClassDeclaration>;

  /**
   * The `ts.Symbol` for the directive class.
   */
  tsSymbol: SymbolWithValueDeclaration;

  /**
   * The module which declares the directive.
   */
  ngModule: ClassDeclaration | null;

  /**
   * The selector for the directive or component.
   */
  selector: string | null;

  /**
   * `true` if this directive is a component.
   */
  isComponent: boolean;

  /**
   * `true` if this directive is a structural directive.
   */
  isStructural: boolean;

  /**
   * Whether or not this directive is in scope.
   */
  isInScope: boolean;

  /**
   * The directive can be exported by multiple modules,
   * collecting all the entry information here.
   *
   * Filter the appropriate entry information when using it to compute the module specifier.
   */
  tsCompletionEntryInfos: TsCompletionEntryInfo[] | null;
}

/**
 * Metadata for a pipe which is available in a template.
 */
export interface PotentialPipe {
  ref: Reference<ClassDeclaration>;

  /**
   * The `ts.Symbol` for the pipe class.
   */
  tsSymbol: ts.Symbol;

  /**
   * Name of the pipe.
   */
  name: string | null;

  /**
   * Whether or not this pipe is in scope.
   */
  isInScope: boolean;

  /**
   * The pipe can be exported by multiple modules,
   * collecting all the entry information here.
   *
   * Filter the appropriate entry information when using it to compute the module specifier.
   */
  tsCompletionEntryInfos: TsCompletionEntryInfo[] | null;
}

/**
 * Possible modes in which to look up a potential import.
 */
export enum PotentialImportMode {
  /** Whether an import is standalone is inferred based on its metadata. */
  Normal,

  /**
   * An import is assumed to be standalone and is imported directly. This is useful for migrations
   * where a declaration wasn't standalone when the program was created, but will become standalone
   * as a part of the migration.
   */
  ForceDirect,
}

export interface PotentialDirectiveModuleSpecifierResolver {
  resolve(toImport: Reference<ClassDeclaration>, importOn: ts.Node | null): string | undefined;
}
