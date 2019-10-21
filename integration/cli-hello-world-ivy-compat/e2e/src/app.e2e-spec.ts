import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('cli-hello-world-ivy-compat App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('cli-hello-world-ivy-compat app is running!');
  });

  it('the percent pipe should work', () => {
    page.navigateTo();
    expect(page.getPipeContent()).toEqual('100 % awesome');
  })

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
