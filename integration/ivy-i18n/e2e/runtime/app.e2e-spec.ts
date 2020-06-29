import {AppPage} from '../app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;

  beforeEach(() => { page = new AppPage(); });

  it('should display title', () => {
    page.navigateTo();
    expect(page.getHeading()).toEqual('Bonjour cli-hello-world-ivy-compat!');
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraph('message')).toEqual('Bienvenue sur l\'application i18n.');
  });

  it('the percent pipe should work', () => {
    page.navigateTo();
    expect(page.getParagraph('pipe')).toEqual('100 % awesome');
  });

  it('should display the locale', () => { expect(page.getParagraph('locale')).toEqual('fr'); });

  it('the date pipe should show the localized month', () => {
    page.navigateTo();
    expect(page.getParagraph('date')).toEqual('janvier');
  });
});
