import { AppPage } from './app.po';

describe('dynamic-compiler App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Hello world!');
  });

  it('should display lazy-loaded component', () => {
    page.navigateTo();
    expect(page.getLazyLoadedText()).toEqual('Lazy-loaded component!');
  });
});
