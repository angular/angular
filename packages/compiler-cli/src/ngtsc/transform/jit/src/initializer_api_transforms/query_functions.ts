/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  getAngularDecorators,
  queryDecoratorNames,
  QueryFunctionName,
  tryParseSignalQueryFromInitializer,
} from '../../../../annotations';

import {
  castAsAny,
  createSyntheticAngularCoreDecoratorAccess,
  PropertyTransform,
} from './transform_api';

/** Maps a query function to its decorator. */
const queryFunctionToDecorator: Record<QueryFunctionName, string> = {
  viewChild: 'ViewChild',
  viewChildren: 'ViewChildren',
  contentChild: 'ContentChild',
  contentChildren: 'ContentChildren',
};

/**
 * Transform that will automatically add query decorators for all signal-based
 * queries in Angular classes. The decorator will capture metadata of the signal
 * query, derived from the initializer-based API call.
 *
 * This transform is useful for JIT environments where signal queries would like to be
 * used. e.g. for Angular CLI unit testing. In such environments, signal queries are not
 * statically retrievable at runtime. JIT compilation needs to know about all possible queries
 * before instantiating directives to construct the definition. A decorator exposes this
 * information to the class without the class needing to be instantiated.
 */
export const queryFunctionsTransforms: PropertyTransform = (
  member,
  sourceFile,
  host,
  factory,
  importTracker,
  importManager,
  classDecorator,
  isCore,
) => {
  const decorators = host.getDecoratorsOfDeclaration(member.node);

  // If the field already is decorated, we handle this gracefully and skip it.
  const queryDecorators =
    decorators && getAngularDecorators(decorators, queryDecoratorNames, isCore);
  if (queryDecorators !== null && queryDecorators.length > 0) {
    return member.node;
  }

  const queryDefinition = tryParseSignalQueryFromInitializer(member, host, importTracker);
  if (queryDefinition === null) {
    return member.node;
  }

  const callArgs = queryDefinition.call.arguments;
  const newDecorator = factory.createDecorator(
    factory.createCallExpression(
      createSyntheticAngularCoreDecoratorAccess(
        factory,
        importManager,
        classDecorator,
        sourceFile,
        queryFunctionToDecorator[queryDefinition.name],
      ),
      undefined,
      // All positional arguments of the query functions can be mostly re-used as is
      // for the decorator. i.e. predicate is always first argument. Options are second.
      [
        queryDefinition.call.arguments[0],
        // Note: Casting as `any` because `isSignal` is not publicly exposed and this
        // transform might pre-transform TS sources.
        castAsAny(
          factory,
          factory.createObjectLiteralExpression([
            ...(callArgs.length > 1 ? [factory.createSpreadAssignment(callArgs[1])] : []),
            factory.createPropertyAssignment('isSignal', factory.createTrue()),
          ]),
        ),
      ],
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
