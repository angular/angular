import {browser, by, element} from 'protractor';
import {screenshot} from '../../screenshot';

describe('icon', () => {
  describe('font icons by ligature', () => {
    let testIcon: any;

    beforeEach(() => {
      browser.get('/icon');
      testIcon = element(by.id('test-icon'));
    });

    it('should have the correct aria-label when used', () => {
      testIcon.getAttribute('aria-label').then((attr: string) => {
        expect(attr).toEqual('favorite');
      });
      screenshot();
    });

    it('should have the correct class when used', () => {
      testIcon.getAttribute('class').then((attr: string) => {
        expect(attr).toContain('md-24');
        expect(attr).toContain('material-icons');
      });
    });

    it('should have the correct role when used', () => {
      testIcon.getAttribute('role').then((attr: string) => {
        expect(attr).toEqual('img');
      });
    });
  });
});
