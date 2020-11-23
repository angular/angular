import { AppPage } from './app.po';

describe('feature-modules App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying app works', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('app works!');
  });
});
