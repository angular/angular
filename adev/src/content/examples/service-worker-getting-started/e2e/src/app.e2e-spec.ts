import {AppPage} from './app.po';
import {element, by} from 'protractor';

describe('sw-example App', () => {
  let page: AppPage;

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should display welcome message', async () => {
    expect(await page.getTitleText()).toEqual('Welcome to Service Workers!');
  });

  it('should display the Angular logo', async () => {
    const logo = element(by.css('img'));
    expect(await logo.isPresent()).toBe(true);
  });

  it('should show a header for the list of links', async () => {
    const listHeader = element(by.css('app-root > h2'));
    expect(await listHeader.getText()).toEqual('Here are some links to help you start:');
  });

  it('should show a list of links', async () => {
    const items = await element.all(by.css('ul > li > h2 > a'));

    expect(items.length).toBe(4);
    expect(await items[0].getText()).toBe('Angular Service Worker Intro');
    expect(await items[1].getText()).toBe('Tour of Heroes');
    expect(await items[2].getText()).toBe('CLI Documentation');
    expect(await items[3].getText()).toBe('Angular blog');
  });

  // Check for a rejected promise as the service worker is not enabled
  it('SwUpdate.checkForUpdate() should return a rejected promise', async () => {
    const button = element(by.css('button'));
    const rejectMessage = element(by.css('p'));
    await button.click();
    expect(await rejectMessage.getText()).toContain('rejected: ');
  });
});
