/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {Declaration} from '../../../ngtsc/reflection';
import {NgccReflectionHost} from '../host/ngcc_host';
import {hasNameIdentifier, isDefined} from '../utils';
import {NgccReferencesRegistry} from './ngcc_references_registry';

export interface ExportInfo {
  identifier: string;
  from: string;
  dtsFrom?: string|null;
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
    rootFiles.forEach(f => {
      const exports = this.host.getExportsOfModule(f);
      if (exports) {
        exports.forEach((declaration, exportedName) => {
          if (hasNameIdentifier(declaration.node) && declaration.node.name.text === exportedName) {
            privateDeclarations.delete(declaration.node.name);
          }
        });
      }
    });
    return Array.from(privateDeclarations.keys()).map(id => {
      const from = id.getSourceFile().fileName;
      const declaration = privateDeclarations.get(id) !;
      const dtsDeclaration = this.host.getDtsDeclaration(declaration.node);
      const dtsFrom = dtsDeclaration && dtsDeclaration.getSourceFile().fileName;
      return {identifier: id.text, from, dtsFrom};
    });
  }
}
