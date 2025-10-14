/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {computed, Injectable, signal} from '@angular/core';
let SampleService = class SampleService {
  constructor() {
    this.exampleBoolean = true;
    this.exampleString = 'John';
    this.exampleSymbol = Symbol.iterator;
    this.exampleNumber = 40;
    this.exampleBigint = BigInt(40);
    this.exampleUndefined = undefined;
    this.exampleNull = null;
    this.exampleObject = {name: 'John', age: 40};
    this.exampleArray = [1, 2, [3, 4], {name: 'John', age: 40, skills: ['JavaScript']}];
    this.exampleSet = new Set([1, 2, 3, 4, 5]);
    this.exampleMap = new Map([
      ['name', 'John'],
      ['age', 40],
      [{id: 123}, undefined],
    ]);
    this.exampleDate = new Date();
    this.exampleFunction = () => 'John';
    this.signalPrimitive = signal(123);
    this.computedPrimitive = computed(() => this.signalPrimitive() ** 2);
    this.signalObject = signal({name: 'John', age: 40});
    this.computedObject = computed(() => {
      const original = this.signalObject();
      return {...original, age: original.age + 1};
    });
  }
};
SampleService = __decorate([Injectable({providedIn: 'root'})], SampleService);
export {SampleService};
//# sourceMappingURL=sample.service.js.map
