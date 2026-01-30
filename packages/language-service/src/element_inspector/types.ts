/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ParseSourceSpan} from '@angular/compiler';
import {
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {DirectiveSymbol, ElementSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

/**
 * Source location information for a binding.
 */
export interface SourceLocation {
  /** File path */
  filePath: string;
  /** Start offset in file */
  start: number;
  /** End offset in file */
  end: number;
  /** Parse source span if available */
  span?: ParseSourceSpan;
}

/**
 * Origin of a binding - where it was declared.
 */
export type BindingOrigin = 'template' | 'host-metadata' | 'host-binding-decorator';

/**
 * Summary information about a directive applied to an element.
 */
export interface DirectiveSummary {
  /** Class name (e.g., 'MatButton') */
  name: string;
  /** CSS selector (e.g., '[mat-button]') */
  selector: string | null;
  /** Whether this is a component (has template) */
  isComponent: boolean;
  /** Whether this is a host directive */
  isHostDirective: boolean;
  /** TypeScript symbol for navigation */
  tsSymbol: ts.Symbol;
  /** Reference to the directive class declaration */
  classDeclaration: ts.ClassDeclaration;
}

/**
 * Target of a binding - what it affects.
 */
export interface BindingTarget {
  /** What kind of target */
  kind: 'directive-input' | 'directive-output' | 'dom-property' | 'dom-attribute' | 'dom-event';
  /** Directive if targeting directive input/output */
  directive?: DirectiveSummary;
  /** Whether this shadows a native DOM property/event */
  shadowsNative?: boolean;
  /** The native property/event being shadowed, if any */
  shadowedNativeName?: string;
}

/**
 * Binding type classification.
 */
export type BindingType =
  | 'input'
  | 'output'
  | 'attribute'
  | 'style'
  | 'class'
  | 'style-object'
  | 'class-object';

/**
 * Value information for a binding.
 */
export interface BindingValue {
  /** Whether the value is a static literal */
  isStatic: boolean;
  /** Static value if available */
  staticValue?: string | number | boolean;
  /** Expression text */
  expression?: string;
  /** Source span of the expression */
  expressionSpan?: ParseSourceSpan;
}

/**
 * A binding from the template.
 */
export interface TemplateBinding {
  /** Binding name (e.g., 'disabled', 'click', 'style.width') */
  name: string;
  /** Full key including prefixes (e.g., '[style.width.px]') */
  fullKey: string;
  /** Binding type */
  type: BindingType;
  /** What this binding targets */
  target: BindingTarget;
  /** Binding value */
  value: BindingValue;
  /** Source location */
  sourceLocation: SourceLocation;
  /** Original AST node */
  astNode: TmplAstBoundAttribute | TmplAstBoundEvent | TmplAstTextAttribute;
}

/**
 * A style-specific binding with CSS property info.
 */
export interface StyleBinding extends TemplateBinding {
  type: 'style' | 'style-object';
  /** CSS property name (e.g., 'width', 'backgroundColor') */
  cssProperty: string;
  /** CSS unit suffix if any (e.g., 'px', 'em') */
  unit?: string;
}

/**
 * A class-specific binding.
 */
export interface ClassBinding extends TemplateBinding {
  type: 'class' | 'class-object';
  /** CSS class name */
  className: string;
}

/**
 * A binding from a directive's host metadata.
 */
export interface HostBinding {
  /** Binding type */
  type: 'property' | 'attribute' | 'style' | 'class' | 'listener';
  /** Binding name */
  name: string;
  /** CSS property for style bindings */
  cssProperty?: string;
  /** CSS unit for style bindings */
  unit?: string;
  /** CSS class for class bindings */
  className?: string;
  /** Expression text */
  expression: string;
  /** Source location */
  sourceLocation: SourceLocation;
}

/**
 * Host bindings from a directive.
 */
export interface DirectiveHostBindings {
  /** The directive */
  directive: DirectiveSummary;
  /** Where these bindings come from */
  source: BindingOrigin;
  /** The bindings */
  bindings: HostBinding[];
}

/**
 * Aggregated view of a CSS property from all sources.
 */
export interface EffectiveStyleProperty {
  /** CSS property name (e.g., 'width', 'backgroundColor') */
  property: string;
  /** All sources that set this property */
  sources: StyleSource[];
  /** Whether there's a conflict */
  hasConflict: boolean;
}

/**
 * A source that sets a CSS property.
 */
export interface StyleSource {
  /** Where the binding comes from */
  origin: BindingOrigin;
  /** Directive name if from host binding */
  directive?: string;
  /** Full binding key (e.g., '[style.width]', '[style]') */
  bindingKey: string;
  /** Whether this is from an object binding ([style]="obj") */
  isObjectBinding: boolean;
  /** Source location */
  sourceLocation: SourceLocation;
}

/**
 * Aggregated view of a CSS class from all sources.
 */
export interface EffectiveClassBinding {
  /** CSS class name */
  className: string;
  /** All sources that set this class */
  sources: ClassSource[];
  /** Whether there's a conflict */
  hasConflict: boolean;
}

/**
 * A source that sets a CSS class.
 */
export interface ClassSource {
  /** Where the binding comes from */
  origin: BindingOrigin;
  /** Directive name if from host binding */
  directive?: string;
  /** Full binding key */
  bindingKey: string;
  /** Whether this is from an object binding */
  isObjectBinding: boolean;
  /** Source location */
  sourceLocation: SourceLocation;
}

/**
 * A binding issue/diagnostic.
 */
export interface BindingIssue {
  /** Diagnostic code */
  code: number;
  /** Severity */
  severity: 'error' | 'warning' | 'info';
  /** Human-readable message */
  message: string;
  /** Bindings affected by this issue */
  affectedBindings: Array<TemplateBinding | HostBinding>;
  /** Category for grouping */
  category:
    | 'style-conflict'
    | 'class-conflict'
    | 'event-shadowing'
    | 'directive-shadowing'
    | 'other';
}

/**
 * Complete binding information for an element.
 */
export interface ElementBindings {
  /** The element */
  element: TmplAstElement;
  /** Element symbol */
  elementSymbol: ElementSymbol;
  /** Tag name (e.g., 'button', 'div') */
  tagName: string;
  /** HTML type string (e.g., 'HTMLButtonElement') */
  htmlType: string;

  /** Applied directives */
  directives: DirectiveSummary[];

  /** Template-level bindings */
  templateBindings: {
    inputs: TemplateBinding[];
    outputs: TemplateBinding[];
    attributes: TemplateBinding[];
    styles: StyleBinding[];
    classes: ClassBinding[];
    styleObject?: TemplateBinding; // [style]="obj"
    classObject?: TemplateBinding; // [class]="obj"
  };

  /** Directive-level host bindings */
  directiveBindings: DirectiveHostBindings[];

  /** Aggregated effective styles */
  effectiveStyles: EffectiveStyleProperty[];

  /** Aggregated effective classes */
  effectiveClasses: EffectiveClassBinding[];

  /** Detected issues */
  issues: BindingIssue[];

  /** Total issue count */
  issueCount: number;
}

/**
 * Summary of an element for quick hover display.
 */
export interface ElementSummary {
  /** Tag name */
  tagName: string;
  /** HTML type */
  htmlType: string;
  /** Applied directives */
  directives: DirectiveSummary[];
  /** Number of template bindings */
  bindingCount: number;
  /** Number of issues */
  issueCount: number;
  /** Issue breakdown by category */
  issuesByCategory: Map<string, number>;
}
