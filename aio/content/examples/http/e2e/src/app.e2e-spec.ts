import { browser, element, by } from 'protractor';
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
  heroesListAddButton: element.all(by.css('app-heroes > div button')).get(0),
  heroesListInput: element(by.css('app-heroes > div input')),
  heroesListSearchButton: element.all(by.css('app-heroes > div button')).get(1),
  heroesListItems: element.all(by.css('app-heroes ul li')),
  logClearButton: element(by.css('app-messages button')),
  logList: element(by.css('app-messages ol')),
  logListItems: element.all(by.css('app-messages ol li')),
  searchInput: element(by.css('app-package-search input#name')),
  searchListItems: element.all(by.css('app-package-search li')),
  uploadInput: element(by.css('app-uploader input')),
  uploadMessage: element(by.css('app-uploader p'))
};

const checkLogForMessage = async (message: string) => {
  expect(await page.logList.getText()).toContain(message);
};

describe('Http Tests', () => {
  // It seems that currently Chrome/ChromeDriver fail to click a button that is just outside the
  // viewport (or maybe only partially inside the viewport) - at least in headless mode.
  // Possible solutions:
  // 1. Click the element via JavaScript (with something like
  //    `browser.executeScript('arguments[0].click', elem)`).
  // 2. Manually scroll the element into view before clicking:
  //    https://stackoverflow.com/questions/47776774/element-is-not-clickable-at-point-in-headless-mode-but-when-we-remove-headless
  // 3. Explicitly set the window size to a bigger size:
  //    https://stackoverflow.com/questions/62003082/elementnotinteractableexception-element-not-interactable-element-has-zero-size
  //
  // Since the default 800x600 window size in headless mode (as used on CI) causes the
  // `<app-config>` buttons to be in a position that trigger the above issue, we explicitly set the
  // window size to 1920x1080 when in headless mode.
  beforeAll(async () => {
    const config = await browser.getProcessedConfig();
    if (config.capabilities?.chromeOptions?.args?.includes('--headless')) {
      browser.driver.manage().window().setSize(1920, 1080);
    }
  });

  beforeEach(() => browser.get(''));

  describe('Heroes', () => {
    it('retrieves the list of heroes at startup', async () => {
      expect(await page.heroesListItems.count()).toBe(4);
      expect(await page.heroesListItems.get(0).getText()).toContain('Dr Nice');
      await checkLogForMessage('GET "api/heroes"');
    });

    it('makes a POST to add a new hero', async () => {
      await page.heroesListInput.sendKeys('Magneta');
      await page.heroesListAddButton.click();
      expect(await page.heroesListItems.count()).toBe(5);
      await checkLogForMessage('POST "api/heroes"');
    });

    it('makes a GET to search for a hero', async () => {
      await page.heroesListInput.sendKeys('Celeritas');
      await page.heroesListSearchButton.click();
      await checkLogForMessage('GET "api/heroes?name=Celeritas"');
    });
  });

  describe('Messages', () => {
    it('can clear the logs', async () => {
      expect(await page.logListItems.count()).toBe(1);
      await page.logClearButton.click();
      expect(await page.logListItems.count()).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('can fetch the configuration JSON file', async () => {
      await page.configGetButton.click();
      await checkLogForMessage('GET "assets/config.json"');
      expect(await page.configSpan.getText()).toContain('Heroes API URL is "api/heroes"');
      expect(await page.configSpan.getText()).toContain('Textfile URL is "assets/textfile.txt"');
      expect(await page.configSpan.getText()).toContain('Date is "Wed Jan 29 2020" (date)');
    });

    it('can fetch the configuration JSON file with headers', async () => {
      await page.configGetResponseButton.click();
      await checkLogForMessage('GET "assets/config.json"');
      expect(await page.configSpan.getText()).toContain('Response headers:');
      expect(await page.configSpan.getText()).toContain('content-type: application/json; charset=UTF-8');
    });

    it('can clear the configuration log', async () => {
      await page.configGetResponseButton.click();
      expect(await page.configSpan.getText()).toContain('Response headers:');
      await page.configClearButton.click();
      expect(await page.configSpan.isPresent()).toBeFalsy();
    });

    it('throws an error for a non valid url', async () => {
      await page.configErrorButton.click();
      await checkLogForMessage('GET "not/a/real/url"');
      expect(await page.configErrorMessage.getText()).toContain('"Something bad happened; please try again later."');
    });
  });

  describe('Download', () => {
    it('can download a txt file and show it', async () => {
      await page.downloadButton.click();
      await checkLogForMessage('DownloaderService downloaded "assets/textfile.txt"');
      await checkLogForMessage('GET "assets/textfile.txt"');
      expect(await page.downloadMessage.getText()).toContain('Contents: "This is the downloaded text file "');
    });

    it('can clear the log of the download', async () => {
      await page.downloadButton.click();
      expect(await page.downloadMessage.getText()).toContain('Contents: "This is the downloaded text file "');
      await page.downloadClearButton.click();
      expect(await page.downloadMessage.isPresent()).toBeFalsy();
    });
  });

  describe('Upload', () => {
    it('can upload a file', async () => {
      const filename = 'app.po.ts';
      const url = resolve(__dirname, filename);
      await page.uploadInput.sendKeys(url);
      await checkLogForMessage('POST "/upload/file" succeeded in');
      expect(await page.uploadMessage.getText()).toContain(
        `File "${filename}" was completely uploaded!`);
    });
  });

  describe('PackageSearch', () => {
    it('can search for npm package and find in cache', async () => {
      const packageName = 'angular';
      await page.searchInput.sendKeys(packageName);
      await checkLogForMessage(
        'Caching response from "https://npmsearch.com/query?q=angular"');
      expect(await page.searchListItems.count()).toBeGreaterThan(1, 'angular items');

      await page.searchInput.clear();
      await page.searchInput.sendKeys(' ');
      expect(await page.searchListItems.count()).toBe(0, 'search empty');

      await page.searchInput.clear();
      await page.searchInput.sendKeys(packageName);
      await checkLogForMessage(
        'Found cached response for "https://npmsearch.com/query?q=angular"');
    });
  });
});
