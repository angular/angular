import { MyAppPage } from './app.po';

describe('my-app App', function() {
  let page: MyAppPage;

  beforeEach(() => {
    page = new MyAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
