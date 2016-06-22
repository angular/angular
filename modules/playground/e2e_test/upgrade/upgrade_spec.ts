import {verifyNoBrowserErrors} from "@angular/platform-browser/testing_e2e";

describe('ngUpgrade', function() {
  var URL = 'all/playground/src/upgrade/index.html';

  beforeEach(function() {
    browser.rootEl = 'body';
    browser.get(URL);
  });

  afterEach(function() {
    (<any>browser).useAllAngular2AppRoots();
    verifyNoBrowserErrors();
  });

  it('should bootstrap Angular 1 and Angular 2 apps together', function() {
    var ng1NameInput = element(by.css('input[ng-model]=name'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    var userSpan = element(by.css('user span'));
    expect(userSpan.getText()).toMatch('/World$/');
  });
});
