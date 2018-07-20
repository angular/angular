/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../../_common/e2e_util';

describe('testability example', () => {
  afterEach(verifyNoBrowserErrors);

  describe('using task tracking', () => {
    const URL = '/core/testability/ts/whenStable/';

    it('times out with a list of tasks', done => {
      browser.get(URL);
      browser.ignoreSynchronization = true;

      // Script that runs in the browser and calls whenStable with a timeout.
      let waitWithResultScript = function(done: any) {
        let rootEl = document.querySelector('example-app');
        let testability = (window as any).getAngularTestability(rootEl);
        testability.whenStable((didWork: boolean, tasks: any) => { done(tasks); }, 1000);
      };

      element(by.css('.start-button')).click();

      browser.driver.executeAsyncScript(waitWithResultScript).then((result: any[]) => {
        let pendingTask = result[0];
        expect(pendingTask.data.delay).toEqual(5000);
        expect(pendingTask.source).toEqual('setTimeout');
        expect(element(by.css('.status')).getText()).not.toContain('done');
        done();
      });
    });

    afterAll(() => { browser.ignoreSynchronization = false; });
  });
});
