import {validateConfig} from '../src/config';

describe('config', () => {
  describe('validateConfig', () => {
    it('should not throw when no errors', () => {
      validateConfig([{path: '', redirectTo: 'b'}, {path: 'b', component: ComponentA}]);
    });

    it('should throw when redirectTo and children are used together', () => {
      expect(() => {
        validateConfig(
            [{path: 'a', redirectTo: 'b', children: [{path: 'b', component: ComponentA}]}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and children cannot be used together`);
    });

    it('should throw when component and redirectTo are used together', () => {
      expect(() => { validateConfig([{path: 'a', component: ComponentA, redirectTo: 'b'}]); })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and component cannot be used together`);
    });

    it('should throw when path is missing', () => {
      expect(() => {
        validateConfig([{component: '', redirectTo: 'b'}]);
      }).toThrowError(`Invalid route configuration: routes must have path specified`);
    });

    it('should throw when none of component and children or direct are missing', () => {
      expect(() => { validateConfig([{path: 'a'}]); })
          .toThrowError(
              `Invalid configuration of route 'a': component, redirectTo, children must be provided`);
    });

    it('should throw when path starts with a slash', () => {
      expect(() => {
        validateConfig([<any>{path: '/a', componenta: '', redirectTo: 'b'}]);
      }).toThrowError(`Invalid configuration of route '/a': path cannot start with a slash`);
    });

    it('should throw when an empty path and redirectTo are used without terminal: true', () => {
      expect(() => {
        validateConfig([<any>{path: '', redirectTo: 'a'}]);
      }).toThrowError(`Invalid configuration of route '': terminal: true is required with an empty path and redirectTo`));
    });
  });
});

class ComponentA {}
class ComponentB {}
class ComponentC {}
