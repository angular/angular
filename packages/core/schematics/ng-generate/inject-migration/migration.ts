/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {PendingChange, ChangeTracker} from '../../utils/change_tracker';
import {
  analyzeFile,
  getSuperParameters,
  getConstructorUnusedParameters,
  hasGenerics,
  isNullableType,
  parameterDeclaresProperty,
  DI_PARAM_SYMBOLS,
  MigrationOptions,
  parameterReferencesOtherParameters,
} from './analysis';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {getImportOfIdentifier} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';
import {findUninitializedPropertiesToCombine, shouldCombineInInitializationOrder} from './internal';
import {getLeadingLineWhitespaceOfNode} from '../../utils/tsurge/helpers/ast/leading_space';

/**
 * Placeholder used to represent expressions inside the AST.
 * Includes Unicode characters to reduce the chance of collisions.
 */
const PLACEHOLDER = 'ɵɵngGeneratePlaceholderɵɵ';

/**
 * Migrates all of the classes in a `SourceFile` away from constructor injection.
 * @param sourceFile File to be migrated.
 * @param options Options that configure the migration.
 */
export function migrateFile(sourceFile: ts.SourceFile, options: MigrationOptions): PendingChange[] {
  // Note: even though externally we have access to the full program with a proper type
  // checker, we create a new one that is local to the file for a couple of reasons:
  // 1. Not having to depend on a program makes running the migration internally faster and easier.
  // 2. All the necessary information for this migration is local so using a file-specific type
  //    checker should speed up the lookups.
  const localTypeChecker = getLocalTypeChecker(sourceFile);
  const analysis = analyzeFile(sourceFile, localTypeChecker, options);

  if (analysis === null || analysis.classes.length === 0) {
    return [];
  }

  const printer = ts.createPrinter();
  const tracker = new ChangeTracker(printer);

  analysis.classes.forEach(({node, constructor, superCall}) => {
    const memberIndentation = getLeadingLineWhitespaceOfNode(node.members[0]);
    const prependToClass: string[] = [];
    const afterInjectCalls: string[] = [];
    const removedStatements = new Set<ts.Statement>();
    const removedMembers = new Set<ts.ClassElement>();

    if (options._internalCombineMemberInitializers) {
      applyInternalOnlyChanges(
        node,
        constructor,
        localTypeChecker,
        tracker,
        printer,
        removedStatements,
        removedMembers,
        prependToClass,
        afterInjectCalls,
        memberIndentation,
        options,
      );
    }

    migrateClass(
      node,
      constructor,
      superCall,
      options,
      memberIndentation,
      prependToClass,
      afterInjectCalls,
      removedStatements,
      removedMembers,
      localTypeChecker,
      printer,
      tracker,
    );
  });

  DI_PARAM_SYMBOLS.forEach((name) => {
    // Both zero and undefined are fine here.
    if (!analysis.nonDecoratorReferences[name]) {
      tracker.removeImport(sourceFile, name, '@angular/core');
    }
  });

  return tracker.recordChanges().get(sourceFile) || [];
}

/**
 * Migrates a class away from constructor injection.
 * @param node Class to be migrated.
 * @param constructor Reference to the class' constructor node.
 * @param superCall Reference to the constructor's `super()` call, if any.
 * @param options Options used to configure the migration.
 * @param memberIndentation Indentation string of the members of the class.
 * @param prependToClass Text that should be prepended to the class.
 * @param afterInjectCalls Text that will be inserted after the newly-added `inject` calls.
 * @param removedStatements Statements that have been removed from the constructor already.
 * @param removedMembers Class members that have been removed by the migration.
 * @param localTypeChecker Type checker set up for the specific file.
 * @param printer Printer used to output AST nodes as strings.
 * @param tracker Object keeping track of the changes made to the file.
 */
