/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Injector, signal, type Signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {disabled, validate} from '../../src/api/logic';
import {applyEach, applyWhen, applyWhenValue, form, schema} from '../../src/api/structure';
import type {Field, Schema} from '../../src/api/types';
import {ValidationError} from '../../src/api/validation_errors';

interface TreeData {
  level: number;
  next: TreeData | null;
}

function narrowed<TValue, TNarrowed extends TValue>(
  field: Field<TValue> | undefined,
  guard: (value: TValue) => value is TNarrowed,
): Signal<Field<TNarrowed> | undefined> {
  return computed(
    () => field && (guard(field().value()) ? (field as Field<TNarrowed>) : undefined),
  );
}

function isNonNull<T>(t: T): t is NonNullable<T> {
  return t !== null;
}

describe('recursive schema logic', () => {
  it('should support recursive logic', () => {
    const s = schema<TreeData>((p) => {
      disabled(p.level, ({valueOf}) => {
        return valueOf(p.level) % 2 === 0;
      });
      applyWhenValue(p.next, isNonNull, s);
    });
    const f = form<TreeData>(
      signal({level: 0, next: {level: 1, next: {level: 2, next: {level: 3, next: null!}}}}),
      s,
      {injector: TestBed.inject(Injector)},
    );
    expect(f.level().disabled()).toBe(true);
    expect(narrowed(f.next, isNonNull)()?.level().disabled()).toBe(false);
    expect(narrowed(narrowed(f.next, isNonNull)()?.next, isNonNull)()?.level().disabled()).toBe(
      true,
    );
    expect(
      narrowed(narrowed(narrowed(f.next, isNonNull)()?.next, isNonNull)()?.next, isNonNull)()
        ?.level()
        .disabled(),
    ).toBe(false);
  });

  it('should support co-recursive logic', () => {
    const s1: Schema<TreeData> = schema((p) => {
      disabled(p.level, ({valueOf}) => valueOf(p.level) % 2 === 0);
      applyWhenValue(p.next, isNonNull, s2);
    });
    const s2: Schema<TreeData> = schema((p) => {
      disabled(p.level, ({valueOf}) => valueOf(p.level) % 2 === 0);
      applyWhenValue(p.next, isNonNull, s1);
    });
    const f = form<TreeData>(
      signal({
        level: 0,
        next: {level: 1, next: {level: 2, next: {level: 3, next: null!}}},
      }),
      s1,
      {injector: TestBed.inject(Injector)},
    );
    expect(f.level().disabled()).toBe(true);
    expect(narrowed(f.next, isNonNull)()?.level().disabled()).toBe(false);
    expect(narrowed(narrowed(f.next, isNonNull)()?.next, isNonNull)()?.level().disabled()).toBe(
      true,
    );
    expect(
      narrowed(narrowed(narrowed(f.next, isNonNull)()?.next, isNonNull)()?.next, isNonNull)()
        ?.level()
        .disabled(),
    ).toBe(false);
  });

  it('should support recursive logic with arrays', () => {
    interface Dom {
      tag: string;
      children: Dom[];
    }

    const domSchema = schema<Dom>((p) => {
      applyEach(p.children, domSchema);
      applyWhen(
        p.children,
        ({valueOf}) => valueOf(p.tag) === 'table',
        (children) => {
          applyEach(children, (c) => {
            validate(c.tag, ({value}) =>
              value() !== 'tr' ? ValidationError.custom({kind: 'invalid-child'}) : undefined,
            );
          });
        },
      );
      applyWhen(
        p.children,
        ({valueOf}) => valueOf(p.tag) === 'tr',
        (children) => {
          applyEach(children, (c) => {
            validate(c.tag, ({value}) =>
              value() !== 'td' ? ValidationError.custom({kind: 'invalid-child'}) : undefined,
            );
          });
        },
      );
    });

    const data = signal<Dom>({tag: 'div', children: [{tag: 'span', children: []}]});
    const f = form(data, domSchema, {injector: TestBed.inject(Injector)});
    expect(f().valid()).toBe(true);

    data.set({tag: 'table', children: [{tag: 'span', children: []}]});
    expect(f().valid()).toBe(false);

    data.set({tag: 'table', children: [{tag: 'tr', children: [{tag: 'span', children: []}]}]});
    expect(f().valid()).toBe(false);

    data.set({tag: 'table', children: [{tag: 'tr', children: [{tag: 'td', children: []}]}]});
    expect(f().valid()).toBe(true);
  });
});
