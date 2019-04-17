/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

const COMMON_IMPORT = '@angular/common';
const PLATFORM_BROWSER_IMPORT = '@angular/platform-browser';
export const DOCUMENT_TOKEN_NAME = 'DOCUMENT';

export interface Imports {
  platformBrowserImport: ts.NamedImports|null;
  commonImport: ts.NamedImports|null;
  replaceText: string|null;
  documentElement: ts.ImportSpecifier|null;
}

/**
 * Visitor that can be used to find a set of imports in a TypeScript file.
 */
export class DocumentImportVisitor {
  importsMap: Map<ts.SourceFile, Imports> = new Map();

  constructor(public typeChecker: ts.TypeChecker) {}

  visitNode(node: ts.Node) {
    if (ts.isNamedImports(node)) {
      this.visitNamedImport(node);
    }

    ts.forEachChild(node, node => this.visitNode(node));
  }

  private visitNamedImport(node: ts.NamedImports) {
    if (!node.elements || !node.elements.length) {
      return;
    }

    const importDeclaration = node.parent.parent;
    // If this is not a StringLiteral it will be a grammar error
    const moduleSpecifier = importDeclaration.moduleSpecifier as ts.StringLiteral;
    const sourceFile = node.getSourceFile();
    let imports = this.importsMap.get(sourceFile);
    if (!imports) {
      imports = {
        platformBrowserImport: null,
        commonImport: null,
        replaceText: null,
        documentElement: null,
      };
    }

    if (moduleSpecifier.text === PLATFORM_BROWSER_IMPORT) {
      const documentElement = this.getDocumentElement(node);
      if (documentElement) {
        imports.replaceText = this.getReplaceText(documentElement);
        imports.platformBrowserImport = node;
        imports.documentElement = documentElement;
      }
    } else if (moduleSpecifier.text === COMMON_IMPORT) {
      imports.commonImport = node;
    }
    this.importsMap.set(sourceFile, imports);
  }

  private getDocumentElement(node: ts.NamedImports): ts.ImportSpecifier|undefined {
    const elements = node.elements;
    return elements.find(el => (el.propertyName || el.name).escapedText === DOCUMENT_TOKEN_NAME);
  }

  private getReplaceText(documentElement: ts.ImportSpecifier): string {
    return documentElement.propertyName ?
        `${DOCUMENT_TOKEN_NAME} as ${documentElement.name.escapedText}` :
        DOCUMENT_TOKEN_NAME;
  }
}
