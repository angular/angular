/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ConstantPool} from '../../constant_pool';
import {InitialStylingFlags} from '../../core';
import {BindingType} from '../../expression_parser/ast';
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
  public readonly hasBindingsOrInitialValues = false;

  private _indexLiteral: o.LiteralExpr;
  private _classMapInput: t.BoundAttribute|null = null;
  private _styleMapInput: t.BoundAttribute|null = null;
  private _singleStyleInputs: t.BoundAttribute[]|null = null;
  private _singleClassInputs: t.BoundAttribute[]|null = null;
  private _lastStylingInput: t.BoundAttribute|null = null;

  // maps are used instead of hash maps because a Map will
  // retain the ordering of the keys
  private _stylesIndex = new Map<string, number>();
  private _classesIndex = new Map<string, number>();
  private _initialStyleValues: {[propName: string]: string} = {};
  private _initialClassValues: {[className: string]: boolean} = {};
  private _useDefaultSanitizer = false;
  private _applyFnRequired = false;

  constructor(elementIndex: number) { this._indexLiteral = o.literal(elementIndex); }

  registerInput(input: t.BoundAttribute): boolean {
    // [attr.style] or [attr.class] are skipped in the code below,
    // they should not be treated as styling-based bindings since
    // they are intended to be written directly to the attr and
    // will therefore skip all style/class resolution that is present
    // with style="", [style]="" and [style.prop]="", class="",
    // [class.prop]="". [class]="" assignments
    let registered = false;
    const name = input.name;
    switch (input.type) {
      case BindingType.Property:
        if (name == 'style') {
          this._styleMapInput = input;
          this._useDefaultSanitizer = true;
          registered = true;
        } else if (isClassBinding(input)) {
          this._classMapInput = input;
          registered = true;
        }
        break;
      case BindingType.Style:
        (this._singleStyleInputs = this._singleStyleInputs || []).push(input);
        this._useDefaultSanitizer = this._useDefaultSanitizer || isStyleSanitizable(name);
        registerIntoMap(this._stylesIndex, name);
        registered = true;
        break;
      case BindingType.Class:
        (this._singleClassInputs = this._singleClassInputs || []).push(input);
        registerIntoMap(this._classesIndex, name);
        registered = true;
        break;
    }
    if (registered) {
      this._lastStylingInput = input;
      (this as any).hasBindingsOrInitialValues = true;
      this._applyFnRequired = true;
    }
    return registered;
  }

  registerStyleAttr(value: string) {
    this._initialStyleValues = parseStyle(value);
    Object.keys(this._initialStyleValues).forEach(prop => {
      registerIntoMap(this._stylesIndex, prop);
      (this as any).hasBindingsOrInitialValues = true;
    });
  }

  registerClassAttr(value: string) {
    this._initialClassValues = {};
    value.split(/\s+/g).forEach(className => {
      this._initialClassValues[className] = true;
      registerIntoMap(this._classesIndex, className);
      (this as any).hasBindingsOrInitialValues = true;
    });
  }

  private _buildInitExpr(registry: Map<string, number>, initialValues: {[key: string]: any}):
      o.Expression|null {
    const exprs: o.Expression[] = [];
    const nameAndValueExprs: o.Expression[] = [];

    // _c0 = [prop, prop2, prop3, ...]
    registry.forEach((value, key) => {
      const keyLiteral = o.literal(key);
      exprs.push(keyLiteral);
      const initialValue = initialValues[key];
      if (initialValue) {
        nameAndValueExprs.push(keyLiteral, o.literal(initialValue));
      }
    });

    if (nameAndValueExprs.length) {
      // _c0 = [... MARKER ...]
      exprs.push(o.literal(InitialStylingFlags.VALUES_MODE));
      // _c0 = [prop, VALUE, prop2, VALUE2, ...]
      exprs.push(...nameAndValueExprs);
    }

    return exprs.length ? o.literalArr(exprs) : null;
  }

  buildCreateLevelInstruction(sourceSpan: ParseSourceSpan, constantPool: ConstantPool):
      StylingInstruction|null {
    if (this.hasBindingsOrInitialValues) {
      const initialClasses = this._buildInitExpr(this._classesIndex, this._initialClassValues);
      const initialStyles = this._buildInitExpr(this._stylesIndex, this._initialStyleValues);

      // in the event that a [style] binding is used then sanitization will
      // always be imported because it is not possible to know ahead of time
      // whether style bindings will use or not use any sanitizable properties
      // that isStyleSanitizable() will detect
      const useSanitizer = this._useDefaultSanitizer;
      const params: (o.Expression)[] = [];

      if (initialClasses) {
        // the template compiler handles initial class styling (e.g. class="foo") values
        // in a special command called `elementClass` so that the initial class
        // can be processed during runtime. These initial class values are bound to
        // a constant because the inital class values do not change (since they're static).
        params.push(constantPool.getConstLiteral(initialClasses, true));
      } else if (initialStyles || useSanitizer) {
        // no point in having an extra `null` value unless there are follow-up params
        params.push(o.NULL_EXPR);
      }

      if (initialStyles) {
        // the template compiler handles initial style (e.g. style="foo") values
        // in a special command called `elementStyle` so that the initial styles
        // can be processed during runtime. These initial styles values are bound to
        // a constant because the inital style values do not change (since they're static).
        params.push(constantPool.getConstLiteral(initialStyles, true));
      } else if (useSanitizer) {
        // no point in having an extra `null` value unless there are follow-up params
        params.push(o.NULL_EXPR);
      }

      if (useSanitizer) {
        params.push(o.importExpr(R3.defaultStyleSanitizer));
      }

      return {sourceSpan, reference: R3.elementStyling, buildParams: () => params};
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
          const params: o.Expression[] = [this._indexLiteral];

          if (mapBasedClassValue) {
            params.push(convertFn(mapBasedClassValue));
          } else if (this._styleMapInput) {
            params.push(o.NULL_EXPR);
          }

          if (mapBasedStyleValue) {
            params.push(convertFn(mapBasedStyleValue));
          }

          return params;
        }
      };
    }
    return null;
  }

  private _buildSingleInputs(
      reference: o.ExternalReference, inputs: t.BoundAttribute[], mapIndex: Map<string, number>,
      valueConverter: ValueConverter): StylingInstruction[] {
    return inputs.map(input => {
      const bindingIndex: number = mapIndex.get(input.name) !;
      const value = input.value.visit(valueConverter);
      return {
        sourceSpan: input.sourceSpan,
        reference,
        buildParams: (convertFn: (value: any) => o.Expression) => {
          const params = [this._indexLiteral, o.literal(bindingIndex), convertFn(value)];
          if (input.unit != null) {
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
          R3.elementClassProp, this._singleClassInputs, this._classesIndex, valueConverter);
    }
    return [];
  }

  private _buildStyleInputs(valueConverter: ValueConverter): StylingInstruction[] {
    if (this._singleStyleInputs) {
      return this._buildSingleInputs(
          R3.elementStyleProp, this._singleStyleInputs, this._stylesIndex, valueConverter);
    }
    return [];
  }

  private _buildApplyFn(): StylingInstruction {
    return {
      sourceSpan: this._lastStylingInput ? this._lastStylingInput.sourceSpan : null,
      reference: R3.elementStylingApply,
      buildParams: () => [this._indexLiteral]
    };
  }

  buildUpdateLevelInstructions(valueConverter: ValueConverter) {
    const instructions: StylingInstruction[] = [];
    if (this.hasBindingsOrInitialValues) {
      const mapInstruction = this._buildStylingMap(valueConverter);
      if (mapInstruction) {
        instructions.push(mapInstruction);
      }
      instructions.push(...this._buildStyleInputs(valueConverter));
      instructions.push(...this._buildClassInputs(valueConverter));
      if (this._applyFnRequired) {
        instructions.push(this._buildApplyFn());
      }
    }
    return instructions;
  }
}

function isClassBinding(input: t.BoundAttribute): boolean {
  return input.name == 'className' || input.name == 'class';
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
