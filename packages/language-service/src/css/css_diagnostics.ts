/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  BindingType,
  LiteralMap,
  LiteralMapKey,
  LiteralPrimitive,
  ParseSpan,
  SpreadElement,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstHostElement,
  TmplAstNode,
  TmplAstTemplate,
  tmplAstVisitAll,
  TmplAstVisitor,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {
  isValidCSSPropertyVSCode,
  findSimilarCSSProperties,
  validateCSSValue,
  kebabToCamelCase,
  camelToKebabCase,
  getPropertyUnitCategory,
} from './css_language_service';
import {
  isValidCSSUnit,
  isObsoleteCSSProperty,
  getObsoleteCSSPropertyInfo,
  getShorthandLonghands,
  isShorthandProperty,
  getShorthandForLonghand,
  type ObsoleteCSSProperty,
} from './css_properties';

/**
 * CSS diagnostic codes for the Angular Language Service.
 * These are in a separate range from Angular's core diagnostic codes.
 */
export const enum CssDiagnosticCode {
  /** Unknown CSS property name in style binding. */
  UNKNOWN_CSS_PROPERTY = 99001,
  /** Invalid CSS unit suffix in style binding. */
  INVALID_CSS_UNIT = 99002,
  /** Unknown CSS property name in style object literal. */
  UNKNOWN_CSS_PROPERTY_IN_OBJECT = 99003,
  /** Duplicate CSS property in style object literal. */
  DUPLICATE_CSS_PROPERTY = 99004,
  /** Same CSS property set via multiple binding types (precedence conflict). */
  CONFLICTING_STYLE_BINDING = 99005,
  /** Unknown CSS property name in host metadata. */
  UNKNOWN_CSS_PROPERTY_IN_HOST = 99006,
  /** Invalid CSS unit in host metadata. */
  INVALID_CSS_UNIT_IN_HOST = 99007,
  /** Obsolete/deprecated CSS property in style binding. */
  OBSOLETE_CSS_PROPERTY = 99008,
  /** Obsolete/deprecated CSS property in host binding. */
  OBSOLETE_CSS_PROPERTY_IN_HOST = 99009,
  /** Obsolete/deprecated CSS property in style object literal. */
  OBSOLETE_CSS_PROPERTY_IN_OBJECT = 99010,
  /** Invalid value type for CSS unit suffix (e.g., string 'red' with .px unit). */
  INVALID_UNIT_VALUE = 99011,
  /** Invalid value type for CSS unit suffix in host binding. */
  INVALID_UNIT_VALUE_IN_HOST = 99012,
  /** Invalid value type for CSS unit suffix in style object literal. */
  INVALID_UNIT_VALUE_IN_OBJECT = 99013,
  /** CSS shorthand property overrides a longhand property set elsewhere. */
  SHORTHAND_OVERRIDE = 99014,
  /** Warning when using string instead of number for unit suffix binding. */
  PREFER_NUMERIC_UNIT_VALUE = 99015,
  /** Warning when number used without unit in style binding. */
  MISSING_UNIT_FOR_NUMBER = 99016,
  /** Invalid CSS value in style binding. */
  INVALID_CSS_VALUE = 99017,
  /** Invalid CSS value in style object literal. */
  INVALID_CSS_VALUE_IN_OBJECT = 99018,
  /** Invalid CSS value in host metadata. */
  INVALID_CSS_VALUE_IN_HOST = 99019,
}

/**
 * Configuration for CSS diagnostics.
 */
export interface CssDiagnosticsConfig {
  /** Whether CSS property validation is enabled. */
  enabled: boolean;
  /** Severity level for unknown CSS property diagnostics. */
  severity: 'error' | 'warning' | 'suggestion';
  /**
   * Whether to enable strict unit value validation.
   * When enabled, warns about:
   * - Using string values like '100' instead of numbers for unit suffix bindings
   * - Using numbers without units in non-unit bindings
   */
  strictUnitValues?: boolean;

  /**
   * Whether to validate literal CSS values against the property syntax.
   * When enabled, validates string literal values in style bindings and style objects.
   */
  validateValues?: boolean;
}

/**
 * Default configuration for CSS diagnostics.
 */
export const DEFAULT_CSS_DIAGNOSTICS_CONFIG: CssDiagnosticsConfig = {
  enabled: true,
  severity: 'warning',
  strictUnitValues: false,
  validateValues: true,
};

/**
 * Gets CSS-related diagnostics for a template.
 *
 * This validates CSS property names in style bindings like `[style.propertyName]`
 * and reports diagnostics for unknown properties.
 *
 * @param component The component class declaration.
 * @param compiler The Angular compiler instance.
 * @param config Optional configuration for diagnostics.
 * @returns Array of CSS diagnostics.
 */
export function getCssDiagnostics(
  component: ts.ClassDeclaration,
  compiler: NgCompiler,
  config: CssDiagnosticsConfig = DEFAULT_CSS_DIAGNOSTICS_CONFIG,
): ts.Diagnostic[] {
  if (!config.enabled) {
    return [];
  }

  const templateTypeChecker = compiler.getTemplateTypeChecker();
  const diagnostics: ts.Diagnostic[] = [];
  const severity = getDiagnosticCategory(config.severity);

  // Validate template style bindings
  const template = templateTypeChecker.getTemplate(component);
  if (template !== null) {
    const visitor = new CssBindingVisitor(
      component,
      templateTypeChecker,
      diagnostics,
      severity,
      config,
    );
    tmplAstVisitAll(visitor, template);
  }

  // Validate host element style bindings (from @Component host: { '[style.prop]': ... })
  const hostElement = templateTypeChecker.getHostElement(component);
  if (hostElement !== null) {
    validateHostStyleBindings(component, hostElement, diagnostics, severity, config);
    // Also detect conflicts within host bindings
    detectHostStyleBindingConflicts(component, hostElement, diagnostics, severity);
  }

  return diagnostics;
}

