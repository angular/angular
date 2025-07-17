/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {FactoryTarget} from '../../compiler_facade_interface';
import {ChangeDetectionStrategy, ViewEncapsulation} from '../../core';
import * as o from '../../output/output_ast';

export interface R3PartialDeclaration {
  /**
   * The minimum version of the compiler that can process this partial declaration.
   */
  minVersion: string;

  /**
   * Version number of the Angular compiler that was used to compile this declaration. The linker
   * will be able to detect which version a library is using and interpret its metadata accordingly.
   */
  version: string;

  /**
   * A reference to the `@angular/core` ES module, which allows access
   * to all Angular exports, including Ivy instructions.
   */
  ngImport: o.Expression;

  /**
   * Reference to the decorated class, which is subject to this partial declaration.
   */
  type: o.Expression;
}

// TODO(legacy-partial-output-inputs): Remove in v18.
// https://github.com/angular/angular/blob/d4b423690210872b5c32a322a6090beda30b05a3/packages/core/src/compiler/compiler_facade_interface.ts#L197-L199
export type LegacyInputPartialMapping =
  | string
  | [bindingPropertyName: string, classPropertyName: string, transformFunction?: o.Expression];

/**
 * Describes the shape of the object that the `ɵɵngDeclareDirective()` function accepts.
 */
export interface R3DeclareDirectiveMetadata extends R3PartialDeclaration {
  /**
   * Unparsed selector of the directive.
   */
  selector?: string;

  /**
   * A mapping of inputs from class property names to binding property names, or to a tuple of
   * binding property name and class property name if the names are different.
   */
  inputs?: {
    [fieldName: string]:
      | {
          classPropertyName: string;
          publicName: string;
          isSignal: boolean;
          isRequired: boolean;
          transformFunction: o.Expression | null;
        }
      | LegacyInputPartialMapping;
  };

  /**
   * A mapping of outputs from class property names to binding property names.
   */
  outputs?: {[classPropertyName: string]: string};

  /**
   * Information about host bindings present on the component.
   */
  host?: {
    /**
     * A mapping of attribute names to their value expression.
     */
    attributes?: {[key: string]: o.Expression};

    /**
     * A mapping of event names to their unparsed event handler expression.
     */
    listeners: {[key: string]: string};

    /**
     * A mapping of bound properties to their unparsed binding expression.
     */
    properties?: {[key: string]: string};

    /**
     * The value of the class attribute, if present. This is stored outside of `attributes` as its
     * string value must be known statically.
     */
    classAttribute?: string;

    /**
     * The value of the style attribute, if present. This is stored outside of `attributes` as its
     * string value must be known statically.
     */
    styleAttribute?: string;
  };

  /**
   * Information about the content queries made by the directive.
   */
  queries?: R3DeclareQueryMetadata[];

  /**
   * Information about the view queries made by the directive.
   */
  viewQueries?: R3DeclareQueryMetadata[];

  /**
   * The list of providers provided by the directive.
   */
  providers?: o.Expression;

  /**
   * The names by which the directive is exported.
   */
  exportAs?: string[];

  /**
   * Whether the directive has an inheritance clause. Defaults to false.
   */
  usesInheritance?: boolean;

  /**
   * Whether the directive implements the `ngOnChanges` hook. Defaults to false.
   */
  usesOnChanges?: boolean;

  /**
   * Whether the directive is standalone. Defaults to false.
   */
  isStandalone?: boolean;

  /**
   * Whether the directive is a signal-based directive. Defaults to false.
   */
  isSignal?: boolean;

  boundListenersMarkForCheck?: boolean;

  /**
   * Additional directives applied to the directive host.
   */
  hostDirectives?: R3DeclareHostDirectiveMetadata[];
}

/**
 * Describes the shape of the object that the `ɵɵngDeclareComponent()` function accepts.
 */
