import { browser, element, by } from 'protractor';
const { version: angularVersion } = require('@angular/core/package.json');

describe('Pipes', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should open correctly', () => {
    expect(element.all(by.tagName('h1')).get(0).getText()).toEqual('Pipes');
    expect(element(by.css('app-hero-birthday p')).getText()).toEqual(`The hero's birthday is Apr 15, 1988`);
  });

  it('should show 4 heroes', () => {
    expect(element.all(by.css('app-hero-list div')).count()).toEqual(4);
  });

  it('should show a familiar hero in json', () => {
    expect(element(by.cssContainingText('app-hero-list p', 'Heroes as JSON')).getText()).toContain('Bombasto');
  });

  it('should show alternate birthday formats', () => {
    expect(element(by.cssContainingText('app-root > p', `The hero's birthday is Apr 15, 1988`)).isDisplayed()).toBe(true);
    expect(element(by.cssContainingText('app-root > p', `The hero's birthday is 04/15/88`)).isDisplayed()).toBe(true);
  });

  it('should be able to toggle birthday formats', () => {
    const birthDayEle = element(by.css('app-hero-birthday2 > p'));
    if (angularVersion.indexOf('4.') === 0) { // Breaking change between v4 and v5 (https://github.com/angular/angular/commit/079d884)
      expect(birthDayEle.getText()).toEqual(`The hero's birthday is 4/15/1988`);
    } else {
      expect(birthDayEle.getText()).toEqual(`The hero's birthday is 4/15/88`);
    }
    const buttonEle = element(by.cssContainingText('app-hero-birthday2 > button', 'Toggle Format'));
    expect(buttonEle.isDisplayed()).toBe(true);
    buttonEle.click().then(() => {
      expect(birthDayEle.getText()).toEqual(`The hero's birthday is Friday, April 15, 1988`);
    });
  });

  it('should be able to chain and compose pipes', () => {
    const chainedPipeEles = element.all(by.cssContainingText('app-root p', `The chained hero's`));
    expect(chainedPipeEles.count()).toBe(3, 'should have 3 chained pipe examples');
    expect(chainedPipeEles.get(0).getText()).toContain('APR 15, 1988');
    expect(chainedPipeEles.get(1).getText()).toContain('FRIDAY, APRIL 15, 1988');
    expect(chainedPipeEles.get(2).getText()).toContain('FRIDAY, APRIL 15, 1988');
  });

  it('should be able to use ExponentialStrengthPipe pipe', () => {
    const ele = element(by.css('app-power-booster p'));
    expect(ele.getText()).toContain('Super power boost: 1024');
  });

  it('should be able to use the exponential calculator', () => {
    const eles = element.all(by.css('app-power-boost-calculator input'));
    const baseInputEle = eles.get(0);
    const factorInputEle = eles.get(1);
    const outputEle = element(by.css('app-power-boost-calculator p'));
    baseInputEle.clear().then(() => {
      baseInputEle.sendKeys('7');
      return factorInputEle.clear();
    }).then(() => {
      factorInputEle.sendKeys('3');
      expect(outputEle.getText()).toContain('343');
    });
  });


  it('should support flying heroes (pure) ', () => {
    const nameEle = element(by.css('app-flying-heroes input[type="text"]'));
    const canFlyCheckEle = element(by.css('app-flying-heroes #can-fly'));
    const mutateCheckEle = element(by.css('app-flying-heroes #mutate'));
    const resetEle = element(by.css('app-flying-heroes button'));
    const flyingHeroesEle = element.all(by.css('app-flying-heroes #flyers div'));

    expect(canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    nameEle.sendKeys('test1\n');
    expect(flyingHeroesEle.count()).toEqual(2, 'no change while mutating array');
    mutateCheckEle.click().then(() => {
      nameEle.sendKeys('test2\n');
      expect(flyingHeroesEle.count()).toEqual(4, 'not mutating; should see both adds');
      expect(flyingHeroesEle.get(2).getText()).toContain('test1');
      expect(flyingHeroesEle.get(3).getText()).toContain('test2');
      return resetEle.click();
    })
    .then(() => {
       expect(flyingHeroesEle.count()).toEqual(2, 'reset should restore original flying heroes');
    });
  });


  it('should support flying heroes (impure) ', () => {
    const nameEle = element(by.css('app-flying-heroes-impure input[type="text"]'));
    const canFlyCheckEle = element(by.css('app-flying-heroes-impure #can-fly'));
    const mutateCheckEle = element(by.css('app-flying-heroes-impure #mutate'));
    const flyingHeroesEle = element.all(by.css('app-flying-heroes-impure #flyers div'));

    expect(canFlyCheckEle.getAttribute('checked')).toEqual('true', 'should default to "can fly"');
    expect(mutateCheckEle.getAttribute('checked')).toEqual('true', 'should default to mutating array');
    expect(flyingHeroesEle.count()).toEqual(2, 'only two of the original heroes can fly');

    nameEle.sendKeys('test1\n');
    expect(flyingHeroesEle.count()).toEqual(3, 'new flying hero should show in mutating array');
  });

  it('should show an async hero message', () => {
    expect(element.all(by.tagName('app-hero-message')).get(0).getText()).toContain('hero');
  });

});
