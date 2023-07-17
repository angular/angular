import {AppPage} from '../app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display title', () => {
    expect(page.getHeading()).toEqual('Bonjour, cli-hello-world-ivy-compat! (inline)');
  });

  it('should display welcome message', () => {
    expect(page.getParagraph('message')).toEqual('Bienvenue sur l\'application i18n. (inline)');
  });

  it('should display extra message', () => {
    expect(page.getParagraph('extra')).toEqual('Message supplémentaire');
  });

  it('should display the locale', () => {
    expect(page.getParagraph('locale')).toEqual('fr');
  });

  it('the date pipe should show the localized month', () => {
    page.navigateTo();
    expect(page.getParagraph('date')).toEqual('janvier');
  });
});
