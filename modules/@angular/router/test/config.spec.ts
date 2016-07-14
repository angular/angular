import {validateConfig} from '../src/config';

describe('config', () => {
  describe('validateConfig', () => {
    it('should not throw when no errors', () => {
      validateConfig([{path: 'a', redirectTo: 'b'}, {path: 'b', component: ComponentA}]);
    });

    it('should throw when Array is passed', () => {
      expect(() => {
        validateConfig([
          {path: 'a', component: ComponentA},
          [{path: 'b', component: ComponentB}, {path: 'c', component: ComponentC}]
        ]);
      }).toThrowError(`Invalid route configuration: Array cannot be specified`);
    });

    it('should throw when redirectTo and children are used together', () => {
      expect(() => {
        validateConfig(
            [{path: 'a', redirectTo: 'b', children: [{path: 'b', component: ComponentA}]}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and children cannot be used together`);
    });

    it('should throw when redirectTo and loadChildren are used together', () => {
      expect(() => { validateConfig([{path: 'a', redirectTo: 'b', loadChildren: 'value'}]); })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and loadChildren cannot be used together`);
    });

    it('should throw when children and loadChildren are used together', () => {
      expect(() => { validateConfig([{path: 'a', children: [], loadChildren: 'value'}]); })
          .toThrowError(
              `Invalid configuration of route 'a': children and loadChildren cannot be used together`);
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
              `Invalid configuration of route 'a': component, redirectTo, children, loadChildren must be provided`);
    });

    it('should throw when path starts with a slash', () => {
      expect(() => {
        validateConfig([<any>{path: '/a', redirectTo: 'b'}]);
      }).toThrowError(`Invalid route configuration of route '/a': path cannot start with a slash`);
    });

    it('should throw when emptyPath is used with redirectTo without explicitly providing matching',
       () => {
         expect(() => {
           validateConfig([<any>{path: '', redirectTo: 'b'}]);
         }).toThrowError(/Invalid route configuration of route '{path: "", redirectTo: "b"}'/);
       });
  });
});

class ComponentA {}
class ComponentB {}
class ComponentC {}
