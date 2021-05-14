/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ImplicitReceiver, MethodCall, PropertyRead, RecursiveAstVisitor} from '@angular/compiler';
import {BoundEvent, Element, RecursiveVisitor} from '@angular/compiler/src/render3/r3_ast';
import {visitAll} from '@angular/compiler/src/render3/r3_ast';
import * as ts from 'typescript';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';
import {parseHtmlGracefully} from '../../utils/parse_html';
import {isReferenceToImport} from '../../utils/typescript/symbol';

type EventEmitterCall = {
  hasArguments: boolean
};
type EventEmitterUsages = Map<ts.PropertyDeclaration, EventEmitterCall[]>;

function isEmitMethod(methodName: string|ts.__String) {
  return methodName === 'emit' || methodName === 'next'
}

/**
 * Find class properties initialized with `new EventEmitter()` as well as .emit() methods calls on
 * such properties.
 */
export function findEventEmitterReferences(
    sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
    eventEmitterImportSpecifier: ts.ImportSpecifier) {
  const usagesInFile: EventEmitterUsages = new Map();

  ts.forEachChild(sourceFile, function visitNode(node) {
    if (ts.isClassDeclaration(node)) {
      const usagesInClass = findUsagesInClass(typeChecker, node, eventEmitterImportSpecifier);
      for (let [declaration, calls] of usagesInClass.entries()) {
        usagesInFile.set(declaration, calls)
      }
    } else {
      ts.forEachChild(node, visitNode);
    }
  })

  return usagesInFile;
}


function findUsagesInClass(
    typeChecker: ts.TypeChecker, classDeclaration: ts.ClassDeclaration,
    eventEmitterImportSpecifier: ts.ImportSpecifier) {
  const usages: EventEmitterUsages = new Map();

  // Find all property declarations that are initialized as new EventEmitter() without explicitly
  // specifying type
  ts.forEachChild(classDeclaration, function visitNode(node: ts.Node) {
    if (ts.isPropertyDeclaration(node) && !node.type && node.initializer &&
        ts.isNewExpression(node.initializer) &&
        isReferenceToImport(
            typeChecker, node.initializer.expression, eventEmitterImportSpecifier) &&
        !node.initializer.typeArguments) {
      usages.set(node, []);
    }

    ts.forEachChild(node, visitNode);
  })

  // Find all .emit method calls on the emitters from the previous step
  ts.forEachChild(classDeclaration, function visitNode(node: ts.Node) {
    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
        isEmitMethod(node.expression.name.escapedText)) {
      const symbol = typeChecker.getSymbolAtLocation(node.expression.expression);
      const declaration = symbol?.declarations[0];
      const trackedCalls =
          declaration && ts.isPropertyDeclaration(declaration) && usages.get(declaration);
      trackedCalls && trackedCalls.push({hasArguments: !!node.arguments.length});
    }
    ts.forEachChild(node, visitNode);
  });

  // Find all .emit method calls inside the component template
  const templateVisitor = new NgComponentTemplateVisitor(typeChecker);
  templateVisitor.visitNode(classDeclaration);
  const templates = templateVisitor.resolvedTemplates;

  const emitterTemplateVisitor = new EmitterTemplateVisitor(usages);

  templates.forEach(template => {
    const templateNodes = parseHtmlGracefully(template.content, template.filePath) || [];
    visitAll(emitterTemplateVisitor, templateNodes);
  })

  return usages;
}


class EmitterTemplateVisitor extends RecursiveVisitor {
  constructor(private usages: EventEmitterUsages) {
    super();
  }
  visitElement(element: Element) {
    visitAll(this, element.outputs);
    super.visitElement(element);
  }

  visitBoundEvent(attribute: BoundEvent) {
    const astVisitor = new EmitterAstVisitor(this.usages);
    attribute.handler.visit(astVisitor);
  }
}

class EmitterAstVisitor extends RecursiveAstVisitor {
  constructor(private usages: EventEmitterUsages) {
    super();
  }

  visitMethodCall(ast: MethodCall, context: any): any {
    if (isEmitMethod(ast.name) && ast.receiver instanceof PropertyRead &&
        ast.receiver.receiver instanceof ImplicitReceiver) {
      for (let [declaration, calls] of this.usages.entries()) {
        if (ts.isIdentifierOrPrivateIdentifier(declaration.name) &&
            declaration.name.escapedText === ast.receiver.name) {
          calls.push({hasArguments: !!ast.args.length});
        }
      }
    }
  }
}
