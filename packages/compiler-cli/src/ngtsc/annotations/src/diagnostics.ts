/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnostic, makeRelatedInformation} from '../../diagnostics';
import {Reference} from '../../imports';
import {InjectableClassRegistry, MetadataReader} from '../../metadata';
import {describeResolvedType, DynamicValue, PartialEvaluator, ResolvedValue, traceDynamicValue} from '../../partial_evaluator';
import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {LocalModuleScopeRegistry} from '../../scope';
import {identifierOfNode} from '../../util/src/typescript';

import {makeDuplicateDeclarationError, readBaseClass} from './util';

/**
 * Creates a `FatalDiagnosticError` for a node that did not evaluate to the expected type. The
 * diagnostic that is created will include details on why the value is incorrect, i.e. it includes
 * a representation of the actual type that was unsupported, or in the case of a dynamic value the
 * trace to the node where the dynamic value originated.
 *
 * @param node The node for which the diagnostic should be produced.
 * @param value The evaluated value that has the wrong type.
 * @param messageText The message text of the error.
 */
export function createValueHasWrongTypeError(
    node: ts.Node, value: ResolvedValue, messageText: string): FatalDiagnosticError {
  let chainedMessage: string;
  let relatedInformation: ts.DiagnosticRelatedInformation[]|undefined;
  if (value instanceof DynamicValue) {
    chainedMessage = 'Value could not be determined statically.';
    relatedInformation = traceDynamicValue(node, value);
  } else if (value instanceof Reference) {
    const target = value.debugName !== null ? `'${value.debugName}'` : 'an anonymous declaration';
    chainedMessage = `Value is a reference to ${target}.`;

    const referenceNode = identifierOfNode(value.node) ?? value.node;
    relatedInformation = [makeRelatedInformation(referenceNode, 'Reference is declared here.')];
  } else {
    chainedMessage = `Value is of type '${describeResolvedType(value)}'.`;
  }

  const chain: ts.DiagnosticMessageChain = {
    messageText,
    category: ts.DiagnosticCategory.Error,
    code: 0,
    next: [{
      messageText: chainedMessage,
      category: ts.DiagnosticCategory.Message,
      code: 0,
    }]
  };

  return new FatalDiagnosticError(ErrorCode.VALUE_HAS_WRONG_TYPE, node, chain, relatedInformation);
}

/**
 * Gets the diagnostics for a set of provider classes.
 * @param providerClasses Classes that should be checked.
 * @param providersDeclaration Node that declares the providers array.
 * @param registry Registry that keeps track of the registered injectable classes.
 */
export function getProviderDiagnostics(
    providerClasses: Set<Reference<ClassDeclaration>>, providersDeclaration: ts.Expression,
    registry: InjectableClassRegistry): ts.Diagnostic[] {
  const diagnostics: ts.Diagnostic[] = [];

  for (const provider of providerClasses) {
    if (registry.isInjectable(provider.node)) {
      continue;
    }

    const contextNode = provider.getOriginForDiagnostics(providersDeclaration);
    diagnostics.push(makeDiagnostic(
        ErrorCode.UNDECORATED_PROVIDER, contextNode,
        `The class '${
            provider.node.name
                .text}' cannot be created via dependency injection, as it does not have an Angular decorator. This will result in an error at runtime.

Either add the @Injectable() decorator to '${
            provider.node.name
                .text}', or configure a different provider (such as a provider with 'useFactory').
`,
        [makeRelatedInformation(provider.node, `'${provider.node.name.text}' is declared here.`)]));
  }

  return diagnostics;
}

export function getDirectiveDiagnostics(
    node: ClassDeclaration, reader: MetadataReader, evaluator: PartialEvaluator,
    reflector: ReflectionHost, scopeRegistry: LocalModuleScopeRegistry,
    kind: string): ts.Diagnostic[]|null {
  let diagnostics: ts.Diagnostic[]|null = [];

  const addDiagnostics = (more: ts.Diagnostic|ts.Diagnostic[]|null) => {
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
    addDiagnostics(makeDuplicateDeclarationError(node, duplicateDeclarations, kind));
  }

  addDiagnostics(checkInheritanceOfDirective(node, reader, reflector, evaluator));
  return diagnostics;
}

export function getUndecoratedClassWithAngularFeaturesDiagnostic(node: ClassDeclaration):
    ts.Diagnostic {
  return makeDiagnostic(
      ErrorCode.UNDECORATED_CLASS_USING_ANGULAR_FEATURES, node.name,
      `Class is using Angular features but is not decorated. Please add an explicit ` +
          `Angular decorator.`);
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
  const subclassMeta = reader.getDirectiveMetadata(new Reference(node))!;
  const dirOrComp = subclassMeta.isComponent ? 'Component' : 'Directive';
  const baseClassName = baseClass.debugName;

  return makeDiagnostic(
      ErrorCode.DIRECTIVE_INHERITS_UNDECORATED_CTOR, node.name,
      `The ${dirOrComp.toLowerCase()} ${node.name.text} inherits its constructor from ${
          baseClassName}, ` +
          `but the latter does not have an Angular decorator of its own. Dependency injection will not be able to ` +
          `resolve the parameters of ${
              baseClassName}'s constructor. Either add a @Directive decorator ` +
          `to ${baseClassName}, or add an explicit constructor to ${node.name.text}.`);
}
