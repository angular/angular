/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {readBaseClass} from '../../../src/ngtsc/annotations/src/util';
import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration} from '../../../src/ngtsc/reflection';
import {HandlerFlags} from '../../../src/ngtsc/transform';

import {Migration, MigrationHost} from './migration';
import {createComponentDecorator, createDirectiveDecorator, hasDirectiveDecorator, hasPipeDecorator} from './utils';

export class UndecoratedChildMigration implements Migration {
  apply(clazz: ClassDeclaration, host: MigrationHost): ts.Diagnostic|null {
    // This migration looks at NgModules and considers the directives (and pipes) it declares.
    // It verifies that these classes have decorators.
    const moduleMeta = host.metadata.getNgModuleMetadata(new Reference(clazz));
    if (moduleMeta === null) {
      // Not an NgModule; don't care.
      return null;
    }

    // Examine each of the declarations to see if it needs to be migrated.
    for (const decl of moduleMeta.declarations) {
      this.maybeMigrate(decl, host);
    }

    return null;
  }

  maybeMigrate(ref: Reference<ClassDeclaration>, host: MigrationHost): void {
    if (hasDirectiveDecorator(host, ref.node) || hasPipeDecorator(host, ref.node)) {
      // Stop if one of the classes in the chain is actually decorated with @Directive, @Component,
      // or @Pipe.
      return;
    }

    const baseRef = readBaseClass(ref.node, host.reflectionHost, host.evaluator);
    if (baseRef === null) {
      // Stop: can't migrate a class with no parent.
      return;
    } else if (baseRef === 'dynamic') {
      // Stop: can't migrate a class with an indeterminate parent.
      return;
    }

    // Apply the migration recursively, to handle inheritance chains.
    this.maybeMigrate(baseRef, host);

    // After the above call, `host.metadata` should have metadata for the base class, if indeed this
    // is a directive inheritance chain.
    const baseMeta = host.metadata.getDirectiveMetadata(baseRef);
    if (baseMeta === null) {
      // Stop: this isn't a directive inheritance chain after all.
      return;
    }

    // Otherwise, decorate the class with @Component() or @Directive(), as appropriate.
    if (baseMeta.isComponent) {
      host.injectSyntheticDecorator(
          ref.node, createComponentDecorator(ref.node, baseMeta), HandlerFlags.FULL_INHERITANCE);
    } else {
      host.injectSyntheticDecorator(
          ref.node, createDirectiveDecorator(ref.node, baseMeta), HandlerFlags.FULL_INHERITANCE);
    }

    // Success!
  }
}
