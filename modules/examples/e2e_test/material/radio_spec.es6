var testUtil = require('angular2/src/test_lib/e2e_util');

describe('md-radio-button', function () {
  var url = 'examples/src/material/radio/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(testUtil.verifyNoBrowserErrors);

  // Radio buttons are broken right now, see https://github.com/angular/angular/issues/1643
});
