/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {PendingChange, ChangeTracker} from '../../utils/change_tracker';
import {
  detectClassesUsingDI,
  getNodeIndentation,
  getSuperParameters,
  getConstructorUnusedParameters,
  hasGenerics,
  isNullableType,
  parameterDeclaresProperty,
} from './analysis';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {getImportOfIdentifier} from '../../utils/typescript/imports';

/**
 * Placeholder used to represent expressions inside the AST.
 * Includes Unicode characters to reduce the chance of collisions.
 */
const PLACEHOLDER = 'ɵɵngGeneratePlaceholderɵɵ';

/** Options that can be used to configure the migration. */
export interface MigrationOptions {
  /** Whether to generate code that keeps injectors backwards compatible. */
  backwardsCompatibleConstructors: boolean;

  /** Whether to migrate abstract classes. */
  migrateAbstractClasses: boolean;

  /** Whether to make the return type of `@Optinal()` parameters to be non-nullable. */
  nonNullableOptional: boolean;
}

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
  const printer = ts.createPrinter();
  const tracker = new ChangeTracker(printer);

  detectClassesUsingDI(sourceFile, localTypeChecker).forEach((result) => {
    migrateClass(
      result.node,
      result.constructor,
      result.superCall,
      options,
      localTypeChecker,
      printer,
      tracker,
    );
  });

  return tracker.recordChanges().get(sourceFile) || [];
}

/**
 * Migrates a class away from constructor injection.
 * @param node Class to be migrated.
 * @param constructor Reference to the class' constructor node.
 * @param superCall Reference to the constructor's `super()` call, if any.
 * @param options Options used to configure the migration.
 * @param localTypeChecker Type checker set up for the specific file.
 * @param printer Printer used to output AST nodes as strings.
 * @param tracker Object keeping track of the changes made to the file.
 */
