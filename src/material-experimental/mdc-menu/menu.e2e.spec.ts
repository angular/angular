import {browser, by, element, ExpectedConditions, Key} from 'protractor';
import {
  expectAlignedWith,
  expectFocusOn,
  expectLocation,
  expectToExist,
  pressKeys,
} from '../../cdk/testing/private/e2e';

const presenceOf = ExpectedConditions.presenceOf;
const not = ExpectedConditions.not;

describe('MDC-based menu', () => {
  const menuSelector = '.mat-mdc-menu-panel';
  const page = {
    menu: () => element(by.css(menuSelector)),
    start: () => element(by.id('start')),
    trigger: () => element(by.id('trigger')),
    triggerTwo: () => element(by.id('trigger-two')),
    backdrop: () => element(by.css('.cdk-overlay-backdrop')),
    items: (index: number) => element.all(by.css('[mat-menu-item]')).get(index),
    textArea: () => element(by.id('text')),
    beforeTrigger: () => element(by.id('before-t')),
    aboveTrigger: () => element(by.id('above-t')),
    combinedTrigger: () => element(by.id('combined-t')),
    beforeMenu: () => element(by.css(`${menuSelector}.before`)),
    aboveMenu: () => element(by.css(`${menuSelector}.above`)),
    combinedMenu: () => element(by.css(`${menuSelector}.combined`)),
    getResultText: () => page.textArea().getText(),
  };

  beforeEach(async () => await browser.get('/mdc-menu'));

  it('should open menu when the trigger is clicked', async () => {
    await expectToExist(menuSelector, false);
    await page.trigger().click();

    await expectToExist(menuSelector);
    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
  });

  it('should close menu when menu item is clicked', async () => {
    await page.trigger().click();
    await page.items(0).click();
    await expectToExist(menuSelector, false);
  });

  it('should run click handlers on regular menu items', async () => {
    await page.trigger().click();
    await page.items(0).click();
    expect(await page.getResultText()).toEqual('one');

    await page.trigger().click();
    await page.items(1).click();
    expect(await page.getResultText()).toEqual('two');
  });

  it('should run not run click handlers on disabled menu items', async () => {
    await page.trigger().click();
    await browser.actions().mouseMove(page.items(2)).click();
    expect(await page.getResultText()).toEqual('');
  });

  it('should support multiple triggers opening the same menu', async () => {
    await page.triggerTwo().click();

    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    await expectAlignedWith(page.menu(), '#trigger-two');

    await page.backdrop().click();
    await browser.wait(not(presenceOf(element(by.css(menuSelector)))));
    await browser.wait(not(presenceOf(element(by.css('.cdk-overlay-backdrop')))));

    await page.trigger().click();

    expect(await page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    await expectAlignedWith(page.menu(), '#trigger');

    await page.backdrop().click();

    await browser.wait(not(presenceOf(element(by.css(menuSelector)))));
    await browser.wait(not(presenceOf(element(by.css('.cdk-overlay-backdrop')))));
  });

  it('should mirror classes on host to menu template in overlay', async () => {
    await page.trigger().click();
    expect(await page.menu().getAttribute('class')).toContain('mat-mdc-menu-panel');
    expect(await page.menu().getAttribute('class')).toContain('custom');
  });

  describe('keyboard events', () => {
    beforeEach(async () => {
      // click start button to avoid tabbing past navigation
      await page.start().click();
      await pressKeys(Key.TAB);
    });

    it('should auto-focus the first item when opened with ENTER', async () => {
      await pressKeys(Key.ENTER);
      await expectFocusOn(page.items(0));
    });

    it('should auto-focus the first item when opened with SPACE', async () => {
      await pressKeys(Key.SPACE);
      await expectFocusOn(page.items(0));
    });

    it('should focus the first item when opened by mouse', async () => {
      await page.trigger().click();
      await expectFocusOn(page.items(0));
    });

    it('should focus subsequent items when down arrow is pressed', async () => {
      await pressKeys(Key.ENTER, Key.DOWN);
      await expectFocusOn(page.items(1));
    });

    it('should focus previous items when up arrow is pressed', async () => {
      await pressKeys(Key.ENTER, Key.DOWN, Key.UP);
      await expectFocusOn(page.items(0));
    });

    it('should skip disabled items using arrow keys', async () => {
      await pressKeys(Key.ENTER, Key.DOWN, Key.DOWN);
      await expectFocusOn(page.items(3));

      await pressKeys(Key.UP);
      await expectFocusOn(page.items(1));
    });

    it('should close the menu when tabbing past items', async () => {
      await pressKeys(Key.ENTER, Key.TAB);
      await expectToExist(menuSelector, false);

      await pressKeys(Key.TAB, Key.ENTER);
      await expectToExist(menuSelector);

      // Press SHIFT+TAB, but make sure to release SHIFT again.
      await pressKeys(Key.SHIFT, Key.TAB, Key.SHIFT);
      await expectToExist(menuSelector, false);
    });

    it('should wrap back to menu when arrow keying past items', async () => {
      let down = Key.DOWN;
      await pressKeys(Key.ENTER, down, down, down);
      await expectFocusOn(page.items(0));

      await pressKeys(Key.UP);
      await expectFocusOn(page.items(3));
    });

    it('should focus before and after trigger when tabbing past items', async () => {
      // Press SHIFT+TAB, but make sure to release SHIFT again.
      let shiftTab = [Key.SHIFT, Key.TAB, Key.SHIFT];

      await pressKeys(Key.ENTER, Key.TAB);
      await expectFocusOn(page.triggerTwo());

      // navigate back to trigger
      await pressKeys(...shiftTab, Key.ENTER, ...shiftTab);
      await expectFocusOn(page.start());
    });
  });

  describe('position - ', () => {
    it('should default menu alignment to "after below" when not set', async () => {
      await page.trigger().click();

      // menu.x should equal trigger.x, menu.y should equal trigger.y
      await expectAlignedWith(page.menu(), '#trigger');
    });

    it('should align overlay end to origin end when x-position is "before"', async () => {
      await page.beforeTrigger().click();

      const trigger = await page.beforeTrigger().getLocation();

      // the menu's right corner must be attached to the trigger's right corner.
      // menu = 112px wide. trigger = 60px wide. 112 - 60 = 52px of menu to the left of trigger.
      // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x (left corner)
      // menu.y should equal trigger.y because only x position has changed.
      await expectLocation(page.beforeMenu(), {x: trigger.x - 52, y: trigger.y});
    });

    it('should align overlay bottom to origin bottom when y-position is "above"', async () => {
      await page.aboveTrigger().click();

      const trigger = await page.aboveTrigger().getLocation();

      // the menu's bottom corner must be attached to the trigger's bottom corner.
      // menu.x should equal trigger.x because only y position has changed.
      // menu = 64px high. trigger = 20px high. 64 - 20 = 44px of menu extending up past trigger.
      // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y (top corner)
      await expectLocation(page.aboveMenu(), {x: trigger.x, y: trigger.y - 44});
    });

    it('should align menu to top left of trigger when "below" and "above"', async () => {
      await page.combinedTrigger().click();

      const trigger = await page.combinedTrigger().getLocation();

      // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x
      // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y
      await expectLocation(page.combinedMenu(), {x: trigger.x - 52, y: trigger.y - 44});
    });
  });
});
