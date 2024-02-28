import {browser, logging} from 'protractor';

import {AppPage} from './app.po';

describe('cli-signal-inputs App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should show greet message', () => {
    page.navigateTo();
    expect(page.getGreetText()).toEqual('John - transformed-fallback');
    expect(page.getUnboundLastNameGreetText()).toEqual('John - initial-unset');
  });

  it('should update greet message when last name is set', () => {
    page.navigateTo();
    expect(page.getGreetText()).toEqual('John - transformed-fallback');
    page.setLastName();
    expect(page.getGreetText()).toEqual('John - ng-Doe');
    page.unsetLastName();
    expect(page.getGreetText()).toEqual('John - transformed-fallback');
  });

  it('should properly query via `viewChildren`', () => {
    page.navigateTo();
    expect(page.getGreetCount()).toEqual('Greet component count: 2');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry),
    );
  });
});
