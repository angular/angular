/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {Reference} from '../../imports';
import {EntryType, MemberTags, MemberType} from './entities';
import {isAngularPrivateName} from './filters';
import {FunctionExtractor} from './function_extractor';
import {extractGenerics} from './generics_extractor';
import {isInternal} from './internal';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';
/** Extractor to pull info for API reference documentation for a TypeScript class or interface. */
class ClassExtractor {
  declaration;
  typeChecker;
  constructor(declaration, typeChecker) {
    this.declaration = declaration;
    this.typeChecker = typeChecker;
  }
  /** Extract docs info specific to classes. */
  extract() {
    return {
      name: this.declaration.name.text,
      isAbstract: this.isAbstract(),
      entryType: ts.isInterfaceDeclaration(this.declaration)
        ? EntryType.Interface
        : EntryType.UndecoratedClass,
      members: this.extractSignatures().concat(this.extractAllClassMembers()),
      generics: extractGenerics(this.declaration),
      description: extractJsDocDescription(this.declaration),
      jsdocTags: extractJsDocTags(this.declaration),
      rawComment: extractRawJsDoc(this.declaration),
      extends: this.extractInheritance(this.declaration),
      implements: this.extractInterfaceConformance(this.declaration),
    };
  }
  /** Extracts doc info for a class's members. */
  extractAllClassMembers() {
    const members = [];
    for (const member of this.getMemberDeclarations()) {
      if (this.isMemberExcluded(member)) continue;
      const memberEntry = this.extractClassMember(member);
      if (memberEntry) {
        members.push(memberEntry);
      }
    }
    return members;
  }
  /** Extract docs for a class's members (methods and properties).  */
  extractClassMember(memberDeclaration) {
    if (this.isMethod(memberDeclaration)) {
      return this.extractMethod(memberDeclaration);
    } else if (
      this.isProperty(memberDeclaration) &&
      !this.hasPrivateComputedProperty(memberDeclaration)
    ) {
      return this.extractClassProperty(memberDeclaration);
    } else if (ts.isAccessor(memberDeclaration)) {
      return this.extractGetterSetter(memberDeclaration);
    } else if (
      ts.isConstructorDeclaration(memberDeclaration) &&
      memberDeclaration.parameters.length > 0
    ) {
      return this.extractConstructor(memberDeclaration);
    }
    // We only expect methods, properties, and accessors. If we encounter something else,
    // return undefined and let the rest of the program filter it out.
    return undefined;
  }
  /** Extract docs for all call signatures in the current class/interface. */
  extractSignatures() {
    return this.computeAllSignatureDeclarations().map((s) => this.extractSignature(s));
  }
  /** Extracts docs for a class method. */
  extractMethod(methodDeclaration) {
    const functionExtractor = new FunctionExtractor(
      methodDeclaration.name.getText(),
      methodDeclaration,
      this.typeChecker,
    );
    return {
      ...functionExtractor.extract(),
      memberType: MemberType.Method,
      memberTags: this.getMemberTags(methodDeclaration),
    };
  }
  /** Extracts docs for a signature element (usually inside an interface). */
  extractSignature(signature) {
    // No name for the function if we are dealing with call signatures.
    // For construct signatures we are using `new` as the name of the function for now.
    // TODO: Consider exposing a new entry type for signature types.
    const functionExtractor = new FunctionExtractor(
      ts.isConstructSignatureDeclaration(signature) ? 'new' : '',
      signature,
      this.typeChecker,
    );
    return {
      ...functionExtractor.extract(),
      memberType: MemberType.Method,
      memberTags: [],
    };
  }
  /** Extracts doc info for a property declaration. */
  extractClassProperty(propertyDeclaration) {
    return {
      name: propertyDeclaration.name.getText(),
      type: extractResolvedTypeString(propertyDeclaration, this.typeChecker),
      memberType: MemberType.Property,
      memberTags: this.getMemberTags(propertyDeclaration),
      description: extractJsDocDescription(propertyDeclaration),
      jsdocTags: extractJsDocTags(propertyDeclaration),
    };
  }
  /** Extracts doc info for an accessor member (getter/setter). */
  extractGetterSetter(accessor) {
    return {
      ...this.extractClassProperty(accessor),
      memberType: ts.isGetAccessor(accessor) ? MemberType.Getter : MemberType.Setter,
    };
  }
  extractConstructor(constructorDeclaration) {
    const functionExtractor = new FunctionExtractor(
      'constructor',
      constructorDeclaration,
      this.typeChecker,
    );
    return {
      ...functionExtractor.extract(),
      memberType: MemberType.Method,
      memberTags: this.getMemberTags(constructorDeclaration),
    };
  }
  extractInheritance(declaration) {
    if (!declaration.heritageClauses) {
      return undefined;
    }
    for (const clause of declaration.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        // We are assuming a single class can only extend one class.
        const types = clause.types;
        if (types.length > 0) {
          const baseClass = types[0];
          return baseClass.getText();
        }
      }
    }
    return undefined;
  }
  extractInterfaceConformance(declaration) {
    const implementClause = declaration.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ImplementsKeyword,
    );
    return implementClause?.types.map((m) => m.getText()) ?? [];
  }
  /** Gets the tags for a member (protected, readonly, static, etc.) */
  getMemberTags(member) {
    const tags = this.getMemberTagsFromModifiers(member.modifiers ?? []);
    if (member.questionToken) {
      tags.push(MemberTags.Optional);
    }
    if (member.parent !== this.declaration) {
      tags.push(MemberTags.Inherited);
    }
    return tags;
  }
  /** Computes all signature declarations of the class/interface. */
  computeAllSignatureDeclarations() {
    const type = this.typeChecker.getTypeAtLocation(this.declaration);
    const signatures = [...type.getCallSignatures(), ...type.getConstructSignatures()];
    const result = [];
    for (const signature of signatures) {
      const decl = signature.getDeclaration();
      if (this.isDocumentableSignature(decl) && this.isDocumentableMember(decl)) {
        result.push(decl);
      }
    }
    return result;
  }
  /** Gets all member declarations, including inherited members. */
  getMemberDeclarations() {
    // We rely on TypeScript to resolve all the inherited members to their
    // ultimate form via `getProperties`. This is important because child
    // classes may narrow types or add method overloads.
    const type = this.typeChecker.getTypeAtLocation(this.declaration);
    const members = type.getProperties();
    const constructor = type.getSymbol()?.members?.get(ts.InternalSymbolName.Constructor);
    // While the properties of the declaration type represent the properties that exist
    // on a class *instance*, static members are properties on the class symbol itself.
    const typeOfConstructor = this.typeChecker.getTypeOfSymbol(type.symbol);
    const staticMembers = typeOfConstructor.getProperties();
    const result = [];
    for (const member of [...(constructor ? [constructor] : []), ...members, ...staticMembers]) {
      // A member may have multiple declarations in the case of function overloads.
      const memberDeclarations = this.filterMethodOverloads(member.getDeclarations() ?? []);
      for (const memberDeclaration of memberDeclarations) {
        if (this.isDocumentableMember(memberDeclaration)) {
          result.push(memberDeclaration);
        }
      }
    }
    return result;
  }
  /** The result only contains properties, method implementations and abstracts */
  filterMethodOverloads(declarations) {
    return declarations.filter((declaration, index) => {
      // Check if the declaration is a function or method
      if (
        ts.isFunctionDeclaration(declaration) ||
        ts.isMethodDeclaration(declaration) ||
        ts.isConstructorDeclaration(declaration)
      ) {
        // TypeScript ensures that all declarations for a given abstract method appear consecutively.
        const nextDeclaration = declarations[index + 1];
        const isNextMethodWithSameName =
          nextDeclaration &&
          ((ts.isMethodDeclaration(nextDeclaration) &&
            nextDeclaration.name.getText() === declaration.name?.getText()) ||
            (ts.isConstructorDeclaration(nextDeclaration) &&
              ts.isConstructorDeclaration(declaration)));
        // Return only the last occurrence of a method to avoid overload duplication.
        // Subsequent overloads or implementations are handled separately by the function extractor.
        return !isNextMethodWithSameName;
      }
      // Include non-method declarations, such as properties, without filtering.
      return true;
    });
  }
  /** Get the tags for a member that come from the declaration modifiers. */
  getMemberTagsFromModifiers(mods) {
    const tags = [];
    for (const mod of mods) {
      const tag = this.getTagForMemberModifier(mod);
      if (tag) tags.push(tag);
    }
    return tags;
  }
  /** Gets the doc tag corresponding to a class member modifier (readonly, protected, etc.). */
  getTagForMemberModifier(mod) {
    switch (mod.kind) {
      case ts.SyntaxKind.StaticKeyword:
        return MemberTags.Static;
      case ts.SyntaxKind.ReadonlyKeyword:
        return MemberTags.Readonly;
      case ts.SyntaxKind.ProtectedKeyword:
        return MemberTags.Protected;
      case ts.SyntaxKind.AbstractKeyword:
        return MemberTags.Abstract;
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
   *  - The member has a name that marks it as Angular-internal.
   *  - The member is marked as internal via JSDoc.
   */
  isMemberExcluded(member) {
    if (ts.isConstructorDeclaration(member)) {
      // A constructor has no name
      return false;
    }
    return (
      !member.name ||
      !this.isDocumentableMember(member) ||
      (!ts.isCallSignatureDeclaration(member) &&
        member.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.PrivateKeyword)) ||
      member.name.getText() === 'prototype' ||
      isAngularPrivateName(member.name.getText()) ||
      isInternal(member)
    );
  }
  /** Gets whether a class member is a method, property, or accessor. */
  isDocumentableMember(member) {
    return (
      this.isMethod(member) ||
      this.isProperty(member) ||
      ts.isAccessor(member) ||
      ts.isConstructorDeclaration(member) ||
      // Signatures are documentable if they are part of an interface.
      ts.isCallSignatureDeclaration(member)
    );
  }
  /** Check if the parameter is a constructor parameter with a public modifier */
  isPublicConstructorParameterProperty(node) {
    if (ts.isParameterPropertyDeclaration(node, node.parent) && node.modifiers) {
      return node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PublicKeyword);
    }
    return false;
  }
  /** Gets whether a member is a property. */
  isProperty(member) {
    // Classes have declarations, interface have signatures
    return (
      ts.isPropertyDeclaration(member) ||
      ts.isPropertySignature(member) ||
      this.isPublicConstructorParameterProperty(member)
    );
  }
  /** Gets whether a member is a method. */
  isMethod(member) {
    // Classes have declarations, interface have signatures
    return ts.isMethodDeclaration(member) || ts.isMethodSignature(member);
  }
  /** Gets whether the given signature declaration is documentable. */
  isDocumentableSignature(signature) {
    return (
      ts.isConstructSignatureDeclaration(signature) || ts.isCallSignatureDeclaration(signature)
    );
  }
  /** Gets whether the declaration for this extractor is abstract. */
  isAbstract() {
    const modifiers = this.declaration.modifiers ?? [];
    return modifiers.some((mod) => mod.kind === ts.SyntaxKind.AbstractKeyword);
  }
  /**
   * Check wether a member has a private computed property name like [ɵWRITABLE_SIGNAL]
   *
   * This will prevent exposing private computed properties in the docs.
   */
  hasPrivateComputedProperty(property) {
    return (
      ts.isComputedPropertyName(property.name) && property.name.expression.getText().startsWith('ɵ')
    );
  }
}
/** Extractor to pull info for API reference documentation for an Angular directive. */
class DirectiveExtractor extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, checker) {
    super(declaration, checker);
    this.reference = reference;
    this.metadata = metadata;
  }
  /** Extract docs info for directives and components (including underlying class info). */
  extract() {
    return {
      ...super.extract(),
      isStandalone: this.metadata.isStandalone,
      selector: this.metadata.selector ?? '',
      exportAs: this.metadata.exportAs ?? [],
      entryType: this.metadata.isComponent ? EntryType.Component : EntryType.Directive,
    };
  }
  /** Extracts docs info for a directive property, including input/output metadata. */
  extractClassProperty(propertyDeclaration) {
    const entry = super.extractClassProperty(propertyDeclaration);
    const inputMetadata = this.getInputMetadata(propertyDeclaration);
    if (inputMetadata) {
      entry.memberTags.push(MemberTags.Input);
      entry.inputAlias = inputMetadata.bindingPropertyName;
      entry.isRequiredInput = inputMetadata.required;
    }
    const outputMetadata = this.getOutputMetadata(propertyDeclaration);
    if (outputMetadata) {
      entry.memberTags.push(MemberTags.Output);
      entry.outputAlias = outputMetadata.bindingPropertyName;
    }
    return entry;
  }
  /** Gets the input metadata for a directive property. */
  getInputMetadata(prop) {
    const propName = prop.name.getText();
    return this.metadata.inputs?.getByClassPropertyName(propName) ?? undefined;
  }
  /** Gets the output metadata for a directive property. */
  getOutputMetadata(prop) {
    const propName = prop.name.getText();
    return this.metadata?.outputs?.getByClassPropertyName(propName) ?? undefined;
  }
}
/** Extractor to pull info for API reference documentation for an Angular pipe. */
class PipeExtractor extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, typeChecker) {
    super(declaration, typeChecker);
    this.reference = reference;
    this.metadata = metadata;
  }
  extract() {
    return {
      ...super.extract(),
      pipeName: this.metadata.name,
      entryType: EntryType.Pipe,
      isStandalone: this.metadata.isStandalone,
      usage: extractPipeSyntax(this.metadata, this.declaration),
      isPure: this.metadata.isPure,
    };
  }
}
/** Extractor to pull info for API reference documentation for an Angular pipe. */
class NgModuleExtractor extends ClassExtractor {
  reference;
  metadata;
  constructor(declaration, reference, metadata, typeChecker) {
    super(declaration, typeChecker);
    this.reference = reference;
    this.metadata = metadata;
  }
  extract() {
    return {
      ...super.extract(),
      entryType: EntryType.NgModule,
    };
  }
}
/** Extracts documentation info for a class, potentially including Angular-specific info.  */
export function extractClass(classDeclaration, metadataReader, typeChecker) {
  const ref = new Reference(classDeclaration);
  let extractor;
  let directiveMetadata = metadataReader.getDirectiveMetadata(ref);
  let pipeMetadata = metadataReader.getPipeMetadata(ref);
  let ngModuleMetadata = metadataReader.getNgModuleMetadata(ref);
  if (directiveMetadata) {
    extractor = new DirectiveExtractor(classDeclaration, ref, directiveMetadata, typeChecker);
  } else if (pipeMetadata) {
    extractor = new PipeExtractor(classDeclaration, ref, pipeMetadata, typeChecker);
  } else if (ngModuleMetadata) {
    extractor = new NgModuleExtractor(classDeclaration, ref, ngModuleMetadata, typeChecker);
  } else {
    extractor = new ClassExtractor(classDeclaration, typeChecker);
  }
  return extractor.extract();
}
/** Extracts documentation info for an interface. */
export function extractInterface(declaration, typeChecker) {
  const extractor = new ClassExtractor(declaration, typeChecker);
  return extractor.extract();
}
function extractPipeSyntax(metadata, classDeclaration) {
  const transformParams = classDeclaration.members.find((member) => {
    return (
      ts.isMethodDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.name.getText() === 'transform'
    );
  });
  let paramNames = transformParams.parameters
    // value is the first argument, it's already referenced before the pipe
    .slice(1)
    .map((param) => {
      return param.name.getText();
    });
  return `{{ value_expression | ${metadata.name}${paramNames.length ? ':' + paramNames.join(':') : ''} }}`;
}
//# sourceMappingURL=class_extractor.js.map
