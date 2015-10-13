import {verifyNoBrowserErrors} from 'angular2/src/testing/e2e_util';

describe('async', () => {
  var URL = 'examples/src/async/index.html';

  beforeEach(() => browser.get(URL));

  it('should work with synchronous actions', () => {
    var increment = $('#increment');
    increment.$('.action').click();

    expect(increment.$('.val').getText()).toEqual('1');
  });

  it('should wait for asynchronous actions', () => {
    var timeout = $('#delayedIncrement');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.action').click();

    // whenStable should only be called when the async action finished,
    // so the count should be 1 at this point.
    expect(timeout.$('.val').getText()).toEqual('1');
  });

  it('should notice when asynchronous actions are cancelled', () => {
    var timeout = $('#delayedIncrement');

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
    var timeout = $('#multiDelayedIncrements');

    // At this point, the async action is still pending, so the count should
    // still be 0.
    expect(timeout.$('.val').getText()).toEqual('0');

    timeout.$('.action').click();

    // whenStable should only be called when all the async actions
    // finished, so the count should be 10 at this point.
    expect(timeout.$('.val').getText()).toEqual('10');
  });

  afterEach(verifyNoBrowserErrors);
});
