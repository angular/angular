/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Signal, signal} from '@angular/core';
import {validate} from '../../src/api/logic';
import {applyEach, applyWhen, applyWhenValue, form} from '../../src/api/structure';
import {Schema} from '../../src/api/types';

export interface User {
  first: string;
  last: string;
}

const needsLastNamePredicate = ({value}: {value: Signal<{needLastName: boolean}>}) =>
  value().needLastName;

describe('when', () => {
  it('validates child field according to condition', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (namePath) => {
        validate(namePath.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
      });
    });

    f.$state.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$state.errors()).toEqual([]);
    f.$state.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$state.errors()).toEqual([{kind: 'required'}]);
  });

  it('Disallows using non-local paths', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (/* UNUSED */) => {
        expect(() => {
          validate(path.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
        }).toThrowError();
      });
    });
  });

  it('supports merging two array schemas', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});

    const s: Schema<User> = (namePath) => {
      validate(namePath.last, ({value}) => {
        return value().length > 0 ? undefined : {kind: 'required1'};
      });
    };

    const s2: Schema<User> = (namePath) => {
      validate(namePath.last, ({value}) => {
        return value.length > 0 ? undefined : {kind: 'required2'};
      });
    };

    const f = form(data, (path) => {
      applyEach(path.items, s);
      applyWhen(path, needsLastNamePredicate, (names) => {
        applyEach(names.items, s2);
      });
    });
    f.needLastName.$state.value.set(true);
    expect(f.items[0].last.$state.errors()).toEqual([{kind: 'required1'}, {kind: 'required2'}]);
    f.needLastName.$state.value.set(false);
    expect(f.items[0].last.$state.errors()).toEqual([{kind: 'required1'}]);
  });

  it('accepts a schema', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const s: Schema<User> = (namePath) => {
      validate(namePath.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
    };
    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, s);
    });

    f.$state.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$state.errors()).toEqual([]);
    f.$state.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$state.errors()).toEqual([{kind: 'required'}]);
  });

  it('supports mix of conditional and non conditional validators', () => {
    const data = signal({first: '', needLastName: false, last: ''});
    const f = form(data, (path) => {
      validate(path.last, ({value}) => (value().length > 4 ? undefined : {kind: 'short'}));

      applyWhen(path, needsLastNamePredicate, (namePath /* Path */) => {
        validate(namePath.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
      });
    });

    f.$state.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$state.errors()).toEqual([{kind: 'short'}]);
    f.$state.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$state.errors()).toEqual([{kind: 'short'}, {kind: 'required'}]);
  });

  it('supports array schema', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});
    const s: Schema<User> = (i) => {
      validate(i.last, ({value}) => {
        return value().length > 0 ? undefined : {kind: 'required'};
      });
    };

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (names /* Path */) => {
        applyEach(names.items, s);
      });
    });

    expect(f.items[0].last.$state.errors()).toEqual([{kind: 'required'}]);
    f.needLastName.$state.value.set(false);
    expect(f.items[0].last.$state.errors()).toEqual([]);
  });

  it('supports array function', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (names /* Path */) => {
        applyEach(names.items, (i) => {
          validate(i.last, ({value}) => {
            return value().length > 0 ? undefined : {kind: 'required'};
          });
        });
      });
    });

    expect(f.items[0].last.$state.errors()).toEqual([{kind: 'required'}]);
    f.needLastName.$state.value.set(false);
    expect(f.items[0].last.$state.errors()).toEqual([]);
  });
});

describe('applyWhenValue', () => {
  it('accepts non-narrowing predicate', () => {
    const data = signal<{numOrNull: number | null}>({numOrNull: null});
    const f = form(data, (path) => {
      applyWhenValue(
        path.numOrNull,
        (value) => value === null || value > 0,
        (num) => {
          validate(num, ({value}) => ((value() ?? 0) < 10 ? {kind: 'too-small'} : undefined));
        },
      );
    });

    expect(f.numOrNull.$state.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$state.value.set(5);
    expect(f.numOrNull.$state.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$state.value.set(null);
    expect(f.numOrNull.$state.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$state.value.set(15);
    expect(f.numOrNull.$state.errors()).toEqual([]);
  });

  it('accepts narrowing-predicate and schema for narrowed type', () => {
    const data = signal<{numOrNull: number | null}>({numOrNull: null});
    const f = form(data, (path) => {
      applyWhenValue(
        path.numOrNull,
        (value) => value !== null,
        (num) => {
          validate(num, ({value}) => (value() < 10 ? {kind: 'too-small'} : undefined));
        },
      );
    });

    expect(f.numOrNull.$state.errors()).toEqual([]);
    f.numOrNull.$state.value.set(5);
    expect(f.numOrNull.$state.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$state.value.set(null);
    expect(f.numOrNull.$state.errors()).toEqual([]);
    f.numOrNull.$state.value.set(15);
    expect(f.numOrNull.$state.errors()).toEqual([]);
  });
});
