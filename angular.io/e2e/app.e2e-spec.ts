import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeAll(done => {
    // Hack:  CI has been failing on first test.
    // Apparently needs to be primed with a browser wake up call
    new SitePage().navigateTo().then(done);
  });

  beforeEach(() => {
    page = new SitePage();
  });

  it('should show features text after clicking "Features"', () => {
    page.navigateTo()
      .then(() => {
        return page.featureLink.click();
      })
      .then(() => {
        expect(page.getDocViewerText()).toContain('Progressive web apps');
      });
  });

  it('should convert code-example in pipe.html', () => {
    page.navigateTo()
      .then(() => {
        return page.datePipeLink.click();
      })
      .then(() => {
        expect(page.codeExample.count()).toBeGreaterThan(0, 'should have code-example content');
      });
  });
});
