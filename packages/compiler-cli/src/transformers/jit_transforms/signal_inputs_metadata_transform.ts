/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {core} from '@angular/compiler';
import ts from 'typescript';

import {isAngularDecorator, tryParseSignalInputMapping} from '../../ngtsc/annotations';
import {PartialEvaluator} from '../../ngtsc/partial_evaluator';
import {Decorator, ReflectionHost} from '../../ngtsc/reflection';
import {addImports} from '../../ngtsc/transform';
import {ImportManager} from '../../ngtsc/translator';

/** Decorators for classes that should be transformed. */
const decoratorsWithInputs = ['Directive', 'Component'];

/** Name of the Angular core module. Used for importing the `Input` decorator. */
const coreModuleName = '@angular/core';

/**
 * Creates a TypeScript transformer that will automatically add an `@Input` decorator
 * for all signal inputs in Angular classes. The decorator will capture metadata of
 * the signal input, derived from the `input()/input.required()` initializer.
 *
 * This transform is useful for JIT environments where signal inputs would like to be
 * used. e.g. for Angular CLI unit testing. In such environments, signal inputs are not
 * statically retrievable at runtime. JIT compilation needs to know about all possible inputs
 * before instantiating directives. A decorator exposes this information to the class without
 * the class needing to be instantiated.
 */
export function getInputSignalsMetadataTransform(
    host: ReflectionHost,
    isCore: boolean,
    ): ts.TransformerFactory<ts.SourceFile> {
  return (ctx) => {
    return (sourceFile) => {
      const importManager = new ImportManager(undefined, undefined, ctx.factory);

      sourceFile = ts.visitNode(
          sourceFile,
          createTransformVisitor(ctx, host, importManager, isCore),
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
    ): ts.Visitor<ts.Node, ts.Node> {
  const visitor: ts.Visitor<ts.Node, ts.Node> = (node: ts.Node): ts.Node => {
    if (ts.isClassDeclaration(node) && node.name !== undefined) {
      const angularDecorator = host.getDecoratorsOfDeclaration(node)?.find(
          (d) => decoratorsWithInputs.some((name) => isAngularDecorator(d, name, isCore)));

      if (angularDecorator !== undefined) {
        return visitClassDeclaration(ctx, host, importManager, node, angularDecorator, isCore);
      }
    }

    return ts.visitEachChild(node, visitor, ctx);
  };
  return visitor;
}

/** Transforms an Angular class with potential signal inputs. */
function visitClassDeclaration(
    ctx: ts.TransformationContext,
    host: ReflectionHost,
    importManager: ImportManager,
    clazz: ts.ClassDeclaration,
    classDecorator: Decorator,
    isCore: boolean,
    ): ts.ClassDeclaration {
  const members = clazz.members.map((member) => {
    if (!ts.isPropertyDeclaration(member)) {
      return member;
    }
    if (!ts.isIdentifier(member.name) && !ts.isStringLiteralLike(member.name)) {
      return member;
    }
    // If the field already is decorated, we handle this gracefully and skip it.
    if (host.getDecoratorsOfDeclaration(member)?.some(
            d => isAngularDecorator(d, 'Input', isCore))) {
      return member;
    }

    const inputMapping = tryParseSignalInputMapping(
        {name: member.name.text, value: member.initializer ?? null},
        host,
        isCore ? coreModuleName : undefined,
    );
    if (inputMapping === null) {
      return member;
    }

    const fields: Record<keyof Required<core.Input>, ts.Expression> = {
      'isSignal': ctx.factory.createTrue(),
      'alias': ctx.factory.createStringLiteral(inputMapping.bindingPropertyName),
      'required': inputMapping.required ? ctx.factory.createTrue() : ctx.factory.createFalse(),
      // For signal inputs, transforms are captured by the input signal. The runtime will
      // determine whether a transform needs to be run via the input signal, so the `transform`
      // option is always `undefined`.
      'transform': ctx.factory.createIdentifier('undefined'),
    };

    const classDecoratorIdentifier = ts.isIdentifier(classDecorator.identifier) ?
        classDecorator.identifier :
        classDecorator.identifier.expression;

    const newDecorator = ctx.factory.createDecorator(
        ctx.factory.createCallExpression(
            ctx.factory.createPropertyAccessExpression(
                importManager.generateNamespaceImport(coreModuleName),
                // The synthetic identifier may be checked later by the downlevel decorators
                // transform to resolve to an Angular import using `getSymbolAtLocation`. We trick
                // the transform to think it's not synthetic and comes from Angular core.
                ts.setOriginalNode(
                    ctx.factory.createIdentifier('Input'), classDecoratorIdentifier)),
            undefined,
            [ctx.factory.createAsExpression(
                ctx.factory.createObjectLiteralExpression(Object.entries(fields).map(
                    ([name, value]) => ctx.factory.createPropertyAssignment(name, value))),
                // Cast to `any` because `isSignal` will be private, and in case this
                // transform is used directly as a pre-compilation step, the decorator should
                // not fail. It is already validated now due to us parsing the input metadata.
                ctx.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword))]),
    );

    return ctx.factory.updatePropertyDeclaration(
        member,
        [newDecorator, ...(member.modifiers ?? [])],
        member.name,
        member.questionToken,
        member.type,
        member.initializer,
    );
  });

  return ctx.factory.updateClassDeclaration(
      clazz,
      clazz.modifiers,
      clazz.name,
      clazz.typeParameters,
      clazz.heritageClauses,
      members,
  );
}
