import { browser, by, element, ElementFinder } from 'protractor';
import { SitePage } from './app.po';

describe('site App', () => {
  let page: SitePage;

  beforeEach(async () => {
    // Make the window wide enough to show the SideNav side-by-side
    // (bigger than the app component's showTopMenuWidth).
    await SitePage.setWindowWidth(1200);
    page = new SitePage();
  });

  it('should show features text after clicking "Features"', async () => {
    await page.navigateTo('');
    await page.click(page.getTopMenuLink('features'));
    expect(await page.getDocViewerText()).toMatch(/Progressive web apps/i);
  });

  it('should set appropriate window titles', async () => {
    await page.navigateTo('');
    expect(await browser.getTitle()).toBe('Angular');

    await page.click(page.getTopMenuLink('features'));
    expect(await browser.getTitle()).toBe('Angular - FEATURES & BENEFITS');

    await page.click(page.homeLink);
    expect(await browser.getTitle()).toBe('Angular');
  });

  it('should not navigate when clicking on nav-item headings (sub-menu toggles)', async () => {
    // Show the sidenav.
    await page.navigateTo('docs');
    expect(await page.locationPath()).toBe('/docs');

    // Get the top-level nav-item headings (sub-menu toggles).
    const navItemHeadings = page.getNavItemHeadings(page.sidenav, 1);

    // Test all headings (and sub-headings).
    expect(await navItemHeadings.count()).toBeGreaterThan(0);
    await navItemHeadings.each(heading => heading && testNavItemHeading(heading, 1));

    // Helpers
    async function expectToBeCollapsed(elementFinder: ElementFinder) {
      expect(await elementFinder.getAttribute('class')).toMatch(/\bcollapsed\b/);
      expect(await elementFinder.getAttribute('class')).not.toMatch(/\bexpanded\b/);
    }

    async function expectToBeExpanded(elementFinder: ElementFinder) {
      expect(await elementFinder.getAttribute('class')).not.toMatch(/\bcollapsed\b/);
      expect(await elementFinder.getAttribute('class')).toMatch(/\bexpanded\b/);
    }

    async function testNavItemHeading(heading: ElementFinder, level: number) {
      const children = page.getNavItemHeadingChildren(heading, level);

      // Headings are initially collapsed.
      await expectToBeCollapsed(children);

      // Ensure heading does not cause navigation when expanding.
      await page.click(heading);
      await expectToBeExpanded(children);
      expect(await page.locationPath()).toBe('/docs');

      // Recursively test child-headings (while this heading is expanded).
      const nextLevel = level + 1;
      const childNavItemHeadings = page.getNavItemHeadings(children, nextLevel);
      await childNavItemHeadings.each(childHeading => childHeading && testNavItemHeading(childHeading, nextLevel));

      // Ensure heading does not cause navigation when collapsing.
      await page.click(heading);
      await expectToBeCollapsed(children);
      expect(await page.locationPath()).toBe('/docs');
    }
  });

  it('should show the tutorial index page at `/tutorial` after jitterbugging through features', async () => {
    // check that we can navigate directly to the tutorial page
    await page.navigateTo('tutorial');
    expect(await page.getDocViewerText()).toMatch(/Tour of Heroes App and Tutorial/i);

    // navigate to a different page
    await page.click(page.getTopMenuLink('features'));
    expect(await page.getDocViewerText()).toMatch(/Progressive web apps/i);

    // Show the menu
    await page.click(page.docsMenuLink);

    // Tutorial folder should still be expanded because this test runs in wide mode
    // Navigate to the tutorial introduction via a link in the sidenav
    await page.click(page.getNavItem(/The Hero Editor/i));
    expect(await page.getDocViewerText()).toMatch(/The Hero Editor/i);
  });

  it('should render `{@example}` dgeni tags as `<code-example>` elements with HTML escaped content', async () => {
    await page.navigateTo('guide/component-styles');
    const codeExample = element.all(by.css('code-example')).first();
    expect(await page.getInnerHtml(codeExample)).toContain('&lt;h1&gt;Tour of Heroes&lt;/h1&gt;');
  });

  describe('scrolling to the top', () => {
    it('should scroll to the top when navigating to another page', async () => {
      await page.navigateTo('guide/security');
      await page.scrollTo('bottom');
      expect(await page.getScrollTop()).toBeGreaterThan(0);
      // Navigate to Reference section, then check
      // Find the navigation item that has the text "api"
      await page.click(page.getNavItem(/reference/i));
      await page.click(page.getNavItem(/api/i));
      expect(await page.locationPath()).toBe('/api');
      expect(await page.getScrollTop()).toBe(0);
    });

    it('should scroll to the top when navigating to the same page', async () => {
      await page.navigateTo('guide/security');

      await page.scrollTo('bottom');
      expect(await page.getScrollTop()).toBeGreaterThan(0);

      await page.click(page.getNavItem(/security/i));
      expect(await page.locationPath()).toBe('/guide/security');
      expect(await page.getScrollTop()).toBe(0);
    });
  });

  describe('tutorial docs', () => {
    it('should not render a paragraph element inside the h1 element', async () => {
      await page.navigateTo('tutorial/toh-pt1');
      expect(await element(by.css('h1 p')).isPresent()).toBeFalsy();
    });
  });

  describe('contributors page', () => {
    const groupButtons = element(by.css('.group-buttons')).all(by.css('.filter-button'));
    const contributors = element(by.css('.contributor-group')).all(by.css('aio-contributor'));

    beforeAll(() => page.navigateTo('about'));

    it('should have the expected groups', async () => {
      expect(await groupButtons.count()).toBe(3);

      const texts = await groupButtons.map<string>(btn => btn?.getText());
      expect(texts).toEqual(['ANGULAR', 'COLLABORATORS', 'GDE']);
    });

    it('should have contributors listed in each group', async () => {
      // WebDriver calls `scrollIntoView()` on the element to bring it into the visible area of the
      // browser, before clicking it. By default, this aligns the top of the element to the top of
      // the window. As a result, the element may end up behind the fixed top menu, thus being
      // unclickable. To avoid this, we click the element directly using JavaScript instead.
      const clickButton =
          (elementFinder: ElementFinder) => browser.executeScript('arguments[0].click()', elementFinder);
      const getContributorNames =
          () => contributors.all(by.css('h3')).map<string>(c => c?.getText());

      const names1 = await getContributorNames();
      expect(await contributors.count()).toBeGreaterThan(1);
      expect(names1.length).toBeGreaterThan(1);

      await clickButton(groupButtons.get(1));
      const names2 = await getContributorNames();
      expect(await contributors.count()).toBeGreaterThan(1);
      expect(names2.length).toBeGreaterThan(1);
      expect(names2).not.toEqual(names1);

      await clickButton(groupButtons.get(2));
      const names3 = await getContributorNames();
      expect(await contributors.count()).toBeGreaterThan(1);
      expect(names2.length).toBeGreaterThan(1);
      expect(names3).not.toEqual(names2);
      expect(names3).not.toEqual(names1);

      await clickButton(groupButtons.get(0));
      const names4 = await getContributorNames();
      expect(await contributors.count()).toBeGreaterThan(1);
      expect(names4.length).toBeGreaterThan(1);
      expect(names4).not.toEqual(names3);
      expect(names4).not.toEqual(names2);
      expect(names4).toEqual(names1);
    });
  });

  describe('google analytics', () => {

    it('should call ga with initial URL', async () => {
      await page.navigateTo('api');

      const path = await page.locationPath();
      const calls = await page.ga();

      // The last call (length-1) will be the `send` command
      // The second to last call (length-2) will be the command to `set` the page url
      expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
    });

    it('should call ga with new URL on navigation', async () => {
      await page.navigateTo('');
      await page.click(page.getTopMenuLink('features'));

      const path = await page.locationPath();
      const calls = await page.ga();

      // The last call (length-1) will be the `send` command
      // The second to last call (length-2) will be the command to `set` the page url
      expect(calls[calls.length - 2]).toEqual(['set', 'page', path]);
    });
  });

  describe('404 page', () => {
    it('should add or remove the "noindex" meta tag depending upon the validity of the page', async () => {
      await page.navigateTo('');
      expect(await element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();

      await page.navigateTo('does/not/exist');
      expect(await element(by.css('meta[name="robots"][content="noindex"]')).isPresent()).toBeTruthy();

      await page.click(page.getTopMenuLink('features'));
      expect(await element(by.css('meta[name="robots"]')).isPresent()).toBeFalsy();
    });

    it('should search the index for words found in the url', async () => {
      await page.navigateTo('common/http');
      const results = await page.getSearchResults();

      expect(results).toContain('common/http package');
    });
  });

  describe('suggest edit link', () => {
    it('should be present on all docs pages', async () => {
      await page.navigateTo('tutorial/toh-pt1');
      expect(await page.ghLinks.count()).toEqual(1);
      /* eslint-disable max-len */
      expect(await page.ghLinks.get(0).getAttribute('href'))
        .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/aio\/content\/tutorial\/toh-pt1\.md\?message=docs%3A%20describe%20your%20change\.\.\./);

      await page.navigateTo('guide/router');
      expect(await page.ghLinks.count()).toEqual(1);
      expect(await page.ghLinks.get(0).getAttribute('href'))
        .toMatch(/https:\/\/github\.com\/angular\/angular\/edit\/master\/aio\/content\/guide\/router\.md\?message=docs%3A%20describe%20your%20change\.\.\./);
      /* eslint-enable max-len */
    });

    it('should not be present on top level pages', async () => {
      await page.navigateTo('features');
      expect(await page.ghLinks.count()).toEqual(0);
    });
  });
});
