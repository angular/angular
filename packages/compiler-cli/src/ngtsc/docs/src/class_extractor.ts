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

import {
  ClassEntry,
  DirectiveEntry,
  EntryType,
  MemberTags,
  PipeEntry,
  PropertyEntry,
} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {ClassDeclarationLike, PropertiesExtractor} from './properties_extractor';

/** Extractor to pull info for API reference documentation for a TypeScript class or interface. */
class ClassExtractor extends PropertiesExtractor {
  constructor(
    declaration: {name: ts.Identifier} & ClassDeclarationLike,
    typeChecker: ts.TypeChecker,
  ) {
    super(declaration, typeChecker);
  }

  /** Extract docs info specific to classes. */
  override extract(): ClassEntry {
    return {
      name: this.declaration.name.text,
      isAbstract: this.isAbstract(),
      entryType: EntryType.UndecoratedClass,
      ...super.extract(),
      description: extractJsDocDescription(this.declaration),
      jsdocTags: extractJsDocTags(this.declaration),
      rawComment: extractRawJsDoc(this.declaration),
      extends: this.extractInheritance(this.declaration),
      implements: this.extractInterfaceConformance(this.declaration),
    };
  }

  /** Gets whether the declaration for this extractor is abstract. */
  private isAbstract(): boolean {
    const modifiers = this.declaration.modifiers ?? [];
    return modifiers.some((mod) => mod.kind === ts.SyntaxKind.AbstractKeyword);
  }

  private extractInheritance(declaration: ClassDeclarationLike): string | undefined {
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
}

/** Extractor to pull info for API reference documentation for an Angular directive. */
class DirectiveExtractor extends ClassExtractor {
  constructor(
    declaration: {name: ts.Identifier} & ts.ClassDeclaration,
    protected reference: Reference,
    protected metadata: DirectiveMeta,
    checker: ts.TypeChecker,
  ) {
    super(declaration, checker);
  }

  /** Extract docs info for directives and components (including underlying class info). */
  override extract(): DirectiveEntry {
    const selector = this.metadata.selector ?? '';
    const aliases = extractAliasesFromSelector(selector);

    return {
      ...super.extract(),
      isStandalone: this.metadata.isStandalone,
      selector,
      exportAs: this.metadata.exportAs ?? [],
      entryType: this.metadata.isComponent ? EntryType.Component : EntryType.Directive,
      ...(aliases.length > 0 && {aliases}),
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
    declaration: {name: ts.Identifier} & ts.ClassDeclaration,
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
    declaration: {name: ts.Identifier} & ts.ClassDeclaration,
    protected reference: Reference,
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
  classDeclaration: {name: ts.Identifier} & ts.ClassDeclaration,
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
    extractor = new NgModuleExtractor(classDeclaration, ref, typeChecker);
  } else {
    extractor = new ClassExtractor(classDeclaration, typeChecker);
  }

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

/**
 * Extracts aliases from a selector string.
 *
 * Parses selectors like:
 * - `[ngTabs]` => `['ngTabs']`
 * - `input[ngComboboxInput]` => `['ngComboboxInput']`
 * - `ng-template[ngComboboxPopupContainer]` => `['ngComboboxPopupContainer']`
 * - `[attr1][attr2]` => `['attr1', 'attr2']`
 * - `.class-name` => `[]` (classes are not extracted)
 *
 * @param selector The CSS selector string from directive/component metadata
 * @returns Array of attribute names that can be used as aliases
 */
function extractAliasesFromSelector(selector: string): string[] {
  if (!selector) {
    return [];
  }

  const aliases: string[] = [];
  // Match attribute selectors: [attributeName] or element[attributeName]
  // This regex captures the attribute name inside square brackets
  const attributeRegex = /\[([^\]=]+)(?:=[^\]]+)?\]/g;

  let match: RegExpExecArray | null;
  while ((match = attributeRegex.exec(selector)) !== null) {
    const attributeName = match[1].trim();
    // Skip empty attributes
    if (attributeName) {
      aliases.push(attributeName);
    }
  }

  return aliases;
}
