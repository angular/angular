import { browser, element, by } from 'protractor';

/* tslint:disable:quotemark */
describe('Dynamic Form', () => {

    beforeAll(() => browser.get(''));

    it('should submit form', async () => {
      const firstNameElement = element.all(by.css('input[id=firstName]')).get(0);
      expect(await firstNameElement.getAttribute('value')).toEqual('Bombasto');

      const emailElement = element.all(by.css('input[id=emailAddress]')).get(0);
      const email = 'test@test.com';
      await emailElement.sendKeys(email);
      expect(await emailElement.getAttribute('value')).toEqual(email);

      await element(by.css('select option[value="solid"]')).click();
      await element.all(by.css('button')).get(0).click();
      expect(await element(by.cssContainingText('strong', 'Saved the following values')).isPresent()).toBe(true);
  });

});
