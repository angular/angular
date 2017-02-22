'use strict'; // necessary for node!

import { browser, element, by, protractor, ElementFinder, ElementArrayFinder } from 'protractor';
import { appLang, describeIf } from '../protractor-helpers';

// THESE TESTS ARE INCOMPLETE
describeIf(appLang.appIsTs || appLang.appIsJs, 'Form Validation Tests', function () {

  beforeAll(function () {
    browser.get('');
  });

  describe('Hero Form 1', () => {
    beforeAll(() => {
      getPage('hero-form-template1');
    });

    tests();
  });

  describe('Hero Form 2', () => {
    beforeAll(() => {
      getPage('hero-form-template2');
    });

    tests();
    bobTests();
  });

  describe('Hero Form 3 (Reactive)', () => {
    beforeAll(() => {
      getPage('hero-form-reactive3');
      makeNameTooLong();
    });

    tests();
    bobTests();
  });
});

//////////

const testName = 'Test Name';

let page: {
  section: ElementFinder,
  form: ElementFinder,
  title: ElementFinder,
  nameInput: ElementFinder,
  alterEgoInput: ElementFinder,
  powerSelect: ElementFinder,
  errorMessages: ElementArrayFinder,
  heroFormButtons: ElementArrayFinder,
  heroSubmitted: ElementFinder
};

function getPage(sectionTag: string) {
  let section = element(by.css(sectionTag));
  let buttons = section.all(by.css('button'));

  page = {
    section: section,
    form: section.element(by.css('form')),
    title: section.element(by.css('h1')),
    nameInput: section.element(by.css('#name')),
    alterEgoInput: section.element(by.css('#alterEgo')),
    powerSelect: section.element(by.css('#power')),
    errorMessages: section.all(by.css('div.alert')),
    heroFormButtons: buttons,
    heroSubmitted: section.element(by.css('hero-submitted > div'))
  };
}

function tests() {
  it('should display correct title', function () {
    expect(page.title.getText()).toContain('Hero Form');
  });

  it('should not display submitted message before submit', function () {
    expect(page.heroSubmitted.isElementPresent(by.css('h2'))).toBe(false);
  });

  it('should have form buttons', function () {
    expect(page.heroFormButtons.count()).toEqual(2);
  });

  it('should have error at start', function () {
    expectFormIsInvalid();
  });

  // it('showForm', function () {
  //   page.form.getInnerHtml().then(html => console.log(html));
  // });

  it('should have disabled submit button', function () {
    expect(page.heroFormButtons.get(0).isEnabled()).toBe(false);
  });

  it('resetting name to valid name should clear errors', function () {
    const ele = page.nameInput;
    expect(ele.isPresent()).toBe(true, 'nameInput should exist');
    ele.clear();
    ele.sendKeys(testName);
    expectFormIsValid();
  });

  it('should produce "required" error after clearing name', function () {
    page.nameInput.clear();
    // page.alterEgoInput.click(); // to blur ... didn't work
    page.nameInput.sendKeys('x', protractor.Key.BACK_SPACE); // ugh!
    expect(page.form.getAttribute('class')).toMatch('ng-invalid');
    expect(page.errorMessages.get(0).getText()).toContain('required');
  });

  it('should produce "at least 4 characters" error when name="x"', function () {
    page.nameInput.clear();
    page.nameInput.sendKeys('x'); // too short
    expectFormIsInvalid();
    expect(page.errorMessages.get(0).getText()).toContain('at least 4 characters');
  });

  it('resetting name to valid name again should clear errors', function () {
    page.nameInput.sendKeys(testName);
    expectFormIsValid();
  });

  it('should have enabled submit button', function () {
    const submitBtn = page.heroFormButtons.get(0);
    expect(submitBtn.isEnabled()).toBe(true);
  });

  it('should hide form after submit', function () {
    page.heroFormButtons.get(0).click();
    expect(page.title.isDisplayed()).toBe(false);
  });

  it('submitted form should be displayed', function () {
    expect(page.heroSubmitted.isElementPresent(by.css('h2'))).toBe(true);
  });

  it('submitted form should have new hero name', function () {
    expect(page.heroSubmitted.getText()).toContain(testName);
  });

  it('clicking edit button should reveal form again', function () {
    const editBtn = page.heroSubmitted.element(by.css('button'));
    editBtn.click();
    expect(page.heroSubmitted.isElementPresent(by.css('h2')))
      .toBe(false, 'submitted hidden again');
    expect(page.title.isDisplayed()).toBe(true, 'can see form title');
  });
}

function expectFormIsValid() {
    expect(page.form.getAttribute('class')).toMatch('ng-valid');
}

function expectFormIsInvalid() {
    expect(page.form.getAttribute('class')).toMatch('ng-invalid');
}

function bobTests() {
  const emsg = 'Someone named "Bob" cannot be a hero.';

  it('should produce "no bob" error after setting name to "Bobby"', function () {
    page.nameInput.clear();
    page.nameInput.sendKeys('Bobby');
    expectFormIsInvalid();
    expect(page.errorMessages.get(0).getText()).toBe(emsg);
  });

  it('should be ok again with valid name', function () {
    page.nameInput.clear();
    page.nameInput.sendKeys(testName);
    expectFormIsValid();
  });
}

function makeNameTooLong() {
  // make the first name invalid
  page.nameInput.sendKeys('ThisHeroNameHasWayWayTooManyLetters');
}
