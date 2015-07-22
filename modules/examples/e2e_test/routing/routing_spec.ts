import {verifyNoBrowserErrors} from 'angular2/src/test_lib/e2e_util';


describe('routing inbox-app', function() {

  afterEach(verifyNoBrowserErrors);

  describe('index view', function() {
    var URL = 'examples/src/routing/index.html';

    it('should list out the current collection of items', function() {
      browser.get(URL);
      expect(element.all(by.css('.inbox-item-record')).count()).toEqual(200);
    });

    it('should build a link which points to the detail page', function() {
      browser.get(URL);
      expect(element(by.css('#item-15')).getAttribute('href')).toMatch(/\/detail\/15$/);
      element(by.css('#item-15')).click();
      browser.sleep(200);  // TODO: see #428
      expect(browser.getCurrentUrl()).toMatch(/\/detail\/15$/);
    });
  });


  describe('drafts view', function() {
    var URL = 'examples/src/routing/index.html';

    it('should navigate to the drafts view when the drafts link is clicked', function() {
      browser.get(URL);
      element(by.linkText('Drafts')).click();
      browser.sleep(200);  // TODO: see #428
      expect(element(by.css('.page-title')).getText()).toEqual('Drafts');
    });

    it('should navigate to email details', function() {
      browser.get(URL);
      element(by.linkText('Drafts')).click();
      browser.sleep(200);  // TODO: see #428
      expect(element.all(by.css('.inbox-item-record')).count()).toEqual(2);
      expect(element(by.css('#item-201')).getAttribute('href')).toMatch(/\/detail\/201$/);
      element(by.css('#item-201')).click();
      browser.sleep(200);  // TODO: see #428
      expect(browser.getCurrentUrl()).toMatch(/\/detail\/201$/);
    });
  });


});
