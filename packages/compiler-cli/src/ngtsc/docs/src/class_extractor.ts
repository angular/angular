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
  DirectiveMeta,
  InputMapping,
  InputOrOutput,
  MetadataReader,
  NgModuleMeta,
  PipeMeta,
} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {
  ClassEntry,
  DirectiveEntry,
  EntryType,
  InterfaceEntry,
  MemberEntry,
  MemberTags,
  MemberType,
  MethodEntry,
  PipeEntry,
  PropertyEntry,
} from './entities';
import {isAngularPrivateName} from './filters';
import {FunctionExtractor} from './function_extractor';
import {extractGenerics} from './generics_extractor';
import {isInternal} from './internal';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';

// For the purpose of extraction, we can largely treat properties and accessors the same.

/** A class member declaration that is *like* a property (including accessors) */
type PropertyDeclarationLike = ts.PropertyDeclaration | ts.AccessorDeclaration;

// For the purposes of extraction, we can treat interfaces as identical to classes
// with a couple of shorthand types to normalize over the differences between them.

/** Type representing either a class declaration ro an interface declaration. */
type ClassDeclarationLike = ts.ClassDeclaration | ts.InterfaceDeclaration;

/** Type representing either a class or interface member. */
type MemberElement = ts.ClassElement | ts.TypeElement;

/** Type representing a signature element of an interface. */
type SignatureElement = ts.CallSignatureDeclaration | ts.ConstructSignatureDeclaration;

/**
 * Type representing either:
 */
type MethodLike = ts.MethodDeclaration | ts.MethodSignature;

/**
 * Type representing either a class property declaration or an interface property signature.
 */
type PropertyLike = PropertyDeclarationLike | ts.PropertySignature;

/** Extractor to pull info for API reference documentation for a TypeScript class or interface. */
class ClassExtractor {
  constructor(
    protected declaration: ClassDeclaration & ClassDeclarationLike,
    protected typeChecker: ts.TypeChecker,
  ) {}

