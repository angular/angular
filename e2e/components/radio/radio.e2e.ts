import {browser, by, element} from 'protractor';

describe('radio', () => {
  describe('disabling behavior', () => {
    beforeEach(() => browser.get('/radio'));

    it('should be checked when clicked', () => {
      element(by.id('water')).click();
      element(by.id('water')).getAttribute('class').then((value: string) => {
        expect(value).toContain('md-radio-checked');
      });
      element(by.css('input[id=water-input]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy();
      });
      element(by.css('input[id=leaf-input]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy();
      });

      element(by.id('leaf')).click();
      element(by.id('leaf')).getAttribute('class').then((value: string) => {
        expect(value).toContain('md-radio-checked');
      });
      element(by.css('input[id=leaf-input]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy();
      });
      element(by.css('input[id=water-input]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy();
      });
    });

    it('should be disabled when disable the radio group', () => {
      element(by.id('toggle-disable')).click();
      element(by.id('water')).click();
      element(by.id('water')).getAttribute('class').then((value: string) => {
        expect(value).toContain('md-radio-disabled');
      });
        element(by.css('input[id=water-input]')).getAttribute('disabled').then((value: string) => {
        expect(value).toBeTruthy();
      });

      element(by.id('leaf')).click();
      element(by.id('leaf')).getAttribute('class').then((value: string) => {
        expect(value).toContain('md-radio-disabled');
      });
      element(by.css('input[id=leaf-input]')).getAttribute('disabled').then((value: string) => {
        expect(value).toBeTruthy();
      });
    });
  });
});
