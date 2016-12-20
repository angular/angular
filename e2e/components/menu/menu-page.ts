import {browser, by, element, ElementFinder, ProtractorBy} from 'protractor';

export class MenuPage {

  constructor() {
    browser.get('/menu');
  }

  menu() { return element(by.css('.md-menu-panel')); }

  start() { return element(by.id('start')); }

  trigger() { return element(by.id('trigger')); }

  triggerTwo() { return element(by.id('trigger-two')); }

  backdrop() { return element(by.css('.cdk-overlay-backdrop')); }

  items(index: number) { return element.all(by.css('[md-menu-item]')).get(index); }

  textArea() { return element(by.id('text')); }

  beforeTrigger() { return element(by.id('before-t')); }

  aboveTrigger() { return element(by.id('above-t')); }

  combinedTrigger() { return element(by.id('combined-t')); }

  beforeMenu() { return element(by.css('.md-menu-panel.before')); }

  aboveMenu() { return element(by.css('.md-menu-panel.above')); }

  combinedMenu() { return element(by.css('.md-menu-panel.combined')); }

  // TODO(kara): move to common testing utility
  pressKey(key: string): void {
    browser.actions().sendKeys(key).perform();
  }

  // TODO(kara): move to common testing utility
  expectFocusOn(el: any): void {
    expect(browser.driver.switchTo().activeElement().getInnerHtml())
        .toBe(el.getInnerHtml());
  }

  expectMenuPresent(expected: boolean) {
    return browser.isElementPresent(by.css('.md-menu-panel') as ProtractorBy)
        .then((isPresent: boolean) => {
          expect(isPresent).toBe(expected);
        });
  }

  expectMenuLocation(el: ElementFinder, {x, y}: {x: number, y: number}) {
    el.getLocation().then(loc => {
      expect(loc.x).toEqual(x, 'Expect the x-position to be equal');
      expect(loc.y).toEqual(y, 'Expect the y-position to be equal');
    });
  }

  expectMenuAlignedWith(el: ElementFinder, id: string) {
    element(by.id(id)).getLocation().then(loc => {
      this.expectMenuLocation(el, {x: loc.x, y: loc.y});
    });
  }

  getResultText() {
    return this.textArea().getText();
  }
}
