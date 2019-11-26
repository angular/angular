/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, makeDiagnostic} from '../../diagnostics';
import {Reference} from '../../imports';
import {MetadataReader} from '../../metadata';
import {PartialEvaluator} from '../../partial_evaluator';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {makeDuplicateDeclarationError} from './util';

export function getDirectiveDiagnostics(
    node: ClassDeclaration, reader: MetadataReader, evaluator: PartialEvaluator,
    scopeRegistry: LocalModuleScopeRegistry): ts.Diagnostic[]|null {
  let diagnostics: ts.Diagnostic[]|null = [];

  const addDiagnostics = (more: ts.Diagnostic | ts.Diagnostic[] | null) => {
    if (more === null) {
      return;
    } else if (diagnostics === null) {
      diagnostics = Array.isArray(more) ? more : [more];
    } else if (Array.isArray(more)) {
      diagnostics.push(...more);
    } else {
      diagnostics.push(more);
    }
  };

  const duplicateDeclarations = scopeRegistry.getDuplicateDeclarations(node);

  if (duplicateDeclarations !== null) {
    addDiagnostics(makeDuplicateDeclarationError(node, duplicateDeclarations, 'Directive'));
  }

  addDiagnostics(checkInheritanceOfDirective(node, reader, evaluator));

  return diagnostics;
}

export function checkInheritanceOfDirective(
    node: ClassDeclaration, reader: MetadataReader, evaluator: PartialEvaluator): ts.Diagnostic|
    null {
  if (!ts.isClassDeclaration(node) || node.heritageClauses === undefined) {
    return null;
  }

  const extendsClause =
      node.heritageClauses.find(clause => clause.token === ts.SyntaxKind.ExtendsKeyword);
  if (extendsClause === undefined) {
    return null;
  }

  if (getConstructor(node) !== undefined) {
    // If a constructor exists, then no base class definition is required on the runtime side -
    // it's legal to inherit from any class.
    return null;
  }

  // The extends clause is an expression which can be as dynamic as the user wants. Try to
  // evaluate it, but fall back on ignoring the clause if it can't be understood. This is a View
  // Engine compatibility hack: View Engine ignores 'extends' expressions that it cannot understand.
  const type = extendsClause.types[0];
  const baseClass = evaluator.evaluate(type.expression);
  if (!(baseClass instanceof Reference) || !isNamedClassDeclaration(baseClass.node)) {
    return null;
  }

  // If the base class doesn't have a constructor or the constructor
  // doesn't have parameters, it won't be using DI so we can skip it.
  const baseClassConstructor = getConstructor(baseClass.node);
  if (baseClassConstructor === undefined || baseClassConstructor.parameters.length === 0) {
    return null;
  }

  // We can skip the base class if it has metadata.
  const baseClassMeta = reader.getDirectiveMetadata(baseClass as Reference<ClassDeclaration>);
  if (baseClassMeta !== null) {
    return null;
  }

  const subclassMeta = reader.getDirectiveMetadata(new Reference(node)) !;
  const dirOrComp = subclassMeta.isComponent ? 'Component' : 'Directive';

  return makeDiagnostic(
      ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, type,
      `The ${dirOrComp.toLowerCase()} ${node.name.text} inherits its constructor from ${baseClass.debugName}, ` +
          `but the latter does not have an Angular decorator of its own. Dependency injection will not be able to ` +
          `resolve the parameters of ${baseClass.debugName}'s constructor. Either add a @Directive decorator ` +
          `to ${baseClass.debugName}, or add an explicit constructor to ${node.name.text}.`);
}


/** Gets the constructor of a class declaration. */
function getConstructor(node: ts.ClassDeclaration): ts.ConstructorDeclaration|undefined {
  const constructor = node.members.find(member => ts.isConstructorDeclaration(member));
  return constructor as ts.ConstructorDeclaration | undefined;
}
