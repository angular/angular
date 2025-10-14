/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {isAngularDecorator, tryParseSignalModelMapping} from '../../../../annotations';
import {createSyntheticAngularCoreDecoratorAccess} from './transform_api';
/**
 * Transform that automatically adds `@Input` and `@Output` to members initialized as `model()`.
 * It is useful for JIT environments where models can't be recognized based on the initializer.
 */
export const signalModelTransform = (
  member,
  sourceFile,
  host,
  factory,
  importTracker,
  importManager,
  classDecorator,
  isCore,
) => {
  if (
    host.getDecoratorsOfDeclaration(member.node)?.some((d) => {
      return isAngularDecorator(d, 'Input', isCore) || isAngularDecorator(d, 'Output', isCore);
    })
  ) {
    return member.node;
  }
  const modelMapping = tryParseSignalModelMapping(member, host, importTracker);
  if (modelMapping === null) {
    return member.node;
  }
  const inputConfig = factory.createObjectLiteralExpression([
    factory.createPropertyAssignment(
      'isSignal',
      modelMapping.input.isSignal ? factory.createTrue() : factory.createFalse(),
    ),
    factory.createPropertyAssignment(
      'alias',
      factory.createStringLiteral(modelMapping.input.bindingPropertyName),
    ),
    factory.createPropertyAssignment(
      'required',
      modelMapping.input.required ? factory.createTrue() : factory.createFalse(),
    ),
  ]);
  const inputDecorator = createDecorator(
    'Input',
    // Config is cast to `any` because `isSignal` will be private, and in case this
    // transform is used directly as a pre-compilation step, the decorator should
    // not fail. It is already validated now due to us parsing the input metadata.
    factory.createAsExpression(
      inputConfig,
      factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
    ),
    classDecorator,
    factory,
    sourceFile,
    importManager,
  );
  const outputDecorator = createDecorator(
    'Output',
    factory.createStringLiteral(modelMapping.output.bindingPropertyName),
    classDecorator,
    factory,
    sourceFile,
    importManager,
  );
  return factory.updatePropertyDeclaration(
    member.node,
    [inputDecorator, outputDecorator, ...(member.node.modifiers ?? [])],
    member.node.name,
    member.node.questionToken,
    member.node.type,
    member.node.initializer,
  );
};
function createDecorator(name, config, classDecorator, factory, sourceFile, importManager) {
  const callTarget = createSyntheticAngularCoreDecoratorAccess(
    factory,
    importManager,
    classDecorator,
    sourceFile,
    name,
  );
  return factory.createDecorator(factory.createCallExpression(callTarget, undefined, [config]));
}
//# sourceMappingURL=model_function.js.map
