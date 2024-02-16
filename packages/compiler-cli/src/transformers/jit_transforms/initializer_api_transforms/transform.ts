/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {isAngularDecorator} from '../../../ngtsc/annotations';
import {ImportedSymbolsTracker} from '../../../ngtsc/imports';
import {ReflectionHost} from '../../../ngtsc/reflection';
import {addImports} from '../../../ngtsc/transform';
import {ImportManager} from '../../../ngtsc/translator';

import {signalInputsTransform} from './input_function';
import {signalModelTransform} from './model_function';
import {initializerApiOutputTransform} from './output_function';
import {queryFunctionsTransforms} from './query_functions';
import {PropertyTransform} from './transform_api';

/** Decorators for classes that should be transformed. */
const decoratorsWithInputs = ['Directive', 'Component'];

/**
 * List of possible property transforms.
 * The first one matched on a class member will apply.
 */
const propertyTransforms: PropertyTransform[] = [
  signalInputsTransform,
  initializerApiOutputTransform,
  queryFunctionsTransforms,
  signalModelTransform,
];

/**
 * Creates an AST transform that looks for Angular classes and transforms
 * initializer-based declared members to work with JIT compilation.
 *
 * For example, an `input()` member may be transformed to add an `@Input`
 * decorator for JIT.
 */
export function getInitializerApiJitTransform(
    host: ReflectionHost,
    importTracker: ImportedSymbolsTracker,
    isCore: boolean,
    ): ts.TransformerFactory<ts.SourceFile> {
  return ctx => {
    return sourceFile => {
      const importManager = new ImportManager(undefined, undefined, ctx.factory);

      sourceFile = ts.visitNode(
          sourceFile,
          createTransformVisitor(ctx, host, importManager, importTracker, isCore),
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

function createTransformVisitor(
    ctx: ts.TransformationContext,
    host: ReflectionHost,
    importManager: ImportManager,
    importTracker: ImportedSymbolsTracker,
    isCore: boolean,
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

          // Find the first matching transform and update the class member.
          for (const transform of propertyTransforms) {
            const newNode = transform(
                member as ts.PropertyDeclaration & {name: ts.Identifier | ts.StringLiteralLike},
                host, ctx.factory, importTracker, importManager, angularDecorator, isCore);

            if (newNode !== member) {
              hasChanged = true;
              return newNode;
            }
          }

          return member;
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
