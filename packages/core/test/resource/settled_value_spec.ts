/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resourceFromSnapshots, ResourceSnapshot, settledResourceValue, signal} from '@angular/core';

describe('settledResourceValue', () => {
  for (const status of ['idle', 'loading', 'reloading', 'resolved', 'local'] as const) {
    it(`should ${status === 'resolved' || status === 'local' ? 'expose' : 'exclude'} the value when ${status}`, () => {
      const snapshot = signal<ResourceSnapshot<string>>({status, value: 'retained'});
      const source = resourceFromSnapshots(snapshot);
      expect(source.hasValue()).toBeTrue();
      expect(settledResourceValue(source)()).toBe(
        status === 'resolved' || status === 'local' ? 'retained' : undefined,
      );
    });
  }

  it('should read error snapshots without reading the throwing value and recover', () => {
    const snapshot = signal<ResourceSnapshot<string>>({
      status: 'error',
      error: new Error('failed'),
    });
    const source = resourceFromSnapshots(snapshot);
    const valueRead = spyOn(source, 'value').and.callThrough();
    const settled = settledResourceValue(source);
    expect(settled()).toBeUndefined();
    snapshot.set({status: 'resolved', value: 'recovered'});
    expect(settled()).toBe('recovered');
    expect(valueRead).not.toHaveBeenCalled();
  });

  for (const value of [false, 0, '', null, undefined]) {
    it(`should preserve a settled ${String(value)}`, () => {
      const source = resourceFromSnapshots(() => ({status: 'resolved', value}));
      expect(settledResourceValue(source)()).toBe(value);
    });
  }

  it('should expose an unavailable transition even when the next settled value is equal', () => {
    const snapshot = signal<ResourceSnapshot<string>>({status: 'resolved', value: 'A'});
    const settled = settledResourceValue(resourceFromSnapshots(snapshot));
    expect(settled()).toBe('A');
    snapshot.set({status: 'loading', value: 'A'});
    expect(settled()).toBeUndefined();
    snapshot.set({status: 'resolved', value: 'A'});
    expect(settled()).toBe('A');
  });
});
