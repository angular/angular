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
});
