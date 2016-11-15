describe('dialog', () => {
  beforeEach(() => browser.get('/dialog'));

  it('should open a dialog', () => {
    element(by.id('default')).click();
    waitForDialog().then(isPresent => expect(isPresent).toBe(true));
  });

  it('should close by clicking on the backdrop', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      waitForDialog().then(isPresent => expect(isPresent).toBe(false));
    });
  });

  it('should close by pressing escape', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      pressEscape();
      waitForDialog().then(isPresent => expect(isPresent).toBe(false));
    });
  });

  it('should close by clicking on the "close" button', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      element(by.id('close')).click();
      waitForDialog().then(isPresent => expect(isPresent).toBe(false));
    });
  });

  it('should focus the first focusable element', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      expectFocusOn(element(by.css('md-dialog-container input')));
    });
  });

  it('should restore focus to the element that opened the dialog', () => {
    let openButton = element(by.id('default'));

    openButton.click();

    waitForDialog().then(() => {
      clickOnBackrop();
      expectFocusOn(openButton);
    });
  });

  it('should prevent tabbing out of the dialog', () => {
    element(by.id('default')).click();

    waitForDialog().then(() => {
      let tab = protractor.Key.TAB;

      browser.actions().sendKeys(tab, tab, tab).perform();
      expectFocusOn(element(by.id('close')));
    });
  });

  it('should be able to prevent closing by clicking on the backdrop', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      clickOnBackrop();
      waitForDialog().then(isPresent => expect(isPresent).toBe(true));
    });
  });

  it('should be able to prevent closing by pressing escape', () => {
    element(by.id('disabled')).click();

    waitForDialog().then(() => {
      pressEscape();
      waitForDialog().then(isPresent => expect(isPresent).toBe(true));
    });
  });

  function waitForDialog() {
    return browser.isElementPresent(by.css('md-dialog-container'));
  }

  function clickOnBackrop() {
    browser.actions()
      // We need to move the cursor to the top left so
      // the dialog doesn't receive the click accidentally.
      .mouseMove(element(by.css('.md-overlay-backdrop')).getWebElement(), { x: 0, y: 0 })
      .click()
      .perform();
  }

  function pressEscape() {
    browser.actions().sendKeys(protractor.Key.ESCAPE).perform();
  }

  // TODO(crisbeto): should be moved to a common util. copied from the menu e2e setup.
  function expectFocusOn(el: any): void {
    expect(browser.driver.switchTo().activeElement().getInnerHtml()).toBe(el.getInnerHtml());
  }
});
