import { browser, element, by } from 'protractor';

describe('NgModule-example', () => {

  // helpers
  const lightgray = 'rgba(239, 238, 237, 1)';
  const white = 'rgba(0, 0, 0, 0)';

  function getCommonsSectionStruct() {
    const buttons = element.all(by.css('nav a'));

    return {
      title: element.all(by.tagName('h1')).get(0),
      subtitle: element.all(by.css('app-root p i')).get(0),
      contactButton: buttons.get(0),
      itemButton: buttons.get(1),
      customersButton: buttons.get(2)
    };
  }

  function getContactSectionStruct() {
    const buttons = element.all(by.css('app-contact form button'));

    return {
      header: element.all(by.css('app-contact h2')).get(0),
      popupMessage: element.all(by.css('app-contact div')).get(0),
      contactNameHeader: element.all(by.css('app-contact form h3')).get(0),
      input: element.all(by.css('app-contact form input')).get(0),
      validationError: element.all(by.css('app-contact form .alert')).get(0),
      saveButton: buttons.get(0), // can't be tested
      nextContactButton: buttons.get(1),
      newContactButton: buttons.get(2)
    };
  }

  function getItemSectionStruct() {
    return {
      title: element.all(by.css('ng-component h3')).get(0),
      items: element.all(by.css('ng-component a')),
      itemId: element.all(by.css('ng-component div')).get(0),
      listLink: element.all(by.css('ng-component a')).get(0),
    };
  }

  function getCustomersSectionStruct() {
    return {
      header: element.all(by.css('ng-component h2')).get(0),
      title: element.all(by.css('ng-component h3')).get(0),
      items: element.all(by.css('ng-component a')),
      itemId: element.all(by.css('ng-component ng-component div div')).get(0),
      itemInput: element.all(by.css('ng-component ng-component input')).get(0),
      listLink: element.all(by.css('ng-component ng-component a')).get(0),
    };
  }

  // tests
  function appTitleTests(color: string, name?: string) {
    return () => {
      it('should have a gray header', async () => {
        const commons = getCommonsSectionStruct();
        expect(await commons.title.getCssValue('backgroundColor')).toBe(color);
      });

      it('should welcome us', async () => {
        const commons = getCommonsSectionStruct();
        expect(await commons.subtitle.getText()).toBe(`Welcome, ${name || 'Miss Marple'}`);
      });
    };
  }

  function contactTests(color: string, name?: string) {
    return () => {
      it('shows the contact\'s owner', async () => {
        const contacts = getContactSectionStruct();
        expect(await contacts.header.getText()).toBe(`${name || 'Miss Marple'}'s Contacts`);
      });

      it('can cycle between contacts', async () => {
        const contacts = getContactSectionStruct();
        const nextButton = contacts.nextContactButton;
        expect(await contacts.contactNameHeader.getText()).toBe('Awesome Yasha');
        expect(await contacts.contactNameHeader.getCssValue('backgroundColor')).toBe(color);

        await nextButton.click();
        expect(await contacts.contactNameHeader.getText()).toBe('Awesome Iulia');

        await nextButton.click();
        expect(await contacts.contactNameHeader.getText()).toBe('Awesome Karina');
      });

      it('can create a new contact', async () => {
        const contacts = getContactSectionStruct();
        const newContactButton = contacts.newContactButton;
        const nextButton = contacts.nextContactButton;
        const input = contacts.input;
        const saveButton = contacts.saveButton;

        await newContactButton.click();
        await input.click();
        await nextButton.click();
        expect(await contacts.validationError.getText()).toBe('Name is required.');

        await input.click();
        await contacts.input.sendKeys('Watson');
        await saveButton.click();
        expect(await contacts.contactNameHeader.getText()).toBe('Awesome Watson');
      });
    };
  }

  describe('index.html', () => {
    beforeEach(() => browser.get(''));

    describe('app-title', appTitleTests(white, 'Miss Marple'));

    describe('contact', contactTests(lightgray, 'Miss Marple'));

    describe('item center', () => {
      beforeEach(() => getCommonsSectionStruct().itemButton.click());

      it('shows a list of items', async () => {
        const item = getItemSectionStruct();
        expect(await item.title.getText()).toBe('Items List');
        expect(await item.items.count()).toBe(4);
        expect(await item.items.get(0).getText()).toBe('1 - Sticky notes');
      });

      it('can navigate to one item details', async () => {
        const item = getItemSectionStruct();

        await item.items.get(0).click();
        expect(await item.itemId.getText()).toBe('Item id: 1');

        await item.listLink.click();
        // We are back to the list
        expect(await item.items.count()).toBe(4);
      });
    });

    describe('customers', () => {
      beforeEach(() => getCommonsSectionStruct().customersButton.click());

      it('shows a list of customers', async () => {
        const customers = getCustomersSectionStruct();
        expect(await customers.header.getText()).toBe('Customers of Miss Marple times 2');
        expect(await customers.title.getText()).toBe('Customer List');
        expect(await customers.items.count()).toBe(6);
        expect(await customers.items.get(0).getText()).toBe('11 - Julian');
      });

      it('can navigate and edit one customer details', async () => {
        const customers = getCustomersSectionStruct();

        await customers.items.get(0).click();
        expect(await customers.itemId.getText()).toBe('Id: 11');

        await customers.itemInput.sendKeys(' try');
        await customers.listLink.click();
        // We are back to the list
        expect(await customers.items.count()).toBe(6);
        expect(await customers.items.get(0).getText()).toBe('11 - Julian try');
      });
    });
  });

});
