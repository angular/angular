import { browser, element, by, ElementFinder } from 'protractor';

describe('Set Document Title', () => {

  beforeAll(() => browser.get(''));

  it('should set the document title', () => {

    let titles = [
      'Good morning!',
      'Good afternoon!',
      'Good evening!'
    ];

    element.all( by.css( 'ul li a' ) ).each(
      function iterator( elem: ElementFinder, i: number ) {

        elem.click();
        expect( browser.getTitle() ).toEqual( titles[ i ] );

      }
    );

  });

});
