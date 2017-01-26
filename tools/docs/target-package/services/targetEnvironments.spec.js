var testPackage = require('../../helpers/test-package');
var Dgeni = require('dgeni');

describe('target inline-tag-def', function() {
  var dgeni, injector, te;

  beforeEach(function() {
    dgeni = new Dgeni([testPackage('target-package', true)]);
    injector = dgeni.configureInjector();
    te = injector.get('targetEnvironments');
  });

  describe('addAllowed', function() {
    it('should store the target and whether it is active', function() {
      te.addAllowed('a', true);
      te.addAllowed('b', false);
      te.addAllowed('c');
      expect(te.isActive('a')).toBe(true);
      expect(te.isActive('b')).toBe(false);
      expect(te.isActive('c')).toBe(false);
    });
  });

  describe('removeAllowed', function() {
    it('should disallow the target', function() {
      te.addAllowed('a');
      te.addAllowed('b');
      te.removeAllowed('b');
      expect(te.isActive('a')).toBe(false);
      expect(function() {
        te.isActive('b');
      }).toThrowError('Error accessing target "b". It is not in the list of allowed targets: a');
    });
  });

  describe('activate', function() {
    it('should active an already allowed target', function() {
      te.addAllowed('a', true);
      te.addAllowed('b', false);
      te.addAllowed('c');

      te.activate('a');
      te.activate('b');
      te.activate('c');
      expect(te.isActive('a')).toBe(true);
      expect(te.isActive('b')).toBe(true);
      expect(te.isActive('c')).toBe(true);
    });
  });

  describe('deactivate', function() {
    it('should deactive an already allowed target', function() {
      te.addAllowed('a', true);
      te.addAllowed('b', false);
      te.addAllowed('c');

      te.deactivate('a');
      te.deactivate('b');
      te.deactivate('c');
      expect(te.isActive('a')).toBe(false);
      expect(te.isActive('b')).toBe(false);
      expect(te.isActive('c')).toBe(false);
    });
  });

  describe('isActive', function() {
    it('should return true if the item is allowed and active', function() {
      te.addAllowed('a', true);
      te.addAllowed('b', false);

      expect(te.isActive('a')).toBe(true);
      expect(te.isActive('b')).toBe(false);
    });
  });

  describe('hasActive', function() {
    it('should return true if there are any active targets', function() {
      te.addAllowed('a', true);
      te.addAllowed('b', false);
      expect(te.hasActive()).toBe(true);

      te.deactivate('a');
      expect(te.hasActive()).toBe(false);

      te.activate('b');
      expect(te.hasActive()).toBe(true);
    });
  });

  describe('someActive', function() {
    it('should return true if the array of targets passed are all allowed and at least on is active',
       function() {
         te.addAllowed('a', true);
         te.addAllowed('b', false);
         te.addAllowed('c');

         expect(te.someActive(['a'])).toBe(true);
         expect(te.someActive(['b'])).toBe(false);
         expect(te.someActive(['a', 'b'])).toBe(true);
         expect(te.someActive(['b', 'c'])).toBe(false);
         expect(te.someActive([])).toBe(false);

         expect(function() { te.someActive('d'); })
             .toThrowError(
                 'Error accessing target "d". It is not in the list of allowed targets: a,b,c');
       });
  });
});
