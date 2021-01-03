import { browser, element, by } from 'protractor';

describe('Upgrade Tests', () => {

  describe('AngularJS Auto-bootstrap', () => {

    beforeAll(() => browser.get('/index-ng-app.html'));

    it('bootstraps as expected', async () => {
      expect(await element(by.css('#message')).getText()).toEqual('Hello world');
    });

  });

  describe('AngularJS JavaScript Bootstrap', () => {

    beforeAll(() => browser.get('/index-bootstrap.html'));

    it('bootstraps as expected', async () => {
      expect(await element(by.css('#message')).getText()).toEqual('Hello world');
    });

  });

  describe('AngularJS-Angular Hybrid Bootstrap', () => {

    beforeAll(() => browser.get('/index-ajs-a-hybrid-bootstrap.html'));

    it('bootstraps as expected', async () => {
      expect(await element(by.css('#message')).getText()).toEqual('Hello world');
    });

  });

  describe('Upgraded static component', async () => {

    beforeAll(() => browser.get('/index-upgrade-static.html'));

    it('renders', async () => {
      expect(await element(by.css('h2')).getText()).toEqual('Windstorm details!');
    });

  });


  describe('Upgraded component with IO', () => {

    beforeAll(() => browser.get('/index-upgrade-io.html'));

    it('has inputs', async () => {
      expect(await element(by.css('h2')).getText()).toEqual('Windstorm details!');
    });

    it('has outputs', async () => {
      await element(by.buttonText('Delete')).click();
      expect(await element(by.css('h2')).getText()).toEqual('Ex-Windstorm details!');
    });

  });


  describe('Downgraded static component', () => {

    beforeAll(() => browser.get('/index-downgrade-static.html'));

    it('renders', async () => {
      expect(await element(by.css('h2')).getText()).toEqual('Windstorm details!');
    });

  });

  describe('Downgraded component with IO', () => {

    beforeAll(() => browser.get('/index-downgrade-io.html'));

    it('has inputs', async () => {
      expect(await element.all(by.css('h2')).first().getText()).toEqual('Windstorm details!');
    });

    it('has outputs', async () => {
      await element.all(by.buttonText('Delete')).first().click();
      expect(await element.all(by.css('h2')).first().getText()).toEqual('Ex-Windstorm details!');
    });

    it('supports ng-repeat', async () => {
      expect(await element.all(by.css('hero-detail')).count()).toBe(3);
    });

  });


  describe('Downgraded component with content projection', () => {

    beforeAll(() => browser.get('/index-ajs-to-a-projection.html'));

    it('can be transcluded into', async () => {
      expect(await element(by.css('hero-detail')).getText()).toContain('Specific powers of controlling winds');
    });

  });


  describe('Upgraded component with transclusion', () => {

    beforeAll(() => browser.get('/index-a-to-ajs-transclusion.html'));

    it('can be projected into', async () => {
      expect(await element(by.css('hero-detail')).getText()).toContain('Specific powers of controlling winds');
    });

  });


  describe('Upgrading AngularJS Providers', () => {

    beforeAll(() => browser.get('/index-ajs-to-a-providers.html'));

    it('works', async () => {
      expect(await element(by.css('h2')).getText()).toBe('1: Windstorm');
    });

  });


  describe('Downgrading Angular Providers', () => {

    beforeAll(() => browser.get('/index-a-to-ajs-providers.html'));

    it('works', async () => {
      expect(await element(by.css('h2')).getText()).toBe('1: Windstorm');
    });

  });

});
