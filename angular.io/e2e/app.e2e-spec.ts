import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
