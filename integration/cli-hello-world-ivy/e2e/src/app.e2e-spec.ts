import { AppPage } from './app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to cli-hello-world-ivy!');
  });

  it('the percent pipe should work', () => {
    page.navigateTo();
    expect(page.getPipeContent()).toEqual('100 % awesome');
  })
});
