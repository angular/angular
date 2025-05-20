/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DirectiveMeta as T2DirectiveMeta, Expression, SchemaMetadata} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration} from '../../reflection';

import {ClassPropertyMapping, ClassPropertyName, InputOrOutput} from './property_mapping';

/**
 * Metadata collected for an `NgModule`.
 */
export interface NgModuleMeta {
  kind: MetaKind.NgModule;
  ref: Reference<ClassDeclaration>;
  declarations: Reference<ClassDeclaration>[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
  schemas: SchemaMetadata[];

  /**
   * Whether the module had some issue being analyzed.
   * This means it likely does not have complete and reliable metadata.
   */
  isPoisoned: boolean;

  /**
   * The raw `ts.Expression` which gave rise to `declarations`, if one exists.
   *
   * If this is `null`, then either no declarations exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawDeclarations: ts.Expression | null;

  /**
   * The raw `ts.Expression` which gave rise to `imports`, if one exists.
   *
   * If this is `null`, then either no imports exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawImports: ts.Expression | null;

  /**
   * The raw `ts.Expression` which gave rise to `exports`, if one exists.
   *
   * If this is `null`, then either no exports exist, or no expression was available (likely
   * because the module came from a .d.ts file).
   */
  rawExports: ts.Expression | null;

  /**
   * The primary decorator associated with this `ngModule`.
   *
   * If this is `null`, no decorator exists, meaning it's probably from a .d.ts file.
   */
  decorator: ts.Decorator | null;

  /**
   * Whether this NgModule may declare providers.
   *
   * If the compiler does not know if the NgModule may declare providers, this will be `true` (for
   * example, NgModules declared outside the current compilation are assumed to declare providers).
   */
  mayDeclareProviders: boolean;
}

/**
 * Typing metadata collected for a directive within an NgModule's scope.
 */
export interface DirectiveTypeCheckMeta {
  /**
   * List of static `ngTemplateGuard_xx` members found on the Directive's class.
   * @see `TemplateGuardMeta`
   */
  ngTemplateGuards: TemplateGuardMeta[];

  /**
   * Whether the Directive's class has a static ngTemplateContextGuard function.
   */
  hasNgTemplateContextGuard: boolean;

  /**
   * The set of input fields which have a corresponding static `ngAcceptInputType_` on the
   * Directive's class. This allows inputs to accept a wider range of types and coerce the input to
   * a narrower type with a getter/setter. See https://angular.dev/tools/cli/template-typecheck.
   */
  coercedInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which map to `readonly`, `private`, or `protected` members in the
   * Directive's class.
   */
  restrictedInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which are declared as string literal members in the Directive's class.
   * We need to track these separately because these fields may not be valid JS identifiers so
   * we cannot use them with property access expressions when assigning inputs.
   */
  stringLiteralInputFields: Set<ClassPropertyName>;

  /**
   * The set of input fields which do not have corresponding members in the Directive's class.
   */
  undeclaredInputFields: Set<ClassPropertyName>;

  /**
   * Whether the Directive's class is generic, i.e. `class MyDir<T> {...}`.
   */
  isGeneric: boolean;
}

/**
 * Disambiguates different kinds of compiler metadata objects.
 */
export enum MetaKind {
  Directive,
  Pipe,
  NgModule,
}

/**
 * Possible ways that a directive can be matched.
 */
export enum MatchSource {
  /** The directive was matched by its selector. */
  Selector,

  /** The directive was applied as a host directive. */
  HostDirective,
}

/** Metadata for a single input mapping. */
export type InputMapping = InputOrOutput & {
  required: boolean;

  /**
   * Transform for the input. Null if no transform is configured.
   *
   * For signal-based inputs, this is always `null` even if a transform
   * is configured. Signal inputs capture their transform write type
   * automatically in the `InputSignal`, nor is there a need to emit a
   * reference to the transform.
   *
   * For zone-based decorator `@Input`s this is different because the transform
   * write type needs to be captured in a coercion member as the decorator information
   * is lost in the `.d.ts` for type-checking.
   */
  transform: DecoratorInputTransform | null;
};

/** Metadata for a model mapping. */
export interface ModelMapping {
  /** Node defining the model mapping. */
  call: ts.CallExpression;

  /** Information about the input declared by the model. */
  input: InputMapping;

  /** Information about the output implicitly declared by the model. */
  output: InputOrOutput;
}

/** Metadata for an `@Input()` transform function. */
export interface DecoratorInputTransform {
  /**
   * Reference to the transform function so that it can be
   * referenced when the input metadata is emitted in the declaration.
   */
  node: ts.Node;
  /**
   * Emittable type for the input transform. Null for signal inputs
   *
   * This type will be used for inputs to capture the transform type
   * for type-checking in corresponding `ngAcceptInputType_` members.
   */
  type: Reference<ts.TypeNode>;
}

/**
 * Metadata collected for a directive within an NgModule's scope.
 */
export interface DirectiveMeta extends T2DirectiveMeta, DirectiveTypeCheckMeta {
  kind: MetaKind.Directive;

  /** Way in which the directive was matched. */
  matchSource: MatchSource;

  ref: Reference<ClassDeclaration>;
  /**
   * Unparsed selector of the directive, or null if the directive does not have a selector.
   */
  selector: string | null;
  queries: string[];

  /**
   * A mapping of input field names to the property names.
   */
  inputs: ClassPropertyMapping<InputMapping>;

  /**
   * List of input fields that were defined in the class decorator
   * metadata. Null for directives extracted from `.d.ts`
   */
  inputFieldNamesFromMetadataArray: Set<string> | null;

