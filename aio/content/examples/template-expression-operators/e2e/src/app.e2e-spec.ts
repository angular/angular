import { browser, element, by } from 'protractor';

describe('Template Expression Operators', () => {

  beforeAll(() => browser.get(''));

  it('should have title Inputs and Outputs', async () => {
    const title = element.all(by.css('h1')).get(0);
    expect(await title.getText()).toEqual('Template Expression Operators');
  });

  it('should display json data', async () => {
    const jsonDate = element.all(by.css('p')).get(4);
    expect(await jsonDate.getText()).toContain('1980');
  });

  it('should display $98', async () => {
    const jsonDate = element.all(by.css('p')).get(5);
    expect(await jsonDate.getText()).toContain('$98.00');
  });

  it('should display Telephone', async () => {
    const jsonDate = element.all(by.css('p')).get(6);
    expect(await jsonDate.getText()).toContain('Telephone');
  });

});
