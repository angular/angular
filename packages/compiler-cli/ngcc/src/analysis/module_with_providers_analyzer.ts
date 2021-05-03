/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {ReferencesRegistry} from '../../../src/ngtsc/annotations';
import {Reference} from '../../../src/ngtsc/imports';
import {PartialEvaluator} from '../../../src/ngtsc/partial_evaluator';
import {ClassDeclaration, DeclarationNode, isNamedClassDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {NgccReflectionHost} from '../host/ngcc_host';
import {hasNameIdentifier, isDefined} from '../utils';

/**
 * A structure returned from `getModuleWithProvidersFunctions()` that describes functions
 * that return ModuleWithProviders objects.
 */
export interface ModuleWithProvidersInfo {
  /**
   * The name of the declared function.
   */
  name: string;
  /**
   * The declaration of the function that returns the `ModuleWithProviders` object.
   */
  declaration: ts.SignatureDeclaration;
  /**
   * Declaration of the containing class (if this is a method)
   */
  container: DeclarationNode|null;
  /**
   * The declaration of the class that the `ngModule` property on the `ModuleWithProviders` object
   * refers to.
   */
  ngModule: Reference<ClassDeclaration>;
}

export type ModuleWithProvidersAnalyses = Map<ts.SourceFile, ModuleWithProvidersInfo[]>;
export const ModuleWithProvidersAnalyses = Map;

export class ModuleWithProvidersAnalyzer {
  private evaluator = new PartialEvaluator(this.host, this.typeChecker, null);

  constructor(
      private host: NgccReflectionHost, private typeChecker: ts.TypeChecker,
      private referencesRegistry: ReferencesRegistry, private processDts: boolean) {}

  analyzeProgram(program: ts.Program): ModuleWithProvidersAnalyses {
    const analyses: ModuleWithProvidersAnalyses = new ModuleWithProvidersAnalyses();
    const rootFiles = this.getRootFiles(program);
    rootFiles.forEach(f => {
      const fns = this.getModuleWithProvidersFunctions(f);
      fns && fns.forEach(fn => {
        if (fn.ngModule.bestGuessOwningModule === null) {
          // Record the usage of an internal module as it needs to become an exported symbol
          this.referencesRegistry.add(fn.ngModule.node, new Reference(fn.ngModule.node));
        }

        // Only when processing the dts files do we need to determine which declaration to update.
        if (this.processDts) {
          const dtsFn = this.getDtsModuleWithProvidersFunction(fn);
          const dtsFnType = dtsFn.declaration.type;
          const typeParam = dtsFnType && ts.isTypeReferenceNode(dtsFnType) &&
                  dtsFnType.typeArguments && dtsFnType.typeArguments[0] ||
              null;
          if (!typeParam || isAnyKeyword(typeParam)) {
            const dtsFile = dtsFn.declaration.getSourceFile();
            const analysis = analyses.has(dtsFile) ? analyses.get(dtsFile)! : [];
            analysis.push(dtsFn);
            analyses.set(dtsFile, analysis);
          }
        }
      });
    });
    return analyses;
  }

  private getRootFiles(program: ts.Program): ts.SourceFile[] {
    return program.getRootFileNames().map(f => program.getSourceFile(f)).filter(isDefined);
  }

  private getModuleWithProvidersFunctions(f: ts.SourceFile): ModuleWithProvidersInfo[] {
    const exports = this.host.getExportsOfModule(f);
    if (!exports) return [];
    const infos: ModuleWithProvidersInfo[] = [];
    exports.forEach((declaration) => {
      if (declaration.node === null) {
        return;
      }
      if (this.host.isClass(declaration.node)) {
        this.host.getMembersOfClass(declaration.node).forEach(member => {
          if (member.isStatic) {
            const info = this.parseForModuleWithProviders(
                member.name, member.node, member.implementation, declaration.node);
            if (info) {
              infos.push(info);
            }
          }
        });
      } else {
        if (hasNameIdentifier(declaration.node)) {
          const info =
              this.parseForModuleWithProviders(declaration.node.name.text, declaration.node);
          if (info) {
            infos.push(info);
          }
        }
      }
    });
    return infos;
  }

  /**
   * Parse a function/method node (or its implementation), to see if it returns a
   * `ModuleWithProviders` object.
   * @param name The name of the function.
   * @param node the node to check - this could be a function, a method or a variable declaration.
   * @param implementation the actual function expression if `node` is a variable declaration.
   * @param container the class that contains the function, if it is a method.
   * @returns info about the function if it does return a `ModuleWithProviders` object; `null`
   * otherwise.
   */
  private parseForModuleWithProviders(
      name: string, node: ts.Node|null, implementation: ts.Node|null = node,
      container: DeclarationNode|null = null): ModuleWithProvidersInfo|null {
    if (implementation === null ||
        (!ts.isFunctionDeclaration(implementation) && !ts.isMethodDeclaration(implementation) &&
         !ts.isFunctionExpression(implementation))) {
      return null;
    }
    const declaration = implementation;
    const definition = this.host.getDefinitionOfFunction(declaration);
    if (definition === null) {
      return null;
    }

    const body = definition.body;
    if (body === null || body.length === 0) {
      return null;
    }

    // Get hold of the return statement expression for the function
    const lastStatement = body[body.length - 1];
    if (!ts.isReturnStatement(lastStatement) || lastStatement.expression === undefined) {
      return null;
    }

    // Evaluate this expression and extract the `ngModule` reference
    const result = this.evaluator.evaluate(lastStatement.expression);
    if (!(result instanceof Map) || !result.has('ngModule')) {
      return null;
    }

    const ngModuleRef = result.get('ngModule')!;
    if (!(ngModuleRef instanceof Reference)) {
      return null;
    }

    if (!isNamedClassDeclaration(ngModuleRef.node) &&
        !isNamedVariableDeclaration(ngModuleRef.node)) {
      throw new Error(`The identity given by ${ngModuleRef.debugName} referenced in "${
          declaration!.getText()}" doesn't appear to be a "class" declaration.`);
    }

    const ngModule = ngModuleRef as Reference<ClassDeclaration>;
    return {name, ngModule, declaration, container};
  }

  private getDtsModuleWithProvidersFunction(fn: ModuleWithProvidersInfo): ModuleWithProvidersInfo {
    let dtsFn: ts.Declaration|null = null;
    const containerClass = fn.container && this.host.getClassSymbol(fn.container);
    if (containerClass) {
      const dtsClass = this.host.getDtsDeclaration(containerClass.declaration.valueDeclaration);
      // Get the declaration of the matching static method
      dtsFn = dtsClass && ts.isClassDeclaration(dtsClass) ?
          dtsClass.members.find(
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
      throw new Error(`Matching type declaration for ${
          fn.declaration.getText()} is not a function: ${dtsFn.getText()}`);
    }
    const container = containerClass ? containerClass.declaration.valueDeclaration : null;
    const ngModule = this.resolveNgModuleReference(fn);
    return {name: fn.name, container, declaration: dtsFn, ngModule};
  }

  private resolveNgModuleReference(fn: ModuleWithProvidersInfo): Reference<ClassDeclaration> {
    const ngModule = fn.ngModule;

    // For external module references, use the declaration as is.
    if (ngModule.bestGuessOwningModule !== null) {
      return ngModule;
    }

    // For internal (non-library) module references, redirect the module's value declaration
    // to its type declaration.
    const dtsNgModule = this.host.getDtsDeclaration(ngModule.node);
    if (!dtsNgModule) {
      throw new Error(`No typings declaration can be found for the referenced NgModule class in ${
          fn.declaration.getText()}.`);
    }
    if (!isNamedClassDeclaration(dtsNgModule)) {
      throw new Error(`The referenced NgModule in ${
          fn.declaration
              .getText()} is not a named class declaration in the typings program; instead we get ${
          dtsNgModule.getText()}`);
    }
    return new Reference(dtsNgModule, null);
  }
}


function isFunctionOrMethod(declaration: ts.Declaration): declaration is ts.FunctionDeclaration|
    ts.MethodDeclaration {
  return ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration);
}

function isAnyKeyword(typeParam: ts.TypeNode): typeParam is ts.KeywordTypeNode {
  return typeParam.kind === ts.SyntaxKind.AnyKeyword;
}
