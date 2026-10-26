/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DestroyRef, inject, Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {applyEach, createManagedMetadataKey, form, metadata} from '@angular/forms/signals';

// Specs named `control:` check the harness and pass today. The others fail until the field cleanup
// sweep stops materializing fields that nothing has read.
describe('field cleanup sweep laziness', () => {
  it('keeps rule-less children unmaterialized after effects run', () => {
    const f = form(signal({a: {b: {c: 'x'}}}), {injector: TestBed.inject(Injector)});
    const root = f() as any;
    const structures: Set<unknown> = root.structure.fieldManager.structures;
    expect(root.structure._areChildrenMaterialized())
      .withContext('precondition: lazy before effects run')
      .toBeFalse();
    const before = structures.size;

    TestBed.tick();
    expect(root.structure._areChildrenMaterialized())
      .withContext(
        `root children materialized after TestBed.tick() ` +
          `(child structures before: ${before}, after: ${structures.size})`,
      )
      .toBeFalse();
  });

  it('creates no child structures for 100 rule-less rows when effects run', () => {
    const rows = Array.from({length: 100}, (_, i) => ({id: i, label: 'x'}));
    const f = form(signal({rows}), {injector: TestBed.inject(Injector)});
    const structures: Set<unknown> = (f() as any).structure.fieldManager.structures;
    const before = structures.size;

    TestBed.tick();
    expect(structures.size)
      .withContext(`child structures after TestBed.tick() (before: ${before})`)
      .toBe(before);
  });

  it('does not write childrenMap when children() is called on a leaf', () => {
    const f = form(signal({a: 'x'}), {injector: TestBed.inject(Injector)});
    const leaf = f.a() as any;
    const update = spyOn(leaf.structure.childrenMap, 'update').and.callThrough();

    leaf.structure.children();
    leaf.structure.children();
    expect(update.calls.count())
      .withContext('childrenMap.update() calls from two children() calls on a leaf')
      .toBe(0);
  });

  it('control: destroys a field that was read once it is removed from the model', () => {
    const destroyed = jasmine.createSpy('destroyed');
    const PROBE = createManagedMetadataKey<void, boolean>(() => {
      inject(DestroyRef).onDestroy(destroyed);
    });
    const model = signal({rows: [{label: 'a'}, {label: 'b'}]});
    const f = form(
      model,
      (p) => {
        applyEach(p.rows, (row) => {
          metadata(row, PROBE, () => true);
        });
      },
      {injector: TestBed.inject(Injector)},
    );
    f.rows[1]();
    TestBed.tick();

    model.update(({rows}) => ({rows: rows.slice(0, 1)}));
    TestBed.tick();
    expect(destroyed)
      .withContext('DestroyRef callbacks after removing the read row')
      .toHaveBeenCalledTimes(1);
  });
});
