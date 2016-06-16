import {verifyNoBrowserErrors} from "@angular/platform-browser/testing_e2e";

// TODO(i): reenable once we fix issue with exposing testability to protractor when using ngUpgrade
// https://github.com/angular/angular/issues/9407
xdescribe('ngUpgrade', function() {
  var URL = 'all/playground/src/upgrade/index.html';

  beforeEach(function() { browser.get(URL); });

  afterEach(verifyNoBrowserErrors);

  it('should bootstrap Angular 1 and Angular 2 apps together', function() {
    var ng1NameInput = element(by.css('input[ng-model]=name'));
    expect(ng1NameInput.getAttribute('value')).toEqual('World');

    var userSpan = element(by.css('user span'));
    expect(userSpan.getText()).toMatch('/World$/');
  });
});