  /** Extract docs info specific to classes. */
  extract(): ClassEntry {
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
  protected extractAllClassMembers(): MemberEntry[] {
    const members: MemberEntry[] = [];

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
  protected extractClassMember(memberDeclaration: MemberElement): MemberEntry | undefined {
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
  protected extractSignatures(): MemberEntry[] {
    return this.computeAllSignatureDeclarations().map((s) => this.extractSignature(s));
  }

  /** Extracts docs for a class method. */
  protected extractMethod(methodDeclaration: MethodLike): MethodEntry {
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
  protected extractSignature(signature: SignatureElement): MethodEntry {
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
  protected extractClassProperty(propertyDeclaration: PropertyLike): PropertyEntry {
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
  protected extractGetterSetter(accessor: ts.AccessorDeclaration): PropertyEntry {
    return {
      ...this.extractClassProperty(accessor),
      memberType: ts.isGetAccessor(accessor) ? MemberType.Getter : MemberType.Setter,
    };
  }

  protected extractConstructor(constructorDeclaration: ts.ConstructorDeclaration): MethodEntry {
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

  protected extractInheritance(
    declaration: ClassDeclaration & ClassDeclarationLike,
  ): string | undefined {
    if (!declaration.heritageClauses) {
      return undefined;
    }

    for (const clause of declaration.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        // We are assuming a single class can only extend one class.
        const types = clause.types;
        if (types.length > 0) {
          const baseClass: ts.ExpressionWithTypeArguments = types[0];
          return baseClass.getText();
        }
      }
    }

    return undefined;
  }
  protected extractInterfaceConformance(
    declaration: ClassDeclaration & ClassDeclarationLike,
  ): string[] {
    const implementClause = declaration.heritageClauses?.find(
      (clause) => clause.token === ts.SyntaxKind.ImplementsKeyword,
    );

    return implementClause?.types.map((m) => m.getText()) ?? [];
  }

  /** Gets the tags for a member (protected, readonly, static, etc.) */
  protected getMemberTags(
    member: MethodLike | PropertyLike | ts.ConstructorDeclaration,
  ): MemberTags[] {
    const tags: MemberTags[] = this.getMemberTagsFromModifiers(member.modifiers ?? []);

    if (member.questionToken) {
      tags.push(MemberTags.Optional);
    }

    if (member.parent !== this.declaration) {
      tags.push(MemberTags.Inherited);
    }

    return tags;
  }

  /** Computes all signature declarations of the class/interface. */
  private computeAllSignatureDeclarations(): SignatureElement[] {
    const type = this.typeChecker.getTypeAtLocation(this.declaration);
    const signatures = [...type.getCallSignatures(), ...type.getConstructSignatures()];

    const result: SignatureElement[] = [];
    for (const signature of signatures) {
      const decl = signature.getDeclaration();
      if (this.isDocumentableSignature(decl) && this.isDocumentableMember(decl)) {
        result.push(decl);
      }
    }

    return result;
  }

  /** Gets all member declarations, including inherited members. */
  private getMemberDeclarations(): MemberElement[] {
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

    const result: MemberElement[] = [];
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
  private filterMethodOverloads(declarations: ts.Declaration[]): ts.Declaration[] {
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
  private getMemberTagsFromModifiers(mods: Iterable<ts.ModifierLike>): MemberTags[] {
    const tags: MemberTags[] = [];
    for (const mod of mods) {
      const tag = this.getTagForMemberModifier(mod);
      if (tag) tags.push(tag);
    }
    return tags;
  }

  /** Gets the doc tag corresponding to a class member modifier (readonly, protected, etc.). */
  private getTagForMemberModifier(mod: ts.ModifierLike): MemberTags | undefined {
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
  private isMemberExcluded(member: MemberElement): boolean {
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
  private isDocumentableMember(
    member: ts.Node,
  ): member is MethodLike | PropertyLike | ts.CallSignatureDeclaration {
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
  private isPublicConstructorParameterProperty(node: ts.Node): boolean {
    if (ts.isParameterPropertyDeclaration(node, node.parent) && node.modifiers) {
      return node.modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PublicKeyword);
    }
    return false;
  }

  /** Gets whether a member is a property. */
  private isProperty(member: ts.Node): member is PropertyLike {
    // Classes have declarations, interface have signatures
    return (
      ts.isPropertyDeclaration(member) ||
      ts.isPropertySignature(member) ||
      this.isPublicConstructorParameterProperty(member)
    );
  }

  /** Gets whether a member is a method. */
  private isMethod(member: ts.Node): member is MethodLike {
    // Classes have declarations, interface have signatures
    return ts.isMethodDeclaration(member) || ts.isMethodSignature(member);
  }

  /** Gets whether the given signature declaration is documentable. */
  private isDocumentableSignature(
    signature: ts.SignatureDeclaration,
  ): signature is SignatureElement {
    return (
      ts.isConstructSignatureDeclaration(signature) || ts.isCallSignatureDeclaration(signature)
    );
  }

  /** Gets whether the declaration for this extractor is abstract. */
  private isAbstract(): boolean {
    const modifiers = this.declaration.modifiers ?? [];
    return modifiers.some((mod) => mod.kind === ts.SyntaxKind.AbstractKeyword);
  }

  /**
   * Check wether a member has a private computed property name like [ɵWRITABLE_SIGNAL]
   *
   * This will prevent exposing private computed properties in the docs.
   */
  private hasPrivateComputedProperty(property: PropertyLike) {
    return (
      ts.isComputedPropertyName(property.name) && property.name.expression.getText().startsWith('ɵ')
    );
  }
}

/** Extractor to pull info for API reference documentation for an Angular directive. */
class DirectiveExtractor extends ClassExtractor {
  constructor(
    declaration: ClassDeclaration & ts.ClassDeclaration,
    protected reference: Reference,
    protected metadata: DirectiveMeta,
    checker: ts.TypeChecker,
  ) {
    super(declaration, checker);
  }

  /** Extract docs info for directives and components (including underlying class info). */
  override extract(): DirectiveEntry {
    return {
      ...super.extract(),
      isStandalone: this.metadata.isStandalone,
      selector: this.metadata.selector ?? '',
      exportAs: this.metadata.exportAs ?? [],
      entryType: this.metadata.isComponent ? EntryType.Component : EntryType.Directive,
    };
  }

  /** Extracts docs info for a directive property, including input/output metadata. */
  override extractClassProperty(propertyDeclaration: ts.PropertyDeclaration): PropertyEntry {
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
  private getInputMetadata(prop: ts.PropertyDeclaration): InputMapping | undefined {
    const propName = prop.name.getText();
    return this.metadata.inputs?.getByClassPropertyName(propName) ?? undefined;
  }

  /** Gets the output metadata for a directive property. */
  private getOutputMetadata(prop: ts.PropertyDeclaration): InputOrOutput | undefined {
    const propName = prop.name.getText();
    return this.metadata?.outputs?.getByClassPropertyName(propName) ?? undefined;
  }
}

/** Extractor to pull info for API reference documentation for an Angular pipe. */
class PipeExtractor extends ClassExtractor {
  constructor(
    declaration: ClassDeclaration & ts.ClassDeclaration,
    protected reference: Reference,
    private metadata: PipeMeta,
    typeChecker: ts.TypeChecker,
  ) {
    super(declaration, typeChecker);
  }

  override extract(): PipeEntry {
    return {
      ...super.extract(),
      pipeName: this.metadata.name,
      entryType: EntryType.Pipe,
      isStandalone: this.metadata.isStandalone,
      usage: extractPipeSyntax(this.metadata, this.declaration as ts.ClassDeclaration),
      isPure: this.metadata.isPure,
    };
  }
}

/** Extractor to pull info for API reference documentation for an Angular pipe. */
class NgModuleExtractor extends ClassExtractor {
  constructor(
    declaration: ClassDeclaration & ts.ClassDeclaration,
    protected reference: Reference,
    private metadata: NgModuleMeta,
    typeChecker: ts.TypeChecker,
  ) {
    super(declaration, typeChecker);
  }

  override extract(): ClassEntry {
    return {
      ...super.extract(),
      entryType: EntryType.NgModule,
    };
  }
}

/** Extracts documentation info for a class, potentially including Angular-specific info.  */
export function extractClass(
  classDeclaration: ClassDeclaration & ts.ClassDeclaration,
  metadataReader: MetadataReader,
  typeChecker: ts.TypeChecker,
): ClassEntry {
  const ref = new Reference(classDeclaration);

  let extractor: ClassExtractor;

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
export function extractInterface(
  declaration: ts.InterfaceDeclaration,
  typeChecker: ts.TypeChecker,
): InterfaceEntry {
  const extractor = new ClassExtractor(declaration, typeChecker);
  return extractor.extract();
}

function extractPipeSyntax(metadata: PipeMeta, classDeclaration: ts.ClassDeclaration): string {
  const transformParams = classDeclaration.members.find((member) => {
    return (
      ts.isMethodDeclaration(member) &&
      member.name &&
      ts.isIdentifier(member.name) &&
      member.name.getText() === 'transform'
    );
  }) as ts.MethodDeclaration;

  let paramNames = transformParams.parameters
    // value is the first argument, it's already referenced before the pipe
    .slice(1)
    .map((param) => {
      return param.name.getText();
    });

  return `{{ value_expression | ${metadata.name}${paramNames.length ? ':' + paramNames.join(':') : ''} }}`;
}
