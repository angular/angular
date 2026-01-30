/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import * as t from '@angular/compiler';
import {tmplAstVisitAll, TmplAstRecursiveVisitor} from '@angular/compiler';
import {
  isValidAriaAttribute,
  isValidAriaRole,
  findSimilarAriaAttributes,
  findSimilarAriaRoles,
  validateAriaValue,
  VALID_ARIA_ATTRIBUTES,
  VALID_ARIA_ROLES,
} from './aria_data';

/**
 * Diagnostic codes for ARIA validation.
 * Range: 99200-99299 (reserved for ARIA diagnostics)
 */
export enum AriaDiagnosticCode {
  /** Unknown ARIA attribute (e.g., aria-labelled instead of aria-labelledby) */
  UNKNOWN_ARIA_ATTRIBUTE = 99201,
  /** Invalid ARIA attribute value (e.g., aria-hidden="yes" instead of "true") */
  INVALID_ARIA_VALUE = 99202,
  /** Unknown ARIA role (e.g., role="buton" instead of "button") */
  UNKNOWN_ARIA_ROLE = 99203,
  /** Deprecated ARIA attribute */
  DEPRECATED_ARIA_ATTRIBUTE = 99204,
  /** Invalid ARIA role value (not a recognized role) */
  INVALID_ARIA_ROLE_VALUE = 99205,
}

/**
 * Diagnostic message templates for ARIA validation.
 */
const ARIA_DIAGNOSTIC_MESSAGES = {
  [AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE]: (attr: string, suggestions: string[]) =>
    suggestions.length > 0
      ? `Unknown ARIA attribute '${attr}'. Did you mean '${suggestions[0]}'?`
      : `Unknown ARIA attribute '${attr}'.`,
  [AriaDiagnosticCode.INVALID_ARIA_VALUE]: (attr: string, value: string, expected: string) =>
    `Invalid value '${value}' for ${attr}. ${expected}`,
  [AriaDiagnosticCode.UNKNOWN_ARIA_ROLE]: (role: string, suggestions: string[]) =>
    suggestions.length > 0
      ? `Unknown ARIA role '${role}'. Did you mean '${suggestions[0]}'?`
      : `Unknown ARIA role '${role}'.`,
  [AriaDiagnosticCode.DEPRECATED_ARIA_ATTRIBUTE]: (attr: string) =>
    `ARIA attribute '${attr}' is deprecated.`,
  [AriaDiagnosticCode.INVALID_ARIA_ROLE_VALUE]: (value: string) =>
    `Invalid role value '${value}'. Expected a valid ARIA role.`,
};

/**
 * Configuration for ARIA diagnostics.
 */
export interface AriaDiagnosticsConfig {
  /** Whether ARIA diagnostics are enabled */
  enabled: boolean;
  /** Whether to warn about deprecated ARIA attributes (aria-grabbed, aria-dropeffect) */
  warnOnDeprecated: boolean;
  /** Whether to validate ARIA attribute values */
  validateValues: boolean;
  /** Whether to validate role attribute values */
  validateRoles: boolean;
}

/**
 * Default configuration for ARIA diagnostics.
 */
export const DEFAULT_ARIA_DIAGNOSTICS_CONFIG: AriaDiagnosticsConfig = {
  enabled: true,
  warnOnDeprecated: true,
  validateValues: true,
  validateRoles: true,
};

/**
 * Deprecated ARIA attributes that should trigger warnings.
 */
const DEPRECATED_ARIA_ATTRIBUTES = new Set(['aria-grabbed', 'aria-dropeffect']);

/**
 * Gets ARIA diagnostics for a component template.
 */
export function getAriaDiagnostics(
  component: ts.ClassDeclaration,
  compiler: NgCompiler,
  config: AriaDiagnosticsConfig = DEFAULT_ARIA_DIAGNOSTICS_CONFIG,
): ts.Diagnostic[] {
  if (!config.enabled) {
    return [];
  }

  const diagnostics: ts.Diagnostic[] = [];
  const ttc = compiler.getTemplateTypeChecker();

  try {
    const template = ttc.getTemplate(component);
    if (!template) {
      return [];
    }

    const sourceFile = component.getSourceFile();

    // Visit all nodes in the template
    const visitor = new AriaBindingVisitor(component, sourceFile, config, diagnostics);
    tmplAstVisitAll(visitor, template);
  } catch {
    // Skip components with compilation errors
  }

  return diagnostics;
}

/**
 * Visitor that walks the template AST and validates ARIA bindings.
 */
class AriaBindingVisitor extends TmplAstRecursiveVisitor {
  constructor(
    private readonly component: ts.ClassDeclaration,
    private readonly sourceFile: ts.SourceFile,
    private readonly config: AriaDiagnosticsConfig,
    private readonly diagnostics: ts.Diagnostic[],
  ) {
    super();
  }

  /**
   * Visit an element node and check its ARIA attributes.
   */
  override visitElement(element: t.TmplAstElement): void {
    // Check static attributes
    for (const attr of element.attributes) {
      this.checkAttribute(attr.name, attr.value, attr.sourceSpan);
    }

    // Check bound attributes [attr.aria-*]
    for (const input of element.inputs) {
      // Check for [attr.aria-*] bindings
      if (input.type === t.BindingType.Attribute && input.name.startsWith('aria-')) {
        // Bound attribute [attr.aria-*]
        if (!isValidAriaAttribute(input.name)) {
          this.addUnknownAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        } else if (this.config.warnOnDeprecated && DEPRECATED_ARIA_ATTRIBUTES.has(input.name)) {
          this.addDeprecatedAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        }
        // Note: We can't validate values for dynamic bindings (expressions)
      } else if (input.type === t.BindingType.Property && input.name.startsWith('aria-')) {
        // Property binding [aria-*] (less common but valid)
        if (!isValidAriaAttribute(input.name)) {
          this.addUnknownAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        } else if (this.config.warnOnDeprecated && DEPRECATED_ARIA_ATTRIBUTES.has(input.name)) {
          this.addDeprecatedAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        }
      }
    }

    // Visit children
    super.visitElement(element);
  }

