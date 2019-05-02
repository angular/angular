/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration, ClassMember, ClassMemberKind, ReflectionHost, isNamedClassDeclaration, reflectTypeEntityToDeclaration} from '../../reflection';
import {nodeDebugInfo} from '../../util/src/typescript';

import {DirectiveMeta, MetadataReader, NgModuleMeta, PipeMeta, TemplateGuardMeta} from './api';

export function extractReferencesFromType(
    checker: ts.TypeChecker, def: ts.TypeNode, ngModuleImportedFrom: string | null,
    resolutionContext: string): Reference<ClassDeclaration>[] {
  if (!ts.isTupleTypeNode(def)) {
    return [];
  }
  return def.elementTypes.map(element => {
    if (!ts.isTypeQueryNode(element)) {
      throw new Error(`Expected TypeQueryNode: ${nodeDebugInfo(element)}`);
    }
    const type = element.exprName;
    const {node, from} = reflectTypeEntityToDeclaration(type, checker);
    if (!isNamedClassDeclaration(node)) {
      throw new Error(`Expected named ClassDeclaration: ${nodeDebugInfo(node)}`);
    }
    const specifier = (from !== null && !from.startsWith('.') ? from : ngModuleImportedFrom);
    if (specifier !== null) {
      return new Reference(node, {specifier, resolutionContext});
    } else {
      return new Reference(node);
    }
  });
}

export function readStringType(type: ts.TypeNode): string|null {
  if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
    return null;
  }
  return type.literal.text;
}

export function readStringMapType(type: ts.TypeNode): {[key: string]: string} {
  if (!ts.isTypeLiteralNode(type)) {
    return {};
  }
  const obj: {[key: string]: string} = {};
  type.members.forEach(member => {
    if (!ts.isPropertySignature(member) || member.type === undefined || member.name === undefined ||
        !ts.isStringLiteral(member.name)) {
      return;
    }
    const value = readStringType(member.type);
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
  type.elementTypes.forEach(el => {
    if (!ts.isLiteralTypeNode(el) || !ts.isStringLiteral(el.literal)) {
      return;
    }
    res.push(el.literal.text);
  });
  return res;
}


export function extractDirectiveGuards(node: ClassDeclaration, reflector: ReflectionHost): {
  ngTemplateGuards: TemplateGuardMeta[],
  hasNgTemplateContextGuard: boolean,
} {
  const staticMembers = reflector.getMembersOfClass(node).filter(member => member.isStatic);
  const ngTemplateGuards = staticMembers.map(extractTemplateGuard)
                               .filter((guard): guard is TemplateGuardMeta => guard !== null);
  const hasNgTemplateContextGuard = staticMembers.some(
      member => member.kind === ClassMemberKind.Method && member.name === 'ngTemplateContextGuard');
  return {hasNgTemplateContextGuard, ngTemplateGuards};
}

function extractTemplateGuard(member: ClassMember): TemplateGuardMeta|null {
  if (!member.name.startsWith('ngTemplateGuard_')) {
    return null;
  }
  const inputName = member.name.split('_', 2)[1];
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
