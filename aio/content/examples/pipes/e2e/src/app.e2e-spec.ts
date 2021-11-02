import { browser, element, by } from 'protractor';

describe('Pipes', () => {

  beforeAll(() => browser.get(''));

  it('should open correctly', async () => {
    expect(await element.all(by.tagName('h1')).get(0).getText()).toEqual('Pipes');
    expect(await element(by.css('app-hero-birthday p')).getText()).toEqual(`The hero's birthday is Apr 15, 1988`);
  });

  it('should show 4 heroes', async () => {
    expect(await element.all(by.css('app-hero-list div')).count()).toEqual(4);
  });

  it('should show a familiar hero in json', async () => {
    expect(await element(by.cssContainingText('app-hero-list p', 'Heroes as JSON')).getText()).toContain('Bombasto');
  });

  it('should show alternate birthday formats', async () => {
    expect(await element(by.cssContainingText('app-root > p', `The hero's birthday is Apr 15, 1988`)).isDisplayed())
        .toBe(true);
    expect(await element(by.cssContainingText('app-root > p', `The hero's birthday is 04/15/88`)).isDisplayed())
        .toBe(true);
  });

  it('should be able to toggle birthday formats', async () => {
    const birthDayEle = element(by.css('app-hero-birthday2 > p'));
    expect(await birthDayEle.getText()).toEqual(`The hero's birthday is 4/15/88`);

    const buttonEle = element(by.cssContainingText('app-hero-birthday2 > button', 'Toggle Format'));
    expect(await buttonEle.isDisplayed()).toBe(true);

    await buttonEle.click();
    expect(await birthDayEle.getText()).toEqual(`The hero's birthday is Friday, April 15, 1988`);
  });

  it('should be able to chain and compose pipes', async () => {
    const chainedPipeEles = element.all(by.cssContainingText('app-root p', `The chained hero's`));
    expect(await chainedPipeEles.count()).toBe(3, 'should have 3 chained pipe examples');
    expect(await chainedPipeEles.get(0).getText()).toContain('APR 15, 1988');
    expect(await chainedPipeEles.get(1).getText()).toContain('FRIDAY, APRIL 15, 1988');
    expect(await chainedPipeEles.get(2).getText()).toContain('FRIDAY, APRIL 15, 1988');
  });

  it('should be able to use ExponentialStrengthPipe pipe', async () => {
    const ele = element(by.css('app-power-booster p'));
    expect(await ele.getText()).toContain('Super power boost: 1024');
  });

  it('should be able to use the exponential calculator', async () => {
    const eles = element.all(by.css('app-power-boost-calculator input'));
    const baseInputEle = eles.get(0);
    const factorInputEle = eles.get(1);
    const outputEle = element(by.css('app-power-boost-calculator p'));

    await baseInputEle.clear();
    await baseInputEle.sendKeys('7');
    await factorInputEle.clear();
    await factorInputEle.sendKeys('3');
    expect(await outputEle.getText()).toContain('343');
  });


  it('should support flying heroes (pure) ', async () => {
    const nameEle = element(by.css('app-flying-heroes input[type="text"]'));
    const canFlyCheckEle = element(by.css('app-flying-heroes #can-fly'));
    const mutateCheckEle = element(by.css('app-flying-heroes #mutate'));
    const resetEle = element(by.css('app-flying-heroes button'));
    const flyingHeroesEle = element.all(by.css('app-flying-heroes #flyers div'));

    expect(await canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(await mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(await flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    await nameEle.sendKeys('test1\n');
    expect(await flyingHeroesEle.count()).toEqual(2, 'no change while mutating array');

    await mutateCheckEle.click();
    await nameEle.sendKeys('test2\n');
    expect(await flyingHeroesEle.count()).toEqual(4, 'not mutating; should see both adds');
    expect(await flyingHeroesEle.get(2).getText()).toContain('test1');
    expect(await flyingHeroesEle.get(3).getText()).toContain('test2');

    await resetEle.click();
    expect(await flyingHeroesEle.count()).toEqual(2, 'reset should restore original flying heroes');
  });


  it('should support flying heroes (impure) ', async () => {
    const nameEle = element(by.css('app-flying-heroes-impure input[type="text"]'));
    const canFlyCheckEle = element(by.css('app-flying-heroes-impure #can-fly'));
    const mutateCheckEle = element(by.css('app-flying-heroes-impure #mutate'));
    const flyingHeroesEle = element.all(by.css('app-flying-heroes-impure #flyers div'));

    expect(await canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(await mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(await flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    await nameEle.sendKeys('test1\n');
    expect(await flyingHeroesEle.count()).toEqual(3, 'new flying hero should show in mutating array');
  });

  it('should show an async hero message', async () => {
    expect(await element.all(by.tagName('app-hero-async-message')).get(0).getText()).toContain('hero');
  });

});
