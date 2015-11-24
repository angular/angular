import { verifyNoBrowserErrors } from 'angular2/src/testing/e2e_util';
function waitForElement(selector) {
    var EC = protractor.ExpectedConditions;
    // Waits for the element with id 'abc' to be present on the dom.
    browser.wait(EC.presenceOf($(selector)), 20000);
}
describe('reuse example app', function () {
    afterEach(verifyNoBrowserErrors);
    var URL = 'angular2/examples/router/ts/can_activate/';
    it('should navigate to user 1', function () {
        browser.get(URL);
        waitForElement('home-cmp');
        element(by.css('#user-1-link')).click();
        waitForElement('control-panel-cmp');
        expect(browser.getCurrentUrl()).toMatch(/\/user-settings\/1$/);
        expect(element(by.css('control-panel-cmp')).getText()).toContain('Settings');
    });
    it('should not navigate to user 2', function () {
        browser.get(URL);
        waitForElement('home-cmp');
        element(by.css('#user-2-link')).click();
        waitForElement('home-cmp');
        expect(element(by.css('home-cmp')).getText()).toContain('Welcome Home!');
    });
});
