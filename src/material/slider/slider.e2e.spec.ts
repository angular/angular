/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {clickElementAtPoint, getElement, Point} from '../../cdk/testing/private/e2e';
import {Thumb} from '@material/slider';
import {$, browser, by, element, ElementFinder} from 'protractor';
import {logging} from 'selenium-webdriver';

describe('MatSlider', () => {
  const getStandardSlider = () => element(by.id('standard-slider'));
  const getDisabledSlider = () => element(by.id('disabled-slider'));
  const getRangeSlider = () => element(by.id('range-slider'));

  beforeEach(async () => await browser.get('/slider'));

  describe('standard slider', async () => {
    let slider: ElementFinder;
    beforeEach(() => {
      slider = getStandardSlider();
    });

    it('should update the value on click', async () => {
      await setValueByClick(slider, 15);
      expect(await getSliderValue(slider, Thumb.END)).toBe(15);
    });

    it('should update the value on slide', async () => {
      await slideToValue(slider, 35, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).toBe(35);
    });

    it('should display the value indicator when focused', async () => {
      await focusSliderThumb(slider, Thumb.END);
      const rect: DOMRect = await browser.executeScript(
        'return arguments[0].getBoundingClientRect();',
        $('.mdc-slider__value-indicator'),
      );

      expect(rect.width).not.toBe(0);
      expect(rect.height).not.toBe(0);

      await browser.actions().mouseUp().perform();
    });

    it('should not cause passive event listener errors when changing the value', async () => {
      // retrieving the logs clears the collection
      await browser.manage().logs().get('browser');
      await setValueByClick(slider, 15);

      expect(await browser.manage().logs().get('browser')).not.toContain(
        jasmine.objectContaining({level: logging.Level.SEVERE}),
      );
    });
  });

  describe('disabled slider', async () => {
    let slider: ElementFinder;
    beforeEach(() => {
      slider = getDisabledSlider();
    });

    it('should not update the value on click', async () => {
      await setValueByClick(slider, 15);
      expect(await getSliderValue(slider, Thumb.END)).not.toBe(15);
    });

    it('should not update the value on slide', async () => {
      await slideToValue(slider, 35, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).not.toBe(35);
    });
  });

  describe('range slider', async () => {
    let slider: ElementFinder;
    beforeEach(() => {
      slider = getRangeSlider();
    });

    it('should update the start thumb value on slide', async () => {
      await slideToValue(slider, 35, Thumb.START);
      expect(await getSliderValue(slider, Thumb.START)).toBe(35);
    });

    it('should update the end thumb value on slide', async () => {
      await slideToValue(slider, 55, Thumb.END);
      expect(await getSliderValue(slider, Thumb.END)).toBe(55);
    });

    it(
      'should update the start thumb value on click between thumbs ' +
        'but closer to the start thumb',
      async () => {
        await setValueByClick(slider, 49);
        expect(await getSliderValue(slider, Thumb.START)).toBe(49);
        expect(await getSliderValue(slider, Thumb.END)).toBe(100);
      },
    );

    it(
      'should update the end thumb value on click between thumbs ' + 'but closer to the end thumb',
      async () => {
        await setValueByClick(slider, 51);
        expect(await getSliderValue(slider, Thumb.START)).toBe(0);
        expect(await getSliderValue(slider, Thumb.END)).toBe(51);
      },
    );
  });
});

/** Returns the current value of the slider. */
async function getSliderValue(slider: ElementFinder, thumbPosition: Thumb): Promise<number> {
  const inputs = await slider.all(by.css('.mdc-slider__input'));
  return thumbPosition === Thumb.END
    ? Number(await inputs[inputs.length - 1].getAttribute('value'))
    : Number(await inputs[0].getAttribute('value'));
}

/** Focuses on the MatSlider at the coordinates corresponding to the given thumb. */
async function focusSliderThumb(slider: ElementFinder, thumbPosition: Thumb): Promise<void> {
  const webElement = await getElement(slider).getWebElement();
  const coords = await getCoordsForValue(slider, await getSliderValue(slider, thumbPosition));
  return await browser.actions().mouseMove(webElement, coords).mouseDown().perform();
}

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
async function setValueByClick(slider: ElementFinder, value: number): Promise<void> {
  return clickElementAtPoint(slider, await getCoordsForValue(slider, value));
}

/** Clicks on the MatSlider at the coordinates corresponding to the given value. */
async function slideToValue(
  slider: ElementFinder,
  value: number,
  thumbPosition: Thumb,
): Promise<void> {
  const webElement = await getElement(slider).getWebElement();
  const startCoords = await getCoordsForValue(slider, await getSliderValue(slider, thumbPosition));
  const endCoords = await getCoordsForValue(slider, value);
  return await browser
    .actions()
    .mouseMove(webElement, startCoords)
    .mouseDown()
    .mouseMove(webElement, endCoords)
    .mouseUp()
    .perform();
}

/** Returns the x and y coordinates for the given slider value. */
async function getCoordsForValue(slider: ElementFinder, value: number): Promise<Point> {
  const inputs = await slider.all(by.css('.mdc-slider__input'));

  const min = Number(await inputs[0].getAttribute('min'));
  const max = Number(await inputs[inputs.length - 1].getAttribute('max'));
  const percent = (value - min) / (max - min);

  const {width, height} = await slider.getSize();

  // NOTE: We use Math.round here because protractor silently breaks if you pass in an imprecise
  // floating point number with lots of decimals. This allows us to avoid the headache but it may
  // cause some innaccuracies in places where these decimals mean the difference between values.

  const x = Math.round(width * percent);
  const y = Math.round(height / 2);

  return {x, y};
}
