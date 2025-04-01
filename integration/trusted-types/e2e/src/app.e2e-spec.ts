import {browser, logging} from 'protractor';
import {AppPage} from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('trusted-types app is running!');
  });

  it('should sanitize and inject bound innerHTML', async () => {
    await page.navigateTo();
    expect(await page.getBoundHtmlText()).toEqual('Hello from bound HTML');
    expect(await page.boundHtmlIframeIsPresent()).toBe(false);
  });

  it('should directly inject SafeHtml bound to innerHTML', async () => {
    await page.navigateTo();
    expect(await page.getBoundSafeHtmlText()).toEqual('Hello from bound SafeHtml');
    expect(await page.boundSafeHtmlIframeIsPresent()).toBe(true);
  });

  it('should replace element with outerHTML contents', async () => {
    await page.navigateTo();
    expect(await page.getOuterHTMLText()).toBe('Hello from second outerHTML');
  });

  it('should load iframe', async () => {
    await page.navigateTo();
    await browser.waitForAngularEnabled(false);
    await page.switchToIframe();
    expect(await page.getHeaderText()).toEqual('Hello from iframe');
  });

  it('should load embed', async () => {
    await page.navigateTo();
    await browser.waitForAngularEnabled(false);
    await page.switchToEmbed();
    expect(await page.getHeaderText()).toEqual('Hello from embed');
  });

  it('should load object', async () => {
    await page.navigateTo();
    await browser.waitForAngularEnabled(false);
    await page.switchToObject();
    expect(await page.getHeaderText()).toEqual('Hello from object');
  });

  afterEach(async () => {
    // Re-enable waiting for Angular in case we disabled it to navigate to a
    // non-Angular page
    await browser.waitForAngularEnabled(true);

    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: logging.Level.SEVERE,
      } as logging.Entry),
    );
  });
});
