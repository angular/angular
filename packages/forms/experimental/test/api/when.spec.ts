import {Signal, signal} from '@angular/core';
import {validate} from '../../src/api/logic';
import {applyEach, applyWhen, applyWhenValue, form, schema} from '../../src/api/structure';

export interface User {
  first: string;
  last: string;
  needLastName: boolean;
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

    f.$api.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$api.errors()).toEqual([]);
    f.$api.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$api.errors()).toEqual([{kind: 'required'}]);
  });

  it('Disallows using non-local paths', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (namePath /* NO USING THIS ONE */) => {
        expect(() => {
          validate(path.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
        }).toThrowError();
      });
    });
  });

  it('supports merging two array schemas', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});

    const s = schema<User>((namePath) => {
      validate(namePath.last, ({value}) => {
        return value().length > 0 ? undefined : {kind: 'required1'};
      });
    });

    const s2 = schema<User>((namePath) => {
      validate(namePath.last, ({value}) => {
        return value.length > 0 ? undefined : {kind: 'required2'};
      });
    });

    const f = form(data, (path) => {
      applyEach(path.items, s);
      applyWhen(path, needsLastNamePredicate, (names) => {
        applyEach(names.items, s2);
      });
    });
    f.needLastName.$api.value.set(true);
    expect(f.items[0].last.$api.errors()).toEqual([{kind: 'required1'}, {kind: 'required2'}]);
    f.needLastName.$api.value.set(false);
    expect(f.items[0].last.$api.errors()).toEqual([{kind: 'required1'}]);
  });

  it('accepts a schema', () => {
    const data = signal({first: '', needLastName: false, last: ''});

    const s = schema<User>((namePath) => {
      validate(namePath.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
    });
    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, s);
    });

    f.$api.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$api.errors()).toEqual([]);
    f.$api.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$api.errors()).toEqual([{kind: 'required'}]);
  });

  it('supports mix of conditional and non conditional validators', () => {
    const data = signal({first: '', needLastName: false, last: ''});
    const f = form(data, (path) => {
      validate(path.last, ({value}) => (value().length > 4 ? undefined : {kind: 'short'}));

      applyWhen(path, needsLastNamePredicate, (namePath /* Path */) => {
        validate(namePath.last, ({value}) => (value().length > 0 ? undefined : {kind: 'required'}));
      });
    });

    f.$api.value.set({first: 'meow', needLastName: false, last: ''});
    expect(f.last.$api.errors()).toEqual([{kind: 'short'}]);
    f.$api.value.set({first: 'meow', needLastName: true, last: ''});
    expect(f.last.$api.errors()).toEqual([{kind: 'short'}, {kind: 'required'}]);
  });

  it('supports array schema', () => {
    const data = signal({needLastName: true, items: [{first: '', last: ''}]});
    const s = schema<{first: string; last: string}>((i) => {
      validate(i.last, ({value}) => {
        return value().length > 0 ? undefined : {kind: 'required'};
      });
    });

    const f = form(data, (path) => {
      applyWhen(path, needsLastNamePredicate, (names /* Path */) => {
        applyEach(names.items, s);
      });
    });

    expect(f.items[0].last.$api.errors()).toEqual([{kind: 'required'}]);
    f.needLastName.$api.value.set(false);
    expect(f.items[0].last.$api.errors()).toEqual([]);
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

    expect(f.items[0].last.$api.errors()).toEqual([{kind: 'required'}]);
    f.needLastName.$api.value.set(false);
    expect(f.items[0].last.$api.errors()).toEqual([]);
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

    expect(f.numOrNull.$api.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$api.value.set(5);
    expect(f.numOrNull.$api.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$api.value.set(null);
    expect(f.numOrNull.$api.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$api.value.set(15);
    expect(f.numOrNull.$api.errors()).toEqual([]);
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

    expect(f.numOrNull.$api.errors()).toEqual([]);
    f.numOrNull.$api.value.set(5);
    expect(f.numOrNull.$api.errors()).toEqual([{kind: 'too-small'}]);
    f.numOrNull.$api.value.set(null);
    expect(f.numOrNull.$api.errors()).toEqual([]);
    f.numOrNull.$api.value.set(15);
    expect(f.numOrNull.$api.errors()).toEqual([]);
  });
});
