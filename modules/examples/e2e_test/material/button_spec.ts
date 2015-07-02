import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';

describe('md-button', function() {
  var url = 'examples/src/material/button/index.html';

  beforeEach(() => { browser.get(url); });
  afterEach(verifyNoBrowserErrors);

  // Buttons are broken right now, see https://github.com/angular/angular/issues/1602
});
