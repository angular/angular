import { element, by } from 'protractor';
import { AppPage } from './app.po';


describe('providers App', () => {
  let page: AppPage;
  const buttons = element.all(by.css('button'));
  const customersButton = buttons.get(0);
  const ordersButton = buttons.get(1);

  beforeEach(async () => {
    page = new AppPage();
    await page.navigateTo();
  });

  it('should display message saying app works', async () => {
    expect(await page.getTitleText()).toEqual('Lazy loading feature modules');
  });

  describe('Customers', () => {
    beforeEach(() => customersButton.click());

    it('should show customers when the button is clicked', async () => {
      const customersMessage = element(by.css('app-customers > p'));
      expect(await customersMessage.getText()).toBe('customers works!');
    });

  });

  describe('Orders', () => {
    beforeEach(() => ordersButton.click());

    it('should show orders when the button is clicked', async () => {
      const ordersMessage = element(by.css('app-orders > p'));
      expect(await ordersMessage.getText()).toBe('orders works!');
    });

  });

});