function migrateClass(
  node: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  superCall: ts.CallExpression | null,
  options: MigrationOptions,
  memberIndentation: string,
  prependToClass: string[],
  afterInjectCalls: string[],
  removedStatements: Set<ts.Statement>,
  removedMembers: Set<ts.ClassElement>,
  localTypeChecker: ts.TypeChecker,
  printer: ts.Printer,
  tracker: ChangeTracker,
): void {
  const sourceFile = node.getSourceFile();
  const unusedParameters = getConstructorUnusedParameters(
    constructor,
    localTypeChecker,
    removedStatements,
  );
  const superParameters = superCall
    ? getSuperParameters(constructor, superCall, localTypeChecker)
    : null;
  const removedStatementCount = removedStatements.size;
  const firstConstructorStatement = constructor.body?.statements.find(
    (statement) => !removedStatements.has(statement),
  );
  const innerReference = superCall || firstConstructorStatement || constructor;
  const innerIndentation = getLeadingLineWhitespaceOfNode(innerReference);
  const prependToConstructor: string[] = [];
  const afterSuper: string[] = [];

  for (const param of constructor.parameters) {
    const usedInSuper = superParameters !== null && superParameters.has(param);
    const usedInConstructor = !unusedParameters.has(param);
    const usesOtherParams = parameterReferencesOtherParameters(
      param,
      constructor.parameters,
      localTypeChecker,
    );

    migrateParameter(
      param,
      options,
      localTypeChecker,
      printer,
      tracker,
      superCall,
      usedInSuper,
      usedInConstructor,
      usesOtherParams,
      memberIndentation,
      innerIndentation,
      prependToConstructor,
      prependToClass,
      afterSuper,
    );
  }

  // Delete all of the constructor overloads since below we're either going to
  // remove the implementation, or we're going to delete all of the parameters.
  for (const member of node.members) {
    if (ts.isConstructorDeclaration(member) && member !== constructor) {
      removedMembers.add(member);
      tracker.removeNode(member, true);
    }
  }

  if (
    canRemoveConstructor(
      options,
      constructor,
      removedStatementCount,
      prependToConstructor,
      superCall,
    )
  ) {
    // Drop the constructor if it was empty.
    removedMembers.add(constructor);
    tracker.removeNode(constructor, true);
  } else {
    // If the constructor contains any statements, only remove the parameters.
    // We always do this no matter what is passed into `backwardsCompatibleConstructors`.
    stripConstructorParameters(constructor, tracker);

    if (prependToConstructor.length > 0) {
      if (
        firstConstructorStatement ||
        (innerReference !== constructor &&
          innerReference.getStart() >= constructor.getStart() &&
          innerReference.getEnd() <= constructor.getEnd())
      ) {
        tracker.insertText(
          sourceFile,
          (firstConstructorStatement || innerReference).getFullStart(),
          `\n${prependToConstructor.join('\n')}\n`,
        );
      } else {
        tracker.insertText(
          sourceFile,
          constructor.body!.getStart() + 1,
          `\n${prependToConstructor.map((p) => innerIndentation + p).join('\n')}\n${innerIndentation}`,
        );
      }
    }
  }

  if (afterSuper.length > 0 && superCall !== null) {
    // Note that if we can, we should insert before the next statement after the `super` call,
    // rather than after the end of it. Otherwise the string buffering implementation may drop
    // the text if the statement after the `super` call is being deleted. This appears to be because
    // the full start of the next statement appears to always be the end of the `super` call plus 1.
    const nextStatement = getNextPreservedStatement(superCall, removedStatements);
    tracker.insertText(
      sourceFile,
      nextStatement ? nextStatement.getFullStart() : constructor.getEnd() - 1,
      `\n${afterSuper.join('\n')}\n` + (nextStatement ? '' : memberIndentation),
    );
  }

  // Need to resolve this once all constructor signatures have been removed.
  const memberReference = node.members.find((m) => !removedMembers.has(m)) || node.members[0];

  // If `backwardsCompatibleConstructors` is enabled, we maintain
  // backwards compatibility by adding a catch-all signature.
  if (options.backwardsCompatibleConstructors) {
    const extraSignature =
      `\n${memberIndentation}/** Inserted by Angular inject() migration for backwards compatibility */\n` +
      `${memberIndentation}constructor(...args: unknown[]);`;

    // The new signature always has to be right before the constructor implementation.
    if (memberReference === constructor) {
      prependToClass.push(extraSignature);
    } else {
      tracker.insertText(sourceFile, constructor.getFullStart(), '\n' + extraSignature);
    }
  }

  // Push the block of code that should appear after the `inject`
  // calls now once all the members have been generated.
  prependToClass.push(...afterInjectCalls);

  if (prependToClass.length > 0) {
    if (removedMembers.size === node.members.length) {
      tracker.insertText(
        sourceFile,
        // If all members were deleted, insert after the last one.
        // This allows us to preserve the indentation.
        node.members.length > 0
          ? node.members[node.members.length - 1].getEnd() + 1
          : node.getEnd() - 1,
        `${prependToClass.join('\n')}\n`,
      );
    } else {
      // Insert the new properties after the first member that hasn't been deleted.
      tracker.insertText(
        sourceFile,
        memberReference.getFullStart(),
        `\n${prependToClass.join('\n')}\n`,
      );
    }
  }
}

