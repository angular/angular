/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '../../constant_pool';
import {AttributeMarker} from '../../core';
import {AST, BindingType, Interpolation} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import {isEmptyExpression} from '../../template_parser/template_parser';
import {error} from '../../util';
import * as t from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';

import {hyphenate, parse as parseStyle} from './style_parser';
import {ValueConverter} from './template';
import {getInterpolationArgsLength} from './util';

const IMPORTANT_FLAG = '!important';

/**
 * A styling expression summary that is to be processed by the compiler
 */
export interface StylingInstruction {
  sourceSpan: ParseSourceSpan|null;
  reference: o.ExternalReference;
  allocateBindingSlots: number;
  supportsInterpolation?: boolean;
  params: ((convertFn: (value: any) => o.Expression | o.Expression[]) => o.Expression[]);
}

/**
 * An internal record of the input data for a styling binding
 */
interface BoundStylingEntry {
  hasOverrideFlag: boolean;
  name: string|null;
  unit: string|null;
  sourceSpan: ParseSourceSpan;
  value: AST;
}

/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * It also produces the creation instruction to register all initial styling values
 * (which are all the static class="..." and style="..." attribute values that exist
 * on an element within a template).
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
 *   styling(...)
 * }
 * if (updateMode) {
 *   styleMap(...)
 *   classMap(...)
 *   styleProp(...)
 *   classProp(...)
 *   stylingApply(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export class StylingBuilder {
  /** Whether or not there are any static styling values present */
  private _hasInitialValues = false;
  /**
   *  Whether or not there are any styling bindings present
   *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
   */
  public hasBindings = false;

  /** the input for [class] (if it exists) */
  private _classMapInput: BoundStylingEntry|null = null;
  /** the input for [style] (if it exists) */
  private _styleMapInput: BoundStylingEntry|null = null;
  /** an array of each [style.prop] input */
  private _singleStyleInputs: BoundStylingEntry[]|null = null;
  /** an array of each [class.name] input */
  private _singleClassInputs: BoundStylingEntry[]|null = null;
  private _lastStylingInput: BoundStylingEntry|null = null;
  private _firstStylingInput: BoundStylingEntry|null = null;

  // maps are used instead of hash maps because a Map will
  // retain the ordering of the keys

  /**
   * Represents the location of each style binding in the template
   * (e.g. `<div [style.width]="w" [style.height]="h">` implies
   * that `width=0` and `height=1`)
   */
  private _stylesIndex = new Map<string, number>();

  /**
   * Represents the location of each class binding in the template
   * (e.g. `<div [class.big]="b" [class.hidden]="h">` implies
   * that `big=0` and `hidden=1`)
   */
  private _classesIndex = new Map<string, number>();
  private _initialStyleValues: string[] = [];
  private _initialClassValues: string[] = [];

  // certain style properties ALWAYS need sanitization
  // this is checked each time new styles are encountered
  private _useDefaultSanitizer = false;

  constructor(private _elementIndexExpr: o.Expression, private _directiveExpr: o.Expression|null) {}

  /**
   * Registers a given input to the styling builder to be later used when producing AOT code.
   *
   * The code below will only accept the input if it is somehow tied to styling (whether it be
   * style/class bindings or static style/class attributes).
   */
  registerBoundInput(input: t.BoundAttribute): boolean {
    // [attr.style] or [attr.class] are skipped in the code below,
    // they should not be treated as styling-based bindings since
    // they are intended to be written directly to the attr and
    // will therefore skip all style/class resolution that is present
    // with style="", [style]="" and [style.prop]="", class="",
    // [class.prop]="". [class]="" assignments
    let binding: BoundStylingEntry|null = null;
    let name = input.name;
    switch (input.type) {
      case BindingType.Property:
        binding = this.registerInputBasedOnName(name, input.value, input.sourceSpan);
        break;
      case BindingType.Style:
        binding = this.registerStyleInput(name, false, input.value, input.sourceSpan, input.unit);
        break;
      case BindingType.Class:
        binding = this.registerClassInput(name, false, input.value, input.sourceSpan);
        break;
    }
    return binding ? true : false;
  }

  registerInputBasedOnName(name: string, expression: AST, sourceSpan: ParseSourceSpan) {
    let binding: BoundStylingEntry|null = null;
    const nameToMatch = name.substring(0, 5);  // class | style
    const isStyle = nameToMatch === 'style';
    const isClass = isStyle ? false : (nameToMatch === 'class');
    if (isStyle || isClass) {
      const isMapBased = name.charAt(5) !== '.';         // style.prop or class.prop makes this a no
      const property = name.substr(isMapBased ? 5 : 6);  // the dot explains why there's a +1
      if (isStyle) {
        binding = this.registerStyleInput(property, isMapBased, expression, sourceSpan);
      } else {
        binding = this.registerClassInput(property, isMapBased, expression, sourceSpan);
      }
    }
    return binding;
  }

  registerStyleInput(
      name: string, isMapBased: boolean, value: AST, sourceSpan: ParseSourceSpan,
      unit?: string|null): BoundStylingEntry|null {
    if (isEmptyExpression(value)) {
      return null;
    }
    name = normalizePropName(name);
    const {property, hasOverrideFlag, unit: bindingUnit} = parseProperty(name);
    const entry: BoundStylingEntry = {
      name: property,
      unit: unit || bindingUnit, value, sourceSpan, hasOverrideFlag
    };
    if (isMapBased) {
      this._useDefaultSanitizer = true;
      this._styleMapInput = entry;
    } else {
      (this._singleStyleInputs = this._singleStyleInputs || []).push(entry);
      this._useDefaultSanitizer = this._useDefaultSanitizer || isStyleSanitizable(name);
      registerIntoMap(this._stylesIndex, property);
    }
    this._lastStylingInput = entry;
    this._firstStylingInput = this._firstStylingInput || entry;
    this.hasBindings = true;
    return entry;
  }

  registerClassInput(name: string, isMapBased: boolean, value: AST, sourceSpan: ParseSourceSpan):
      BoundStylingEntry|null {
    if (isEmptyExpression(value)) {
      return null;
    }
    const {property, hasOverrideFlag} = parseProperty(name);
    const entry:
        BoundStylingEntry = {name: property, value, sourceSpan, hasOverrideFlag, unit: null};
    if (isMapBased) {
      this._classMapInput = entry;
    } else {
      (this._singleClassInputs = this._singleClassInputs || []).push(entry);
      registerIntoMap(this._classesIndex, property);
    }
    this._lastStylingInput = entry;
    this._firstStylingInput = this._firstStylingInput || entry;
    this.hasBindings = true;
    return entry;
  }

  /**
   * Registers the element's static style string value to the builder.
   *
   * @param value the style string (e.g. `width:100px; height:200px;`)
   */
  registerStyleAttr(value: string) {
    this._initialStyleValues = parseStyle(value);
    this._hasInitialValues = true;
  }

  /**
   * Registers the element's static class string value to the builder.
   *
   * @param value the className string (e.g. `disabled gold zoom`)
   */
  registerClassAttr(value: string) {
    this._initialClassValues = value.trim().split(/\s+/g);
    this._hasInitialValues = true;
  }

  /**
   * Appends all styling-related expressions to the provided attrs array.
   *
   * @param attrs an existing array where each of the styling expressions
   * will be inserted into.
   */
  populateInitialStylingAttrs(attrs: o.Expression[]): void {
    // [CLASS_MARKER, 'foo', 'bar', 'baz' ...]
    if (this._initialClassValues.length) {
      attrs.push(o.literal(AttributeMarker.Classes));
      for (let i = 0; i < this._initialClassValues.length; i++) {
        attrs.push(o.literal(this._initialClassValues[i]));
      }
    }

    // [STYLE_MARKER, 'width', '200px', 'height', '100px', ...]
    if (this._initialStyleValues.length) {
      attrs.push(o.literal(AttributeMarker.Styles));
      for (let i = 0; i < this._initialStyleValues.length; i += 2) {
        attrs.push(
            o.literal(this._initialStyleValues[i]), o.literal(this._initialStyleValues[i + 1]));
      }
    }
  }

  /**
   * Builds an instruction with all the expressions and parameters for `elementHostAttrs`.
   *
   * The instruction generation code below is used for producing the AOT statement code which is
   * responsible for registering initial styles (within a directive hostBindings' creation block),
   * as well as any of the provided attribute values, to the directive host element.
   */
  buildHostAttrsInstruction(
      sourceSpan: ParseSourceSpan|null, attrs: o.Expression[],
      constantPool: ConstantPool): StylingInstruction|null {
    if (this._directiveExpr && (attrs.length || this._hasInitialValues)) {
      return {
        sourceSpan,
        reference: R3.elementHostAttrs,
        allocateBindingSlots: 0,
        params: () => {
          // params => elementHostAttrs(attrs)
          this.populateInitialStylingAttrs(attrs);
          const attrArray = !attrs.some(attr => attr instanceof o.WrappedNodeExpr) ?
              getConstantLiteralFromArray(constantPool, attrs) :
              o.literalArr(attrs);
          return [attrArray];
        }
      };
    }
    return null;
  }

  /**
   * Builds an instruction with all the expressions and parameters for `styling`.
   *
   * The instruction generation code below is used for producing the AOT statement code which is
   * responsible for registering style/class bindings to an element.
   */
  buildStylingInstruction(sourceSpan: ParseSourceSpan|null, constantPool: ConstantPool):
      StylingInstruction|null {
    if (this.hasBindings) {
      return {
        sourceSpan,
        allocateBindingSlots: 0,
        reference: R3.styling,
        params: () => [],
      };
    }
    return null;
  }

  /**
   * Builds an instruction with all the expressions and parameters for `classMap`.
   *
   * The instruction data will contain all expressions for `classMap` to function
   * which includes the `[class]` expression params.
   */
  buildClassMapInstruction(valueConverter: ValueConverter): StylingInstruction|null {
    if (this._classMapInput) {
      return this._buildMapBasedInstruction(valueConverter, true, this._classMapInput);
    }
    return null;
  }

  /**
   * Builds an instruction with all the expressions and parameters for `styleMap`.
   *
   * The instruction data will contain all expressions for `styleMap` to function
   * which includes the `[style]` expression params.
   */
  buildStyleMapInstruction(valueConverter: ValueConverter): StylingInstruction|null {
    if (this._styleMapInput) {
      return this._buildMapBasedInstruction(valueConverter, false, this._styleMapInput);
    }
    return null;
  }

  private _buildMapBasedInstruction(
      valueConverter: ValueConverter, isClassBased: boolean,
      stylingInput: BoundStylingEntry): StylingInstruction {
    // each styling binding value is stored in the LView
    let totalBindingSlotsRequired = 1;

    // these values must be outside of the update block so that they can
    // be evaluated (the AST visit call) during creation time so that any
    // pipes can be picked up in time before the template is built
    const mapValue = stylingInput.value.visit(valueConverter);
    let reference: o.ExternalReference;
    if (mapValue instanceof Interpolation && isClassBased) {
      totalBindingSlotsRequired += mapValue.expressions.length;
      reference = getClassMapInterpolationExpression(mapValue);
    } else {
      reference = isClassBased ? R3.classMap : R3.styleMap;
    }

    return {
      sourceSpan: stylingInput.sourceSpan,
      reference,
      allocateBindingSlots: totalBindingSlotsRequired,
      supportsInterpolation: isClassBased,
      params: (convertFn: (value: any) => o.Expression | o.Expression[]) => {
        const convertResult = convertFn(mapValue);
        return Array.isArray(convertResult) ? convertResult : [convertResult];
      }
    };
  }

  private _buildSingleInputs(
      reference: o.ExternalReference, inputs: BoundStylingEntry[], mapIndex: Map<string, number>,
      allowUnits: boolean, valueConverter: ValueConverter,
      getInterpolationExpressionFn?: (value: Interpolation) => o.ExternalReference):
      StylingInstruction[] {
    let totalBindingSlotsRequired = 0;
    return inputs.map(input => {
      const value = input.value.visit(valueConverter);

      // each styling binding value is stored in the LView
      let totalBindingSlotsRequired = 1;

      if (value instanceof Interpolation) {
        totalBindingSlotsRequired += value.expressions.length;

        if (getInterpolationExpressionFn) {
          reference = getInterpolationExpressionFn(value);
        }
      }

      return {
        sourceSpan: input.sourceSpan,
        supportsInterpolation: !!getInterpolationExpressionFn,
        allocateBindingSlots: totalBindingSlotsRequired, reference,
        params: (convertFn: (value: any) => o.Expression | o.Expression[]) => {
          // params => stylingProp(propName, value)
          const params: o.Expression[] = [];
          params.push(o.literal(input.name));

          const convertResult = convertFn(value);
          if (Array.isArray(convertResult)) {
            params.push(...convertResult);
          } else {
            params.push(convertResult);
          }

          if (allowUnits && input.unit) {
            params.push(o.literal(input.unit));
          }

          return params;
        }
      };
    });
  }

  private _buildClassInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleClassInputs) {
      return this._buildSingleInputs(
          R3.classProp, this._singleClassInputs, this._classesIndex, false, valueConverter);
    }
    return [];
  }

  private _buildStyleInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleStyleInputs) {
      return this._buildSingleInputs(
          R3.styleProp, this._singleStyleInputs, this._stylesIndex, true, valueConverter,
          getStylePropInterpolationExpression);
    }
    return [];
  }

  private _buildApplyFn(): StylingInstruction {
    return {
      sourceSpan: this._lastStylingInput ? this._lastStylingInput.sourceSpan : null,
      reference: R3.stylingApply,
      allocateBindingSlots: 0,
      params: () => { return []; }
    };
  }

  private _buildSanitizerFn(): StylingInstruction {
    return {
      sourceSpan: this._firstStylingInput ? this._firstStylingInput.sourceSpan : null,
      reference: R3.styleSanitizer,
      allocateBindingSlots: 0,
      params: () => [o.importExpr(R3.defaultStyleSanitizer)]
    };
  }

  /**
   * Constructs all instructions which contain the expressions that will be placed
   * into the update block of a template function or a directive hostBindings function.
   */
  buildUpdateLevelInstructions(valueConverter: ValueConverter) {
    const instructions: StylingInstruction[] = [];
    if (this.hasBindings) {
      if (this._useDefaultSanitizer) {
        instructions.push(this._buildSanitizerFn());
      }
      const styleMapInstruction = this.buildStyleMapInstruction(valueConverter);
      if (styleMapInstruction) {
        instructions.push(styleMapInstruction);
      }
      const classMapInstruction = this.buildClassMapInstruction(valueConverter);
      if (classMapInstruction) {
        instructions.push(classMapInstruction);
      }
      instructions.push(...this._buildStyleInputs(valueConverter));
      instructions.push(...this._buildClassInputs(valueConverter));
      instructions.push(this._buildApplyFn());
    }
    return instructions;
  }
}

