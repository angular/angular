import {browser, element, by, protractor} from 'protractor';

describe('slide-toggle', () => {

  beforeEach(() => browser.get('slide-toggle'));

  it('should render a slide-toggle', () => {
    expect(element(by.css('md-slide-toggle')).isPresent()).toBe(true);
  });

  it('should change the checked state on click', () => {
    let slideToggleEl = element(by.css('#normal-slide-toggle'));
    let inputEl = element(by.css('#normal-slide-toggle input'));

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    slideToggleEl.click();

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

  it('should change the checked state on click', () => {
    let slideToggleEl = element(by.css('#normal-slide-toggle'));
    let inputEl = element(by.css('#normal-slide-toggle input'));

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    slideToggleEl.click();

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

  it('should not change the checked state on click when disabled', () => {
    let slideToggleEl = element(by.css('#disabled-slide-toggle'));
    let inputEl = element(by.css('#disabled-slide-toggle input'));

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    slideToggleEl.click();

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');
  });

  it('should move the thumb on state change', () => {
    let slideToggleEl = element(by.css('#normal-slide-toggle'));
    let thumbEl = element(by.css('#normal-slide-toggle .md-slide-toggle-thumb-container'));

    let previousX = thumbEl.getLocation().then(pos => pos.x);

    slideToggleEl.click();

    let newX = thumbEl.getLocation().then(pos => pos.x);

    expect(previousX).not.toBe(newX);
  });

  it('should toggle the slide-toggle on space key', () => {
    let inputEl = element(by.css('#normal-slide-toggle input'));

    expect(inputEl.getAttribute('checked')).toBeFalsy('Expect slide-toggle to be unchecked');

    inputEl.sendKeys(protractor.Key.SPACE);

    expect(inputEl.getAttribute('checked')).toBeTruthy('Expect slide-toggle to be checked');
  });

});
