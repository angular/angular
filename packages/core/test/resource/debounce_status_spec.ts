/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {timeout} from '@angular/private/testing';
import {Injector} from '../../src/di';
import {signal} from '../../src/render3/reactivity/signal';
import {resource} from '../../src/resource';
import {debounced} from '../../src/resource/debounce';
import {TestBed} from '../../testing';

// These specs fail until `debounced()` reports `loading` as soon as its source changes, instead of
// when its effect runs.
describe('debounced status before effects run', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
  });

  it('reports loading as soon as the source changes', async () => {
    const source = signal('initial');
    const res = debounced(source, 10, {injector});
    TestBed.tick();
    await timeout(10);
    expect(res.status()).withContext('precondition: settled').toBe('resolved');

    source.set('updated');
    // Read in the same task as the write, before any effect runs.
    expect({status: res.status(), value: res.value()})
      .withContext('state right after source.set()')
      .toEqual({status: 'loading', value: 'initial'});

    TestBed.tick();
    await timeout(10);
    expect({status: res.status(), value: res.value()})
      .withContext('control: state after the debounce')
      .toEqual({status: 'resolved', value: 'updated'});
  });

  it('makes a chained resource report loading as soon as the source changes', async () => {
    const source = signal('initial');
    const deb = debounced(source, 10, {injector});
    const res = resource({
      params: ({chain}) => chain(deb),
      loader: async ({params}) => params,
      injector,
    });
    TestBed.tick();
    await timeout(10);
    TestBed.tick();
    await timeout();
    expect({status: res.status(), value: res.value()})
      .withContext('precondition: settled')
      .toEqual({status: 'resolved', value: 'initial'});

    source.set('updated');
    expect(res.status())
      .withContext('chained resource status right after source.set()')
      .toBe('loading');
  });
});
