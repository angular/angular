/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {Reference} from '../../imports';
import {
  ClassMemberKind,
  isNamedClassDeclaration,
  reflectTypeEntityToDeclaration,
} from '../../reflection';
import {nodeDebugInfo} from '../../util/src/typescript';
import {TypeEntityToDeclarationError} from '../../reflection/src/typescript';
export function extractReferencesFromType(checker, def, bestGuessOwningModule) {
  if (!ts.isTupleTypeNode(def)) {
    return {result: [], isIncomplete: false};
  }
  const result = [];
  let isIncomplete = false;
  for (const element of def.elements) {
    if (!ts.isTypeQueryNode(element)) {
      throw new Error(`Expected TypeQueryNode: ${nodeDebugInfo(element)}`);
    }
    const ref = extraReferenceFromTypeQuery(checker, element, def, bestGuessOwningModule);
    // Note: Sometimes a reference inside the type tuple/array
    // may not be resolvable/existent. We proceed with incomplete data.
    if (ref === null) {
      isIncomplete = true;
    } else {
      result.push(ref);
    }
  }
  return {result, isIncomplete};
}
export function extraReferenceFromTypeQuery(checker, typeNode, origin, bestGuessOwningModule) {
  const type = typeNode.exprName;
  let node;
  let from;
  // Gracefully handle when the type entity could not be converted or
  // resolved to its declaration node.
  try {
    const result = reflectTypeEntityToDeclaration(type, checker);
    node = result.node;
    from = result.from;
  } catch (e) {
    if (e instanceof TypeEntityToDeclarationError) {
      return null;
    }
    throw e;
  }
  if (!isNamedClassDeclaration(node)) {
    throw new Error(`Expected named ClassDeclaration: ${nodeDebugInfo(node)}`);
  }
  if (from !== null && !from.startsWith('.')) {
    // The symbol was imported using an absolute module specifier so return a reference that
    // uses that absolute module specifier as its best guess owning module.
    return new Reference(node, {
      specifier: from,
      resolutionContext: origin.getSourceFile().fileName,
    });
  }
  // For local symbols or symbols that were imported using a relative module import it is
  // assumed that the symbol is exported from the provided best guess owning module.
  return new Reference(node, bestGuessOwningModule);
}
export function readBooleanType(type) {
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
export function readStringType(type) {
  if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
    return null;
  }
  return type.literal.text;
}
export function readMapType(type, valueTransform) {
  if (!ts.isTypeLiteralNode(type)) {
    return {};
  }
  const obj = {};
  type.members.forEach((member) => {
    if (
      !ts.isPropertySignature(member) ||
      member.type === undefined ||
      member.name === undefined ||
      (!ts.isStringLiteral(member.name) && !ts.isIdentifier(member.name))
    ) {
      return;
    }
    const value = valueTransform(member.type);
    if (value !== null) {
      obj[member.name.text] = value;
    }
  });
  return obj;
}
export function readStringArrayType(type) {
  if (!ts.isTupleTypeNode(type)) {
    return [];
  }
  const res = [];
  type.elements.forEach((el) => {
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
export function extractDirectiveTypeCheckMeta(node, inputs, reflector) {
  const members = reflector.getMembersOfClass(node);
  const staticMembers = members.filter((member) => member.isStatic);
  const ngTemplateGuards = staticMembers
    .map(extractTemplateGuard)
    .filter((guard) => guard !== null);
  const hasNgTemplateContextGuard = staticMembers.some(
    (member) => member.kind === ClassMemberKind.Method && member.name === 'ngTemplateContextGuard',
  );
  const coercedInputFields = new Set(
    staticMembers.map(extractCoercedInput).filter((inputName) => {
      // If the input refers to a signal input, we will not respect coercion members.
      // A transform function should be used instead.
      if (inputName === null || inputs.getByClassPropertyName(inputName)?.isSignal) {
        return false;
      }
      return true;
    }),
  );
  const restrictedInputFields = new Set();
  const stringLiteralInputFields = new Set();
  const undeclaredInputFields = new Set();
  for (const {classPropertyName, transform} of inputs) {
    const field = members.find((member) => member.name === classPropertyName);
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
    if (transform !== null) {
      coercedInputFields.add(classPropertyName);
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
function isRestricted(node) {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return (
    modifiers !== undefined &&
    modifiers.some(({kind}) => {
      return (
        kind === ts.SyntaxKind.PrivateKeyword ||
        kind === ts.SyntaxKind.ProtectedKeyword ||
        kind === ts.SyntaxKind.ReadonlyKeyword
      );
    })
  );
}
function extractTemplateGuard(member) {
  if (!member.name.startsWith('ngTemplateGuard_')) {
    return null;
  }
  const inputName = afterUnderscore(member.name);
  if (member.kind === ClassMemberKind.Property) {
    let type = null;
    if (
      member.type !== null &&
      ts.isLiteralTypeNode(member.type) &&
      ts.isStringLiteral(member.type.literal)
    ) {
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
function extractCoercedInput(member) {
  if (member.kind !== ClassMemberKind.Property || !member.name.startsWith('ngAcceptInputType_')) {
    return null;
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
export class CompoundMetadataReader {
  readers;
  constructor(readers) {
    this.readers = readers;
  }
  getDirectiveMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getDirectiveMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getNgModuleMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getNgModuleMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
  getPipeMetadata(node) {
    for (const reader of this.readers) {
      const meta = reader.getPipeMetadata(node);
      if (meta !== null) {
        return meta;
      }
    }
    return null;
  }
}
function afterUnderscore(str) {
  const pos = str.indexOf('_');
  if (pos === -1) {
    throw new Error(`Expected '${str}' to contain '_'`);
  }
  return str.slice(pos + 1);
}
/** Returns whether a class declaration has the necessary class fields to make it injectable. */
export function hasInjectableFields(clazz, host) {
  const members = host.getMembersOfClass(clazz);
  return members.some(({isStatic, name}) => isStatic && (name === 'ɵprov' || name === 'ɵfac'));
}
export function isHostDirectiveMetaForGlobalMode(hostDirectiveMeta) {
  return hostDirectiveMeta.directive instanceof Reference;
}
//# sourceMappingURL=util.js.map
