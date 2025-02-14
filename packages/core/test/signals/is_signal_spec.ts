/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {computed, input, isSignal, model, runInInjectionContext, signal} from '@angular/core';
import {createInputSignal} from '@angular/core/src/authoring/input/input_signal';
import {isInputSignal, isModelSignal} from '@angular/core/src/render3/reactivity/api';
import {TestBed} from '@angular/core/testing';

describe('isSignal', () => {
  it('should return true for writable signal', () => {
    const writableSignal = signal('Angular');
    expect(isSignal(writableSignal)).toBe(true);
  });

  it('should return true for readonly signal', () => {
    const readonlySignal = computed(() => 10);
    expect(isSignal(readonlySignal)).toBe(true);
  });

  it('should return false for primitive', () => {
    const primitive = 0;
    expect(isSignal(primitive)).toBe(false);
  });

  it('should return false for object', () => {
    const object = {name: 'Angular'};
    expect(isSignal(object)).toBe(false);
  });

  it('should return false for function', () => {
    const fn = () => {};
    expect(isSignal(fn)).toBe(false);
  });
});

describe('isInputSignal', () => {
  it('should return true for input signal', () => {
    const inputSignal = TestBed.runInInjectionContext(() => input('Angular'));
    expect(isInputSignal(inputSignal)).toBe(true);
  });

  it('should return false for signal', () => {
    const writableSignal = signal('Angular');
    expect(isInputSignal(writableSignal)).toBe(false);
  });
});

describe('isModelSignal', () => {
  it('should return true for model signal', () => {
    const modelSignal = TestBed.runInInjectionContext(() => model('Angular'));
    expect(isModelSignal(modelSignal)).toBe(true);
  });

  it('should return false for input signal', () => {
    const inputSignal = createInputSignal('Angular');
    expect(isModelSignal(inputSignal)).toBe(false);
  });
});
