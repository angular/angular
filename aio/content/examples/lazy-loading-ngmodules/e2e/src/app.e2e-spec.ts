import { AppPage } from './app.po';
import { browser, element, by } from 'protractor';


describe('providers App', () => {
  let page: AppPage;
  const buttons = element.all(by.css('button'));
  const customersButton = buttons.get(0);
  const ordersButton = buttons.get(1);
  const homeButton = buttons.get(2);

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Lazy loading feature modules');
  });

  describe('Customers', () => {
    beforeEach(() => {
      customersButton.click();
    });

    it('should show customers when the button is clicked', () => {
        const customersMessage = element(by.css('app-customers > p'));
        expect(customersMessage.getText()).toBe('customers works!');
    });

  });

  describe('Orders', () => {
    beforeEach(() => {
      ordersButton.click();
    });

    it('should show orders when the button is clicked', () => {
        const ordersMessage = element(by.css('app-orders > p'));
        expect(ordersMessage.getText()).toBe('orders works!');
    });

  });

});


