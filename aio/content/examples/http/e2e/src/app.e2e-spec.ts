import { browser, element, by, ElementFinder } from 'protractor';
import { resolve } from 'path';

const page = {
  configClearButton: element.all(by.css('app-config > div button')).get(2),
  configErrorButton: element.all(by.css('app-config > div button')).get(3),
  configErrorMessage: element(by.css('app-config p')),
  configGetButton: element.all(by.css('app-config > div button')).get(0),
  configGetResponseButton: element.all(by.css('app-config > div button')).get(1),
  configSpan: element(by.css('app-config span')),
  downloadButton: element.all(by.css('app-downloader button')).get(0),
  downloadClearButton: element.all(by.css('app-downloader button')).get(1),
  downloadMessage: element(by.css('app-downloader p')),
  itemsListAddButton: element.all(by.css('app-items > div button')).get(0),
  itemsListInput: element(by.css('app-items > div input')),
  itemsListSearchButton: element.all(by.css('app-items > div button')).get(1),
  itemsListItems: element.all(by.css('app-items ul li')),
  logClearButton: element(by.css('app-messages button')),
  logList: element(by.css('app-messages ol')),
  logListItems: element.all(by.css('app-messages ol li')),
  searchInput: element(by.css('app-package-search input#name')),
  searchListItems: element.all(by.css('app-package-search li')),
  uploadInput: element(by.css('app-uploader input')),
  uploadMessage: element(by.css('app-uploader p'))
};

let checkLogForMessage = (message: string) => {
  expect(page.logList.getText()).toContain(message);
};

describe('Http Tests', function() {
  beforeEach(() => {
    browser.get('');
  });

  describe('Items', () => {
    it('retrieves the list of items at startup', () => {
      expect(page.itemsListItems.count()).toBe(4);
      expect(page.itemsListItems.get(0).getText()).toContain('11computer');
      checkLogForMessage('GET "api/items"');
    });

    it('makes a POST to add a new item', () => {
      page.itemsListInput.sendKeys('Magneta');
      page.itemsListAddButton.click();
      expect(page.itemsListItems.count()).toBe(5);
      checkLogForMessage('POST "api/items"');
    });

    it('makes a GET to search for a item', () => {
      page.itemsListInput.sendKeys('fishbowl');
      page.itemsListSearchButton.click();
      checkLogForMessage('GET "api/items?name=fishbowl"');
    });
  });

  describe('Messages', () => {
    it('can clear the logs', () => {
      expect(page.logListItems.count()).toBe(1);
      page.logClearButton.click();
      expect(page.logListItems.count()).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('can fetch the configuration JSON file', () => {
      page.configGetButton.click();
      checkLogForMessage('GET "assets/config.json"');
      expect(page.configSpan.getText()).toContain('Items API URL is "api/items"');
      expect(page.configSpan.getText()).toContain('Textfile URL is "assets/textfile.txt"');
    });

    it('can fetch the configuration JSON file with headers', () => {
      page.configGetResponseButton.click();
      checkLogForMessage('GET "assets/config.json"');
      expect(page.configSpan.getText()).toContain('Response headers:');
      expect(page.configSpan.getText()).toContain('content-type: application/json; charset=UTF-8');
    });

    it('can clear the configuration log', () => {
      page.configGetResponseButton.click();
      expect(page.configSpan.getText()).toContain('Response headers:');
      page.configClearButton.click();
      expect(page.configSpan.isPresent()).toBeFalsy();
    });

    it('throws an error for a non valid url', () => {
      page.configErrorButton.click();
      checkLogForMessage('GET "not/a/real/url"');
      expect(page.configErrorMessage.getText()).toContain('"Something bad happened; please try again later."');
    });
  });

  describe('Download', () => {
    it('can download a txt file and show it', () => {
      page.downloadButton.click();
      checkLogForMessage('DownloaderService downloaded "assets/textfile.txt"');
      checkLogForMessage('GET "assets/textfile.txt"');
      expect(page.downloadMessage.getText()).toContain('Contents: "This is the downloaded text file "');
    });

    it('can clear the log of the download', () => {
      page.downloadButton.click();
      expect(page.downloadMessage.getText()).toContain('Contents: "This is the downloaded text file "');
      page.downloadClearButton.click();
      expect(page.downloadMessage.isPresent()).toBeFalsy();
    });
  });

  describe('Upload', () => {
    it('can upload a file', () => {
      const filename = 'app.po.ts';
      const url = resolve(__dirname, filename);
      page.uploadInput.sendKeys(url);
      checkLogForMessage('POST "/upload/file" succeeded in');
      expect(page.uploadMessage.getText()).toContain(
        `File "${filename}" was completely uploaded!`);
    });
  });

  describe('PackageSearch', () => {
    it('can search for npm package and find in cache', () => {
      const packageName = 'angular';
      page.searchInput.sendKeys(packageName);
      checkLogForMessage(
        'Caching response from "https://npmsearch.com/query?q=angular"');
      expect(page.searchListItems.count()).toBeGreaterThan(1, 'angular items');

      page.searchInput.clear();
      page.searchInput.sendKeys(' ');
      expect(page.searchListItems.count()).toBe(0, 'search empty');

      page.searchInput.clear();
      page.searchInput.sendKeys(packageName);
      checkLogForMessage(
        'Found cached response for "https://npmsearch.com/query?q=angular"');
    });
  });
});
