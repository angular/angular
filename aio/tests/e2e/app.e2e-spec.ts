import { browser, by, element, ElementFinder } from 'protractor';
import { SitePage } from './app.po';

describe('site App', function() {
  let page: SitePage;

  beforeEach(() => {
    SitePage.setWindowWidth(1050);   // Make the window wide enough to show the SideNav side-by-side.
    page = new SitePage();
  });

  it('should show features text after clicking "Features"', () => {
    page.navigateTo('');
    page.click(page.getTopMenuLink('features'));
    expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);
  });

  it('should set appropriate window titles', () => {
    page.navigateTo('');
    expect(browser.getTitle()).toBe('Angular');

    page.click(page.getTopMenuLink('features'));
    expect(browser.getTitle()).toBe('Angular - FEATURES & BENEFITS');

    page.click(page.homeLink);
    expect(browser.getTitle()).toBe('Angular');
  });

  it('should not navigate when clicking on nav-item headings (sub-menu toggles)', () => {
    // Show the sidenav.
    page.navigateTo('docs');
    expect(page.locationPath()).toBe('/docs');

    // Get the top-level nav-item headings (sub-menu toggles).
    const navItemHeadings = page.getNavItemHeadings(page.sidenav, 1);

    // Test all headings (and sub-headings).
    expect(navItemHeadings.count()).toBeGreaterThan(0);
    navItemHeadings.each(heading => testNavItemHeading(heading!, 1));

    // Helpers
    function expectToBeCollapsed(element: ElementFinder) {
      expect(element.getAttribute('class')).toMatch(/\bcollapsed\b/);
      expect(element.getAttribute('class')).not.toMatch(/\bexpanded\b/);
    }

    function expectToBeExpanded(element: ElementFinder) {
      expect(element.getAttribute('class')).not.toMatch(/\bcollapsed\b/);
      expect(element.getAttribute('class')).toMatch(/\bexpanded\b/);
    }

    function testNavItemHeading(heading: ElementFinder, level: number) {
      const children = page.getNavItemHeadingChildren(heading, level);

      // Headings are initially collapsed.
      expectToBeCollapsed(children);

      // Ensure heading does not cause navigation when expanding.
      page.click(heading);
      expectToBeExpanded(children);
      expect(page.locationPath()).toBe('/docs');

      // Recursively test child-headings (while this heading is expanded).
      const nextLevel = level + 1;
      const childNavItemHeadings = page.getNavItemHeadings(children, nextLevel);
      childNavItemHeadings.each(childHeading => testNavItemHeading(childHeading!, nextLevel));

      // Ensure heading does not cause navigation when collapsing.
      page.click(heading);
      expectToBeCollapsed(children);
      expect(page.locationPath()).toBe('/docs');
    }
  });

  it('should show the tutorial index page at `/tutorial` after jitterbugging through features', () => {
    // check that we can navigate directly to the tutorial page
    page.navigateTo('tutorial');
    expect(page.getDocViewerText()).toMatch(/Tutorial: Tour of Heroes/i);

    // navigate to a different page
    page.click(page.getTopMenuLink('features'));
    expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);

    // Show the menu
    page.click(page.docsMenuLink);

    // Tutorial folder should still be expanded because this test runs in wide mode
    // Navigate to the tutorial introduction via a link in the sidenav
    page.click(page.getNavItem(/introduction/i));
    expect(page.getDocViewerText()).toMatch(/Tutorial: Tour of Heroes/i);
  });

  it('should render `{@example}` dgeni tags as `<code-example>` elements with HTML escaped content', () => {
    page.navigateTo('guide/component-styles');
    const codeExample = element.all(by.css('code-example')).first();
    expect(page.getInnerHtml(codeExample)).toContain('&lt;h1&gt;Tour of Heroes&lt;/h1&gt;');
  });

  describe('scrolling to the top', () => {
    it('should scroll to the top when navigating to another page', () => {
      page.navigateTo('guide/security');

      page.scrollToBottom();
      expect(page.getScrollTop()).toBeGreaterThan(0);

      page.click(page.getNavItem(/api/i));
      expect(page.locationPath()).toBe('/api');
      expect(page.getScrollTop()).toBe(0);
    });

    it('should scroll to the top when navigating to the same page', () => {
      page.navigateTo('guide/security');

      page.scrollToBottom();
      expect(page.getScrollTop()).toBeGreaterThan(0);

      page.click(page.getNavItem(/security/i));
      expect(page.locationPath()).toBe('/guide/security');
      expect(page.getScrollTop()).toBe(0);
    });
  });

  describe('tutorial docs', () => {
    it('should not render a paragraph element inside the h1 element', () => {
      page.navigateTo('tutorial/toh-pt1');
      expect(element(by.css('h1 p')).isPresent()).toBeFalsy();
    });
  });

  describe('google analytics', () => {

    it('should call ga with initial URL', done => {
      let path: string;
      page.navigateTo('api');
      page.locationPath()
        .then(p => path = p)
        .then(() => page.ga())
        .then(calls => {
          // The last call (length-1) will be the `send` command
          // The second to last call (length-2) will be the command to `set` the page url
          expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
          done();
        });
    });

    it('should call ga with new URL on navigation', done => {
      let path: string;
      page.navigateTo('');
      page.click(page.getTopMenuLink('features'));
      page.locationPath()
        .then(p => path = p)
        .then(() => page.ga())
        .then(calls => {
          // The last call (length-1) will be the `send` command
          // The second to last call (length-2) will be the command to `set` the page url
          expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
          done();
        });
    });
  });

  describe('404 page', () => {
    it('should add or remove the "noindex" meta tag depending upon the validity of the page', () => {
      page.navigateTo('');
      expect(element(by.css('meta[name="googlebot"]')).isPresent()).toBeFalsy();
      expect(element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();

      page.navigateTo('does/not/exist');
      expect(element(by.css('meta[name="googlebot"][content="noindex"]')).isPresent()).toBeTruthy();
      expect(element(by.css('meta[name="robots"][content="noindex"]')).isPresent()).toBeTruthy();

      page.click(page.getTopMenuLink('features'));
      expect(element(by.css('meta[name="googlebot"]')).isPresent()).toBeFalsy();
      expect(element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();
    });

    it('should search the index for words found in the url', () => {
      page.navigateTo('http/router');
      const results = page.getSearchResults();

      expect(results).toContain('Http');
      expect(results).toContain('Router');
    });
  });
});
