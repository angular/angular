import { AppPage } from './app.po';

describe('feature-modules App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('app works!');
  });
});



