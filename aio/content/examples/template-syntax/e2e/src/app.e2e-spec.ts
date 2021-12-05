import { browser, element, by } from 'protractor';

// TODO Not yet complete
describe('Template Syntax', () => {

  beforeAll(() => browser.get(''));

  it('should be able to use interpolation with a hero', async () => {
    const heroInterEle = element.all(by.css('h2+p')).get(0);
    expect(await heroInterEle.getText()).toEqual('My current hero is Hercules');
  });

  it('should be able to use interpolation with a calculation', async () => {
    const theSumEles = element.all(by.cssContainingText('h3~p', 'The sum of'));
    expect(await theSumEles.count()).toBe(2);
    expect(await theSumEles.get(0).getText()).toEqual('The sum of 1 + 1 is 2');
    expect(await theSumEles.get(1).getText()).toEqual('The sum of 1 + 1 is not 4');
  });

  it('should be able to use class binding syntax', async () => {
    const specialEle = element(by.cssContainingText('div', 'Special'));
    expect(await specialEle.getAttribute('class')).toMatch('special');
  });

  it('should be able to use style binding syntax', async () => {
    const specialButtonEle = element(by.cssContainingText('div.special~button', 'button'));
    expect(await specialButtonEle.getAttribute('style')).toMatch('color: red');
  });

  it('should two-way bind to sizer', async () => {
    const div = element(by.css('div#two-way-1'));
    const incButton = div.element(by.buttonText('+'));
    const input = div.element(by.css('input'));
    const initSize = await input.getAttribute('value');
    await incButton.click();
    expect(await input.getAttribute('value')).toEqual((+initSize + 1).toString());
  });

  it("should change SVG rectangle's fill color on click", async () => {
    const div = element(by.css('app-svg'));
    const colorSquare = div.element(by.css('rect'));
    const initialColor = await colorSquare.getAttribute('fill');
    await colorSquare.click();
    expect(await colorSquare.getAttribute('fill')).not.toEqual(initialColor);
  });
});
