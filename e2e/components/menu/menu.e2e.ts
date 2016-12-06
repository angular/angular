import { MenuPage } from './menu-page';

describe('menu', () => {
  let page: MenuPage;

  beforeEach(function() {
    page = new MenuPage();
  });

  it('should open menu when the trigger is clicked', () => {
    page.expectMenuPresent(false);
    page.trigger().click();

    page.expectMenuPresent(true);
    expect(page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
  });

  it('should close menu when menu item is clicked', () => {
    page.trigger().click();
    page.items(0).click();
    page.expectMenuPresent(false);
  });

  it('should run click handlers on regular menu items', () => {
    page.trigger().click();
    page.items(0).click();
    expect(page.getResultText()).toEqual('one');

    page.trigger().click();
    page.items(1).click();
    expect(page.getResultText()).toEqual('two');
  });

  it('should run not run click handlers on disabled menu items', () => {
    page.trigger().click();
    page.items(2).click();
    expect(page.getResultText()).toEqual('');
  });

  it('should support multiple triggers opening the same menu', () => {
    page.triggerTwo().click();
    expect(page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    page.expectMenuAlignedWith(page.menu(), 'trigger-two');

    page.backdrop().click();
    page.expectMenuPresent(false);

    // TODO(kara): temporary, remove when #1607 is fixed
    browser.sleep(250);
    page.trigger().click();
    expect(page.menu().getText()).toEqual('One\nTwo\nThree\nFour');
    page.expectMenuAlignedWith(page.menu(), 'trigger');

    page.backdrop().click();
    page.expectMenuPresent(false);
  });

  it('should mirror classes on host to menu template in overlay', () => {
    page.trigger().click();
    page.menu().getAttribute('class').then(classes => {
      expect(classes).toContain('md-menu-panel custom');
    });
  });

  describe('keyboard events', () => {
    beforeEach(() => {
      // click start button to avoid tabbing past navigation
      page.start().click();
      page.pressKey(protractor.Key.TAB);
    });

    it('should auto-focus the first item when opened with ENTER', () => {
      page.pressKey(protractor.Key.ENTER);
      page.expectFocusOn(page.items(0));
    });

    it('should auto-focus the first item when opened with SPACE', () => {
      page.pressKey(protractor.Key.SPACE);
      page.expectFocusOn(page.items(0));
    });

    it('should not focus the first item when opened with mouse', () => {
      page.trigger().click();
      page.expectFocusOn(page.trigger());
    });

    it('should focus subsequent items when down arrow is pressed', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.DOWN);
      page.expectFocusOn(page.items(1));
    });

    it('should focus previous items when up arrow is pressed', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.DOWN);
      page.pressKey(protractor.Key.UP);
      page.expectFocusOn(page.items(0));
    });

    it('should skip disabled items using arrow keys', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.DOWN);
      page.pressKey(protractor.Key.DOWN);
      page.expectFocusOn(page.items(3));

      page.pressKey(protractor.Key.UP);
      page.expectFocusOn(page.items(1));
    });

    it('should close the menu when tabbing past items', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.TAB);
      page.expectMenuPresent(false);

      page.pressKey(protractor.Key.TAB);
      page.pressKey(protractor.Key.ENTER);
      page.expectMenuPresent(true);

      page.pressKey(protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB));
      page.expectMenuPresent(false);
    });

    it('should wrap back to menu when arrow keying past items', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.DOWN);
      page.pressKey(protractor.Key.DOWN);
      page.pressKey(protractor.Key.DOWN);
      page.expectFocusOn(page.items(0));

      page.pressKey(protractor.Key.UP);
      page.expectFocusOn(page.items(3));
    });

    it('should focus before and after trigger when tabbing past items', () => {
      page.pressKey(protractor.Key.ENTER);
      page.pressKey(protractor.Key.TAB);
      page.expectFocusOn(page.triggerTwo());

      // navigate back to trigger
      page.pressKey(protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB));
      page.pressKey(protractor.Key.ENTER);

      page.pressKey(protractor.Key.chord(protractor.Key.SHIFT, protractor.Key.TAB));
      page.expectFocusOn(page.start());
    });

  });

  describe('position - ', () => {

    it('should default menu alignment to "after below" when not set', () => {
      page.trigger().click();

      // menu.x should equal trigger.x, menu.y should equal trigger.y
      page.expectMenuAlignedWith(page.menu(), 'trigger');
    });

    it('should align overlay end to origin end when x-position is "before"', () => {
      page.beforeTrigger().click();
      page.beforeTrigger().getLocation().then(trigger => {

        // the menu's right corner must be attached to the trigger's right corner.
        // menu = 112px wide. trigger = 60px wide.  112 - 60 =  52px of menu to the left of trigger.
        // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x (left corner)
        // menu.y should equal trigger.y because only x position has changed.
        page.expectMenuLocation(page.beforeMenu(), {x: trigger.x - 52, y: trigger.y});
      });
    });

    it('should align overlay bottom to origin bottom when y-position is "above"', () => {
      page.aboveTrigger().click();
      page.aboveTrigger().getLocation().then(trigger => {

        // the menu's bottom corner must be attached to the trigger's bottom corner.
        // menu.x should equal trigger.x because only y position has changed.
        // menu = 64px high. trigger = 20px high. 64 - 20 = 44px of menu extending up past trigger.
        // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y (top corner)
        page.expectMenuLocation(page.aboveMenu(), {x: trigger.x, y: trigger.y - 44});
      });
    });

    it('should align menu to top left of trigger when "below" and "above"', () => {
      page.combinedTrigger().click();
      page.combinedTrigger().getLocation().then(trigger => {

        // trigger.x (left corner) - 52px (menu left of trigger) = expected menu.x
        // trigger.y (top corner) - 44px (menu above trigger) = expected menu.y
        page.expectMenuLocation(page.combinedMenu(), {x: trigger.x - 52, y: trigger.y - 44});
      });
    });

  });
});
