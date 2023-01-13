/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {OwningModule, Reference} from '../../imports';
import {ClassDeclaration, ClassMember, ClassMemberKind, isNamedClassDeclaration, ReflectionHost, reflectTypeEntityToDeclaration} from '../../reflection';
import {nodeDebugInfo} from '../../util/src/typescript';

import {DirectiveMeta, DirectiveTypeCheckMeta, InputMapping, MetadataReader, NgModuleMeta, PipeMeta, TemplateGuardMeta} from './api';
import {ClassPropertyMapping, ClassPropertyName} from './property_mapping';

export function extractReferencesFromType(
    checker: ts.TypeChecker, def: ts.TypeNode,
    bestGuessOwningModule: OwningModule|null): Reference<ClassDeclaration>[] {
  if (!ts.isTupleTypeNode(def)) {
    return [];
  }

  return def.elements.map(element => {
    if (!ts.isTypeQueryNode(element)) {
      throw new Error(`Expected TypeQueryNode: ${nodeDebugInfo(element)}`);
    }

    return extraReferenceFromTypeQuery(checker, element, def, bestGuessOwningModule);
  });
}

export function extraReferenceFromTypeQuery(
    checker: ts.TypeChecker, typeNode: ts.TypeQueryNode, origin: ts.TypeNode,
    bestGuessOwningModule: OwningModule|null) {
  const type = typeNode.exprName;
  const {node, from} = reflectTypeEntityToDeclaration(type, checker);
  if (!isNamedClassDeclaration(node)) {
    throw new Error(`Expected named ClassDeclaration: ${nodeDebugInfo(node)}`);
  }
  if (from !== null && !from.startsWith('.')) {
    // The symbol was imported using an absolute module specifier so return a reference that
    // uses that absolute module specifier as its best guess owning module.
    return new Reference(
        node, {specifier: from, resolutionContext: origin.getSourceFile().fileName});
  }
  // For local symbols or symbols that were imported using a relative module import it is
  // assumed that the symbol is exported from the provided best guess owning module.
  return new Reference(node, bestGuessOwningModule);
}

export function readBooleanType(type: ts.TypeNode): boolean|null {
  if (!ts.isLiteralTypeNode(type)) {
    return null;
  }

  switch (type.literal.kind) {
    case ts.SyntaxKind.TrueKeyword:
      return true;
    case ts.SyntaxKind.FalseKeyword:
      return false;
    default:
      return null;
  }
}

export function readStringType(type: ts.TypeNode): string|null {
  if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
    return null;
  }
  return type.literal.text;
}

export function readMapType<T>(
    type: ts.TypeNode, valueTransform: (type: ts.TypeNode) => T | null): {[key: string]: T} {
  if (!ts.isTypeLiteralNode(type)) {
    return {};
  }
  const obj: {[key: string]: T} = {};
  type.members.forEach(member => {
    if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
        (!ts.isStringLiteral(member.name) && !ts.isIdentifier(member.name))) {
      return;
    }
    const value = valueTransform(member.type);
    if (value === null) {
      return null;
    }
    obj[member.name.text] = value;
  });
  return obj;
}

export function readStringArrayType(type: ts.TypeNode): string[] {
  if (!ts.isTupleTypeNode(type)) {
    return [];
  }
  const res: string[] = [];
  type.elements.forEach(el => {
    if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
      return;
    }
    res.push(el.literal.text);
  });
  return res;
}

/**
 * Inspects the class' members and extracts the metadata that is used when type-checking templates
 * that use the directive. This metadata does not contain information from a base class, if any,
 * making this metadata invariant to changes of inherited classes.
 */
