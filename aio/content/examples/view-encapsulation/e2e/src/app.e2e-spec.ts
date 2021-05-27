import { browser, by, element, logging, WebElement } from 'protractor';

describe('View Encapsulation App', () => {

  beforeAll(() => browser.get(''));

  it('should colour the top level `NoEncapsulationComponent` red', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-no-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(255, 0, 0, 1)');
  });

  it('should colour the top level `EmulatedEncapsulationComponent` green', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-emulated-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(0, 128, 0, 1)');
  });

  it('should colour the `NoEncapsulationComponent` under the top level `EmulatedEncapsulationComponent` red', async () => {
    const noEncapsulationHeading = element(by.css('app-root > app-emulated-encapsulation > app-no-encapsulation > h2'));
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(255, 0, 0, 1)');
  });

  it('should colour the top level `ShadowDomEncapsulationComponent` blue', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(0, 0, 255, 1)');
  });

  it('should colour `EmulatedEncapsulationComponent` under the `ShadowDomEncapsulationComponent` green', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(0, 128, 0, 1)');
  });

  it('should colour `NoEncapsulationComponent` under the `ShadowDomEncapsulationComponent` blue (not red!)', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-no-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(0, 0, 255, 1)');
  });

  it('should colour `NoEncapsulationComponent` under the `EmulatedEncapsulationComponent` under the `ShadowDomEncapsulationComponent` blue (not red!)', async () => {
    const noEncapsulationHeading = await findShadowDomElement('app-root > app-shadow-dom-encapsulation', 'app-emulated-encapsulation > app-no-encapsulation > h2');
    expect(await noEncapsulationHeading.getCssValue('color')).toEqual('rgba(0, 0, 255, 1)');
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
  return shadowRoot.findElement(by.css(shadowElementSelector));
}
