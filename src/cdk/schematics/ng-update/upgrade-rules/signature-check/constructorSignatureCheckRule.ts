/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green} from 'chalk';
import {RuleFailure, Rules, WalkContext} from 'tslint';
import * as ts from 'typescript';
import {ConstructorChecksUpgradeData} from '../../data/constructor-checks';
import {getAllChanges} from '../../upgrade-data';

/**
 * List of diagnostic codes that refer to pre-emit diagnostics which indicate invalid
 * new expression or super call signatures. See the list of diagnostics here:
 *
 * https://github.com/Microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json
 */
const signatureErrorDiagnostics = [
  // Type not assignable error diagnostic.
  2345,
  // Constructor argument length invalid diagnostics
  2554, 2555, 2556, 2557,
];

/**
 * Rule that visits every TypeScript new expression or super call and checks if the parameter
 * type signature is invalid and needs to be updated manually.
 */
export class Rule extends Rules.TypedRule {
  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    // Note that the data for this rule is not distinguished based on the target version because
    // we don't keep track of the new signature and don't want to update incrementally.
    // See: https://github.com/angular/material2/pull/12970#issuecomment-418337566
    const data = getAllChanges<ConstructorChecksUpgradeData>
        (this.getOptions().ruleArguments[1].constructorChecks);
    return this.applyWithFunction(sourceFile, visitSourceFile, data, program);
  }
}

/**
 * Function that will be called for each source file of the upgrade project. In order to properly
 * determine invalid constructor signatures, we take advantage of the pre-emit diagnostics from
 * TypeScript.
 *
 * By using the diagnostics we can properly respect type assignability because otherwise we
 * would need to rely on type equality checking which is too strict.
 * See related issue: https://github.com/Microsoft/TypeScript/issues/9879
 */
function visitSourceFile(context: WalkContext<ConstructorChecksUpgradeData[]>,
                         program: ts.Program) {
  // List of classes of which the constructor signature has changed.
  const signatureChangeData = context.options;
  const sourceFile = context.sourceFile;
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile)
    .filter(diagnostic => signatureErrorDiagnostics.includes(diagnostic.code))
    .filter(diagnostic => diagnostic.start !== undefined);

  for (const diagnostic of diagnostics) {
    const node = findConstructorNode(diagnostic, sourceFile);

    if (!node) {
      continue;
    }

    const classType = program.getTypeChecker().getTypeAtLocation(node.expression);
    const className = classType.symbol && classType.symbol.name;
    const isNewExpression = ts.isNewExpression(node);

    // Determine the class names of the actual construct signatures because we cannot assume
    // that the diagnostic refers to a constructor of the actual expression. In case the constructor
    // is inherited, we need to detect that the owner-class of the constructor is added to the
    // constructor checks upgrade data. e.g. `class CustomCalendar extends MatCalendar {}`.
    const signatureClassNames = classType.getConstructSignatures()
      .map(signature => getClassDeclarationOfSignature(signature))
      .map(declaration => declaration && declaration.name ? declaration.name.text : null)
      .filter(Boolean);

    // Besides checking the signature class names, we need to check the actual class name because
    // there can be classes without an explicit constructor.
    if (!signatureChangeData.includes(className) &&
        !signatureClassNames.some(name => signatureChangeData.includes(name!))) {
      continue;
    }

    const classSignatures = classType.getConstructSignatures()
      .map(signature => getParameterTypesFromSignature(signature, program));

    const expressionName = isNewExpression ? `new ${className}` : 'super';
    const signatures = classSignatures
      .map(signature => signature.map(t => program.getTypeChecker().typeToString(t)))
      .map(signature => `${expressionName}(${signature.join(', ')})`)
      .join(' or ');

    context.addFailureAtNode(node, `Found "${bold(className)}" constructed with ` +
      `an invalid signature. Please manually update the ${bold(expressionName)} expression to ` +
      `match the new signature${classSignatures.length > 1 ? 's' : ''}: ${green(signatures)}`);
  }
}

/** Resolves the type for each parameter in the specified signature. */
function getParameterTypesFromSignature(signature: ts.Signature, program: ts.Program): ts.Type[] {
  return signature.getParameters()
    .map(param => param.declarations[0] as ts.ParameterDeclaration)
    .map(node => node.type)
    .map(typeNode => program.getTypeChecker().getTypeFromTypeNode(typeNode!));
}

/**
 * Walks through each node of a source file in order to find a new-expression node or super-call
 * expression node that is captured by the specified diagnostic.
 */
function findConstructorNode(diagnostic: ts.Diagnostic, sourceFile: ts.SourceFile):
    ts.CallExpression | ts.NewExpression | null {

  let resolvedNode: ts.Node | null = null;

  const _visitNode = (node: ts.Node) => {
    // Check whether the current node contains the diagnostic. If the node contains the diagnostic,
    // walk deeper in order to find all constructor expression nodes.
    if (node.getStart() <= diagnostic.start! && node.getEnd() >= diagnostic.start!) {

      if (ts.isNewExpression(node) ||
         (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword)) {
        resolvedNode = node;
      }

      ts.forEachChild(node, _visitNode);
    }
  };

  ts.forEachChild(sourceFile, _visitNode);

  return resolvedNode;
}

/** Determines the class declaration of the specified construct signature. */
function getClassDeclarationOfSignature(signature: ts.Signature): ts.ClassDeclaration | null {
  let node: ts.Node = signature.getDeclaration();

  // Handle signatures which don't have an actual declaration. This happens if a class
  // does not have an explicitly written constructor.
  if (!node) {
    return null;
  }

  while (!ts.isSourceFile(node = node.parent)) {
    if (ts.isClassDeclaration(node)) {
      return node;
    }
  }

  return null;
}
