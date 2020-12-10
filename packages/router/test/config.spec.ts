/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PRIMARY_OUTLET} from '../src/shared';
import {validateConfig} from '../src/utils/config';

describe('config', () => {
  describe('validateConfig', () => {
    it('should not throw when no errors', () => {
      expect(
          () => validateConfig([{path: 'a', redirectTo: 'b'}, {path: 'b', component: ComponentA}]))
          .not.toThrow();
    });

    it('should not throw when a matcher is provided', () => {
      expect(() => validateConfig([{matcher: <any>'someFunc', component: ComponentA}]))
          .not.toThrow();
    });

    it('should throw for undefined route', () => {
      expect(() => {
        validateConfig(
            [{path: 'a', component: ComponentA}, , {path: 'b', component: ComponentB}] as any);
      }).toThrowError(/Invalid configuration of route ''/);
    });

    it('should throw for undefined route in children', () => {
      expect(() => {
        validateConfig([{
                         path: 'a',
                         children: [
                           {path: 'b', component: ComponentB},
                           ,
                         ]
                       }] as any);
      }).toThrowError(/Invalid configuration of route 'a'/);
    });

    it('should throw when Array is passed', () => {
      expect(() => {
        validateConfig([
          {path: 'a', component: ComponentA},
          [{path: 'b', component: ComponentB}, {path: 'c', component: ComponentC}] as any
        ]);
      }).toThrowError(`Invalid configuration of route '': Array cannot be specified`);
    });

    it('should throw when redirectTo and children are used together', () => {
      expect(() => {
        validateConfig(
            [{path: 'a', redirectTo: 'b', children: [{path: 'b', component: ComponentA}]}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and children cannot be used together`);
    });

    it('should validate children and report full path', () => {
      expect(() => validateConfig([{path: 'a', children: [{path: 'b'}]}]))
          .toThrowError(
              `Invalid configuration of route 'a/b'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    });

    it('should properly report deeply nested path', () => {
      expect(
          () => validateConfig([
            {path: 'a', children: [{path: 'b', children: [{path: 'c', children: [{path: 'd'}]}]}]}
          ]))
          .toThrowError(
              `Invalid configuration of route 'a/b/c/d'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    });

    it('should throw when redirectTo and loadChildren are used together', () => {
      expect(() => {
        validateConfig([{path: 'a', redirectTo: 'b', loadChildren: 'value'}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and loadChildren cannot be used together`);
    });

    it('should throw when children and loadChildren are used together', () => {
      expect(() => {
        validateConfig([{path: 'a', children: [], loadChildren: 'value'}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': children and loadChildren cannot be used together`);
    });

    it('should throw when component and redirectTo are used together', () => {
      expect(() => {
        validateConfig([{path: 'a', component: ComponentA, redirectTo: 'b'}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and component cannot be used together`);
    });

    it('should throw when component and redirectTo are used together', () => {
      expect(() => {
        validateConfig([{path: 'a', redirectTo: 'b', canActivate: []}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': redirectTo and canActivate cannot be used together. ` +
              `Redirects happen before activation so canActivate will never be executed.`);
    });

    it('should throw when path and matcher are used together', () => {
      expect(() => {
        validateConfig([{path: 'a', matcher: <any>'someFunc', children: []}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a': path and matcher cannot be used together`);
    });

    it('should throw when path and matcher are missing', () => {
      expect(() => {
        validateConfig([{component: null, redirectTo: 'b'}] as any);
      })
          .toThrowError(
              `Invalid configuration of route '': routes must have either a path or a matcher specified`);
    });

    it('should throw when none of component and children or direct are missing', () => {
      expect(() => {
        validateConfig([{path: 'a'}]);
      })
          .toThrowError(
              `Invalid configuration of route 'a'. One of the following must be provided: component, redirectTo, children or loadChildren`);
    });

    it('should throw when path starts with a slash', () => {
      expect(() => {
        validateConfig([<any>{path: '/a', redirectTo: 'b'}]);
      }).toThrowError(`Invalid configuration of route '/a': path cannot start with a slash`);
    });

    it('should throw when emptyPath is used with redirectTo without explicitly providing matching',
       () => {
         expect(() => {
           validateConfig([<any>{path: '', redirectTo: 'b'}]);
         }).toThrowError(/Invalid configuration of route '{path: "", redirectTo: "b"}'/);
       });

    it('should throw when pathMatch is invalid', () => {
      expect(() => {
        validateConfig([{path: 'a', pathMatch: 'invalid', component: ComponentB}]);
      })
          .toThrowError(
              /Invalid configuration of route 'a': pathMatch can only be set to 'prefix' or 'full'/);
    });

    it('should throw when path/outlet combination is invalid', () => {
      expect(() => {
        validateConfig([{path: 'a', outlet: 'aux'}]);
      })
          .toThrowError(
              /Invalid configuration of route 'a': a componentless route without children or loadChildren cannot have a named outlet set/);
      expect(() => validateConfig([{path: 'a', outlet: '', children: []}])).not.toThrow();
      expect(() => validateConfig([{path: 'a', outlet: PRIMARY_OUTLET, children: []}]))
          .not.toThrow();
    });

    it('should not throw when path/outlet combination is valid', () => {
      expect(() => {
        validateConfig([{path: 'a', outlet: 'aux', children: []}]);
      }).not.toThrow();
      expect(() => {
        validateConfig([{path: 'a', outlet: 'aux', loadChildren: 'child'}]);
      }).not.toThrow();
    });
  });
});

class ComponentA {}
class ComponentB {}
class ComponentC {}
