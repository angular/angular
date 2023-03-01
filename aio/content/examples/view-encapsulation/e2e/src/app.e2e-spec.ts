/* eslint-disable max-len */
import { browser, by, element, logging, WebElement } from 'protractor';

describe('View Encapsulation App', () => {

  const RED = 'rgba(255, 0, 0, 1)';
  const GREEN = 'rgba(0, 128, 0, 1)';
  const BLUE = 'rgba(0, 0, 255, 1)';

  beforeAll(() => browser.get(''));

  it('should color the `NoEncapsulationComponent` heading red, when it is at the top level', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-no-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(RED);
  });

  it('should color the `NoEncapsulationComponent` message red, when it is at the top level', async () => {
    const noEncapsulationMessage = element(by.css('app-root > app-no-encapsulation > .none-message'));
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(RED);
  });

  it('should color the `EmulatedEncapsulationComponent` heading green, when it is at the top level', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-emulated-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(GREEN);
  });

  it('should color the `EmulatedEncapsulationComponent` message green, when it is at the top level', async () => {
    const noEncapsulationMessage = element(by.css('app-root > app-emulated-encapsulation > .emulated-message'));
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(GREEN);
  });

  it('should color the `NoEncapsulationComponent` heading red, when it is a child of `EmulatedEncapsulationComponent`)', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-emulated-encapsulation > app-no-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(RED);
  });

  it('should color the `NoEncapsulationComponent` message red, when it is a child of `EmulatedEncapsulationComponent`)', async () => {
    const noEncapsulationMessage = element(by.css('app-root > app-emulated-encapsulation > app-no-encapsulation > .none-message'));
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(RED);
  });

  it('should color the `ShadowDomEncapsulationComponent` heading blue', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(BLUE);
  });

  it('should color the `ShadowDomEncapsulationComponent` message blue', async () => {
    const noEncapsulationHMessage = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', '.shadow-message');
    expect(await noEncapsulationHMessage.getCssValue('color')).toEqual(BLUE);
  });

  it('should color the `EmulatedEncapsulationComponent` heading green, when it is a child of `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(GREEN);
  });

  it('should color the `EmulatedEncapsulationComponent` message green, when it is a child of `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationMessage = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > .emulated-message');
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(GREEN);
  });

  it('should color the `NoEncapsulationComponent` heading blue (not red!), when it is a child of the `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-no-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(BLUE);
  });

  it('should color the `NoEncapsulationComponent` message red (not blue!), when it is a child of the `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationMessage = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-no-encapsulation > .none-message');
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(RED);
  });

  it('should color the `NoEncapsulationComponent` heading blue (not red!), when it is a child of the `EmulatedEncapsulationComponent`, which is a child of the `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > app-no-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual(BLUE);
  });

  it('should color the `NoEncapsulationComponent` message red (not blue!), when it is a child of the `EmulatedEncapsulationComponent`, which is a child of the `ShadowDomEncapsulationComponent`', async () => {
    const noEncapsulationMessage = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > app-no-encapsulation > .none-message');
    expect(await noEncapsulationMessage.getCssValue('color')).toEqual(RED);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});


async function findShadowDomElement(shadowHostSelector: string, shadowElementSelector: string): Promise<WebElement> {
  const shadowHost = browser.findElement(by.css(shadowHostSelector));
  const shadowRoot: any = await browser.executeScript('return arguments[0].shadowRoot', shadowHost);
  // Using this solution to find the shadow element after Chrome 97: https://stackoverflow.com/a/70611425.
  const rootKey = Object.keys(shadowRoot)[0];
  const rootId = shadowRoot[rootKey];
  return new WebElement(browser, rootId).findElement(by.css(shadowElementSelector));
}
