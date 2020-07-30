import { browser, element, by } from 'protractor';

describe('Attribute directives', () => {

  const title = 'My First Attribute Directive';

  beforeAll(() => {
    browser.get('');
  });

  it(`should display correct title: ${title}`, () => {
    expect(element(by.css('h1')).getText()).toEqual(title);
  });

  it('should be able to select green highlight', () => {
    const highlightedEle = element(by.cssContainingText('p', 'Highlight me!'));
    const lightGreen = 'rgba(144, 238, 144, 1)';
    const getBgColor = () => highlightedEle.getCssValue('background-color');

    expect(highlightedEle.getCssValue('background-color')).not.toEqual(lightGreen);

    const greenRb = element.all(by.css('input')).get(0);
    greenRb.click();
    browser.actions().mouseMove(highlightedEle).perform();

    // Wait for up to 4s for the background color to be updated,
    // to account for slow environments (e.g. CI).
    browser.wait(() => highlightedEle.getCssValue('background-color').then(c => c === lightGreen), 4000);
  });
});