function migrateClass(
  node: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  superCall: ts.CallExpression | null,
  options: MigrationOptions,
  localTypeChecker: ts.TypeChecker,
  printer: ts.Printer,
  tracker: ChangeTracker,
): void {
  const isAbstract = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);

  // Don't migrate abstract classes by default, because
  // their parameters aren't guaranteed to be injectable.
  if (isAbstract && !options.migrateAbstractClasses) {
    return;
  }

  const sourceFile = node.getSourceFile();
  const unusedParameters = getConstructorUnusedParameters(constructor, localTypeChecker);
  const superParameters = superCall
    ? getSuperParameters(constructor, superCall, localTypeChecker)
    : null;
  const memberIndentation = getNodeIndentation(node.members[0]);
  const innerReference = superCall || constructor.body?.statements[0] || constructor;
  const innerIndentation = getNodeIndentation(innerReference);
  const propsToAdd: string[] = [];
  const prependToConstructor: string[] = [];
  const afterSuper: string[] = [];
  const removedMembers = new Set<ts.ClassElement>();

  for (const param of constructor.parameters) {
    const usedInSuper = superParameters !== null && superParameters.has(param);
    const usedInConstructor = !unusedParameters.has(param);

    migrateParameter(
      param,
      options,
      localTypeChecker,
      printer,
      tracker,
      superCall,
      usedInSuper,
      usedInConstructor,
      memberIndentation,
      innerIndentation,
      prependToConstructor,
      propsToAdd,
      afterSuper,
    );
  }

  // Delete all of the constructor overloads since below we're either going to
  // remove the implementation, or we're going to delete all of the parameters.
  for (const member of node.members) {
    if (ts.isConstructorDeclaration(member) && member !== constructor) {
      removedMembers.add(member);
      tracker.replaceText(sourceFile, member.getFullStart(), member.getFullWidth(), '');
    }
  }

  if (
    !options.backwardsCompatibleConstructors &&
    (!constructor.body || constructor.body.statements.length === 0)
  ) {
    // Drop the constructor if it was empty.
    removedMembers.add(constructor);
    tracker.replaceText(sourceFile, constructor.getFullStart(), constructor.getFullWidth(), '');
  } else {
    // If the constructor contains any statements, only remove the parameters.
    // We always do this no matter what is passed into `backwardsCompatibleConstructors`.
    stripConstructorParameters(constructor, tracker);

    if (prependToConstructor.length > 0) {
      tracker.insertText(
        sourceFile,
        innerReference.getFullStart(),
        `\n${prependToConstructor.join('\n')}\n`,
      );
    }
  }

  if (afterSuper.length > 0 && superCall !== null) {
    tracker.insertText(sourceFile, superCall.getEnd() + 1, `\n${afterSuper.join('\n')}\n`);
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
      propsToAdd.push(extraSignature);
    } else {
      tracker.insertText(sourceFile, constructor.getFullStart(), '\n' + extraSignature);
    }
  }

  if (propsToAdd.length > 0) {
    if (removedMembers.size === node.members.length) {
      tracker.insertText(sourceFile, constructor.getEnd() + 1, `${propsToAdd.join('\n')}\n`);
    } else {
      // Insert the new properties after the first member that hasn't been deleted.
      tracker.insertText(
        sourceFile,
        memberReference.getFullStart(),
        `\n${propsToAdd.join('\n')}\n`,
      );
    }
  }
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
  memberIndentation: string,
  innerIndentation: string,
  prependToConstructor: string[],
  propsToAdd: string[],
  afterSuper: string[],
): void {
  if (!ts.isIdentifier(node.name)) {
    return;
  }

  const name = node.name.text;
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
    const prop = ts.factory.createPropertyDeclaration(
      node.modifiers?.filter((modifier) => {
        // Strip out the DI decorators, as well as `public` which is redundant.
        return !ts.isDecorator(modifier) && modifier.kind !== ts.SyntaxKind.PublicKeyword;
      }),
      name,
      undefined,
      // We can't initialize the property if it's referenced within a `super` call.
      // See the logic further below for the initialization.
      usedInSuper ? node.type : undefined,
      usedInSuper ? undefined : ts.factory.createIdentifier(PLACEHOLDER),
    );

    propsToAdd.push(
      memberIndentation +
        replaceNodePlaceholder(node.getSourceFile(), prop, replacementCall, printer),
    );
  }

  // If the parameter is referenced within the constructor, we need to declare it as a variable.
  if (usedInConstructor) {
    if (usedInSuper) {
      // Usages of `this` aren't allowed before `super` calls so we need to
      // create a variable which calls `inject()` directly instead...
      prependToConstructor.push(`${innerIndentation}const ${name} = ${replacementCall};`);

      // ...then we can initialize the property after the `super` call.
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
  const literalProps: ts.ObjectLiteralElementLike[] = [];
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
        }
        break;

      case 'Optional':
        hasOptionalDecorator = true;
        literalProps.push(ts.factory.createPropertyAssignment('optional', ts.factory.createTrue()));
        break;

      case 'SkipSelf':
        literalProps.push(ts.factory.createPropertyAssignment('skipSelf', ts.factory.createTrue()));
        break;

      case 'Self':
        literalProps.push(ts.factory.createPropertyAssignment('self', ts.factory.createTrue()));
        break;

      case 'Host':
        literalProps.push(ts.factory.createPropertyAssignment('host', ts.factory.createTrue()));
        break;
    }
  }

  // The injected type might be a `TypeNode` which we can't easily convert into an `Expression`.
  // Since the value gets passed through directly anyway, we generate the call using a placeholder
  // which we then replace with the raw text of the `TypeNode`.
  const injectRef = tracker.addImport(param.getSourceFile(), 'inject', moduleName);
  const args: ts.Expression[] = [ts.factory.createIdentifier(PLACEHOLDER)];

  if (literalProps.length > 0) {
    args.push(ts.factory.createObjectLiteralExpression(literalProps));
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
  if (ts.isStringLiteralLike(firstArg)) {
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
  const whitespacePattern = /\s/;
  let trailingCharacters = 0;

  if (lastParamStart > -1) {
    let lastParamEnd = lastParamStart + lastParamText.length;
    let closeParenIndex = -1;

    for (let i = lastParamEnd; i < constructorText.length; i++) {
      const char = constructorText[i];

      if (char === ')') {
        closeParenIndex = i;
        break;
      } else if (!whitespacePattern.test(char)) {
        // The end of the last parameter won't include
        // any trailing commas which we need to account for.
        lastParamEnd = i + 1;
      }
    }

    if (closeParenIndex > -1) {
      trailingCharacters = closeParenIndex - lastParamEnd;
    }
  }

  tracker.replaceText(
    node.getSourceFile(),
    node.parameters.pos,
    node.parameters.end - node.parameters.pos + trailingCharacters,
    '',
  );
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