export interface R3DeclareComponentMetadata extends R3DeclareDirectiveMetadata {
  /**
   * The component's unparsed template string as opaque expression. The template is represented
   * using either a string literal or template literal without substitutions, but its value is
   * not read directly. Instead, the template parser is given the full source file's text and
   * the range of this expression to parse directly from source.
   */
  template: o.Expression;

  /**
   * Whether the template was inline (using `template`) or external (using `templateUrl`).
   * Defaults to false.
   */
  isInline?: boolean;

  /**
   * CSS from inline styles and included styleUrls.
   */
  styles?: string[];

  /**
   * List of components which matched in the template, including sufficient
   * metadata for each directive to attribute bindings and references within
   * the template to each directive specifically, if the runtime instructions
   * support this.
   */
  components?: R3DeclareDirectiveDependencyMetadata[];

  /**
   * List of directives which matched in the template, including sufficient
   * metadata for each directive to attribute bindings and references within
   * the template to each directive specifically, if the runtime instructions
   * support this.
   */
  directives?: R3DeclareDirectiveDependencyMetadata[];

  /**
   * List of dependencies which matched in the template, including sufficient
   * metadata for each directive/pipe to attribute bindings and references within
   * the template to each directive specifically, if the runtime instructions
   * support this.
   */
  dependencies?: R3DeclareTemplateDependencyMetadata[];

  /**
   * List of defer block dependency functions, ordered by the appearance
   * of the corresponding deferred block in the template.
   */
  deferBlockDependencies?: o.Expression[];

  /**
   * A map of pipe names to an expression referencing the pipe type (possibly a forward reference
   * wrapped in a `forwardRef` invocation) which are used in the template.
   */
  pipes?: {[pipeName: string]: o.Expression | (() => o.Expression)};

  /**
   * The list of view providers defined in the component.
   */
  viewProviders?: o.Expression;

  /**
   * A collection of animation triggers that will be used in the component template.
   */
  animations?: o.Expression;

  /**
   * Strategy used for detecting changes in the component.
   * Defaults to `ChangeDetectionStrategy.Default`.
   */
  changeDetection?: ChangeDetectionStrategy;

  boundListenersMarkForCheck?: boolean;

  /**
   * An encapsulation policy for the component's styling.
   * Defaults to `ViewEncapsulation.Emulated`.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Overrides the default interpolation start and end delimiters. Defaults to {{ and }}.
   */
  interpolation?: [string, string];

  /**
   * Whether whitespace in the template should be preserved. Defaults to false.
   */
  preserveWhitespaces?: boolean;
}

export type R3DeclareTemplateDependencyMetadata =
  | R3DeclareDirectiveDependencyMetadata
  | R3DeclarePipeDependencyMetadata
  | R3DeclareNgModuleDependencyMetadata;

export interface R3DeclareDirectiveDependencyMetadata {
  kind: 'directive' | 'component';

  /**
   * Selector of the directive.
   */
  selector: string;

  /**
   * Reference to the directive class (possibly a forward reference wrapped in a `forwardRef`
   * invocation).
   */
  type: o.Expression | (() => o.Expression);

  /**
   * Property names of the directive's inputs.
   */
  inputs?: string[];

  /**
   * Event names of the directive's outputs.
   */
  outputs?: string[];

  /**
   * Names by which this directive exports itself for references.
   */
  exportAs?: string[];
}

export interface R3DeclarePipeDependencyMetadata {
  kind: 'pipe';

  name: string;

  /**
   * Reference to the pipe class (possibly a forward reference wrapped in a `forwardRef`
   * invocation).
   */
  type: o.Expression | (() => o.Expression);
}

export interface R3DeclareNgModuleDependencyMetadata {
  kind: 'ngmodule';

  type: o.Expression | (() => o.Expression);
}

export interface R3DeclareQueryMetadata {
  /**
   * Name of the property on the class to update with query results.
   */
  propertyName: string;

  /**
   * Whether to read only the first matching result, or an array of results. Defaults to false.
   */
  first?: boolean;

