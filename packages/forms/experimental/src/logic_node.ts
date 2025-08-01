/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '@angular/core';
import {AggregateProperty} from './api/property';
import {type FieldContext, type FieldPath, type LogicFn} from './api/types';
import type {FieldNode} from './field/node';
import {isArray} from './util/is_array';

/**
 * Special key which is used to represent a dynamic index in a `FieldLogicNode` path.
 */
export const DYNAMIC: unique symbol = Symbol('DYNAMIC');

/**
 * Represents a result that should be ignored because its predicate indicates it is not active.
 */
const IGNORED = Symbol('IGNORED');

export interface Predicate {
  readonly fn: LogicFn<any, boolean>;
  readonly path: FieldPath<any>;
}

/**
 * Represents a predicate that is bound to a particular depth in the field tree. This is needed for
 * recursively applied logic to ensure that the predicate is evaluated against the correct
 * application of that logic.
 *
 * Consider the following example:
 *
 * ```
 * const s = schema(p => {
 *   disabled(p.data);
 *   applyWhen(p.next, ({valueOf}) => valueOf(p.data) === 1, s);
 * });
 *
 * const f = form(signal({data: 0, next: {data: 1, next: {data: 2, next: undefined}}}), s);
 *
 * const isDisabled = f.next.next.data().disabled();
 * ```
 *
 * In order to determine `isDisabled` we need to evaluate the predicate from `applyWhen` *twice*.
 * Once to see if the schema should be applied to `f.next` and again to see if it should be applied
 * to `f.next.next`. The `depth` tells us which field we should be evaluating against each time.
 */
export interface BoundPredicate extends Predicate {
  /** The depth in the field tree at which this predicate is bound. */
  readonly depth: number;
}

export interface DataDefinition {
  readonly factory: LogicFn<unknown, unknown>;
  readonly initializer?: (value: unknown) => void;
}

export abstract class AbstractLogic<TReturn, TValue = TReturn> {
  protected readonly fns: Array<LogicFn<any, TValue | typeof IGNORED>> = [];

  constructor(private predicates: ReadonlyArray<BoundPredicate>) {}

  abstract compute(arg: FieldContext<any>): TReturn;

  abstract get defaultValue(): TReturn;

  get hasLogic(): boolean {
    return this.fns.length > 0;
  }

  push(logicFn: LogicFn<any, TValue>) {
    this.fns.push(wrapWithPredicates(this.predicates, logicFn));
  }

  mergeIn(other: AbstractLogic<TReturn, TValue>) {
    const fns = this.predicates
      ? other.fns.map((fn) => wrapWithPredicates(this.predicates, fn))
      : other.fns;
    this.fns.push(...fns);
  }
}

export class BooleanOrLogic extends AbstractLogic<boolean> {
  override get defaultValue() {
    return false;
  }

  override compute(arg: FieldContext<any>): boolean {
    return this.fns.some((f) => {
      const result = f(arg);
      return result && result !== IGNORED;
    });
  }
}

export class ArrayMergeIgnoreLogic<TElement, TIgnore = never> extends AbstractLogic<
  readonly TElement[],
  TElement | readonly (TElement | TIgnore)[] | TIgnore | undefined
> {
  static ignoreNull<TElement>(predicates: ReadonlyArray<BoundPredicate>) {
    return new ArrayMergeIgnoreLogic<TElement, null>(predicates, (e: unknown) => e === null);
  }

  constructor(
    predicates: ReadonlyArray<BoundPredicate>,
    private ignore: undefined | ((e: TElement | undefined | TIgnore) => e is TIgnore),
  ) {
    super(predicates);
  }

  override get defaultValue() {
    return [];
  }

  override compute(arg: FieldContext<any>): readonly TElement[] {
    return this.fns.reduce((prev, f) => {
      const value = f(arg);

      if (value === undefined || value === IGNORED) {
        return prev;
      } else if (isArray(value)) {
        return [...prev, ...(this.ignore ? value.filter((e) => !this.ignore!(e)) : value)];
      } else {
        if (this.ignore && this.ignore(value as TElement | TIgnore | undefined)) {
          return prev;
        }
        return [...prev, value];
      }
    }, [] as TElement[]);
  }
}

export class ArrayMergeLogic<TElement> extends ArrayMergeIgnoreLogic<TElement, never> {
  constructor(predicates: ReadonlyArray<BoundPredicate>) {
    super(predicates, undefined);
  }
}

export class AggregatePropertyMergeLogic<TAcc, TItem> extends AbstractLogic<TAcc, TItem> {
  override get defaultValue() {
    return this.key.getInitial();
  }

  constructor(
    predicates: ReadonlyArray<BoundPredicate>,
    private key: AggregateProperty<TAcc, TItem>,
  ) {
    super(predicates);
  }

  override compute(ctx: FieldContext<any>): TAcc {
    if (this.fns.length === 0) {
      return this.key.getInitial();
    }
    let acc: TAcc = this.key.getInitial();
    for (let i = 0; i < this.fns.length; i++) {
      const item = this.fns[i](ctx);
      if (item !== IGNORED) {
        acc = this.key.reduce(acc, item);
      }
    }
    return acc;
  }
}

function wrapWithPredicates<TValue, TReturn>(
  predicates: ReadonlyArray<BoundPredicate>,
  logicFn: LogicFn<TValue, TReturn>,
): LogicFn<TValue, TReturn | typeof IGNORED> {
  if (predicates.length === 0) {
    return logicFn;
  }
  return (arg: FieldContext<any>): TReturn | typeof IGNORED => {
    for (const predicate of predicates) {
      let predicateField = arg.stateOf(predicate.path) as FieldNode;
      // Check the depth of the current field vs the depth this predicate is supposed to be
      // evaluated at. If necessary, walk up the field tree to grab the correct context field.
      // We can check the pathKeys as an untracked read since we know the structure of our fields
      // doesn't change.
      const depthDiff = untracked(predicateField.structure.pathKeys).length - predicate.depth;
      for (let i = 0; i < depthDiff; i++) {
        predicateField = predicateField.structure.parent!;
      }
      // If any of the predicates don't match, don't actually run the logic function, just return
      // the default value.
      if (!predicate.fn(predicateField.context)) {
        return IGNORED;
      }
    }
    return logicFn(arg);
  };
}
