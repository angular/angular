'use strict';

import { browser, element, by } from 'protractor';

describe('Built-in Directives', function () {

  beforeAll(function () {
    browser.get('');
  });

  it('should have title Built-in Directives', function () {
    let title = element.all(by.css('h1')).get(0);
    expect(title.getText()).toEqual('Built-in Directives');
  });

  it('should change first Teapot header', async () => {
    let firstLabel = element.all(by.css('p')).get(0);
    let firstInput = element.all(by.css('input')).get(0);

    expect(firstLabel.getText()).toEqual('Current item name: Teapot');
    firstInput.sendKeys('abc');
    expect(firstLabel.getText()).toEqual('Current item name: Teapotabc');
  });


  it('should modify sentence when modified checkbox checked', function () {
    let modifiedChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(1);
    let modifiedSentence = element.all(by.css('div')).get(1);

    modifiedChkbxLabel.click();
    expect(modifiedSentence.getText()).toContain('modified');
  });

  it('should modify sentence when normal checkbox checked', function () {
    let normalChkbxLabel = element.all(by.css('input[type="checkbox"]')).get(4);
    let normalSentence = element.all(by.css('div')).get(7);

    normalChkbxLabel.click();
    expect(normalSentence.getText()).toContain('normal weight and, extra large');
  });

  it('should toggle app-item-detail', function () {
    let toggleButton = element.all(by.css('button')).get(3);
    let toggledDiv = element.all(by.css('app-item-detail')).get(0);

    toggleButton.click();
    expect(toggledDiv.isDisplayed()).toBe(true);
  });

  it('should hide app-item-detail', function () {
    let hiddenMessage = element.all(by.css('p')).get(11);
    let hiddenDiv = element.all(by.css('app-item-detail')).get(2);

    expect(hiddenMessage.getText()).toContain('in the DOM');
    expect(hiddenDiv.isDisplayed()).toBe(true);
  });

  it('should have 10 lists each containing the string Teapot', function () {
    let listDiv = element.all(by.cssContainingText('.box', 'Teapot'));
    expect(listDiv.count()).toBe(10);
  });

  it('should switch case', function () {
    let tvRadioButton = element.all(by.css('input[type="radio"]')).get(3);
    let tvDiv = element(by.css('app-lost-item'));

    let fishbowlRadioButton = element.all(by.css('input[type="radio"]')).get(4);
    let fishbowlDiv = element(by.css('app-unknown-item'));

    tvRadioButton.click();
    expect(tvDiv.getText()).toContain('Television');
    fishbowlRadioButton.click();
    expect(fishbowlDiv.getText()).toContain('mysterious');
  });


});

