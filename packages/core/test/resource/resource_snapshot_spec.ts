/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ResourceSnapshot} from '../../src/resource/api';
import {resourceFromSnapshots} from '../../src/resource/from_snapshots';
import {resource} from '../../src/resource/resource';
import {signal} from '../../src/render3/reactivity/signal';
import {Injector} from '../../src/di/injector';
import {ApplicationRef} from '../../src/application/application_ref';
import {TestBed} from '../../testing/src/test_bed';

describe('resource snapshots', () => {
  describe('resourceFromSnapshots', () => {
    it('should represent all stages of a resource', () => {
      const source = signal<ResourceSnapshot<string>>({status: 'idle', value: ''});
      const res = resourceFromSnapshots(source);

      expect(res.status()).toEqual('idle');
      expect(res.value()).toEqual('');
      expect(res.isLoading()).toBeFalse();
      expect(res.hasValue()).toBeTrue();

      source.set({status: 'loading', value: 'alpha'});
      expect(res.status()).toEqual('loading');
      expect(res.value()).toEqual('alpha');
      expect(res.isLoading()).toBeTrue();
      expect(res.hasValue()).toBeTrue();

      source.set({status: 'resolved', value: 'beta'});
      expect(res.status()).toEqual('resolved');
      expect(res.value()).toEqual('beta');
      expect(res.isLoading()).toBeFalse();
      expect(res.hasValue()).toBeTrue();

      source.set({status: 'reloading', value: 'gamma'});
      expect(res.status()).toEqual('reloading');
      expect(res.value()).toEqual('gamma');
      expect(res.isLoading()).toBeTrue();
      expect(res.hasValue()).toBeTrue();

      source.set({status: 'local', value: 'delta'});
      expect(res.status()).toEqual('local');
      expect(res.value()).toEqual('delta');
      expect(res.isLoading()).toBeFalse();
      expect(res.hasValue()).toBeTrue();

      const error = new Error();
      source.set({status: 'error', error});
      expect(res.status()).toEqual('error');
      expect(res.error()).toBe(error);
      expect(res.isLoading()).toBeFalse();
      expect(res.hasValue()).toBeFalse();
      expect(res.value).toThrowMatching((err: Error) => err.cause === error);
    });

    it('should return `false` for hasValue() when the value is undefined', () => {
      const source = signal<ResourceSnapshot<string | undefined>>({
        status: 'loading',
        value: undefined,
      });
      const res = resourceFromSnapshots(source);

      expect(res.hasValue()).toBeFalse();
    });

    it('should memoize the snapshot function', () => {
      let readCount = 0;
      function source(): ResourceSnapshot<string> {
        readCount++;
        return {
          status: 'resolved',
          value: 'test',
        };
      }

      const res = resourceFromSnapshots(source);

      // Access multiple computeds that depend on the snapshot.
      res.status();
      res.value();
      res.error();

      // The `source` function should only have been called once.
      expect(readCount).toBe(1);
    });
  });

  describe('Resource.snapshot', () => {
    it('should represent idle, loading and resolved states', async () => {
      const injector = TestBed.inject(Injector);
      const params = signal<number | undefined>(undefined);
      const res = resource({
        params,
        loader: () => Promise.resolve('test'),
        injector,
      });

      expect(res.snapshot()).toEqual({status: 'idle', value: undefined});

      params.set(3);
      expect(res.snapshot()).toEqual({status: 'loading', value: undefined});

      await injector.get(ApplicationRef).whenStable();
      expect(res.snapshot()).toEqual({status: 'resolved', value: 'test'});
    });

    it('should represent the error state', async () => {
      const injector = TestBed.inject(Injector);
      const res = resource({
        loader: () => {
          throw new Error('test');
        },
        injector,
      });

      expect(res.snapshot()).toEqual({status: 'loading', value: undefined});

      await injector.get(ApplicationRef).whenStable();
      const snap = res.snapshot();
      if (snap.status !== 'error') {
        return fail(`Expected resource to be in error state`);
      }
      expect(res.error).toBeDefined();
    });
  });
});
