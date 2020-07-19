import { browser, element, ElementFinder, by } from 'protractor';

describe('Lifecycle hooks', () => {
  const sendKeys = (el: ElementFinder, input: string) =>
    input.split('').reduce((prev, c) => prev.then(() => el.sendKeys(c)), Promise.resolve());

  beforeAll(() => {
    browser.get('');
  });

  it('should open correctly', () => {
    expect(element.all(by.css('h2')).get(0).getText()).toEqual('Peek-A-Boo');
  });

  it('should support peek-a-boo', async () => {
    const pabComp = element(by.css('peek-a-boo-parent peek-a-boo'));
    expect(pabComp.isPresent()).toBe(false, 'should not be able to find the "peek-a-boo" component');

    const pabButton = element.all(by.css('peek-a-boo-parent button')).get(0);
    const updateHeroButton = element.all(by.css('peek-a-boo-parent button')).get(1);
    expect(pabButton.getText()).toContain('Create Peek');

    await pabButton.click();
    expect(pabButton.getText()).toContain('Destroy Peek');
    expect(pabComp.isDisplayed()).toBe(true, 'should be able to see the "peek-a-boo" component');
    expect(pabComp.getText()).toContain('Windstorm');
    expect(pabComp.getText()).not.toContain('Windstorm!');
    expect(updateHeroButton.isPresent()).toBe(true, 'should be able to see the update hero button');

    await updateHeroButton.click();
    expect(pabComp.getText()).toContain('Windstorm!');

    await pabButton.click();
    expect(pabComp.isPresent()).toBe(false, 'should no longer be able to find the "peek-a-boo" component');
  });

  it('should support OnChanges hook', () => {
    const onChangesViewEle = element.all(by.css('on-changes div')).get(0);
    const inputEles = element.all(by.css('on-changes-parent input'));
    const heroNameInputEle = inputEles.get(1);
    const powerInputEle = inputEles.get(0);
    const titleEle = onChangesViewEle.element(by.css('p'));
    const changeLogEles = onChangesViewEle.all(by.css('div'));

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

  it('should support DoCheck hook', async () => {
    const doCheckViewEle = element.all(by.css('do-check div')).get(0);
    const inputEles = element.all(by.css('do-check-parent input'));
    const heroNameInputEle = inputEles.get(1);
    const powerInputEle = inputEles.get(0);
    const titleEle = doCheckViewEle.element(by.css('p'));
    const changeLogEles = doCheckViewEle.all(by.css('div'));
    let logCount: number;

    expect(titleEle.getText()).toContain('Windstorm can sing');

    let count = await changeLogEles.count();
    // 3 messages to start
    expect(count).toEqual(3, 'should start with 3 messages');

    logCount = count;
    await sendKeys(heroNameInputEle, '-foo-');
    count = await changeLogEles.count();
    expect(titleEle.getText()).toContain('Windstorm-foo- can sing');
    expect(count).toBeGreaterThanOrEqual(logCount + 5, 'should add at least one more message for each keystroke');

    logCount = count;
    await sendKeys(powerInputEle, '-bar-');
    count = await changeLogEles.count();
    expect(titleEle.getText()).toContain('Windstorm-foo- can sing-bar-');
    expect(count).toBeGreaterThanOrEqual(logCount + 5, 'should add at least one more message for each keystroke');
  });

  it('should support AfterView hooks', async () => {
    const parentEle = element(by.tagName('after-view-parent'));
    const buttonEle = parentEle.element(by.tagName('button')); // Reset
    const commentEle = parentEle.element(by.className('comment'));
    const logEles = parentEle.all(by.css('h4 ~ div'));
    const childViewInputEle = parentEle.element(by.css('app-child-view input'));
    let logCount: number;

    expect(childViewInputEle.getAttribute('value')).toContain('Magneta');
    expect(commentEle.isPresent()).toBe(false, 'comment should not be in DOM');

    logCount = await logEles.count();
    await childViewInputEle.sendKeys('-test-');

    expect(childViewInputEle.getAttribute('value')).toContain('-test-');
    expect(commentEle.isPresent()).toBe(true, 'should have comment because >10 chars');
    expect(commentEle.getText()).toContain('long name');

    const count = await logEles.count();
    expect(logCount + 7).toBeGreaterThan(count - 3, '7 additional log messages should have been added');
    expect(logCount + 7).toBeLessThan(count + 3, '7 additional log messages should have been added');

    logCount = count;
    await buttonEle.click();
    expect(logEles.count()).toBeLessThan(logCount, 'log should shrink after reset');
  });

  it('should support AfterContent hooks', async () => {
    const parentEle = element(by.tagName('after-content-parent'));
    const buttonEle = parentEle.element(by.tagName('button')); // Reset
    const commentEle = parentEle.element(by.className('comment'));
    const logEles = parentEle.all(by.css('h4 ~ div'));
    const childViewInputEle = parentEle.element(by.css('app-child input'));
    let logCount = await logEles.count();

    expect(childViewInputEle.getAttribute('value')).toContain('Magneta');
    expect(commentEle.isPresent()).toBe(false, 'comment should not be in DOM');

    await sendKeys(childViewInputEle, '-test-');
    const count = await logEles.count();
    expect(childViewInputEle.getAttribute('value')).toContain('-test-');
    expect(commentEle.isPresent()).toBe(true, 'should have comment because >10 chars');
    expect(commentEle.getText()).toContain('long name');
    expect(count).toBeGreaterThanOrEqual(logCount + 5, 'additional log messages should have been added');

    logCount = count;
    await buttonEle.click();
    expect(logEles.count()).toBeLessThan(logCount, 'log should shrink after reset');
  });

  it('should support spy\'s OnInit & OnDestroy hooks', async () => {
    const inputEle = element(by.css('spy-parent input'));
    const addHeroButtonEle = element(by.cssContainingText('spy-parent button', 'Add Hero'));
    const resetHeroesButtonEle = element(by.cssContainingText('spy-parent button', 'Reset Heroes'));
    const heroEles = element.all(by.css('spy-parent div[mySpy'));
    const logEles = element.all(by.css('spy-parent h4 ~ div'));

    expect(heroEles.count()).toBe(2, 'should have two heroes displayed');
    expect(logEles.count()).toBe(2, 'should have two log entries');

    await inputEle.sendKeys('-test-');
    await addHeroButtonEle.click();
    expect(heroEles.count()).toBe(3, 'should have added one hero');
    expect(heroEles.get(2).getText()).toContain('-test-');
    expect(logEles.count()).toBe(3, 'should now have 3 log entries');

    await resetHeroesButtonEle.click();
    expect(heroEles.count()).toBe(0, 'should no longer have any heroes');
    expect(logEles.count()).toBe(7, 'should now have 7 log entries - 3 orig + 1 reset + 3 removeall');
  });

  it('should support "spy counter"', async () => {
    const updateCounterButtonEle = element(by.cssContainingText('counter-parent button', 'Update'));
    const resetCounterButtonEle = element(by.cssContainingText('counter-parent button', 'Reset'));
    const textEle = element(by.css('counter-parent app-counter > div'));
    const logEles = element.all(by.css('counter-parent h4 ~ div'));

    expect(textEle.getText()).toContain('Counter = 0');
    expect(logEles.count()).toBe(2, 'should start with two log entries');

    await updateCounterButtonEle.click();
    expect(textEle.getText()).toContain('Counter = 1');
    expect(logEles.count()).toBe(3, 'should now have 3 log entries');

    await resetCounterButtonEle.click();
    expect(textEle.getText()).toContain('Counter = 0');
    expect(logEles.count()).toBe(7, 'should now have 7 log entries - 3 prev + 1 reset + 2 destroy + 1 init');
  });
});
