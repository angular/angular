/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '../../constant_pool';
import {AttributeMarker} from '../../core';
import {AST, BindingType} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import * as t from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';

import {parse as parseStyle} from './style_parser';
import {ValueConverter} from './template';


/**
 * A styling expression summary that is to be processed by the compiler
 */
export interface StylingInstruction {
  sourceSpan: ParseSourceSpan|null;
  reference: o.ExternalReference;
  buildParams(convertFn: (value: any) => o.Expression): o.Expression[];
}

/**
 * An internal record of the input data for a styling binding
 */
interface BoundStylingEntry {
  name: string;
  unit: string|null;
  sourceSpan: ParseSourceSpan;
  value: AST;
}


/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * The builder class below handles producing instructions for the following cases:
 *
 * - Static style/class attributes (style="..." and class="...")
 * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
 * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
 *
 * Due to the complex relationship of all of these cases, the instructions generated
 * for these attributes/properties/bindings must be done so in the correct order. The
 * order which these must be generated is as follows:
 *
 * if (createMode) {
 *   elementStyling(...)
 * }
 * if (updateMode) {
 *   elementStylingMap(...)
 *   elementStyleProp(...)
 *   elementClassProp(...)
 *   elementStylingApp(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export class StylingBuilder {
  private _hasInitialValues = false;
  private _hasBindings = false;

  private _classMapInput: BoundStylingEntry|null = null;
  private _styleMapInput: BoundStylingEntry|null = null;
  private _singleStyleInputs: BoundStylingEntry[]|null = null;
  private _singleClassInputs: BoundStylingEntry[]|null = null;
  private _lastStylingInput: BoundStylingEntry|null = null;

  // maps are used instead of hash maps because a Map will
  // retain the ordering of the keys
  private _stylesIndex = new Map<string, number>();
  private _classesIndex = new Map<string, number>();
  private _initialStyleValues: string[] = [];
  private _initialClassValues: string[] = [];
  private _useDefaultSanitizer = false;

  constructor(private _elementIndexExpr: o.Expression, private _directiveExpr: o.Expression|null) {}

  get hasBindingsOrInitialValues() { return this._hasBindings || this._hasInitialValues; }

  registerBoundInput(input: t.BoundAttribute): boolean {
    // [attr.style] or [attr.class] are skipped in the code below,
    // they should not be treated as styling-based bindings since
    // they are intended to be written directly to the attr and
    // will therefore skip all style/class resolution that is present
    // with style="", [style]="" and [style.prop]="", class="",
    // [class.prop]="". [class]="" assignments
    const name = input.name;
    let binding: BoundStylingEntry|null = null;
    switch (input.type) {
      case BindingType.Property:
        if (name == 'style') {
          binding = this.registerStyleInput(null, input.value, '', input.sourceSpan);
        } else if (isClassBinding(input.name)) {
          binding = this.registerClassInput(null, input.value, input.sourceSpan);
        }
        break;
      case BindingType.Style:
        binding = this.registerStyleInput(input.name, input.value, input.unit, input.sourceSpan);
        break;
      case BindingType.Class:
        binding = this.registerClassInput(input.name, input.value, input.sourceSpan);
        break;
    }
    return binding ? true : false;
  }

  registerStyleInput(
      propertyName: string|null, value: AST, unit: string|null,
      sourceSpan: ParseSourceSpan): BoundStylingEntry {
    const entry = { name: propertyName, unit, value, sourceSpan } as BoundStylingEntry;
    if (propertyName) {
      (this._singleStyleInputs = this._singleStyleInputs || []).push(entry);
      this._useDefaultSanitizer = this._useDefaultSanitizer || isStyleSanitizable(propertyName);
      registerIntoMap(this._stylesIndex, propertyName);
    } else {
      this._useDefaultSanitizer = true;
      this._styleMapInput = entry;
    }
    this._lastStylingInput = entry;
    this._hasBindings = true;
    return entry;
  }

  registerClassInput(className: string|null, value: AST, sourceSpan: ParseSourceSpan):
      BoundStylingEntry {
    const entry = { name: className, value, sourceSpan } as BoundStylingEntry;
    if (className) {
      (this._singleClassInputs = this._singleClassInputs || []).push(entry);
      registerIntoMap(this._classesIndex, className);
    } else {
      this._classMapInput = entry;
    }
    this._lastStylingInput = entry;
    this._hasBindings = true;
    return entry;
  }

  registerStyleAttr(value: string) {
    this._initialStyleValues = parseStyle(value);
    this._hasInitialValues = true;
  }

  registerClassAttr(value: string) {
    this._initialClassValues = value.split(/\s+/g);
    this._hasInitialValues = true;
  }

  private _buildInitAttrs(initialValues: string[], skipValues: boolean): o.Expression[] {
    const exprs: o.Expression[] = [];
    for (let i = 0; i < initialValues.length; i++) {
      const prop = initialValues[i];
      exprs.push(o.literal(prop));
      if (!skipValues) {
        exprs.push(o.literal(initialValues[++i]));
      }
    }
    return exprs;
  }

  populateStaticStylingAttrs(attrs: o.Expression[]): void {
    const initialClasses = this._buildInitAttrs(this._initialClassValues, true);
    if (initialClasses.length) {
      attrs.push(o.literal(AttributeMarker.Classes));
      attrs.push(...initialClasses);
    }

    const initialStyles = this._buildInitAttrs(this._initialStyleValues, false);
    if (initialStyles.length) {
      attrs.push(o.literal(AttributeMarker.Styles));
      attrs.push(...initialStyles);
    }
  }

  buildDirectivePatchStylingInstruction(
      sourceSpan: ParseSourceSpan|null, constantPool: ConstantPool): StylingInstruction|null {
    if (this._hasInitialValues && this._directiveExpr) {
      return {
        sourceSpan,
        reference: R3.elementHostAttrs,
        buildParams: () => {
          const attrs: o.Expression[] = [];
          this.populateStaticStylingAttrs(attrs);
          return [this._directiveExpr !, getConstantLiteralFromArray(constantPool, attrs)];
        }
      };
    }
    return null;
  }

  buildelementStylingInstruction(sourceSpan: ParseSourceSpan|null, constantPool: ConstantPool):
      StylingInstruction|null {
    if (this._hasBindings) {
      return {
        sourceSpan,
        reference: R3.elementStyling,
        buildParams: () => {
          const styleBindingProps =
              this._singleStyleInputs ? this._singleStyleInputs.map(i => o.literal(i.name)) : [];
          const classBindingNames =
              this._singleClassInputs ? this._singleClassInputs.map(i => o.literal(i.name)) : [];

          let expectedNumberOfArgs = 0;
          if (this._directiveExpr)
            expectedNumberOfArgs = 4;
          else if (this._useDefaultSanitizer)
            expectedNumberOfArgs = 3;
          else if (styleBindingProps.length)
            expectedNumberOfArgs = 2;
          else if (classBindingNames.length)
            expectedNumberOfArgs = 1;

          const params: o.Expression[] = [];
          addParam(
              params, classBindingNames.length > 0,
              getConstantLiteralFromArray(constantPool, classBindingNames), 1,
              expectedNumberOfArgs);
          addParam(
              params, styleBindingProps.length > 0,
              getConstantLiteralFromArray(constantPool, styleBindingProps), 2,
              expectedNumberOfArgs);
          addParam(
              params, this._useDefaultSanitizer, o.importExpr(R3.defaultStyleSanitizer), 3,
              expectedNumberOfArgs);
          if (this._directiveExpr) {
            params.push(this._directiveExpr);
          }
          return params;
        }
      };
    }
    return null;
  }

  private _buildStylingMap(valueConverter: ValueConverter): StylingInstruction|null {
    if (this._classMapInput || this._styleMapInput) {
      const stylingInput = this._classMapInput ! || this._styleMapInput !;

      // these values must be outside of the update block so that they can
      // be evaluted (the AST visit call) during creation time so that any
      // pipes can be picked up in time before the template is built
      const mapBasedClassValue =
          this._classMapInput ? this._classMapInput.value.visit(valueConverter) : null;
      const mapBasedStyleValue =
          this._styleMapInput ? this._styleMapInput.value.visit(valueConverter) : null;

      return {
        sourceSpan: stylingInput.sourceSpan,
        reference: R3.elementStylingMap,
        buildParams: (convertFn: (value: any) => o.Expression) => {
          const params: o.Expression[] = [this._elementIndexExpr];

          if (mapBasedClassValue) {
            params.push(convertFn(mapBasedClassValue));
          } else if (this._styleMapInput) {
            params.push(o.NULL_EXPR);
          }

          if (mapBasedStyleValue) {
            params.push(convertFn(mapBasedStyleValue));
          } else if (this._directiveExpr) {
            params.push(o.NULL_EXPR);
          }

          if (this._directiveExpr) {
            params.push(this._directiveExpr);
          }

          return params;
        }
      };
    }
    return null;
  }

  private _buildSingleInputs(
      reference: o.ExternalReference, inputs: BoundStylingEntry[], mapIndex: Map<string, number>,
      allowUnits: boolean, valueConverter: ValueConverter): StylingInstruction[] {
    return inputs.map(input => {
      const bindingIndex: number = mapIndex.get(input.name) !;
      const value = input.value.visit(valueConverter);
      return {
        sourceSpan: input.sourceSpan,
        reference,
        buildParams: (convertFn: (value: any) => o.Expression) => {
          const params = [this._elementIndexExpr, o.literal(bindingIndex), convertFn(value)];
          if (allowUnits) {
            if (input.unit) {
              params.push(o.literal(input.unit));
            } else if (this._directiveExpr) {
              params.push(o.NULL_EXPR);
            }
          }

          if (this._directiveExpr) {
            params.push(this._directiveExpr);
          }
          return params;
        }
      };
    });
  }

  private _buildClassInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleClassInputs) {
      return this._buildSingleInputs(
          R3.elementClassProp, this._singleClassInputs, this._classesIndex, false, valueConverter);
    }
    return [];
  }

  private _buildStyleInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleStyleInputs) {
      return this._buildSingleInputs(
          R3.elementStyleProp, this._singleStyleInputs, this._stylesIndex, true, valueConverter);
    }
    return [];
  }

  private _buildApplyFn(): StylingInstruction {
    return {
      sourceSpan: this._lastStylingInput ? this._lastStylingInput.sourceSpan : null,
      reference: R3.elementStylingApply,
      buildParams: () => {
        const params: o.Expression[] = [this._elementIndexExpr];
        if (this._directiveExpr) {
          params.push(this._directiveExpr);
        }
        return params;
      }
    };
  }

  buildUpdateLevelInstructions(valueConverter: ValueConverter) {
    const instructions: StylingInstruction[] = [];
    if (this._hasBindings) {
      const mapInstruction = this._buildStylingMap(valueConverter);
      if (mapInstruction) {
        instructions.push(mapInstruction);
      }
      instructions.push(...this._buildStyleInputs(valueConverter));
      instructions.push(...this._buildClassInputs(valueConverter));
      instructions.push(this._buildApplyFn());
    }
    return instructions;
  }
}

function isClassBinding(name: string): boolean {
  return name == 'className' || name == 'class';
}

function registerIntoMap(map: Map<string, number>, key: string) {
  if (!map.has(key)) {
    map.set(key, map.size);
  }
}

function isStyleSanitizable(prop: string): boolean {
  return prop === 'background-image' || prop === 'background' || prop === 'border-image' ||
      prop === 'filter' || prop === 'list-style' || prop === 'list-style-image';
}

function getConstantLiteralFromArray(
    constantPool: ConstantPool, values: o.Expression[]): o.Expression {
  return values.length ? constantPool.getConstLiteral(o.literalArr(values), true) : o.NULL_EXPR;
}

function addParam(
    params: o.Expression[], predicate: boolean, value: o.Expression, argNumber: number,
    totalExpectedArgs: number) {
  if (predicate) {
    params.push(value);
  } else if (argNumber < totalExpectedArgs) {
    params.push(o.NULL_EXPR);
  }
}
