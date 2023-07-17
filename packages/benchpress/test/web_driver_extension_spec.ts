/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, Options, WebDriverExtension} from '../index';

(function() {
function createExtension(ids: any[], caps: any) {
  return new Promise<any>((res, rej) => {
    try {
      res(Injector
              .create({
                providers: [
                  ids.map((id) => ({provide: id, useValue: new MockExtension(id)})),
                  {provide: Options.CAPABILITIES, useValue: caps},
                  WebDriverExtension.provideFirstSupported(ids)
                ]
              })
              .get(WebDriverExtension));
    } catch (e) {
      rej(e);
    }
  });
}

describe('WebDriverExtension.provideFirstSupported', () => {
  it('should provide the extension that matches the capabilities', done => {
    createExtension(['m1', 'm2', 'm3'], {'browser': 'm2'}).then((m) => {
      expect(m.id).toEqual('m2');
      done();
    });
  });

  it('should throw if there is no match', done => {
    createExtension(['m1'], {'browser': 'm2'}).catch((err) => {
      expect(err != null).toBe(true);
      done();
    });
  });
});
})();

class MockExtension extends WebDriverExtension {
  constructor(public id: string) {
    super();
  }

  override supports(capabilities: {[key: string]: any}): boolean {
    return capabilities['browser'] === this.id;
  }
}
