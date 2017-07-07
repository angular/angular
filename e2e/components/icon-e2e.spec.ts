import {browser, by, element} from 'protractor';


describe('icon', () => {
  describe('font icons by ligature', () => {
    let testIcon: any;

    beforeEach(() => {
      browser.get('/icon');
      testIcon = element(by.id('test-icon'));
    });

    it('should have the correct class when used', async () => {
      const attr = await testIcon.getAttribute('class');

      expect(attr).toContain('md-24');
      expect(attr).toContain('material-icons');
    });

    it('should have the correct role when used', () => {
      expect(testIcon.getAttribute('role')).toBe('img');
    });
  });
});
