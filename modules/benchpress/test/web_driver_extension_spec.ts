/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AsyncTestCompleter, afterEach, beforeEach, ddescribe, describe, expect, iit, inject, it, xit} from '@angular/core/testing/testing_internal';
import {StringWrapper, isPresent} from '@angular/facade/src/lang';
import {Options, ReflectiveInjector, WebDriverExtension} from 'benchpress/common';

export function main() {
  function createExtension(ids: any[], caps) {
    return new Promise<any>((res, rej) => {
      try {
        res(ReflectiveInjector
                .resolveAndCreate([
                  ids.map((id) => { return {provide: id, useValue: new MockExtension(id)}; }),
                  {provide: Options.CAPABILITIES, useValue: caps}, WebDriverExtension.bindTo(ids)
                ])
                .get(WebDriverExtension));
      } catch (e) {
        rej(e);
      }
    });
  }

  describe('WebDriverExtension.bindTo', () => {

    it('should bind the extension that matches the capabilities',
       inject([AsyncTestCompleter], (async) => {
         createExtension(['m1', 'm2', 'm3'], {'browser': 'm2'}).then((m) => {
           expect(m.id).toEqual('m2');
           async.done();
         });
       }));

    it('should throw if there is no match', inject([AsyncTestCompleter], (async) => {
         createExtension(['m1'], {'browser': 'm2'}).catch((err) => {
           expect(isPresent(err)).toBe(true);
           async.done();
         });
       }));
  });
}

class MockExtension extends WebDriverExtension {
  id: string;

  constructor(id) {
    super();
    this.id = id;
  }

  supports(capabilities: {[key: string]: any}): boolean {
    return StringWrapper.equals(capabilities['browser'], this.id);
  }
}
