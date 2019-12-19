/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '../../constant_pool';
import {AST, ASTWithSource, BindingPipe, BindingType, Interpolation} from '../../expression_parser/ast';
import * as o from '../../output/output_ast';
import {ParseSourceSpan} from '../../parse_util';
import {isEmptyExpression} from '../../template_parser/template_parser';
import * as t from '../r3_ast';
import {Identifiers as R3} from '../r3_identifiers';

import {hyphenate} from './style_parser';
import {ValueConverter} from './template';
import {getInterpolationArgsLength} from './util';

/**
 * A styling expression summary that is to be processed by the compiler
 */
export interface StylingInstruction {
  reference: o.ExternalReference;
  /** Calls to individual styling instructions. Used when chaining calls to the same instruction. */
  calls: StylingInstructionCall[];
}

/**
 * A styling expression summary entry that the compiler uses when assembling styling instructions
 */
export interface StylingInstructionCall {
  sourceSpan: ParseSourceSpan|null;
  supportsInterpolation: boolean;
  allocateBindingSlots: number;
  params: ((convertFn: (value: any) => o.Expression | o.Expression[]) => o.Expression[]);
}

/**
 * an internal record of the input data for a styling binding
 */
interface BoundStylingEntry {
  name: string|null;
  unit: string|null;
  sourceSpan: ParseSourceSpan;
  value: AST;
}

/**
 * Produces creation/update instructions for all styling bindings (class and style)
 *
 * The builder class below handles producing instructions for the following cases:
 *
 * - Dynamic style/class map bindings ([style]="map" and [class]="map|string")
 * - Dynamic style/class property bindings ([style.prop]="exp" and [class.name]="exp")
 *
 * Due to the complex relationship of all of these cases, the instructions generated
 * for these attributes/properties/bindings must be done so in the correct order. The
 * order which these must be generated is as follows:
 *
 * if (updateMode) {
 *   styleMap(...)
 *   classMap(...)
 *   styleProp(...)
 *   classProp(...)
 * }
 *
 * The creation/update methods within the builder class produce these instructions.
 */
export class StylingBuilder {
  /**
   *  Whether or not there are any styling bindings present
   *  (i.e. `[style]`, `[class]`, `[style.prop]` or `[class.name]`)
   */
  public hasBindings = false;
  public hasBindingsWithPipes = false;

  /** the input for [class] (if it exists) */
  private _classMapInput: BoundStylingEntry|null = null;

  /** the input for [style] (if it exists) */
  private _styleMapInput: BoundStylingEntry|null = null;

  /** an array of each [style.prop] input */
  private _singleStyleInputs: BoundStylingEntry[]|null = null;

  /** an array of each [class.name] input */
  private _singleClassInputs: BoundStylingEntry[]|null = null;

  /** a reference to the very first input (used to attach the source span to the sanitizer) */
  private _firstStylingInput: BoundStylingEntry|null = null;

  // certain style properties ALWAYS need sanitization
  // this is checked each time new styles are encountered
  private _useDefaultSanitizer = false;

  /**
   * Registers a given input to the styling builder to be later used when producing AOT code.
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
        binding = this._registerSingleInput(name, input.value, input.sourceSpan, input.unit, false);
        break;
      case BindingType.Class:
        binding = this._registerSingleInput(name, input.value, input.sourceSpan, null, true);
        break;
    }
    return binding ? true : false;
  }

  /**
   * Registers the provided binding name and expression into the styling builder.
   *
   * A binding can only be successfully registered if it matches the following style/class
   * binding patterns:
   *
   * - [style]
   * - [style.prop]
   * - [class]
   * - [class.prop]
   * - [className]
   *
   * @param name the binding name (e.g. "style", "style.width", "class", "class.foo" or "className")
   * @param expression the binding expression
   * @param sourceSpan the source span information attached to the binding
   *
   * @returns the style/class binding entry that is used within the builder (if the binding matches
   *          of the binding patterns mentioned above). Otheriwse `null`.
   */
  registerInputBasedOnName(name: string, expression: AST, sourceSpan: ParseSourceSpan):
      BoundStylingEntry|null {
    let binding: BoundStylingEntry|null = null;

    const isPropBased = isPropBasedBinding(name);
    const propToMatch = isPropBased ? name.substring(0, 5) : name;
    const isClassBased = propToMatch === 'class' || propToMatch === 'className';
    const isStyleBased = !isClassBased && propToMatch === 'style';

    if (isClassBased || isStyleBased) {
      binding = isPropBased ?
          this._registerSingleInput(
              getSingleBindingPropName(name), expression, sourceSpan, null, isClassBased) :
          this._registerMapInput(expression, sourceSpan, isClassBased);
    }

    return binding;
  }

  /**
   * Registers a map-based binding (e.g. [style] or [class/className]) into the builder
   */
  private _registerMapInput(value: AST, sourceSpan: ParseSourceSpan, isClassBased: boolean) {
    if (isClassBased && this._classMapInput) {
      throw new Error(
          '[class] and [className] bindings cannot be used on the same element simultaneously');
    }

    if (isEmptyExpression(value)) {
      return null;
    }

    const entry = createStylingEntry(null, null, value, sourceSpan);
    if (isClassBased) {
      this._classMapInput = entry;
    } else {
      this._useDefaultSanitizer = true;
      this._styleMapInput = entry;
    }

    this._firstStylingInput = this._firstStylingInput || entry;
    this._checkForPipes(value);
    this.hasBindings = true;
    return entry;
  }