/**
 * Converts severity string to TypeScript DiagnosticCategory.
 */
function getDiagnosticCategory(
  severity: 'error' | 'warning' | 'suggestion',
): ts.DiagnosticCategory {
  switch (severity) {
    case 'error':
      return ts.DiagnosticCategory.Error;
    case 'warning':
      return ts.DiagnosticCategory.Warning;
    case 'suggestion':
      return ts.DiagnosticCategory.Suggestion;
  }
}

function mapCssValidationSeverity(
  severity: 'error' | 'warning' | 'info' | 'hint',
): ts.DiagnosticCategory {
  switch (severity) {
    case 'error':
      return ts.DiagnosticCategory.Error;
    case 'warning':
      return ts.DiagnosticCategory.Warning;
    case 'info':
      return ts.DiagnosticCategory.Message;
    case 'hint':
      return ts.DiagnosticCategory.Suggestion;
  }
}

/**
 * Validates CSS properties in host style bindings.
 * These come from @Component({ host: { '[style.prop]': 'value' } })
 */
function validateHostStyleBindings(
  component: ts.ClassDeclaration,
  hostElement: TmplAstHostElement,
  diagnostics: ts.Diagnostic[],
  severity: ts.DiagnosticCategory,
  config: CssDiagnosticsConfig,
): void {
  for (const binding of hostElement.bindings) {
    // Only validate style bindings [style.prop]
    if (binding.type !== BindingType.Style) {
      continue;
    }

    // Skip bindings with invalid spans (dummy spans from internal processing)
    if (!binding.keySpan || binding.keySpan.start.offset < 0) {
      continue;
    }

    // Parse the style binding name - format: "propertyName" or "propertyName.unit"
    const fullName = binding.name;
    const parts = fullName.split('.');
    const propertyName = parts[0];
    const camelCasePropertyName = kebabToCamelCase(propertyName);
    const unit = binding.unit;

    // Check for obsolete CSS property first (takes priority)
    const obsoleteInfo = getObsoleteCSSPropertyInfo(camelCasePropertyName);
    if (obsoleteInfo !== undefined) {
      diagnostics.push({
        category: ts.DiagnosticCategory.Warning, // Always warning for obsolete
        code: CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_HOST,
        messageText: buildObsoletePropertyMessage(
          propertyName,
          camelCasePropertyName,
          obsoleteInfo,
        ),
        file: component.getSourceFile(),
        start: binding.keySpan.start.offset,
        length: binding.keySpan.end.offset - binding.keySpan.start.offset,
        source: 'angular',
      });
      continue; // Skip unknown check if obsolete
    }

    // Validate CSS property name
    if (!isValidCSSPropertyVSCode(camelCasePropertyName)) {
      diagnostics.push({
        category: severity,
        code: CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
        messageText: buildUnknownPropertyMessage(
          propertyName,
          camelCasePropertyName,
          'in host binding',
        ),
        file: component.getSourceFile(),
        start: binding.keySpan.start.offset,
        length: binding.keySpan.end.offset - binding.keySpan.start.offset,
        source: 'angular',
      });
    }

    // Validate CSS unit suffix (if present)
    if (unit !== null && !isValidCSSUnit(unit)) {
      diagnostics.push({
        category: severity,
        code: CssDiagnosticCode.INVALID_CSS_UNIT_IN_HOST,
        messageText: buildInvalidUnitMessage(unit, 'in host binding.'),
        file: component.getSourceFile(),
        start: binding.keySpan.end.offset - unit.length,
        length: unit.length,
        source: 'angular',
      });
    }

    // Validate literal CSS values (if enabled)
    maybeReportInvalidCssValue(
      component,
      diagnostics,
      config,
      propertyName,
      unit,
      binding.value,
      CssDiagnosticCode.INVALID_CSS_VALUE_IN_HOST,
    );
  }
}

/**
 * Detects conflicts within host style bindings.
 * This includes conflicts between:
 * - host: { '[style.width]': ... } and @HostBinding('style.width')
 * - host: { '[style.width]': ... } and host: { '[style]': { width: ... } }
 * - Multiple @HostBinding decorators for the same property
 */
function detectHostStyleBindingConflicts(
  component: ts.ClassDeclaration,
  hostElement: TmplAstHostElement,
  diagnostics: ts.Diagnostic[],
  severity: ts.DiagnosticCategory,
): void {
  // Collect all host style bindings by normalized property name
  const bindingsByProperty = new Map<
    string,
    Array<{
      property: string;
      bindingType: StyleBindingType;
      binding: TmplAstBoundAttribute;
      originalPropertyName: string;
    }>
  >();

  for (const binding of hostElement.bindings) {
    // Individual host style binding: [style.prop]
    if (binding.type === BindingType.Style) {
      // Skip bindings with invalid spans
      if (!binding.keySpan || binding.keySpan.start.offset < 0) {
        continue;
      }

      const propertyName = binding.name.split('.')[0];
      const normalized = normalizeCSSPropertyName(propertyName);
      const entry = {
        property: normalized,
        bindingType: 'hostIndividual' as StyleBindingType,
        binding,
        originalPropertyName: propertyName,
      };
      const existing = bindingsByProperty.get(normalized) || [];
      existing.push(entry);
      bindingsByProperty.set(normalized, existing);
    }
    // Host object style binding: [style]="..."
    else if (binding.type === BindingType.Property && binding.name === 'style') {
      // Skip bindings with invalid spans
      if (!binding.keySpan || binding.keySpan.start.offset < 0) {
        continue;
      }

      // Note: We can't easily extract properties from host style objects
      // because they're usually component properties, not literals.
      // We'll just track that there's a general [style] binding.
      const entry = {
        property: '__style_object__',
        bindingType: 'hostStyleObject' as StyleBindingType,
        binding,
        originalPropertyName: 'style',
      };
      const existing = bindingsByProperty.get('__style_object__') || [];
      existing.push(entry);
      bindingsByProperty.set('__style_object__', existing);
    }
  }

  // Check for conflicts (same property defined multiple times)
  // For host bindings, we report conflicts even for the same binding type
  // because they come from different sources (host: {} vs @HostBinding)
  for (const [property, bindings] of bindingsByProperty) {
    if (bindings.length <= 1 || property === '__style_object__') continue;

    // For host bindings with the same CSS property, report all but the first as conflicts
    // The first binding takes precedence (order-dependent at runtime)
    const first = bindings[0];

    // Report diagnostics on subsequent bindings (they will be overridden)
    for (let i = 1; i < bindings.length; i++) {
      const subsequent = bindings[i];

      diagnostics.push({
        category: severity,
        code: CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        messageText: `CSS property '${subsequent.originalPropertyName}' is set via multiple host bindings. Only one value will be applied at runtime.`,
        file: component.getSourceFile(),
        start: subsequent.binding.keySpan!.start.offset,
        length: subsequent.binding.keySpan!.end.offset - subsequent.binding.keySpan!.start.offset,
        source: 'angular',
      });
    }
  }
}

