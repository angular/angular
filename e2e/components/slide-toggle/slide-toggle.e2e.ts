import {browser, element, by, Key} from 'protractor';
import {expectToExist} from '../../util/asserts';

describe('slide-toggle', () => {
  const getInput = () => element(by.css('#normal-slide-toggle input'));
  const getNormalToggle = () => element(by.css('#normal-slide-toggle'));

  beforeEach(() => browser.get('slide-toggle'));

  it('should render a slide-toggle', () => {
    expectToExist('md-slide-toggle');
  });

  it('should change the checked state on click', () => {
    let inputEl = getInput();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    getNormalToggle().click();

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

  it('should change the checked state on click', () => {
    let inputEl = getInput();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    getNormalToggle().click();

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

  it('should not change the checked state on click when disabled', () => {
    let inputEl = getInput();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    element(by.css('#disabled-slide-toggle')).click();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');
  });

  it('should move the thumb on state change', () => {
    let slideToggleEl = getNormalToggle();
    let thumbEl = element(by.css('#normal-slide-toggle .md-slide-toggle-thumb-container'));

    let previousX = thumbEl.getLocation().then(pos => pos.x);

    slideToggleEl.click();

    let newX = thumbEl.getLocation().then(pos => pos.x);

    expect(previousX).not.toBe(newX);
  });

  it('should toggle the slide-toggle on space key', () => {
    let inputEl = getInput();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    inputEl.sendKeys(Key.SPACE);

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

});
