/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {browser, by, element} from 'protractor';
import {verifyNoBrowserErrors} from '../../../../../test-utils';

// Declare the global "window" and "document" constant since we don't want to add the "dom"
// TypeScript lib for the e2e specs that execute code in the browser and reference such
// global constants.
declare const window: any;
declare const document: any;

describe('testability example', () => {
  afterEach(verifyNoBrowserErrors);

  describe('using task tracking', () => {
    const URL = '/testability/whenStable/';

    it('times out with a list of tasks', done => {
      browser.get(URL);
      browser.ignoreSynchronization = true;

      // Script that runs in the browser and calls whenStable with a timeout.
      let waitWithResultScript = function(done: any) {
        let rootEl = document.querySelector('example-app');
        let testability = window.getAngularTestability(rootEl);
        testability.whenStable((didWork: boolean, tasks: any) => {
          done(tasks);
        }, 1000);
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

    afterAll(() => {
      browser.ignoreSynchronization = false;
    });
  });
});
