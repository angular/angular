/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Statement} from '@angular/compiler';
import MagicString from 'magic-string';
import * as ts from 'typescript';

import {Reexport} from '../../../src/ngtsc/imports';
import {Import, ImportManager} from '../../../src/ngtsc/translator';
import {ModuleWithProvidersInfo} from '../analysis/module_with_providers_analyzer';
import {ExportInfo} from '../analysis/private_declarations_analyzer';
import {CompiledClass} from '../analysis/types';
import {SwitchableVariableDeclaration} from '../host/ngcc_host';

/**
 * The collected decorators that have become redundant after the compilation
 * of Ivy static fields. The map is keyed by the container node, such that we
 * can tell if we should remove the entire decorator property
 */
export type RedundantDecoratorMap = Map<ts.Node, ts.Node[]>;
export const RedundantDecoratorMap = Map;

/**
 * Implement this interface with methods that know how to render a specific format,
 * such as ESM5 or UMD.
 */
export interface RenderingFormatter {
  addConstants(output: MagicString, constants: string, file: ts.SourceFile): void;
  addImports(output: MagicString, imports: Import[], sf: ts.SourceFile): void;
  addExports(
      output: MagicString, entryPointBasePath: string, exports: ExportInfo[],
      importManager: ImportManager, file: ts.SourceFile): void;
  addDirectExports(
      output: MagicString, exports: Reexport[], importManager: ImportManager,
      file: ts.SourceFile): void;
  addDefinitions(output: MagicString, compiledClass: CompiledClass, definitions: string): void;
  addAdjacentStatements(output: MagicString, compiledClass: CompiledClass, statements: string):
      void;
  removeDecorators(output: MagicString, decoratorsToRemove: RedundantDecoratorMap): void;
  rewriteSwitchableDeclarations(
      outputText: MagicString, sourceFile: ts.SourceFile,
      declarations: SwitchableVariableDeclaration[]): void;
  addModuleWithProvidersParams(
      outputText: MagicString, moduleWithProviders: ModuleWithProvidersInfo[],
      importManager: ImportManager): void;
  printStatement(stmt: Statement, sourceFile: ts.SourceFile, importManager: ImportManager): string;
}
