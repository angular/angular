'use strict'; // necessary for es6 output in node 

import { browser, element, by } from 'protractor';

describe('Lifecycle hooks', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should open correctly', function () {
    expect(element.all(by.css('h2')).get(0).getText()).toEqual('Peek-A-Boo');
  });

  it('should support peek-a-boo', function () {
    let pabComp = element(by.css('peek-a-boo-parent peek-a-boo'));
    expect(pabComp.isPresent()).toBe(false, 'should not be able to find the "peek-a-boo" component');
    let pabButton = element.all(by.css('peek-a-boo-parent button')).get(0);
    let updateHeroButton = element.all(by.css('peek-a-boo-parent button')).get(1);
    expect(pabButton.getText()).toContain('Create Peek');
    pabButton.click().then(function () {
      expect(pabButton.getText()).toContain('Destroy Peek');
      expect(pabComp.isDisplayed()).toBe(true, 'should be able to see the "peek-a-boo" component');
      expect(pabComp.getText()).toContain('Windstorm');
      expect(pabComp.getText()).not.toContain('Windstorm!');
      expect(updateHeroButton.isPresent()).toBe(true, 'should be able to see the update hero button');
      return updateHeroButton.click();
    }).then(function () {
      expect(pabComp.getText()).toContain('Windstorm!');
      return pabButton.click();
    }).then(function () {
      expect(pabComp.isPresent()).toBe(false, 'should no longer be able to find the "peek-a-boo" component');
    });
  });

  it('should support OnChanges hook', function () {
    let onChangesViewEle = element.all(by.css('on-changes div')).get(0);
    let inputEles = element.all(by.css('on-changes-parent input'));
    let heroNameInputEle = inputEles.get(1);
    let powerInputEle = inputEles.get(0);
    let titleEle = onChangesViewEle.element(by.css('p'));
    let changeLogEles = onChangesViewEle.all(by.css('div'));

    expect(titleEle.getText()).toContain('Windstorm can sing');
    expect(changeLogEles.count()).toEqual(2, 'should start with 2 messages');
    heroNameInputEle.sendKeys('-foo-');
    expect(titleEle.getText()).toContain('Windstorm-foo- can sing');
    expect(changeLogEles.count()).toEqual(2, 'should still have 2 messages');
    powerInputEle.sendKeys('-bar-');
    expect(titleEle.getText()).toContain('Windstorm-foo- can sing-bar-');
    // 7 == 2 previously + length of '-bar-'
    expect(changeLogEles.count()).toEqual(7, 'should have 7 messages now');
  });

  it('should support DoCheck hook', function () {
    let doCheckViewEle = element.all(by.css('do-check div')).get(0);
    let inputEles = element.all(by.css('do-check-parent input'));
    let heroNameInputEle = inputEles.get(1);
    let powerInputEle = inputEles.get(0);
    let titleEle = doCheckViewEle.element(by.css('p'));
    let changeLogEles = doCheckViewEle.all(by.css('div'));
    let logCount: number;

    expect(titleEle.getText()).toContain('Windstorm can sing');
    changeLogEles.count().then(function(count: number) {
      // 3 messages to start
      expect(count).toEqual(3, 'should start with 3 messages');
      logCount = count;
      return heroNameInputEle.sendKeys('-foo-');
    }).then(function () {
      expect(titleEle.getText()).toContain('Windstorm-foo- can sing');
      return changeLogEles.count();
    }).then(function(count: number) {
      // one more for each keystroke
      expect(count).toEqual(logCount + 5, 'should add 5 more messages');
      logCount = count;
      return powerInputEle.sendKeys('-bar-');
    }).then(function () {
      expect(titleEle.getText()).toContain('Windstorm-foo- can sing-bar-');
      expect(changeLogEles.count()).toEqual(logCount + 6, 'should add 6 more messages');
    });
  });

  it('should support AfterView hooks', function () {
    let parentEle = element(by.tagName('after-view-parent'));
    let buttonEle = parentEle.element(by.tagName('button')); // Reset
    let commentEle = parentEle.element(by.className('comment'));
    let logEles = parentEle.all(by.css('h4 ~ div'));
    let childViewInputEle = parentEle.element(by.css('my-child-view input'));
    let logCount: number;

    expect(childViewInputEle.getAttribute('value')).toContain('Magneta');
    expect(commentEle.isPresent()).toBe(false, 'comment should not be in DOM');

    logEles.count().then(function(count: number) {
      logCount = count;
      return childViewInputEle.sendKeys('-test-');
    }).then(function() {
      expect(childViewInputEle.getAttribute('value')).toContain('-test-');
      expect(commentEle.isPresent()).toBe(true, 'should have comment because >10 chars');
      expect(commentEle.getText()).toContain('long name');
      return logEles.count();
    }).then(function(count: number) {
      expect(logCount + 7).toEqual(count, '7 additional log messages should have been added');
      logCount = count;
      return buttonEle.click();
    }).then(function() {
      expect(logEles.count()).toBeLessThan(logCount, 'log should shrink after reset');
    });
  });


  it('should support AfterContent hooks', function () {
    let parentEle = element(by.tagName('after-content-parent'));
    let buttonEle = parentEle.element(by.tagName('button')); // Reset
    let commentEle = parentEle.element(by.className('comment'));
    let logEles = parentEle.all(by.css('h4 ~ div'));
    let childViewInputEle = parentEle.element(by.css('my-child input'));
    let logCount: number;

    expect(childViewInputEle.getAttribute('value')).toContain('Magneta');
    expect(commentEle.isPresent()).toBe(false, 'comment should not be in DOM');

    logEles.count().then(function(count: number) {
      logCount = count;
      return childViewInputEle.sendKeys('-test-');
    }).then(function() {
      expect(childViewInputEle.getAttribute('value')).toContain('-test-');
      expect(commentEle.isPresent()).toBe(true, 'should have comment because >10 chars');
      expect(commentEle.getText()).toContain('long name');
      return logEles.count();
    }).then(function(count: number) {
      expect(logCount + 5).toEqual(count, '5 additional log messages should have been added');
      logCount = count;
      return buttonEle.click();
    }).then(function() {
      expect(logEles.count()).toBeLessThan(logCount, 'log should shrink after reset');
    });
  });

  it('should support spy\'s OnInit & OnDestroy hooks', function () {
    let inputEle = element(by.css('spy-parent input'));
    let addHeroButtonEle = element(by.cssContainingText('spy-parent button', 'Add Hero'));
    let resetHeroesButtonEle = element(by.cssContainingText('spy-parent button', 'Reset Heroes'));
    let heroEles = element.all(by.css('spy-parent div[mySpy'));
    let logEles = element.all(by.css('spy-parent h4 ~ div'));
    expect(heroEles.count()).toBe(2, 'should have two heroes displayed');
    expect(logEles.count()).toBe(2, 'should have two log entries');
    inputEle.sendKeys('-test-').then(function() {
      return addHeroButtonEle.click();
    }).then(function() {
      expect(heroEles.count()).toBe(3, 'should have added one hero');
      expect(heroEles.get(2).getText()).toContain('-test-');
      expect(logEles.count()).toBe(3, 'should now have 3 log entries');
      return resetHeroesButtonEle.click();
    }).then(function() {
      expect(heroEles.count()).toBe(0, 'should no longer have any heroes');
      expect(logEles.count()).toBe(7, 'should now have 7 log entries - 3 orig + 1 reset + 3 removeall');
    });
  });

  it('should support "spy counter"', function () {
    let updateCounterButtonEle = element(by.cssContainingText('counter-parent button', 'Update'));
    let resetCounterButtonEle = element(by.cssContainingText('counter-parent button', 'Reset'));
    let textEle = element(by.css('counter-parent my-counter > div'));
    let logEles = element.all(by.css('counter-parent h4 ~ div'));
    expect(textEle.getText()).toContain('Counter = 0');
    expect(logEles.count()).toBe(2, 'should start with two log entries');
    updateCounterButtonEle.click().then(function() {
      expect(textEle.getText()).toContain('Counter = 1');
      expect(logEles.count()).toBe(3, 'should now have 3 log entries');
      return resetCounterButtonEle.click();
    }).then(function() {
      expect(textEle.getText()).toContain('Counter = 0');
      expect(logEles.count()).toBe(7, 'should now have 7 log entries - 3 prev + 1 reset + 2 destroy + 1 init');
    });
  });
});
