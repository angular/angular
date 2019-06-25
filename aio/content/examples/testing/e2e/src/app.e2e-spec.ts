'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';

describe('Testing Example', () => {
  const expectedViewNames = ['Dashboard', 'Heroes', 'About'];

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboard: element(by.css('app-root app-dashboard')),
    };
  }

  it('has title', async() => {
    expect(await browser.getTitle()).toEqual('App Under Test');
  });

  it(`has views ${expectedViewNames}`, async () => {
    let viewNames = getPageElts().navElts.map(async(el: ElementFinder) => await el.getText());

    expect(viewNames).toEqual(expectedViewNames);
  });

  it('has dashboard as the active view', () => {
    let page = getPageElts();

    expect(page.appDashboard.isPresent()).toBeTruthy();
  });
});
