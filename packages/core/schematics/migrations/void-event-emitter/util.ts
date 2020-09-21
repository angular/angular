/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {Call, TmplAstBoundEvent, TmplAstElement} from '@angular/compiler';
import ts from 'typescript';

import {parseHtmlGracefully} from '../../utils/parse_html';
import {TemplateAstVisitor} from '../../utils/template_ast_visitor';
import {isReferenceToImport} from '../../utils/typescript/symbol';

import type {ComponentTemplatesResolver} from './component-templates-resolver';
import {ResolvedTemplate} from '../../utils/ng_component_template';

type EventEmitterCall = {
  hasArguments: boolean,
  methodName: 'emit'|'next',
  pos: ts.LineAndCharacter,
  filePath: string
};

type EventEmitterUsages = Map<ts.PropertyDeclaration, EventEmitterCall[]>;

function isEmitMethod(methodName: string|ts.__String): methodName is 'emit'|'next' {
  return methodName === 'emit' || methodName === 'next';
}

type EventEmitterTypeParam = 'typed'|'void'|'missing';

export function getEventEmitterTypeParam(node: ts.PropertyDeclaration): EventEmitterTypeParam {
  const initializedTypeParams =
      node.initializer && ts.isNewExpression(node.initializer) && node.initializer.typeArguments;

  const declaredTypeParams =
      node.type && ts.isTypeReferenceNode(node.type) && node.type.typeArguments;

  const typeParams = declaredTypeParams || initializedTypeParams;

  if (!typeParams || !typeParams.length) {
    return 'missing';
  }

  if (typeParams[0].kind === ts.SyntaxKind.VoidKeyword) {
    return 'void';
  }

  return 'typed';
}

// Wrap everything in a function, so that we could use compilerModule freely
// (primarily, extend RecursiveAstVisitor)
export function withCompilerModule(compilerModule: typeof import('@angular/compiler')) {
  class EmitterTemplateVisitor extends TemplateAstVisitor {
    constructor(private usages: EventEmitterUsages, private template: ResolvedTemplate) {
      super(compilerModule);
    }
    override visitElement(element: TmplAstElement) {
      this.visitAll(element.outputs);
      super.visitElement(element);
    }

    override visitBoundEvent(attribute: TmplAstBoundEvent) {
      const astVisitor = new EmitterAstVisitor(this.usages, this.template);
      attribute.handler.visit(astVisitor);
    }
  }

  class EmitterAstVisitor extends compilerModule.RecursiveAstVisitor {
    constructor(private usages: EventEmitterUsages, private template: ResolvedTemplate) {
      super();
    }

    override visitCall(ast: Call, context: any): any {
      // E.g. (click)="myEmitter.emit(123)"
      // ast.receiver: "emit" property
      // ast.receiver.receiver: "myEmitter" property
      // ast.receiver.receiver.receiver: "this" context (implicit)

      if (ast.receiver instanceof compilerModule.PropertyRead && isEmitMethod(ast.receiver.name) &&
          ast.receiver.receiver instanceof compilerModule.PropertyRead &&
          ast.receiver.receiver.receiver instanceof compilerModule.ImplicitReceiver) {
        for (let [declaration, calls] of this.usages.entries()) {
          if (ts.isMemberName(declaration.name) &&
              declaration.name.escapedText === ast.receiver.receiver.name) {
            const pos = this.template.getCharacterAndLineOfPosition(ast.sourceSpan.start);
            calls.push({
              hasArguments: !!ast.args.length,
              methodName: ast.receiver.name,
              pos: pos,
              filePath: this.template.filePath
            });
          }
        }
      }
    }
  }

  /**
   * Find class properties initialized with `new EventEmitter()` as well as .emit() methods calls on
   * such properties.
   */
  function findEventEmitterReferences(
      sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
      eventEmitterImportSpecifier: ts.ImportSpecifier,
      componentTemplatesResolver: ComponentTemplatesResolver) {
    const usagesInFile: EventEmitterUsages = new Map();

    ts.forEachChild(sourceFile, function visitNode(node) {
      if (ts.isClassDeclaration(node)) {
        const usagesInClass = findUsagesInClass(
            typeChecker, node, eventEmitterImportSpecifier, componentTemplatesResolver);
        for (let [declaration, calls] of usagesInClass.entries()) {
          usagesInFile.set(declaration, calls);
        }
      } else {
        ts.forEachChild(node, visitNode);
      }
    });

    return usagesInFile;
  }


  function findUsagesInClass(
      typeChecker: ts.TypeChecker, classDeclaration: ts.ClassDeclaration,
      eventEmitterImportSpecifier: ts.ImportSpecifier,
      componentTemplatesResolver: ComponentTemplatesResolver) {
    const usages: EventEmitterUsages = new Map();

    // Find all property declarations of type EventEmitter
    ts.forEachChild(classDeclaration, function visitNode(node: ts.Node) {
      if (ts.isPropertyDeclaration(node) &&
          isReferenceToImport(typeChecker, node, eventEmitterImportSpecifier)) {
        usages.set(node, []);
      }

      ts.forEachChild(node, visitNode);
    });

    // Find all .emit method calls on the emitters from the previous step
    ts.forEachChild(classDeclaration, function visitNode(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
          isEmitMethod(node.expression.name.escapedText)) {
        const symbol = typeChecker.getSymbolAtLocation(node.expression.expression);
        const declaration = symbol?.declarations?.[0];
        const trackedCalls =
            declaration && ts.isPropertyDeclaration(declaration) && usages.get(declaration);
        const pos = ts.getLineAndCharacterOfPosition(node.getSourceFile(), node.getStart());
        trackedCalls && trackedCalls.push({
          hasArguments: !!node.arguments.length,
          methodName: node.expression.name.escapedText,
          pos: pos,
          filePath: node.getSourceFile().fileName
        });
      }
      ts.forEachChild(node, visitNode);
    });

    // Find all .emit method calls inside the component template
    const templates = componentTemplatesResolver.resolveTemplates(classDeclaration);

    templates.forEach(template => {
      const emitterTemplateVisitor = new EmitterTemplateVisitor(usages, template);
      const templateNodes =
          parseHtmlGracefully(template.content, template.filePath, compilerModule) || [];
      emitterTemplateVisitor.visitAll(templateNodes);
    });

    return usages;
  }

  return {findEventEmitterReferences};
}
