/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {MetadataReader} from '../../metadata';

import {ClassEntry, DocEntry, EntryType, FunctionEntry, MemberEntry, MemberTags, MemberType, MethodEntry, ParameterEntry, PropertyEntry} from './entities';


/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(private checker: ts.TypeChecker, private reader: MetadataReader) {}

  /**
   * Gets the set of all documentable entries from a source file.
   * @param sourceFile The file from which to extract documentable entries.
   */
  extractAll(sourceFile: ts.SourceFile): DocEntry[] {
    const entries: DocEntry[] = [];

    for (const statement of sourceFile.statements) {
      // TODO(jelbourn): get all of rest of the docs
      // TODO(jelbourn): ignore un-exported nodes
      if (ts.isClassDeclaration(statement)) {
        // Assume that anonymous classes should not be part of public documentation.
        if (!statement.name) continue;

        entries.push(this.extractClass(statement));
      }
    }

    return entries;
  }

  /** Extract docs info specific to classes. */
  private extractClass(classDeclaration: ts.ClassDeclaration): ClassEntry {
    // TODO(jelbourn): get all of the rest of the docs
    return {
      name: classDeclaration.name!.text,
      entryType: EntryType.undecorated_class,
      members: this.extractAllClassMembers(classDeclaration),
    };
  }

  /** Extracts doc info for a class's members. */
  private extractAllClassMembers(classDeclaration: ts.ClassDeclaration): MemberEntry[] {
    const members: MemberEntry[] = [];

    for (const member of classDeclaration.members) {
      if (this.isMemberExcluded(member)) continue;

      const memberEntry = this.extractClassMember(member);
      if (memberEntry) {
        members.push(memberEntry);
      }
    }

    return members;
  }

  /** Extract docs for a class's members (methods and properties).  */
  private extractClassMember(memberDeclaration: ts.ClassElement): MemberEntry|undefined {
    if (ts.isMethodDeclaration(memberDeclaration)) {
      return this.extractMethod(memberDeclaration);
    } else if (ts.isPropertyDeclaration(memberDeclaration)) {
      return this.extractClassProperty(memberDeclaration);
    }

    // We only expect methods and properties. If we encounter something else,
    // return undefined and let the rest of the program filter it out.
    return undefined;
  }

  /** Extracts docs for a class method. */
  private extractMethod(methodDeclaration: ts.MethodDeclaration): MethodEntry {
    return {
      ...this.extractFunction(methodDeclaration),
      memberType: MemberType.method,
      memberTags: this.getMemberTags(methodDeclaration),
    };
  }

  /** Extracts docs for a function, including class method declarations. */
  private extractFunction(fn: ts.FunctionDeclaration|ts.MethodDeclaration): FunctionEntry {
    return {
      params: this.extractAllParams(fn.parameters),
      // We know that the function has a name here because we would have skipped it
      // already before getting to this point if it was anonymous.
      name: fn.name!.getText(),
      returnType: 'TODO',
      entryType: EntryType.function,
    };
  }

  /** Extracts doc info for a collection of function parameters. */
  private extractAllParams(params: ts.NodeArray<ts.ParameterDeclaration>): ParameterEntry[] {
    // TODO: handle var args
    return params.map(param => ({
                        name: param.name.getText(),
                        description: 'TODO',
                        type: 'TODO',
                        isOptional: !!(param.questionToken || param.initializer),
                      }));
  }

  /** Extracts doc info for a property declaration. */
  private extractClassProperty(propertyDeclaration: ts.PropertyDeclaration): PropertyEntry {
    return {
      name: propertyDeclaration.name.getText(),
      getType: 'TODO',
      setType: 'TODO',
      memberType: MemberType.property,
      memberTags: this.getMemberTags(propertyDeclaration),
    };
  }

  /** Gets the tags for a member (protected, readonly, static, etc.) */
  private getMemberTags(member: ts.MethodDeclaration|ts.PropertyDeclaration): MemberTags[] {
    const tags: MemberTags[] = [];
    for (const mod of member.modifiers ?? []) {
      const tag = this.getTagForMemberModifier(mod);
      if (tag) tags.push(tag);
    }

    if (member.questionToken) {
      tags.push(MemberTags.optional);
    }

    // TODO: mark inputs and outputs

    return tags;
  }

  /** Gets the doc tag corresponding to a class member modifier (readonly, protected, etc.). */
  private getTagForMemberModifier(mod: ts.ModifierLike): MemberTags|undefined {
    switch (mod.kind) {
      case ts.SyntaxKind.StaticKeyword:
        return MemberTags.static;
      case ts.SyntaxKind.ReadonlyKeyword:
        return MemberTags.readonly;
      case ts.SyntaxKind.ProtectedKeyword:
        return MemberTags.protected;
      default:
        return undefined;
    }
  }

  /**
   * Gets whether a given class member should be excluded from public API docs.
   * This is the case if:
   *  - The member does not have a name
   *  - The member is neither a method nor property
   *  - The member is private
   */
  private isMemberExcluded(member: ts.ClassElement): boolean {
    return !member.name || !this.isMethodOrProperty(member) ||
        !!member.modifiers?.some(mod => mod.kind === ts.SyntaxKind.PrivateKeyword);
  }

  /** Gets whether a class member is either a member or a property. */
  private isMethodOrProperty(member: ts.ClassElement): member is ts.MethodDeclaration
      |ts.PropertyDeclaration {
    return ts.isMethodDeclaration(member) || ts.isPropertyDeclaration(member);
  }
}
