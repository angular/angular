import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';

describe('async', () => {
  var URL = 'examples/src/async';

  beforeEach(() => browser.get(URL));

  it('should work with synchronous actions', () => {
    var increment = $('#increment');
    increment.$('.action').click();

    expect(increment.$('.val').getText()).toEqual('1');
  });

  it('should wait for asynchronous actions', () => {
    var timeout = $('#delayedIncrement');
    timeout.$('.action').click();

    // At this point, the async action is still pending, so the count should 
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    whenStable('async-app').then(() => {
      // whenStable should only be called when the async action finished,
      // so the count should be 1 at this point.
      expect(timeout.$('.val').getText()).toEqual('1');
    });
  });

  it('should notice when asynchronous actions are cancelled', () => {
    browser.get(URL);
    var timeout = $('#delayedIncrement');
    timeout.$('.action').click();

    // At this point, the async action is still pending, so the count should 
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.cancel').click()
    whenStable('async-app').then(() => {
      // whenStable should be called since the async action is cancelled. The
      // count should still be 0;
      expect(timeout.$('.val').getText()).toEqual('0');
    });
  });

  it('should wait for a series of asynchronous actions', () => {
    var timeout = $('#multiDelayedIncrements');
    timeout.$('.action').click();

    // At this point, the async action is still pending, so the count should 
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    whenStable('async-app').then(() => {
      // whenStable should only be called when the async action finished,
      // so the count should be 1 at this point.
      expect(timeout.$('.val').getText()).toEqual('10');
    });
  });

  afterEach(verifyNoBrowserErrors);
});

function whenStable(rootSelector) {
  return browser.executeAsyncScript(
    'var el = document.querySelector("' + rootSelector + '");' + 
    'window.getAngularTestability(el).whenStable(arguments[0]);');
};
