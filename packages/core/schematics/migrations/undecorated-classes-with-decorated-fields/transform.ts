/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PartialEvaluator} from '@angular/compiler-cli/src/ngtsc/partial_evaluator';
import {reflectObjectLiteral, TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import * as ts from 'typescript';

import {ImportManager} from '../../utils/import_manager';
import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {findBaseClassDeclarations} from '../../utils/typescript/find_base_classes';
import {unwrapExpression} from '../../utils/typescript/functions';

import {UpdateRecorder} from './update_recorder';


/** Analyzed class declaration. */
interface AnalyzedClass {
  /** Whether the class is decorated with @Directive or @Component. */
  isDirectiveOrComponent: boolean;
  /** Whether the class is an abstract directive. */
  isAbstractDirective: boolean;
  /** Whether the class uses any Angular features. */
  usesAngularFeatures: boolean;
}

export class UndecoratedClassesWithDecoratedFieldsTransform {
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private reflectionHost = new TypeScriptReflectionHost(this.typeChecker);
  private partialEvaluator = new PartialEvaluator(this.reflectionHost, this.typeChecker, null);

  constructor(
      private typeChecker: ts.TypeChecker,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder) {}

  /**
   * Migrates the specified source files. The transform adds the abstract `@Directive`
   * decorator to classes that have Angular field decorators but are not decorated.
   * https://hackmd.io/vuQfavzfRG6KUCtU7oK_EA
   */
  migrate(sourceFiles: ts.SourceFile[]) {
    this._findUndecoratedAbstractDirectives(sourceFiles).forEach(node => {
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
  recordChanges() {
    this.importManager.recordChanges();
  }

  /** Finds undecorated abstract directives in the specified source files. */
  private _findUndecoratedAbstractDirectives(sourceFiles: ts.SourceFile[]) {
    const result = new Set<ts.ClassDeclaration>();
    const undecoratedClasses = new Set<ts.ClassDeclaration>();
    const nonAbstractDirectives = new WeakSet<ts.ClassDeclaration>();
    const abstractDirectives = new WeakSet<ts.ClassDeclaration>();

    const visitNode = (node: ts.Node) => {
      node.forEachChild(visitNode);
      if (!ts.isClassDeclaration(node)) {
        return;
      }
      const {isDirectiveOrComponent, isAbstractDirective, usesAngularFeatures} =
          this._analyzeClassDeclaration(node);
      if (isDirectiveOrComponent) {
        if (isAbstractDirective) {
          abstractDirectives.add(node);
        } else {
          nonAbstractDirectives.add(node);
        }
      } else if (usesAngularFeatures) {
        abstractDirectives.add(node);
        result.add(node);
      } else {
        undecoratedClasses.add(node);
      }
    };

    sourceFiles.forEach(sourceFile => sourceFile.forEachChild(visitNode));

    // We collected all undecorated class declarations which inherit from abstract directives.
    // For such abstract directives, the derived classes also need to be migrated.
    undecoratedClasses.forEach(node => {
      for (const {node: baseClass} of findBaseClassDeclarations(node, this.typeChecker)) {
        // If the undecorated class inherits from a non-abstract directive, skip the current
        // class. We do this because undecorated classes which inherit metadata from non-abstract
        // directives are handle in the `undecorated-classes-with-di` migration that copies
        // inherited metadata into an explicit decorator.
        if (nonAbstractDirectives.has(baseClass)) {
          break;
        } else if (abstractDirectives.has(baseClass)) {
          result.add(node);
          break;
        }
      }
    });

    return result;
  }

  /**
   * Analyzes the given class declaration by determining whether the class
   * is a directive, is an abstract directive, or uses Angular features.
   */
  private _analyzeClassDeclaration(node: ts.ClassDeclaration): AnalyzedClass {
    const ngDecorators = node.decorators && getAngularDecorators(this.typeChecker, node.decorators);
    const usesAngularFeatures = this._hasAngularDecoratedClassMember(node);
    if (ngDecorators === undefined || ngDecorators.length === 0) {
      return {isDirectiveOrComponent: false, isAbstractDirective: false, usesAngularFeatures};
    }
    const directiveDecorator = ngDecorators.find(({name}) => name === 'Directive');
    const componentDecorator = ngDecorators.find(({name}) => name === 'Component');
    const isAbstractDirective =
        directiveDecorator !== undefined && this._isAbstractDirective(directiveDecorator);
    return {
      isDirectiveOrComponent: !!directiveDecorator || !!componentDecorator,
      isAbstractDirective,
      usesAngularFeatures,
    };
  }

  /**
   * Checks whether the given decorator resolves to an abstract directive. An directive is
   * considered "abstract" if there is no selector specified.
   */
  private _isAbstractDirective({node}: NgDecorator): boolean {
    const metadataArgs = node.expression.arguments;
    if (metadataArgs.length === 0) {
      return true;
    }
    const metadataExpr = unwrapExpression(metadataArgs[0]);
    if (!ts.isObjectLiteralExpression(metadataExpr)) {
      return false;
    }
    const metadata = reflectObjectLiteral(metadataExpr);
    if (!metadata.has('selector')) {
      return false;
    }
    const selector = this.partialEvaluator.evaluate(metadata.get('selector')!);
    return selector == null;
  }

  private _hasAngularDecoratedClassMember(node: ts.ClassDeclaration): boolean {
    return node.members.some(
        m => m.decorators && getAngularDecorators(this.typeChecker, m.decorators).length !== 0);
  }
}
