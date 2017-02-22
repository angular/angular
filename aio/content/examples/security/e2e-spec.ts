'use strict'; // necessary for es6 output in node 

import { browser, element, By } from 'protractor';

describe('Security E2E Tests', () => {
  beforeAll(() => browser.get(''));

  it('sanitizes innerHTML', () => {
    let interpolated = element(By.className('e2e-inner-html-interpolated'));
    expect(interpolated.getText())
        .toContain('Template <script>alert("0wned")</script> <b>Syntax</b>');
    let bound = element(By.className('e2e-inner-html-bound'));
    expect(bound.getText()).toContain('Template alert("0wned") Syntax');
    let bold = element(By.css('.e2e-inner-html-bound b'));
    expect(bold.getText()).toContain('Syntax');
  });

  it('escapes untrusted URLs', () => {
    let untrustedUrl = element(By.className('e2e-dangerous-url'));
    expect(untrustedUrl.getAttribute('href')).toMatch(/^unsafe:javascript/);
  });

  it('binds trusted URLs', () => {
    let trustedUrl = element(By.className('e2e-trusted-url'));
    expect(trustedUrl.getAttribute('href')).toMatch(/^javascript:alert/);
  });

  it('escapes untrusted resource URLs', () => {
    let iframe = element(By.className('e2e-iframe-untrusted-src'));
    expect(iframe.getAttribute('src')).toBe('');
  });

  it('binds trusted resource URLs', () => {
    let iframe = element(By.className('e2e-iframe-trusted-src'));
    expect(iframe.getAttribute('src')).toMatch(/^https:\/\/www.youtube.com\//);
  });
});
