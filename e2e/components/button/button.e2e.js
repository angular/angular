describe('button', function () {
  describe('disabling behavior', function () {
    beforeEach(function() {
      browser.get('/button');
    });
    it('should prevent click handlers from executing when disabled', function () {
      element(by.id('testButton')).click();
      expect(element(by.id('clickCounter')).getText()).toEqual('1');

      element(by.id('disableToggle')).click();
      element(by.id('testButton')).click();
      expect(element(by.id('clickCounter')).getText()).toEqual('1');
    });
  });
});


