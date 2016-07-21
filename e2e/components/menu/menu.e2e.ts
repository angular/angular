describe('menu', function () {
  beforeEach(function() {
    browser.get('/menu');
  });

  it('should open menu when the trigger is clicked', function () {
    expectMenuPresent(false);
    element(by.id('trigger')).click();

    expectMenuPresent(true);
    expect(element(by.css('.md-menu')).getText()).toEqual("One\nTwo\nThree");
  });

  it('should align menu when open', function() {
    element(by.id('trigger')).click();
    expectMenuAlignedWith('trigger');
  });

  it('should close menu when area outside menu is clicked', function () {
    element(by.id('trigger')).click();
    element(by.tagName('body')).click();
    expectMenuPresent(false);
  });

  it('should close menu when menu item is clicked', function () {
    element(by.id('trigger')).click();
    element(by.id('one')).click();
    expectMenuPresent(false);
  });

  it('should run click handlers on regular menu items', function() {
    element(by.id('trigger')).click();
    element(by.id('one')).click();
    expect(element(by.id('text')).getText()).toEqual('one');

    element(by.id('trigger')).click();
    element(by.id('two')).click();
    expect(element(by.id('text')).getText()).toEqual('two');
  });

  it('should run not run click handlers on disabled menu items', function() {
    element(by.id('trigger')).click();
    element(by.id('three')).click();
    expect(element(by.id('text')).getText()).toEqual('');
  });

  it('should support multiple triggers opening the same menu', function() {
    element(by.id('trigger-two')).click();
    expect(element(by.css('.md-menu')).getText()).toEqual("One\nTwo\nThree");
    expectMenuAlignedWith('trigger-two');

    element(by.tagName('body')).click();
    expectMenuPresent(false);

    element(by.id('trigger')).click();
    expect(element(by.css('.md-menu')).getText()).toEqual("One\nTwo\nThree");
    expectMenuAlignedWith('trigger');

    element(by.tagName('body')).click();
    expectMenuPresent(false);
  });

  function expectMenuPresent(bool: boolean) {
    return browser.isElementPresent(by.css('.md-menu')).then((isPresent) => {
      expect(isPresent).toBe(bool);
    });
  }

  function expectMenuAlignedWith(id: string) {
    element(by.id(id)).getLocation().then((loc) => {
      expectMenuLocation({x: loc.x, y: loc.y});
    });
  }

  function expectMenuLocation({x,y}: {x: number, y: number}) {
    element(by.css('.md-menu')).getLocation().then((loc) => {
      expect(loc.x).toEqual(x);
      expect(loc.y).toEqual(y);
    });
  }
});
