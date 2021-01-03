import { browser, element, by } from 'protractor';

describe('Set Document Title', () => {

  beforeEach(() => browser.get(''));

  it('should set the document title', async () => {
    const elems = await element.all(by.css('ul li a'));
    const titles = [
      'Good morning!',
      'Good afternoon!',
      'Good evening!',
    ];

    for (let i = 0; i < elems.length; i++) {
      await elems[i].click();
      expect(await browser.getTitle()).toEqual(titles[i]);
    }
  });

});