function registerIntoMap(map: Map<string, number>, key: string) {
  if (!map.has(key)) {
    map.set(key, map.size);
  }
}

function isStyleSanitizable(prop: string): boolean {
  // Note that browsers support both the dash case and
  // camel case property names when setting through JS.
  return prop === 'background-image' || prop === 'backgroundImage' || prop === 'background' ||
      prop === 'border-image' || prop === 'borderImage' || prop === 'filter' ||
      prop === 'list-style' || prop === 'listStyle' || prop === 'list-style-image' ||
      prop === 'listStyleImage' || prop === 'clip-path' || prop === 'clipPath';
}

/**
 * Simple helper function to either provide the constant literal that will house the value
 * here or a null value if the provided values are empty.
 */
function getConstantLiteralFromArray(
    constantPool: ConstantPool, values: o.Expression[]): o.Expression {
  return values.length ? constantPool.getConstLiteral(o.literalArr(values), true) : o.NULL_EXPR;
}

/**
 * Simple helper function that adds a parameter or does nothing at all depending on the provided
 * predicate and totalExpectedArgs values
 */
function addParam(
    params: o.Expression[], predicate: any, value: o.Expression | null, argNumber: number,
    totalExpectedArgs: number) {
  if (predicate && value) {
    params.push(value);
  } else if (argNumber < totalExpectedArgs) {
    params.push(o.NULL_EXPR);
  }
}