/**
 * Normalizes a CSS property name to a consistent format for duplicate detection.
 * Converts kebab-case to camelCase and lowercases for comparison.
 * Examples:
 *   - 'background-color' -> 'backgroundcolor'
 *   - 'backgroundColor' -> 'backgroundcolor'
 *   - 'BACKGROUND-COLOR' -> 'backgroundcolor'
 */
function normalizeCSSPropertyName(propertyName: string): string {
  // Convert kebab-case to camelCase, then lowercase for comparison
  return propertyName.replace(/-([a-z])/gi, (_, char) => char.toUpperCase()).toLowerCase();
}

/**
 * Generates a diagnostic message for an invalid CSS unit.
 */
function buildInvalidUnitMessage(unit: string, context?: string): string {
  const hint = 'Valid units include: px, em, rem, %, vh, vw, s, ms, deg, etc.';
  return context
    ? `Unknown CSS unit '${unit}' ${context} ${hint}`
    : `Unknown CSS unit '${unit}'. ${hint}`;
}

/**
 * Generates a diagnostic message for an unknown CSS property with suggestions.
 */
function buildUnknownPropertyMessage(
  propertyName: string,
  camelCasePropertyName: string,
  context?: string,
): string {
  const suggestions = findSimilarCSSProperties(camelCasePropertyName);
  let message = context
    ? `Unknown CSS property '${propertyName}' ${context}.`
    : `Unknown CSS property '${propertyName}'.`;

  if (suggestions.length > 0) {
    const suggestionForDisplay = propertyName.includes('-')
      ? camelToKebabCase(suggestions[0])
      : suggestions[0];
    message += ` Did you mean '${suggestionForDisplay}'?`;
    if (suggestions.length > 1) {
      const otherSuggestions = suggestions
        .slice(1)
        .map((s) => (propertyName.includes('-') ? camelToKebabCase(s) : s));
      message += ` Other suggestions: ${otherSuggestions.join(', ')}.`;
    }
  }
  return message;
}

/**
 * Generates a diagnostic message for an obsolete CSS property.
 */
function buildObsoletePropertyMessage(
  propertyName: string,
  camelCasePropertyName: string,
  obsoleteInfo: ObsoleteCSSProperty,
): string {
  const displayName = propertyName.includes('-')
    ? camelToKebabCase(camelCasePropertyName)
    : camelCasePropertyName;
  let message = `CSS property '${displayName}' is deprecated. ${obsoleteInfo.message}`;
  if (obsoleteInfo.replacement) {
    const replacementDisplay = propertyName.includes('-')
      ? camelToKebabCase(obsoleteInfo.replacement)
      : obsoleteInfo.replacement;
    message += ` Consider using '${replacementDisplay}' instead.`;
  }
  message += ` See: ${obsoleteInfo.mdnUrl}`;
  return message;
}

function maybeReportInvalidCssValue(
  component: ts.ClassDeclaration,
  diagnostics: ts.Diagnostic[],
  config: CssDiagnosticsConfig,
  propertyName: string,
  unit: string | null,
  valueAst: AST,
  code: CssDiagnosticCode,
): void {
  if (config.validateValues === false) {
    return;
  }

  // Skip unit-suffixed bindings; value validation is handled separately for unit values
  if (unit !== null) {
    return;
  }

  // CSS custom properties can accept arbitrary values
  if (propertyName.startsWith('--')) {
    return;
  }

  let ast: AST = valueAst;
  if (ast instanceof ASTWithSource) {
    ast = ast.ast;
  }

  if (!(ast instanceof LiteralPrimitive)) {
    return;
  }

  const value = ast.value;
  if (typeof value !== 'string') {
    return;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return;
  }

  const camelCasePropertyName = kebabToCamelCase(propertyName);
  const validationDiagnostics = validateCSSValue(camelCasePropertyName, trimmed);
  if (validationDiagnostics.length === 0) {
    return;
  }

  const first = validationDiagnostics[0];
  diagnostics.push({
    category: mapCssValidationSeverity(first.severity),
    code,
    messageText: `Invalid CSS value '${trimmed}' for property '${propertyName}'. ${first.message}`,
    file: component.getSourceFile(),
    start: ast.sourceSpan.start,
    length: ast.sourceSpan.end - ast.sourceSpan.start,
    source: 'angular',
  });
}

/**
 * Style binding types with their precedence (lower number = higher precedence).
 * Template bindings always take precedence over host bindings.
 */
