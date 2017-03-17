import { browser, element, by, promise } from 'protractor';
import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    page = new SitePage();
    page.navigateTo();
  });

  it('should show features text after clicking "Features"', () => {
    page.featureLink.click().then(() => {
      expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);
    });
  });

  it('should convert a doc with a code-example');

  describe('api-docs', () => {
    it('should show a link to github', () => {
      page.navigateTo('api/common/NgClass');
      expect(page.ghLink.getAttribute('href'))
          .toMatch(/https:\/\/github.com\/angular\/angular\/tree\/.+\/packages\/common\/src\/directives\/ng_class\.ts/);
    });
  });

  describe('google analytics', () => {
    beforeEach(done => page.gaReady.then(done));

    it('should call ga', done => {
      page.ga()
        .then(calls => {
          expect(calls.length).toBeGreaterThan(2, 'ga calls');
          done();
        });
    });

    it('should call ga with initial URL', done => {
      let path: string;

      page.locationPath()
        .then(p => path = p)
        .then(() => page.ga().then(calls => {
          expect(calls.length).toBeGreaterThan(2, 'ga calls');
          expect(calls[1]).toEqual(['set', 'page', path]);
          done();
        }));
    });

    // Todo: add test to confirm tracking URL when navigate.
  });

});
