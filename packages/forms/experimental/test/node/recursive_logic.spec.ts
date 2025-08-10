/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {disabled, validate} from '../../src/api/logic';
import {MIN} from '../../src/api/property';
import {apply, applyEach, applyWhen, form, schema} from '../../src/api/structure';
import type {Field, Schema} from '../../src/api/types';
import {ValidationError} from '../../src/api/validation_errors';
import {min, required} from '../../src/api/validators';

interface TreeData {
  level: number;
  next: TreeData;
}

describe('reccursive schema logic', () => {
  it('should support recursive logic', () => {
    const s = schema<TreeData>((p) => {
      disabled(p.level, ({valueOf}) => {
        return valueOf(p.level) % 2 === 0;
      });
      apply(p.next, s);
    });
    const f = form<TreeData>(
      signal({level: 0, next: {level: 1, next: {level: 2, next: {level: 3, next: null!}}}}),
      s,
      {injector: TestBed.inject(Injector)},
    );
    expect(f.level().disabled()).toBe(true);
    expect(f.next.level().disabled()).toBe(false);
    expect(f.next.next.level().disabled()).toBe(true);
    expect(f.next.next.next.level().disabled()).toBe(false);
  });

  it('should support co-recursive logic', () => {
    const s1: Schema<TreeData> = schema((p) => {
      disabled(p.level, ({valueOf}) => valueOf(p.level) % 2 === 0);
      apply(p.next, s2);
    });
    const s2: Schema<TreeData> = schema((p) => {
      disabled(p.level, ({valueOf}) => valueOf(p.level) % 2 === 0);
      apply(p.next, s1);
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
    expect(f.next.level().disabled()).toBe(false);
    expect(f.next.next.level().disabled()).toBe(true);
    expect(f.next.next.next.level().disabled()).toBe(false);
  });

  it('should support recursive logic terminated by a when condition', () => {
    const s: Schema<TreeData> = schema((p) => {
      min(p.level, ({valueOf}) => valueOf(p.level));
      applyWhen(p.next, (ctx) => ctx.valueOf(p.level) !== 2, s);
    });
    const f = form<TreeData>(
      signal({
        level: 0,
        next: {level: 1, next: {level: 2, next: {level: 3, next: {level: 4, next: null!}}}},
      }),
      s,
      {injector: TestBed.inject(Injector)},
    );
    expect(f.level().property(MIN)()).toBe(0);
    expect(f.next.level().property(MIN)()).toBe(1);
    expect(f.next.next.level().property(MIN)()).toBe(2);
    expect(f.next.next.next.level().property(MIN)()).toBe(undefined);
    expect(f.next.next.next.next.level().property(MIN)()).toBe(undefined);
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

  // TODO: debug issue demonstrated below. Seems to be some issue with recursive logic & potentially undefined fields.
  // These two tests represent the same logic, but one has a potentially undefined field (which throws an error),
  // and the other has a potentially null field (which is fine)

  fit('should support recursive logic with applyWhen (undefined)', () => {
    interface TreeNode {
      data: string;
      child: TreeNode | undefined;
    }

    const name = signal<TreeNode>({
      data: '',
      child: {
        data: '',
        child: undefined,
      },
    });

    const s = schema<TreeNode>((p) => {
      required(p.data);
      applyWhen(p.child, ({value}) => value() !== undefined, s as Schema<TreeNode | undefined>);
    });

    const f = form(name, s, {injector: TestBed.inject(Injector)});
    expect(f.data().errors()).toEqual([ValidationError.required()]);
    expect(f.child?.data().errors()).toEqual([ValidationError.required()]);
  });

  fit('should support recursive logic with applyWhen (null)', () => {
    interface TreeNode {
      data: string;
      child: TreeNode | null;
    }

    const name = signal<TreeNode>({
      data: '',
      child: {
        data: '',
        child: null,
      },
    });

    const s = schema<TreeNode>((p) => {
      required(p.data);
      applyWhen(p.child, ({value}) => value() !== null, s as Schema<TreeNode | null>);
    });

    const f = form(name, s, {injector: TestBed.inject(Injector)});
    expect(f.data().errors()).toEqual([ValidationError.required()]);
    expect((f.child as Field<TreeNode>).data().errors()).toEqual([ValidationError.required()]);
  });
});
