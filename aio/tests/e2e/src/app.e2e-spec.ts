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
    function expectToBeCollapsed(elementFinder: ElementFinder) {
      expect(elementFinder.getAttribute('class')).toMatch(/\bcollapsed\b/);
      expect(elementFinder.getAttribute('class')).not.toMatch(/\bexpanded\b/);
    }

    function expectToBeExpanded(elementFinder: ElementFinder) {
      expect(elementFinder.getAttribute('class')).not.toMatch(/\bcollapsed\b/);
      expect(elementFinder.getAttribute('class')).toMatch(/\bexpanded\b/);
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
    expect(page.getDocViewerText()).toMatch(/Tour of Heroes App and Tutorial/i);

    // navigate to a different page
    page.click(page.getTopMenuLink('features'));
    expect(page.getDocViewerText()).toMatch(/Progressive web apps/i);

    // Show the menu
    page.click(page.docsMenuLink);

    // Tutorial folder should still be expanded because this test runs in wide mode
    // Navigate to the tutorial introduction via a link in the sidenav
    page.click(page.getNavItem(/The Hero Editor/i));
    expect(page.getDocViewerText()).toMatch(/The Hero Editor/i);
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

  describe('contributors page', () => {
    const groupButtons = element(by.css('.group-buttons')).all(by.css('.filter-button'));
    const contributors = element(by.css('.contributor-group')).all(by.css('aio-contributor'));

    beforeAll(() => page.navigateTo('about'));

    it('should have the expected groups', () => {
      expect(groupButtons.count()).toBe(3);

      const texts = groupButtons.map<string>(btn => btn && btn.getText());
      expect(texts).toEqual(['ANGULAR', 'COLLABORATORS', 'GDE']);
    });

    it('should have contributors listed in each group', () => {
      // WebDriver calls `scrollIntoView()` on the element to bring it into the visible area of the
      // browser, before clicking it. By default, this aligns the top of the element to the top of
      // the window. As a result, the element may end up behing the fixed top menu, thus being
      // unclickable. To avoid this, we click the element directly using JavaScript instead.
      const clickButton = (elementFinder: ElementFinder) => elementFinder.getWebElement().then(
          webElement => browser.executeScript('arguments[0].click()', webElement));
      const getContributorNames =
          () => contributors.all(by.css('h3')).map<string>(c => c && c.getText());

      const names1 = getContributorNames();
      expect(contributors.count()).toBeGreaterThan(1);

      clickButton(groupButtons.get(1));
      const names2 = getContributorNames();
      expect(contributors.count()).toBeGreaterThan(1);
      expect(names2).not.toEqual(names1);

      clickButton(groupButtons.get(2));
      const names3 = getContributorNames();
      expect(contributors.count()).toBeGreaterThan(1);
      expect(names3).not.toEqual(names2);
      expect(names3).not.toEqual(names1);

      clickButton(groupButtons.get(0));
      const names4 = getContributorNames();
      expect(contributors.count()).toBeGreaterThan(1);
      expect(names4).not.toEqual(names3);
      expect(names4).not.toEqual(names2);
      expect(names4).toEqual(names1);
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
      expect(element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();

      page.navigateTo('does/not/exist');
      expect(element(by.css('meta[name="robots"][content="noindex"]')).isPresent()).toBeTruthy();

      page.click(page.getTopMenuLink('features'));
      expect(element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();
    });

    it('should search the index for words found in the url', () => {
      page.navigateTo('http/router');
      const results = page.getSearchResults();

      expect(results).toContain('HttpRequest');
      expect(results).toContain('Router');
    });
  });

  describe('suggest edit link', () => {
    it('should be present on all docs pages', () => {
      page.navigateTo('tutorial/toh-pt1');
      expect(page.ghLinks.count()).toEqual(1);
      /* tslint:disable:max-line-length */
      expect(page.ghLinks.get(0).getAttribute('href'))
        .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/aio\/content\/tutorial\/toh-pt1\.md\?message=docs%3A%20describe%20your%20change\.\.\./);

      page.navigateTo('guide/http');
      expect(page.ghLinks.count()).toEqual(1);
      /* tslint:disable:max-line-length */
      expect(page.ghLinks.get(0).getAttribute('href'))
        .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/aio\/content\/guide\/http\.md\?message=docs%3A%20describe%20your%20change\.\.\./);
    // TODO(gkalpak): This test often times out with Ivy (because loading `guide/http` takes a lot of time).
    //                Remove the timeout once the performance issues have been fixed.
    }, 60000);

    it('should not be present on top level pages', () => {
      page.navigateTo('features');
      expect(page.ghLinks.count()).toEqual(0);
    });
  });
});
