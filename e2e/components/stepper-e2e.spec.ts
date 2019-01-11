import {
  browser, by, element, ElementFinder, ExpectedConditions
} from 'protractor';
import {expectFocusOn, expectToExist} from '../util/asserts';
import {pressKeys} from '../util/actions';
import {Key} from 'selenium-webdriver';

describe('stepper', () => {
  beforeEach(async () => await browser.get('/stepper'));

  it('should render a stepper', async () => {
    await expectToExist('mat-horizontal-stepper');
  });

  describe('basic behavior', () => {
    it('should change steps correctly when stepper button is clicked', async () => {
      const previousButton = element.all(by.buttonText('Back'));
      const nextButton = element.all(by.buttonText('Next'));

      expect(await element(by.css('mat-step-header[aria-selected="true"]')).getText())
          .toBe('1\nFill out your name');

      await nextButton.get(0).click();

      expect(await element(by.css('mat-step-header[aria-selected="true"]')).getText())
          .toBe('2\nFill out your address');

      await browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));

      await previousButton.get(0).click();

      expect(await element(by.css('mat-step-header[aria-selected="true"]')).getText())
          .toBe('1\nFill out your name');

      await browser.wait(ExpectedConditions.not(
          ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
    });

    it('should change focus with keyboard interaction', async () => {
      const stepHeaders = element.all(by.css('mat-step-header'));
      await stepHeaders.get(0).click();

      await expectFocusOn(stepHeaders.get(0));

      await pressKeys(Key.RIGHT);
      await expectFocusOn(stepHeaders.get(1));

      await pressKeys(Key.RIGHT);
      await expectFocusOn(stepHeaders.get(2));

      await pressKeys(Key.RIGHT);
      await expectFocusOn(stepHeaders.get(0));

      await pressKeys(Key.LEFT);
      await expectFocusOn(stepHeaders.get(2));

      await pressKeys(Key.SPACE, Key.ENTER);
      await expectFocusOn(stepHeaders.get(2));
    });
  });

  describe('linear stepper', () => {
    let linearButton: ElementFinder;

    beforeEach(async () => {
      linearButton = element(by.id('toggle-linear'));
      await linearButton.click();
    });

    it('should not move to next step when stepper button is clicked', async () => {
      const nextButton = element.all(by.buttonText('Next'));
      await nextButton.get(0).click();

      expect(await element(by.css('mat-step-header[aria-selected="true"]')).getText())
          .toBe('1\nFill out your name');
    });
  });
});