  /**
   * A mapping of output field names to the property names.
   */
  outputs: ClassPropertyMapping;

  /**
   * A `Reference` to the base class for the directive, if one was detected.
   *
   * A value of `'dynamic'` indicates that while the analyzer detected that this directive extends
   * another type, it could not statically determine the base class.
   */
  baseClass: Reference<ClassDeclaration> | 'dynamic' | null;

  /**
   * Whether the directive had some issue with its declaration that means it might not have complete
   * and reliable metadata.
   */
  isPoisoned: boolean;

  /**
   * Whether the directive is likely a structural directive (injects `TemplateRef`).
   */
  isStructural: boolean;

  /**
   * Whether the directive is a standalone entity.
   */
  isStandalone: boolean;

  /**
   * Whether the directive is a signal entity.
   */
  isSignal: boolean;

  /**
   * For standalone components, the list of imported types.
   */
  imports: Reference<ClassDeclaration>[] | null;

  /**
   * Node declaring the `imports` of a standalone component. Used to produce diagnostics.
   */
  rawImports: ts.Expression | null;

  /**
   * For standalone components, the list of imported types that can be used
   * in `@defer` blocks (when only explicit dependencies are allowed).
   */
  deferredImports: Reference<ClassDeclaration>[] | null;

  /**
   * For standalone components, the list of schemas declared.
   */
  schemas: SchemaMetadata[] | null;

  /**
   * The primary decorator associated with this directive.
   *
   * If this is `null`, no decorator exists, meaning it's probably from a .d.ts file.
   */
  decorator: ts.Decorator | null;

  /** Additional directives applied to the directive host. */
  hostDirectives: HostDirectiveMeta[] | null;

  /**
   * Whether the directive should be assumed to export providers if imported as a standalone type.
   */
  assumedToExportProviders: boolean;

  /**
   * Whether this class was imported into a standalone component's
   * scope via `@Component.deferredImports` field.
   */
  isExplicitlyDeferred: boolean;

  /** Whether selectorless is enabled for the specific component. */
  selectorlessEnabled: boolean;

  /**
   * Names of the symbols within the source file that are referenced directly inside the template.
   */
  localReferencedSymbols: Set<string> | null;
}

/** Metadata collected about an additional directive that is being applied to a directive host. */
export interface HostDirectiveMeta {
  /**
   * Reference to the host directive class.
   *
   * Only in local compilation mode this can be Expression
   * which indicates the expression could not be resolved due to being imported from some external
   * file. In this case, the expression is the raw expression as appears in the decorator.
   */
  directive: Reference<ClassDeclaration> | Expression;

  /** Whether the reference to the host directive is a forward reference. */
  isForwardReference: boolean;

  /** Inputs from the host directive that have been exposed. */
  inputs: {[publicName: string]: string} | null;

  /** Outputs from the host directive that have been exposed. */
  outputs: {[publicName: string]: string} | null;
}

/**
 * Metadata collected about an additional directive that is being applied to a directive host in
 * global compilation mode.
 */
export interface HostDirectiveMetaForGlobalMode extends HostDirectiveMeta {
  directive: Reference<ClassDeclaration>;
}

/**
 * Metadata collected about an additional directive that is being applied to a directive host in
 * local compilation mode.
 */
export interface HostDirectiveMetaForLocalMode extends HostDirectiveMeta {
  directive: Expression;
}

/**
 * Metadata that describes a template guard for one of the directive's inputs.
 */
export interface TemplateGuardMeta {
  /**
   * The input name that this guard should be applied to.
   */
  inputName: string;

  /**
   * Represents the type of the template guard.
   *
   * - 'invocation' means that a call to the template guard function is emitted so that its return
   *   type can result in narrowing of the input type.
   * - 'binding' means that the input binding expression itself is used as template guard.
   */
  type: 'invocation' | 'binding';
}

/**
 * Metadata for a pipe within an NgModule's scope.
 */
export interface PipeMeta {
  kind: MetaKind.Pipe;
  ref: Reference<ClassDeclaration>;
  name: string | null;
  nameExpr: ts.Expression | null;
  isStandalone: boolean;
  isPure: boolean;
  decorator: ts.Decorator | null;
  isExplicitlyDeferred: boolean;
}

/**
 * Reads metadata for directives, pipes, and modules from a particular source, such as .d.ts files
 * or a registry.
 */
export interface MetadataReader {
  getDirectiveMetadata(node: Reference<ClassDeclaration>): DirectiveMeta | null;
  getNgModuleMetadata(node: Reference<ClassDeclaration>): NgModuleMeta | null;
  getPipeMetadata(node: Reference<ClassDeclaration>): PipeMeta | null;
}

/**
 * A MetadataReader which also allows access to the set of all known trait classes.
 */
export interface MetadataReaderWithIndex extends MetadataReader {
  getKnown(kind: MetaKind): Array<ClassDeclaration>;
}

/**
 * An NgModuleIndex allows access to information about traits exported by NgModules.
 */
export interface NgModuleIndex {
  getNgModulesExporting(directiveOrPipe: ClassDeclaration): Array<Reference<ClassDeclaration>>;
}

/**
 * Registers new metadata for directives, pipes, and modules.
 */
export interface MetadataRegistry {
  registerDirectiveMetadata(meta: DirectiveMeta): void;
  registerNgModuleMetadata(meta: NgModuleMeta): void;
  registerPipeMetadata(meta: PipeMeta): void;
}
