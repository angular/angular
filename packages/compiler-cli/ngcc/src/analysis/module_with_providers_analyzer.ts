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
import {ClassDeclaration, ConcreteDeclaration} from '../../../src/ngtsc/reflection';
import {NgccReflectionHost} from '../host/ngcc_host';
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
  ngModule: ConcreteDeclaration<ClassDeclaration>;
}

export type ModuleWithProvidersAnalyses = Map<ts.SourceFile, ModuleWithProvidersInfo[]>;
export const ModuleWithProvidersAnalyses = Map;

export class ModuleWithProvidersAnalyzer {
  constructor(
      private host: NgccReflectionHost, private referencesRegistry: ReferencesRegistry,
      private processDts: boolean) {}

  analyzeProgram(program: ts.Program): ModuleWithProvidersAnalyses {
    const analyses = new ModuleWithProvidersAnalyses();
    const rootFiles = this.getRootFiles(program);
    rootFiles.forEach(f => {
      const fns = this.getModuleWithProvidersFunctions(f);
      fns && fns.forEach(fn => {
        if (fn.ngModule.viaModule === null) {
          // Record the usage of an internal module as it needs to become an exported symbol
          this.referencesRegistry.add(fn.ngModule.node, new Reference(fn.ngModule.node));
        }

        // Only when processing the dts files do we need to determine which declaration to update.
        if (this.processDts) {
          const dtsFn = this.getDtsDeclarationForFunction(fn);
          const typeParam = dtsFn.type && ts.isTypeReferenceNode(dtsFn.type) &&
                  dtsFn.type.typeArguments && dtsFn.type.typeArguments[0] ||
              null;
          if (!typeParam || isAnyKeyword(typeParam)) {
            const ngModule = this.resolveNgModuleReference(fn);
            const dtsFile = dtsFn.getSourceFile();
            const analysis = analyses.has(dtsFile) ? analyses.get(dtsFile) : [];
            analysis.push({declaration: dtsFn, ngModule});
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

  private getModuleWithProvidersFunctions(f: ts.SourceFile): ModuleWithProvidersFunction[] {
    const exports = this.host.getExportsOfModule(f);
    if (!exports) return [];
    const infos: ModuleWithProvidersFunction[] = [];
    exports.forEach((declaration, name) => {
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
      container: ts.Declaration|null = null): ModuleWithProvidersFunction|null {
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
    const lastStatement = body && body[body.length - 1];
    const returnExpression =
        lastStatement && ts.isReturnStatement(lastStatement) && lastStatement.expression || null;
    const ngModuleProperty = returnExpression && ts.isObjectLiteralExpression(returnExpression) &&
            returnExpression.properties.find(
                prop =>
                    !!prop.name && ts.isIdentifier(prop.name) && prop.name.text === 'ngModule') ||
        null;

    if (!ngModuleProperty || !ts.isPropertyAssignment(ngModuleProperty)) {
      return null;
    }

    // The ngModuleValue could be of the form `SomeModule` or `namespace_1.SomeModule`
    let ngModuleValue = ngModuleProperty.initializer;
    if (ts.isPropertyAccessExpression(ngModuleValue)) {
      ngModuleValue = ngModuleValue.expression;
    }

    if (!ts.isIdentifier(ngModuleValue)) {
      return null;
    }

    const ngModuleDeclaration = this.host.getDeclarationOfIdentifier(ngModuleValue);
    if (!ngModuleDeclaration || ngModuleDeclaration.node === null) {
      throw new Error(`Cannot find a declaration for NgModule ${
          ngModuleValue.getText()} referenced in "${declaration!.getText()}"`);
    }
    if (!hasNameIdentifier(ngModuleDeclaration.node)) {
      return null;
    }
    return {
      name,
      ngModule: ngModuleDeclaration as ConcreteDeclaration<ClassDeclaration>,
      declaration,
      container
    };
  }

  private getDtsDeclarationForFunction(fn: ModuleWithProvidersFunction) {
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
    return dtsFn;
  }

  private resolveNgModuleReference(fn: ModuleWithProvidersFunction):
      ConcreteDeclaration<ClassDeclaration> {
    const ngModule = fn.ngModule;

    // For external module references, use the declaration as is.
    if (ngModule.viaModule !== null) {
      return ngModule;
    }

    // For internal (non-library) module references, redirect the module's value declaration
    // to its type declaration.
    const dtsNgModule = this.host.getDtsDeclaration(ngModule.node);
    if (!dtsNgModule) {
      throw new Error(`No typings declaration can be found for the referenced NgModule class in ${
          fn.declaration.getText()}.`);
    }
    if (!ts.isClassDeclaration(dtsNgModule) || !hasNameIdentifier(dtsNgModule)) {
      throw new Error(`The referenced NgModule in ${
          fn.declaration
              .getText()} is not a named class declaration in the typings program; instead we get ${
          dtsNgModule.getText()}`);
    }

    return {node: dtsNgModule, known: null, viaModule: null, identity: null};
  }
}


function isFunctionOrMethod(declaration: ts.Declaration): declaration is ts.FunctionDeclaration|
    ts.MethodDeclaration {
  return ts.isFunctionDeclaration(declaration) || ts.isMethodDeclaration(declaration);
}

function isAnyKeyword(typeParam: ts.TypeNode): typeParam is ts.KeywordTypeNode {
  return typeParam.kind === ts.SyntaxKind.AnyKeyword;
}

/**
 * A structure returned from `getModuleWithProvidersFunction` that describes functions
 * that return ModuleWithProviders objects.
 */
export interface ModuleWithProvidersFunction {
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
  container: ts.Declaration|null;
  /**
   * The declaration of the class that the `ngModule` property on the `ModuleWithProviders` object
   * refers to.
   */
  ngModule: ConcreteDeclaration<ClassDeclaration>;
}
