import { browser, element, by } from 'protractor';

describe('Built-in Directives', () => {

  beforeAll(() => {
    browser.get('');
  });

  it('should have title Built-in Directives', () => {
    const title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Built-in Directives');
  });

  it('should change first Teapot header', async () => {
    const firstLabel = element.all(by.css('p')).get(0);
    const firstInput = element.all(by.css('input')).get(0);

    expect(firstLabel.getText()).toEqual('Current item name: Teapot');
    firstInput.sendKeys('abc');
    expect(firstLabel.getText()).toEqual('Current item name: Teapotabc');
  });


  it('should modify sentence when modified checkbox checked', () => {
    const modifiedChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(1);
    const modifiedSentence = element.all(by.css('div')).get(1);

    modifiedChkbxLabel.click();
    expect(modifiedSentence.getText()).toContain('modified');
  });

  it('should modify sentence when normal checkbox checked', () => {
    const normalChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(4);
    const normalSentence = element.all(by.css('div')).get(7);

    normalChkbxLabel.click();
    expect(normalSentence.getText()).toContain('normal weight and, extra large');
  });

  it('should toggle app-item-detail', () => {
    const toggleButton = element.all(by.css('button')).get(3);
    const toggledDiv = element.all(by.css('app-item-detail')).get(0);

    toggleButton.click();
    expect(toggledDiv.isDisplayed()).toBe(true);
  });

  it('should hide app-item-detail', () => {
    const hiddenMessage = element.all(by.css('p')).get(11);
    const hiddenDiv = element.all(by.css('app-item-detail')).get(2);

    expect(hiddenMessage.getText()).toContain('in the DOM');
    expect(hiddenDiv.isDisplayed()).toBe(true);
  });

  it('should have 10 lists each containing the string Teapot', () => {
    const listDiv = element.all(by.cssContainingText('.box', 'Teapot'));
    expect(listDiv.count()).toBe(10);
  });

  it('should switch case', () => {
    const tvRadioButton = element.all(by.css('input[type="radio"]')).get(3);
    const tvDiv = element(by.css('app-lost-item'));

    const fishbowlRadioButton = element.all(by.css('input[type="radio"]')).get(4);
    const fishbowlDiv = element(by.css('app-unknown-item'));

    tvRadioButton.click();
    expect(tvDiv.getText()).toContain('Television');
    fishbowlRadioButton.click();
    expect(fishbowlDiv.getText()).toContain('mysterious');
  });


});

