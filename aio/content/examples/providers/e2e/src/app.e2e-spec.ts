import { element, by } from 'protractor';
import { AppPage } from './app.po';

import { users } from '../../src/app/user';

describe('providers App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should display header that says "Providers Example"', async () => {
    expect(await page.getTitleText()).toEqual('Providers Example');
  });

  it('shows a list of regular users', async () => {
    const items = element.all(by.css('app-users li'));
    expect(await items.count()).toBe(users.length);
    expect(await items.get(0).getText()).toBe(users[0].id + ' ' + users[0].name);
  });

});