interface ParameterMigrationContext<T extends ts.Node = ts.ParameterDeclaration> {
  node: T;
  options: MigrationOptions;
  localTypeChecker: ts.TypeChecker;
  printer: ts.Printer;
  tracker: ChangeTracker;
  superCall: ts.CallExpression | null;
  usedInSuper: boolean;
  usedInConstructor: boolean;
  usesOtherParams: boolean;
  memberIndentation: string;
  innerIndentation: string;
  prependToConstructor: string[];
  propsToAdd: string[];
  afterSuper: string[];
}

/**
 * Migrates a single parameter to `inject()` DI.
 * @param node Parameter to be migrated.
 * @param options Options used to configure the migration.
 * @param localTypeChecker Type checker set up for the specific file.
 * @param printer Printer used to output AST nodes as strings.
 * @param tracker Object keeping track of the changes made to the file.
 * @param superCall Call to `super()` from the class' constructor.
 * @param usedInSuper Whether the parameter is referenced inside of `super`.
 * @param usedInConstructor Whether the parameter is referenced inside the body of the constructor.
 * @param memberIndentation Indentation string to use when inserting new class members.
 * @param innerIndentation Indentation string to use when inserting new constructor statements.
 * @param prependToConstructor Statements to be prepended to the constructor.
 * @param propsToAdd Properties to be added to the class.
 * @param afterSuper Statements to be added after the `super` call.
 */
function migrateParameter(
  node: ts.ParameterDeclaration,
  options: MigrationOptions,
  localTypeChecker: ts.TypeChecker,
  printer: ts.Printer,
  tracker: ChangeTracker,
  superCall: ts.CallExpression | null,
  usedInSuper: boolean,
  usedInConstructor: boolean,
  usesOtherParams: boolean,
  memberIndentation: string,
  innerIndentation: string,
  prependToConstructor: string[],
  propsToAdd: string[],
  afterSuper: string[],
): void {
  const context: ParameterMigrationContext = {
    node,
    options,
    localTypeChecker,
    printer,
    tracker,
    superCall,
    usedInSuper,
    usedInConstructor,
    usesOtherParams,
    memberIndentation,
    innerIndentation,
    prependToConstructor,
    propsToAdd,
    afterSuper,
  };

  if (ts.isIdentifier(node.name)) {
    migrateIdentifierParameter(context, node.name);
  } else if (ts.isObjectBindingPattern(node.name)) {
    migrateObjectBindingParameter(context, node.name);
  } else {
    return;
  }
}

function migrateIdentifierParameter(context: ParameterMigrationContext, name: ts.Identifier): void {
  const {node, options, localTypeChecker, printer, tracker, usedInConstructor, usesOtherParams} =
    context;

  const replacementCall = createInjectReplacementCall(
    node,
    options,
    localTypeChecker,
    printer,
    tracker,
  );
  const declaresProp = parameterDeclaresProperty(node);

  // If the parameter declares a property, we need to declare it (e.g. `private foo: Foo`).
  if (declaresProp) {
    handlePropertyDeclaration(context, name, replacementCall);
  }

  // If the parameter is referenced within the constructor, we need to declare it as a variable.
  if (usedInConstructor) {
    handleConstructorUsage(context, name.text, replacementCall, declaresProp);
  } else if (usesOtherParams && declaresProp) {
    handleParameterWithDependencies(context, name.text, replacementCall);
  }
}

function handlePropertyDeclaration(
  context: ParameterMigrationContext,
  name: ts.Identifier,
  replacementCall: string,
): void {
  const {node, memberIndentation, propsToAdd} = context;

  const canInitialize = !context.usedInSuper && !context.usesOtherParams;
  const prop = ts.factory.createPropertyDeclaration(
    cloneModifiers(
      node.modifiers?.filter((modifier) => {
        return !ts.isDecorator(modifier) && modifier.kind !== ts.SyntaxKind.PublicKeyword;
      }),
    ),
    name,
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword)
      ? undefined
      : node.questionToken,
    canInitialize ? undefined : node.type,
    canInitialize ? ts.factory.createIdentifier(PLACEHOLDER) : undefined,
  );

  propsToAdd.push(
    memberIndentation +
      replaceNodePlaceholder(node.getSourceFile(), prop, replacementCall, context.printer),
  );
}

