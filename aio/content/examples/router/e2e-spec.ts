'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder } from 'protractor';

describe('Router', function () {

  beforeAll(function () {
    browser.get('');
  });

  function getPageStruct() {
    let hrefEles = element.all(by.css('my-app a'));

    return {
      hrefs: hrefEles,
      routerParent: element(by.css('my-app > ng-component')),
      routerTitle: element(by.css('my-app > ng-component > h2')),

      crisisHref: hrefEles.get(0),
      crisisList: element.all(by.css('my-app > ng-component > ng-component li')),
      crisisDetail: element(by.css('my-app > ng-component > ng-component > ng-component > div')),
      crisisDetailTitle: element(by.css('my-app > ng-component > ng-component > ng-component > div > h3')),

      heroesHref: hrefEles.get(1),
      heroesList: element.all(by.css('my-app > ng-component li')),
      heroDetail: element(by.css('my-app > ng-component > div')),
      heroDetailTitle: element(by.css('my-app > ng-component > div > h3')),

      adminHref: hrefEles.get(2),
      adminPreloadList: element.all(by.css('my-app > ng-component > ng-component > ul > li')),

      loginHref: hrefEles.get(3),
      loginButton: element.all(by.css('my-app > ng-component > p > button')),

      contactHref: hrefEles.get(4),
      contactCancelButton: element.all(by.buttonText('Cancel')),

      outletComponents: element.all(by.css('my-app > ng-component'))
    };
  }

  it('should be able to see the start screen', function () {
    let page = getPageStruct();
    expect(page.hrefs.count()).toEqual(5, 'should be 5 dashboard choices');
    expect(page.crisisHref.getText()).toEqual('Crisis Center');
    expect(page.heroesHref.getText()).toEqual('Heroes');
    expect(page.adminHref.getText()).toEqual('Admin');
    expect(page.loginHref.getText()).toEqual('Login');
    expect(page.contactHref.getText()).toEqual('Contact');
  });

  it('should be able to see crises center items', function () {
    let page = getPageStruct();
    page.crisisHref.click().then(function() {
      expect(page.crisisList.count()).toBe(4, 'should be 4 crisis center entries at start');
    });
  });

  it('should be able to see hero items', function () {
    let page = getPageStruct();
    page.heroesHref.click().then(function() {
      expect(page.routerTitle.getText()).toContain('HEROES');
      expect(page.heroesList.count()).toBe(6, 'should be 6 heroes');
    });
  });

  it('should be able to toggle the views', function () {
    let page = getPageStruct();
    page.crisisHref.click().then(function() {
      expect(page.crisisList.count()).toBe(4, 'should be 4 crisis center entries');
      return page.heroesHref.click();
    }).then(function() {
      expect(page.heroesList.count()).toBe(6, 'should be 6 heroes');
    });
  });

  it('should be able to edit and save details from the crisis center view', function () {
    let page = getPageStruct();
    page.crisisHref.click().then(function() {
      crisisCenterEdit(2, true);
    });
  });

  xit('should be able to edit and cancel details from the crisis center view', function () {
    let page = getPageStruct();
    page.crisisHref.click().then(function() {
      crisisCenterEdit(3, false);
    });
  });

  it('should be able to edit and save details from the heroes view', function () {
    let page = getPageStruct();
    let heroEle: ElementFinder;
    let heroText: string;
    page.heroesHref.click().then(function() {
      heroEle = page.heroesList.get(4);
      return heroEle.getText();
    }).then(function(text: string) {
      expect(text.length).toBeGreaterThan(0, 'should have some text');
      // remove leading id from text
      heroText = text.substr(text.indexOf(' ')).trim();
      return heroEle.click();
    }).then(function() {
      expect(page.heroesList.count()).toBe(0, 'should no longer see crisis center entries');
      expect(page.heroDetail.isPresent()).toBe(true, 'should be able to see crisis detail');
      expect(page.heroDetailTitle.getText()).toContain(heroText);
      let inputEle = page.heroDetail.element(by.css('input'));
      inputEle.sendKeys('-foo');
      expect(page.heroDetailTitle.getText()).toContain(heroText + '-foo');
      let buttonEle = page.heroDetail.element(by.css('button'));
      return buttonEle.click();
    }).then(function() {
      expect(heroEle.getText()).toContain(heroText + '-foo');
    });
  });

  it('should be able to see the preloaded modules', function () {
    let page = getPageStruct();
    page.loginHref.click().then(function() {
      return page.loginButton.click();
    }).then(function() {
      expect(page.adminPreloadList.count()).toBe(1, 'should be 1 preloaded module');
      expect(page.adminPreloadList.first().getText()).toBe('crisis-center', 'first preload should be crisis center');
    });
  });

  it('should be able to see the secondary route', function () {
    let page = getPageStruct();
    page.heroesHref.click().then(function() {
      return page.contactHref.click();
    }).then(function() {
      expect(page.outletComponents.count()).toBe(2, 'should be 2 displayed routes');
    });
  });

  function crisisCenterEdit(index: number, shouldSave: boolean) {
    let page = getPageStruct();
    let crisisEle: ElementFinder;
    let crisisText: string;
    page.crisisHref.click()
    .then(function () {
      crisisEle = page.crisisList.get(index);
      return crisisEle.getText();
    }).then(function(text: string) {
      expect(text.length).toBeGreaterThan(0, 'should have some text');
      // remove leading id from text
      crisisText = text.substr(text.indexOf(' ')).trim();
      return crisisEle.click();
    }).then(function () {
      expect(page.crisisDetail.isPresent()).toBe(true, 'should be able to see crisis detail');
      expect(page.crisisDetailTitle.getText()).toContain(crisisText);
      let inputEle = page.crisisDetail.element(by.css('input'));
      inputEle.sendKeys('-foo');
      expect(page.crisisDetailTitle.getText()).toContain(crisisText + '-foo');
      let buttonEle = page.crisisDetail.element(by.cssContainingText('button', shouldSave ? 'Save' : 'Cancel'));
      return buttonEle.click();
    }).then(function () {
      if (shouldSave) {
        expect(crisisEle.getText()).toContain(crisisText + '-foo');
      } else {
        expect(crisisEle.getText()).not.toContain(crisisText + '-foo');
      }
    });
  }

});
