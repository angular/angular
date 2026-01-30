/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ASTWithSource,
  BindingType as CompilerBindingType,
  ParseSourceSpan,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {
  DirectiveSymbol,
  ElementSymbol,
  TemplateTypeChecker,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {
  BindingIssue,
  BindingOrigin,
  BindingTarget,
  BindingType,
  BindingValue,
  ClassBinding,
  ClassSource,
  DirectiveHostBindings,
  DirectiveSummary,
  EffectiveClassBinding,
  EffectiveStyleProperty,
  ElementBindings,
  ElementSummary,
  HostBinding,
  SourceLocation,
  StyleBinding,
  StyleSource,
  TemplateBinding,
} from './types';

/**
 * Collects all bindings affecting an element from all sources:
 * - Template bindings ([disabled], (click), [style.width], etc.)
 * - Directive host bindings (from host: { } metadata)
 * - @HostBinding decorator bindings
 *
 * This provides a unified view for the Element Inspector feature.
 */
export class BindingCollector {
  constructor(
    private readonly element: TmplAstElement,
    private readonly elementSymbol: ElementSymbol,
    private readonly ttc: TemplateTypeChecker,
    private readonly typeChecker: ts.TypeChecker,
    private readonly component: ts.ClassDeclaration,
  ) {}

  /**
   * Collect all bindings for the element.
   */
  collect(): ElementBindings {
    const tagName = this.element.name;
    const htmlType = this.typeChecker.typeToString(this.elementSymbol.tsType);

    // Collect directive summaries
    const directives = this.collectDirectiveSummaries();

    // Collect template bindings
    const templateBindings = this.collectTemplateBindings();

    // Collect directive host bindings
    const directiveBindings = this.collectDirectiveHostBindings(directives);

    // Aggregate effective styles
    const effectiveStyles = this.aggregateStyles(templateBindings.styles, directiveBindings);

    // Aggregate effective classes
    const effectiveClasses = this.aggregateClasses(templateBindings.classes, directiveBindings);

    // Detect issues
    const issues = this.detectIssues(templateBindings, directiveBindings, effectiveStyles);

    return {
      element: this.element,
      elementSymbol: this.elementSymbol,
      tagName,
      htmlType,
      directives,
      templateBindings,
      directiveBindings,
      effectiveStyles,
      effectiveClasses,
      issues,
      issueCount: issues.length,
    };
  }

  /**
   * Get a summary of the element for quick display.
   */
  getSummary(): ElementSummary {
    const bindings = this.collect();

    const issuesByCategory = new Map<string, number>();
    for (const issue of bindings.issues) {
      const count = issuesByCategory.get(issue.category) || 0;
      issuesByCategory.set(issue.category, count + 1);
    }

    const bindingCount =
      bindings.templateBindings.inputs.length +
      bindings.templateBindings.outputs.length +
      bindings.templateBindings.attributes.length +
      bindings.templateBindings.styles.length +
      bindings.templateBindings.classes.length;

    return {
      tagName: bindings.tagName,
      htmlType: bindings.htmlType,
      directives: bindings.directives,
      bindingCount,
      issueCount: bindings.issueCount,
      issuesByCategory,
    };
  }

  /**
   * Collect directive summaries from element symbol.
   */
  private collectDirectiveSummaries(): DirectiveSummary[] {
    return this.elementSymbol.directives.map((dir) => this.toDirectiveSummary(dir));
  }

  /**
   * Convert DirectiveSymbol to DirectiveSummary.
   */
  private toDirectiveSummary(dir: DirectiveSymbol): DirectiveSummary {
    const declaration = dir.tsSymbol.valueDeclaration;
    const classDeclaration = declaration && ts.isClassDeclaration(declaration) ? declaration : null;

    return {
      name: dir.tsSymbol.name,
      selector: dir.selector,
      isComponent: dir.isComponent,
      isHostDirective: dir.isHostDirective,
      tsSymbol: dir.tsSymbol,
      classDeclaration: classDeclaration!,
    };
  }

  /**
   * Collect all template-level bindings.
   */
  private collectTemplateBindings(): ElementBindings['templateBindings'] {
    const inputs: TemplateBinding[] = [];
    const outputs: TemplateBinding[] = [];
    const attributes: TemplateBinding[] = [];
    const styles: StyleBinding[] = [];
    const classes: ClassBinding[] = [];
    let styleObject: TemplateBinding | undefined;
    let classObject: TemplateBinding | undefined;

    // Process inputs (bound attributes)
    for (const input of this.element.inputs) {
      const binding = this.processInput(input);
      if (!binding) continue;

      switch (binding.type) {
        case 'style':
          styles.push(binding as StyleBinding);
          break;
        case 'style-object':
          styleObject = binding;
          break;
        case 'class':
          classes.push(binding as ClassBinding);
          break;
        case 'class-object':
          classObject = binding;
          break;
        case 'input':
          inputs.push(binding);
          break;
        default:
          inputs.push(binding);
      }
    }

    // Process outputs (bound events)
    for (const output of this.element.outputs) {
      const binding = this.processOutput(output);
      if (binding) {
        outputs.push(binding);
      }
    }

    // Process text attributes
    for (const attr of this.element.attributes) {
      const binding = this.processAttribute(attr);
      if (binding) {
        attributes.push(binding);
      }
    }

    return {inputs, outputs, attributes, styles, classes, styleObject, classObject};
  }

  /**
   * Process a bound attribute (input).
   */
  private processInput(
    input: TmplAstBoundAttribute,
  ): TemplateBinding | StyleBinding | ClassBinding | null {
    const sourceLocation = this.toSourceLocation(input.sourceSpan);

    // Determine binding type based on the attribute type
    let type: BindingType;
    let cssProperty: string | undefined;
    let unit: string | undefined;
    let className: string | undefined;

    switch (input.type) {
      case CompilerBindingType.Style:
        if (input.name === 'style') {
          type = 'style-object';
        } else {
          type = 'style';
          cssProperty = input.name;
          unit = input.unit ?? undefined;
        }
        break;
      case CompilerBindingType.Class:
        if (input.name === 'class') {
          type = 'class-object';
        } else {
          type = 'class';
          className = input.name;
        }
        break;
      case CompilerBindingType.Attribute:
        type = 'attribute';
        break;
      case CompilerBindingType.Property:
      default:
        type = 'input';
    }

    // Build full key
    let fullKey = `[${input.name}`;
    if (unit) {
      fullKey += `.${unit}`;
    }
    fullKey += ']';

    // Determine target
    const target = this.resolveBindingTarget(input.name, 'input');

    // Get value information
    const value = this.extractBindingValue(input);

    const baseBinding: TemplateBinding = {
      name: input.name,
      fullKey,
      type,
      target,
      value,
      sourceLocation,
      astNode: input,
    };

    if (type === 'style' || type === 'style-object') {
      return {
        ...baseBinding,
        type,
        cssProperty: cssProperty ?? '',
        unit,
      } as StyleBinding;
    }

    if (type === 'class' || type === 'class-object') {
      return {
        ...baseBinding,
        type,
        className: className ?? '',
      } as ClassBinding;
    }

    return baseBinding;
  }

  /**
   * Process a bound event (output).
   */
  private processOutput(output: TmplAstBoundEvent): TemplateBinding | null {
    const sourceLocation = this.toSourceLocation(output.sourceSpan);
    const target = this.resolveBindingTarget(output.name, 'output');

    return {
      name: output.name,
      fullKey: `(${output.name})`,
      type: 'output',
      target,
      value: {
        isStatic: false,
        expression: output.handler instanceof ASTWithSource ? (output.handler.source ?? '') : '',
      },
      sourceLocation,
      astNode: output,
    };
  }

  /**
   * Process a text attribute.
   */
  private processAttribute(attr: TmplAstTextAttribute): TemplateBinding | null {
    const sourceLocation = this.toSourceLocation(attr.sourceSpan);

    return {
      name: attr.name,
      fullKey: attr.name,
      type: 'attribute',
      target: {kind: 'dom-attribute'},
      value: {
        isStatic: true,
        staticValue: attr.value,
      },
      sourceLocation,
      astNode: attr,
    };
  }

  /**
   * Extract value information from a bound attribute.
   */
  private extractBindingValue(input: TmplAstBoundAttribute): BindingValue {
    // Check if it's a static literal
    const ast = input.value;
    const source = input.value instanceof ASTWithSource ? (input.value.source ?? '') : '';

    if (ast && 'value' in ast && typeof ast.value !== 'object') {
      return {
        isStatic: true,
        staticValue: ast.value as string | number | boolean,
        expression: source,
        expressionSpan: input.valueSpan ?? undefined,
      };
    }

    return {
      isStatic: false,
      expression: source,
      expressionSpan: input.valueSpan ?? undefined,
    };
  }

  /**
   * Resolve what a binding targets (directive input or DOM).
   */
  private resolveBindingTarget(name: string, kind: 'input' | 'output'): BindingTarget {
    // Check if any directive has a matching input/output
    for (const dir of this.elementSymbol.directives) {
      const meta = ts.isClassDeclaration(dir.ref.node)
        ? this.ttc.getDirectiveMetadata(dir.ref.node)
        : null;
      if (!meta) continue;

      if (kind === 'input') {
        const inputMatch = meta.inputs.getByBindingPropertyName(name);
        if (inputMatch && inputMatch.length > 0) {
          return {
            kind: 'directive-input',
            directive: this.toDirectiveSummary(dir),
            // TODO: Check if this shadows a native property
          };
        }
      } else {
        const outputMatch = meta.outputs.getByBindingPropertyName(name);
        if (outputMatch && outputMatch.length > 0) {
          return {
            kind: 'directive-output',
            directive: this.toDirectiveSummary(dir),
            // TODO: Check if this shadows a native event
          };
        }
      }
    }

    // Falls through to DOM
    if (kind === 'input') {
      return {kind: 'dom-property'};
    } else {
      return {kind: 'dom-event'};
    }
  }

  /**
   * Collect host bindings from all directives.
   */
  private collectDirectiveHostBindings(directives: DirectiveSummary[]): DirectiveHostBindings[] {
    const result: DirectiveHostBindings[] = [];

    for (const dir of directives) {
      if (!dir.classDeclaration) continue;

      const meta = this.ttc.getDirectiveMetadata(dir.classDeclaration);
      if (!meta) continue;

      const bindings: HostBinding[] = [];

      // Collect from host metadata
      // Note: The host metadata is available through the compiled directive metadata
      // We'll need to access it through a different path in the actual implementation
      // For now, we'll mark this as a TODO

      if (bindings.length > 0) {
        result.push({
          directive: dir,
          source: 'host-metadata',
          bindings,
        });
      }
    }

    return result;
  }

  /**
   * Aggregate style bindings from all sources.
   */
  private aggregateStyles(
    templateStyles: StyleBinding[],
    directiveBindings: DirectiveHostBindings[],
  ): EffectiveStyleProperty[] {
    const styleMap = new Map<string, EffectiveStyleProperty>();

    // Add template style bindings
    for (const style of templateStyles) {
      if (!style.cssProperty) continue;

      const existing = styleMap.get(style.cssProperty);
      const source: StyleSource = {
        origin: 'template',
        bindingKey: style.fullKey,
        isObjectBinding: false,
        sourceLocation: style.sourceLocation,
      };

      if (existing) {
        existing.sources.push(source);
        existing.hasConflict = true;
      } else {
        styleMap.set(style.cssProperty, {
          property: style.cssProperty,
          sources: [source],
          hasConflict: false,
        });
      }
    }

    // Add directive host style bindings
    for (const dirBinding of directiveBindings) {
      for (const binding of dirBinding.bindings) {
        if (binding.type !== 'style' || !binding.cssProperty) continue;

        const existing = styleMap.get(binding.cssProperty);
        const source: StyleSource = {
          origin: dirBinding.source,
          directive: dirBinding.directive.name,
          bindingKey: `[style.${binding.cssProperty}]`,
          isObjectBinding: false,
          sourceLocation: binding.sourceLocation,
        };

        if (existing) {
          existing.sources.push(source);
          existing.hasConflict = true;
        } else {
          styleMap.set(binding.cssProperty, {
            property: binding.cssProperty,
            sources: [source],
            hasConflict: false,
          });
        }
      }
    }

    return Array.from(styleMap.values());
  }

  /**
   * Aggregate class bindings from all sources.
   */
  private aggregateClasses(
    templateClasses: ClassBinding[],
    directiveBindings: DirectiveHostBindings[],
  ): EffectiveClassBinding[] {
    const classMap = new Map<string, EffectiveClassBinding>();

    // Add template class bindings
    for (const cls of templateClasses) {
      if (!cls.className) continue;

      const existing = classMap.get(cls.className);
      const source: ClassSource = {
        origin: 'template',
        bindingKey: cls.fullKey,
        isObjectBinding: false,
        sourceLocation: cls.sourceLocation,
      };

      if (existing) {
        existing.sources.push(source);
        existing.hasConflict = true;
      } else {
        classMap.set(cls.className, {
          className: cls.className,
          sources: [source],
          hasConflict: false,
        });
      }
    }

    // Add directive host class bindings
    for (const dirBinding of directiveBindings) {
      for (const binding of dirBinding.bindings) {
        if (binding.type !== 'class' || !binding.className) continue;

        const existing = classMap.get(binding.className);
        const source: ClassSource = {
          origin: dirBinding.source,
          directive: dirBinding.directive.name,
          bindingKey: `[class.${binding.className}]`,
          isObjectBinding: false,
          sourceLocation: binding.sourceLocation,
        };

        if (existing) {
          existing.sources.push(source);
          existing.hasConflict = true;
        } else {
          classMap.set(binding.className, {
            className: binding.className,
            sources: [source],
            hasConflict: false,
          });
        }
      }
    }

    return Array.from(classMap.values());
  }

  /**
   * Detect binding issues.
   */
  private detectIssues(
    templateBindings: ElementBindings['templateBindings'],
    directiveBindings: DirectiveHostBindings[],
    effectiveStyles: EffectiveStyleProperty[],
  ): BindingIssue[] {
    const issues: BindingIssue[] = [];

    // Detect style conflicts
    for (const style of effectiveStyles) {
      if (style.hasConflict) {
        issues.push({
          code: 99005, // CONFLICTING_STYLE_BINDING
          severity: 'warning',
          message: `Style property '${style.property}' is set by multiple sources`,
          affectedBindings: [],
          category: 'style-conflict',
        });
      }
    }

    // TODO: Detect event shadowing
    // TODO: Detect directive input shadowing DOM properties

    return issues;
  }

  /**
   * Convert ParseSourceSpan to SourceLocation.
   */
  private toSourceLocation(span: ParseSourceSpan): SourceLocation {
    return {
      filePath: span.start.file.url,
      start: span.start.offset,
      end: span.end.offset,
      span,
    };
  }
}

/**
 * Create a BindingCollector for an element.
 */
export function createBindingCollector(
  element: TmplAstElement,
  elementSymbol: ElementSymbol,
  ttc: TemplateTypeChecker,
  typeChecker: ts.TypeChecker,
  component: ts.ClassDeclaration,
): BindingCollector {
  return new BindingCollector(element, elementSymbol, ttc, typeChecker, component);
}
