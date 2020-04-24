/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {promise} from 'selenium-webdriver';

import {verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

describe('async', () => {
  const URL = '/';

  beforeEach(() => browser.get(URL));

  it('should work with synchronous actions', () => {
    const increment = $('#increment');
    increment.$('.action').click();

    expect(increment.$('.val').getText()).toEqual('1');
  });

  it('should wait for asynchronous actions', () => {
    const timeout = $('#delayedIncrement');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.action').click();

    // whenStable should only be called when the async action finished,
    // so the count should be 1 at this point.
    expect(timeout.$('.val').getText()).toEqual('1');
  });

  it('should notice when asynchronous actions are cancelled', () => {
    const timeout = $('#delayedIncrement');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    browser.ignoreSynchronization = true;
    timeout.$('.action').click();

    timeout.$('.cancel').click();
    browser.ignoreSynchronization = false;

    // whenStable should be called since the async action is cancelled. The
    // count should still be 0;
    expect(timeout.$('.val').getText()).toEqual('0');
  });

  it('should wait for a series of asynchronous actions', () => {
    const timeout = $('#multiDelayedIncrements');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.action').click();

    // whenStable should only be called when all the async actions
    // finished, so the count should be 10 at this point.
    expect(timeout.$('.val').getText()).toEqual('10');
  });

  it('should wait via frameworkStabilizer', () => {
    const whenAllStable = (): promise.Promise<any> => {
      return browser.executeAsyncScript('window.frameworkStabilizers[0](arguments[0]);');
    };

    // This disables protractor's wait mechanism
    browser.ignoreSynchronization = true;

    const timeout = $('#multiDelayedIncrements');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.action').click();

    whenAllStable().then((didWork: any) => {
      // whenAllStable should only be called when all the async actions
      // finished, so the count should be 10 at this point.
      expect(timeout.$('.val').getText()).toEqual('10');
      expect(didWork).toBeTruthy();  // Work was done.
    });

    whenAllStable().then((didWork: any) => {
      // whenAllStable should be called immediately since nothing is pending.
      expect(didWork).toBeFalsy();  // No work was done.
      browser.ignoreSynchronization = false;
    });
  });

  afterEach(verifyNoBrowserErrors);
});
