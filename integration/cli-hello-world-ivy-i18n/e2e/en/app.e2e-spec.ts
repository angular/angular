import {AppPage} from '../app.po';
import {browser, logging} from 'protractor';

describe('cli-hello-world-ivy App', () => {
  let page: AppPage;
  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it('should display title',
     () => { expect(page.getHeading()).toEqual('Hello cli-hello-world-ivy-i18n!'); });

  it('should display the locale', () => { expect(page.getParagraph('locale')).toEqual('en-US'); });

  it('the date pipe should show the localized month', () => {
    page.navigateTo();
    expect(page.getParagraph('date')).toEqual('January');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