export function extractDirectiveTypeCheckMeta(
    node: ClassDeclaration, inputs: ClassPropertyMapping<InputMapping>,
    reflector: ReflectionHost): DirectiveTypeCheckMeta {
  const members = reflector.getMembersOfClass(node);
  const staticMembers = members.filter(member => member.isStatic);
  const ngTemplateGuards = staticMembers.map(extractTemplateGuard)
                               .filter((guard): guard is TemplateGuardMeta => guard !== null);
  const hasNgTemplateContextGuard = staticMembers.some(
      member => member.kind === ClassMemberKind.Method && member.name === 'ngTemplateContextGuard');

  const coercedInputFields =
      new Set(staticMembers.map(extractCoercedInput)
                  .filter((inputName): inputName is ClassPropertyName => inputName !== null));

  const restrictedInputFields = new Set<ClassPropertyName>();
  const stringLiteralInputFields = new Set<ClassPropertyName>();
  const undeclaredInputFields = new Set<ClassPropertyName>();

  for (const classPropertyName of inputs.classPropertyNames) {
    const field = members.find(member => member.name === classPropertyName);
    if (field === undefined || field.node === null) {
      undeclaredInputFields.add(classPropertyName);
      continue;
    }
    if (isRestricted(field.node)) {
      restrictedInputFields.add(classPropertyName);
    }
    if (field.nameNode !== null && ts.isStringLiteral(field.nameNode)) {
      stringLiteralInputFields.add(classPropertyName);
    }
  }

  const arity = reflector.getGenericArityOfClass(node);

  return {
    hasNgTemplateContextGuard,
    ngTemplateGuards,
    coercedInputFields,
    restrictedInputFields,
    stringLiteralInputFields,
    undeclaredInputFields,
    isGeneric: arity !== null && arity > 0,
  };
}

function isRestricted(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;

  return modifiers !== undefined && modifiers.some(({kind}) => {
    return kind === ts.SyntaxKind.PrivateKeyword || kind === ts.SyntaxKind.ProtectedKeyword ||
        kind === ts.SyntaxKind.ReadonlyKeyword;
  });
}

function extractTemplateGuard(member: ClassMember): TemplateGuardMeta|null {
  if (!member.name.startsWith('ngTemplateGuard_')) {
    return null;
  }
  const inputName = afterUnderscore(member.name);
  if (member.kind === ClassMemberKind.Property) {
    let type: string|null = null;
    if (member.type !== null && ts.isLiteralTypeNode(member.type) &&
        ts.isStringLiteral(member.type.literal)) {
      type = member.type.literal.text;
    }

    // Only property members with string literal type 'binding' are considered as template guard.
    if (type !== 'binding') {
      return null;
    }
    return {inputName, type};
  } else if (member.kind === ClassMemberKind.Method) {
    return {inputName, type: 'invocation'};
  } else {
    return null;
  }
}

function extractCoercedInput(member: ClassMember): string|null {
  if (member.kind !== ClassMemberKind.Property || !member.name.startsWith('ngAcceptInputType_')) {
    return null!;
  }
  return afterUnderscore(member.name);
}

/**
 * A `MetadataReader` that reads from an ordered set of child readers until it obtains the requested
 * metadata.
 *
 * This is used to combine `MetadataReader`s that read from different sources (e.g. from a registry
 * and from .d.ts files).
 */
export class CompoundMetadataReader implements MetadataReader {
  constructor(private readers: MetadataReader[]) {}

  getDirectiveMetadata(node: Reference<ClassDeclaration<ts.Declaration>>): DirectiveMeta|null {
    for (const reader of this.readers) {
      const meta = reader.getDirectiveMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }

  getNgModuleMetadata(node: Reference<ClassDeclaration<ts.Declaration>>): NgModuleMeta|null {
    for (const reader of this.readers) {
      const meta = reader.getNgModuleMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getPipeMetadata(node: Reference<ClassDeclaration<ts.Declaration>>): PipeMeta|null {
    for (const reader of this.readers) {
      const meta = reader.getPipeMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
}

function afterUnderscore(str: string): string {
  const pos = str.indexOf('_');
  if (pos === -1) {
    throw new Error(`Expected '${str}' to contain '_'`);
  }
  return str.slice(pos + 1);
}

/** Returns whether a class declaration has the necessary class fields to make it injectable. */
export function hasInjectableFields(clazz: ClassDeclaration, host: ReflectionHost): boolean {
  const members = host.getMembersOfClass(clazz);
  return members.some(({isStatic, name}) => isStatic && (name === 'ɵprov' || name === 'ɵfac'));
}
