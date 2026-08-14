import * as webdriver from 'selenium-webdriver';

describe('Reactive forms', () => {
  let driver: webdriver.WebDriver;

  const getNameEditor = () => driver.findElement(webdriver.By.css('app-name-editor'));
  const getProfileEditor = () => driver.findElement(webdriver.By.css('app-profile-editor'));

  const findNavButton = async (text: string) => {
    const buttons = await driver.findElements(webdriver.By.css('app-root > nav > button'));
    for (const b of buttons) {
      if ((await b.getText()).includes(text)) {
        return b;
      }
    }
    throw new Error(`Nav button "${text}" not found`);
  };

  beforeAll(async () => {
    await driver.get('');
  });

  describe('Name Editor', () => {
    const nameText = 'John Smith';

    beforeAll(async () => {
      await (await findNavButton('Name Editor')).click();
    });

    beforeEach(async () => {
      const nameInput = await (await getNameEditor()).findElement(webdriver.By.css('input'));
      await nameInput.clear();
    });

    it('should update the name value when the name control is updated', async () => {
      const nameInput = await (await getNameEditor()).findElement(webdriver.By.css('input'));
      await nameInput.sendKeys(nameText);

      const value = await nameInput.getAttribute('value');
      expect(value).toBe(nameText);
    });

    it('should update the name control when the Update Name button is clicked', async () => {
      const nameInput = await (await getNameEditor()).findElement(webdriver.By.css('input'));
      const updateButton = await (
        await getNameEditor()
      ).findElement(webdriver.By.xpath('.//button[normalize-space()="Update Name"]'));

      await nameInput.sendKeys(nameText);
      const value1 = await nameInput.getAttribute('value');
      expect(value1).toBe(nameText);

      await updateButton.click();
      const value2 = await nameInput.getAttribute('value');
      expect(value2).toBe('Nancy');
    });

    it('should update the displayed control value when the name control updated', async () => {
      const nameInput = await (await getNameEditor()).findElement(webdriver.By.css('input'));
      await nameInput.sendKeys(nameText);

      const paragraphs = await (await getNameEditor()).findElements(webdriver.By.css('p'));
      let valueElement: webdriver.WebElement | null = null;
      for (const p of paragraphs) {
        if ((await p.getText()).includes('Value:')) {
          valueElement = p;
          break;
        }
      }
      const nameValueElement = await valueElement!.getText();
      const nameValue = nameValueElement.toString().replace('Value: ', '');

      expect(nameValue).toBe(nameText);
    });
  });

  describe('Profile Editor', () => {
    const profile: Record<string, string | number> = {
      firstName: 'John',
      lastName: 'Smith',
      street: '345 South Lane',
      city: 'Northtown',
      state: 'XX',
      zip: 12345,
    };

    beforeAll(async () => {
      await (await findNavButton('Profile Editor')).click();
    });

    beforeEach(async () => {
      await driver.get('');
      await (await findNavButton('Profile Editor')).click();
    });

    it('should be invalid by default', async () => {
      expect(await (await getProfileEditor()).getText()).toContain('Form Status: INVALID');
    });

    it('should be valid if the First Name is filled in', async () => {
      const firstNameInput = await getInput('firstName');
      await firstNameInput.clear();
      await firstNameInput.sendKeys('John Smith');

      expect(await (await getProfileEditor()).getText()).toContain('Form Status: VALID');
    });

    it('should update the name when the button is clicked', async () => {
      const firstNameInput = await getInput('firstName');
      const streetInput = await getInput('street');
      const updateButton = await (
        await getProfileEditor()
      ).findElement(webdriver.By.xpath('.//button[normalize-space()="Update Profile"]'));

      await firstNameInput.clear();
      await streetInput.clear();
      await firstNameInput.sendKeys('John');
      await streetInput.sendKeys('345 Smith Lane');
      const firstNameInitial = await firstNameInput.getAttribute('value');
      const streetNameInitial = await streetInput.getAttribute('value');

      expect(firstNameInitial).toBe('John');
      expect(streetNameInitial).toBe('345 Smith Lane');
      await updateButton.click();

      const nameValue = await firstNameInput.getAttribute('value');
      const streetValue = await streetInput.getAttribute('value');

      expect(nameValue).toBe('Nancy');
      expect(streetValue).toBe('123 Drew Street');
    });

    it('should add an alias field when the Add Alias button is clicked', async () => {
      const addAliasButton = await driver.findElement(
        webdriver.By.xpath('.//button[normalize-space()="+ Add another alias"]'),
      );
      await addAliasButton.click();

      const labels = await (await getProfileEditor()).findElements(webdriver.By.css('label'));
      const aliasLabels: webdriver.WebElement[] = [];
      for (const l of labels) {
        if ((await l.getText()).includes('Alias')) {
          aliasLabels.push(l);
        }
      }

      expect(aliasLabels.length).toBe(2);
    });

    it('should update the displayed form value when form inputs are updated', async () => {
      const aliasText = 'Johnny';
      for (const key of Object.keys(profile)) {
        await (await getInput(key)).sendKeys(`${profile[key]}`);
      }

      const aliasInput = (
        await (await getProfileEditor()).findElements(webdriver.By.css('#alias-0'))
      )[0];
      await aliasInput.sendKeys(aliasText);

      const paragraphs = await (await getProfileEditor()).findElements(webdriver.By.css('p'));
      let formValueElement: webdriver.WebElement | null = null;
      for (const p of paragraphs) {
        if ((await p.getText()).includes('Form Value:')) {
          formValueElement = p;
          break;
        }
      }
      const formValue = await formValueElement!.getText();
      const formJson = JSON.parse(formValue.toString().replace('Form Value:', ''));

      expect(profile['firstName']).toBe(formJson.firstName);
      expect(profile['lastName']).toBe(formJson.lastName);
      expect(formJson.aliases[0]).toBe(aliasText);
    });
  });

  function getInput(key: string) {
    return driver.findElement(webdriver.By.css(`input[formcontrolname=${key}]`));
  }
});
