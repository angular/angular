import { browser, element, by, ElementArrayFinder, ElementFinder } from 'protractor';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

describe('PhoneCat Application', () => {

  beforeAll(() => {
    browser.baseUrl = 'http://localhost:8080/app/';
    // protractor.config.js is set to ng2 mode by default, so we must manually change it
    browser.rootEl = 'body';
  });

  it('should redirect `index.html` to `index.html#!/phones', () => {
    browser.get('index.html');
    expect(browser.getLocationAbsUrl()).toBe('/phones');
  });

  describe('View: Phone list', () => {

    // Helpers
    const waitForCount = (elems: ElementArrayFinder, count: number) => {
      // Wait for the list to stabilize, which may take a while (e.g. due to animations).
      browser.wait(() => elems.count().then(c => c === count), 5000);
    };

    beforeEach(() => {
      browser.get('index.html#!/phones');
    });

    it('should filter the phone list as a user types into the search box', () => {
      const phoneList = element.all(by.repeater('phone in $ctrl.phones'));
      const query = element(by.model('$ctrl.query'));

      waitForCount(phoneList, 20);
      expect(phoneList.count()).toBe(20);

      query.sendKeys('nexus');
      waitForCount(phoneList, 1);
      expect(phoneList.count()).toBe(1);

      query.clear();
      query.sendKeys('motorola');
      waitForCount(phoneList, 8);
      expect(phoneList.count()).toBe(8);
    });

    it('should be possible to control phone order via the drop-down menu', () => {
      const queryField = element(by.model('$ctrl.query'));
      const orderSelect = element(by.model('$ctrl.orderProp'));
      const nameOption = orderSelect.element(by.css('option[value="name"]'));
      const phoneNameColumn = element.all(by.repeater('phone in $ctrl.phones').column('phone.name'));

      function getNames() {
        return phoneNameColumn.map((elem: ElementFinder) => elem.getText());
      }

      queryField.sendKeys('tablet');   // Let's narrow the dataset to make the assertions shorter
      waitForCount(phoneNameColumn, 2);

      expect(getNames()).toEqual([
        'Motorola XOOM\u2122 with Wi-Fi',
        'MOTOROLA XOOM\u2122'
      ]);

      nameOption.click();

      expect(getNames()).toEqual([
        'MOTOROLA XOOM\u2122',
        'Motorola XOOM\u2122 with Wi-Fi'
      ]);
    });

    it('should render phone specific links', () => {
      const phoneList = element.all(by.repeater('phone in $ctrl.phones'));
      const query = element(by.model('$ctrl.query'));

      query.sendKeys('nexus');
      waitForCount(phoneList, 1);

      const nexusPhone = phoneList.first();
      const detailLink = nexusPhone.all(by.css('a')).first();

      detailLink.click();
      expect(browser.getLocationAbsUrl()).toBe('/phones/nexus-s');
    });

  });

  describe('View: Phone detail', () => {

    beforeEach(() => {
      browser.get('index.html#!/phones/nexus-s');
    });

    it('should display the `nexus-s` page', () => {
      expect(element(by.binding('$ctrl.phone.name')).getText()).toBe('Nexus S');
    });

    it('should display the first phone image as the main phone image', () => {
      const mainImage = element(by.css('img.phone.selected'));

      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

    it('should swap the main image when clicking on a thumbnail image', () => {
      const mainImage = element(by.css('img.phone.selected'));
      const thumbnails = element.all(by.css('.phone-thumbs img'));

      thumbnails.get(2).click();
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.2.jpg/);

      thumbnails.get(0).click();
      expect(mainImage.getAttribute('src')).toMatch(/img\/phones\/nexus-s.0.jpg/);
    });

  });

});
