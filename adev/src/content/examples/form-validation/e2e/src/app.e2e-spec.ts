import * as webdriver from 'selenium-webdriver';

// THESE TESTS ARE INCOMPLETE
describe('Form Validation Tests', () => {
  let driver: webdriver.WebDriver;

  beforeAll(async () => {
    await driver.get('');
  });

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

  const testName = 'Test Name';

  let page: {
    sectionTag: string;
    section: () => webdriver.WebElement;
    form: () => webdriver.WebElement;
    title: () => webdriver.WebElement;
    nameInput: () => webdriver.WebElement;
    roleInput: () => webdriver.WebElement;
    skillSelect: () => webdriver.WebElement;
    skillOption: () => webdriver.WebElement;
    errorMessages: () => Promise<webdriver.WebElement[]>;
    actorFormButtons: () => Promise<webdriver.WebElement[]>;
    actorSubmitted: () => webdriver.WebElement;
    roleErrors: () => webdriver.WebElement;
    crossValidationErrorMessage: () => webdriver.WebElement;
  };

  function getPage(sectionTag: string) {
    const sec = () => driver.findElement(webdriver.By.css(sectionTag));

    page = {
      sectionTag,
      section: sec,
      form: () => sec().findElement(webdriver.By.css('form')),
      title: () => sec().findElement(webdriver.By.css('h2')),
      nameInput: () => sec().findElement(webdriver.By.css('#name')),
      roleInput: () => sec().findElement(webdriver.By.css('#role')),
      skillSelect: () => sec().findElement(webdriver.By.css('#skill')),
      skillOption: () => sec().findElement(webdriver.By.css('#skill option')),
      errorMessages: () => sec().findElements(webdriver.By.css('div.alert')),
      actorFormButtons: () => sec().findElements(webdriver.By.css('button')),
      actorSubmitted: () => sec().findElement(webdriver.By.css('.submitted-message')),
      roleErrors: () => sec().findElement(webdriver.By.css('.role-errors')),
      crossValidationErrorMessage: () =>
        sec().findElement(webdriver.By.css('.cross-validation-error-message')),
    };
  }

  function tests(title: string) {
    it('should display correct title', async () => {
      expect(await page.title().getText()).toContain(title);
    });

    it('should not display submitted message before submit', async () => {
      const p = await page.actorSubmitted().findElements(webdriver.By.css('p'));
      expect(p.length).toBe(0);
    });

    it('should have form buttons', async () => {
      expect((await page.actorFormButtons()).length).toEqual(2);
    });

    it('should have error at start', async () => {
      await expectFormIsInvalid();
    });

    it('should have disabled submit button', async () => {
      expect(await (await page.actorFormButtons())[0].isEnabled()).toBe(false);
    });

    it('resetting name to valid name should clear errors', async () => {
      const ele = page.nameInput();
      expect(await ele.isDisplayed()).toBe(true, 'nameInput should exist');
      await ele.clear();
      await ele.sendKeys(testName);
      await expectFormIsValid();
    });

    it('should produce "required" error after clearing name', async () => {
      await page.nameInput().clear();
      await page.nameInput().sendKeys('x', webdriver.Key.BACK_SPACE);
      expect(await page.form().getAttribute('class')).toMatch('ng-invalid');
      expect(await (await page.errorMessages())[0].getText()).toContain('required');
    });

    it('should produce "at least 4 characters" error when name="x"', async () => {
      await page.nameInput().clear();
      await page.nameInput().sendKeys('x');
      await expectFormIsInvalid();
      expect(await (await page.errorMessages())[0].getText()).toContain('at least 4 characters');
    });

    it('resetting name to valid name again should clear errors', async () => {
      await page.nameInput().sendKeys(testName);
      await expectFormIsValid();
    });

    it('should have enabled submit button', async () => {
      const submitBtn = (await page.actorFormButtons())[0];
      expect(await submitBtn.isEnabled()).toBe(true);
    });

    it('should hide form after submit', async () => {
      await (await page.actorFormButtons())[0].click();
      const forms = await driver.findElements(webdriver.By.css(`${page.sectionTag} form`));
      expect(forms.length === 0 || !(await forms[0].isDisplayed())).toBe(true);
    });

    it('submitted form should be displayed', async () => {
      const p = await page.actorSubmitted().findElements(webdriver.By.css('p'));
      expect(p.length).toBeGreaterThan(0);
    });

    it('submitted form should have new actor name', async () => {
      expect(await page.actorSubmitted().getText()).toContain(testName);
    });

    it('clicking edit button should reveal form again', async () => {
      const newFormBtn = page.actorSubmitted().findElement(webdriver.By.css('button'));
      await newFormBtn.click();
      const p = await page.actorSubmitted().findElements(webdriver.By.css('p'));
      expect(p.length).toBe(0, 'submitted hidden again');
      expect(await page.title().isDisplayed()).toBe(true, 'can see form title');
    });
  }

  async function expectFormIsValid() {
    expect(await page.form().getAttribute('class')).toMatch('ng-valid');
  }

  async function expectFormIsInvalid() {
    expect(await page.form().getAttribute('class')).toMatch('ng-invalid');
  }

  async function triggerRoleValidation() {
    await driver.findElement(webdriver.By.css('app-root')).click();
  }

  async function waitForAlterEgoValidation() {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  function bobTests() {
    const emsg = 'Name cannot be Bob.';

    it('should produce "no bob" error after setting name to "Bobby"', async () => {
      await page.skillSelect().click();
      await page.skillOption().click();

      await page.nameInput().clear();
      await page.nameInput().sendKeys('Bobby');
      await expectFormIsInvalid();
      expect(await (await page.errorMessages())[0].getText()).toBe(emsg);
    });

    it('should be ok again with valid name', async () => {
      await page.nameInput().clear();
      await page.nameInput().sendKeys(testName);
      await expectFormIsValid();
    });
  }

  function asyncValidationTests() {
    const emsg = 'Role is already taken.';

    it(`should produce "${emsg}" error after setting role to Eric`, async () => {
      await page.roleInput().clear();
      await page.roleInput().sendKeys('Eric');

      await triggerRoleValidation();
      await waitForAlterEgoValidation();

      await expectFormIsInvalid();
      expect(await page.roleErrors().getText()).toBe(emsg);
    });

    it('should be ok again with different values', async () => {
      await page.roleInput().clear();
      await page.roleInput().sendKeys('John');

      await triggerRoleValidation();
      await waitForAlterEgoValidation();

      await expectFormIsValid();
      const roleErrors = await driver.findElements(
        webdriver.By.css(`${page.sectionTag} .role-errors`),
      );
      expect(roleErrors.length).toBe(0);
    });
  }

  function crossValidationTests() {
    const emsg = 'Name cannot match role.';

    it(`should produce "${emsg}" error after setting name and role to the same value`, async () => {
      await page.nameInput().clear();
      await page.nameInput().sendKeys('Romeo');

      await page.roleInput().clear();
      await page.roleInput().sendKeys('Romeo');

      await triggerRoleValidation();
      await waitForAlterEgoValidation();

      await expectFormIsInvalid();
      expect(await page.crossValidationErrorMessage().getText()).toBe(emsg);
    });

    it('should be ok again with different values', async () => {
      await page.nameInput().clear();
      await page.nameInput().sendKeys('Romeo');

      await page.roleInput().clear();
      await page.roleInput().sendKeys('Juliet');

      await triggerRoleValidation();
      await waitForAlterEgoValidation();

      await expectFormIsValid();
      const crossErrors = await driver.findElements(
        webdriver.By.css(`${page.sectionTag} .cross-validation-error-message`),
      );
      expect(crossErrors.length).toBe(0);
    });
  }
});
