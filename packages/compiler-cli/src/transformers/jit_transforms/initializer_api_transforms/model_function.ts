/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {isAngularDecorator, tryParseSignalModelMapping} from '../../../ngtsc/annotations';
import {ImportManager} from '../../../ngtsc/translator';

import {PropertyTransform} from './transform_api';

/**
 * Transform that automatically adds `@Input` and `@Output` to members initialized as `model()`.
 * It is useful for JIT environments where models can't be recognized based on the initializer.
 */
export const signalModelTransform: PropertyTransform = (
    member,
    host,
    factory,
    importTracker,
    importManager,
    decorator,
    isCore,
    ) => {
  if (host.getDecoratorsOfDeclaration(member)?.some(d => {
        return isAngularDecorator(d, 'Input', isCore) || isAngularDecorator(d, 'Output', isCore);
      })) {
    return member;
  }

  const modelMapping = tryParseSignalModelMapping(
      {name: member.name.text, value: member.initializer ?? null},
      host,
      importTracker,
  );

  if (modelMapping === null) {
    return member;
  }

  const classDecoratorIdentifier = ts.isIdentifier(decorator.identifier) ?
      decorator.identifier :
      decorator.identifier.expression;

  const inputConfig = factory.createObjectLiteralExpression([
    factory.createPropertyAssignment(
        'isSignal', modelMapping.input.isSignal ? factory.createTrue() : factory.createFalse()),
    factory.createPropertyAssignment(
        'alias', factory.createStringLiteral(modelMapping.input.bindingPropertyName)),
    factory.createPropertyAssignment(
        'required', modelMapping.input.required ? factory.createTrue() : factory.createFalse()),
  ]);

  const inputDecorator = createDecorator(
      'Input',
      // Config is cast to `any` because `isSignal` will be private, and in case this
      // transform is used directly as a pre-compilation step, the decorator should
      // not fail. It is already validated now due to us parsing the input metadata.
      factory.createAsExpression(
          inputConfig, factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
      classDecoratorIdentifier, factory, importManager);

  const outputDecorator = createDecorator(
      'Output', factory.createStringLiteral(modelMapping.output.bindingPropertyName),
      classDecoratorIdentifier, factory, importManager);

  return factory.updatePropertyDeclaration(
      member,
      [inputDecorator, outputDecorator, ...(member.modifiers ?? [])],
      member.name,
      member.questionToken,
      member.type,
      member.initializer,
  );
};

function createDecorator(
    name: string, config: ts.Expression, classDecoratorIdentifier: ts.Identifier,
    factory: ts.NodeFactory, importManager: ImportManager): ts.Decorator {
  const callTarget = factory.createPropertyAccessExpression(
      importManager.generateNamespaceImport('@angular/core'),
      // The synthetic identifier may be checked later by the downlevel decorators
      // transform to resolve to an Angular import using `getSymbolAtLocation`. We trick
      // the transform to think it's not synthetic and comes from Angular core.
      ts.setOriginalNode(factory.createIdentifier(name), classDecoratorIdentifier));

  return factory.createDecorator(factory.createCallExpression(callTarget, undefined, [config]));
}
