describe('checkbox', function () {
  describe('check behavior', function () {
    beforeEach(function() {
      browser.get('/checkbox');
    });
    it('should be checked when clicked, and be unchecked when clicked again', function () {
      element(by.id('test-checkbox')).click();
      element(by.css('input[id=input-test-checkbox]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeTruthy('Expect checkbox "checked" property to be true');
      });

      element(by.id('test-checkbox')).click();
      element(by.css('input[id=input-test-checkbox]')).getAttribute('checked').then((value: string) => {
        expect(value).toBeFalsy('Expect checkbox "checked" property to be false');
      });
    });
  });
});
