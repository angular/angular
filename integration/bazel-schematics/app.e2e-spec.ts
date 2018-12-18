import { AppPage } from './app.po';
import { browser } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Welcome to demo!');
  });

  afterEach(async () => {
    const logs = await browser.manage().logs().get('browser');
    expect(logs).toEqual([]);
  });
});