export function parseProperty(name: string):
    {property: string, unit: string, hasOverrideFlag: boolean} {
  let hasOverrideFlag = false;
  const overrideIndex = name.indexOf(IMPORTANT_FLAG);
  if (overrideIndex !== -1) {
    name = overrideIndex > 0 ? name.substring(0, overrideIndex) : '';
    hasOverrideFlag = true;
  }

  let unit = '';
  let property = name;
  const unitIndex = name.lastIndexOf('.');
  if (unitIndex > 0) {
    unit = name.substr(unitIndex + 1);
    property = name.substring(0, unitIndex);
  }

  return {property, unit, hasOverrideFlag};
}

/**
 * Gets the instruction to generate for an interpolated class map.
 * @param interpolation An Interpolation AST
 */
function getClassMapInterpolationExpression(interpolation: Interpolation): o.ExternalReference {
  switch (getInterpolationArgsLength(interpolation)) {
    case 1:
      return R3.classMap;
    case 3:
      return R3.classMapInterpolate1;
    case 5:
      return R3.classMapInterpolate2;
    case 7:
      return R3.classMapInterpolate3;
    case 9:
      return R3.classMapInterpolate4;
    case 11:
      return R3.classMapInterpolate5;
    case 13:
      return R3.classMapInterpolate6;
    case 15:
      return R3.classMapInterpolate7;
    case 17:
      return R3.classMapInterpolate8;
    default:
      return R3.classMapInterpolateV;
  }
}

/**
 * Gets the instruction to generate for an interpolated style prop.
 * @param interpolation An Interpolation AST
 */
function getStylePropInterpolationExpression(interpolation: Interpolation) {
  switch (getInterpolationArgsLength(interpolation)) {
    case 1:
      return R3.styleProp;
    case 3:
      return R3.stylePropInterpolate1;
    case 5:
      return R3.stylePropInterpolate2;
    case 7:
      return R3.stylePropInterpolate3;
    case 9:
      return R3.stylePropInterpolate4;
    case 11:
      return R3.stylePropInterpolate5;
    case 13:
      return R3.stylePropInterpolate6;
    case 15:
      return R3.stylePropInterpolate7;
    case 17:
      return R3.stylePropInterpolate8;
    default:
      return R3.stylePropInterpolateV;
  }
}

function normalizePropName(prop: string): string {
  return hyphenate(prop);
}
