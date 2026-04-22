/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, Injector, signal, WritableSignal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  applyEach,
  applyWhenValue,
  createMetadataKey,
  FieldContext,
  FieldTree,
  form,
  metadata,
  narrowFieldTree,
  PathKind,
  ReadonlyFieldTree,
  required,
  SchemaPath,
  SchemaPathTree,
  validate,
} from '../../public_api';

function testContext<T>(
  s: WritableSignal<T>,
  callback: (ctx: FieldContext<T>, p: SchemaPathTree<T>) => void,
) {
  const isCalled = jasmine.createSpy();

  TestBed.runInInjectionContext(() => {
    const f = form<T>(s, (p) => {
      validate(p as SchemaPath<T>, (ctx) => {
        callback(ctx, p);
        isCalled();
        return undefined;
      });
    });

    f().errors();
  });

  expect(isCalled).toHaveBeenCalled();
}

describe('Field Context', () => {
  it('value', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.value().name).toEqual('pirojok-the-cat');
    });
  });

  it('state', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.state.value().name).toEqual('pirojok-the-cat');
    });
  });

  it('fieldTree', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx) => {
      expect(ctx.fieldTree.name().value()).toEqual('pirojok-the-cat');
      expect(ctx.fieldTree.age().value()).toEqual(5);
    });
  });

  it('key', () => {
    const keys: string[] = [];
    const recordKey = ({key}: FieldContext<unknown, PathKind.Child>) => {
      try {
        keys.push(key());
      } catch (e) {
        keys.push((e as Error).message);
      }
      return undefined;
    };
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    const f = form(
      cat,
      (p) => {
        // @ts-expect-error
        validate(p, recordKey);
        validate(p.name, recordKey);
        validate(p.age, recordKey);
      },
      {injector: TestBed.inject(Injector)},
    );
    f().valid();
    expect(keys).toEqual([
      jasmine.stringContaining('NG01905'), // SIGNAL_FORMS_ROOT_FIELD_NO_PARENT
      'name',
      'age',
    ]);
  });

  it('index', () => {
    const indices: (string | number)[] = [];
    const recordIndex = ({index}: FieldContext<unknown, PathKind.Item>) => {
      try {
        indices.push(index());
      } catch (e) {
        indices.push((e as Error).message);
      }
      return undefined;
    };
    const pets = signal({
      cats: [
        {name: 'pirojok-the-cat', age: 5},
        {name: 'mielo', age: 10},
      ],
      owner: 'joe',
    });
    const f = form(
      pets,
      (p) => {
        // @ts-expect-error
        validate(p, recordIndex);
        applyEach(p.cats, (cat) => {
          validate(cat, recordIndex);
        });
        // @ts-expect-error
        validate(p.owner, recordIndex);
      },
      {injector: TestBed.inject(Injector)},
    );
    f().valid();
    expect(indices).toEqual([
      jasmine.stringContaining('NG01905'), // SIGNAL_FORMS_ROOT_FIELD_NO_PARENT
      0,
      1,
      jasmine.stringContaining('NG01906'), // SIGNAL_FORMS_PARENT_NOT_ARRAY
    ]);
  });

  it('pathKeys', () => {
    const KEYS = createMetadataKey({
      reduce: (_: readonly string[], n: readonly string[]) => n,
      getInitial: () => [],
    });
    const f = form(
      signal({x: [1]}),
      (p) => {
        metadata(p, KEYS, ({pathKeys}) => pathKeys());
        metadata(p.x, KEYS, ({pathKeys}) => pathKeys());
        applyEach(p.x, (it) => {
          metadata(it, KEYS, ({pathKeys}) => pathKeys());
        });
      },
      {injector: TestBed.inject(Injector)},
    );
    expect(f().metadata(KEYS)?.()).toEqual([]);
    expect(f.x().metadata(KEYS)?.()).toEqual(['x']);
    expect(f.x[0]().metadata(KEYS)?.()).toEqual(['x', '0']);
  });

  it('valueOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.valueOf(p.name)).toEqual('pirojok-the-cat');
      expect(ctx.valueOf(p.age)).toEqual(5);
    });
  });

  it('stateOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.stateOf(p.name).value()).toEqual('pirojok-the-cat');
      expect(ctx.stateOf(p.age).value()).toEqual(5);
    });
  });

  it('fieldTreeOf', () => {
    const cat = signal({name: 'pirojok-the-cat', age: 5});
    testContext(cat, (ctx, p) => {
      expect(ctx.fieldTreeOf(p.name)().value()).toEqual('pirojok-the-cat');
      expect(ctx.fieldTreeOf(p.age)().value()).toEqual(5);
    });
  });
});

