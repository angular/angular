/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, Signal, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {
  SchemaOrSchemaFn,
  applyEach,
  applyWhen,
  applyWhenValue,
  form,
  validate,
} from '../../../public_api';
import {ValidationError} from '../../../src/api/validation_errors';

export interface User {
  first: string;
  last: string;
}

const needsLastNamePredicate = ({value}: {value: Signal<{needLastName: boolean}>}) =>
  value().needLastName;

describe('when', () => {
  it('validates child field according to condition', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const f = form(
      data,
      (path) => {
        applyWhen(path, needsLastNamePredicate, (namePath) => {
          validate(namePath.last, ({value}) =>
            value().length > 0 ? undefined : ValidationError.required(),
          );
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f().value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last().errors()).toEqual([]);
    f().value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last().errors()).toEqual([ValidationError.required({field: f.last})]);
  });

  it('Disallows using non-local paths', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const f = form(
      data,
      (path) => {
        applyWhen(path, needsLastNamePredicate, (/* UNUSED */) => {
          expect(() => {
            validate(path.last, ({value}) =>
              value().length > 0 ? undefined : ValidationError.required(),
            );
          }).toThrowError();
        });
      },
      {injector: TestBed.inject(Injector)},
    );
  });

  it('supports merging two array schemas', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});

    const s: SchemaOrSchemaFn<User> = (namePath) => {
      validate(namePath.last, ({value}) => {
        return value().length > 0 ? undefined : ValidationError.custom({kind: 'required1'});
      });
    };

    const s2: SchemaOrSchemaFn<User> = (namePath) => {
      validate(namePath.last, ({value}) => {
        return value.length > 0 ? undefined : ValidationError.custom({kind: 'required2'});
      });
    };

    const f = form(
      data,
      (path) => {
        applyEach(path.items, s);
        applyWhen(path, needsLastNamePredicate, (names) => {
          applyEach(names.items, s2);
        });
      },
      {injector: TestBed.inject(Injector)},
    );
    f.needLastName().value.set(true);
    expect(f.items[0].last().errors()).toEqual([
      ValidationError.custom({kind: 'required1', field: f.items[0].last}),
      ValidationError.custom({kind: 'required2', field: f.items[0].last}),
    ]);
    f.needLastName().value.set(false);
    expect(f.items[0].last().errors()).toEqual([
      ValidationError.custom({kind: 'required1', field: f.items[0].last}),
    ]);
  });

  it('accepts a schema', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const s: SchemaOrSchemaFn<User> = (namePath) => {
      validate(namePath.last, ({value}) =>
        value().length > 0 ? undefined : ValidationError.required(),
      );
    };
    const f = form(
      data,
      (path) => {
        applyWhen(path, needsLastNamePredicate, s);
      },
      {injector: TestBed.inject(Injector)},
    );

    f().value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last().errors()).toEqual([]);
    f().value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last().errors()).toEqual([ValidationError.required({field: f.last})]);
  });

  it('supports mix of conditional and non conditional validators', () => {
    const data = signal({first: '', needLastName: false, last: ''});
    const f = form(
      data,
      (path) => {
        validate(path.last, ({value}) =>
          value().length > 4 ? undefined : ValidationError.custom({kind: 'short'}),
        );

        applyWhen(path, needsLastNamePredicate, (namePath /* Path */) => {
          validate(namePath.last, ({value}) =>
            value().length > 0 ? undefined : ValidationError.required(),
          );
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    f().value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last().errors()).toEqual([ValidationError.custom({kind: 'short', field: f.last})]);
    f().value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last().errors()).toEqual([
      ValidationError.custom({kind: 'short', field: f.last}),
      ValidationError.required({field: f.last}),
    ]);
  });

  it('supports array schema', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});
    const s: SchemaOrSchemaFn<User> = (i) => {
      validate(i.last, ({value}) => {
        return value().length > 0 ? undefined : ValidationError.required();
      });
    };

    const f = form(
      data,
      (path) => {
        applyWhen(path, needsLastNamePredicate, (names /* Path */) => {
          applyEach(names.items, s);
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.items[0].last().errors()).toEqual([
      ValidationError.required({field: f.items[0].last}),
    ]);
    f.needLastName().value.set(false);
    expect(f.items[0].last().errors()).toEqual([]);
  });
});

describe('applyWhenValue', () => {
  it('accepts non-narrowing predicate', () => {
    const data = signal<{numOrNull: number | null}>({numOrNull: null});
    const f = form(
      data,
      (path) => {
        applyWhenValue(
          path.numOrNull,
          (value) => value === null || value > 0,
          (num) => {
            validate(num, ({value}) =>
              (value() ?? 0) < 10 ? ValidationError.custom({kind: 'too-small'}) : undefined,
            );
          },
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.numOrNull().errors()).toEqual([
      ValidationError.custom({kind: 'too-small', field: f.numOrNull}),
    ]);
    f.numOrNull().value.set(5);
    expect(f.numOrNull().errors()).toEqual([
      ValidationError.custom({kind: 'too-small', field: f.numOrNull}),
    ]);
    f.numOrNull().value.set(null);
    expect(f.numOrNull().errors()).toEqual([
      ValidationError.custom({kind: 'too-small', field: f.numOrNull}),
    ]);
    f.numOrNull().value.set(15);
    expect(f.numOrNull().errors()).toEqual([]);
  });

  it('accepts narrowing-predicate and schema for narrowed type', () => {
    const data = signal<{numOrNull: number | null}>({numOrNull: null});
    const f = form(
      data,
      (path) => {
        applyWhenValue(
          path.numOrNull,
          (value) => value !== null,
          (num) => {
            validate(num, ({value}) =>
              value() < 10 ? ValidationError.custom({kind: 'too-small'}) : undefined,
            );
          },
        );
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.numOrNull().errors()).toEqual([]);
    f.numOrNull().value.set(5);
    expect(f.numOrNull().errors()).toEqual([
      ValidationError.custom({kind: 'too-small', field: f.numOrNull}),
    ]);
    f.numOrNull().value.set(null);
    expect(f.numOrNull().errors()).toEqual([]);
    f.numOrNull().value.set(15);
    expect(f.numOrNull().errors()).toEqual([]);
  });
});
