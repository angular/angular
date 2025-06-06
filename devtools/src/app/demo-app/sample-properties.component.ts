/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, ElementRef, inject, signal, viewChild} from '@angular/core';
import {SIGNAL} from '@angular/core/primitives/signals';

import {SampleService} from './sample.service';

@Component({
  selector: 'app-sample-properties',
  template: '{{computedObject()}}',
  styles: [''],
})
export class SamplePropertiesComponent {
  readonly elementRef = viewChild<ElementRef>('elementReference');

  exampleService = inject(SampleService);

  exampleBoolean = true;
  exampleString = 'John';
  exampleSymbol = Symbol.iterator;
  exampleNumber = 40;
  exampleBigint = 40n;
  exampleUndefined = undefined;
  exampleNull = null;

  exampleObject = {name: 'John', age: 40};
  exampleArray = [1, 2, [3, 4], {name: 'John', age: 40, skills: ['JavaScript']}];
  exampleSet = new Set([1, 2, 3, 4, 5]);
  exampleMap = new Map<unknown, unknown>([
    ['name', 'John'],
    ['age', 40],
    [{id: 123}, undefined],
  ]);
  exampleDate = new Date();
  exampleFunction = () => 'John';

  signalPrimitive = signal(123);
  computedPrimitive = computed(() => this.signalPrimitive() ** 2);
  signalObject = signal({name: 'John', age: 40});
  computedObject = computed(() => {
    const original = this.signalObject();
    return {...original, age: original.age + 1};
  });

  signalSymbol = SIGNAL;
}
