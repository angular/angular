import {browser, element, by} from 'protractor';

describe('Resolution-modifiers-example', () => {
  beforeAll(() => browser.get(''));

  it('shows basic flower emoji', async () => {
    expect(await element.all(by.css('p')).get(0).getText()).toContain('🌸');
  });

  it('shows basic leaf emoji', async () => {
    expect(await element.all(by.css('p')).get(1).getText()).toContain('🌿');
  });

  it('shows tulip in host child', async () => {
    expect(await element.all(by.css('p')).get(9).getText()).toContain('🌷');
  });
});
