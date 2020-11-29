import { browser, element, by } from 'protractor';

describe('Attribute directives', () => {

  const title = 'My First Attribute Directive';

  beforeAll(() => browser.get(''));

  it(`should display correct title: ${title}`, async () => {
    expect(await element(by.css('h1')).getText()).toEqual(title);
  });

  it('should be able to select green highlight', async () => {
    const highlightedEle = element(by.cssContainingText('p', 'Highlight me!'));
    const lightGreen = 'rgba(144, 238, 144, 1)';
    const getBgColor = () => highlightedEle.getCssValue('background-color');

    expect(await highlightedEle.getCssValue('background-color')).not.toEqual(lightGreen);

    const greenRb = element.all(by.css('input')).get(0);
    await greenRb.click();
    await browser.actions().mouseMove(highlightedEle).perform();

    // Wait for up to 4s for the background color to be updated,
    // to account for slow environments (e.g. CI).
    await browser.wait(async () => await getBgColor() === lightGreen, 4000);
  });
});
