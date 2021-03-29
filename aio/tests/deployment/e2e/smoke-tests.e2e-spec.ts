import { browser } from 'protractor';
import { SitePage } from './site.po';

describe(browser.baseUrl, () => {
  const page = new SitePage();

  beforeAll(() => page.init());

  beforeEach(() => browser.waitForAngularEnabled(false));

  afterEach(async () => {
    await page.unregisterSw();
    await browser.waitForAngularEnabled(true);
  });

  describe('(smoke tests)', () => {
    it('should show the home page', async () => {
      await page.goTo('');
      const text = await page.getDocViewerText();

      expect(text).toContain('modern web');
      expect(text).toContain('developer\'s platform');
    });

    describe('(marketing pages)', () => {
      const textPerUrl: { [key: string]: string } = {
        features: 'features & benefits',
        docs: 'introduction to the angular docs',
        events: 'events',
        resources: 'explore angular resources',
      };

      Object.keys(textPerUrl).forEach(url => {
        it(`should show the page at '${url}'`, async () => {
          await page.goTo(url);
          await browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(await page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(docs pages)', () => {
      const textPerUrl: { [key: string]: string } = {
        api: 'api list',
        'guide/architecture': 'architecture',
        'guide/http': 'httpclient',
        'guide/security': 'security',
        tutorial: 'tutorial',
        start: 'getting started',
      };

      Object.keys(textPerUrl).forEach(url => {
        it(`should show the page at '${url}'`, async () => {
          await page.goTo(url);
          await browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(await page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(api docs pages)', () => {
      const textPerUrl: { [key: string]: string } = {
        /* Class */ 'api/core/Injector': 'class injector',
        /* Const */ 'api/forms/NG_VALIDATORS': 'const ng_validators',
        /* Decorator */ 'api/core/Component': '@component',
        /* Directive */ 'api/common/NgIf': 'class ngif',
        /* Enum */ 'api/core/ChangeDetectionStrategy': 'enum changedetectionstrategy',
        /* Function */ 'api/animations/animate': 'animate(',
        /* Interface */ 'api/core/OnDestroy': 'interface ondestroy',
        /* Pipe */ 'api/common/JsonPipe': '| json',
        /* Type-Alias */ 'api/common/http/HttpEvent': 'type httpevent',
      };

      Object.keys(textPerUrl).forEach(url => {
        it(`should show the page at '${url}'`, async () => {
          await page.goTo(url);
          await browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(await page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(search results)', () => {
      beforeEach(() => page.goTo(''));

      it('should find pages when searching by a partial word in the title', async () => {
        await page.enterSearch('ngCont');
        expect(await page.getSearchResults()).toContain('NgControl');
      });

      it('should find API docs when searching for an instance member name', async () => {
        await page.enterSearch('writeValue');
        expect(await page.getSearchResults()).toContain('ControlValueAccessor');
      });

      it('should find API docs when searching for a static member name', async () => {
        await page.enterSearch('compose');
        expect(await page.getSearchResults()).toContain('Validators');
      });
    });

    it('should show relevant results on 404', async () => {
      await page.goTo('common/http');
      const results = await page.getSearchResults();

      expect(results).toContain('common/http package');
    });
  });
});
