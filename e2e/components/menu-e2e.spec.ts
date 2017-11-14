import {Key, protractor, browser, by, element, ExpectedConditions} from 'protractor';
import {screenshot} from '../screenshot';
import {
  expectToExist,
  expectAlignedWith,
  expectFocusOn,
  expectLocation,
  pressKeys,
} from '../util/index';

const presenceOf = ExpectedConditions.presenceOf;
const not = ExpectedConditions.not;


describe('menu', () => {
  const menuSelector = '.mat-menu-panel';
  let page: MenuPage;

  beforeEach(() => page = new MenuPage());

  it('should open menu when the trigger is clicked', async () => {
    expectToExist(menuSelector, false);
    page.trigger().click();

    expectToExist(menuSelector);
    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    screenshot();
  });

  it('should close menu when menu item is clicked', () => {
    page.trigger().click();
    page.items(0).click();
    expectToExist(menuSelector, false);
    screenshot();
  });

  it('should run click handlers on regular menu items', async () => {
    page.trigger().click();
    page.items(0).click();
    expect(await page.getResultText()).toEqual('one');
    screenshot('one');

    page.trigger().click();
    page.items(1).click();
    expect(await page.getResultText()).toEqual('two');
    screenshot('two');
  });

  it('should run not run click handlers on disabled menu items', async () => {
    page.trigger().click();
    page.items(2).click();
    expect(await page.getResultText()).toEqual('');
    screenshot();
  });

  it('should support multiple triggers opening the same menu', async () => {
    page.triggerTwo().click();

    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    expectAlignedWith(page.menu(), '#trigger-two');

    page.backdrop().click();
    await browser.wait(not(presenceOf(element(by.css(menuSelector)))));
    await browser.wait(not(presenceOf(element(by.css('.cdk-overlay-backdrop')))));

    page.trigger().click();

    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    expectAlignedWith(page.menu(), '#trigger');

    page.backdrop().click();

    await browser.wait(not(presenceOf(element(by.css(menuSelector)))));
    await browser.wait(not(presenceOf(element(by.css('.cdk-overlay-backdrop')))));
  });

  it('should mirror classes on host to menu template in overlay', () => {
    page.trigger().click();
    expect(page.menu().getAttribute('class')).toContain('mat-menu-panel');
    expect(page.menu().getAttribute('class')).toContain('custom');
  });

  describe('keyboard events', () => {
    beforeEach(() => {
      // click start button to avoid tabbing past navigation
      page.start().click();
      pressKeys(Key.TAB);
    });

    it('should auto-focus the first item when opened with ENTER', () => {
      pressKeys(Key.ENTER);
      expectFocusOn(page.items(0));
    });

    it('should auto-focus the first item when opened with SPACE', () => {
      pressKeys(Key.SPACE);
      expectFocusOn(page.items(0));
    });

    it('should focus the panel when opened by mouse', () => {
      page.trigger().click();
      expectFocusOn(page.menu());
    });

    it('should focus subsequent items when down arrow is pressed', () => {
      pressKeys(Key.ENTER, Key.DOWN);
      expectFocusOn(page.items(1));
    });

    it('should focus previous items when up arrow is pressed', () => {
      pressKeys(Key.ENTER, Key.DOWN, Key.UP);
      expectFocusOn(page.items(0));
    });

    it('should skip disabled items using arrow keys', () => {
      pressKeys(Key.ENTER, Key.DOWN, Key.DOWN);
      expectFocusOn(page.items(3));

      pressKeys(Key.UP);
      expectFocusOn(page.items(1));
    });

    it('should close the menu when tabbing past items', () => {
      pressKeys(Key.ENTER, Key.TAB);
      expectToExist(menuSelector, false);

      pressKeys(Key.TAB, Key.ENTER);
      expectToExist(menuSelector);

      pressKeys(protractor.Key.chord(Key.SHIFT, Key.TAB));
      expectToExist(menuSelector, false);
    });

    it('should wrap back to menu when arrow keying past items', () => {
      let down = Key.DOWN;
      pressKeys(Key.ENTER, down, down, down);
      expectFocusOn(page.items(0));

      pressKeys(Key.UP);
      expectFocusOn(page.items(3));
    });

    it('should focus before and after trigger when tabbing past items', () => {
      let shiftTab = protractor.Key.chord(Key.SHIFT, Key.TAB);

      pressKeys(Key.ENTER, Key.TAB);
      expectFocusOn(page.triggerTwo());

      // navigate back to trigger
      pressKeys(shiftTab, Key.ENTER, shiftTab);
      expectFocusOn(page.start());
    });

  });

  describe('position - ', () => {

    it('should default menu alignment to "after below" when not set', async () => {
      page.trigger().click();

      // menu.x should equal trigger.x, menu.y should equal trigger.y
      await expectAlignedWith(page.menu(), '#trigger');
    });

    it('should align overlay end to origin end when x-position is "before"', async() => {
      page.beforeTrigger().click();

      const trigger = await page.beforeTrigger().getLocation();

      // the menu's right corner must be attached to the trigger's right corner.
      // menu = 112px wide. trigger = 60px wide.  112 - 60 =  52px of menu to the left of trigger.
      // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x (left corner)
      // menu.y should equal trigger.y because only x position has changed.
      expectLocation(page.beforeMenu(), {x: trigger.x - 52, y: trigger.y});
    });

    it('should align overlay bottom to origin bottom when y-position is "above"', async () => {
      page.aboveTrigger().click();

      const trigger = await page.aboveTrigger().getLocation();

      // the menu's bottom corner must be attached to the trigger's bottom corner.
      // menu.x should equal trigger.x because only y position has changed.
      // menu = 64px high. trigger = 20px high. 64 - 20 = 44px of menu extending up past trigger.
      // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y (top corner)
      expectLocation(page.aboveMenu(), {x: trigger.x, y: trigger.y - 44});
    });

    it('should align menu to top left of trigger when "below" and "above"', async () => {
      page.combinedTrigger().click();

      const trigger = await page.combinedTrigger().getLocation();

      // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x
      // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y
      expectLocation(page.combinedMenu(), {x: trigger.x - 52, y: trigger.y - 44});
    });

  });
});


export class MenuPage {
  constructor() { browser.get('/menu'); }
  menu = () => element(by.css('.mat-menu-panel'));
  start = () => element(by.id('start'));
  trigger = () => element(by.id('trigger'));
  triggerTwo = () => element(by.id('trigger-two'));
  backdrop = () => element(by.css('.cdk-overlay-backdrop'));
  items = (index: number) => element.all(by.css('[mat-menu-item]')).get(index);
  textArea = () => element(by.id('text'));
  beforeTrigger = () => element(by.id('before-t'));
  aboveTrigger = () => element(by.id('above-t'));
  combinedTrigger = () => element(by.id('combined-t'));
  beforeMenu = () => element(by.css('.mat-menu-panel.before'));
  aboveMenu = () => element(by.css('.mat-menu-panel.above'));
  combinedMenu = () => element(by.css('.mat-menu-panel.combined'));
  getResultText = () => this.textArea().getText();
}