  /**
   * Either an expression representing a type (possibly wrapped in a `forwardRef()`) or
   * `InjectionToken` for the query predicate, or a set of string selectors.
   */
  predicate: o.Expression | string[];

  /**
   * Whether to include only direct children or all descendants. Defaults to false.
   */
  descendants?: boolean;

  /**
   * True to only fire changes if there are underlying changes to the query.
   */
  emitDistinctChangesOnly?: boolean;

  /**
   * An expression representing a type to read from each matched node, or null if the default value
   * for a given node is to be returned.
   */
  read?: o.Expression;

  /**
   * Whether or not this query should collect only static results. Defaults to false.
   *
   * If static is true, the query's results will be set on the component after nodes are created,
   * but before change detection runs. This means that any results that relied upon change detection
   * to run (e.g. results inside *ngIf or *ngFor views) will not be collected. Query results are
   * available in the ngOnInit hook.
   *
   * If static is false, the query's results will be set on the component after change detection
   * runs. This means that the query results can contain nodes inside *ngIf or *ngFor views, but
   * the results will not be available in the ngOnInit hook (only in the ngAfterContentInit for
   * content hooks and ngAfterViewInit for view hooks).
   */
  static?: boolean;

  /** Whether the query is signal-based. */
  isSignal: boolean;
}

/**
 * Describes the shape of the objects that the `ɵɵngDeclareNgModule()` accepts.
 */
export interface R3DeclareNgModuleMetadata extends R3PartialDeclaration {
  /**
   * An array of expressions representing the bootstrap components specified by the module.
   */
  bootstrap?: o.Expression[];

  /**
   * An array of expressions representing the directives and pipes declared by the module.
   */
  declarations?: o.Expression[];

  /**
   * An array of expressions representing the imports of the module.
   */
  imports?: o.Expression[];

  /**
   * An array of expressions representing the exports of the module.
   */
  exports?: o.Expression[];

  /**
   * The set of schemas that declare elements to be allowed in the NgModule.
   */
  schemas?: o.Expression[];

  /** Unique ID or expression representing the unique ID of an NgModule. */
  id?: o.Expression;
}

/**
 * Describes the shape of the objects that the `ɵɵngDeclareInjector()` accepts.
 */
export interface R3DeclareInjectorMetadata extends R3PartialDeclaration {
  /**
   * The list of providers provided by the injector.
   */
  providers?: o.Expression;
  /**
   * The list of imports into the injector.
   */
  imports?: o.Expression[];
}

/**
 * Describes the shape of the object that the `ɵɵngDeclarePipe()` function accepts.
 *
 * This interface serves primarily as documentation, as conformance to this interface is not
 * enforced during linking.
 */
export interface R3DeclarePipeMetadata extends R3PartialDeclaration {
  /**
   * The name to use in templates to refer to this pipe.
   */
  name: string;

  /**
   * Whether this pipe is "pure".
   *
   * A pure pipe's `transform()` method is only invoked when its input arguments change.
   *
   * Default: true.
   */
  pure?: boolean;

  /**
   * Whether the pipe is standalone.
   *
   * Default: false.
   */
  isStandalone?: boolean;
}

/**
 * Describes the shape of the object that the `ɵɵngDeclareFactory()` function accepts.
 *
 * This interface serves primarily as documentation, as conformance to this interface is not
 * enforced during linking.
 */
export interface R3DeclareFactoryMetadata extends R3PartialDeclaration {
  /**
   * A collection of dependencies that this factory relies upon.
   *
   * If this is `null`, then the type's constructor is nonexistent and will be inherited from an
   * ancestor of the type.
   *
   * If this is `'invalid'`, then one or more of the parameters wasn't resolvable and any attempt to
   * use these deps will result in a runtime error.
   */
  deps: R3DeclareDependencyMetadata[] | 'invalid' | null;