  /**
   * Registers a prop-based binding (e.g. [style.prop] or [class.name]) into the builder
   */
  private _registerSingleInput(
      name: string, value: AST, sourceSpan: ParseSourceSpan, unit: string|null,
      isClassBased: boolean) {
    if (isEmptyExpression(value)) {
      return null;
    }

    name = isClassBased ? name : hyphenate(name);
    const {property, unit: bindingUnit} = parseProperty(name);
    const entry = createStylingEntry(property, unit || bindingUnit, value, sourceSpan);

    let arr: BoundStylingEntry[];
    if (isClassBased) {
      arr = this._singleClassInputs || (this._singleClassInputs = []);
    } else {
      this._useDefaultSanitizer = this._useDefaultSanitizer || isStyleSanitizable(name);
      arr = this._singleStyleInputs || (this._singleStyleInputs = []);
    }
    arr.push(entry);

    this._firstStylingInput = this._firstStylingInput || entry;
    this._checkForPipes(value);
    this.hasBindings = true;
    return entry;
  }

  /**
   * Checks whether or not the provided expression contains pipes and, if so, flags the builder
   */
  private _checkForPipes(expression: AST) {
    if ((expression instanceof ASTWithSource) && (expression.ast instanceof BindingPipe)) {
      this.hasBindingsWithPipes = true;
    }
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
    // map-based bindings allocate two slots: one for the
    // previous binding value and another for the previous
    // className or style attribute value.
    let totalBindingSlotsRequired = 2;

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
      reference,
      calls: [{
        supportsInterpolation: isClassBased,
        sourceSpan: stylingInput.sourceSpan,
        allocateBindingSlots: totalBindingSlotsRequired,
        params: (convertFn: (value: any) => o.Expression | o.Expression[]) => {
          const convertResult = convertFn(mapValue);
          return Array.isArray(convertResult) ? convertResult : [convertResult];
        }
      }]
    };
  }

  private _buildSingleInputs(
      reference: o.ExternalReference, inputs: BoundStylingEntry[], allowUnits: boolean,
      valueConverter: ValueConverter,
      getInterpolationExpressionFn?: (value: Interpolation) => o.ExternalReference):
      StylingInstruction[] {
    const instructions: StylingInstruction[] = [];

    inputs.forEach(input => {
      const previousInstruction: StylingInstruction|undefined =
          instructions[instructions.length - 1];
      const value = input.value.visit(valueConverter);
      let referenceForCall = reference;
      let totalBindingSlotsRequired = 1;  // each styling binding value is stored in the LView

      if (value instanceof Interpolation) {
        totalBindingSlotsRequired += value.expressions.length;

        if (getInterpolationExpressionFn) {
          referenceForCall = getInterpolationExpressionFn(value);
        }
      }

      const call = {
        sourceSpan: input.sourceSpan,
        allocateBindingSlots: totalBindingSlotsRequired,
        supportsInterpolation: !!getInterpolationExpressionFn,
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

      // If we ended up generating a call to the same instruction as the previous styling property
      // we can chain the calls together safely to save some bytes, otherwise we have to generate
      // a separate instruction call. This is primarily a concern with interpolation instructions
      // where we may start off with one `reference`, but end up using another based on the
      // number of interpolations.
      if (previousInstruction && previousInstruction.reference === referenceForCall) {
        previousInstruction.calls.push(call);
      } else {
        instructions.push({reference: referenceForCall, calls: [call]});
      }
    });

    return instructions;
  }

  private _buildClassInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleClassInputs) {
      return this._buildSingleInputs(R3.classProp, this._singleClassInputs, false, valueConverter);
    }
    return [];
  }

  private _buildStyleInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleStyleInputs) {
      return this._buildSingleInputs(
          R3.styleProp, this._singleStyleInputs, true, valueConverter,
          getStylePropInterpolationExpression);
    }
    return [];
  }

  private _buildSanitizerFn(): StylingInstruction {
    return {
      reference: R3.styleSanitizer,
      calls: [{
        sourceSpan: this._firstStylingInput ? this._firstStylingInput.sourceSpan : null,
        supportsInterpolation: false,
        allocateBindingSlots: 0,
        params: () => [o.importExpr(R3.defaultStyleSanitizer)]
      }]
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

export function parseProperty(name: string): {property: string, unit: string} {
  let unit = '';
  let property = name;
  const unitIndex = name.lastIndexOf('.');
  if (unitIndex > 0) {
    unit = name.substr(unitIndex + 1);
    property = name.substring(0, unitIndex);
  }

  return {property, unit};
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

function createStylingEntry(
    name: string | null, unit: string | null, value: AST,
    sourceSpan: ParseSourceSpan): BoundStylingEntry {
  return {
      name, unit, value, sourceSpan,
  };
}

/**
 * Whether or not a binding is prop based (e.g. `[style.width]` or `[class.foo]`)
 */
function isPropBasedBinding(name: string) {
  // both the name in [style.prop] and [class.prop]
  // begin at index 6
  return name[5] === '.' && name.length > 6;
}

/**
 * Returns the `prop` value in a [style.prop] or [class.prop] binding
 */
function getSingleBindingPropName(name: string) {
  // both the name in [style.prop] and [class.prop]
  // begin at index 6
  return name.substring(6);
}
