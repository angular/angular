import { browser, element, by, ExpectedConditions as EC, logging } from 'protractor';

describe('Getting Started', () => {
  const pageElements = {
    topBarHeader: element(by.css('app-root app-top-bar h1')),
    topBarLinks: element(by.css('app-root app-top-bar a')),
    topBarCheckoutLink: element(by.cssContainingText('app-root app-top-bar a', 'Checkout')),
    productListHeader: element(by.css('app-root app-product-list h2')),
    productListItems: element.all(by.css('app-root app-product-list h3')),
    productListLinks: element.all(by.css('app-root app-product-list a')),
    productDetailsPage: element(by.css('app-root app-product-details div')),
    cartPage: element(by.css('app-root app-cart'))
  };

  describe('General', () => {
    beforeAll(async () => {
      await browser.get('/');
    });

    it('should display "My Store"', async () => {
      const title = await pageElements.topBarHeader.getText();

      expect(title).toEqual('My Store');
    });

    it('should display "Products" on the homepage', async () => {
      const title = await pageElements.productListHeader.getText();

      expect(title).toEqual('Products');
    });
  });

  describe('Product List', () => {
    beforeAll(async () => {
      await browser.get('/');
    });

    it('should display 3 items', async () => {
      const products = await pageElements.productListItems;

      expect(products.length).toEqual(3);
    });
  });

  describe('Product Details', () => {
    beforeEach(async () => {
      await browser.get('/');
    });

    it('should display information for a product', async () => {
      await pageElements.productListLinks.get(0).click();

      const product = pageElements.productDetailsPage;
      const productHeader = await product.element(by.css('h3')).getText();
      const productPrice = await product.element(by.css('h4')).getText();
      const productDescription = await product.element(by.css('p')).getText();

      expect(await product.isDisplayed()).toBeTruthy();
      expect(productHeader).toBe('Phone XL');
      expect(productPrice).toBe('$799.00');
      expect(productDescription).toBe('A large phone with one of the best screens');
    });

    it('should add the product to the cart', async () => {
      await pageElements.productListLinks.get(0).click();

      const product = pageElements.productDetailsPage;
      const buyButton = await product.element(by.css('button'));
      const checkoutLink = pageElements.topBarCheckoutLink;

      await buyButton.click();
      await browser.wait(EC.alertIsPresent(), 1000);
      await browser.switchTo().alert().accept();
      await checkoutLink.click();

      const cartItems = await element.all(by.css('app-root app-cart div.cart-item'));
      expect(cartItems.length).toBe(1);
    });
  });

  describe('Cart', () => {

    beforeEach(async () => {
      await browser.get('/');
    });

    it('should go through the checkout process', async () => {
      await pageElements.productListLinks.get(0).click();

      const checkoutLink = pageElements.topBarCheckoutLink;
      const productDetailsPage = pageElements.productDetailsPage;
      const buyButton = await productDetailsPage.element(by.css('button'));

      const cartPage = pageElements.cartPage;
      const inputFields = cartPage.all(by.css('form input'));

      const purchaseButton = await cartPage.element(by.css('button'));
      const nameField = inputFields.get(0);
      const addressField = inputFields.get(1);

      await buyButton.click();
      await browser.wait(EC.alertIsPresent(), 1000);
      await browser.switchTo().alert().accept();
      await checkoutLink.click();

      await nameField.sendKeys('Customer');
      await addressField.sendKeys('Address');
      await purchaseButton.click();

      const logs = await browser.manage().logs().get(logging.Type.BROWSER);
      const cartMessages = logs.filter(({ message }) => message.includes('Your order has been submitted'));

      expect(cartMessages.length).toBe(1);
    });
  });
});
