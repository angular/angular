describe('checkmark', () => {

  beforeEach(angular.mock.module('core'));

  it('should convert boolean values to unicode checkmark or cross',
    inject((checkmarkFilter: (v: boolean) => string) => {
      expect(checkmarkFilter(true)).toBe('\u2713');
      expect(checkmarkFilter(false)).toBe('\u2718');
    })
  );

});
