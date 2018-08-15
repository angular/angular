import { browser, element, by } from 'protractor';

describe('Event binding example', () => {

  beforeEach(() => {
    browser.get('');
  });

  const saveButton = element.all(by.css('button')).get(0);
  const onSaveButton = element.all(by.css('button')).get(1);
  const myClick = element.all(by.css('button')).get(2);
  const deleteButton = element.all(by.css('button')).get(3);
  const saveNoProp = element.all(by.css('button')).get(4);
  const saveProp = element.all(by.css('button')).get(5);


  it('should display Event Binding with Angular', () => {
    expect(element(by.css('h1')).getText()).toEqual('Event Binding');
  });

  it('should display 6 buttons', () => {
    expect(saveButton.getText()).toBe('Save');
    expect(onSaveButton.getText()).toBe('on-click Save');
    expect(myClick.getText()).toBe('click with myClick');
    expect(deleteButton.getText()).toBe('Delete');
    expect(saveNoProp.getText()).toBe('Save, no propagation');
    expect(saveProp.getText()).toBe('Save with propagation');
  });

  it('should support user input', () => {
    const input = element(by.css('input'));
    const bindingResult = element.all(by.css('h4')).get(1);
    expect(bindingResult.getText()).toEqual('Result: teapot');
    input.sendKeys('abc');
    expect(bindingResult.getText()).toEqual('Result: teapotabc');
  });

  it('should hide the item img', async () => {
    await deleteButton.click();
    browser.switchTo().alert().accept();
    expect(element.all(by.css('img')).get(0).getCssValue('display')).toEqual('none');
  });

  it('should show two alerts', async () => {
    const parentDiv = element.all(by.css('.parent-div'));
    const childDiv = element.all(by.css('div > div')).get(1);
    await parentDiv.click();
    browser.switchTo().alert().accept();
    expect(childDiv.getText()).toEqual('Click me too! (child)');
    await childDiv.click();
    expect(browser.switchTo().alert().getText()).toEqual('Click me. Event target class is child-div');
    browser.switchTo().alert().accept();
  });

  it('should show 1 alert from Save, no prop, button', async () => {
    await saveNoProp.click();
    expect(browser.switchTo().alert().getText()).toEqual('Saved. Event target is Save, no propagation');
    browser.switchTo().alert().accept();
  });

  it('should show 2 alerts from Save w/prop button', async () => {
    await saveProp.click();
    expect(browser.switchTo().alert().getText()).toEqual('Saved.');
    browser.switchTo().alert().accept();
    expect(browser.switchTo().alert().getText()).toEqual('Saved.');
    browser.switchTo().alert().accept();
  });
});
