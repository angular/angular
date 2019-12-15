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
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';

import {makeDuplicateDeclarationError, readBaseClass} from './util';

export function getDirectiveDiagnostics(
    node: ClassDeclaration, reader: MetadataReader, evaluator: PartialEvaluator,
    reflector: ReflectionHost, scopeRegistry: LocalModuleScopeRegistry): ts.Diagnostic[]|null {
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

  addDiagnostics(checkInheritanceOfDirective(node, reader, reflector, evaluator));
  return diagnostics;
}

export function checkInheritanceOfDirective(
    node: ClassDeclaration, reader: MetadataReader, reflector: ReflectionHost,
    evaluator: PartialEvaluator): ts.Diagnostic|null {
  if (!reflector.isClass(node) || reflector.getConstructorParameters(node) !== null) {
    // We should skip nodes that aren't classes. If a constructor exists, then no base class
    // definition is required on the runtime side - it's legal to inherit from any class.
    return null;
  }

  // The extends clause is an expression which can be as dynamic as the user wants. Try to
  // evaluate it, but fall back on ignoring the clause if it can't be understood. This is a View
  // Engine compatibility hack: View Engine ignores 'extends' expressions that it cannot understand.
  let baseClass = readBaseClass(node, reflector, evaluator);

  while (baseClass !== null) {
    if (baseClass === 'dynamic') {
      return null;
    }

    // We can skip the base class if it has metadata.
    const baseClassMeta = reader.getDirectiveMetadata(baseClass);
    if (baseClassMeta !== null) {
      return null;
    }

    // If the base class has a blank constructor we can skip it since it can't be using DI.
    const baseClassConstructorParams = reflector.getConstructorParameters(baseClass.node);
    const newParentClass = readBaseClass(baseClass.node, reflector, evaluator);

    if (baseClassConstructorParams !== null && baseClassConstructorParams.length > 0) {
      // This class has a non-trivial constructor, that's an error!
      return getInheritedUndecoratedCtorDiagnostic(node, baseClass, reader);
    } else if (baseClassConstructorParams !== null || newParentClass === null) {
      // This class has a trivial constructor, or no constructor + is the
      // top of the inheritance chain, so it's okay.
      return null;
    }

    // Go up the chain and continue
    baseClass = newParentClass;
  }

  return null;
}

function getInheritedUndecoratedCtorDiagnostic(
    node: ClassDeclaration, baseClass: Reference, reader: MetadataReader) {
  const subclassMeta = reader.getDirectiveMetadata(new Reference(node)) !;
  const dirOrComp = subclassMeta.isComponent ? 'Component' : 'Directive';
  const baseClassName = baseClass.debugName;

  return makeDiagnostic(
      ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, node.name,
      `The ${dirOrComp.toLowerCase()} ${node.name.text} inherits its constructor from ${baseClassName}, ` +
          `but the latter does not have an Angular decorator of its own. Dependency injection will not be able to ` +
          `resolve the parameters of ${baseClassName}'s constructor. Either add a @Directive decorator ` +
          `to ${baseClassName}, or add an explicit constructor to ${node.name.text}.`);
}
