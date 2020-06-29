import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('cli-hello-world-lazy-rollup App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('cli-hello-world-lazy-rollup app is running!');
  });

  it('should display lazy route', () => {
    browser.get('/lazy');
    expect(element(by.css('app-lazy p')).getText()).toEqual('lazy works!');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
