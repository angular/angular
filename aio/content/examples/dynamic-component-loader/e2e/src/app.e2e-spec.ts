import { browser, element, by } from 'protractor';

describe('Dynamic Component Loader', () => {

  // The tests trigger periodic asynchronous operations (via `setInterval()`), which will prevent
  // the app from stabilizing. See https://angular.io/api/core/ApplicationRef#is-stable-examples
  // for more details.
  // To allow the tests to complete, we will disable automatically waiting for the Angular app to
  // stabilize.
  beforeAll(() => browser.waitForAngularEnabled(false));
  afterAll(() => browser.waitForAngularEnabled(true));

  beforeEach(() => browser.get(''));

  it('should load ad banner', async () => {
    const headline = element(by.cssContainingText('h3', 'Featured Hero Profile'));
    const name = element(by.cssContainingText('h4', 'Bombasto'));
    const bio = element(by.cssContainingText('p', 'Brave as they come'));

    expect(await headline.isPresent()).toBe(true);
    expect(await name.isPresent()).toBe(true);
    expect(await bio.isPresent()).toBe(true);
  });
});
