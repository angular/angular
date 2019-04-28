/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {getAngularDecorators} from '../../utils/ng_decorators';
import {hasExplicitConstructor} from '../../utils/typescript/class_declaration';

import {DirectiveModuleMap} from './directive_visitor';
import {findBaseClassDeclarations} from './find_base_classes';
import {ImportManager} from './import_manager';
import {NgModuleDeclarationsManager} from './module_declarations';
import {UpdateRecorder} from './update_recorder';

export interface TransformFailure {
  node: ts.Node;
  message: string;
}

export class UndecoratedBaseClassTransform {
  private defaultSelectorIdx = 1;
  private printer = ts.createPrinter();
  private importManager = new ImportManager(this.getUpdateRecorder, this.printer);
  private ngModuleManager = new NgModuleDeclarationsManager(
      this.importManager, this.getUpdateRecorder, this.typeChecker, this.printer);
  private updatedBaseClasses = new Set<ts.ClassDeclaration>();

  constructor(
      private typeChecker: ts.TypeChecker, private directiveModules: DirectiveModuleMap,
      private getUpdateRecorder: (sf: ts.SourceFile) => UpdateRecorder,
      private getNextSelectorIndex: () => number = () => this.defaultSelectorIdx++) {}

  recordChanges() {
    this.importManager.recordChanges();
    this.ngModuleManager.recordChanges();
  }

  migrateDirective(directiveClass: ts.ClassDeclaration): TransformFailure[] {
    // In case the directive has an explicit constructor, we don't need to do
    // anything because the class is already decorated with "@Directive" or "@Component"
    if (hasExplicitConstructor(directiveClass)) {
      return [];
    }

    const failures: TransformFailure[] = [];
    const orderedBaseClasses = findBaseClassDeclarations(directiveClass, this.typeChecker);
    const ngModules = this.directiveModules.get(directiveClass) || [];

    for (let baseClass of orderedBaseClasses) {
      // The list of base classes is ordered and we only need to find the first
      // base class with an explicit constructor class member.
      if (hasExplicitConstructor(baseClass)) {
        // In case the first base class with an explicit constructor is already
        // decorated with the "@Directive" decorator, we don't need to do anything.
        if (baseClass.decorators &&
            getAngularDecorators(this.typeChecker, baseClass.decorators)
                .some(d => d.name === 'Directive' || d.name === 'Component')) {
          break;
        }

        const baseClassFile = baseClass.getSourceFile();

        // In case the base class has already been decorated with other directives,
        // we don't want to add the @Directive decorator multiple times but still
        // add the base class to various NgModule declarations.
        if (!this.updatedBaseClasses.has(baseClass)) {
          const recorder = this.getUpdateRecorder(baseClassFile);
          const directiveExpr =
              this.importManager.addImportToSourceFile(baseClassFile, 'Directive', '@angular/core');

          const newDecorator = ts.createDecorator(ts.createCall(
              directiveExpr, undefined,
              [ts.createObjectLiteral(
                  [ts.createPropertyAssignment(
                      'selector',
                      ts.createStringLiteral(`_base_class_${this.getNextSelectorIndex()}`))],
                  false)]));

          const newDecoratorText =
              this.printer.printNode(ts.EmitHint.Unspecified, newDecorator, baseClassFile);
          recorder.addBaseClassDecorator(baseClass, `${newDecoratorText}\n`);
          this.updatedBaseClasses.add(baseClass);
        }

        // In case the directive is used in any NgModule, we want to add the new
        // dummy directive to the module declarations so that NGC does not complain
        // about a missing module for the newly annotated directive base class.
        ngModules.forEach(module => {
          const failure = this.ngModuleManager.addDeclarationToNgModule(module, baseClass);
          if (failure) {
            failures.push({node: baseClass, message: failure});
          }
        });
        break;
      }
    }
    return failures;
  }
}
