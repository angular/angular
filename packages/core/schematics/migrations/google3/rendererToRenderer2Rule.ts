/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, Rules} from 'tslint';
import * as ts from 'typescript';

import {getImportSpecifier, replaceImport} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';
import {getHelper, HelperFunction} from '../renderer-to-renderer2/helpers';
import {migrateExpression} from '../renderer-to-renderer2/migration';
import {findRendererReferences} from '../renderer-to-renderer2/util';

/**
 * TSLint rule that migrates from `Renderer` to `Renderer2`. More information on how it works:
 * https://hackmd.angular.io/UTzUZTnPRA-cSa_4mHyfYw
 */
export class Rule extends Rules.TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    const typeChecker = program.getTypeChecker();
    const printer = ts.createPrinter();
    const failures: RuleFailure[] = [];
    const rendererImportSpecifier = getImportSpecifier(sourceFile, '@angular/core', 'Renderer');
    const rendererImport = rendererImportSpecifier ?
        closestNode<ts.NamedImports>(rendererImportSpecifier, ts.SyntaxKind.NamedImports) :
        null;

    // If there are no imports for the `Renderer`, we can exit early.
    if (!rendererImportSpecifier || !rendererImport) {
      return failures;
    }

    const {typedNodes, methodCalls, forwardRefs} =
        findRendererReferences(sourceFile, typeChecker, rendererImportSpecifier);
    const helpersToAdd = new Set<HelperFunction>();

    failures.push(this._getNamedImportsFailure(rendererImport, sourceFile, printer));
    typedNodes.forEach(node => failures.push(this._getTypedNodeFailure(node, sourceFile)));
    forwardRefs.forEach(node => failures.push(this._getIdentifierNodeFailure(node, sourceFile)));

    methodCalls.forEach(call => {
      const {failure, requiredHelpers} =
          this._getMethodCallFailure(call, sourceFile, typeChecker, printer);

      failures.push(failure);

      if (requiredHelpers) {
        requiredHelpers.forEach(helperName => helpersToAdd.add(helperName));
      }
    });

    // Some of the methods can't be mapped directly to `Renderer2` and need extra logic around them.
    // The safest way to do so is to declare helper functions similar to the ones emitted by TS
    // which encapsulate the extra "glue" logic. We should only emit these functions once per
    // file and only if they're needed.
    if (helpersToAdd.size) {
      failures.push(this._getHelpersFailure(helpersToAdd, sourceFile, printer));
    }

    return failures;
  }

  /** Gets a failure for an import of the Renderer. */
  private _getNamedImportsFailure(
      node: ts.NamedImports, sourceFile: ts.SourceFile, printer: ts.Printer): RuleFailure {
    const replacementText = printer.printNode(
        ts.EmitHint.Unspecified, replaceImport(node, 'Renderer', 'Renderer2'), sourceFile);

    return new RuleFailure(
        sourceFile, node.getStart(), node.getEnd(),
        'Imports of deprecated Renderer are not allowed. Please use Renderer2 instead.',
        this.ruleName, new Replacement(node.getStart(), node.getWidth(), replacementText));
  }

  /** Gets a failure for a typed node (e.g. function parameter or property). */
  private _getTypedNodeFailure(
      node: ts.ParameterDeclaration|ts.PropertyDeclaration|ts.AsExpression,
      sourceFile: ts.SourceFile): RuleFailure {
    const type = node.type!;

    return new RuleFailure(
        sourceFile, type.getStart(), type.getEnd(),
        'References to deprecated Renderer are not allowed. Please use Renderer2 instead.',
        this.ruleName, new Replacement(type.getStart(), type.getWidth(), 'Renderer2'));
  }

  /** Gets a failure for an identifier node. */
  private _getIdentifierNodeFailure(node: ts.Identifier, sourceFile: ts.SourceFile): RuleFailure {
    return new RuleFailure(
        sourceFile, node.getStart(), node.getEnd(),
        'References to deprecated Renderer are not allowed. Please use Renderer2 instead.',
        this.ruleName, new Replacement(node.getStart(), node.getWidth(), 'Renderer2'));
  }

  /** Gets a failure for a Renderer method call. */
  private _getMethodCallFailure(
      call: ts.CallExpression, sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker,
      printer: ts.Printer): {failure: RuleFailure, requiredHelpers?: HelperFunction[]} {
    const {node, requiredHelpers} = migrateExpression(call, typeChecker);
    let fix: Replacement|undefined;

    if (node) {
      // If we migrated the node to a new expression, replace only the call expression.
      fix = new Replacement(
          call.getStart(), call.getWidth(),
          printer.printNode(ts.EmitHint.Unspecified, node, sourceFile));
    } else if (call.parent && ts.isExpressionStatement(call.parent)) {
      // Otherwise if the call is inside an expression statement, drop the entire statement.
      // This takes care of any trailing semicolons. We only need to drop nodes for cases like
      // `setBindingDebugInfo` which have been noop for a while so they can be removed safely.
      fix = new Replacement(call.parent.getStart(), call.parent.getWidth(), '');
    }

    return {
      failure: new RuleFailure(
          sourceFile, call.getStart(), call.getEnd(), 'Calls to Renderer methods are not allowed',
          this.ruleName, fix),
      requiredHelpers
    };
  }

  /** Gets a failure that inserts the required helper functions at the bottom of the file. */
  private _getHelpersFailure(
      helpersToAdd: Set<HelperFunction>, sourceFile: ts.SourceFile,
      printer: ts.Printer): RuleFailure {
    const helpers: Replacement[] = [];
    const endOfFile = sourceFile.endOfFileToken;

    helpersToAdd.forEach(helperName => {
      helpers.push(new Replacement(
          endOfFile.getStart(), endOfFile.getWidth(), getHelper(helperName, sourceFile, printer)));
    });

    // Add a failure at the end of the file which we can use as an anchor to insert the helpers.
    return new RuleFailure(
        sourceFile, endOfFile.getStart(), endOfFile.getStart() + 1,
        'File should contain Renderer helper functions. Run tslint with --fix to generate them.',
        this.ruleName, helpers);
  }
}
