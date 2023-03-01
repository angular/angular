import {AppPage} from '../app.po';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display translated title',
     () => { expect(page.getHeading()).toEqual('Bonjour cli-hello-world-ivy-compat!'); });

  it('should display untranslated welcome message', () => {
    // This message does not get translated because we did not provide a translation for it
    // See "translated:legacy:extract-and-update" in package.json.
    expect(page.getParagraph('message')).toEqual('Welcome to the i18n app.');
  });

  it('should display the locale', () => { expect(page.getParagraph('locale')).toEqual('legacy'); });
});