function handleConstructorUsage(
  context: ParameterMigrationContext,
  name: string,
  replacementCall: string,
  declaresProp: boolean,
): void {
  const {innerIndentation, prependToConstructor, afterSuper, superCall} = context;

  if (context.usedInSuper) {
    // Usages of `this` aren't allowed before `super` calls so we need to
    // create a variable which calls `inject()` directly instead...
    prependToConstructor.push(`${innerIndentation}const ${name} = ${replacementCall};`);

    if (declaresProp) {
      afterSuper.push(`${innerIndentation}this.${name} = ${name};`);
    }
  } else if (declaresProp) {
    // If the parameter declares a property (`private foo: foo`) and is used inside the class
    // at the same time, we need to ensure that it's initialized to the value from the variable
    // and that we only reference `this` after the `super` call.
    const initializer = `${innerIndentation}const ${name} = this.${name};`;

    if (superCall === null) {
      prependToConstructor.push(initializer);
    } else {
      afterSuper.push(initializer);
    }
  } else {
    // If the parameter is only referenced in the constructor, we
    // don't need to declare any new properties.
    prependToConstructor.push(`${innerIndentation}const ${name} = ${replacementCall};`);
  }
}

function handleParameterWithDependencies(
  context: ParameterMigrationContext,
  name: string,
  replacementCall: string,
): void {
  const {innerIndentation, prependToConstructor, afterSuper, superCall} = context;

  const toAdd = `${innerIndentation}this.${name} = ${replacementCall};`;

  if (superCall === null) {
    prependToConstructor.push(toAdd);
  } else {
    afterSuper.push(toAdd);
  }
}

function migrateObjectBindingParameter(
  context: ParameterMigrationContext,
  bindingPattern: ts.ObjectBindingPattern,
): void {
  const {node, options, localTypeChecker, printer, tracker} = context;

  const replacementCall = createInjectReplacementCall(
    node,
    options,
    localTypeChecker,
    printer,
    tracker,
  );

  for (const element of bindingPattern.elements) {
    if (ts.isBindingElement(element) && ts.isIdentifier(element.name)) {
      migrateBindingElement(context, element, element.name, replacementCall);
    }
  }
}

function migrateBindingElement(
  context: ParameterMigrationContext,
  element: ts.BindingElement,
  elementName: ts.Identifier,
  replacementCall: string,
): void {
  const propertyName = elementName.text;

  // Determines how to access the property
  const propertyAccess = element.propertyName
    ? `${replacementCall}.${element.propertyName.getText()}`
    : `${replacementCall}.${propertyName}`;

  createPropertyForBindingElement(context, propertyName, propertyAccess);

  if (context.usedInConstructor) {
    handleConstructorUsageBindingElement(context, element, propertyName);
  }
}

