import ElementFinder = protractor.ElementFinder;

export class MenuPage {

  constructor() {
    browser.get('/menu');
  }

  menu() { return element(by.css('.md-menu')); }

  trigger() { return element(by.id('trigger')); }

  triggerTwo() { return element(by.id('trigger-two')); }

  body() { return element(by.tagName('body')); }

  items(index: number) {
    return element.all(by.css('[md-menu-item]')).get(index);
  }

  textArea() { return element(by.id('text')); }

  beforeTrigger() { return element(by.id('before-t')); }

  aboveTrigger() { return element(by.id('above-t')); }

  combinedTrigger() { return element(by.id('combined-t')); }

  beforeMenu() { return element(by.css('.md-menu.before')); }

  aboveMenu() { return element(by.css('.md-menu.above')); }

  combinedMenu() { return element(by.css('.md-menu.combined')); }

  expectMenuPresent(expected: boolean) {
    return browser.isElementPresent(by.css('.md-menu')).then((isPresent) => {
      expect(isPresent).toBe(expected);
    });
  }

  expectMenuLocation(el: ElementFinder, {x,y}: {x: number, y: number}) {
    el.getLocation().then((loc) => {
      expect(loc.x).toEqual(x);
      expect(loc.y).toEqual(y);
    });
  }

  expectMenuAlignedWith(el: ElementFinder, id: string) {
    element(by.id(id)).getLocation().then((loc) => {
      this.expectMenuLocation(el, {x: loc.x, y: loc.y});
    });
  }

  getResultText() {
    return this.textArea().getText();
  }
}
