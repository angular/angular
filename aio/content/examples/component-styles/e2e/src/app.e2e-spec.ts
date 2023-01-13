import { browser, element, by } from 'protractor';

describe('Component Style Tests', () => {

  beforeAll(() => browser.get(''));

  it('scopes component styles to component view', async () => {
    const componentH1 = element(by.css('app-root > h1'));
    const externalH1 = element(by.css('body > h1'));

    // Note: sometimes webdriver returns the fontWeight as "normal",
    // other times as "400", both of which are equal in CSS terms.
    expect(await componentH1.getCssValue('fontWeight')).toMatch(/normal|400/);
    expect(await externalH1.getCssValue('fontWeight')).not.toMatch(/normal|400/);
  });

  it('styles both view and content children with /deep/', async () => {
    const viewH3 = element(by.css('app-hero-team h3'));
    const contentH3 = element(by.css('app-hero-controls h3'));

    expect(await viewH3.getCssValue('fontStyle')).toEqual('italic');
    expect(await contentH3.getCssValue('fontStyle')).toEqual('italic');
  });

  it('includes styles loaded with CSS @import', async () => {
    const host = element(by.css('app-hero-details'));

    expect(await host.getCssValue('padding')).toEqual('10px');
  });

  it('processes template inline styles', async () => {
    const button = element(by.css('app-hero-controls button'));
    const externalButton = element(by.css('body > button'));
    expect(await button.getCssValue('backgroundColor')).toEqual('rgba(255, 255, 255, 1)'); // #ffffff
    expect(await externalButton.getCssValue('backgroundColor')).not.toEqual('rgba(255, 255, 255, 1)');
  });

  it('processes template <link>s', async () => {
    const li = element(by.css('app-hero-team li:first-child'));
    const externalLi = element(by.css('body > ul li'));

    expect(await li.getCssValue('listStyleType')).toEqual('square');
    expect(await externalLi.getCssValue('listStyleType')).not.toEqual('square');
  });

});