type StyleBindingType =
  | 'individual'
  | 'styleObject'
  | 'ngStyle'
  | 'hostIndividual'
  | 'hostStyleObject';

/**
 * Represents a style binding found on an element.
 */
interface StyleBinding {
  property: string; // Normalized property name
  bindingType: StyleBindingType;
  attribute: TmplAstBoundAttribute;
  originalPropertyName: string; // Original property name for error messages
}

/**
 * Style binding precedence (lower number = higher priority):
 * 1. Individual [style.prop] bindings (template)
 * 2. [style]="{}" object bindings (template)
 * 3. [ngStyle]="{}" directive bindings (template)
 * 4. Individual [style.prop] host bindings
 * 5. [style]="{}" host object bindings
 *
 * Template always takes precedence over host bindings.
 */
const BINDING_PRECEDENCE: Record<StyleBindingType, number> = {
  individual: 1,
  styleObject: 2,
  ngStyle: 3,
  hostIndividual: 4,
  hostStyleObject: 5,
};

/**
 * Gets a human-readable description of a style binding type.
 */
function getBindingDescription(type: StyleBindingType): string {
  switch (type) {
    case 'individual':
      return '[style.property]';
    case 'styleObject':
      return '[style]';
    case 'ngStyle':
      return '[ngStyle]';
    case 'hostIndividual':
      return 'host [style.property]';
    case 'hostStyleObject':
      return 'host [style]';
  }
}

/**
 * AST visitor that collects CSS diagnostics from style bindings.
 */
class CssBindingVisitor implements TmplAstVisitor<void> {
  constructor(
    private readonly component: ts.ClassDeclaration,
    private readonly templateTypeChecker: TemplateTypeChecker,
    private readonly diagnostics: ts.Diagnostic[],
    private readonly severity: ts.DiagnosticCategory,
    private readonly config: CssDiagnosticsConfig,
  ) {}

  visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
    // Check if this is an object-style binding: [style]="{ prop: value }" or [ngStyle]="{ prop: value }"
    // These are Property bindings, not Style bindings
    if (attribute.type === BindingType.Property) {
      if (attribute.name === 'style' || attribute.name === 'ngStyle') {
        this.validateStyleObjectLiteral(attribute);
      }
      // For all Property bindings (including style/ngStyle), we're done
      return;
    }

    // Only validate individual style bindings [style.property]
    if (attribute.type !== BindingType.Style) {
      return;
    }

    // Parse the style binding name
    // Format: "propertyName" or "propertyName.unit"
    const fullName = attribute.name;
    const parts = fullName.split('.');

    // The first part after 'style' is the property name (already parsed by Angular)
    // Note: For [style.width], attribute.name will be 'width', not 'style.width'
    const propertyName = parts[0];
    const unit = attribute.unit;

    // CSS custom properties (--my-var) are always valid
    if (propertyName.startsWith('--')) {
      // Still validate unit if present
      if (unit !== null && !isValidCSSUnit(unit)) {
        this.diagnostics.push({
          category: this.severity,
          code: CssDiagnosticCode.INVALID_CSS_UNIT,
          messageText: buildInvalidUnitMessage(unit),
          file: this.component.getSourceFile(),
          start: attribute.keySpan.end.offset - unit.length,
          length: unit.length,
          source: 'angular',
        });
      }
      return;
    }

    // Property names may be in kebab-case (e.g., 'background-color'), so convert to camelCase for validation
    const camelCasePropertyName = kebabToCamelCase(propertyName);

    // Check for obsolete CSS property first (takes priority)
    const obsoleteInfo = getObsoleteCSSPropertyInfo(camelCasePropertyName);
    if (obsoleteInfo !== undefined) {
      this.diagnostics.push({
        category: ts.DiagnosticCategory.Warning, // Always warning for obsolete
        code: CssDiagnosticCode.OBSOLETE_CSS_PROPERTY,
        messageText: buildObsoletePropertyMessage(
          propertyName,
          camelCasePropertyName,
          obsoleteInfo,
        ),
        file: this.component.getSourceFile(),
        start: attribute.keySpan.start.offset,
        length: attribute.keySpan.end.offset - attribute.keySpan.start.offset,
        source: 'angular',
      });
      // Continue to validate unit even for obsolete properties
    }
    // Validate CSS property name (only if not obsolete - obsolete props are known but deprecated)
    else if (!isValidCSSPropertyVSCode(camelCasePropertyName)) {
      this.diagnostics.push({
        category: this.severity,
        code: CssDiagnosticCode.UNKNOWN_CSS_PROPERTY,
        messageText: buildUnknownPropertyMessage(propertyName, camelCasePropertyName),
        file: this.component.getSourceFile(),
        start: attribute.keySpan.start.offset,
        length: attribute.keySpan.end.offset - attribute.keySpan.start.offset,
        source: 'angular',
      });
    }

    // Validate CSS unit suffix (if present)
    if (unit !== null && !isValidCSSUnit(unit)) {
      this.diagnostics.push({
        category: this.severity,
        code: CssDiagnosticCode.INVALID_CSS_UNIT,
        messageText: buildInvalidUnitMessage(unit),
        file: this.component.getSourceFile(),
        start: attribute.keySpan.end.offset - unit.length,
        length: unit.length,
        source: 'angular',
      });
    }

    // Validate literal CSS values (if enabled)
    maybeReportInvalidCssValue(
      this.component,
      this.diagnostics,
      this.config,
      propertyName,
      unit,
      attribute.value,
      CssDiagnosticCode.INVALID_CSS_VALUE,
    );

    // Validate value type for unit suffix bindings (e.g., [style.width.px]="'red'" is invalid)
    if (unit !== null && isValidCSSUnit(unit)) {
      this.validateUnitValueType(attribute, unit);
    }

