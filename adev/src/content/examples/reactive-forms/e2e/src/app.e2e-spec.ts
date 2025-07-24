import {browser, element, by} from 'protractor';

describe('Reactive forms', () => {
  const nameEditor = element(by.css('app-name-editor'));
  const profileEditor = element(by.css('app-profile-editor'));
  const nameEditorButton = element(by.cssContainingText('app-root > nav > button', 'Name Editor'));
  const profileEditorButton = element(
    by.cssContainingText('app-root > nav > button', 'Profile Editor'),
  );

  beforeAll(() => browser.get(''));

  describe('Name Editor', () => {
    const nameInput = nameEditor.element(by.css('input'));
    const updateButton = nameEditor.element(by.buttonText('Update Name'));
    const nameText = 'John Smith';

    beforeAll(async () => {
      await nameEditorButton.click();
    });

    beforeEach(async () => {
      await nameInput.clear();
    });

    it('should update the name value when the name control is updated', async () => {
      await nameInput.sendKeys(nameText);

      const value = await nameInput.getAttribute('value');

      expect(value).toBe(nameText);
    });

    it('should update the name control when the Update Name button is clicked', async () => {
      await nameInput.sendKeys(nameText);
      const value1 = await nameInput.getAttribute('value');

      expect(value1).toBe(nameText);
      await updateButton.click();

      const value2 = await nameInput.getAttribute('value');

      expect(value2).toBe('Nancy');
    });

    it('should update the displayed control value when the name control updated', async () => {
      await nameInput.sendKeys(nameText);
      const valueElement = nameEditor.element(by.cssContainingText('p', 'Value:'));
      const nameValueElement = await valueElement.getText();
      const nameValue = nameValueElement.toString().replace('Value: ', '');

      expect(nameValue).toBe(nameText);
    });
  });

  describe('Profile Editor', () => {
    const firstNameInput = getInput('firstName');
    const streetInput = getInput('street');
    const addAliasButton = element(by.buttonText('+ Add another alias'));
    const updateButton = profileEditor.element(by.buttonText('Update Profile'));
    const profile: Record<string, string | number> = {
      firstName: 'John',
      lastName: 'Smith',
      street: '345 South Lane',
      city: 'Northtown',
      state: 'XX',
      zip: 12345,
    };

    beforeAll(async () => {
      await profileEditorButton.click();
    });

    beforeEach(async () => {
      await browser.get('');
      await profileEditorButton.click();
    });

    it('should be invalid by default', async () => {
      expect(await profileEditor.getText()).toContain('Form Status: INVALID');
    });

    it('should be valid if the First Name is filled in', async () => {
      await firstNameInput.clear();
      await firstNameInput.sendKeys('John Smith');

      expect(await profileEditor.getText()).toContain('Form Status: VALID');
    });

    it('should update the name when the button is clicked', async () => {
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
      await addAliasButton.click();

      const aliasInputs = profileEditor.all(by.cssContainingText('label', 'Alias'));

      expect(await aliasInputs.count()).toBe(2);
    });

    it('should update the displayed form value when form inputs are updated', async () => {
      const aliasText = 'Johnny';
      await Promise.all(
        Object.keys(profile).map((key) => getInput(key).sendKeys(`${profile[key]}`)),
      );

      const aliasInput = profileEditor.all(by.css('#alias-0'));
      await aliasInput.sendKeys(aliasText);
      const formValueElement = profileEditor.all(by.cssContainingText('p', 'Form Value:'));
      const formValue = await formValueElement.getText();
      const formJson = JSON.parse(formValue.toString().replace('Form Value:', ''));

      expect(profile['firstName']).toBe(formJson.firstName);
      expect(profile['lastName']).toBe(formJson.lastName);
      expect(formJson.aliases[0]).toBe(aliasText);
    });
  });

  function getInput(key: string) {
    return element(by.css(`input[formcontrolname=${key}`));
  }
});
