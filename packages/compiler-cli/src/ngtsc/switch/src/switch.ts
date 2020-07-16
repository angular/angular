/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

const IVY_SWITCH_PRE_SUFFIX = '__PRE_R3__';
const IVY_SWITCH_POST_SUFFIX = '__POST_R3__';

export function ivySwitchTransform(_: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  return flipIvySwitchInFile;
}

function flipIvySwitchInFile(sf: ts.SourceFile): ts.SourceFile {
  // To replace the statements array, it must be copied. This only needs to happen if a statement
  // must actually be replaced within the array, so the newStatements array is lazily initialized.
  let newStatements: ts.Statement[]|undefined = undefined;

  // Iterate over the statements in the file.
  for (let i = 0; i < sf.statements.length; i++) {
    const statement = sf.statements[i];

    // Skip over everything that isn't a variable statement.
    if (!ts.isVariableStatement(statement) || !hasIvySwitches(statement)) {
      continue;
    }

    // This statement needs to be replaced. Check if the newStatements array needs to be lazily
    // initialized to a copy of the original statements.
    if (newStatements === undefined) {
      newStatements = [...sf.statements];
    }

    // Flip any switches in the VariableStatement. If there were any, a new statement will be
    // returned; otherwise the old statement will be.
    newStatements[i] = flipIvySwitchesInVariableStatement(statement, sf.statements);
  }

  // Only update the statements in the SourceFile if any have changed.
  if (newStatements !== undefined) {
    return ts.updateSourceFileNode(sf, newStatements);
  }
  return sf;
}

/**
 * Look for the ts.Identifier of a ts.Declaration with this name.
 *
 * The real identifier is needed (rather than fabricating one) as TypeScript decides how to
 * reference this identifier based on information stored against its node in the AST, which a
 * synthetic node would not have. In particular, since the post-switch variable is often exported,
 * TypeScript needs to know this so it can write `exports.VAR` instead of just `VAR` when emitting
 * code.
 *
 * Only variable, function, and class declarations are currently searched.
 */
function findPostSwitchIdentifier(
    statements: ReadonlyArray<ts.Statement>, name: string): ts.Identifier|null {
  for (const stmt of statements) {
    if (ts.isVariableStatement(stmt)) {
      const decl = stmt.declarationList.declarations.find(
          decl => ts.isIdentifier(decl.name) && decl.name.text === name);
      if (decl !== undefined) {
        return decl.name as ts.Identifier;
      }
    } else if (ts.isFunctionDeclaration(stmt) || ts.isClassDeclaration(stmt)) {
      if (stmt.name !== undefined && ts.isIdentifier(stmt.name) && stmt.name.text === name) {
        return stmt.name;
      }
    }
  }
  return null;
}

/**
 * Flip any Ivy switches which are discovered in the given ts.VariableStatement.
 */
function flipIvySwitchesInVariableStatement(
    stmt: ts.VariableStatement, statements: ReadonlyArray<ts.Statement>): ts.VariableStatement {
  // Build a new list of variable declarations. Specific declarations that are initialized to a
  // pre-switch identifier will be replaced with a declaration initialized to the post-switch
  // identifier.
  const newDeclarations = [...stmt.declarationList.declarations];
  for (let i = 0; i < newDeclarations.length; i++) {
    const decl = newDeclarations[i];

    // Skip declarations that aren't initialized to an identifier.
    if (decl.initializer === undefined || !ts.isIdentifier(decl.initializer)) {
      continue;
    }

    // Skip declarations that aren't Ivy switches.
    if (!decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX)) {
      continue;
    }

    // Determine the name of the post-switch variable.
    const postSwitchName =
        decl.initializer.text.replace(IVY_SWITCH_PRE_SUFFIX, IVY_SWITCH_POST_SUFFIX);

    // Find the post-switch variable identifier. If one can't be found, it's an error. This is
    // reported as a thrown error and not a diagnostic as transformers cannot output diagnostics.
    const newIdentifier = findPostSwitchIdentifier(statements, postSwitchName);
    if (newIdentifier === null) {
      throw new Error(`Unable to find identifier ${postSwitchName} in ${
          stmt.getSourceFile().fileName} for the Ivy switch.`);
    }

    newDeclarations[i] = ts.updateVariableDeclaration(
        /* node */ decl,
        /* name */ decl.name,
        /* type */ decl.type,
        /* initializer */ newIdentifier);
  }

  const newDeclList = ts.updateVariableDeclarationList(
      /* declarationList */ stmt.declarationList,
      /* declarations */ newDeclarations);

  const newStmt = ts.updateVariableStatement(
      /* statement */ stmt,
      /* modifiers */ stmt.modifiers,
      /* declarationList */ newDeclList);

  return newStmt;
}

/**
 * Check whether the given VariableStatement has any Ivy switch variables.
 */
function hasIvySwitches(stmt: ts.VariableStatement) {
  return stmt.declarationList.declarations.some(
      decl => decl.initializer !== undefined && ts.isIdentifier(decl.initializer) &&
          decl.initializer.text.endsWith(IVY_SWITCH_PRE_SUFFIX));
}
