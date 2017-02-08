import {browser, by, element, ElementFinder} from 'protractor';

export class MenuPage {
  constructor() { browser.get('/menu'); }

  menu(): ElementFinder { return element(by.css('.mat-menu-panel')); }

  start(): ElementFinder { return element(by.id('start')); }

  trigger(): ElementFinder { return element(by.id('trigger')); }

  triggerTwo(): ElementFinder { return element(by.id('trigger-two')); }

  backdrop(): ElementFinder { return element(by.css('.cdk-overlay-backdrop')); }

  items(index: number): ElementFinder { return element.all(by.css('[md-menu-item]')).get(index); }

  textArea(): ElementFinder { return element(by.id('text')); }

  beforeTrigger(): ElementFinder { return element(by.id('before-t')); }

  aboveTrigger(): ElementFinder { return element(by.id('above-t')); }

  combinedTrigger(): ElementFinder { return element(by.id('combined-t')); }

  beforeMenu(): ElementFinder { return element(by.css('.mat-menu-panel.before')); }

  aboveMenu(): ElementFinder { return element(by.css('.mat-menu-panel.above')); }

  combinedMenu(): ElementFinder { return element(by.css('.mat-menu-panel.combined')); }

  getResultText() { return this.textArea().getText(); }
}
