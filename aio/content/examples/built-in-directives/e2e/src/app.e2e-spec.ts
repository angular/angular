import { browser, element, by } from 'protractor';

describe('Built-in Directives', () => {

  beforeAll(() => browser.get(''));

  it('should have title Built-in Directives', async () => {
    const title = element.all(by.css('h1')).get(0);
    expect(await title.getText()).toEqual('Built-in Directives');
  });

  it('should change first Teapot header', async () => {
    const firstLabel = element.all(by.css('p')).get(0);
    const firstInput = element.all(by.css('input')).get(0);

    expect(await firstLabel.getText()).toEqual('Current item name: Teapot');
    await firstInput.sendKeys('abc');
    expect(await firstLabel.getText()).toEqual('Current item name: Teapotabc');
  });


  it('should modify sentence when modified checkbox checked', async () => {
    const modifiedChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(1);
    const modifiedSentence = element.all(by.css('div')).get(1);

    await modifiedChkbxLabel.click();
    expect(await modifiedSentence.getText()).toContain('modified');
  });

  it('should modify sentence when normal checkbox checked', async () => {
    const normalChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(4);
    const normalSentence = element.all(by.css('div')).get(7);

    await normalChkbxLabel.click();
    expect(await normalSentence.getText()).toContain('normal weight and, extra large');
  });

  it('should toggle app-item-detail', async () => {
    const toggleButton = element.all(by.css('button')).get(3);
    const toggledDiv = element.all(by.css('app-item-detail')).get(0);

    await toggleButton.click();
    expect(await toggledDiv.isDisplayed()).toBe(true);
  });

  it('should hide app-item-detail', async () => {
    const hiddenMessage = element.all(by.css('p')).get(10);
    const hiddenDiv = element.all(by.css('app-item-detail')).get(2);

    expect(await hiddenMessage.getText()).toContain('in the DOM');
    expect(await hiddenDiv.isDisplayed()).toBe(true);
  });

  it('should have 10 lists each containing the string Teapot', async () => {
    const listDiv = element.all(by.cssContainingText('.box', 'Teapot'));
    expect(await listDiv.count()).toBe(10);
  });

  it('should switch case', async () => {
    const tvRadioButton = element.all(by.css('input[type="radio"]')).get(3);
    const tvDiv = element(by.css('app-lost-item'));

    const fishbowlRadioButton = element.all(by.css('input[type="radio"]')).get(4);
    const fishbowlDiv = element(by.css('app-unknown-item'));

    await tvRadioButton.click();
    expect(await tvDiv.getText()).toContain('Television');
    await fishbowlRadioButton.click();
    expect(await fishbowlDiv.getText()).toContain('mysterious');
  });

});

