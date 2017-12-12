/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AnimationMetadata, AnimationMetadataType, AnimationOptions} from '@angular/animations';

import {AnimationDriver} from '../render/animation_driver';
import {copyObj} from '../util';

import {Ast as AnimationAst, SequenceAst} from './animation_ast';
import {buildAnimationAst} from './animation_ast_builder';

export class TransitionState {
  private _rawValue: any;
  private _strValue: string;
  private _options: AnimationOptions;

  getParams() { return this._options.params !; }

  /* @internal */
  protected _getRawValue(): any { return this._rawValue; }

  constructor(input: any, public namespaceId: string = '') {
    const isObj = input && input.hasOwnProperty('value');
    let value: any = isObj ? input['value'] : input;

    if (isObj) {
      const options = copyObj(input as any);
      delete options['value'];
      this._options = options as AnimationOptions;
    } else {
      this._options = {};
    }

    if (!this._options.params) {
      this._options.params = {};
    }

    this._rawValue = value;
  }

  getValue(): string {
    if (!this._strValue) {
      this._strValue = normalizeTriggerValue(this._getRawValue());
    }
    return this._strValue;
  }

  equals(state: TransitionState) { return this.getValue() === state.getValue(); }

  absorbState(state: TransitionState) {
    const newParams = state.getParams();
    if (newParams) {
      const oldParams = this.getParams();
      Object.keys(newParams).forEach(prop => {
        if (oldParams[prop] == null) {
          oldParams[prop] = newParams[prop];
        }
      });
    }
  }
}

export class AstBasedTransitionState extends TransitionState {
  private _ast: SequenceAst;

  constructor(private _driver: AnimationDriver, input: any, namespaceId: string) {
    super(input, namespaceId);
  }

  getValue(): any { return this._getRawValue(); }

  getAst(): SequenceAst {
    if (!this._ast) {
      const value = this._getRawValue();
      if (value && isMetadataNode(value)) {
        const errors: any[] = [];
        const ast =
            buildAnimationAst(this._driver, value, errors) as AnimationAst<AnimationMetadataType>;
        if (errors.length) {
          throw new Error(
              `The dynamic animation trigger @"${name}" has failed to build due to the following errors:\n - ${errors.join("\n - ")}`);
        }
        this._ast = ast.type == AnimationMetadataType.Sequence ? (ast as SequenceAst) :
                                                                 this._makeSequenceAst([ast]);
      } else {
        this._ast = this._makeSequenceAst([]);
      }
    }
    return this._ast;
  }

  private _makeSequenceAst(steps: AnimationAst<AnimationMetadataType>[]): SequenceAst {
    return {steps, type: AnimationMetadataType.Sequence, options: {}};
  }

  equals(state: AstBasedTransitionState) { return this.getAst() === state.getAst(); }
}

function normalizeTriggerValue(value: any): any {
  // we use `!= null` here because it's the most simple
  // way to test against a "falsy" value without mixing
  // in empty strings or a zero value. DO NOT OPTIMIZE.
  if (isMetadataNode(value)) {
    return `_custom_${Date.now()}`;
  }
  return value != null ? value : null;
}

export function isMetadataNode(node: any) {
  if (Array.isArray(node)) {
    node = node[0];
  }
  return node && (node as AnimationMetadata).type > 0;
}
