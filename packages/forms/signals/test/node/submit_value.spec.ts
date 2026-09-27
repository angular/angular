/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyEach, disabled, form, hidden} from '@angular/forms/signals';

describe('submitValue', () => {
  it('matches value when nothing is disabled or hidden', () => {
    const model = signal({name: 'John', email: 'john@example.com', role: 'admin'});
    const f = form(model, {injector: TestBed.inject(Injector)});

    expect(f().submitValue()).toEqual({name: 'John', email: 'john@example.com', role: 'admin'});
  });

  it('omits disabled properties from an object', () => {
    const model = signal({name: 'John', email: 'john@example.com', role: 'admin'});
    const f = form(
      model,
      (p) => {
        disabled(p.role);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual({name: 'John', email: 'john@example.com'});
    // The raw `value` is unaffected.
    expect(f().value()).toEqual({name: 'John', email: 'john@example.com', role: 'admin'});
  });

  it('omits hidden properties from an object', () => {
    const model = signal({name: 'John', email: 'john@example.com', role: 'admin'});
    const f = form(
      model,
      (p) => {
        hidden(p.role);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual({name: 'John', email: 'john@example.com'});
  });

  it('recomputes reactively as disabled state changes', () => {
    const model = signal({name: 'John', role: 'admin'});
    const f = form(
      model,
      (p) => {
        disabled(p.role, {when: ({valueOf}) => valueOf(p.name) === 'lock'});
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual({name: 'John', role: 'admin'});

    f.name().value.set('lock');
    expect(f().submitValue()).toEqual({name: 'John'});

    f.name().value.set('unlock');
    expect(f().submitValue()).toEqual({name: 'unlock', role: 'admin'});
  });

  it('excludes disabled/hidden properties of nested objects', () => {
    const model = signal({user: {name: 'John', role: 'admin'}, active: true});
    const f = form(
      model,
      (p) => {
        disabled(p.user.role);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual({user: {name: 'John'}, active: true});
  });

  it('removes disabled elements from an array and shifts indices', () => {
    const model = signal([1, 2, 3, 4]);
    const f = form(
      model,
      (p) => {
        applyEach(p, (element) => {
          disabled(element, {when: ({value}) => value() % 2 === 0});
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual([1, 3]);
    // The raw `value` retains all elements.
    expect(f().value()).toEqual([1, 2, 3, 4]);
  });

  it('removes hidden elements from an array', () => {
    const model = signal([
      {name: 'a', hide: false},
      {name: 'b', hide: true},
    ]);
    const f = form(
      model,
      (p) => {
        applyEach(p, (element) => {
          hidden(element, {when: ({value}) => value().hide});
        });
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().submitValue()).toEqual([{name: 'a', hide: false}]);
  });

  it('returns the primitive value directly for a leaf field', () => {
    const model = signal('value');
    const f = form(model, {injector: TestBed.inject(Injector)});

    expect(f().submitValue()).toBe('value');
  });
});
