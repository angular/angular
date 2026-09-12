import * as webdriver from 'selenium-webdriver';

describe('Security E2E Tests', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

  it('sanitizes innerHTML', async () => {
    const interpolated = await driver.findElement(
      webdriver.By.className('e2e-inner-html-interpolated'),
    );
    expect(await interpolated.getText()).toContain(
      'Template <script>alert("0wned")</script> <b>Syntax</b>',
    );
    const bound = await driver.findElement(webdriver.By.className('e2e-inner-html-bound'));
    expect(await bound.getText()).toContain('Template Syntax');
    const bold = await driver.findElement(webdriver.By.css('.e2e-inner-html-bound b'));
    expect(await bold.getText()).toContain('Syntax');
  });

  it('escapes untrusted URLs', async () => {
    const untrustedUrl = await driver.findElement(webdriver.By.className('e2e-dangerous-url'));
    expect(await untrustedUrl.getAttribute('href')).toMatch(/^unsafe:javascript/);
  });

  it('binds trusted URLs', async () => {
    const trustedUrl = await driver.findElement(webdriver.By.className('e2e-trusted-url'));
    expect(await trustedUrl.getAttribute('href')).toMatch(/^javascript:alert/);
  });

  it('escapes untrusted resource URLs', async () => {
    const iframe = await driver.findElement(webdriver.By.className('e2e-iframe-untrusted-src'));
    expect(await iframe.getAttribute('src')).toBe('');
  });

  it('binds trusted resource URLs', async () => {
    const iframe = await driver.findElement(webdriver.By.className('e2e-iframe-trusted-src'));
    expect(await iframe.getAttribute('src')).toMatch(/^https:\/\/www\.youtube\.com\//);
  });
});
