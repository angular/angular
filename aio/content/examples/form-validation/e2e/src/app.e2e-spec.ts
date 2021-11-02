import { browser, element, by, protractor, ElementFinder, ElementArrayFinder } from 'protractor';

// THESE TESTS ARE INCOMPLETE
describe('Form Validation Tests', () => {

  beforeAll(() => browser.get(''));

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
  const section = element(by.css(sectionTag));
  const buttons = section.all(by.css('button'));

  page = {
    section,
    form: section.element(by.css('form')),
    title: section.element(by.css('h2')),
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

  it('should display correct title', async () => {
    expect(await page.title.getText()).toContain(title);
  });

  it('should not display submitted message before submit', async () => {
    expect(await page.heroSubmitted.isElementPresent(by.css('p'))).toBe(false);
  });

  it('should have form buttons', async () => {
    expect(await page.heroFormButtons.count()).toEqual(2);
  });

  it('should have error at start', async () => {
    await expectFormIsInvalid();
  });

  // it('showForm', () => {
  //   page.form.getInnerHtml().then(html => console.log(html));
  // });

  it('should have disabled submit button', async () => {
    expect(await page.heroFormButtons.get(0).isEnabled()).toBe(false);
  });

  it('resetting name to valid name should clear errors', async () => {
    const ele = page.nameInput;
    expect(await ele.isPresent()).toBe(true, 'nameInput should exist');
    await ele.clear();
    await ele.sendKeys(testName);
    await expectFormIsValid();
  });

  it('should produce "required" error after clearing name', async () => {
    await page.nameInput.clear();
    // await page.alterEgoInput.click(); // to blur ... didn't work
    await page.nameInput.sendKeys('x', protractor.Key.BACK_SPACE); // ugh!
    expect(await page.form.getAttribute('class')).toMatch('ng-invalid');
    expect(await page.errorMessages.get(0).getText()).toContain('required');
  });

  it('should produce "at least 4 characters" error when name="x"', async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys('x'); // too short
    await expectFormIsInvalid();
    expect(await page.errorMessages.get(0).getText()).toContain('at least 4 characters');
  });

  it('resetting name to valid name again should clear errors', async () => {
    await page.nameInput.sendKeys(testName);
    await expectFormIsValid();
  });

  it('should have enabled submit button', async () => {
    const submitBtn = page.heroFormButtons.get(0);
    expect(await submitBtn.isEnabled()).toBe(true);
  });

  it('should hide form after submit', async () => {
    await page.heroFormButtons.get(0).click();
    expect(await page.heroFormButtons.get(0).isDisplayed()).toBe(false);
  });

  it('submitted form should be displayed', async () => {
    expect(await page.heroSubmitted.isElementPresent(by.css('p'))).toBe(true);
  });

  it('submitted form should have new hero name', async () => {
    expect(await page.heroSubmitted.getText()).toContain(testName);
  });

  it('clicking edit button should reveal form again', async () => {
    const newFormBtn = page.heroSubmitted.element(by.css('button'));
    await newFormBtn.click();
    expect(await page.heroSubmitted.isElementPresent(by.css('p')))
      .toBe(false, 'submitted hidden again');
    expect(await page.title.isDisplayed()).toBe(true, 'can see form title');
  });
}

async function expectFormIsValid() {
  expect(await page.form.getAttribute('class')).toMatch('ng-valid');
}

async function expectFormIsInvalid() {
  expect(await page.form.getAttribute('class')).toMatch('ng-invalid');
}

async function triggerAlterEgoValidation() {
  // alterEgo has updateOn set to 'blur', click outside of the input to trigger the blur event
  await element(by.css('app-root')).click();
}

async function waitForAlterEgoValidation() {
  // alterEgo async validation will be performed in 400ms
  await browser.sleep(400);
}

function bobTests() {
  const emsg = 'Name cannot be Bob.';

  it('should produce "no bob" error after setting name to "Bobby"', async () => {
    // Re-populate select element
    await page.powerSelect.click();
    await page.powerOption.click();

    await page.nameInput.clear();
    await page.nameInput.sendKeys('Bobby');
    await expectFormIsInvalid();
    expect(await page.errorMessages.get(0).getText()).toBe(emsg);
  });

  it('should be ok again with valid name', async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys(testName);
    await expectFormIsValid();
  });
}

function asyncValidationTests() {
  const emsg = 'Alter ego is already taken.';

  it(`should produce "${emsg}" error after setting alterEgo to Eric`, async () => {
    await page.alterEgoInput.clear();
    await page.alterEgoInput.sendKeys('Eric');

    await triggerAlterEgoValidation();
    await waitForAlterEgoValidation();

    await expectFormIsInvalid();
    expect(await page.alterEgoErrors.getText()).toBe(emsg);
  });

  it('should be ok again with different values', async () => {
    await page.alterEgoInput.clear();
    await page.alterEgoInput.sendKeys('John');

    await triggerAlterEgoValidation();
    await waitForAlterEgoValidation();

    await expectFormIsValid();
    expect(await page.alterEgoErrors.isPresent()).toBe(false);
  });
}

function crossValidationTests() {
  const emsg = 'Name cannot match alter ego.';

  it(`should produce "${emsg}" error after setting name and alter ego to the same value`, async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys('Batman');

    await page.alterEgoInput.clear();
    await page.alterEgoInput.sendKeys('Batman');

    await triggerAlterEgoValidation();
    await waitForAlterEgoValidation();

    await expectFormIsInvalid();
    expect(await page.crossValidationErrorMessage.getText()).toBe(emsg);
  });

  it('should be ok again with different values', async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys('Batman');

    await page.alterEgoInput.clear();
    await page.alterEgoInput.sendKeys('Superman');

    await triggerAlterEgoValidation();
    await waitForAlterEgoValidation();

    await expectFormIsValid();
    expect(await page.crossValidationErrorMessage.isPresent()).toBe(false);
  });
}
