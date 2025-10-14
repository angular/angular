import {AppPage} from './app.po';
describe('forms-overview App', () => {
  let page;
  beforeEach(() => {
    page = new AppPage();
  });
  it('should display a title', async () => {
    await page.navigateTo();
    expect(await page.getTitleText()).toEqual('Forms Overview');
  });
});
//# sourceMappingURL=app.e2e-spec.js.map
