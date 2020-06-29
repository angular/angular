import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('cli-hello-world-ivy-minimal App', () => {
  // Ivy renderComponent apps fail on protractor when waiting for Angular.
  browser.waitForAngularEnabled(false);
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to cli-hello-world-ivy-minimal!');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
