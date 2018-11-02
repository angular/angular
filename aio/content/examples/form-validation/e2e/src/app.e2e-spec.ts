'use strict'; // necessary for node!

import { browser, element, by, protractor, ElementFinder, ElementArrayFinder } from 'protractor';

// THESE TESTS ARE INCOMPLETE
describe('Form Validation Tests', function () {

  beforeAll(function () {
    browser.get('');
  });

  describe('Template-driven form', () => {
    beforeAll(() => {
      getPage('app-hero-form-template');
    });

    tests('Template-Driven Form');
    bobTests();
    asyncValidationTests();
    crossValidationTests();
  });

  describe('Reactive form', () => {
    beforeAll(() => {
      getPage('app-hero-form-reactive');
    });

    tests('Reactive Form');
    bobTests();
    asyncValidationTests();
    crossValidationTests();
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
  powerOption: ElementFinder,
  errorMessages: ElementArrayFinder,
  heroFormButtons: ElementArrayFinder,
  heroSubmitted: ElementFinder,
  alterEgoErrors: ElementFinder,
  crossValidationErrorMessage: ElementFinder,
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
    powerOption: section.element(by.css('#power option')),
    errorMessages: section.all(by.css('div.alert')),
    heroFormButtons: buttons,
    heroSubmitted: section.element(by.css('.submitted-message')),
    alterEgoErrors: section.element(by.css('.alter-ego-errors')),
    crossValidationErrorMessage: section.element(by.css('.cross-validation-error-message')),
  };
}

function tests(title: string) {

  it('should display correct title', function () {
    expect(page.title.getText()).toContain(title);
  });

  it('should not display submitted message before submit', function () {
    expect(page.heroSubmitted.isElementPresent(by.css('p'))).toBe(false);
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
    expect(page.heroFormButtons.get(0).isDisplayed()).toBe(false);
  });

  it('submitted form should be displayed', function () {
    expect(page.heroSubmitted.isElementPresent(by.css('p'))).toBe(true);
  });

  it('submitted form should have new hero name', function () {
    expect(page.heroSubmitted.getText()).toContain(testName);
  });

  it('clicking edit button should reveal form again', function () {
    const newFormBtn = page.heroSubmitted.element(by.css('button'));
    newFormBtn.click();
    expect(page.heroSubmitted.isElementPresent(by.css('p')))
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

function triggerAlterEgoValidation() {
  // alterEgo has updateOn set to 'blur', click outside of the input to trigger the blur event
  element(by.css('app-root')).click()
}

function waitForAlterEgoValidation() {
  // alterEgo async validation will be performed in 400ms
  browser.sleep(400);
}

function bobTests() {
  const emsg = 'Name cannot be Bob.';

  it('should produce "no bob" error after setting name to "Bobby"', function () {
    // Re-populate select element
    page.powerSelect.click();
    page.powerOption.click();

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

function asyncValidationTests() {
  const emsg = 'Alter ego is already taken.';

  it(`should produce "${emsg}" error after setting alterEgo to Eric`, function () {
    page.alterEgoInput.clear();
    page.alterEgoInput.sendKeys('Eric');

    triggerAlterEgoValidation();
    waitForAlterEgoValidation();

    expectFormIsInvalid();
    expect(page.alterEgoErrors.getText()).toBe(emsg);
  });

  it('should be ok again with different values', function () {
    page.alterEgoInput.clear();
    page.alterEgoInput.sendKeys('John');

    triggerAlterEgoValidation();
    waitForAlterEgoValidation();

    expectFormIsValid();
    expect(page.alterEgoErrors.isPresent()).toBe(false);
  });
}

function crossValidationTests() {
  const emsg = 'Name cannot match alter ego.';

  it(`should produce "${emsg}" error after setting name and alter ego to the same value`, function () {
    page.nameInput.clear();
    page.nameInput.sendKeys('Batman');

    page.alterEgoInput.clear();
    page.alterEgoInput.sendKeys('Batman');

    triggerAlterEgoValidation();
    waitForAlterEgoValidation();

    expectFormIsInvalid();
    expect(page.crossValidationErrorMessage.getText()).toBe(emsg);
  });

  it('should be ok again with different values', function () {
    page.nameInput.clear();
    page.nameInput.sendKeys('Batman');

    page.alterEgoInput.clear();
    page.alterEgoInput.sendKeys('Superman');

    triggerAlterEgoValidation();
    waitForAlterEgoValidation();

    expectFormIsValid();
    expect(page.crossValidationErrorMessage.isPresent()).toBe(false);
  });
}