  /**
   * Type of the target being created by the factory.
   */
  target: FactoryTarget;
}

/**
 * Describes the shape of the object that the `ɵɵngDeclareInjectable()` function accepts.
 *
 * This interface serves primarily as documentation, as conformance to this interface is not
 * enforced during linking.
 */
export interface R3DeclareInjectableMetadata extends R3PartialDeclaration {
  /**
   * If provided, specifies that the declared injectable belongs to a particular injector:
   * - `InjectorType` such as `NgModule`,
   * - `'root'` the root injector
   * - `'any'` all injectors.
   * If not provided, then it does not belong to any injector. Must be explicitly listed in the
   * providers of an injector.
   */
  providedIn?: o.Expression;

  /**
   * If provided, an expression that evaluates to a class to use when creating an instance of this
   * injectable.
   */
  useClass?: o.Expression;

  /**
   * If provided, an expression that evaluates to a function to use when creating an instance of
   * this injectable.
   */
  useFactory?: o.Expression;

  /**
   * If provided, an expression that evaluates to a token of another injectable that this injectable
   * aliases.
   */
  useExisting?: o.Expression;

  /**
   * If provided, an expression that evaluates to the value of the instance of this injectable.
   */
  useValue?: o.Expression;

  /**
   * An array of dependencies to support instantiating this injectable via `useClass` or
   * `useFactory`.
   */
  deps?: R3DeclareDependencyMetadata[];
}

/**
 * Metadata indicating how a dependency should be injected into a factory.
 */
export interface R3DeclareDependencyMetadata {
  /**
   * An expression representing the token or value to be injected, or `null` if the dependency is
   * not valid.
   *
   * If this dependency is due to the `@Attribute()` decorator, then this is an expression
   * evaluating to the name of the attribute.
   */
  token: o.Expression | null;

  /**
   * Whether the dependency is injecting an attribute value.
   * Default: false.
   */
  attribute?: boolean;

  /**
   * Whether the dependency has an @Host qualifier.
   * Default: false,
   */
  host?: boolean;

  /**
   * Whether the dependency has an @Optional qualifier.
   * Default: false,
   */
  optional?: boolean;

  /**
   * Whether the dependency has an @Self qualifier.
   * Default: false,
   */
  self?: boolean;

  /**
   * Whether the dependency has an @SkipSelf qualifier.
   * Default: false,
   */
  skipSelf?: boolean;
}

/**
 * Describes the shape of the object that the `ɵɵngDeclareClassMetadata()` function accepts.
 *
 * This interface serves primarily as documentation, as conformance to this interface is not
 * enforced during linking.
 */
export interface R3DeclareClassMetadata extends R3PartialDeclaration {
  /**
   * The Angular decorators of the class.
   */
  decorators: o.Expression;

  /**
   * Optionally specifies the constructor parameters, their types and the Angular decorators of each
   * parameter. This property is omitted if the class does not have a constructor.
   */
  ctorParameters?: o.Expression;

  /**
   * Optionally specifies the Angular decorators applied to the class properties. This property is
   * omitted if no properties have any decorators.
   */
  propDecorators?: o.Expression;
}

/**
 * Describes the shape of the object that the `ɵɵngDeclareClassMetadataAsync()` function accepts.
 *
 * This interface serves primarily as documentation, as conformance to this interface is not
 * enforced during linking.
 */
export interface R3DeclareClassMetadataAsync extends R3PartialDeclaration {
  /** Function that loads the deferred dependencies associated with the component. */
  resolveDeferredDeps: o.Expression;

  /**
   * Function that, when invoked with the resolved deferred
   * dependencies, will return the class metadata.
   */
  resolveMetadata: o.Expression;
}

/**
 * Describes the shape of the object literal that can be
 * passed in as a part of the `hostDirectives` array.
 */
export interface R3DeclareHostDirectiveMetadata {
  directive: o.Expression;
  inputs?: string[];
  outputs?: string[];
}
