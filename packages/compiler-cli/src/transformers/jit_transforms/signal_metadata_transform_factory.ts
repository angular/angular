/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {isAngularDecorator} from '../../ngtsc/annotations';
import {Decorator, ReflectionHost} from '../../ngtsc/reflection';
import {addImports} from '../../ngtsc/transform';
import {ImportManager} from '../../ngtsc/translator';

/** Decorators for classes that should be transformed. */
const decoratorsWithInputs = ['Directive', 'Component'];

/** Function that can be used to transform a class property to add signal-specific metadata. */
export type PropertyTransform =
    (node: ts.PropertyDeclaration&{name: ts.Identifier | ts.StringLiteralLike},
     host: ReflectionHost, factory: ts.NodeFactory, importManager: ImportManager,
     decorator: Decorator, isCore: boolean) => ts.PropertyDeclaration;

/**
 * Factory that creates a TypeScript transformer which can be used
 * to add signal-specific metadata to class properties.
 */
export function signalMetadataTransformFactory(
    host: ReflectionHost,
    isCore: boolean,
    propertyTransform: PropertyTransform,
    ): ts.TransformerFactory<ts.SourceFile> {
  return ctx => {
    return sourceFile => {
      const importManager = new ImportManager(undefined, undefined, ctx.factory);

      sourceFile = ts.visitNode(
          sourceFile,
          createTransformVisitor(ctx, host, importManager, isCore, propertyTransform),
          ts.isSourceFile,
      );

      const newImports = importManager.getAllImports(sourceFile.fileName);
      if (newImports.length > 0) {
        sourceFile = addImports(ctx.factory, importManager, sourceFile);
      }

      return sourceFile;
    };
  };
}

/**
 * Creates a transform AST visitor that looks for candidate Angular classes
 * that need to be checked for signal inputs that need a decorator.
 */
function createTransformVisitor(
    ctx: ts.TransformationContext,
    host: ReflectionHost,
    importManager: ImportManager,
    isCore: boolean,
    propertyTransform: PropertyTransform,
    ): ts.Visitor<ts.Node, ts.Node> {
  const visitor: ts.Visitor<ts.Node, ts.Node> = (node: ts.Node): ts.Node => {
    if (ts.isClassDeclaration(node) && node.name !== undefined) {
      const angularDecorator = host.getDecoratorsOfDeclaration(node)?.find(
          (d) => decoratorsWithInputs.some(name => isAngularDecorator(d, name, isCore)));

      if (angularDecorator !== undefined) {
        let hasChanged = false;

        const members = node.members.map(member => {
          if (!ts.isPropertyDeclaration(member)) {
            return member;
          }
          if (!ts.isIdentifier(member.name) && !ts.isStringLiteralLike(member.name)) {
            return member;
          }
          const newNode = propertyTransform(
              member as ts.PropertyDeclaration & {name: ts.Identifier | ts.StringLiteralLike}, host,
              ctx.factory, importManager, angularDecorator, isCore);
          if (newNode !== member) {
            hasChanged = true;
          }
          return newNode;
        });

        if (hasChanged) {
          return ctx.factory.updateClassDeclaration(
              node, node.modifiers, node.name, node.typeParameters, node.heritageClauses, members);
        }
      }
    }

    return ts.visitEachChild(node, visitor, ctx);
  };
  return visitor;
}
