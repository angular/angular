import {AppPage} from '../app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display title', () => {
    expect(page.getHeading()).toEqual('Hello cli-hello-world-ivy-compat!');
  });

  it('should display welcome message', () => {
    expect(page.getParagraph('message')).toEqual('Welcome to the i18n app.');
  });

  it('should display extra message', () => {
    expect(page.getParagraph('extra')).toEqual('Extra message');
  });

  it('should display the locale', () => {
    expect(page.getParagraph('locale')).toEqual('en-US');
  });

  it('the date pipe should show the localized month', () => {
    page.navigateTo();
    expect(page.getParagraph('date')).toEqual('January');
  });
});
