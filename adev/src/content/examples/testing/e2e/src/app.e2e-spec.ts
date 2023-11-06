import { browser, element, by } from 'protractor';

describe('Testing Example', () => {
  const expectedViewNames = ['Dashboard', 'Heroes', 'About'];

  beforeAll(() => browser.get(''));

  function getPageElts() {
    return {
      navElts: element.all(by.css('app-root nav a')),
      appDashboard: element(by.css('app-root app-dashboard')),
    };
  }

  it('has title', async () => {
    expect(await browser.getTitle()).toEqual('App Under Test');
  });

  it(`has views ${expectedViewNames}`, async () => {
    const viewNames = await getPageElts().navElts.map(el => el!.getText());

    expect(viewNames).toEqual(expectedViewNames);
  });

  it('has dashboard as the active view', async () => {
    const page = getPageElts();

    expect(await page.appDashboard.isPresent()).toBeTruthy();
  });
});
