'use strict'; // necessary for es6 output in node

import { ElementFinder, ExpectedConditions, browser, by, element } from 'protractor';
import { logging, promise } from 'selenium-webdriver';

/**
 * The tests here basically just checking that the end styles
 * of each animation are in effect.
 *
 * Relies on the Angular testability only becoming stable once
 * animation(s) have finished.
 *
 * Ideally we'd use https://developer.mozilla.org/en-US/docs/Web/API/Document/getAnimations
 * but they're not supported in Chrome at the moment. The upcoming nganimate polyfill
 * may also add some introspection support.
 */
describe('Animation Tests', () => {

  const INACTIVE_COLOR = 'rgba(238, 238, 238, 1)';
  const ACTIVE_COLOR = 'rgba(207, 216, 220, 1)';
  const NO_TRANSFORM_MATRIX_REGEX = /matrix\(1,\s*0,\s*0,\s*1,\s*0,\s*0\)/;

  beforeEach(() => browser.get(''));

  describe('basic states', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-basic'));
    });

    it('animates between active and inactive', () => {
      const li = host.element(by.css('li'));
      const toHaveBgColor = (expectedBgColor: string) =>
        toHaveCssValue(li, 'backgroundColor', expectedBgColor);

      addInactiveHero();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);

      li.click();
      browser.wait(toHaveBgColor(ACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.1);

      li.click();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);
    });

  });

  describe('styles inline in transitions', () => {

    let host: ElementFinder;

    beforeEach(function() {
      host = element(by.css('app-hero-list-inline-styles'));
    });

    it('are not kept after animation', () => {
      const li = host.element(by.css('li'));
      const toHaveBgColor = (expectedBgColor: string) =>
        toHaveCssValue(li, 'backgroundColor', expectedBgColor);

      addInactiveHero();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);

      li.click();
      // We can't detect the animation, since the styles are not permanent.
      // Just wait and assume it happended.
      browser.sleep(500);
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);
    });

  });

  describe('combined transition syntax', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-combined-transitions'));
    });

    it('animates between active and inactive', () => {
      const li = host.element(by.css('li'));
      const toHaveBgColor = (expectedBgColor: string) =>
        toHaveCssValue(li, 'backgroundColor', expectedBgColor);

      addInactiveHero();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);

      li.click();
      browser.wait(toHaveBgColor(ACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.1);

      li.click();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);
    });

  });

  describe('two-way transition syntax', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-twoway'));
    });

    it('animates between active and inactive', () => {
      const li = host.element(by.css('li'));
      const toHaveBgColor = (expectedBgColor: string) =>
        toHaveCssValue(li, 'backgroundColor', expectedBgColor);

      addInactiveHero();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);

      li.click();
      browser.wait(toHaveBgColor(ACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.1);

      li.click();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);
    });

  });

  describe('enter & leave', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-enter-leave'));
    });

    it('adds and removes element', () => {
      const li = host.element(by.css('li'));
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX));

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('enter & leave & states', () => {

    let host: ElementFinder;

    beforeEach(function() {
      host = element(by.css('app-hero-list-enter-leave-states'));
    });

    it('adds and removes and animates between active and inactive', () => {
      const li = host.element(by.css('li'));
      const toHaveScaleX = (expectedScaleX: number) =>
        () => getScaleX(li).then(actualScaleX => actualScaleX === expectedScaleX);
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX), 1000);

      li.click();
      browser.wait(toHaveScaleX(1.1), 1000);

      li.click();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX), 1000);

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('auto style calc', () => {

    let host: ElementFinder;

    beforeEach(function() {
      host = element(by.css('app-hero-list-auto'));
    });

    it('adds and removes element', () => {
      const li = host.element(by.css('li'));
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX));
      expect(li.getCssValue('height')).toBe('50px');

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('different timings', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-timings'));
    });

    it('adds and removes element', () => {
      const li = host.element(by.css('li'));
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX));
      expect(li.getCssValue('opacity')).toBe('1');

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('multiple keyframes', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-multistep'));
    });

    it('adds and removes element', () => {
      const li = host.element(by.css('li'));
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX));
      expect(li.getCssValue('opacity')).toBe('1');

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('parallel groups', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-groups'));
    });

    it('adds and removes element', () => {
      const li = host.element(by.css('li'));
      const toMatchTransform = (expectedTransformRe: RegExp) =>
        toMatchCssValue(li, 'transform', expectedTransformRe);

      addInactiveHero();
      browser.wait(toMatchTransform(NO_TRANSFORM_MATRIX_REGEX));
      expect(li.getCssValue('opacity')).toBe('1');

      removeHero();
      browser.wait(ExpectedConditions.stalenessOf(li), 1500);
    });

  });

  describe('adding active heroes', () => {

    let host: ElementFinder;

    beforeEach(() => {
      host = element(by.css('app-hero-list-basic'));
    });

    it('animates between active and inactive', () => {
      const li = host.element(by.css('li'));
      const toHaveBgColor = (expectedBgColor: string) =>
        toHaveCssValue(li, 'backgroundColor', expectedBgColor);

      addActiveHero();

      browser.wait(toHaveBgColor(ACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.1);

      li.click();
      browser.wait(toHaveBgColor(INACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.0);

      li.click();
      browser.wait(toHaveBgColor(ACTIVE_COLOR), 1000);
      expect(getScaleX(li)).toBe(1.1);
    });
  });

  describe('callbacks', () => {
    it('fires a callback on start and done', () => {
      const toHaveAnimationLogs = () => browser.manage().logs().get(logging.Type.BROWSER)
          .then(logs => logs.filter(log => log.message.indexOf('Animation') !== -1))
          .then(animationLogs => animationLogs.length);

      addActiveHero();
      browser.wait(toHaveAnimationLogs, 1000);
    });
  });

  function addActiveHero() {
    return element(by.buttonText('Add active hero')).click();
  }

  function addInactiveHero() {
    return element(by.buttonText('Add inactive hero')).click();
  }

  function removeHero() {
    return element(by.buttonText('Remove hero')).click();
  }

  function getScaleX(el: ElementFinder) {
    return Promise.all([getWidth(el), getOffsetWidth(el)])
        .then(([clientWidth, offsetWidth]) => clientWidth / offsetWidth);
  }

  function getWidth(el: ElementFinder) {
    return browser.executeScript(
        'return arguments[0].getBoundingClientRect().width',
        el) as PromiseLike<number>;
  }

  function getOffsetWidth(el: ElementFinder) {
    return browser.executeScript(
        'return arguments[0].offsetWidth',
        el) as PromiseLike<number>;
  }

  function toHaveCssValue(el: ElementFinder, propName: string, expectedValue: any) {
    return () => el.getCssValue(propName).then(actualValue => actualValue === expectedValue);
  }

  function toMatchCssValue(el: ElementFinder, propName: string, expectedValueRe: RegExp) {
    return () => el.getCssValue(propName).then(actualValue => expectedValueRe.test(actualValue));
  }

});
