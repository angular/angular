import {AppPage} from '../app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display title', () => {
    expect(page.getHeading()).toEqual('Guten Tag, cli-hello-world-ivy-compat! (inline)');
  });

  it('should display welcome message', () => {
    expect(page.getParagraph('message')).toEqual('Willkommen in der i18n App. (inline)');
  });

  it('should display extra message', () => {
    expect(page.getParagraph('extra')).toEqual('Zusätzliche Nachricht');
  });

  it('should display the locale', () => {
    expect(page.getParagraph('locale')).toEqual('de');
  });

  // TODO : Re-enable when CLI translation inlining supports locale inlining (and so we can use it
  // to load the correct locale data)
  xit('the date pipe should show the localized month', () => {
    page.navigateTo();
    expect(page.getParagraph('date')).toEqual('Januar');
  });
});
