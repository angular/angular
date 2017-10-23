'use strict'; // necessary for es6 output in node

import { browser, element, by, ExpectedConditions } from 'protractor';

const numDashboardTabs = 5;
const numCrises = 4;
const numHeroes = 10;
const EC = ExpectedConditions;

describe('Router', () => {

  beforeAll(() => browser.get(''));

  function getPageStruct() {
    const hrefEles = element.all(by.css('app-root > nav a'));
    const crisisDetail = element.all(by.css('app-root > div > app-crisis-center > app-crisis-list > app-crisis-detail > div')).first();
    const heroDetail = element(by.css('app-root > div > app-hero-detail'));

    return {
      hrefs: hrefEles,
      activeHref: element(by.css('app-root > nav a.active')),

      crisisHref: hrefEles.get(0),
      crisisList: element.all(by.css('app-root > div > app-crisis-center > app-crisis-list li')),
      crisisDetail: crisisDetail,
      crisisDetailTitle: crisisDetail.element(by.xpath('*[1]')),

      heroesHref: hrefEles.get(1),
      heroesList: element.all(by.css('app-root > div > app-hero-list li')),
      heroDetail: heroDetail,
      heroDetailTitle: heroDetail.element(by.xpath('*[2]')),

      adminHref: hrefEles.get(2),
      adminPreloadList: element.all(by.css('app-root > div > app-admin > app-admin-dashboard > ul > li')),

      loginHref: hrefEles.get(3),
      loginButton: element.all(by.css('app-root > div > app-login > p > button')),

      contactHref: hrefEles.get(4),
      contactCancelButton: element.all(by.buttonText('Cancel')),

      primaryOutlet: element.all(by.css('app-root > div > app-hero-list')),
      secondaryOutlet: element.all(by.css('app-root > app-compose-message'))
    };
  }

  it('has expected dashboard tabs', () => {
    const page = getPageStruct();
    expect(page.hrefs.count()).toEqual(numDashboardTabs, 'dashboard tab count');
    expect(page.crisisHref.getText()).toEqual('Crisis Center');
    expect(page.heroesHref.getText()).toEqual('Heroes');
    expect(page.adminHref.getText()).toEqual('Admin');
    expect(page.loginHref.getText()).toEqual('Login');
    expect(page.contactHref.getText()).toEqual('Contact');
  });

  it('has heroes selected as opening tab', () => {
    const page = getPageStruct();
    expect(page.activeHref.getText()).toEqual('Heroes');
  });

  it('has crises center items', async () => {
    const page = getPageStruct();
    await page.crisisHref.click();
    expect(page.activeHref.getText()).toEqual('Crisis Center');
    expect(page.crisisList.count()).toBe(numCrises, 'crisis list count');
  });

  it('has hero items', async () => {
    const page = getPageStruct();
    await page.heroesHref.click();
    expect(page.activeHref.getText()).toEqual('Heroes');
    expect(page.heroesList.count()).toBe(numHeroes, 'hero list count');
  });

  it('toggles views', async () => {
    const page = getPageStruct();
    await page.crisisHref.click();
    expect(page.activeHref.getText()).toEqual('Crisis Center');
    expect(page.crisisList.count()).toBe(numCrises, 'crisis list count');
    await page.heroesHref.click();
    expect(page.activeHref.getText()).toEqual('Heroes');
    expect(page.heroesList.count()).toBe(numHeroes, 'hero list count');
  });

  it('saves changed crisis details', async () => {
    const page = getPageStruct();
    await page.crisisHref.click();
    await crisisCenterEdit(2, true);
  });

  // TODO: Figure out why this test is failing now
  xit('can cancel changed crisis details', async () => {
    const page = getPageStruct();
    await page.crisisHref.click();
    await crisisCenterEdit(3, false);
  });

  it('saves changed hero details', async () => {
    const page = getPageStruct();
    await page.heroesHref.click();
    await browser.sleep(600);
    const heroEle = page.heroesList.get(4);
    let text = await heroEle.getText();
    expect(text.length).toBeGreaterThan(0, 'hero item text length');
    // remove leading id from text
    const heroText = text.substr(text.indexOf(' ')).trim();

    await heroEle.click();
    await browser.sleep(600);
    expect(page.heroesList.count()).toBe(0, 'hero list count');
    expect(page.heroDetail.isPresent()).toBe(true, 'hero detail');
    expect(page.heroDetailTitle.getText()).toContain(heroText);
    let inputEle = page.heroDetail.element(by.css('input'));
    await inputEle.sendKeys('-foo');
    expect(page.heroDetailTitle.getText()).toContain(heroText + '-foo');

    let buttonEle = page.heroDetail.element(by.css('button'));
    await buttonEle.click();
    await browser.sleep(600);
    expect(heroEle.getText()).toContain(heroText + '-foo');
  });

  it('sees preloaded modules', async () => {
    const page = getPageStruct();
    await page.loginHref.click();
    await page.loginButton.click();
    const list = page.adminPreloadList;
    expect(list.count()).toBe(1, 'preloaded module');
    expect(await list.first().getText()).toBe('crisis-center', 'first preloaded module');
  });

  it('sees the secondary route', async () => {
    const page = getPageStruct();
    await page.heroesHref.click();
    await page.contactHref.click();
    expect(page.primaryOutlet.count()).toBe(1, 'primary outlet');
    expect(page.secondaryOutlet.count()).toBe(1, 'secondary outlet');
  });

  async function crisisCenterEdit(index: number, save: boolean) {
    const page = getPageStruct();
    await page.crisisHref.click();
    let crisisEle = page.crisisList.get(index);
    let text = await crisisEle.getText();
    expect(text.length).toBeGreaterThan(0, 'crisis item text length');
    // remove leading id from text
    const crisisText = text.substr(text.indexOf(' ')).trim();

    await crisisEle.click();
    expect(page.crisisDetail.isPresent()).toBe(true, 'crisis detail present');
    expect(page.crisisDetailTitle.getText()).toContain(crisisText);
    let inputEle = page.crisisDetail.element(by.css('input'));
    await inputEle.sendKeys('-foo');

    let buttonEle = page.crisisDetail.element(by.buttonText(save ? 'Save' : 'Cancel'));
    await buttonEle.click();
    crisisEle = page.crisisList.get(index);
    if (save) {
      expect(crisisEle.getText()).toContain(crisisText + '-foo');
    } else {
      await browser.wait(EC.alertIsPresent(), 4000);
      await browser.switchTo().alert().accept();
      expect(crisisEle.getText()).toContain(crisisText);
    }
  }

});
