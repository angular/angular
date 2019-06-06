/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, absoluteFromSourceFile} from '../../../src/ngtsc/file_system';
import {Declaration} from '../../../src/ngtsc/reflection';
import {NgccReflectionHost} from '../host/ngcc_host';
import {hasNameIdentifier, isDefined} from '../utils';
import {NgccReferencesRegistry} from './ngcc_references_registry';

export interface ExportInfo {
  identifier: string;
  from: AbsoluteFsPath;
  dtsFrom?: AbsoluteFsPath|null;
  alias?: string|null;
}
export type PrivateDeclarationsAnalyses = ExportInfo[];

/**
 * This class will analyze a program to find all the declared classes
 * (i.e. on an NgModule) that are not publicly exported via an entry-point.
 */
export class PrivateDeclarationsAnalyzer {
  constructor(
      private host: NgccReflectionHost, private referencesRegistry: NgccReferencesRegistry) {}

  analyzeProgram(program: ts.Program): PrivateDeclarationsAnalyses {
    const rootFiles = this.getRootFiles(program);
    return this.getPrivateDeclarations(rootFiles, this.referencesRegistry.getDeclarationMap());
  }

  private getRootFiles(program: ts.Program): ts.SourceFile[] {
    return program.getRootFileNames().map(f => program.getSourceFile(f)).filter(isDefined);
  }

  private getPrivateDeclarations(
      rootFiles: ts.SourceFile[],
      declarations: Map<ts.Identifier, Declaration>): PrivateDeclarationsAnalyses {
    const privateDeclarations: Map<ts.Identifier, Declaration> = new Map(declarations);
    const exportAliasDeclarations: Map<ts.Identifier, string> = new Map();

    rootFiles.forEach(f => {
      const exports = this.host.getExportsOfModule(f);
      if (exports) {
        exports.forEach((declaration, exportedName) => {
          if (hasNameIdentifier(declaration.node)) {
            if (privateDeclarations.has(declaration.node.name)) {
              const privateDeclaration = privateDeclarations.get(declaration.node.name) !;
              if (privateDeclaration.node !== declaration.node) {
                throw new Error(`${declaration.node.name.text} is declared multiple times.`);
              }

              if (declaration.node.name.text === exportedName) {
                // This declaration is public so we can remove it from the list
                privateDeclarations.delete(declaration.node.name);
              } else if (!this.host.getDtsDeclaration(declaration.node)) {
                // The referenced declaration is exported publicly but via an alias.
                // In some cases the original declaration is missing from the dts program, such as
                // when rolling up (flattening) the dts files.
                // This is because the original declaration gets renamed to the exported alias.

                // There is a constraint on this which we cannot handle. Consider the following
                // code:
                //
                // /src/entry_point.js:
                //     export {MyComponent as aliasedMyComponent} from './a';
                //     export {MyComponent} from './b';`
                //
                // /src/a.js:
                //     export class MyComponent {}
                //
                // /src/b.js:
                //     export class MyComponent {}
                //
                // //typings/entry_point.d.ts:
                //     export declare class aliasedMyComponent {}
                //     export declare class MyComponent {}
                //
                // In this case we would end up matching the `MyComponent` from `/src/a.js` to the
                // `MyComponent` declared in `/typings/entry_point.d.ts` even though that
                // declaration is actually for the `MyComponent` in `/src/b.js`.

                exportAliasDeclarations.set(declaration.node.name, exportedName);
              }
            }
          }
        });
      }
    });

    return Array.from(privateDeclarations.keys()).map(id => {
      const from = absoluteFromSourceFile(id.getSourceFile());
      const declaration = privateDeclarations.get(id) !;
      const alias = exportAliasDeclarations.has(id) ? exportAliasDeclarations.get(id) ! : null;
      const dtsDeclaration = this.host.getDtsDeclaration(declaration.node);
      const dtsFrom = dtsDeclaration && absoluteFromSourceFile(dtsDeclaration.getSourceFile());

      return {identifier: id.text, from, dtsFrom, alias};
    });
  }
}
