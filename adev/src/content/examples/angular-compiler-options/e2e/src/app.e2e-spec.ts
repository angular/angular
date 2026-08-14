import * as webdriver from 'selenium-webdriver';

describe('workspace-project App', () => {
  let driver: webdriver.WebDriver;

  beforeEach(async () => {
    await driver.get('');
  });

  // Add your e2e tests here

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await driver.manage().logs().get(webdriver.logging.Type.BROWSER);
    expect(logs).not.toContain(
      jasmine.objectContaining({
        level: webdriver.logging.Level.SEVERE,
      } as webdriver.logging.Entry),
    );
  });
});
