/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration, ClassMemberKind, ReflectionHost, isNamedClassDeclaration, reflectTypeEntityToDeclaration} from '../../reflection';
import {nodeDebugInfo} from '../../util/src/typescript';

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
  ngTemplateGuards: string[],
  hasNgTemplateContextGuard: boolean,
} {
  const methods = nodeStaticMethodNames(node, reflector);
  const ngTemplateGuards = methods.filter(method => method.startsWith('ngTemplateGuard_'))
                               .map(method => method.split('_', 2)[1]);
  const hasNgTemplateContextGuard = methods.some(name => name === 'ngTemplateContextGuard');
  return {hasNgTemplateContextGuard, ngTemplateGuards};
}

function nodeStaticMethodNames(node: ClassDeclaration, reflector: ReflectionHost): string[] {
  return reflector.getMembersOfClass(node)
      .filter(member => member.kind === ClassMemberKind.Method && member.isStatic)
      .map(member => member.name);
}
