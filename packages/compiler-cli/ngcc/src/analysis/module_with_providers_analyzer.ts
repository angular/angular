/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ReferencesRegistry} from '../../../src/ngtsc/annotations';
import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Declaration} from '../../../src/ngtsc/reflection';
import {ModuleWithProvidersFunction, NgccReflectionHost} from '../host/ngcc_host';
import {hasNameIdentifier, isDefined} from '../utils';

export interface ModuleWithProvidersInfo {
  /**
   * The declaration (in the .d.ts file) of the function that returns
   * a `ModuleWithProviders object, but has a signature that needs
   * a type parameter adding.
   */
  declaration: ts.MethodDeclaration|ts.FunctionDeclaration;
  /**
   * The NgModule class declaration (in the .d.ts file) to add as a type parameter.
   */
  ngModule: Declaration<ClassDeclaration>;
}

export type ModuleWithProvidersAnalyses = Map<ts.SourceFile, ModuleWithProvidersInfo[]>;
export const ModuleWithProvidersAnalyses = Map;

export class ModuleWithProvidersAnalyzer {
  constructor(private host: NgccReflectionHost, private referencesRegistry: ReferencesRegistry) {}

  analyzeProgram(program: ts.Program): ModuleWithProvidersAnalyses {
    const analyses = new ModuleWithProvidersAnalyses();
    const rootFiles = this.getRootFiles(program);
    rootFiles.forEach(f => {
      const fns = this.host.getModuleWithProvidersFunctions(f);
      fns && fns.forEach(fn => {
        const dtsFn = this.getDtsDeclarationForFunction(fn);
        const typeParam = dtsFn.type && ts.isTypeReferenceNode(dtsFn.type) &&
                dtsFn.type.typeArguments && dtsFn.type.typeArguments[0] ||
            null;
        if (!typeParam || isAnyKeyword(typeParam)) {
          // Either we do not have a parameterized type or the type is `any`.
          let ngModule = fn.ngModule;
          // For internal (non-library) module references, redirect the module's value declaration
          // to its type declaration.
          if (ngModule.viaModule === null) {
            const dtsNgModule = this.host.getDtsDeclaration(ngModule.node);
            if (!dtsNgModule) {
              throw new Error(
                  `No typings declaration can be found for the referenced NgModule class in ${fn.declaration.getText()}.`);
            }
            if (!ts.isClassDeclaration(dtsNgModule) || !hasNameIdentifier(dtsNgModule)) {
              throw new Error(
                  `The referenced NgModule in ${fn.declaration.getText()} is not a named class declaration in the typings program; instead we get ${dtsNgModule.getText()}`);
            }
            // Record the usage of the internal module as it needs to become an exported symbol
            this.referencesRegistry.add(ngModule.node, new Reference(ngModule.node));

            ngModule = {node: dtsNgModule, viaModule: null};
          }
          const dtsFile = dtsFn.getSourceFile();
          const analysis = analyses.has(dtsFile) ? analyses.get(dtsFile) : [];
          analysis.push({declaration: dtsFn, ngModule});
          analyses.set(dtsFile, analysis);
        }
      });
    });
    return analyses;
  }

  private getRootFiles(program: ts.Program): ts.SourceFile[] {
    return program.getRootFileNames().map(f => program.getSourceFile(f)).filter(isDefined);
  }

  private getDtsDeclarationForFunction(fn: ModuleWithProvidersFunction) {
    let dtsFn: ts.Declaration|null = null;
    const containerClass = fn.container && this.host.getClassSymbol(fn.container);
    if (containerClass) {
      const dtsClass = this.host.getDtsDeclaration(containerClass.valueDeclaration);
      // Get the declaration of the matching static method
      dtsFn = dtsClass && ts.isClassDeclaration(dtsClass) ?
          dtsClass.members
              .find(
                  member => ts.isMethodDeclaration(member) && ts.isIdentifier(member.name) &&
                      member.name.text === fn.name) as ts.Declaration :
          null;
    } else {
      dtsFn = this.host.getDtsDeclaration(fn.declaration);
    }
    if (!dtsFn) {
      throw new Error(`Matching type declaration for ${fn.declaration.getText()} is missing`);
    }
    if (!isFunctionOrMethod(dtsFn)) {
      throw new Error(
          `Matching type declaration for ${fn.declaration.getText()} is not a function: ${dtsFn.getText()}`);
    }
    return dtsFn;
  }
}


function isFunctionOrMethod(declaration: ts.Declaration): declaration is ts.FunctionDeclaration|
    ts.MethodDeclaration {
  return ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration);
}

function isAnyKeyword(typeParam: ts.TypeNode): typeParam is ts.KeywordTypeNode {
  return typeParam.kind === ts.SyntaxKind.AnyKeyword;
}
