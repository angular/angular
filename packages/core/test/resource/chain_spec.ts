/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Injector, ResourceParamsStatus, runInInjectionContext, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { timeout } from '../../../private/testing';
import { chain, ResourceDependencyError } from '../../src/resource/chain';
import { resource } from '../../src/resource/resource';
import { promiseWithResolvers } from '../../src/util/promise_with_resolvers';

function throwStatusAndErrors<T>(source: () => T | ResourceParamsStatus | Error): () => T {
  return () => {
    const value = source();
    if (value instanceof Error) throw value;
    if (value === ResourceParamsStatus.IDLE || value === ResourceParamsStatus.LOADING) throw value;
    return value as T;
  };
}

describe('chain', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = TestBed.inject(Injector);
  });

  function run(fn: () => void | Promise<void>) {
    return runInInjectionContext(injector, fn);
  }

  it('should return idle if any resource is idle', () =>
    run(() => {
      const s1 = signal(1);
      const s2 = signal<number | undefined>(undefined);

      const res1 = resource({params: s1, loader: async () => 1});
      const res2 = resource({params: s2, loader: async () => 2});

      // res2 is idle because s2 is undefined
      expect(() => chain(res1, res2)).toThrow(ResourceParamsStatus.IDLE);
    }));

  it('should return error if any resource is error', async () =>
    run(async () => {
      const s1 = signal(1);
      const s2 = signal(2);

      const res1 = resource({
        params: s1,
        loader: async () => {
          throw new Error('fail');
        },
      });
      const res2 = resource({params: s2, loader: async () => 2});

      // Wait for res1 to fail
      await new Promise((resolve) => setTimeout(resolve));

      expect(() => chain(res1, res2)).toThrow(jasmine.any(ResourceDependencyError));
    }));

  it('should check idle before error', async () =>
    run(async () => {
      const s1 = signal<number | undefined>(undefined);
      const s2 = signal(1);

      const res1 = resource({params: s1, loader: async () => 1});
      const res2 = resource({
        params: s2,
        loader: async () => {
          throw new Error('fail');
        },
      });

      await new Promise((resolve) => setTimeout(resolve));

      // res1 is idle, res2 is error, chain should be idle.
      expect(() => chain(res1, res2)).toThrow(ResourceParamsStatus.IDLE);
    }));

  it('should return loading if any resource is loading', () =>
    run(() => {
      const s1 = signal(1);
      const {promise, resolve} = promiseWithResolvers<void>();
      const res1 = resource({params: s1, loader: () => promise});

      expect(() => chain(res1)).toThrow(ResourceParamsStatus.LOADING);
      resolve();
    }));

  it('should return values when all resolved', async () =>
    run(async () => {
      const res1 = resource({params: () => 1, loader: async () => 1});
      const res2 = resource({params: () => 1, loader: async () => 2});

      await new Promise((resolve) => setTimeout(resolve));

      const values = chain(res1, res2);
      expect(values()).toEqual([1, 2]);
    }));

  it('should not allow stale values by default', async () =>
    run(async () => {
      const s = signal(1);
      const res = resource({
        params: s,
        loader: async (ctx: {params: number}) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return ctx.params;
        },
      });

      // Initial load
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(res.value()).toBe(1);
      expect(res.status()).toBe('resolved');

      // Trigger reload
      res.reload();
      expect(res.status()).toBe('reloading');
      expect(res.value()).toBe(1);

      expect(() => chain(res)).toThrow(ResourceParamsStatus.LOADING);
    }));

  it('should allow stale values if configured', async () =>
    run(async () => {
      const s = signal(1);
      const res = resource({
        params: s,
        loader: async (ctx: {params: number}) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return ctx.params;
        },
      });

      // Initial load
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(res.value()).toBe(1);
      expect(res.status()).toBe('resolved');

      // Trigger reload
      res.reload();
      expect(res.status()).toBe('reloading');
      expect(res.value()).toBe(1);

      const values = chain(res, {allowStale: true});
      expect(values()).toEqual([1]);
    }));

 it('should chain resources together', async () =>
   run(async () => {
     const params1 = signal<number | ResourceParamsStatus | Error>(ResourceParamsStatus.IDLE);
     const loader2Spy = jasmine.createSpy('loader2');
     const res1 = resource({
       params: throwStatusAndErrors<number>(params1),
       loader: async ({params}) => params,
     });
     const res2 = resource({
       params: () => {
         const values = chain(res1);
         return (values()[0] ?? 0) * 2;
       },
       loader: async ({params}) => {
         loader2Spy();
         await timeout(1);
         return params;
       },
     });
     await timeout(1);

     // Idle because res1 is idle
     expect(res2.status()).toBe('idle');
     expect(loader2Spy).not.toHaveBeenCalled();

     params1.set(ResourceParamsStatus.LOADING);
     await timeout(1);

     // Loading because res1 is loading, loader not actually run yet
     expect(res2.status()).toBe('loading');
     expect(loader2Spy).not.toHaveBeenCalled();

     params1.set(1);
     await timeout(1);

     // Loading (running res2 loader).
     expect(res2.status()).toBe('loading');
     expect(loader2Spy).toHaveBeenCalled();

     await timeout(2);

     // Resolved.
     expect(res2.status()).toBe('resolved');
     expect(res2.value()).toBe(2);

     const e = Error('fail');
     params1.set(e);
     await timeout(1);

     // Error due to error in res1.
     expect(res2.status()).toBe('error');
     expect(res2.error()).toBeInstanceOf(ResourceDependencyError);
     expect(res2.error()?.cause).toBe(e);
   }));
});
