import {browser, element, by, protractor, ElementFinder, ElementArrayFinder} from 'protractor';

// THESE TESTS ARE INCOMPLETE
describe('Form Validation Tests', () => {
  beforeAll(() => browser.get(''));

  describe('Template-driven form', () => {
    beforeAll(() => {
      getPage('app-actor-form-template');
    });

    tests('Template-Driven Form');
    bobTests();
    asyncValidationTests();
    crossValidationTests();
  });

  describe('Reactive form', () => {
    beforeAll(() => {
      getPage('app-actor-form-reactive');
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
  section: ElementFinder;
  form: ElementFinder;
  title: ElementFinder;
  nameInput: ElementFinder;
  roleInput: ElementFinder;
  skillSelect: ElementFinder;
  skillOption: ElementFinder;
  errorMessages: ElementArrayFinder;
  actorFormButtons: ElementArrayFinder;
  actorSubmitted: ElementFinder;
  roleErrors: ElementFinder;
  crossValidationErrorMessage: ElementFinder;
};

function getPage(sectionTag: string) {
  const section = element(by.css(sectionTag));
  const buttons = section.all(by.css('button'));

  page = {
    section,
    form: section.element(by.css('form')),
    title: section.element(by.css('h2')),
    nameInput: section.element(by.css('#name')),
    roleInput: section.element(by.css('#role')),
    skillSelect: section.element(by.css('#skill')),
    skillOption: section.element(by.css('#skill option')),
    errorMessages: section.all(by.css('div.alert')),
    actorFormButtons: buttons,
    actorSubmitted: section.element(by.css('.submitted-message')),
    roleErrors: section.element(by.css('.role-errors')),
    crossValidationErrorMessage: section.element(by.css('.cross-validation-error-message')),
  };
}

function tests(title: string) {
  it('should display correct title', async () => {
    expect(await page.title.getText()).toContain(title);
  });

  it('should not display submitted message before submit', async () => {
    expect(await page.actorSubmitted.isElementPresent(by.css('p'))).toBe(false);
  });

  it('should have form buttons', async () => {
    expect(await page.actorFormButtons.count()).toEqual(2);
  });

  it('should have error at start', async () => {
    await expectFormIsInvalid();
  });

  // it('showForm', () => {
  //   page.form.getInnerHtml().then(html => console.log(html));
  // });

  it('should have disabled submit button', async () => {
    expect(await page.actorFormButtons.get(0).isEnabled()).toBe(false);
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
    // await page.roleInput.click(); // to blur ... didn't work
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
    const submitBtn = page.actorFormButtons.get(0);
    expect(await submitBtn.isEnabled()).toBe(true);
  });

  it('should hide form after submit', async () => {
    await page.actorFormButtons.get(0).click();
    expect(await page.actorFormButtons.get(0).isDisplayed()).toBe(false);
  });

  it('submitted form should be displayed', async () => {
    expect(await page.actorSubmitted.isElementPresent(by.css('p'))).toBe(true);
  });

  it('submitted form should have new actor name', async () => {
    expect(await page.actorSubmitted.getText()).toContain(testName);
  });

  it('clicking edit button should reveal form again', async () => {
    const newFormBtn = page.actorSubmitted.element(by.css('button'));
    await newFormBtn.click();
    expect(await page.actorSubmitted.isElementPresent(by.css('p'))).toBe(
      false,
      'submitted hidden again',
    );
    expect(await page.title.isDisplayed()).toBe(true, 'can see form title');
  });
}

async function expectFormIsValid() {
  expect(await page.form.getAttribute('class')).toMatch('ng-valid');
}

async function expectFormIsInvalid() {
  expect(await page.form.getAttribute('class')).toMatch('ng-invalid');
}

async function triggerRoleValidation() {
  // role has updateOn set to 'blur', click outside of the input to trigger the blur event
  await element(by.css('app-root')).click();
}

async function waitForAlterEgoValidation() {
  // role async validation will be performed in 400ms
  await browser.sleep(400);
}

function bobTests() {
  const emsg = 'Name cannot be Bob.';

  it('should produce "no bob" error after setting name to "Bobby"', async () => {
    // Re-populate select element
    await page.skillSelect.click();
    await page.skillOption.click();

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
  const emsg = 'Role is already taken.';

  it(`should produce "${emsg}" error after setting role to Eric`, async () => {
    await page.roleInput.clear();
    await page.roleInput.sendKeys('Eric');

    await triggerRoleValidation();
    await waitForAlterEgoValidation();

    await expectFormIsInvalid();
    expect(await page.roleErrors.getText()).toBe(emsg);
  });

  it('should be ok again with different values', async () => {
    await page.roleInput.clear();
    await page.roleInput.sendKeys('John');

    await triggerRoleValidation();
    await waitForAlterEgoValidation();

    await expectFormIsValid();
    expect(await page.roleErrors.isPresent()).toBe(false);
  });
}

function crossValidationTests() {
  const emsg = 'Name cannot match role.';

  it(`should produce "${emsg}" error after setting name and role to the same value`, async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys('Romeo');

    await page.roleInput.clear();
    await page.roleInput.sendKeys('Romeo');

    await triggerRoleValidation();
    await waitForAlterEgoValidation();

    await expectFormIsInvalid();
    expect(await page.crossValidationErrorMessage.getText()).toBe(emsg);
  });

  it('should be ok again with different values', async () => {
    await page.nameInput.clear();
    await page.nameInput.sendKeys('Romeo');

    await page.roleInput.clear();
    await page.roleInput.sendKeys('Juliet');

    await triggerRoleValidation();
    await waitForAlterEgoValidation();

    await expectFormIsValid();
    expect(await page.crossValidationErrorMessage.isPresent()).toBe(false);
  });
}
