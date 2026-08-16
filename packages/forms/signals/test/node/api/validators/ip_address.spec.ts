/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {form, ipAddress, ipAddressError} from '../../../../public_api';

describe('ipAddress validator', () => {
  it('returns ipAddress error when value is not a valid IP address', () => {
    const cat = signal({chipIp: '256.256.256.256'});
    const f = form(
      cat,
      (p) => {
        ipAddress(p.chipIp);
      },
      {injector: TestBed.inject(Injector)},
    );

    expect(f.chipIp().errors()).toEqual([ipAddressError({fieldTree: f.chipIp})]);
    f.chipIp().value.set('192.168.1.1');
    expect(f.chipIp().errors()).toEqual([]);
  });

  describe('custom errors', () => {
    it('returns custom errors when provided', () => {
      const cat = signal({chipIp: '256.256.256.256', env: 'prod'});
      const f = form(
        cat,
        (p) => {
          ipAddress(p.chipIp, {
            error: (ctx) => ({kind: `ip-${ctx.valueOf(p.env)}`}),
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.chipIp().errors()).toEqual([{kind: 'ip-prod', fieldTree: f.chipIp}]);
      f.chipIp().value.set('192.168.1.1');
      expect(f.chipIp().errors()).toEqual([]);
    });

    it('supports custom error messages', () => {
      const cat = signal({chipIp: 'invalid-ip'});
      const f = form(
        cat,
        (p) => {
          ipAddress(p.chipIp, {
            message: 'ip error!!',
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.chipIp().errors()).toEqual([
        ipAddressError({message: 'ip error!!', fieldTree: f.chipIp}),
      ]);
      f.chipIp().value.set('127.0.0.1');
      expect(f.chipIp().errors()).toEqual([]);
    });
  });

  describe('dynamic rules', () => {
    it('supports custom condition via when', () => {
      const cat = signal({chipIp: 'invalid-ip', enabled: false});
      const f = form(
        cat,
        (p) => {
          ipAddress(p.chipIp, {
            when({valueOf}) {
              return valueOf(p.enabled);
            },
          });
        },
        {injector: TestBed.inject(Injector)},
      );

      expect(f.chipIp().errors()).toEqual([]);
      f.enabled().value.set(true);
      expect(f.chipIp().errors()).toEqual([ipAddressError({fieldTree: f.chipIp})]);
    });
  });
});
