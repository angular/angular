import { browser, element, by, ExpectedConditions } from 'protractor';

describe('Lazy Loading AngularJS Tests', () => {
  const pageElements = {
    homePageHref: element(by.cssContainingText('app-root nav a', 'Home')),
    homePageParagraph: element(by.css('app-root app-home p')),
    ajsUsersPageHref: element(by.cssContainingText('app-root nav a', 'Users')),
    ajsUsersPageParagraph: element(by.css('app-root app-angular-js div p')),
    notFoundPageHref: element(by.cssContainingText('app-root nav a', '404 Page')),
    notFoundPageParagraph: element(by.css('app-root app-app404 p')),
  };

  beforeAll(async () => {
    await browser.get('/');
  });

  it('should display \'Angular Home\' when visiting the home page', async () => {
    await pageElements.homePageHref.click();

    const paragraphText = await pageElements.homePageParagraph.getText();

    expect(paragraphText).toEqual('Angular Home');
  });

  it('should display \'Users Page\' page when visiting the AngularJS page at /users', async () => {
    await pageElements.ajsUsersPageHref.click();
    await loadAngularJS();

    const paragraphText = await pageElements.ajsUsersPageParagraph.getText();

    expect(paragraphText).toEqual('Users Page');
  });

  it('should display \'Angular 404\' when visiting an invalid URL', async () => {
    await pageElements.notFoundPageHref.click();

    const paragraphText = await pageElements.notFoundPageParagraph.getText();

    expect(paragraphText).toEqual('Angular 404');
  });

  // Workaround for https://github.com/angular/protractor/issues/4724
  async function loadAngularJS() {
    // Abort if `resumeBootstrap` has already occured
    if (await browser.executeScript(`return '__TESTABILITY__NG1_APP_ROOT_INJECTOR__' in window;`)) {
        return;
    }

    // Might have to re-insert the 'NG_DEFER_BOOTSTRAP!' if the name has been changed since protractor loaded the page
    if (!await browser.executeScript('window.name.includes(\'NG_DEFER_BOOTSTRAP!\')')) {
        await browser.executeScript('window.name = \'NG_DEFER_BOOTSTRAP!\' + name');
    }

    // Wait for the AngularJS bundle to download and initialize
    await browser.wait(ExpectedConditions.presenceOf(element(by.css('app-root app-angular-js'))), 5000, 'AngularJS app');

    // Run the protractor pre-bootstrap logic and resumeBootstrap
    // Based on https://github.com/angular/protractor/blob/5.3.0/lib/browser.ts#L950-L969
    {
        const moduleNames = [];
        for (const {name, script, args} of browser.mockModules_) {
            moduleNames.push(name);
            await browser.executeScriptWithDescription(script, 'add mock module ' + name, ...args);
        }

        await browser.executeScriptWithDescription(
            // TODO: must manually assign __TESTABILITY__NG1_APP_ROOT_INJECTOR__ (https://github.com/angular/angular/issues/22723)
            `window.__TESTABILITY__NG1_APP_ROOT_INJECTOR__ = angular.resumeBootstrap(arguments[0]) `
            + `|| angular.element('app-angular-js').injector();`,
            'resume bootstrap',
            moduleNames
        );
    }

    // Wait for the initial AngularJS page to finish loading
    await browser.waitForAngular();
  }
});

