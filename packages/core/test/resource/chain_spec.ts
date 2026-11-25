/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ApplicationRef,
  Injector,
  ResourceDependencyError,
  resourceFromSnapshots,
  ResourceParamsStatus,
  signal,
  type ResourceSnapshot,
} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {timeout} from '@angular/private/testing';
import {paramsContext, resource, ResourceValueError} from '../../src/resource/resource';

describe('chain', () => {
  it('should throw idle if resource is idle', () => {
    const state = signal<ResourceSnapshot<number>>({status: 'idle', value: 0});
    const res = resourceFromSnapshots(state);
    expect(() => paramsContext.chain(res)).toThrow(ResourceParamsStatus.IDLE);
  });

  it('should throw loading if resource is loading', () => {
    const state = signal<ResourceSnapshot<number>>({status: 'loading', value: 0});
    const res = resourceFromSnapshots(state);
    expect(() => paramsContext.chain(res)).toThrow(ResourceParamsStatus.LOADING);
  });

  it('should throw loading if resource is reloading', () => {
    const state = signal<ResourceSnapshot<number>>({status: 'reloading', value: 2});
    const res = resourceFromSnapshots(state);
    expect(() => paramsContext.chain(res)).toThrow(ResourceParamsStatus.LOADING);
  });

  it('should throw dependency error if resource is error', () => {
    const state = signal<ResourceSnapshot<number>>({status: 'error', error: new Error('fail')});
    const res = resourceFromSnapshots(state);
    expect(() => paramsContext.chain(res)).toThrow(jasmine.any(ResourceDependencyError));
  });

  it('should return value when resolved', () => {
    const state = signal<ResourceSnapshot<number>>({status: 'resolved', value: 2});
    const res = resourceFromSnapshots(state);
    expect(paramsContext.chain(res)).toEqual(2);
  });

  it('should chain resources together', async () => {
    const state = signal<ResourceSnapshot<number>>({status: 'idle', value: 0});
    const res1 = resourceFromSnapshots(state);
    const loaderSpy = jasmine.createSpy('loader');
    const res2 = resource({
      params: () => paramsContext.chain(res1) * 2,
      loader: async ({params}) => {
        loaderSpy();
        return params;
      },
      injector: TestBed.inject(Injector),
    });

    // Idle because res1 is idle
    expect(res2.status()).toBe('idle');
    expect(loaderSpy).not.toHaveBeenCalled();

    state.set({status: 'loading', value: 0});
    TestBed.tick();

    // Loading because res1 is loading, res2 loader not run yet.
    expect(res2.status()).toBe('loading');
    expect(loaderSpy).not.toHaveBeenCalled();

    state.set({status: 'resolved', value: 2});
    TestBed.tick();

    // Loading because res2 loader is running.
    expect(res2.status()).toBe('loading');
    expect(loaderSpy).toHaveBeenCalled();

    await timeout();

    // Resolved.
    expect(res2.status()).toBe('resolved');
    expect(res2.value()).toBe(4);

    const error = Error('fail');
    state.set({status: 'error', error});
    TestBed.tick();

    // Error due to error in res1.
    expect(res2.status()).toBe('error');
    expect(res2.error()).toBeInstanceOf(ResourceDependencyError);
    expect(res2.error()?.cause).toBe(error);
  });

  it('should not transition to idle or throw in hasValue/snapshot when reload() is called in dependency error state', async () => {
    let shouldFail = true;
    const loaderSpy = jasmine.createSpy('ordersLoader');
    const user = resource({
      loader: async (): Promise<{id: string}> => {
        if (shouldFail) {
          throw new Error('backend down');
        }
        return {id: 'u1'};
      },
      injector: TestBed.inject(Injector),
    });
    const orders = resource({
      params: ({chain}) => chain(user)!.id,
      loader: async ({params}) => {
        loaderSpy(params);
        return `orders for ${params}`;
      },
      defaultValue: 'default orders',
      injector: TestBed.inject(Injector),
    });

    await TestBed.inject(ApplicationRef).whenStable();

    // Before reload()
    expect(orders.status()).toBe('error');
    expect(orders.error()).toBeInstanceOf(ResourceDependencyError);
    expect(orders.hasValue()).toBeFalse();
    expect(orders.snapshot()).toEqual({
      status: 'error',
      error: orders.error()!,
    });
    expect(() => orders.value()).toThrowMatching((e: any) => e instanceof ResourceValueError);

    // Reloading a resource whose params failed should return false and preserve error state
    expect(orders.reload()).toBeFalse();
    expect(loaderSpy).not.toHaveBeenCalled();

    // After reload()
    expect(orders.status()).toBe('error');
    expect(orders.error()).toBeInstanceOf(ResourceDependencyError);
    expect(orders.hasValue()).toBeFalse();
    expect(orders.snapshot()).toEqual({
      status: 'error',
      error: orders.error()!,
    });
    expect(() => orders.value()).toThrowMatching((e: any) => e instanceof ResourceValueError);

    // Recovers once the upstream resource reloads successfully
    shouldFail = false;
    expect(user.reload()).toBeTrue();
    await TestBed.inject(ApplicationRef).whenStable();

    expect(orders.status()).toBe('resolved');
    expect(orders.error()).toBeUndefined();
    expect(orders.hasValue()).toBeTrue();
    expect(orders.value()).toBe('orders for u1');
    expect(loaderSpy).toHaveBeenCalledOnceWith('u1');
  });
});
