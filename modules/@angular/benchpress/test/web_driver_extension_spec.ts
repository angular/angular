/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, describe, expect, inject, it} from '@angular/core/testing/testing_internal';

import {Options, ReflectiveInjector, WebDriverExtension} from '../index';
import {StringWrapper, isPresent} from '../src/facade/lang';

export function main() {
  function createExtension(ids: any[], caps: any) {
    return new Promise<any>((res, rej) => {
      try {
        res(ReflectiveInjector
                .resolveAndCreate([
                  ids.map((id) => { return {provide: id, useValue: new MockExtension(id)}; }),
                  {provide: Options.CAPABILITIES, useValue: caps},
                  WebDriverExtension.provideFirstSupported(ids)
                ])
                .get(WebDriverExtension));
      } catch (e) {
        rej(e);
      }
    });
  }

  describe('WebDriverExtension.provideFirstSupported', () => {

    it('should provide the extension that matches the capabilities',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(['m1', 'm2', 'm3'], {'browser': 'm2'}).then((m) => {
           expect(m.id).toEqual('m2');
           async.done();
         });
       }));

    it('should throw if there is no match',
       inject([AsyncTestCompleter], (async: AsyncTestCompleter) => {
         createExtension(['m1'], {'browser': 'm2'}).catch((err) => {
           expect(isPresent(err)).toBe(true);
           async.done();
         });
       }));
  });
}

class MockExtension extends WebDriverExtension {
  constructor(public id: string) { super(); }

  supports(capabilities: {[key: string]: any}): boolean {
    return StringWrapper.equals(capabilities['browser'], this.id);
  }
}
