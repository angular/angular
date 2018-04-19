import { AppPage } from './app.po';

describe('noop-zone-hello-world App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });

  it('should not change title without trigger change detection manually', () => {
    page.navigateTo();
    page.clickButton('changeTitle');
    expect(page.getParagraphText()).toEqual('Welcome to app!');
    page.clickButton('changeTitleWithCD');
    expect(page.getParagraphText()).toEqual('Welcome to new Title After Change detection!');
  });
});
