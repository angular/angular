/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import '../../lib/extra/web-ext';

import {zoneSymbol} from '../../lib/common/utils';

const WEBEXT_METHODS = ['addListener', 'removeListener', 'hasListener'];

/**
 * Test browser.storage monkey patch.
 */
describe('Web Extension', () => {
  let browser: any;

  beforeAll(() => {
    const patchWebExt = (Zone as any)[(Zone as any).__symbol__('webext')];

    browser = {
      storage: {
        onChanged: jasmine.createSpyObj('onChanged', WEBEXT_METHODS),
        onWhatever: jasmine.createSpyObj('onWhatever', WEBEXT_METHODS),
      },
    };

    patchWebExt(browser);

    console.log(browser);
  });

  describe('Storage', () => {
    it('patches onChanged as macroTask', (done) => {
      // const zone = Zone.current.fork({name: 'webext'});
      const onChanged = browser.storage.onChanged;
      console.log(onChanged);
      expect(onChanged[zoneSymbol('addEventListener')]).toBeTruthy();
    });
    xit('patches onChanged as macroTask', (done) => {
      const zone = Zone.current.fork({name: 'webext'});

      browser.storage.onChanged.addListener.and.callFake(() => {
        expect(Zone.current.name).toBe(zone.name);
        done();
      });

      browser.storage.onChanged.addListener(() => {});

      // zone.run(() => {
      //   browser.storage.onChanged.addListener();
      // });
    });
  });
});
