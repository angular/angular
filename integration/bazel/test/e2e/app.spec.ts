import {browser, by, element, ExpectedConditions} from 'protractor';

describe('angular example application', () => {
  it('should display: Hello World!', (done) => {
    browser.get('');
    const div = element(by.css('div'));
    div.getText().then(t => expect(t).toEqual(`Hello world!`));
    element(by.css('input')).sendKeys('!');
    div.getText().then(t => expect(t).toEqual(`Hello world!!`));
    done();
  });
});