interface VariantA {
  type: 'a';
  a: number;
}
interface VariantB {
  type: 'b';
  b: string;
}
type Discriminated = VariantA | VariantB;

describe('narrowFieldTree', () => {
  it('returns the field tree cast to the narrowed type when the predicate passes', () => {
    const model = signal<Discriminated>({type: 'a', a: 42});
    const f = form(model, {injector: TestBed.inject(Injector)});

    const narrowed = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');

    expect(narrowed).not.toBeNull();
    // Access the type-specific sub-field on the narrowed tree.
    expect(narrowed!.a().value()).toBe(42);
  });

  it('returns null when the predicate does not pass', () => {
    const model = signal<Discriminated>({type: 'b', b: 'hello'});
    const f = form(model, {injector: TestBed.inject(Injector)});

    const narrowed = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');

    expect(narrowed).toBeNull();
  });

  it('is reactive — re-evaluates when the value changes', () => {
    const model = signal<Discriminated>({type: 'a', a: 42});
    const f = form(model, {injector: TestBed.inject(Injector)});

    // Initially matches variant A.
    expect(narrowFieldTree(f, (v): v is VariantA => v.type === 'a')).not.toBeNull();
    expect(narrowFieldTree(f, (v): v is VariantB => v.type === 'b')).toBeNull();

    // Switch to variant B.
    model.set({type: 'b', b: 'hello'});

    expect(narrowFieldTree(f, (v): v is VariantA => v.type === 'a')).toBeNull();
    expect(narrowFieldTree(f, (v): v is VariantB => v.type === 'b')).not.toBeNull();
    expect(
      narrowFieldTree(f, (v): v is VariantB => v.type === 'b')!
        .b()
        .value(),
    ).toBe('hello');
  });

  it('works with a child field', () => {
    const model = signal({nested: {type: 'a', a: 99} as Discriminated});
    const f = form(model, {injector: TestBed.inject(Injector)});

    const narrowed = narrowFieldTree(f.nested, (v): v is VariantA => v.type === 'a');

    expect(narrowed).not.toBeNull();
    expect(narrowed!.a().value()).toBe(99);
  });

  it('returns the same FieldTree instance when narrowed (no wrapping)', () => {
    const model = signal<Discriminated>({type: 'a', a: 1});
    const f = form(model, {injector: TestBed.inject(Injector)});

    const narrowed = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');

    // The narrowed result is the exact same proxy object — just retyped.
    expect(narrowed as unknown).toBe(f as unknown);
  });

  it('works with the boolean (non-type-guard) overload', () => {
    const model = signal<Discriminated>({type: 'a', a: 7});
    const f = form(model, {injector: TestBed.inject(Injector)});

    // Boolean predicate: return type is FieldTree<Discriminated> | null, not narrowed.
    const matched = narrowFieldTree(f, (v) => v.type === 'a');
    const unmatched = narrowFieldTree(f, (v) => v.type === 'b');

    expect(matched).not.toBeNull();
    expect(unmatched).toBeNull();
    // The matched result is still the same object.
    expect(matched as unknown).toBe(f as unknown);
  });

  it('accepts a ReadonlyFieldTree', () => {
    const model = signal<Discriminated>({type: 'a', a: 55});
    const f: ReadonlyFieldTree<Discriminated> = form(model, {injector: TestBed.inject(Injector)});

    // narrowFieldTree's structural parameter type {(): ReadonlyFieldState<TModel>} must accept
    // ReadonlyFieldTree as well as writable FieldTree.
    const narrowed = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');

    expect(narrowed).not.toBeNull();
    expect(narrowed!.a().value()).toBe(55);
  });

  it('integrates with computed() — the computed re-evaluates when the value signal changes', () => {
    const model = signal<Discriminated>({type: 'a', a: 1});
    const f = form(model, {injector: TestBed.inject(Injector)});

    // Wrapping in computed() is the recommended component-class usage.
    const narrowed = TestBed.runInInjectionContext(() =>
      computed(() => narrowFieldTree(f, (v): v is VariantA => v.type === 'a')),
    );

    // Computed resolves to the narrowed tree initially.
    expect(narrowed()).not.toBeNull();
    expect(narrowed()!.a().value()).toBe(1);

    // Changing to variant B invalidates the computed.
    model.set({type: 'b', b: 'world'});
    expect(narrowed()).toBeNull();

    // Switching back to variant A re-establishes the narrowed tree.
    model.set({type: 'a', a: 99});
    expect(narrowed()).not.toBeNull();
    expect(narrowed()!.a().value()).toBe(99);
  });

  it('works with a three-member discriminated union', () => {
    interface VariantC {
      type: 'c';
      c: boolean;
    }
    type ThreeWay = VariantA | VariantB | VariantC;

    const model = signal<ThreeWay>({type: 'c', c: true});
    const f = form(model, {injector: TestBed.inject(Injector)});

    expect(narrowFieldTree(f, (v): v is VariantA => v.type === 'a')).toBeNull();
    expect(narrowFieldTree(f, (v): v is VariantB => v.type === 'b')).toBeNull();
    const narrowedC = narrowFieldTree(f, (v): v is VariantC => v.type === 'c');
    expect(narrowedC).not.toBeNull();
    expect(narrowedC!.c().value()).toBe(true);

    // Switch to variant A.
    model.set({type: 'a', a: 5});
    expect(narrowFieldTree(f, (v): v is VariantC => v.type === 'c')).toBeNull();
    const narrowedA = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');
    expect(narrowedA).not.toBeNull();
    expect(narrowedA!.a().value()).toBe(5);
  });

  it('works alongside applyWhenValue — schema and template narrowing stay in sync', () => {
    // applyWhenValue is the schema-side counterpart; narrowFieldTree is the template-side.
    // Both must agree on which variant is active.
    const model = signal<Discriminated>({type: 'a', a: 0});
    const f = form(
      model,
      (path) => {
        applyWhenValue(
          path,
          (v): v is VariantA => v.type === 'a',
          (variantAPath) => {
            validate(variantAPath.a, ({value}) => (value() < 1 ? {kind: 'too-small'} : undefined));
          },
        );
        applyWhenValue(
          path,
          (v): v is VariantB => v.type === 'b',
          (variantBPath) => {
            validate(variantBPath.b, ({value}) =>
              value().length === 0 ? {kind: 'empty'} : undefined,
            );
          },
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    // Schema fires for variant A; template can narrow to it.
    const narrowedA = narrowFieldTree(f, (v): v is VariantA => v.type === 'a');
    expect(narrowedA).not.toBeNull();
    expect(narrowedA!.a().errors()).toEqual([{kind: 'too-small', fieldTree: narrowedA!.a}]);

    // Switch to variant B — schema switches, template narrowing switches too.
    model.set({type: 'b', b: ''});
    expect(narrowFieldTree(f, (v): v is VariantA => v.type === 'a')).toBeNull();
    const narrowedB = narrowFieldTree(f, (v): v is VariantB => v.type === 'b');
    expect(narrowedB).not.toBeNull();
    expect(narrowedB!.b().errors()).toEqual([{kind: 'empty', fieldTree: narrowedB!.b}]);

    // Fix variant B — errors clear.
    model.set({type: 'b', b: 'hello'});
    const narrowedB2 = narrowFieldTree(f, (v): v is VariantB => v.type === 'b');
    expect(narrowedB2!.b().errors()).toEqual([]);
  });
});
