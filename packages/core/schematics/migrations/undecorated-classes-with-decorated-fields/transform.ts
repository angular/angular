/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {findBaseClassDeclarations} from '../../utils/typescript/find_base_classes';

import {UpdateRecorder} from './update_recorder';

export class UndecoratedClassesWithDecoratedFieldsTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /**
   * Migrates the specified source files. The transform adds the abstract `@Directive`
   * decorator to classes that have Angular field decorators but are not decorated.
   * https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
   */
  migrate(sourceFiles: ts.SourceFile[]) {
    this._findUndecoratedDirectives(sourceFiles).forEach(node => {
      const sourceFile = node.getSourceFile();
      const recorder = this.getUpdateRecorder(sourceFile);
      const directiveExpr =
          this.importManager.addImportToSourceFile(sourceFile, 'Directive', '@angular/core');
      const decoratorExpr = ts.createDecorator(ts.createCall(directiveExpr, undefined, undefined));
      recorder.addClassDecorator(
          node, this.printer.printNode(ts.EmitHint.Unspecified, decoratorExpr, sourceFile));
    });
  }

  /** Records all changes that were made in the import manager. */
  recordChanges() { this.importManager.recordChanges(); }

  /** Finds undecorated directives in the specified source files. */
  private _findUndecoratedDirectives(sourceFiles: ts.SourceFile[]) {
    const typeChecker = this.typeChecker;
    const undecoratedDirectives = new Set<ts.ClassDeclaration>();
    const undecoratedClasses = new Set<ts.ClassDeclaration>();
    const decoratedDirectives = new WeakSet<ts.ClassDeclaration>();

    const visitNode = (node: ts.Node) => {
      node.forEachChild(visitNode);
      if (!ts.isClassDeclaration(node)) {
        return;
      }
      const ngDecorators = node.decorators && getAngularDecorators(typeChecker, node.decorators);
      const isDirectiveOrComponent = ngDecorators !== undefined &&
          ngDecorators.some(({name}) => name === 'Directive' || name === 'Component');
      if (isDirectiveOrComponent) {
        decoratedDirectives.add(node);
      } else {
        if (this._hasAngularDecoratedClassMember(node)) {
          undecoratedDirectives.add(node);
        } else {
          undecoratedClasses.add(node);
        }
      }
    };

    sourceFiles.forEach(sourceFile => sourceFile.forEachChild(visitNode));

    // We collected all class declarations that use Angular features but are not decorated. For
    // such undecorated directives, the derived classes also need to be migrated. To achieve this,
    // we walk through all undecorated classes and mark those which extend from an undecorated
    // directive as undecorated directive too.
    undecoratedClasses.forEach(node => {
      for (const {node: baseClass} of findBaseClassDeclarations(node, this.typeChecker)) {
        // If the undecorated class inherits from a decorated directive, skip the current class.
        // We do this because undecorated classes which inherit from directives/components are
        // handled in the `undecorated-classes-with-di` migration which copies inherited metadata.
        if (decoratedDirectives.has(baseClass)) {
          break;
        } else if (undecoratedDirectives.has(baseClass)) {
          undecoratedDirectives.add(node);
          undecoratedClasses.delete(node);
          break;
        }
      }
    });

    return undecoratedDirectives;
  }

  private _hasAngularDecoratedClassMember(node: ts.ClassDeclaration): boolean {
    return node.members.some(
        m => m.decorators && getAngularDecorators(this.typeChecker, m.decorators).length !== 0);
  }
}
