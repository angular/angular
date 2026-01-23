/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {createMetadataKey, form, metadata, MetadataReducer} from '../../../public_api';

describe('metadata', () => {
  it('should reduce values with MetadataReducer.and', () => {
    const KEY = createMetadataKey(MetadataReducer.and());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => true);

        metadata(p.y, KEY, () => true);
        metadata(p.y, KEY, () => false);
        metadata(p.y, KEY, () => true);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(true);
    expect(f.y().metadata(KEY)?.()).toBe(false);
  });

  it('should reduce values with MetadataReducer.or', () => {
    const KEY = createMetadataKey(MetadataReducer.or());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => false);

        metadata(p.y, KEY, () => false);
        metadata(p.y, KEY, () => true);
        metadata(p.y, KEY, () => false);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(false);
    expect(f.y().metadata(KEY)?.()).toBe(true);
  });

  it('should reduce values with MetadataReducer.list', () => {
    const KEY = createMetadataKey(MetadataReducer.list<string>());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 'a');

        metadata(p.y, KEY, () => 'b');
        metadata(p.y, KEY, () => 'c');
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toEqual(['a']);
    expect(f.y().metadata(KEY)?.()).toEqual(['b', 'c']);
  });

  it('should reduce values with MetadataReducer.max', () => {
    const KEY = createMetadataKey(MetadataReducer.max());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 50);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(50);
  });

  it('should reduce values with MetadataReducer.min', () => {
    const KEY = createMetadataKey(MetadataReducer.min());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 5);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(5);
  });

  it('should reduce values with MetadataReducer.override', () => {
    const KEY = createMetadataKey(MetadataReducer.override<number>());

    const f = form(
      signal({x: 0, y: 0}),
      (p) => {
        metadata(p.x, KEY, () => 10);

        metadata(p.y, KEY, () => 10);
        metadata(p.y, KEY, () => 5);
        metadata(p.y, KEY, () => 20);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f().metadata(KEY)).toBe(undefined);
    expect(f.x().metadata(KEY)?.()).toBe(10);
    expect(f.y().metadata(KEY)?.()).toBe(20);
  });
});
