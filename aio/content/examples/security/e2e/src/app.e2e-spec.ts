import { browser, element, By } from 'protractor';

describe('Security E2E Tests', () => {
  beforeAll(() => browser.get(''));

  it('sanitizes innerHTML', async () => {
    const interpolated = element(By.className('e2e-inner-html-interpolated'));
    expect(await interpolated.getText())
        .toContain('Template <script>alert("0wned")</script> <b>Syntax</b>');
    const bound = element(By.className('e2e-inner-html-bound'));
    expect(await bound.getText()).toContain('Template Syntax');
    const bold = element(By.css('.e2e-inner-html-bound b'));
    expect(await bold.getText()).toContain('Syntax');
  });

  it('escapes untrusted URLs', async () => {
    const untrustedUrl = element(By.className('e2e-dangerous-url'));
    expect(await untrustedUrl.getAttribute('href')).toMatch(/^unsafe:javascript/);
  });

  it('binds trusted URLs', async () => {
    const trustedUrl = element(By.className('e2e-trusted-url'));
    expect(await trustedUrl.getAttribute('href')).toMatch(/^javascript:alert/);
  });

  it('escapes untrusted resource URLs', async () => {
    const iframe = element(By.className('e2e-iframe-untrusted-src'));
    expect(await iframe.getAttribute('src')).toBe('');
  });

  it('binds trusted resource URLs', async () => {
    const iframe = element(By.className('e2e-iframe-trusted-src'));
    expect(await iframe.getAttribute('src')).toMatch(/^https:\/\/www.youtube.com\//);
  });
});
