
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AotCompiler} from '@angular/compiler';
import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import * as ts from 'typescript';

import {ImportManager} from '../../../utils/import_manager';
import {NgDecorator} from '../../../utils/ng_decorators';
import {unwrapExpression} from '../../../utils/typescript/functions';

import {ImportRewriteTransformerFactory, UnresolvedIdentifierError} from './import_rewrite_visitor';


/**
 * Class that can be used to copy decorators to a new location. The rewriter ensures that
 * identifiers and imports are rewritten to work in the new file location. Fields in a
 * decorator that cannot be cleanly copied will be copied with a comment explaining that
 * imports and identifiers need to be adjusted manually.
 */
export class DecoratorRewriter {
  previousSourceFile: ts.SourceFile|null = null;
  newSourceFile: ts.SourceFile|null = null;

  newProperties: ts.ObjectLiteralElementLike[] = [];
  nonCopyableProperties: ts.ObjectLiteralElementLike[] = [];

  private importRewriterFactory = new ImportRewriteTransformerFactory(
      this.importManager, this.typeChecker, this.compiler['_host']);

  constructor(
      private importManager: ImportManager, private typeChecker: ts.TypeChecker,
      private evaluator: PartialEvaluator, private compiler: AotCompiler) {}

  rewrite(ngDecorator: NgDecorator, newSourceFile: ts.SourceFile): ts.Decorator {
    const decorator = ngDecorator.node;

    // Reset the previous state of the decorator rewriter.
    this.newProperties = [];
    this.nonCopyableProperties = [];
    this.newSourceFile = newSourceFile;
    this.previousSourceFile = decorator.getSourceFile();

    // If the decorator will be added to the same source file it currently
    // exists in, we don't need to rewrite any paths or add new imports.
    if (this.previousSourceFile === newSourceFile) {
      return this._createDecorator(decorator.expression);
    }

    const oldCallExpr = decorator.expression;

    if (!oldCallExpr.arguments.length) {
      // Re-use the original decorator if there are no arguments and nothing needs
      // to be sanitized or rewritten.
      return this._createDecorator(decorator.expression);
    }

    const metadata = unwrapExpression(oldCallExpr.arguments[0]);
    if (!ts.isObjectLiteralExpression(metadata)) {
      // Re-use the original decorator as there is no metadata that can be sanitized.
      return this._createDecorator(decorator.expression);
    }

    metadata.properties.forEach(prop => {
      // We don't handle spread assignments, accessors or method declarations automatically
      // as it involves more advanced static analysis and these type of properties are not
      // picked up by ngc either.
      if (ts.isSpreadAssignment(prop) || ts.isAccessor(prop) || ts.isMethodDeclaration(prop)) {
        this.nonCopyableProperties.push(prop);
        return;
      }

      const sanitizedProp = this._sanitizeMetadataProperty(prop);
      if (sanitizedProp !== null) {
        this.newProperties.push(sanitizedProp);
      } else {
        this.nonCopyableProperties.push(prop);
      }
    });

    // In case there is at least one non-copyable property, we add a leading comment to
    // the first property assignment in order to ask the developer to manually manage
    // imports and do path rewriting for these properties.
    if (this.nonCopyableProperties.length !== 0) {
      ['The following fields were copied from the base class,',
       'but could not be updated automatically to work in the',
       'new file location. Please add any required imports for', 'the properties below:']
          .forEach(
              text => ts.addSyntheticLeadingComment(
                  this.nonCopyableProperties[0], ts.SyntaxKind.SingleLineCommentTrivia, ` ${text}`,
                  true));
    }

    // Note that we don't update the decorator as we don't want to copy potential leading
    // comments of the decorator. This is necessary because otherwise comments from the
    // copied decorator end up describing the new class (which is not always correct).
    return this._createDecorator(ts.createCall(
        this.importManager.addImportToSourceFile(
            newSourceFile, ngDecorator.name, ngDecorator.moduleName),
        undefined, [ts.updateObjectLiteral(
                       metadata, [...this.newProperties, ...this.nonCopyableProperties])]));
  }

  /** Creates a new decorator with the given expression. */
  private _createDecorator(expr: ts.Expression): ts.Decorator {
    // Note that we don't update the decorator as we don't want to copy potential leading
    // comments of the decorator. This is necessary because otherwise comments from the
    // copied decorator end up describing the new class (which is not always correct).
    return ts.createDecorator(expr);
  }

  /**
   * Sanitizes a metadata property by ensuring that all contained identifiers
   * are imported in the target source file.
   */
  private _sanitizeMetadataProperty(prop: ts.ObjectLiteralElementLike): ts.ObjectLiteralElementLike
      |null {
    try {
      return ts
          .transform(prop, [ctx => this.importRewriterFactory.create(ctx, this.newSourceFile!)])
          .transformed[0];
    } catch (e) {
      // If the error is for an unresolved identifier, we want to return "null" because
      // such object literal elements could be added to the non-copyable properties.
      if (e instanceof UnresolvedIdentifierError) {
        return null;
      }
      throw e;
    }
  }
}
