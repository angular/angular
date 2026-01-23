/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isAngularDecorator, tryParseInitializerBasedOutput} from '../../../../annotations';

import {createSyntheticAngularCoreDecoratorAccess, PropertyTransform} from './transform_api';

/**
 * Transform that will automatically add an `@Output` decorator for all initializer API
 * outputs in Angular classes. The decorator will capture metadata of the output, such
 * as the alias.
 *
 * This transform is useful for JIT environments. In such environments, such outputs are not
 * statically retrievable at runtime. JIT compilation needs to know about all possible outputs
 * before instantiating directives. A decorator exposes this information to the class without
 * the class needing to be instantiated.
 */
export const initializerApiOutputTransform: PropertyTransform = (
  member,
  sourceFile,
  host,
  factory,
  importTracker,
  importManager,
  classDecorator,
  isCore,
) => {
  // If the field already is decorated, we handle this gracefully and skip it.
  if (
    host
      .getDecoratorsOfDeclaration(member.node)
      ?.some((d) => isAngularDecorator(d, 'Output', isCore))
  ) {
    return member.node;
  }

  const output = tryParseInitializerBasedOutput(member, host, importTracker);
  if (output === null) {
    return member.node;
  }

  const newDecorator = factory.createDecorator(
    factory.createCallExpression(
      createSyntheticAngularCoreDecoratorAccess(
        factory,
        importManager,
        classDecorator,
        sourceFile,
        'Output',
      ),
      undefined,
      [factory.createStringLiteral(output.metadata.bindingPropertyName)],
    ),
  );

  return factory.updatePropertyDeclaration(
    member.node,
    [newDecorator, ...(member.node.modifiers ?? [])],
    member.node.name,
    member.node.questionToken,
    member.node.type,
    member.node.initializer,
  );
};
