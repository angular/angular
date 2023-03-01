import { browser, element, by, logging } from 'protractor';

describe('Inputs and Outputs', () => {

  beforeEach(() => browser.get(''));

   // helper function used to test what's logged to the console
  async function logChecker(contents: string) {
    const logs = await browser
      .manage()
      .logs()
      .get(logging.Type.BROWSER);
    const messages = logs.filter(({ message }) => message.indexOf(contents) !== -1);
    expect(messages.length).toBeGreaterThan(0);
  }

  it('should have title Inputs and Outputs', async () => {
    const title = element.all(by.css('h1')).get(0);
    expect(await title.getText()).toEqual('Inputs and Outputs');
  });

  it('should add 123 to the parent list', async () => {
    const addToParentButton = element.all(by.css('button')).get(0);
    const addToListInput = element.all(by.css('input')).get(0);
    const addedItem = element.all(by.css('li')).get(4);
    await addToListInput.sendKeys('123');
    await addToParentButton.click();
    expect(await addedItem.getText()).toEqual('123');
  });

  it('should delete item', async () => {
    const deleteButton = element.all(by.css('button')).get(1);
    const contents = 'Child';
    await deleteButton.click();
    await logChecker(contents);
  });

  it('should log buy the item', async () => {
    const buyButton = element.all(by.css('button')).get(2);
    const contents = 'Child';
    await buyButton.click();
    await logChecker(contents);
  });

  it('should save item for later', async () => {
    const saveButton = element.all(by.css('button')).get(3);
    const contents = 'Child';
    await saveButton.click();
    await logChecker(contents);
  });

  it('should add item to wishlist', async () => {
    const addToParentButton = element.all(by.css('button')).get(4);
    const addedItem = element.all(by.css('li')).get(6);
    await addToParentButton.click();
    expect(await addedItem.getText()).toEqual('Television');
  });

});
