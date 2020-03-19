'use strict'; // necessary for es6 output in node

import { browser, element, by, ExpectedConditions } from 'protractor';

const numDashboardTabs = 5;
const numClearanceItems = 4;
const numItems = 10;
const EC = ExpectedConditions;

describe('Router', () => {

  beforeAll(() => browser.get(''));

  function getPageStruct() {
    const hrefEles = element.all(by.css('app-root > nav a'));
    const clearanceDetail = element.all(by.css('app-root > div > app-clearance-center > app-clearance-list > app-clearance-detail > div')).first();
    const itemDetail = element(by.css('app-root > div > app-item-detail'));

    return {
      hrefs: hrefEles,
      activeHref: element(by.css('app-root > nav a.active')),

      clearanceHref: hrefEles.get(0),
      clearanceList: element.all(by.css('app-root > div > app-clearance-center > app-clearance-list li')),
      clearanceDetail: clearanceDetail,
      clearanceDetailTitle: clearanceDetail.element(by.xpath('*[1]')),

      itemsHref: hrefEles.get(1),
      itemsList: element.all(by.css('app-root > div > app-item-list li')),
      itemDetail: itemDetail,
      itemDetailTitle: itemDetail.element(by.xpath('*[2]')),

      adminHref: hrefEles.get(2),
      adminPage: element(by.css('app-root > div > app-admin')),
      adminPreloadList: element.all(by.css('app-root > div > app-admin > app-admin-dashboard > ul > li')),

      loginHref: hrefEles.get(3),
      loginButton: element.all(by.css('app-root > div > app-login > p > button')),

      contactHref: hrefEles.get(4),
      contactCancelButton: element.all(by.buttonText('Cancel')),

      primaryOutlet: element.all(by.css('app-root > div > app-item-list')),
      secondaryOutlet: element.all(by.css('app-root > app-compose-message'))
    };
  }

  it('has expected dashboard tabs', () => {
    const page = getPageStruct();
    expect(page.hrefs.count()).toEqual(numDashboardTabs, 'dashboard tab count');
    expect(page.clearanceHref.getText()).toEqual('Clearance Center');
    expect(page.itemsHref.getText()).toEqual('Exclusive Items');
    expect(page.adminHref.getText()).toEqual('Admin');
    expect(page.loginHref.getText()).toEqual('Login');
    expect(page.contactHref.getText()).toEqual('Contact');
  });

  it('has items selected as opening tab', () => {
    const page = getPageStruct();
    expect(page.activeHref.getText()).toEqual('Exclusive Items');
  });

  it('has clearance center items', async () => {
    const page = getPageStruct();
    await page.clearanceHref.click();
    expect(page.activeHref.getText()).toEqual('Clearance Center');
    expect(page.clearanceList.count()).toBe(numClearanceItems, 'item list count');
  });

  it('has items', async () => {
    const page = getPageStruct();
    await page.itemsHref.click();
    expect(page.activeHref.getText()).toEqual('Exclusive Items');
    expect(page.itemsList.count()).toBe(numItems, 'item list count');
  });

  it('toggles views', async () => {
    const page = getPageStruct();
    await page.clearanceHref.click();
    expect(page.activeHref.getText()).toEqual('Clearance Center');
    expect(page.clearanceList.count()).toBe(numClearanceItems, 'clearance list count');
    await page.itemsHref.click();
    expect(page.activeHref.getText()).toEqual('Exclusive Items');
    expect(page.itemsList.count()).toBe(numItems, 'item list count');
  });

  it('saves changed clearance details', async () => {
    const page = getPageStruct();
    await page.clearanceHref.click();
    await clearanceCenterEdit(2, true);
  });

  // TODO: Figure out why this test is failing now
  xit('can cancel changed clearance details', async () => {
    const page = getPageStruct();
    await page.clearanceHref.click();
    await clearanceCenterEdit(3, false);
  });

  it('saves changed item details', async () => {
    const page = getPageStruct();
    await page.itemsHref.click();
    await browser.sleep(600);
    const itemEle = page.itemsList.get(4);
    let text = await itemEle.getText();
    expect(text.length).toBeGreaterThan(0, 'item text length');
    // remove leading id from text
    const itemText = text.substr(text.indexOf(' ')).trim();

    await itemEle.click();
    await browser.sleep(600);
    expect(page.itemsList.count()).toBe(0, 'item list count');
    expect(page.itemDetail.isPresent()).toBe(true, 'item detail');
    expect(page.itemDetailTitle.getText()).toContain(itemText);
    let inputEle = page.itemDetail.element(by.css('input'));
    await inputEle.sendKeys('-foo');
    expect(page.itemDetailTitle.getText()).toContain(itemText + '-foo');

    let buttonEle = page.itemDetail.element(by.css('button'));
    await buttonEle.click();
    await browser.sleep(600);
    expect(itemEle.getText()).toContain(itemText + '-foo');
  });

  it('sees preloaded modules', async () => {
    const page = getPageStruct();
    await page.loginHref.click();
    await page.loginButton.click();
    const list = page.adminPreloadList;
    expect(list.count()).toBe(1, 'preloaded module');
    expect(await list.first().getText()).toBe('clearance-center', 'first preloaded module');
  });

  it('sees the secondary route', async () => {
    const page = getPageStruct();
    await page.itemsHref.click();
    await page.contactHref.click();
    expect(page.primaryOutlet.count()).toBe(1, 'primary outlet');
    expect(page.secondaryOutlet.count()).toBe(1, 'secondary outlet');
  });

  it('should redirect with secondary route', async () => {
    const page = getPageStruct();

    // go to login page and login
    await browser.get('');
    await page.loginHref.click();
    await page.loginButton.click();

    // open secondary outlet
    await page.contactHref.click();

    // go to login page and logout
    await page.loginHref.click();
    await page.loginButton.click();

    // attempt to go to admin page, redirects to login with secondary outlet open
    await page.adminHref.click();

    // login, get redirected back to admin with outlet still open
    await page.loginButton.click();

    expect(await page.adminPage.isDisplayed()).toBeTruthy();
    expect(page.secondaryOutlet.count()).toBeTruthy();
  });

  async function clearanceCenterEdit(index: number, save: boolean) {
    const page = getPageStruct();
    await page.clearanceHref.click();
    let clearanceEle = page.clearanceList.get(index);
    let text = await clearanceEle.getText();
    expect(text.length).toBeGreaterThan(0, 'clearance item text length');
    // remove leading id from text
    const clearanceText = text.substr(text.indexOf(' ')).trim();

    await clearanceEle.click();
    expect(page.clearanceDetail.isPresent()).toBe(true, 'clearance detail present');
    expect(page.clearanceDetailTitle.getText()).toContain(clearanceText);
    let inputEle = page.clearanceDetail.element(by.css('input'));
    await inputEle.sendKeys('-foo');

    let buttonEle = page.clearanceDetail.element(by.buttonText(save ? 'Save' : 'Cancel'));
    await buttonEle.click();
    clearanceEle = page.clearanceList.get(index);
    if (save) {
      expect(clearanceEle.getText()).toContain(clearanceText + '-foo');
    } else {
      await browser.wait(EC.alertIsPresent(), 4000);
      await browser.switchTo().alert().accept();
      expect(clearanceEle.getText()).toContain(clearanceText);
    }
  }

});
