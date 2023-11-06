import { element, by } from 'protractor';
import { AppPage } from './app.po';

describe('providers App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should display header that says Users list', async () => {
    expect(await page.getTitleText()).toEqual('Users list');
  });

  it('shows a list of customers', async () => {
    const items = element.all(by.css('app-root li'));
    expect(await items.count()).toBe(10);
    expect(await items.get(0).getText()).toBe('1 Maria');
    expect(await items.get(9).getText()).toBe('10 Seth');
  });

});
