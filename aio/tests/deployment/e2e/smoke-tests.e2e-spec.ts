import { browser } from 'protractor';
import { SitePage } from './site.po';

describe(browser.baseUrl, () => {
  const page = new SitePage();

  beforeAll(done => page.init().then(done));

  beforeEach(() => browser.waitForAngularEnabled(false));
  afterEach(() => browser.waitForAngularEnabled(true));

  describe('(smoke tests)', () => {
    it('should show the home page', () => {
      page.goTo('');
      const text = page.getDocViewerText();

      expect(text).toContain('one framework');
      expect(text).toContain('mobile & desktop');
    });

    describe('(marketing pages)', () => {
      const textPerUrl = {
        features: 'features & benefits',
        docs: 'what is angular?',
        events: 'events',
        resources: 'explore angular resources',
      };

      Object.keys(textPerUrl).forEach(url => {
        it(`should show the page at '${url}'`, () => {
          page.goTo(url);
          browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(docs pages)', () => {
      const textPerUrl = {
        api: 'api list',
        'guide/architecture': 'architecture',
        'guide/http': 'httpclient',
        'guide/quickstart': 'getting started',
        'guide/security': 'security',
        tutorial: 'tutorial',
      };

      Object.keys(textPerUrl).forEach(url => {
        it(`should show the page at '${url}'`, () => {
          page.goTo(url);
          browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(api docs pages)', () => {
      const textPerUrl = {
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
        it(`should show the page at '${url}'`, () => {
          page.goTo(url);
          browser.wait(() => page.getDocViewerText(), 5000);  // Wait for the document to be loaded.

          expect(page.getDocViewerText()).toContain(textPerUrl[url]);
        });
      });
    });

    describe('(search results)', () => {
      beforeEach(() => page.goTo(''));

      it('should find pages when searching by a partial word in the title', () => {
        page.enterSearch('ngCont');
        expect(page.getSearchResults()).toContain('NgControl');
      });

      it('should find API docs when searching for an instance member name', () => {
        page.enterSearch('writeValue');
        expect(page.getSearchResults()).toContain('ControlValueAccessor');
      });

      it('should find API docs when searching for a static member name', () => {
        page.enterSearch('compose');
        expect(page.getSearchResults()).toContain('Validators');
      });
    });

    it('should show relevant results on 404', () => {
      page.goTo('http/router');
      const results = page.getSearchResults();

      expect(results).toContain('HttpClient');
      expect(results).toContain('Router');
    });
  });
});