  /**
   * Visit a template node (ng-template) and check its children.
   */
  override visitTemplate(template: t.TmplAstTemplate): void {
    // Check attributes on ng-template
    for (const attr of template.attributes) {
      this.checkAttribute(attr.name, attr.value, attr.sourceSpan);
    }

    // Check bound attributes
    for (const input of template.inputs) {
      if (input.type === t.BindingType.Attribute && input.name.startsWith('aria-')) {
        if (!isValidAriaAttribute(input.name)) {
          this.addUnknownAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        } else if (this.config.warnOnDeprecated && DEPRECATED_ARIA_ATTRIBUTES.has(input.name)) {
          this.addDeprecatedAttributeDiagnostic(input.name, input.keySpan ?? input.sourceSpan);
        }
      }
    }

    // Visit children
    super.visitTemplate(template);
  }

  /**
   * Check a static attribute for ARIA validity.
   */
  private checkAttribute(name: string, value: string, span: t.ParseSourceSpan): void {
    // Check aria-* attributes
    if (name.startsWith('aria-')) {
      if (!isValidAriaAttribute(name)) {
        this.addUnknownAttributeDiagnostic(name, span);
        return;
      }

      // Check for deprecated attributes
      if (this.config.warnOnDeprecated && DEPRECATED_ARIA_ATTRIBUTES.has(name)) {
        this.addDeprecatedAttributeDiagnostic(name, span);
      }

      // Validate the value if enabled
      if (this.config.validateValues) {
        const validation = validateAriaValue(name, value);
        if (!validation.valid && validation.message) {
          this.addInvalidValueDiagnostic(name, value, validation.message, span);
        }
      }
    }

    // Check role attribute
    if (name === 'role' && this.config.validateRoles) {
      // role can have multiple space-separated values
      const roles = value.split(/\s+/).filter((r) => r.length > 0);
      for (const role of roles) {
        if (!isValidAriaRole(role)) {
          this.addUnknownRoleDiagnostic(role, span);
        }
      }
    }
  }

  /**
   * Add a diagnostic for an unknown ARIA attribute.
   */
  private addUnknownAttributeDiagnostic(name: string, span: t.ParseSourceSpan): void {
    const suggestions = findSimilarAriaAttributes(name, 3);
    const message = ARIA_DIAGNOSTIC_MESSAGES[AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE](
      name,
      suggestions,
    );

    this.diagnostics.push({
      category: ts.DiagnosticCategory.Warning,
      code: AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE,
      messageText: message,
      file: this.sourceFile,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      source: 'angular',
    });
  }

  /**
   * Add a diagnostic for a deprecated ARIA attribute.
   */
  private addDeprecatedAttributeDiagnostic(name: string, span: t.ParseSourceSpan): void {
    const message = ARIA_DIAGNOSTIC_MESSAGES[AriaDiagnosticCode.DEPRECATED_ARIA_ATTRIBUTE](name);

    this.diagnostics.push({
      category: ts.DiagnosticCategory.Warning,
      code: AriaDiagnosticCode.DEPRECATED_ARIA_ATTRIBUTE,
      messageText: message,
      file: this.sourceFile,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      source: 'angular',
    });
  }

  /**
   * Add a diagnostic for an invalid ARIA attribute value.
   */
  private addInvalidValueDiagnostic(
    name: string,
    value: string,
    expected: string,
    span: t.ParseSourceSpan,
  ): void {
    const message = ARIA_DIAGNOSTIC_MESSAGES[AriaDiagnosticCode.INVALID_ARIA_VALUE](
      name,
      value,
      expected,
    );

    this.diagnostics.push({
      category: ts.DiagnosticCategory.Warning,
      code: AriaDiagnosticCode.INVALID_ARIA_VALUE,
      messageText: message,
      file: this.sourceFile,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      source: 'angular',
    });
  }

  /**
   * Add a diagnostic for an unknown ARIA role.
   */
  private addUnknownRoleDiagnostic(role: string, span: t.ParseSourceSpan): void {
    const suggestions = findSimilarAriaRoles(role, 3);
    const message = ARIA_DIAGNOSTIC_MESSAGES[AriaDiagnosticCode.UNKNOWN_ARIA_ROLE](
      role,
      suggestions,
    );

    this.diagnostics.push({
      category: ts.DiagnosticCategory.Warning,
      code: AriaDiagnosticCode.UNKNOWN_ARIA_ROLE,
      messageText: message,
      file: this.sourceFile,
      start: span.start.offset,
      length: span.end.offset - span.start.offset,
      source: 'angular',
    });
  }
}

/**
 * Get all valid ARIA attributes for completions.
 */
export function getAllAriaAttributes(): string[] {
  return Array.from(VALID_ARIA_ATTRIBUTES);
}

/**
 * Get all valid ARIA roles for completions.
 */
export function getAllAriaRoles(): string[] {
  return Array.from(VALID_ARIA_ROLES);
}
