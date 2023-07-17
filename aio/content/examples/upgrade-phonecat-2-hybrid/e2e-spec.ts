import { browser, element, by } from 'protractor';

// Angular E2E Testing Guide:
// https://docs.angularjs.org/guide/e2e-testing

describe('PhoneCat Application', () => {

  it('should redirect `index.html` to `index.html#!/phones', async () => {
    await browser.get('index.html');
    await browser.sleep(1000); // Not sure why this is needed but it is. The route change works fine.
    expect(await browser.getCurrentUrl()).toMatch(/\/phones$/);
  });

  describe('View: Phone list', () => {

    beforeEach(() => browser.get('index.html#!/phones'));

    it('should filter the phone list as a user types into the search box', async () => {
      const phoneList = element.all(by.css('.phones li'));
      const query = element(by.css('input'));

      expect(await phoneList.count()).toBe(20);

      await query.sendKeys('nexus');
      expect(await phoneList.count()).toBe(1);

      await query.clear();
      await query.sendKeys('motorola');
      expect(await phoneList.count()).toBe(8);
    });

    it('should be possible to control phone order via the drop-down menu', async () => {
      const queryField = element(by.css('input'));
      const orderSelect = element(by.css('select'));
      const nameOption = orderSelect.element(by.css('option[value="name"]'));
      const phoneNameColumn = element.all(by.css('.phones .name'));

      function getNames() {
        return phoneNameColumn.map((elem) => elem.getText());
      }

      await queryField.sendKeys('tablet');   // Let's narrow the dataset to make the assertions shorter

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
      const query = element(by.css('input'));
      await query.sendKeys('nexus');

      await element.all(by.css('.phones li a')).first().click();
      await browser.sleep(1000); // Not sure why this is needed but it is. The route change works fine.
      expect(await browser.getCurrentUrl()).toMatch(/\/phones\/nexus-s$/);
    });

  });

  describe('View: Phone detail', () => {

    beforeEach(() => browser.get('index.html#!/phones/nexus-s'));

    it('should display the `nexus-s` page', async () => {
      expect(await element(by.css('h1')).getText()).toBe('Nexus S');
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