function handleConstructorUsageBindingElement(
  context: ParameterMigrationContext,
  element: ts.BindingElement,
  propertyName: string,
): void {
  const {tracker, localTypeChecker, node: paramNode} = context;
  const constructorDecl = paramNode.parent;

  // Check in constructor or exist body content
  if (!ts.isConstructorDeclaration(constructorDecl) || !constructorDecl.body) {
    return;
  }

  // Get the unique "symbol" for our unstructured property.
  const symbol = localTypeChecker.getSymbolAtLocation(element.name);
  if (!symbol) {
    return;
  }

  // Visit recursive function navigate constructor
  const visit = (node: ts.Node) => {
    // Check if current node is identifier (variable)
    if (ts.isIdentifier(node)) {
      // Using the type checker, verify that this identifier refers
      // exactly to our destructured parameter and is not the node of the original declaration.
      if (localTypeChecker.getSymbolAtLocation(node) === symbol && node !== element.name) {
        // If the identifier is used as a shorthand property in an object literal (e.g., { myVar }),
        // must replace the entire `ShorthandPropertyAssignment` node
        // with a `PropertyAssignment` (e.g., myVar: this.myVar).
        if (ts.isShorthandPropertyAssignment(node.parent)) {
          tracker.replaceNode(
            node.parent,
            ts.factory.createPropertyAssignment(
              node,
              ts.factory.createPropertyAccessExpression(ts.factory.createThis(), propertyName),
            ),
          );
        } else {
          // Otherwise, replace the identifier with `this.propertyName`.
          tracker.replaceNode(
            node,
            ts.factory.createPropertyAccessExpression(ts.factory.createThis(), propertyName),
          );
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(constructorDecl.body);
}

function createPropertyForBindingElement(
  context: ParameterMigrationContext,
  propertyName: string,
  propertyAccess: string,
): void {
  const {node, memberIndentation, propsToAdd} = context;

  const prop = ts.factory.createPropertyDeclaration(
    cloneModifiers(
      node.modifiers?.filter((modifier) => {
        return !ts.isDecorator(modifier) && modifier.kind !== ts.SyntaxKind.PublicKeyword;
      }),
    ),
    propertyName,
    node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword)
      ? undefined
      : node.questionToken,
    undefined,
    ts.factory.createIdentifier(PLACEHOLDER),
  );

  propsToAdd.push(
    memberIndentation +
      replaceNodePlaceholder(node.getSourceFile(), prop, propertyAccess, context.printer),
  );
}

/**
 * Creates a replacement `inject` call from a function parameter.
 * @param param Parameter for which to generate the `inject` call.
 * @param options Options used to configure the migration.
 * @param localTypeChecker Type checker set up for the specific file.
 * @param printer Printer used to output AST nodes as strings.
 * @param tracker Object keeping track of the changes made to the file.
 */
function createInjectReplacementCall(
  param: ts.ParameterDeclaration,
  options: MigrationOptions,
  localTypeChecker: ts.TypeChecker,
  printer: ts.Printer,
  tracker: ChangeTracker,
): string {
  const moduleName = '@angular/core';
  const sourceFile = param.getSourceFile();
  const decorators = getAngularDecorators(localTypeChecker, ts.getDecorators(param) || []);
  const literalProps = new Set<string>();
  const type = param.type;
  let injectedType = '';
  let typeArguments = type && hasGenerics(type) ? [type] : undefined;
  let hasOptionalDecorator = false;

  if (type) {
    // Remove the type arguments from generic type references, because
    // they'll be specified as type arguments to `inject()`.
    if (ts.isTypeReferenceNode(type) && type.typeArguments && type.typeArguments.length > 0) {
      injectedType = type.typeName.getText();
    } else if (ts.isUnionTypeNode(type)) {
      injectedType = (type.types.find((t) => !ts.isLiteralTypeNode(t)) || type.types[0]).getText();
    } else {
      injectedType = type.getText();
    }
  }

  for (const decorator of decorators) {
    if (decorator.moduleName !== moduleName) {
      continue;
    }

    const firstArg = decorator.node.expression.arguments[0] as ts.Expression | undefined;

    switch (decorator.name) {
      case 'Inject':
        if (firstArg) {
          const injectResult = migrateInjectDecorator(firstArg, type, localTypeChecker);
          injectedType = injectResult.injectedType;
          if (injectResult.typeArguments) {
            typeArguments = injectResult.typeArguments;
          }
        }
        break;

      case 'Attribute':
        if (firstArg) {
          const constructorRef = tracker.addImport(sourceFile, 'HostAttributeToken', moduleName);
          const expression = ts.factory.createNewExpression(constructorRef, undefined, [firstArg]);
          injectedType = printer.printNode(ts.EmitHint.Unspecified, expression, sourceFile);
          typeArguments = undefined;
          // @Attribute is implicitly optional.
          hasOptionalDecorator = true;
          literalProps.add('optional');
        }
        break;

      case 'Optional':
        hasOptionalDecorator = true;
        literalProps.add('optional');
        break;

      case 'SkipSelf':
        literalProps.add('skipSelf');
        break;

      case 'Self':
        literalProps.add('self');
        break;

      case 'Host':
        literalProps.add('host');
        break;
    }
  }

  // The injected type might be a `TypeNode` which we can't easily convert into an `Expression`.
  // Since the value gets passed through directly anyway, we generate the call using a placeholder
  // which we then replace with the raw text of the `TypeNode`.
  const injectRef = tracker.addImport(param.getSourceFile(), 'inject', moduleName);
  const args: ts.Expression[] = [ts.factory.createIdentifier(PLACEHOLDER)];

  if (literalProps.size > 0) {
    args.push(
      ts.factory.createObjectLiteralExpression(
        Array.from(literalProps, (prop) =>
          ts.factory.createPropertyAssignment(prop, ts.factory.createTrue()),
        ),
      ),
    );
  }

  let expression: ts.Expression = ts.factory.createCallExpression(injectRef, typeArguments, args);

  if (hasOptionalDecorator && options.nonNullableOptional) {
    const hasNullableType =
      param.questionToken != null || (param.type != null && isNullableType(param.type));

    // Only wrap the expression if the type wasn't already nullable.
    // If it was, the app was likely accounting for it already.
    if (!hasNullableType) {
      expression = ts.factory.createNonNullExpression(expression);
    }
  }

  // If the parameter is initialized, add the initializer as a fallback.
  if (param.initializer) {
    expression = ts.factory.createBinaryExpression(
      expression,
      ts.SyntaxKind.QuestionQuestionToken,
      param.initializer,
    );
  }

  return replaceNodePlaceholder(param.getSourceFile(), expression, injectedType, printer);
}

/**
 * Migrates a parameter based on its `@Inject()` decorator.
 * @param firstArg First argument to `@Inject()`.
 * @param type Type of the parameter.
 * @param localTypeChecker Type checker set up for the specific file.
 */
function migrateInjectDecorator(
  firstArg: ts.Expression,
  type: ts.TypeNode | undefined,
  localTypeChecker: ts.TypeChecker,
) {
  let injectedType = firstArg.getText();
  let typeArguments: ts.TypeNode[] | null = null;

  // `inject` no longer officially supports string injection so we need
  // to cast to any. We maintain the type by passing it as a generic.
  if (ts.isStringLiteralLike(firstArg) || isStringType(firstArg, localTypeChecker)) {
    typeArguments = [type || ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)];
    injectedType += ' as any';
  } else if (
    ts.isCallExpression(firstArg) &&
    ts.isIdentifier(firstArg.expression) &&
    firstArg.arguments.length === 1
  ) {
    const callImport = getImportOfIdentifier(localTypeChecker, firstArg.expression);
    const arrowFn = firstArg.arguments[0];

    // If the first parameter is a `forwardRef`, unwrap it for a more
    // accurate type and because it's no longer necessary.
    if (
      callImport !== null &&
      callImport.name === 'forwardRef' &&
      callImport.importModule === '@angular/core' &&
      ts.isArrowFunction(arrowFn)
    ) {
      if (ts.isBlock(arrowFn.body)) {
        const returnStatement = arrowFn.body.statements.find((stmt) => ts.isReturnStatement(stmt));

        if (returnStatement && returnStatement.expression) {
          injectedType = returnStatement.expression.getText();
        }
      } else {
        injectedType = arrowFn.body.getText();
      }
    }
  } else if (
    type &&
    (ts.isTypeReferenceNode(type) ||
      ts.isTypeLiteralNode(type) ||
      ts.isTupleTypeNode(type) ||
      (ts.isUnionTypeNode(type) && type.types.some(ts.isTypeReferenceNode)))
  ) {
    typeArguments = [type];
  }

  return {injectedType, typeArguments};
}

/**
 * Removes the parameters from a constructor. This is a bit more complex than just replacing an AST
 * node, because `NodeArray.pos` includes any leading whitespace, but `NodeArray.end` does **not**
 * include trailing whitespace. Since we want to produce somewhat formatted code, we need to find
 * the end of the arguments ourselves. We do it by finding the next parenthesis after the last
 * parameter.
 * @param node Constructor from which to remove the parameters.
 * @param tracker Object keeping track of the changes made to the file.
 */
function stripConstructorParameters(node: ts.ConstructorDeclaration, tracker: ChangeTracker): void {
  if (node.parameters.length === 0) {
    return;
  }

  const constructorText = node.getText();
  const lastParamText = node.parameters[node.parameters.length - 1].getText();
  const lastParamStart = constructorText.indexOf(lastParamText);

  // This shouldn't happen, but bail out just in case so we don't mangle the code.
  if (lastParamStart === -1) {
    return;
  }

  for (let i = lastParamStart + lastParamText.length; i < constructorText.length; i++) {
    const char = constructorText[i];

    if (char === ')') {
      tracker.replaceText(
        node.getSourceFile(),
        node.parameters.pos,
        node.getStart() + i - node.parameters.pos,
        '',
      );
      break;
    }
  }
}

/**
 * Creates a type checker scoped to a specific file.
 * @param sourceFile File for which to create the type checker.
 */
function getLocalTypeChecker(sourceFile: ts.SourceFile) {
  const options: ts.CompilerOptions = {noEmit: true, skipLibCheck: true};
  const host = ts.createCompilerHost(options);
  host.getSourceFile = (fileName) => (fileName === sourceFile.fileName ? sourceFile : undefined);
  const program = ts.createProgram({
    rootNames: [sourceFile.fileName],
    options,
    host,
  });

  return program.getTypeChecker();
}

/**
 * Prints out an AST node and replaces the placeholder inside of it.
 * @param sourceFile File in which the node will be inserted.
 * @param node Node to be printed out.
 * @param replacement Replacement for the placeholder.
 * @param printer Printer used to output AST nodes as strings.
 */
function replaceNodePlaceholder(
  sourceFile: ts.SourceFile,
  node: ts.Node,
  replacement: string,
  printer: ts.Printer,
): string {
  const result = printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  return result.replace(PLACEHOLDER, replacement);
}

/**
 * Clones an optional array of modifiers. Can be useful to
 * strip the comments from a node with modifiers.
 */
function cloneModifiers(modifiers: ts.ModifierLike[] | ts.NodeArray<ts.ModifierLike> | undefined) {
  return modifiers?.map((modifier) => {
    return ts.isDecorator(modifier)
      ? ts.factory.createDecorator(modifier.expression)
      : ts.factory.createModifier(modifier.kind);
  });
}

/**
 * Clones the name of a property. Can be useful to strip away
 * the comments of a property without modifiers.
 */
function cloneName(node: ts.PropertyName): ts.PropertyName {
  switch (node.kind) {
    case ts.SyntaxKind.Identifier:
      return ts.factory.createIdentifier(node.text);
    case ts.SyntaxKind.StringLiteral:
      return ts.factory.createStringLiteral(node.text, node.getText()[0] === `'`);
    case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
      return ts.factory.createNoSubstitutionTemplateLiteral(node.text, node.rawText);
    case ts.SyntaxKind.NumericLiteral:
      return ts.factory.createNumericLiteral(node.text);
    case ts.SyntaxKind.ComputedPropertyName:
      return ts.factory.createComputedPropertyName(node.expression);
    case ts.SyntaxKind.PrivateIdentifier:
      return ts.factory.createPrivateIdentifier(node.text);
    default:
      return node;
  }
}

/**
 * Determines whether it's safe to delete a class constructor.
 * @param options Options used to configure the migration.
 * @param constructor Node representing the constructor.
 * @param removedStatementCount Number of statements that were removed by the migration.
 * @param prependToConstructor Statements that should be prepended to the constructor.
 * @param superCall Node representing the `super()` call within the constructor.
 */
function canRemoveConstructor(
  options: MigrationOptions,
  constructor: ts.ConstructorDeclaration,
  removedStatementCount: number,
  prependToConstructor: string[],
  superCall: ts.CallExpression | null,
): boolean {
  if (options.backwardsCompatibleConstructors || prependToConstructor.length > 0) {
    return false;
  }

  const statementCount = constructor.body
    ? constructor.body.statements.length - removedStatementCount
    : 0;

  return (
    statementCount === 0 ||
    (statementCount === 1 && superCall !== null && superCall.arguments.length === 0)
  );
}

/**
 * Gets the next statement after a node that *won't* be deleted by the migration.
 * @param startNode Node from which to start the search.
 * @param removedStatements Statements that have been removed by the migration.
 * @returns
 */
function getNextPreservedStatement(
  startNode: ts.Node,
  removedStatements: Set<ts.Statement>,
): ts.Statement | null {
  const body = closestNode(startNode, ts.isBlock);
  const closestStatement = closestNode(startNode, ts.isStatement);
  if (body === null || closestStatement === null) {
    return null;
  }

  const index = body.statements.indexOf(closestStatement);
  if (index === -1) {
    return null;
  }

  for (let i = index + 1; i < body.statements.length; i++) {
    if (!removedStatements.has(body.statements[i])) {
      return body.statements[i];
    }
  }

  return null;
}

/**
 * Applies the internal-specific migrations to a class.
 * @param node Class being migrated.
 * @param constructor The migrated class' constructor.
 * @param localTypeChecker File-specific type checker.
 * @param tracker Object keeping track of the changes.
 * @param printer Printer used to output AST nodes as text.
 * @param removedStatements Statements that have been removed by the migration.
 * @param removedMembers Class members that have been removed by the migration.
 * @param prependToClass Text that will be prepended to a class.
 * @param afterInjectCalls Text that will be inserted after the newly-added `inject` calls.
 * @param memberIndentation Indentation string of the class' members.
 */
function applyInternalOnlyChanges(
  node: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
  tracker: ChangeTracker,
  printer: ts.Printer,
  removedStatements: Set<ts.Statement>,
  removedMembers: Set<ts.ClassElement>,
  prependToClass: string[],
  afterInjectCalls: string[],
  memberIndentation: string,
  options: MigrationOptions,
) {
  const result = findUninitializedPropertiesToCombine(node, constructor, localTypeChecker, options);

  if (result === null) {
    return;
  }

  const preserveInitOrder = shouldCombineInInitializationOrder(result.toCombine, constructor);

  // Sort the combined members based on the declaration order of their initializers, only if
  // we've determined that would be safe. Note that `Array.prototype.sort` is in-place so we
  // can just call it conditionally here.
  if (preserveInitOrder) {
    result.toCombine.sort((a, b) => a.initializer.getStart() - b.initializer.getStart());
  }

  result.toCombine.forEach(({declaration, initializer}) => {
    const initializerStatement = closestNode(initializer, ts.isStatement);

    // Strip comments if we are just going modify the node in-place.
    const modifiers = preserveInitOrder
      ? declaration.modifiers
      : cloneModifiers(declaration.modifiers);
    const name = preserveInitOrder ? declaration.name : cloneName(declaration.name);

    const newProperty = ts.factory.createPropertyDeclaration(
      modifiers,
      name,
      declaration.questionToken,
      declaration.type,
      undefined,
    );

    const propText = printer.printNode(
      ts.EmitHint.Unspecified,
      newProperty,
      declaration.getSourceFile(),
    );
    const initializerText = replaceParameterReferencesInInitializer(
      initializer,
      constructor,
      localTypeChecker,
    );
    const withInitializer = `${propText.slice(0, -1)} = ${initializerText};`;

    // If the initialization order is being preserved, we have to remove the original
    // declaration and re-declare it. Otherwise we can do the replacement in-place.
    if (preserveInitOrder) {
      tracker.removeNode(declaration, true);
      removedMembers.add(declaration);
      afterInjectCalls.push(memberIndentation + withInitializer);
    } else {
      const sourceFile = declaration.getSourceFile();
      tracker.replaceText(
        sourceFile,
        declaration.getStart(),
        declaration.getWidth(),
        withInitializer,
      );
    }

    // This should always be defined, but null check it just in case.
    if (initializerStatement) {
      tracker.removeNode(initializerStatement, true);
      removedStatements.add(initializerStatement);
    }
  });

  result.toHoist.forEach((decl) => {
    prependToClass.push(
      memberIndentation + printer.printNode(ts.EmitHint.Unspecified, decl, decl.getSourceFile()),
    );
    tracker.removeNode(decl, true);
    removedMembers.add(decl);
  });

  // If we added any hoisted properties, separate them visually with a new line.
  if (prependToClass.length > 0) {
    prependToClass.push('');
  }
}

function replaceParameterReferencesInInitializer(
  initializer: ts.Expression,
  constructor: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
): string {
  // 1. Collect the locations of identifier nodes that reference constructor parameters.
  // 2. Add `this.` to those locations.
  const insertLocations = [0];

  function walk(node: ts.Node) {
    if (
      ts.isIdentifier(node) &&
      !(ts.isPropertyAccessExpression(node.parent) && node === node.parent.name) &&
      localTypeChecker
        .getSymbolAtLocation(node)
        ?.declarations?.some((decl) =>
          constructor.parameters.includes(decl as ts.ParameterDeclaration),
        )
    ) {
      insertLocations.push(node.getStart() - initializer.getStart());
    }
    ts.forEachChild(node, walk);
  }
  walk(initializer);

  const initializerText = initializer.getText();
  insertLocations.push(initializerText.length);

  insertLocations.sort((a, b) => a - b);

  const result: string[] = [];
  for (let i = 0; i < insertLocations.length - 1; i++) {
    result.push(initializerText.slice(insertLocations[i], insertLocations[i + 1]));
  }

  return result.join('this.');
}

function isStringType(node: ts.Expression, checker: ts.TypeChecker): boolean {
  const type = checker.getTypeAtLocation(node);

  // stringLiteral here is to cover const strings inferred as literal type.
  return !!(type.flags & ts.TypeFlags.String || type.flags & ts.TypeFlags.StringLiteral);
}
