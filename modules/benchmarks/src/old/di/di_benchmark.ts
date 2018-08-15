/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, ReflectiveInjector, ReflectiveKey} from '@angular/core';
import {reflector} from '@angular/core/src/reflection/reflection';
import {ReflectionCapabilities} from '@angular/core/src/reflection/reflection_capabilities';
import {BrowserDomAdapter} from '@angular/platform-browser/src/browser/browser_adapter';
import {bindAction, getIntParameter, microBenchmark} from '@angular/testing/src/benchmark_util';

let count = 0;

function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
}

export function main() {
  BrowserDomAdapter.makeCurrent();
  const iterations = getIntParameter('iterations');

  // This benchmark does not use bootstrap and needs to create a reflector
  setupReflector();
  const bindings = [A, B, C, D, E];
  const injector = ReflectiveInjector.resolveAndCreate(bindings);

  const D_KEY = ReflectiveKey.get(D);
  const E_KEY = ReflectiveKey.get(E);
  const childInjector = injector.resolveAndCreateChild([])
                            .resolveAndCreateChild([])
                            .resolveAndCreateChild([])
                            .resolveAndCreateChild([])
                            .resolveAndCreateChild([]);

  const variousProviders = [A, {provide: B, useClass: C}, [D, [E]], {provide: F, useValue: 6}];

  const variousProvidersResolved = ReflectiveInjector.resolve(variousProviders);

  function getByToken() {
    for (let i = 0; i < iterations; ++i) {
      injector.get(D);
      injector.get(E);
    }
  }
  function getByKey() {
    for (let i = 0; i < iterations; ++i) {
      injector.get(D_KEY);
      injector.get(E_KEY);
    }
  }

  function getChild() {
    for (let i = 0; i < iterations; ++i) {
      childInjector.get(D);
      childInjector.get(E);
    }
  }

  function instantiate() {
    for (let i = 0; i < iterations; ++i) {
      const child = injector.resolveAndCreateChild([E]);
      child.get(E);
    }
  }

  /**
   * Creates an injector with a variety of provider types.
   */
  function createVariety() {
    for (let i = 0; i < iterations; ++i) {
      ReflectiveInjector.resolveAndCreate(variousProviders);
    }
  }

  /**
   * Same as [createVariety] but resolves providers ahead of time.
   */
  function createVarietyResolved() {
    for (let i = 0; i < iterations; ++i) {
      ReflectiveInjector.fromResolvedProviders(variousProvidersResolved);
    }
  }

  bindAction('#getByToken', () => microBenchmark('injectAvg', iterations, getByToken));
  bindAction('#getByKey', () => microBenchmark('injectAvg', iterations, getByKey));
  bindAction('#getChild', () => microBenchmark('injectAvg', iterations, getChild));
  bindAction('#instantiate', () => microBenchmark('injectAvg', iterations, instantiate));
  bindAction('#createVariety', () => microBenchmark('injectAvg', iterations, createVariety));
  bindAction(
      '#createVarietyResolved',
      () => microBenchmark('injectAvg', iterations, createVarietyResolved));
}



@Injectable()
class A {
  constructor() {
    count++;
  }
}

@Injectable()
class B {
  constructor(a: A) {
    count++;
  }
}

@Injectable()
class C {
  constructor(b: B) {
    count++;
  }
}

@Injectable()
class D {
  constructor(c: C, b: B) {
    count++;
  }
}

@Injectable()
class E {
  constructor(d: D, c: C) {
    count++;
  }
}

@Injectable()
class F {
  constructor(e: E, d: D) {
    count++;
  }
}
