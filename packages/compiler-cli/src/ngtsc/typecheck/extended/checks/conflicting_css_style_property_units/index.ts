/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  BindingType,
} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, ExtendedTemplateDiagnosticName} from '../../../../diagnostics';
import {NgTemplateDiagnostic} from '../../../api';
import {TemplateCheckFactory, TemplateCheckWithVisitor, TemplateContext} from '../../api';

/**
 * A check which detects conflicting CSS style property bindings with different units on the same element.
 * This occurs when the same CSS property is bound multiple times with different units (e.g., px and %).
 */
class ConflictingCssStylePropertyUnitsCheck extends TemplateCheckWithVisitor<ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS> {
  override code = ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS as const;

  override visitNode(
    ctx: TemplateContext<ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS>,
    component: ts.ClassDeclaration,
    node: TmplAstNode | AST,
  ): NgTemplateDiagnostic<ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS>[] {
    if (!(node instanceof TmplAstElement)) return [];

    // Early exit if no inputs
    if (!node.inputs || node.inputs.length === 0) return [];

    // Collect all style bindings on this element
    const styleBindings = new Map<string, TmplAstBoundAttribute[]>();

    for (const input of node.inputs) {
      if (!(input instanceof TmplAstBoundAttribute)) continue;
      if (input.type !== BindingType.Style) continue;

      // Use get() with fallback instead of has() + get()
      const existing = styleBindings.get(input.name);
      if (existing) {
        existing.push(input);
      } else {
        styleBindings.set(input.name, [input]);
      }
    }

    // Early exit if no style bindings or no potential conflicts
    if (styleBindings.size === 0) return [];

    const diagnostics: NgTemplateDiagnostic<ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS>[] = [];

    // Check each CSS property for conflicts
    for (const [propertyName, bindings] of styleBindings) {
      if (bindings.length < 2) continue;

      // Separate bindings by unit presence and group by unit
      const unitGroups = new Map<string, TmplAstBoundAttribute[]>();
      const nonUnitBindings: TmplAstBoundAttribute[] = [];
      let hasMultipleUnits = false;
      let hasDuplicateSameUnit = false;

      for (const binding of bindings) {
        if (binding.unit) {
          const unit = binding.unit;
          const existing = unitGroups.get(unit);
          if (existing) {
            existing.push(binding);
            hasDuplicateSameUnit = true;
          } else {
            unitGroups.set(unit, [binding]);
            if (unitGroups.size > 1) {
              hasMultipleUnits = true;
            }
          }
        } else {
          nonUnitBindings.push(binding);
        }
      }

      // Check for mixed unit/non-unit conflicts
      const hasMixedUnitNonUnit = unitGroups.size > 0 && nonUnitBindings.length > 0;

      // Early exit if no conflicts
      if (!hasMultipleUnits && !hasDuplicateSameUnit && !hasMixedUnitNonUnit) continue;

      // Process conflicts and create diagnostics directly
      if (hasMixedUnitNonUnit) {
        // Report on unit bindings when mixed with non-unit bindings
        for (const unitBindings of unitGroups.values()) {
          for (const binding of unitBindings) {
            const message = this.createMixedUnitNonUnitMessage(propertyName, binding.unit!);
            diagnostics.push(ctx.makeTemplateDiagnostic(binding.keySpan, message));
          }
        }
      } else if (hasMultipleUnits) {
        // Report on all bindings except the first one in the overall list
        const unitBindingsFlat = Array.from(unitGroups.values()).flat();
        for (let i = 1; i < unitBindingsFlat.length; i++) {
          const binding = unitBindingsFlat[i];
          const message = this.createConflictingUnitsMessage(propertyName, unitGroups, binding);
          diagnostics.push(ctx.makeTemplateDiagnostic(binding.keySpan, message));
        }
      } else if (hasDuplicateSameUnit) {
        // Report on duplicate bindings with same unit (skip first in each group)
        for (const unitBindings of unitGroups.values()) {
          if (unitBindings.length > 1) {
            const unit = unitBindings[0].unit!;
            const message = this.createDuplicateSameUnitMessage(propertyName, unit);
            for (let i = 1; i < unitBindings.length; i++) {
              diagnostics.push(ctx.makeTemplateDiagnostic(unitBindings[i].keySpan, message));
            }
          }
        }
      }
    }

    return diagnostics;
  }

  private createConflictingUnitsMessage(
    propertyName: string,
    unitGroups: Map<string, TmplAstBoundAttribute[]>,
    binding: TmplAstBoundAttribute,
  ): string {
    const units: string[] = [];
    const conflictingUnits: string[] = [];
    const bindingUnit = binding.unit!;

    for (const unit of unitGroups.keys()) {
      units.push(unit);
      if (unit !== bindingUnit) {
        conflictingUnits.push(unit);
      }
    }

    units.sort();
    conflictingUnits.sort();

    // Build strings
    const unitsStr = units.map((u) => `'${u}'`).join(', ');
    const conflictingUnitsStr = conflictingUnits.map((u) => `'${u}'`).join(', ');
    const isPlural = conflictingUnits.length > 1;

    return (
      `Conflicting CSS style binding for property '${propertyName}'. ` +
      `This element has multiple bindings for the same property with different units: ${unitsStr}. ` +
      `Only one unit should be used per CSS property. ` +
      `Consider using a conditional expression like '[style.${propertyName}.${bindingUnit}]="condition ? value1 : value2"' ` +
      `or remove the conflicting binding${isPlural ? 's' : ''} with unit${isPlural ? 's' : ''} ${conflictingUnitsStr}.`
    );
  }

  private createDuplicateSameUnitMessage(propertyName: string, unit: string): string {
    return (
      `Duplicate CSS style binding for property '${propertyName}' with unit '${unit}'. ` +
      `This element has multiple bindings for the same property and unit. ` +
      `Only the last binding will take effect, overriding the previous binding ` +
      `Consider combining these bindings into a single expression or removing the duplicate binding.`
    );
  }

  private createMixedUnitNonUnitMessage(propertyName: string, unit: string): string {
    const unitSpecific = `[style.${propertyName}.${unit}]`;

    const general = `[style.${propertyName}]`;

    return (
      `Conflicting CSS style binding for property '${propertyName}'. ` +
      `This element has bindings for the same property with unit '${unit}' and without any unit. ` +
      `unit-specific binding '${unitSpecific}' and general binding '${general}'` +
      `Only the last binding will take effect, overriding the previous binding`
    );
  }
}

export const factory: TemplateCheckFactory<
  ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS,
  ExtendedTemplateDiagnosticName.CONFLICTING_CSS_STYLE_PROPERTY_UNITS
> = {
  code: ErrorCode.CONFLICTING_CSS_STYLE_PROPERTY_UNITS,
  name: ExtendedTemplateDiagnosticName.CONFLICTING_CSS_STYLE_PROPERTY_UNITS,
  create: () => new ConflictingCssStylePropertyUnitsCheck(),
};
