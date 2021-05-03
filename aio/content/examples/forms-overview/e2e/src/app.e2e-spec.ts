import { AppPage } from './app.po';

describe('forms-overvoew App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display a title', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('Forms Overview');
  });
});
