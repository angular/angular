import { browser, element, by, ElementArrayFinder, ElementFinder } from 'protractor';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

describe('PhoneCat Application', () => {

  beforeAll(() => {
    browser.baseUrl = `${browser.baseUrl}/app/`;

    // protractor.config.js is set to ng2 mode by default, so we must manually change it
    browser.rootEl = 'body';
  });

  it('should redirect `index.html` to `index.html#!/phones', async () => {
    await browser.get('index.html');
    expect(await browser.getLocationAbsUrl()).toBe('/phones');
  });

  describe('View: Phone list', () => {

    // Helpers
    const waitForCount = async (elems: ElementArrayFinder, count: number) => {
      // Wait for the list to stabilize, which may take a while (e.g. due to animations).
      await browser.wait(async () => await elems.count() === count, 5000);
    };

    beforeEach(() => browser.get('index.html#!/phones'));

    it('should filter the phone list as a user types into the search box', async () => {
      const phoneList = element.all(by.repeater('phone in $ctrl.phones'));
      const query = element(by.model('$ctrl.query'));

      await waitForCount(phoneList, 20);
      expect(await phoneList.count()).toBe(20);

      await query.sendKeys('nexus');
      await waitForCount(phoneList, 1);
      expect(await phoneList.count()).toBe(1);

      await query.clear();
      await query.sendKeys('motorola');
      await waitForCount(phoneList, 8);
      expect(await phoneList.count()).toBe(8);
    });

    it('should be possible to control phone order via the drop-down menu', async () => {
      const queryField = element(by.model('$ctrl.query'));
      const orderSelect = element(by.model('$ctrl.orderProp'));
      const nameOption = orderSelect.element(by.css('option[value="name"]'));
      const phoneNameColumn = element.all(by.repeater('phone in $ctrl.phones').column('phone.name'));

      function getNames() {
        return phoneNameColumn.map((elem: ElementFinder) => elem.getText());
      }

      await queryField.sendKeys('tablet');   // Let's narrow the dataset to make the assertions shorter
      await waitForCount(phoneNameColumn, 2);

      expect(await getNames()).toEqual([
        'Motorola XOOM\u2122 with Wi-Fi',
        'MOTOROLA XOOM\u2122'
      ]);

      await nameOption.click();

      expect(await getNames()).toEqual([
        'MOTOROLA XOOM\u2122',
        'Motorola XOOM\u2122 with Wi-Fi'
      ]);
    });

    it('should render phone specific links', async () => {
      const phoneList = element.all(by.repeater('phone in $ctrl.phones'));
      const query = element(by.model('$ctrl.query'));

      await query.sendKeys('nexus');
      await waitForCount(phoneList, 1);

      const nexusPhone = phoneList.first();
      const detailLink = nexusPhone.all(by.css('a')).first();

      await detailLink.click();
      expect(await browser.getLocationAbsUrl()).toBe('/phones/nexus-s');
    });

  });

  describe('View: Phone detail', () => {

    beforeEach(() => browser.get('index.html#!/phones/nexus-s'));

    it('should display the `nexus-s` page', async () => {
      expect(await element(by.binding('$ctrl.phone.name')).getText()).toBe('Nexus S');
    });

    it('should display the first phone image as the main phone image', async () => {
      const mainImage = element(by.css('img.phone.selected'));

      expect(await mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

    it('should swap the main image when clicking on a thumbnail image', async () => {
      const mainImage = element(by.css('img.phone.selected'));
      const thumbnails = element.all(by.css('.phone-thumbs img'));

      await thumbnails.get(2).click();
      expect(await mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

      await thumbnails.get(0).click();
      expect(await mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

  });

});
