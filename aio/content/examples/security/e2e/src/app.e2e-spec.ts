import { browser, element, By } from 'protractor';

describe('Security E2E Tests', () => {
  beforeAll(() => browser.get(''));

  it('sanitizes innerHTML', () => {
    const interpolated = element(By.className('e2e-inner-html-interpolated'));
    expect(interpolated.getText())
        .toContain('Template <script>alert("0wned")</script> <b>Syntax</b>');
    const bound = element(By.className('e2e-inner-html-bound'));
    expect(bound.getText()).toContain('Template Syntax');
    const bold = element(By.css('.e2e-inner-html-bound b'));
    expect(bold.getText()).toContain('Syntax');
  });

  it('escapes untrusted URLs', () => {
    const untrustedUrl = element(By.className('e2e-dangerous-url'));
    expect(untrustedUrl.getAttribute('href')).toMatch(/^unsafe:javascript/);
  });

  it('binds trusted URLs', () => {
    const trustedUrl = element(By.className('e2e-trusted-url'));
    expect(trustedUrl.getAttribute('href')).toMatch(/^javascript:alert/);
  });

  it('escapes untrusted resource URLs', () => {
    const iframe = element(By.className('e2e-iframe-untrusted-src'));
    expect(iframe.getAttribute('src')).toBe('');
  });

  it('binds trusted resource URLs', () => {
    const iframe = element(By.className('e2e-iframe-trusted-src'));
    expect(iframe.getAttribute('src')).toMatch(/^https:\/\/www.youtube.com\//);
  });
});
