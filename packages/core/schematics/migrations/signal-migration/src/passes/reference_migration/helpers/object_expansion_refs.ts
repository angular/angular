/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  Replacement,
  TextUpdate,
  ProgramInfo,
  projectFile,
  ProjectFile,
} from '../../../../../../utils/tsurge';
import {getBindingElementDeclaration} from '../../../utils/binding_elements';
import {UniqueNamesGenerator} from '../../../utils/unique_names';
import assert from 'assert';
import {createNewBlockToInsertVariable} from './create_block_arrow_function';

/** An identifier part of a binding element. */
export interface IdentifierOfBindingElement extends ts.Identifier {
  parent: ts.BindingElement;
}

/**
 * Migrates a binding element that refers to an Angular input.
 *
 * E.g. `const {myInput} = this`.
 *
 * For references in binding elements, we extract the element into a variable
 * where we unwrap the input. This ensures narrowing naturally works in subsequent
 * places, and we also don't need to detect potential aliases.
 *
 * ```ts
 *   const {myInput} = this;
 *   // turns into
 *   const {myInput: myInputValue} = this;
 *   const myInput = myInputValue();
 * ```
 */
export function migrateBindingElementInputReference(
  tsReferencesInBindingElements: Set<IdentifierOfBindingElement>,
  info: ProgramInfo,
  replacements: Replacement[],
  printer: ts.Printer,
) {
  const nameGenerator = new UniqueNamesGenerator(['Input', 'Signal', 'Ref']);

  for (const reference of tsReferencesInBindingElements) {
    const bindingElement = reference.parent;
    const bindingDecl = getBindingElementDeclaration(bindingElement);

    const sourceFile = bindingElement.getSourceFile();
    const file = projectFile(sourceFile, info);

    const inputFieldName = bindingElement.propertyName ?? bindingElement.name;
    assert(
      !ts.isObjectBindingPattern(inputFieldName) && !ts.isArrayBindingPattern(inputFieldName),
      'Property of binding element cannot be another pattern.',
    );

    const tmpName: string | undefined = nameGenerator.generate(reference.text, bindingElement);
    // Only use the temporary name, if really needed. A temporary name is needed if
    // the input field simply aliased via the binding element, or if the exposed identifier
    // is a string-literal like.
    const useTmpNameForInputField =
      !ts.isObjectBindingPattern(bindingElement.name) || !ts.isIdentifier(inputFieldName);

    const propertyName = useTmpNameForInputField ? inputFieldName : undefined;
    const exposedName = useTmpNameForInputField
      ? ts.factory.createIdentifier(tmpName)
      : inputFieldName;
    const newBindingToAccessInputField = ts.factory.updateBindingElement(
      bindingElement,
      bindingElement.dotDotDotToken,
      propertyName,
      exposedName,
      bindingElement.initializer,
    );

    const temporaryVariableReplacements = insertTemporaryVariableForBindingElement(
      bindingDecl,
      file,
      `const ${bindingElement.name.getText()} = ${exposedName.text}();`,
    );
    if (temporaryVariableReplacements === null) {
      console.error(`Could not migrate reference ${reference.text} in ${file.rootRelativePath}`);
      continue;
    }

    replacements.push(
      new Replacement(
        file,
        new TextUpdate({
          position: bindingElement.getStart(),
          end: bindingElement.getEnd(),
          toInsert: printer.printNode(
            ts.EmitHint.Unspecified,
            newBindingToAccessInputField,
            sourceFile,
          ),
        }),
      ),
      ...temporaryVariableReplacements,
    );
  }
}

/**
 * Inserts the given code snippet after the given variable or
 * parameter declaration.
 *
 * If this is a parameter of an arrow function, a block may be
 * added automatically.
 */
function insertTemporaryVariableForBindingElement(
  expansionDecl: ts.VariableDeclaration | ts.ParameterDeclaration,
  file: ProjectFile,
  toInsert: string,
): Replacement[] | null {
  const sf = expansionDecl.getSourceFile();
  const parent = expansionDecl.parent;

  // The snippet is simply inserted after the variable declaration.
  // The other case of a variable declaration inside a catch clause is handled
  // below.
  if (ts.isVariableDeclaration(expansionDecl) && ts.isVariableDeclarationList(parent)) {
    const leadingSpaceCount = ts.getLineAndCharacterOfPosition(sf, parent.getStart()).character;
    const leadingSpace = ' '.repeat(leadingSpaceCount);
    const statement: ts.Statement = parent.parent;

    return [
      new Replacement(
        file,
        new TextUpdate({
          position: statement.getEnd(),
          end: statement.getEnd(),
          toInsert: `\n${leadingSpace}${toInsert}`,
        }),
      ),
    ];
  }

  // If we are dealing with a object expansion inside a parameter of
  // a function-like declaration w/ block, add the variable as the first
  // node inside the block.
  const bodyBlock = getBodyBlockOfNode(parent);
  if (bodyBlock !== null) {
    const firstElementInBlock = bodyBlock.statements[0] as ts.Statement | undefined;
    const spaceReferenceNode = firstElementInBlock ?? bodyBlock;
    const spaceOffset = firstElementInBlock !== undefined ? 0 : 2;

    const leadingSpaceCount =
      ts.getLineAndCharacterOfPosition(sf, spaceReferenceNode.getStart()).character + spaceOffset;
    const leadingSpace = ' '.repeat(leadingSpaceCount);

    return [
      new Replacement(
        file,
        new TextUpdate({
          position: bodyBlock.getStart() + 1,
          end: bodyBlock.getStart() + 1,
          toInsert: `\n${leadingSpace}${toInsert}`,
        }),
      ),
    ];
  }

  // Other cases where we see an arrow function without a block.
  // We need to create one now.
  if (ts.isArrowFunction(parent) && !ts.isBlock(parent.body)) {
    return createNewBlockToInsertVariable(parent, file, toInsert);
  }

  return null;
}

/** Gets the body block of a given node, if available. */
function getBodyBlockOfNode(node: ts.Node): ts.Block | null {
  if (
    (ts.isMethodDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isArrowFunction(node)) &&
    node.body !== undefined &&
    ts.isBlock(node.body)
  ) {
    return node.body;
  }
  if (ts.isCatchClause(node.parent)) {
    return node.parent.block;
  }
  return null;
}
