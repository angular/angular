'use strict'; // necessary for es6 output in node 

import { browser, element, by, ElementFinder } from 'protractor';

// gulp run-e2e-tests --filter=cb-set-document-title
describe('Set Document Title', function () {

    beforeAll(function () {
        browser.get('');
    });

    it('should set the document title', function () {

      let titles = [
        'Good morning!',
        'Good afternoon!',
        'Good evening!'
      ];

      element.all( by.css( 'ul li a' ) ).each(
        function iterator( element: ElementFinder, i: number ) {

          element.click();
          expect( browser.getTitle() ).toEqual( titles[ i ] );

        }
      );

  });

});
