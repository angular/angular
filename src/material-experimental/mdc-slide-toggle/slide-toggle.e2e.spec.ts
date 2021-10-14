import {browser, element, by, Key} from 'protractor';
import {expectToExist} from '../../cdk/testing/private/e2e';

describe('MDC-based slide-toggle', () => {
  const getButton = () => element(by.css('#normal-slide-toggle button'));
  const getNormalToggle = () => element(by.css('#normal-slide-toggle'));

  beforeEach(async () => await browser.get('mdc-slide-toggle'));

  it('should render a slide-toggle', async () => {
    await expectToExist('mat-slide-toggle');
  });

  it('should change the checked state on click', async () => {
    const buttonEl = getButton();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'false',
      'Expect slide-toggle to be unchecked',
    );

    await getNormalToggle().click();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'true',
      'Expect slide-toggle to be checked',
    );
  });

  it('should change the checked state on click', async () => {
    const buttonEl = getButton();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'false',
      'Expect slide-toggle to be unchecked',
    );

    await getNormalToggle().click();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'true',
      'Expect slide-toggle to be checked',
    );
  });

  it('should not change the checked state on click when disabled', async () => {
    const buttonEl = getButton();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'false',
      'Expect slide-toggle to be unchecked',
    );

    await element(by.css('#disabled-slide-toggle')).click();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'false',
      'Expect slide-toggle to be unchecked',
    );
  });

  it('should move the thumb on state change', async () => {
    const slideToggleEl = getNormalToggle();
    const thumbEl = element(by.css('#normal-slide-toggle .mdc-switch__handle'));
    const previousPosition = await thumbEl.getLocation();

    await slideToggleEl.click();

    const position = await thumbEl.getLocation();

    expect(position.x).not.toBe(previousPosition.x);
  });

  it('should toggle the slide-toggle on space key', async () => {
    const buttonEl = getButton();

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'false',
      'Expect slide-toggle to be unchecked',
    );

    await buttonEl.sendKeys(Key.SPACE);

    expect(await buttonEl.getAttribute('aria-checked')).toBe(
      'true',
      'Expect slide-toggle to be checked',
    );
  });
});
