import { AppPage } from './app.po';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser.
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    const errorLogs = logs.filter(({level}) => level === logging.Level.SEVERE);
    expect(errorLogs).toEqual([]);
  });

  it('should display welcome message', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toBe('cli-elements-universal app is running!');
  });
});