    // In strict mode, warn when a number is used without a unit for properties that typically need units
    // For example: [style.width]="100" should probably be [style.width.px]="100" or [style.width]="'100px'"
    if (unit === null && this.config.strictUnitValues) {
      this.validateMissingUnitForNumber(attribute, camelCasePropertyName);
    }
  }

  /**
   * Properties that typically require length units.
   * When a number is used directly for these properties without a unit,
   * it might indicate a mistake.
   */
  private static readonly LENGTH_PROPERTIES = new Set([
    'width',
    'height',
    'minWidth',
    'maxWidth',
    'minHeight',
    'maxHeight',
    'top',
    'right',
    'bottom',
    'left',
    'margin',
    'marginTop',
    'marginRight',
    'marginBottom',
    'marginLeft',
    'padding',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontSize',
    'letterSpacing',
    'wordSpacing',
    'textIndent',
    'borderWidth',
    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',
    'borderRadius',
    'outlineWidth',
    'gap',
    'rowGap',
    'columnGap',
    'flexBasis',
  ]);

  /**
   * Validates that length-based properties don't have bare numbers without units.
   * In strict mode, warns when [style.width]="100" is used instead of
   * [style.width.px]="100" or [style.width]="'100px'".
   */
  private validateMissingUnitForNumber(
    attribute: TmplAstBoundAttribute,
    propertyName: string,
  ): void {
    // Only check properties that typically need length units
    if (!CssBindingVisitor.LENGTH_PROPERTIES.has(propertyName)) {
      return;
    }

    // Get the expression AST
    let ast: AST = attribute.value;
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // We can only validate literal primitive values statically
    if (!(ast instanceof LiteralPrimitive)) {
      return;
    }

    const value = ast.value;

    // Only warn if the value is a number (not a string with unit)
    if (typeof value === 'number') {
      // Get the appropriate units for this property type
      const unitCategory = getPropertyUnitCategory(propertyName);
      const suggestedUnits = this.getSuggestedUnitsForCategory(unitCategory);
      const unitSuffix = suggestedUnits[0] || 'px'; // Default to 'px'

      // Build the suggestion message
      const unitOptions = suggestedUnits.slice(0, 4).map((u) => `.${u}`);
      const unitOptionsStr =
        unitOptions.length > 1
          ? `Common units: ${unitOptions.join(', ')}`
          : `Suggested unit: ${unitOptions[0]}`;

      this.diagnostics.push({
        category: ts.DiagnosticCategory.Suggestion,
        code: CssDiagnosticCode.MISSING_UNIT_FOR_NUMBER,
        messageText:
          `Style binding '[style.${propertyName}]' has a numeric value (${value}) without a unit. ` +
          `Consider using '[style.${propertyName}.${unitSuffix}]="${value}"' or '[style.${propertyName}]="'${value}${unitSuffix}'"'. ` +
          unitOptionsStr,
        file: this.component.getSourceFile(),
        start: ast.sourceSpan.start,
        length: ast.sourceSpan.end - ast.sourceSpan.start,
        source: 'angular',
      });
    }
  }

  /**
   * Gets suggested CSS units for a given unit category.
   * This provides common, practical suggestions based on property type.
   */
  private getSuggestedUnitsForCategory(category: string): string[] {
    switch (category) {
      case 'time':
        return ['s', 'ms'];
      case 'angle':
        return ['deg', 'rad', 'turn'];
      case 'length':
      default:
        return ['px', 'em', 'rem', '%', 'vh', 'vw'];
    }
  }

  /**
   * Validates that the value for a unit-suffixed style binding is appropriate.
   * Unit suffixes expect numeric values (or numeric strings).
   *
   * For example:
   * - [style.width.px]="100" - ✅ Valid (number)
   * - [style.width.px]="'100'" - ✅ Valid (numeric string)
   * - [style.width.px]="'red'" - ❌ Invalid (non-numeric string)
   */
  private validateUnitValueType(attribute: TmplAstBoundAttribute, unit: string): void {
    // Get the expression AST
    let ast: AST = attribute.value;
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // We can only validate literal primitive values statically
    if (!(ast instanceof LiteralPrimitive)) {
      // If it's not a literal, we can't validate it statically
      // (could be a variable, method call, etc.)
      return;
    }

    const value = ast.value;

    // Null and undefined are valid (will result in style being removed)
    if (value === null || value === undefined) {
      return;
    }

    // Numbers are always valid for unit suffixes
    if (typeof value === 'number') {
      return;
    }

    // Strings need to be checked if they represent numeric values
    if (typeof value === 'string') {
      const trimmed = value.trim();

      // Empty string is valid (will result in style being removed)
      if (trimmed === '') {
        return;
      }

      // Check if the string is a valid numeric value
      // This includes integers, decimals, negative numbers, etc.
      const numericValue = parseFloat(trimmed);
      if (!isNaN(numericValue) && isFinite(numericValue)) {
        // It's a numeric string like '100' - valid but suboptimal
        // In strict mode, suggest using a number directly
        if (this.config.strictUnitValues) {
          const propertyName = attribute.name.split('.')[0];
          this.diagnostics.push({
            category: ts.DiagnosticCategory.Suggestion,
            code: CssDiagnosticCode.PREFER_NUMERIC_UNIT_VALUE,
            messageText:
              `Style binding '[style.${propertyName}.${unit}]' expects a numeric value. ` +
              `Consider using ${numericValue} instead of '${trimmed}' for better type safety.`,
            file: this.component.getSourceFile(),
            start: ast.sourceSpan.start,
            length: ast.sourceSpan.end - ast.sourceSpan.start,
            source: 'angular',
          });
        }
        return;
      }

      // Non-numeric string with a unit suffix - this is an error!
      // Angular will concatenate: 'red' + 'px' = 'redpx' which is invalid CSS
      const propertyName = attribute.name.split('.')[0];

      this.diagnostics.push({
        category: ts.DiagnosticCategory.Warning,
        code: CssDiagnosticCode.INVALID_UNIT_VALUE,
        messageText:
          `Invalid value '${value}' for style binding '[style.${propertyName}.${unit}]'. ` +
          `Unit suffix '.${unit}' expects a numeric value. ` +
          `The value '${value}' will result in invalid CSS '${value}${unit}'.`,
        file: this.component.getSourceFile(),
        start: ast.sourceSpan.start,
        length: ast.sourceSpan.end - ast.sourceSpan.start,
        source: 'angular',
      });
    }

    // Boolean values with unit suffix don't make sense
    if (typeof value === 'boolean') {
      const propertyName = attribute.name.split('.')[0];

      this.diagnostics.push({
        category: ts.DiagnosticCategory.Warning,
        code: CssDiagnosticCode.INVALID_UNIT_VALUE,
        messageText:
          `Invalid value '${value}' for style binding '[style.${propertyName}.${unit}]'. ` +
          `Unit suffix '.${unit}' expects a numeric value, not a boolean.`,
        file: this.component.getSourceFile(),
        start: ast.sourceSpan.start,
        length: ast.sourceSpan.end - ast.sourceSpan.start,
        source: 'angular',
      });
    }
  }

  /**
   * Validates CSS properties in object-style bindings like [style]="{prop: value}".
   */
  private validateStyleObjectLiteral(attribute: TmplAstBoundAttribute): void {
    // Unwrap ASTWithSource to get the actual AST
    let ast: AST = attribute.value;
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // Check if the expression is a LiteralMap (object literal)
    if (!(ast instanceof LiteralMap)) {
      // Not an object literal (could be a variable reference, function call, etc.)
      // We can't validate those statically
      return;
    }

    // Track seen properties for duplicate detection (normalized to camelCase)
    const seenProperties = new Map<string, {key: LiteralMapKey; index: number}>();

    // Validate each key in the object literal
    for (let i = 0; i < ast.keys.length; i++) {
      const key = ast.keys[i];

      // Handle spread operators by resolving their type
      if (key.kind === 'spread') {
        this.validateSpreadProperties(ast.values[i], key.sourceSpan, seenProperties);
        continue;
      }

      // Parse the key: could be "propertyName" or "propertyName.unit"
      const fullKey = key.key;
      const keyParts = fullKey.split('.');
      const propertyName = keyParts[0];
      const unit = keyParts.length > 1 ? keyParts[1] : null;

      // Normalize property name for duplicate detection
      const normalizedProp = normalizeCSSPropertyName(propertyName);

      // Check for duplicates (case-insensitive)
      const existingEntry = seenProperties.get(normalizedProp);
      if (existingEntry) {
        const existingKey = existingEntry.key;
        if (existingKey.kind === 'property') {
          // Report duplicate
          let message: string;
          if (existingKey.key === fullKey) {
            message = `Duplicate CSS property '${fullKey}'. Only the last value will be used.`;
          } else {
            message = `Duplicate CSS property: '${fullKey}' and '${existingKey.key}' refer to the same property.`;
          }

          this.diagnostics.push({
            category: this.severity,
            code: CssDiagnosticCode.DUPLICATE_CSS_PROPERTY,
            messageText: message,
            file: this.component.getSourceFile(),
            start: key.sourceSpan.start,
            length: key.sourceSpan.end - key.sourceSpan.start,
            source: 'angular',
          });
        }
      } else {
        seenProperties.set(normalizedProp, {key, index: i});
      }

      // Validate CSS property name
      this.validateCssPropertyName(propertyName, fullKey, key.sourceSpan);

      // Validate CSS unit suffix (if present)
      if (unit !== null && !isValidCSSUnit(unit)) {
        this.diagnostics.push({
          category: this.severity,
          code: CssDiagnosticCode.INVALID_CSS_UNIT,
          messageText: buildInvalidUnitMessage(unit),
          file: this.component.getSourceFile(),
          // Position at the unit part of the key
          start: key.sourceSpan.start + propertyName.length + 1,
          length: unit.length,
          source: 'angular',
        });
      }

      // Validate literal CSS values (if enabled)
      const valueAst = ast.values[i];
      maybeReportInvalidCssValue(
        this.component,
        this.diagnostics,
        this.config,
        propertyName,
        unit,
        valueAst,
        CssDiagnosticCode.INVALID_CSS_VALUE_IN_OBJECT,
      );
    }
  }

  /**
   * Validates CSS properties within a spread expression.
   * Uses the template type checker to resolve the type of the spread expression
   * and validates each property of that type.
   */
  private validateSpreadProperties(
    value: AST,
    spreadSpan: {start: number; end: number},
    seenProperties: Map<string, {key: LiteralMapKey; index: number}>,
  ): void {
    // The value for a spread key is the expression being spread (e.g., PropertyRead for `baseStyles`)
    // It's NOT wrapped in SpreadElement - the spread info is in the key.kind
    let spreadExpr: AST = value;

    // If it's wrapped in SpreadElement, unwrap it
    if (value instanceof SpreadElement) {
      spreadExpr = value.expression;
    }

    // Use the template type checker to resolve the type of the spread expression
    const symbol = this.templateTypeChecker.getSymbolOfNode(spreadExpr, this.component);
    if (symbol === null || !('tsType' in symbol)) {
      // Cannot resolve type - skip validation
      return;
    }

    const spreadType = symbol.tsType;

    // Get the properties of the spread type
    const properties = spreadType.getProperties();
    for (const prop of properties) {
      const propName = prop.getName();

      // Validate the property name as a CSS property
      this.validateCssPropertyName(propName, propName, spreadSpan);

      // Track for duplicate detection
      const normalizedProp = normalizeCSSPropertyName(propName);
      if (!seenProperties.has(normalizedProp)) {
        // Mark as seen but with a synthetic key since we don't have a real LiteralMapKey
        seenProperties.set(normalizedProp, {
          key: {
            kind: 'property',
            key: propName,
            quoted: false,
            span: new ParseSpan(spreadSpan.start, spreadSpan.end),
            sourceSpan: spreadSpan,
          },
          index: -1, // Spread properties don't have a specific index
        });
      }
    }
  }

  /**
   * Validates a CSS property name and reports diagnostics for unknown or obsolete properties.
   */
  private validateCssPropertyName(
    propertyName: string,
    fullKey: string,
    sourceSpan: {start: number; end: number},
  ): void {
    // CSS custom properties (--my-var) are always valid
    if (propertyName.startsWith('--')) {
      return;
    }

    // Convert to camelCase for lookup
    const camelCasePropertyName = kebabToCamelCase(propertyName);

    // Check for obsolete CSS property first (takes priority)
    const obsoleteInfo = getObsoleteCSSPropertyInfo(camelCasePropertyName);
    if (obsoleteInfo !== undefined) {
      this.diagnostics.push({
        category: ts.DiagnosticCategory.Warning, // Always warning for obsolete
        code: CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_OBJECT,
        messageText: buildObsoletePropertyMessage(
          propertyName,
          camelCasePropertyName,
          obsoleteInfo,
        ),
        file: this.component.getSourceFile(),
        start: sourceSpan.start,
        length: sourceSpan.end - sourceSpan.start,
        source: 'angular',
      });
      return; // Skip unknown check if obsolete
    }

    if (!isValidCSSPropertyVSCode(camelCasePropertyName)) {
      this.diagnostics.push({
        category: this.severity,
        code: CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
        messageText: buildUnknownPropertyMessage(propertyName, camelCasePropertyName),
        file: this.component.getSourceFile(),
        start: sourceSpan.start,
        length: sourceSpan.end - sourceSpan.start,
        source: 'angular',
      });
    }
  }

  /**
   * Collects all style properties being set on an element and detects conflicts.
   */
  private detectStyleBindingConflicts(element: TmplAstElement | TmplAstTemplate): void {
    // Collect all style bindings by normalized property name
    const bindingsByProperty = new Map<string, StyleBinding[]>();

    for (const input of element.inputs) {
      // Individual style binding: [style.prop]
      if (input.type === BindingType.Style) {
        const propertyName = input.name.split('.')[0];
        const normalized = normalizeCSSPropertyName(propertyName);
        const binding: StyleBinding = {
          property: normalized,
          bindingType: 'individual',
          attribute: input,
          originalPropertyName: propertyName,
        };
        const existing = bindingsByProperty.get(normalized) || [];
        existing.push(binding);
        bindingsByProperty.set(normalized, existing);
      }
      // Object style binding: [style]="{}" or [ngStyle]="{}"
      else if (input.type === BindingType.Property) {
        if (input.name === 'style' || input.name === 'ngStyle') {
          const bindingType = input.name === 'style' ? 'styleObject' : 'ngStyle';
          // Extract properties from the object literal
          const properties = this.extractPropertiesFromStyleBinding(input);
          for (const prop of properties) {
            const normalized = normalizeCSSPropertyName(prop.name);
            const binding: StyleBinding = {
              property: normalized,
              bindingType,
              attribute: input,
              originalPropertyName: prop.name,
            };
            const existing = bindingsByProperty.get(normalized) || [];
            existing.push(binding);
            bindingsByProperty.set(normalized, existing);
          }
        }
      }
    }

    // Check for conflicts (same property with different binding types)
    for (const [_property, bindings] of bindingsByProperty) {
      if (bindings.length <= 1) continue;

      // Find the highest precedence binding
      const sorted = [...bindings].sort(
        (a, b) => BINDING_PRECEDENCE[a.bindingType] - BINDING_PRECEDENCE[b.bindingType],
      );
      const winner = sorted[0];

      // Report diagnostics on lower precedence bindings
      for (let i = 1; i < sorted.length; i++) {
        const loser = sorted[i];
        // Skip if same binding type (handled by duplicate detection)
        if (loser.bindingType === winner.bindingType) continue;

        const winnerDescription = getBindingDescription(winner.bindingType);
        const loserDescription = getBindingDescription(loser.bindingType);

        this.diagnostics.push({
          category: this.severity,
          code: CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
          messageText: `CSS property '${loser.originalPropertyName}' is set via multiple bindings. The ${winnerDescription} binding takes precedence over ${loserDescription}.`,
          file: this.component.getSourceFile(),
          start: loser.attribute.keySpan.start.offset,
          length: loser.attribute.keySpan.end.offset - loser.attribute.keySpan.start.offset,
          source: 'angular',
        });
      }
    }

    // Check for shorthand/longhand conflicts
    // When both a shorthand (e.g., 'background') and one of its longhands (e.g., 'backgroundColor')
    // are set, the shorthand will override the longhand values
    this.detectShorthandLonghandConflicts(bindingsByProperty);
  }

  /**
   * Detects conflicts between CSS shorthand and longhand properties.
   * For example, setting both [style.background] and [style.backgroundColor]
   * will result in backgroundColor being overridden by the background shorthand.
   */
  private detectShorthandLonghandConflicts(bindingsByProperty: Map<string, StyleBinding[]>): void {
    // Get all unique property names (these are normalized - all lowercase)
    const propertyNames = Array.from(bindingsByProperty.keys());

    // Check each shorthand property for longhand conflicts
    for (const normalizedProperty of propertyNames) {
      // Get the first binding to get the original (unnormalized) property name
      const bindings = bindingsByProperty.get(normalizedProperty);
      if (!bindings || bindings.length === 0) continue;

      // Get the original property name and convert to camelCase for shorthand lookup
      const originalName = bindings[0].originalPropertyName;
      const camelCaseName = kebabToCamelCase(originalName);

      // Skip if this property isn't a shorthand
      if (!isShorthandProperty(camelCaseName)) continue;

      const shorthandBindings = bindings;

      // Get the longhands for this shorthand
      const longhands = getShorthandLonghands(camelCaseName);

      // Check if any longhand is also being set
      for (const longhand of longhands) {
        // Normalize the longhand for lookup in the map
        const normalizedLonghand = longhand.toLowerCase();
        const longhandBindings = bindingsByProperty.get(normalizedLonghand);
        if (!longhandBindings || longhandBindings.length === 0) continue;

        // Report conflict - the shorthand will override the longhand
        // Report on the longhand binding since that's the one that will be overridden
        for (const longhandBinding of longhandBindings) {
          const shorthandBinding = shorthandBindings[0]; // Use first shorthand as reference
          const shorthandDisplay = camelToKebabCase(shorthandBinding.originalPropertyName);
          const longhandDisplay = camelToKebabCase(longhandBinding.originalPropertyName);

          this.diagnostics.push({
            category: ts.DiagnosticCategory.Warning,
            code: CssDiagnosticCode.SHORTHAND_OVERRIDE,
            messageText:
              `CSS property '${longhandDisplay}' will be overridden by the '${shorthandDisplay}' shorthand property. ` +
              `The shorthand resets all of its longhand properties. ` +
              `Consider using only the shorthand or only the longhand properties.`,
            file: this.component.getSourceFile(),
            start: longhandBinding.attribute.keySpan.start.offset,
            length:
              longhandBinding.attribute.keySpan.end.offset -
              longhandBinding.attribute.keySpan.start.offset,
            source: 'angular',
            relatedInformation: [
              {
                category: ts.DiagnosticCategory.Message,
                code: 0,
                file: this.component.getSourceFile(),
                start: shorthandBinding.attribute.keySpan.start.offset,
                length:
                  shorthandBinding.attribute.keySpan.end.offset -
                  shorthandBinding.attribute.keySpan.start.offset,
                messageText: `'${shorthandDisplay}' shorthand is set here`,
              },
            ],
          });
        }
      }
    }
  }

  /**
   * Extracts property names from a style object binding ([style]="{...}" or [ngStyle]="{...}").
   */
  private extractPropertiesFromStyleBinding(
    attribute: TmplAstBoundAttribute,
  ): {name: string; span: {start: number; end: number}}[] {
    const properties: {name: string; span: {start: number; end: number}}[] = [];

    // Unwrap ASTWithSource to get the actual AST
    let ast: AST = attribute.value;
    if (ast instanceof ASTWithSource) {
      ast = ast.ast;
    }

    // Check if the expression is a LiteralMap (object literal)
    if (ast instanceof LiteralMap) {
      for (const key of ast.keys) {
        if (key.kind === 'property') {
          const propName = key.key.split('.')[0]; // Handle "prop.unit" format
          properties.push({name: propName, span: key.sourceSpan});
        } else if (key.kind === 'spread') {
          // For spread, try to resolve properties via type checker
          const spreadProps = this.resolveSpreadProperties(ast.values[ast.keys.indexOf(key)]);
          properties.push(...spreadProps);
        }
      }
    }

    return properties;
  }

  /**
   * Resolves properties from a spread expression for conflict detection.
   */
  private resolveSpreadProperties(
    value: AST,
  ): {name: string; span: {start: number; end: number}}[] {
    const properties: {name: string; span: {start: number; end: number}}[] = [];

    // Get the actual spread expression
    let spreadExpr: AST = value;
    if (value instanceof SpreadElement) {
      spreadExpr = value.expression;
    }

    // Use the template type checker to resolve the type
    const symbol = this.templateTypeChecker.getSymbolOfNode(spreadExpr, this.component);
    if (symbol === null || !('tsType' in symbol)) {
      return properties;
    }

    const spreadType = symbol.tsType;
    const typeProperties = spreadType.getProperties();
    const span = {start: spreadExpr.sourceSpan.start, end: spreadExpr.sourceSpan.end};

    for (const prop of typeProperties) {
      properties.push({name: prop.getName(), span});
    }

    return properties;
  }

  // Required visitor methods
  visitElement(element: TmplAstElement): void {
    // First, detect style binding conflicts on this element
    this.detectStyleBindingConflicts(element);

    // Then, process individual bindings for property/unit validation
    for (const input of element.inputs) {
      this.visitBoundAttribute(input);
    }
    // Recursively visit children
    tmplAstVisitAll(this, element.children);
  }
  visitTemplate(template: TmplAstTemplate): void {
    // Detect style binding conflicts on ng-template
    this.detectStyleBindingConflicts(template);

    // Process style bindings on template inputs
    for (const input of template.inputs) {
      this.visitBoundAttribute(input);
    }
    // Recursively visit children
    tmplAstVisitAll(this, template.children);
  }
  visitContent(): void {}
  visitVariable(): void {}
  visitReference(): void {}
  visitTextAttribute(): void {}
  visitBoundText(): void {}
  visitText(): void {}
  visitIcu(): void {}
  visitBoundEvent(): void {}
  visitDeferredBlock(): void {}
  visitDeferredBlockPlaceholder(): void {}
  visitDeferredBlockError(): void {}
  visitDeferredBlockLoading(): void {}
  visitDeferredTrigger(): void {}
  visitSwitchBlock(): void {}
  visitSwitchBlockCase(): void {}
  visitSwitchBlockCaseGroup(): void {}
  visitForLoopBlock(): void {}
  visitForLoopBlockEmpty(): void {}
  visitIfBlock(): void {}
  visitIfBlockBranch(): void {}
  visitUnknownBlock(): void {}
  visitLetDeclaration(): void {}
  visitComponent(): void {}
  visitDirective(): void {}
}
