/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EventEmitter, output} from '../../src/core';
import {TestBed} from '../../testing';
import {Subject} from 'rxjs';

import {outputFromObservable, outputToObservable} from '../src';

describe('outputToObservable()', () => {
  it('should work with basic `output()`', () => {
    const outputRef = TestBed.runInInjectionContext(() => output<number>());
    const observable = outputToObservable(outputRef);

    const values: number[] = [];
    observable.subscribe({next: (v) => values.push(v)});
    expect(values).toEqual([]);

    outputRef.emit(1);
    outputRef.emit(2);

    expect(values).toEqual([1, 2]);
  });

  it('should complete observable upon directive destroy', () => {
    const outputRef = TestBed.runInInjectionContext(() => output<number>());
    const observable = outputToObservable(outputRef);

    let completed = false;
    const subscription = observable.subscribe({
      complete: () => (completed = true),
    });

    outputRef.emit(1);
    outputRef.emit(2);

    expect(completed).toBe(false);
    expect(subscription.closed).toBe(false);

    // destroy `EnvironmentInjector`.
    TestBed.resetTestingModule();

    expect(completed).toBe(true);
    expect(subscription.closed).toBe(true);
  });

  it('should complete EventEmitter upon directive destroy', () => {
    const eventEmitter = TestBed.runInInjectionContext(() => new EventEmitter<number>());
    const observable = outputToObservable(eventEmitter);

    let completed = false;
    const subscription = observable.subscribe({
      complete: () => (completed = true),
    });

    eventEmitter.next(1);
    eventEmitter.next(2);

    expect(completed).toBe(false);
    expect(subscription.closed).toBe(false);
    expect(eventEmitter.observed).toBe(true);

    // destroy `EnvironmentInjector`.
    TestBed.resetTestingModule();

    expect(completed).toBe(true);
    expect(subscription.closed).toBe(true);
    expect(eventEmitter.observed).toBe(false);
  });

  describe('with `outputFromObservable()` as source', () => {
    it('should allow subscription', () => {
      const subject = new Subject<number>();
      const outputRef = TestBed.runInInjectionContext(() => outputFromObservable(subject));
      const observable = outputToObservable(outputRef);

      const values: number[] = [];
      observable.subscribe({next: (v) => values.push(v)});
      expect(values).toEqual([]);

      subject.next(1);
      subject.next(2);

      expect(values).toEqual([1, 2]);
    });

    it('should complete observable upon directive destroy', () => {
      const subject = new Subject<number>();
      const outputRef = TestBed.runInInjectionContext(() => outputFromObservable(subject));
      const observable = outputToObservable(outputRef);

      let completed = false;
      const subscription = observable.subscribe({
        complete: () => (completed = true),
      });

      subject.next(1);
      subject.next(2);

      expect(completed).toBe(false);
      expect(subscription.closed).toBe(false);
      expect(subject.observed).toBe(true);

      // destroy `EnvironmentInjector`.
      TestBed.resetTestingModule();

      expect(completed).toBe(true);
      expect(subscription.closed).toBe(true);
      expect(subject.observed).toBe(false);
    });

    it(
      'may not complete the observable with an improperly ' +
        'configured `OutputRef` without a destroy ref as source',
      () => {
        const outputRef = new EventEmitter<number>();
        const observable = outputToObservable(outputRef);

        let completed = false;
        const subscription = observable.subscribe({
          complete: () => (completed = true),
        });

        outputRef.next(1);
        outputRef.next(2);

        expect(completed).toBe(false);
        expect(subscription.closed).toBe(false);
        expect(outputRef.observed).toBe(true);

        // destroy `EnvironmentInjector`.
        TestBed.resetTestingModule();

        expect(completed)
          .withContext('Should not be completed as there is no known time when to destroy')
          .toBe(false);
        expect(subscription.closed).toBe(false);
        expect(outputRef.observed).toBe(true);
      },
    );
  });
});
